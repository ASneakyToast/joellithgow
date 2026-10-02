"""
The gateway-document migration (report / apply / verify) around one real ``all_time``
sync, against an in-process CMS holding the shape prod has: raw payloads, stray
drafts, a stray ``draft`` key, a day that must split, and Spotify months before the floor.

Run with: uv run --with pytest --with pytest-asyncio --with respx python -m pytest tests/
"""

from __future__ import annotations

import argparse
import json
from typing import Any

import pytest
import pytest_asyncio
from starlette_cms.tables import CMSDocument
from starlette_cms_gateways.base import SyncRange

from cms import migrate_gateway_docs as mig
from cms.gateways.inaturalist_field_trips import INaturalistFieldTripsGateway
from cms.gateways.spotify_liked_dump import SpotifyLikedDumpGateway, curate_track
from gateway_fakes import FAR, PARK, PARK_NEAR, FakeSpotify, liked, raw_obs

URL = "http://testserver"
LEGACY_HASH = "0123456789abcdef"  # what the old whole-body gateway would have stored
SEP = liked("s1", "2026-09-02T10:00:00Z")


def ns(command: str, **kw: Any) -> argparse.Namespace:
    base = {
        "command": command, "cms_url": URL, "api_key": None, "allow_prod": False,
        "delete_pre_floor": False, "snapshot_confirmed": False, "snapshot_out": None,
        "snapshot": None, "skip_sync_preview": False, "skip_sync_check": False,
    }
    return argparse.Namespace(**{**base, **kw})


async def inject_stray_key(doc_id: str) -> None:
    """The API cannot write a key the model lacks, so go under it, as prod's data shows."""
    row = (await CMSDocument.select().where(CMSDocument.id == doc_id).run())[0]
    body = json.loads(row["body"]) if isinstance(row["body"], str) else row["body"]
    body["draft"] = True
    await CMSDocument.update({CMSDocument.body: json.dumps(body)}).where(CMSDocument.id == doc_id).run()


async def legacy_outing(client, day: str, obs: list[dict[str, Any]], *, title: str | None = None) -> dict:
    place = obs[0]["place_guess"]
    doc = await client.create_document(
        doc_type="inaturalist_outing",
        slug=f"nature-outing-{day}",
        import_ref=f"inaturalist:outing:{day}",
        meta={"content_hash": LEGACY_HASH, "title": place},
        body={
            "title": title or place,
            "publish_date": day,
            "outing_date": day,
            "place_guess": place,
            "observation_count": float(len(obs)),
            "species_list": ["American Robin"],
            "observations": obs,  # iNaturalist's raw payload, as prod holds it
            "photo_urls": [],
            "tags": ["birds"],
        },
    )
    await client.publish_document(doc["id"])
    await inject_stray_key(doc["id"])
    return doc


async def legacy_month(client, month: str, songs: list[dict]) -> dict:
    doc = await client.create_document(
        doc_type="spotify_liked_dump",
        slug=f"spotify-dump-{month}",
        import_ref=f"spotify:dump:{month}",
        meta={"content_hash": LEGACY_HASH},
        body={"title": f"Month {month}", "publish_date": f"{month}-01",
              "song_count": float(len(songs)), "songs": songs, "tags": ["music"]},
    )
    await client.publish_document(doc["id"])
    return doc


@pytest.fixture
def source_obs():
    split = [
        raw_obs(1, "2026-05-03", *PARK, time="09:00"),
        raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:30"),
        raw_obs(3, "2026-05-03", *FAR, time="15:00", place="Greenwood Cemetery"),
    ]
    single = [raw_obs(4, "2026-05-10", *PARK)]
    humans = [raw_obs(5, "2026-05-17", *PARK)]
    return split, single, humans


@pytest_asyncio.fixture
async def legacy(env, source_obs):
    """Prod-shaped state. Returns the doc ids."""
    client, store, transport = env
    split, single, humans = source_obs
    a = await legacy_outing(client, "2026-05-03", split)
    b = await legacy_outing(client, "2026-05-10", single, title="My own title for B")
    c = await legacy_outing(client, "2026-05-17", humans)

    # B: a draft only the gateway could have made (it touches owned fields only).
    await client.update_document(b["id"], body={"species_list": ["American Robin", "Noise"], "observation_count": 9.0})
    # C: a draft that changes a human field, i.e. possibly Joel's real work.
    await client.update_document(c["id"], body={"title": "Edited by Joel, not yet published"})

    sp = await legacy_month(client, "2026-09", [curate_track(SEP)[1]])
    await client.update_document(sp["id"], body={"song_count": 2.0})  # gateway-only draft
    old1 = await legacy_month(client, "2024-12", [])
    old2 = await legacy_month(client, "2019-03", [])
    return {"a": a["id"], "b": b["id"], "c": c["id"], "sp": sp["id"], "old": [old1["id"], old2["id"]]}


def gateways(client, store, api_db) -> dict[str, Any]:
    return {
        "inaturalist-field-trips": INaturalistFieldTripsGateway(cms_client=client, job_store=store),
        "spotify-liked-dump": SpotifyLikedDumpGateway(
            cms_client=client, job_store=store, spotify_client=FakeSpotify([SEP])
        ),
    }


async def all_time(client, store, key: str = "both") -> dict[str, Any]:
    out = {}
    for name, gw in gateways(client, store, None).items():
        out[name] = await gw.sync(SyncRange("all_time"))
    return out


async def docs(client, doc_type):
    page = await client.list_documents(doc_type=doc_type, limit=100)
    return {d["import_ref"]: d for d in page["documents"]}


@pytest.mark.asyncio
async def test_report_writes_nothing_and_shows_all_four_sections(env, api, legacy, source_obs, tmp_path, capsys):
    client, store, transport = env
    api.db = [*source_obs[0], *source_obs[1], *source_obs[2]]
    transport.calls.clear()
    snap = tmp_path / "before.json"

    code = await mig.run(ns("report", snapshot_out=str(snap)), client=client,
                         gateways=gateways(client, store, api.db))

    assert code == 0
    assert transport.writes() == [], "a report, including the sync preview, writes nothing"
    out = capsys.readouterr().out
    # 1. drafts, told apart, with the fields that differ
    assert "2 gateway-only (apply discards these), 1 a person's (left alone)" in out
    assert "gateway  inaturalist_outing inaturalist:outing:2026-05-10: differs in ['observation_count', 'species_list']" in out
    assert "HUMAN    inaturalist_outing inaturalist:outing:2026-05-17: differs in ['title']" in out
    assert "gateway  spotify_liked_dump spotify:dump:2026-09: differs in ['song_count']" in out
    # 2. the pre-floor months
    assert "spotify:dump:2024-12" in out and "spotify:dump:2019-03" in out
    assert "2 doc(s)" in out
    # 3. what an all_time sync would create and update
    assert "CREATE  inaturalist:outing:2026-05-03:2" in out
    assert "UPDATE  inaturalist:outing:2026-05-03" in out
    assert "UPDATE  inaturalist:outing:2026-05-10" in out, "the gateway draft is assumed discarded"
    assert "DEFER   inaturalist:outing:2026-05-17" in out
    assert "UPDATE  spotify:dump:2026-09" in out
    # the snapshot verify compares against
    snapped = json.loads(snap.read_text())
    assert snapped["inaturalist:outing:2026-05-03"]["slug"] == "nature-outing-2026-05-03"


@pytest.mark.asyncio
async def test_apply_discards_gateway_drafts_only_and_never_deletes_without_a_snapshot(env, legacy, capsys):
    client, _, transport = env
    transport.calls.clear()

    refused = await mig.run(ns("apply", delete_pre_floor=True), client=client)
    assert refused == 2 and transport.writes() == []
    assert "--snapshot-confirmed" in capsys.readouterr().err

    code = await mig.run(ns("apply"), client=client)

    outings = await docs(client, "inaturalist_outing")
    b = outings["inaturalist:outing:2026-05-10"]
    assert not b["has_draft"] and b["body"]["observation_count"] == 1, "the gateway's draft was discarded"
    c = outings["inaturalist:outing:2026-05-17"]
    assert c["has_draft"], "a person's draft is left for a person"
    assert not (await docs(client, "spotify_liked_dump"))["spotify:dump:2026-09"]["has_draft"]
    assert len(await docs(client, "spotify_liked_dump")) == 3, "nothing deleted without --delete-pre-floor"
    assert code == 1, "a person's draft is still waiting"


@pytest.mark.asyncio
async def test_the_whole_migration_ends_clean_and_a_second_all_time_sync_writes_nothing(
    env, api, legacy, source_obs, tmp_path, capsys
):
    client, store, transport = env
    split, single, humans = source_obs
    api.db = [*split, *single, *humans]
    snap = tmp_path / "before.json"
    gws = lambda: gateways(client, store, None)  # noqa: E731
    await mig.run(ns("report", snapshot_out=str(snap), skip_sync_preview=True), client=client)

    # Step 2 + 3: discard the gateway drafts, delete the pre-floor months.
    await mig.run(ns("apply", delete_pre_floor=True, snapshot_confirmed=True), client=client)
    assert set(await docs(client, "spotify_liked_dump")) == {"spotify:dump:2026-09"}

    # Step 4: one all_time sync per gateway.
    first = await all_time(client, store)
    inat = first["inaturalist-field-trips"]
    assert inat.created == 1 and inat.updated == 2, "the split-off outing, then A and B rewritten"
    assert inat.deferred == ["inaturalist:outing:2026-05-17"], "the doc a person holds a draft on"
    assert first["spotify-liked-dump"].updated == 1

    outings = await docs(client, "inaturalist_outing")
    a = outings["inaturalist:outing:2026-05-03"]
    assert a["id"] == legacy["a"] and a["slug"] == "nature-outing-2026-05-03", "URL and doc kept"
    assert [o["id"] for o in a["body"]["observations"]] == [1, 2]
    assert "comments" not in a["body"]["observations"][0] and "quality_grade" not in a["body"]["observations"][0]
    assert "draft" not in a["body"], "the stray key goes with the rewrite"
    split2 = outings["inaturalist:outing:2026-05-03:2"]
    assert split2["slug"] == "nature-outing-2026-05-03-2" and split2["published"]
    assert split2["body"]["publish_date"] == "2026-05-03" == split2["body"]["outing_date"]
    b = outings["inaturalist:outing:2026-05-10"]
    assert b["body"]["title"] == "My own title for B" and b["body"]["observation_count"] == 1

    # Verify before the person resolves their draft: it is the one thing left.
    capsys.readouterr()
    code = await mig.run(ns("verify", snapshot=str(snap), skip_sync_check=True), client=client)
    out = capsys.readouterr().out
    assert code == 1 and "pending draft" in out and "2026-05-17" in out
    assert "2026-05-03 split into 2 outings" in out and "Greenwood Cemetery" in out

    # The person publishes their draft; the next all_time sync catches the doc up. Their
    # draft's changeset was kept (a person's work was in it); publishing the doc does not
    # close it, so verify flags it and a second apply cleans it up.
    c = outings["inaturalist:outing:2026-05-17"]
    await client.publish_document(c["id"])
    again = await all_time(client, store)
    assert again["inaturalist-field-trips"].updated == 1
    capsys.readouterr()
    assert await mig.run(ns("verify", snapshot=str(snap), skip_sync_check=True), client=client) == 1
    assert "is left over" in capsys.readouterr().out
    assert await mig.run(ns("apply"), client=client) == 0, "nothing of a person's is waiting now"

    # Step 5: verify is clean, slugs and publish_dates are unchanged, and a re-run writes nothing.
    capsys.readouterr()
    code = await mig.run(ns("verify", snapshot=str(snap)), client=client, gateways=gws())
    assert code == 0, capsys.readouterr().out
    transport.calls.clear()
    third = await all_time(client, store)
    assert all((r.created, r.updated) == (0, 0) for r in third.values())
    assert transport.writes() == []


@pytest.mark.asyncio
async def test_verify_flags_what_the_migration_should_have_removed(env, api, legacy, capsys):
    client, store, _ = env

    code = await mig.run(ns("verify", skip_sync_check=True), client=client)

    out = capsys.readouterr().out
    assert code == 1
    assert "stray 'draft' key" in out
    assert "still holds a raw iNaturalist payload" in out
    assert "pending draft" in out
    assert "2 Spotify month(s) before 2025-01 remain" in out


@pytest.mark.asyncio
async def test_apply_to_prod_needs_an_explicit_flag(env, capsys):
    client, _, transport = env
    transport.calls.clear()

    code = await mig.run(
        ns("apply", cms_url="https://cms.joellithgow.com"), client=client
    )

    assert code == 2 and transport.calls == []
    assert "--allow-prod" in capsys.readouterr().err


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "doc_type, slug, body",
    [
        ("inaturalist_outing", "o", {"title": "t", "publish_date": "2026-05-03", "outing_date": "2026-05-03"}),
        ("spotify_liked_dump", "s", {"title": "t", "publish_date": "2026-09-01"}),
    ],
)
async def test_a_patch_on_the_real_models_drops_an_unknown_body_key(env, doc_type, slug, body):
    """The migration relies on this: a key the model lacks (the stray ``draft``) cannot survive a PATCH."""
    client, _, _ = env
    doc = await client.create_document(doc_type=doc_type, slug=slug, body=body)
    await client.publish_document(doc["id"])
    await inject_stray_key(doc["id"])
    assert (await client.find_by_import_ref(doc_type, "none")) is None  # sanity: lookup works
    row = (await client.list_documents(doc_type=doc_type))["documents"][0]
    assert row["body"]["draft"] is True, "set up: the live body holds the stray key"

    await client.update_document(doc["id"], body={"draft": True, "title": "t2"})  # PATCH the key in again too
    draft = await client.get_draft_body(doc["id"])
    assert "draft" not in draft and draft["title"] == "t2"
    await client.publish_document(doc["id"])

    live = (await client.list_documents(doc_type=doc_type))["documents"][0]
    assert "draft" not in live["body"]


@pytest.mark.asyncio
async def test_a_gateway_without_credentials_does_not_stop_the_other_being_previewed(env, api, source_obs):
    client, store, transport = env
    api.db = list(source_obs[0])

    class NeedsCredentials(SpotifyLikedDumpGateway):
        def __init__(self, **kw):
            raise KeyError("SPOTIPY_CLIENT_ID")

    previews = await mig.preview_sync(
        client,
        {"inaturalist-field-trips": INaturalistFieldTripsGateway(cms_client=client),
         "spotify-liked-dump": NeedsCredentials},
    )

    assert [p.gateway for p in previews] == ["inaturalist-field-trips", "spotify-liked-dump"]
    assert len(previews[0].created) == 2 and not previews[0].errors
    assert "SPOTIPY_CLIENT_ID" in previews[1].errors[0][1]


async def make_changeset(client, title: str, doc_ids: list[str], status: str | None = None) -> str:
    http = client._get_http()
    cs = (await http.post(f"{URL}/api/changesets", json={"title": title})).json()["id"]
    for doc_id in doc_ids:
        assert (await http.post(f"{URL}/api/changesets/{cs}/documents/{doc_id}")).status_code in (200, 201)
    if status:
        assert (await http.patch(f"{URL}/api/changesets/{cs}", json={"status": status})).status_code == 200
    return cs


async def changesets(client) -> dict[str, list[str]]:
    http = client._get_http()
    out = {}
    for status in ("open", "review"):
        resp = await http.get(f"{URL}/api/changesets", params={"status": status, "include_documents": "true"})
        for cs in resp.json()["changesets"]:
            out[cs["title"]] = [d["id"] for d in cs["documents"]]
    return out


@pytest.mark.asyncio
async def test_apply_cleans_the_stale_changesets_and_never_touches_a_document(env, legacy, capsys):
    client, _, _ = env
    blog = await client.create_document(
        doc_type="blog_post", slug="hello",
        body={"title": "Hello", "description": "d", "publish_date": "2026-09-01", "post_type": "article"},
    )
    await client.publish_document(blog["id"])
    # Clear what the fixture's own edits opened, so each case below is exactly one changeset.
    for cs in (await client._get_http().get(f"{URL}/api/changesets")).json()["changesets"]:
        await client._get_http().delete(f"{URL}/api/changesets/{cs['id']}")

    await make_changeset(client, "inaturalist_field_trips sync — Sep 6", [legacy["a"], legacy["b"]])
    await make_changeset(client, "Sep 7", [legacy["sp"], blog["id"]])
    await make_changeset(client, "Sep 8", [legacy["c"]])  # C holds a person's draft
    await make_changeset(client, "spotify_liked_dump sync — Sep 9", [])
    await make_changeset(client, "My own plan", [])
    await make_changeset(client, "Ready for review", [legacy["a"]], status="review")
    docs_before = {r: (d["body"], d["published"]) for r, d in {**await docs(client, "inaturalist_outing"), **await docs(client, "spotify_liked_dump")}.items()}

    # The report says what apply will do.
    await mig.run(ns("report", skip_sync_preview=True), client=client)
    out = capsys.readouterr().out
    assert "2 to delete, 1 to trim, 1 to leave alone" in out
    assert "'Sep 8'" in out and "KEEP" in out

    await mig.run(ns("apply"), client=client)

    left = await changesets(client)
    assert "inaturalist_field_trips sync — Sep 6" not in left, "held only gateway docs: deleted"
    assert "spotify_liked_dump sync — Sep 9" not in left, "empty and named for a gateway run: deleted"
    assert left["Sep 7"] == [blog["id"]], "mixed: only the gateway doc was removed from it"
    assert left["Sep 8"] == [legacy["c"]], "a person's draft is in it: left exactly as it was"
    assert left["My own plan"] == [], "an empty changeset that is not a gateway's is not touched"
    assert left["Ready for review"] == [legacy["a"]], "review changesets are deliberate: untouched"
    after = {r: (d["body"], d["published"]) for r, d in {**await docs(client, "inaturalist_outing"), **await docs(client, "spotify_liked_dump")}.items()}
    # No document was edited, published, unpublished or deleted: the live bodies are as they were.
    assert after == docs_before

    # Applying again is a no-op.
    capsys.readouterr()
    await mig.run(ns("apply"), client=client)
    assert "changesets: deleted 0, trimmed 0" in capsys.readouterr().out
