"""
The gateway-document migration, against a real in-process CMS holding the shape
prod has: raw payloads, stray drafts, a stray ``draft`` key, a split day.

Run with: uv run --with pytest --with pytest-asyncio --with respx python -m pytest tests/
"""

from __future__ import annotations

import json
from typing import Any

import pytest
import pytest_asyncio
from starlette_cms.tables import CMSDocument

from cms import migrate_gateway_docs as mig
from cms.gateways.inaturalist_field_trips import INaturalistFieldTripsGateway
from cms.gateways.spotify_liked_dump import SpotifyLikedDumpGateway, curate_track
from gateway_fakes import FAR, PARK, PARK_NEAR, FakeSpotify, liked, raw_obs

URL = "http://testserver"
LEGACY_HASH = "0123456789abcdef"  # what the old whole-body gateway would have stored


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
            "observations": obs,
            "photo_urls": [],
            "tags": ["birds"],
        },
    )
    await client.publish_document(doc["id"])
    await inject_stray_key(doc["id"])
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
    """Legacy prod-shaped state. Returns the ids of the three outings and a Spotify doc."""
    client, store, transport = env
    split, single, humans = source_obs
    a = await legacy_outing(client, "2026-05-03", split)
    b = await legacy_outing(client, "2026-05-10", single, title="My own title for B")
    c = await legacy_outing(client, "2026-05-17", humans)

    # B: a draft only the gateway could have made (it touches owned fields only).
    await client.update_document(b["id"], body={"species_list": ["American Robin", "Noise"], "observation_count": 9.0})
    # C: a draft that changes a human field, i.e. possibly Joel's real work.
    await client.update_document(c["id"], body={"title": "Edited by Joel, not yet published"})

    songs = [curate_track(i)[1] for i in (liked("s1", "2026-09-02T10:00:00Z"),)]
    sp = await client.create_document(
        doc_type="spotify_liked_dump",
        slug="spotify-dump-2026-09",
        import_ref="spotify:dump:2026-09",
        meta={"content_hash": LEGACY_HASH},
        body={"title": "What I've been listening to — September 2026", "publish_date": "2026-09-01",
              "song_count": 1.0, "songs": songs, "tags": ["music"]},
    )
    await client.publish_document(sp["id"])
    await client.update_document(sp["id"], body={"song_count": 2.0})  # gateway-only draft
    return {"a": a["id"], "b": b["id"], "c": c["id"], "sp": sp["id"]}


async def docs(client, doc_type):
    page = await client.list_documents(doc_type=doc_type, limit=100)
    return {d["import_ref"]: d for d in page["documents"]}


@pytest.mark.asyncio
async def test_dry_run_writes_nothing_and_explains_every_draft(env, legacy, capsys):
    client, _, transport = env
    transport.calls.clear()

    code = await mig.run(URL, None, do_apply=False, allow_prod=False, client=client)

    assert transport.writes() == []
    out = capsys.readouterr().out
    assert "DRY RUN" in out and "nothing written" in out
    assert "discard gateway draft" in out and "species_list" in out  # B: says what the draft differs by
    assert "pending draft changes human fields ['title']" in out  # C: blocked
    assert "drop stray 'draft' key" in out
    assert "day splits into 2 outings" in out
    assert "inaturalist:outing:2026-05-03:2" in out  # the new document it would create
    assert code == 1  # a blocked doc needs a human


@pytest.mark.asyncio
async def test_apply_curates_rekeys_and_cleans_without_touching_human_work(env, legacy, source_obs):
    client, _, _ = env

    code = await mig.run(URL, None, do_apply=True, allow_prod=False, client=client)

    outings = await docs(client, "inaturalist_outing")
    assert set(outings) == {
        "inaturalist:outing:2026-05-03",
        "inaturalist:outing:2026-05-03:2",
        "inaturalist:outing:2026-05-10",
        "inaturalist:outing:2026-05-17",
    }
    a = outings["inaturalist:outing:2026-05-03"]
    assert a["slug"] == "nature-outing-2026-05-03" and a["id"] == legacy["a"], "URL and doc kept"
    assert [o["id"] for o in a["body"]["observations"]] == [1, 2]
    assert "comments" not in a["body"]["observations"][0]
    split = outings["inaturalist:outing:2026-05-03:2"]
    assert split["slug"] == "nature-outing-2026-05-03-2"
    assert [o["id"] for o in split["body"]["observations"]] == [3]
    assert split["body"]["publish_date"] == "2026-05-03" == split["body"]["outing_date"]
    assert split["published"] and not split["has_draft"]

    b = outings["inaturalist:outing:2026-05-10"]
    assert not b["has_draft"] and "draft" not in b["body"]
    assert b["body"]["title"] == "My own title for B", "a hand-edited title survives"
    assert b["body"]["observation_count"] == 1, "the gateway draft's 9.0 was discarded, not published"
    assert all("draft" not in o["body"] for o in outings.values() if not o["has_draft"])

    c = outings["inaturalist:outing:2026-05-17"]
    assert c["has_draft"], "the draft that changes a human field is left for a human"
    assert c["body"]["title"] != "Edited by Joel, not yet published"
    assert "comments" in c["body"]["observations"][0], "blocked doc untouched"

    assert code == 1  # still one blocked doc to resolve by hand


@pytest.mark.asyncio
async def test_after_apply_a_real_sync_writes_nothing(env, api, legacy, source_obs):
    client, store, transport = env
    split, single, humans = source_obs
    await mig.run(URL, None, do_apply=True, allow_prod=False, client=client)
    api.db = [*split, *single, *humans]
    transport.calls.clear()

    inat = INaturalistFieldTripsGateway(cms_client=client, job_store=store)
    result = await inat.sync()
    spotify = SpotifyLikedDumpGateway(
        cms_client=client, job_store=store,
        spotify_client=FakeSpotify([liked("s1", "2026-09-02T10:00:00Z")]),
    )
    sp_result = await spotify.sync()

    assert (result.created, result.updated) == (0, 0), "the migrated shape is exactly what the gateway produces"
    assert result.deferred == ["inaturalist:outing:2026-05-17"], "only the doc a human holds a draft on"
    assert (sp_result.created, sp_result.updated, sp_result.skipped) == (0, 0, 1)
    assert transport.writes() == []


@pytest.mark.asyncio
async def test_apply_is_idempotent(env, legacy):
    client, _, transport = env
    await mig.run(URL, None, do_apply=True, allow_prod=False, client=client)
    first = {r: d["body"] for r, d in (await docs(client, "inaturalist_outing")).items()}
    transport.calls.clear()

    await mig.run(URL, None, do_apply=True, allow_prod=False, client=client)

    assert transport.writes() == [], "a second run finds nothing to do"
    # And never rebuilds from the slim records it left behind (they carry no taxon/photos).
    assert {r: d["body"] for r, d in (await docs(client, "inaturalist_outing")).items()} == first
    assert first["inaturalist:outing:2026-05-03"]["species_list"] == ["American Robin"]
    assert first["inaturalist:outing:2026-05-03"]["photo_urls"]
    assert first["inaturalist:outing:2026-05-03"]["bounding_box"]


@pytest.mark.asyncio
async def test_spotify_hash_is_recomputable_from_stored_data(env):
    """The migration derives the new hash from stored songs; it must match what the gateway computes."""
    client, store, _ = env
    items = [liked("s1", "2026-09-02T10:00:00Z"), liked("s2", "2026-09-18T10:00:00Z")]
    gw = SpotifyLikedDumpGateway(cms_client=client, job_store=store, spotify_client=FakeSpotify(items))
    await gw.sync()

    dump_docs, drafts = await mig.load(client, "spotify_liked_dump")
    plan = mig.plan_dumps(dump_docs, drafts)

    assert [a.kind for a in plan] == ["noop"], plan[0].notes


@pytest.mark.asyncio
async def test_spotify_flags_unstable_slug_and_publish_date(env):
    client, _, _ = env
    doc = await client.create_document(
        doc_type="spotify_liked_dump", slug="wrong-slug", import_ref="spotify:dump:2026-08",
        body={"title": "t", "publish_date": "2026-08-15", "songs": [], "song_count": 0.0},
    )
    await client.publish_document(doc["id"])

    docs_, drafts = await mig.load(client, "spotify_liked_dump")
    notes = "\n".join(n for a in mig.plan_dumps(docs_, drafts) for n in a.notes)

    assert "slug 'wrong-slug' != spotify-dump-2026-08" in notes
    assert "publish_date '2026-08-15' != 2026-08-01" in notes


@pytest.mark.asyncio
async def test_apply_to_prod_needs_an_explicit_flag(env, capsys):
    client, _, transport = env
    transport.calls.clear()

    code = await mig.run("https://cms.joellithgow.com", None, do_apply=True, allow_prod=False, client=client)

    assert code == 2 and transport.calls == []
    assert "--allow-prod" in capsys.readouterr().err


def test_draft_verdict_separates_gateway_drafts_from_human_ones():
    owned = {"observations", "species_list"}
    pub = {"title": "T", "species_list": ["a"], "tags": ["x"]}
    assert mig.draft_verdict(pub, None, owned) == ("none", [])
    assert mig.draft_verdict(pub, {**pub, "species_list": ["a", "b"]}, owned)[0] == "gateway-only"
    assert mig.draft_verdict(pub, {**pub, "draft": True}, owned)[0] == "gateway-only"  # stray key alone
    assert mig.draft_verdict(pub, {**pub, "tags": ["x", "y"]}, owned) == ("human-edits", ["tags"])
    # A draft is a full copy of the body; unchanged human fields do not make it human.
    assert mig.draft_verdict(pub, dict(pub), owned)[0] == "gateway-only"
