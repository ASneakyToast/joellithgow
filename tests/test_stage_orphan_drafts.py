"""
Moving drafts that sit in no changeset into the default one, against a real in-process
CMS holding the shape prod has: drafts made before the default existed.

Run with: uv run --with pytest --with pytest-asyncio --with respx python -m pytest tests/
"""

from __future__ import annotations

import argparse
import os
import tempfile

import httpx
import pytest
import pytest_asyncio
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette_cms import CMS

from cms import stage_orphan_drafts as stage
from cms.schema import register_documents


pytestmark = pytest.mark.asyncio


def pm(text: str) -> dict:
    return {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": text}]}]}


def post(slug: str, title: str | None = None) -> dict:
    return {
        "doc_type": "blog_post",
        "slug": slug,
        "body": {
            "title": title or slug,
            "description": "d",
            "publish_date": "2026-10-01",
            "post_type": "article",
            "body_markdown": pm("body"),
        },
    }


@pytest_asyncio.fixture
async def http():
    """A CMS whose default changeset is off while the old drafts are made, as in prod then."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        cms = CMS(database_url=f"sqlite:///{db_path}", auth="none")
        register_documents(cms)
        cms.default_changeset = None
        app = Starlette(routes=[Mount("/", app=cms.app)])
        async with cms.lifespan_context(None):
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                client.cms = cms  # type: ignore[attr-defined]
                yield client
    finally:
        os.unlink(db_path)


def args(**kw) -> argparse.Namespace:
    base = {"cms_url": "http://testserver", "api_key": "k", "types": ["blog_post"],
            "title": "Staging", "apply": False}
    return argparse.Namespace(**{**base, **kw})


async def make(http: httpx.AsyncClient, slug: str, *, publish: bool = False, edit: bool = False) -> str:
    doc_id = (await http.post("/api/documents", json=post(slug))).json()["id"]
    if publish:
        assert (await http.post(f"/api/documents/{doc_id}/publish")).status_code == 200
    if edit:
        assert (await http.patch(f"/api/documents/{doc_id}", json={"body": {"title": "edited"}})).status_code == 200
    return doc_id


async def staged(http: httpx.AsyncClient) -> dict[str, set[str]]:
    sets = (await http.get("/api/changesets?include_documents=true")).json()["changesets"]
    return {c["title"]: {d["id"] for d in c["documents"]} for c in sets}


async def test_it_finds_new_drafts_and_unpublished_edits_but_not_live_posts(http):
    new = await make(http, "new-draft")
    edited = await make(http, "edited-live", publish=True)
    # the edit above put it in a date-titled changeset; take it out to leave it an orphan
    for cs in (await http.get("/api/changesets")).json()["changesets"]:
        await http.delete(f"/api/changesets/{cs['id']}")
    await http.patch(f"/api/documents/{edited}", json={"body": {"title": "edited"}})
    for cs in (await http.get("/api/changesets")).json()["changesets"]:
        await http.delete(f"/api/changesets/{cs['id']}")
    await make(http, "plain-live", publish=True)

    orphans = await stage.find_orphans(http, ["blog_post"])

    assert {(o.slug, o.why) for o in orphans} == {
        ("new-draft", "new draft"),
        ("edited-live", "unpublished edits"),
    }
    assert new in {o.id for o in orphans}


async def test_it_ignores_a_draft_an_open_changeset_already_holds(http):
    held = await make(http, "held")
    cs = (await http.post("/api/changesets", json={"title": "Big rewrite"})).json()["id"]
    await http.post(f"/api/changesets/{cs}/documents/{held}")
    await make(http, "loose")

    orphans = await stage.find_orphans(http, ["blog_post"])

    assert [o.slug for o in orphans] == ["loose"]


async def test_a_published_changeset_does_not_hold_a_draft(http):
    doc = await make(http, "was-staged-then-edited", publish=True)
    cs = (await http.post("/api/changesets", json={"title": "old"})).json()["id"]
    await http.post(f"/api/changesets/{cs}/documents/{doc}")
    await http.post(f"/api/changesets/{cs}/publish")
    await http.patch(f"/api/documents/{doc}", json={"body": {"title": "again"}})
    for c in (await http.get("/api/changesets?status=open")).json()["changesets"]:
        await http.delete(f"/api/changesets/{c['id']}")

    orphans = await stage.find_orphans(http, ["blog_post"])

    assert [o.slug for o in orphans] == ["was-staged-then-edited"]


async def test_report_writes_nothing(http, capsys):
    await make(http, "loose")

    assert await stage.run(args(apply=False), http=http) == 0

    assert await staged(http) == {}
    assert "Pass --apply" in capsys.readouterr().out


async def test_apply_moves_the_orphans_into_a_new_staging_changeset(http):
    a = await make(http, "a")
    b = await make(http, "b")

    assert await stage.run(args(apply=True), http=http) == 0

    assert await staged(http) == {"Staging": {a, b}}


async def test_apply_joins_the_open_default_instead_of_making_a_second(http):
    existing = await make(http, "already-in-staging")
    http.cms.default_changeset = "Staging"
    await http.patch(f"/api/documents/{existing}", json={"body": {"title": "x"}})  # lands in Staging
    http.cms.default_changeset = None
    loose = await make(http, "loose")  # made before the default existed
    http.cms.default_changeset = "Staging"  # on, as it is in prod when this runs

    await stage.run(args(apply=True), http=http)

    sets = (await http.get("/api/changesets?include_documents=true")).json()["changesets"]
    assert [c["title"] for c in sets] == ["Staging"]  # joined, not duplicated
    assert {d["id"] for d in sets[0]["documents"]} == {existing, loose}


async def test_a_second_run_finds_nothing(http, capsys):
    await make(http, "loose")
    await stage.run(args(apply=True), http=http)
    capsys.readouterr()

    await stage.run(args(apply=True), http=http)

    assert "Nothing to do" in capsys.readouterr().out
    assert len((await http.get("/api/changesets")).json()["changesets"]) == 1


async def test_only_the_asked_for_types_are_staged(http):
    await make(http, "a-post")
    await http.post("/api/documents", json={
        "doc_type": "definition", "slug": "a-term",
        "body": {"term": "t", "definition": "d", "publish_date": "2026-10-01"},
    })

    await stage.run(args(apply=True), http=http)

    (members,) = (await staged(http)).values()
    docs = (await http.get("/api/documents?type=definition")).json()["documents"]
    assert docs[0]["id"] not in members
    assert len(members) == 1
