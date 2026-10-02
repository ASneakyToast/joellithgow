"""
Tests for the iNaturalist and Spotify gateways. Run with:

    uv run --with pytest --with pytest-asyncio --with respx python -m pytest tests/

The CMS under test is real (in-process, the site's own ``register_documents``
schema, no network or port); only iNaturalist (respx) and Spotify (a fake
client) are faked. That way the real document models validate what the
gateways write, and the real draft/changeset behaviour decides what "no
pending drafts" means. Fixtures are in ``conftest.py``, fakes in ``gateway_fakes.py``.
"""

from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any

import httpx
import pytest
from starlette_cms_gateways.base import SyncRange
from starlette_cms_gateways.client import CMSClient

from cms.gateways import inaturalist_field_trips as inat
from cms.gateways.inaturalist_field_trips import (
    ExistingOuting,
    INaturalistFieldTripsGateway,
    assign_outing_keys,
    cluster_observations,
)
from cms.gateways.spotify_liked_dump import SpotifyLikedDumpGateway, month_bounds
from gateway_fakes import FAR, GARDEN, PARK, PARK_NEAR, FakeSpotify, library, liked, raw_obs

KM = 1 / 111.2  # degrees of latitude in a kilometre
KEY = "inaturalist_field_trips"  # the state key of a gateway built without job_store_key


def inat_gateway(client, store):
    return INaturalistFieldTripsGateway(cms_client=client, job_store=store)


async def outing_docs(client: CMSClient) -> dict[str, dict[str, Any]]:
    page = await client.list_documents(doc_type="inaturalist_outing", limit=100)
    return {d["import_ref"]: d for d in page["documents"]}


# ---------------------------------------------------------------------------
# Clustering and key assignment (pure)
# ---------------------------------------------------------------------------


def test_nearby_observations_are_one_outing_and_distant_ones_are_two():
    obs = [
        raw_obs(1, "2026-05-03", *PARK, time="09:00"),
        raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:30"),
        raw_obs(3, "2026-05-03", *FAR, time="15:00", place="Somewhere else"),
    ]
    clusters = cluster_observations(obs)
    assert [[o["id"] for o in c] for c in clusters] == [[1, 2], [3]]


def test_a_trail_is_one_outing_even_when_its_ends_are_far_apart():
    # Each hop ~900 m: the ends are ~1.8 km apart but the chain links them.
    obs = [
        raw_obs(1, "2026-05-03", 40.6600, -73.9690, time="09:00"),
        raw_obs(2, "2026-05-03", 40.6680, -73.9690, time="10:00"),
        raw_obs(3, "2026-05-03", 40.6760, -73.9690, time="11:00"),
    ]
    assert len(cluster_observations(obs)) == 1


def test_radius_is_configurable():
    obs = [raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-03", *GARDEN)]
    assert len(cluster_observations(obs, radius_m=500)) == 2
    assert len(cluster_observations(obs, radius_m=2000)) == 1


def test_place_name_does_not_split_an_outing():
    obs = [
        raw_obs(1, "2026-05-03", *PARK, place="Prospect Park"),
        raw_obs(2, "2026-05-03", *PARK_NEAR, place="Long Meadow, Prospect Park, Brooklyn"),
    ]
    assert len(cluster_observations(obs)) == 1


def test_obscured_and_unlocated_observations_join_an_outing_instead_of_splitting_it():
    obs = [
        raw_obs(1, "2026-05-03", *PARK, time="09:00", place="Prospect Park"),
        raw_obs(2, "2026-05-03", *FAR, time="15:00", place="Elsewhere"),
        # Obscured: coordinates are fuzzed ~20 km, so they must not be trusted.
        raw_obs(3, "2026-05-03", 40.9, -73.7, time="09:10", place="Prospect Park", obscured=True),
        # No position at all; no place match; closest in time to the first.
        raw_obs(4, "2026-05-03", None, None, time="09:20", place="(unknown)"),
    ]
    clusters = cluster_observations(obs)
    assert [sorted(o["id"] for o in c) for c in clusters] == [[1, 3, 4], [2]]


def test_a_day_with_no_positions_stays_one_outing_whatever_the_place_names_say():
    obs = [
        raw_obs(1, "2026-05-03", None, None, place="Prospect Park"),
        raw_obs(2, "2026-05-03", None, None, place="Long Meadow, Prospect Park"),
        raw_obs(3, "2026-05-03", None, None, place="Brooklyn, NY"),
    ]
    assert [[o["id"] for o in c] for c in cluster_observations(obs)] == [[1, 2, 3]]


def test_first_outing_of_a_day_keeps_the_legacy_ref_and_slug():
    clusters = [[raw_obs(1, "2026-05-03", *PARK)], [raw_obs(2, "2026-05-03", *FAR)]]
    keys = assign_outing_keys("2026-05-03", clusters, [])
    assert keys == [
        ("inaturalist:outing:2026-05-03", "nature-outing-2026-05-03"),
        ("inaturalist:outing:2026-05-03:2", "nature-outing-2026-05-03-2"),
    ]


def test_an_outing_keeps_its_document_when_an_earlier_one_appears():
    """A late upload from an earlier hour must not steal the day's first ref."""
    existing = [ExistingOuting("inaturalist:outing:2026-05-03", frozenset({2}))]
    clusters = [
        [raw_obs(9, "2026-05-03", *FAR, time="07:00")],  # new, earlier in the day
        [raw_obs(2, "2026-05-03", *PARK, time="15:00")],  # the one already stored
    ]
    keys = assign_outing_keys("2026-05-03", clusters, existing)
    assert keys[1][0] == "inaturalist:outing:2026-05-03"
    assert keys[0][0] == "inaturalist:outing:2026-05-03:2"


def test_a_ref_held_by_an_unmatched_document_is_never_reused():
    existing = [ExistingOuting("inaturalist:outing:2026-05-03", frozenset({100}))]  # all deleted
    clusters = [[raw_obs(1, "2026-05-03", *PARK)]]
    assert assign_outing_keys("2026-05-03", clusters, existing)[0][0].endswith("2026-05-03:2")


def test_a_split_day_leaves_the_old_document_with_the_larger_share():
    existing = [ExistingOuting("inaturalist:outing:2026-05-03", frozenset({1, 2, 3}))]
    clusters = [[raw_obs(3, "2026-05-03", *FAR)], [raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-03", *PARK_NEAR)]]
    keys = assign_outing_keys("2026-05-03", clusters, existing)
    assert keys[1][0] == "inaturalist:outing:2026-05-03"
    assert keys[0][0] == "inaturalist:outing:2026-05-03:2"


def test_bounding_box_reads_the_v1_location_string():
    box = inat.bounding_box([raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-03", *GARDEN)])
    assert box == {
        "lat_min": PARK[0], "lat_max": GARDEN[0], "lon_min": PARK[1], "lon_max": GARDEN[1],
    }
    assert inat.bounding_box([raw_obs(1, "2026-05-03", None, None)]) is None


def test_stored_observation_is_slim_and_has_no_noise():
    stored = inat.curate_observation(raw_obs(7, "2026-05-03", *PARK))
    assert stored["id"] == 7 and stored["lat"] == PARK[0]
    assert not {"comments", "faves", "identifications", "photos", "draft"} & stored.keys()
    assert len(str(stored)) < 700


# ---------------------------------------------------------------------------
# iNaturalist gateway against a real CMS
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_inat_first_sync_creates_one_published_post_per_outing(env, api):
    client, store, _ = env
    api.db = [
        raw_obs(1, "2026-05-03", *PARK, time="09:00"),
        raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:30", common="Blue Jay", name="Cyanocitta cristata"),
        raw_obs(3, "2026-05-03", *FAR, time="15:00", place="Greenwood Cemetery"),
        raw_obs(4, "2026-05-10", *PARK, time="08:00"),
    ]

    result = await inat_gateway(client, store).sync()

    assert (result.created, result.errors) == (3, [])
    docs = await outing_docs(client)
    assert set(docs) == {
        "inaturalist:outing:2026-05-03",
        "inaturalist:outing:2026-05-03:2",
        "inaturalist:outing:2026-05-10",
    }
    first = docs["inaturalist:outing:2026-05-03"]
    assert first["slug"] == "nature-outing-2026-05-03"
    assert docs["inaturalist:outing:2026-05-03:2"]["slug"] == "nature-outing-2026-05-03-2"
    for doc in docs.values():
        assert doc["published"] is True and doc["has_draft"] is False
        assert doc["body"]["publish_date"] == doc["body"]["outing_date"]
        assert "draft" not in doc["body"]
    assert first["body"]["observation_count"] == 2
    assert first["body"]["species_list"] == ["American Robin", "Blue Jay"]
    assert first["body"]["bounding_box"]["lat_min"] == PARK[0]
    assert [o["id"] for o in first["body"]["observations"]] == [1, 2]
    assert docs["inaturalist:outing:2026-05-03:2"]["body"]["place_guess"] == "Greenwood Cemetery"
    assert docs["inaturalist:outing:2026-05-03:2"]["body"]["publish_date"] == "2026-05-03"


@pytest.mark.asyncio
async def test_inat_resync_with_nothing_new_writes_nothing(env, api):
    client, store, transport = env
    api.db = [raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-10", *PARK)]
    gw = inat_gateway(client, store)
    await gw.sync()
    before = {r: d["updated_at"] for r, d in (await outing_docs(client)).items()}
    transport.calls.clear()

    for rng in ("all_time", "since_last_sync"):
        result = await gw.sync(SyncRange(rng))
        assert (result.created, result.updated, result.deferred) == (0, 0, [])

    assert transport.writes() == []
    docs = await outing_docs(client)
    assert {r: d["updated_at"] for r, d in docs.items()} == before
    assert all(not d["has_draft"] for d in docs.values())


@pytest.mark.asyncio
async def test_inat_volatile_upstream_noise_is_not_an_update(env, api):
    client, store, transport = env
    api.db = [raw_obs(1, "2026-05-03", *PARK)]
    gw = inat_gateway(client, store)
    await gw.sync()
    transport.calls.clear()

    api.db[0]["comments"] = [{"id": 1, "body": "nice!"}]
    api.db[0]["faves"] = [{"user": "someone"}]
    api.db[0]["comments_count"] = 1
    api.db[0]["identifications"][0]["body"] = "changed"
    api.db[0]["updated_at"] = "2099-01-01T00:00:00+00:00"

    result = await gw.sync(SyncRange("all_time"))

    assert (result.updated, result.skipped) == (0, 1)
    assert transport.writes() == []


@pytest.mark.asyncio
async def test_inat_new_observation_updates_and_publishes_leaving_edits_alone(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK, time="09:00"), raw_obs(5, "2026-05-10", *PARK)]
    gw = inat_gateway(client, store)
    await gw.sync()

    # Joel retitles the post and publishes.
    docs = await outing_docs(client)
    doc = docs["inaturalist:outing:2026-05-03"]
    await client.update_document(doc["id"], body={"title": "Robins at the Long Meadow"})
    await client.publish_document(doc["id"])

    api.db.append(
        raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:40", common="Blue Jay",
                name="Cyanocitta cristata", updated="2099-01-01T00:00:00+00:00")
    )
    result = await gw.sync()

    assert (result.created, result.updated) == (0, 1)
    docs = await outing_docs(client)
    edited = docs["inaturalist:outing:2026-05-03"]
    assert edited["published"] and not edited["has_draft"]
    assert edited["body"]["observation_count"] == 2
    assert edited["body"]["species_list"] == ["American Robin", "Blue Jay"]
    assert edited["body"]["title"] == "Robins at the Long Meadow"
    assert edited["body"]["publish_date"] == "2026-05-03"
    assert docs["inaturalist:outing:2026-05-10"]["body"]["observation_count"] == 1


@pytest.mark.asyncio
async def test_inat_incremental_run_only_refetches_the_days_that_changed(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-10", *PARK)]
    gw = inat_gateway(client, store)
    await gw.sync()
    api.requests.clear()

    api.db.append(raw_obs(3, "2026-05-10", *PARK_NEAR, updated="2099-01-01T00:00:00+00:00"))
    result = await gw.sync()

    assert result.window.mode == "since_last_sync"
    assert (result.updated, result.skipped) == (1, 0), "only the touched day is processed"
    assert [("updated_since" in r, r.get("observed_on")) for r in api.requests[:2]] == [
        (True, None),
        (False, "2026-05-10"),
    ]
    assert all(r.get("observed_on") in (None, "2026-05-10") for r in api.requests)


@pytest.mark.asyncio
async def test_inat_edited_observation_date_refreshes_the_old_day_too(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-03", *PARK_NEAR)]
    gw = inat_gateway(client, store)
    await gw.sync()

    moved = api.db[1]
    moved.update(observed_on="2026-05-04", time_observed_at="2026-05-04T10:00:00-04:00",
                 updated_at="2099-01-01T00:00:00+00:00")
    await gw.sync()

    docs = await outing_docs(client)
    assert [o["id"] for o in docs["inaturalist:outing:2026-05-03"]["body"]["observations"]] == [1]
    assert [o["id"] for o in docs["inaturalist:outing:2026-05-04"]["body"]["observations"]] == [2]


@pytest.mark.asyncio
async def test_inat_since_last_sync_without_a_cursor_falls_back_to_all_time(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK)]

    result = await inat_gateway(client, store).sync()

    assert result.window.mode == "all_time" and result.window.fell_back
    assert not any("updated_since" in r for r in api.requests)


@pytest.mark.asyncio
async def test_inat_custom_range_filters_by_observed_date_and_leaves_the_cursor(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-04-01", *PARK), raw_obs(2, "2026-05-03", *PARK), raw_obs(3, "2026-06-01", *PARK)]

    result = await inat_gateway(client, store).sync(SyncRange("custom", date(2026, 4, 15), date(2026, 5, 15)))

    assert result.created == 1
    assert set(await outing_docs(client)) == {"inaturalist:outing:2026-05-03"}
    assert (api.requests[0]["d1"], api.requests[0]["d2"]) == ("2026-04-15", "2026-05-15")
    assert await store.get_cursor("inaturalist_field_trips") is None


@pytest.mark.asyncio
async def test_inat_failed_run_does_not_advance_the_cursor_and_retries(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK)]
    gw = inat_gateway(client, store)
    await gw.sync()
    cursor = await store.get_cursor("inaturalist_field_trips")

    api.db.append(raw_obs(2, "2026-05-03", *PARK_NEAR, updated="2099-01-01T00:00:00+00:00"))
    api.fail_on_observed_on = "2026-05-03"
    with pytest.raises(httpx.HTTPStatusError):
        await gw.sync()
    assert await store.get_cursor("inaturalist_field_trips") == cursor

    api.fail_on_observed_on = None
    result = await gw.sync()
    assert result.updated == 1
    assert (await outing_docs(client))["inaturalist:outing:2026-05-03"]["body"]["observation_count"] == 2


@pytest.mark.asyncio
async def test_inat_legacy_document_is_adopted_not_duplicated(env, api):
    """A pre-existing doc (raw payload, old ref) is updated in place and keeps its slug and title."""
    client, store, _ = env
    legacy_obs = raw_obs(1, "2026-05-03", *PARK)
    doc = await client.create_document(
        doc_type="inaturalist_outing",
        slug="nature-outing-2026-05-03",
        import_ref="inaturalist:outing:2026-05-03",
        meta={"content_hash": "stale-hash-from-the-old-gateway"},
        body={
            "title": "Prospect Park, Brooklyn, NY",
            "publish_date": "2026-05-03",
            "outing_date": "2026-05-03",
            "place_guess": "Prospect Park, Brooklyn, NY",
            "observation_count": 1.0,
            "species_list": ["American Robin"],
            "observations": [legacy_obs],  # the 35 KB raw payload
            "photo_urls": [],
            "tags": ["birds"],
        },
    )
    await client.publish_document(doc["id"])
    api.db = [legacy_obs]

    result = await inat_gateway(client, store).sync()

    assert (result.created, result.updated) == (0, 1)
    docs = await outing_docs(client)
    assert set(docs) == {"inaturalist:outing:2026-05-03"}
    only = docs["inaturalist:outing:2026-05-03"]
    assert only["slug"] == "nature-outing-2026-05-03"
    assert only["body"]["title"] == "Prospect Park, Brooklyn, NY"
    assert "comments" not in only["body"]["observations"][0]
    assert only["has_draft"] is False

    # Once adopted, the same data is a no-op.
    again = await inat_gateway(client, store).sync(SyncRange("all_time"))
    assert (again.updated, again.skipped) == (0, 1)


# ---------------------------------------------------------------------------
# Spotify gateway against a real CMS
# ---------------------------------------------------------------------------


def spotify_gateway(client, store, fake):
    return SpotifyLikedDumpGateway(cms_client=client, job_store=store, spotify_client=fake)


async def dump_docs(client: CMSClient) -> dict[str, dict[str, Any]]:
    page = await client.list_documents(doc_type="spotify_liked_dump", limit=100)
    return {d["import_ref"]: d for d in page["documents"]}


@pytest.mark.asyncio
async def test_spotify_first_sync_creates_published_monthly_posts_above_the_floor(env):
    client, store, _ = env

    result = await spotify_gateway(client, store, FakeSpotify(library())).sync()

    assert result.created == 3 and not result.errors
    docs = await dump_docs(client)
    assert set(docs) == {"spotify:dump:2026-09", "spotify:dump:2026-08", "spotify:dump:2026-07"}
    sep = docs["spotify:dump:2026-09"]
    assert sep["published"] and not sep["has_draft"]
    assert sep["slug"] == "spotify-dump-2026-09"
    assert sep["body"]["publish_date"] == "2026-09-01"
    assert sep["body"]["song_count"] == 2
    assert [s["track_name"] for s in sep["body"]["songs"]] == ["Song s2", "Song s1"]
    assert sep["body"]["songs"][0]["album_art_url"] == "small-s2"
    assert "popularity" not in sep["body"]["songs"][0]


@pytest.mark.asyncio
async def test_spotify_mid_month_resync_updates_that_month_and_publishes_it(env):
    client, store, _ = env
    fake = FakeSpotify(library())
    gw = spotify_gateway(client, store, fake)
    await gw.sync()
    # Pin the cursor so the window is the same on any day the tests run.
    await store.set_cursor("spotify_liked_dump", datetime(2026, 9, 20, 12, tzinfo=UTC))

    fake.items.insert(0, liked("s3", "2026-09-25T10:00:00Z"))
    fake.offsets.clear()
    result = await gw.sync()

    assert (result.updated, result.skipped, result.created) == (1, 0, 0)
    docs = await dump_docs(client)
    sep = docs["spotify:dump:2026-09"]
    assert sep["body"]["song_count"] == 3
    assert [s["track_name"] for s in sep["body"]["songs"]][0] == "Song s3"
    assert sep["published"] and not sep["has_draft"]
    assert sep["body"]["publish_date"] == "2026-09-01" and sep["slug"] == "spotify-dump-2026-09"
    assert docs["spotify:dump:2026-08"]["body"]["song_count"] == 2


@pytest.mark.asyncio
async def test_spotify_incremental_run_stops_paging_once_past_the_window(env):
    client, store, _ = env
    # 130 tracks in a month long ago, then the recent ones on top.
    old = [liked(f"o{i}", "2026-03-10T10:00:00Z") for i in range(130)]
    fake = FakeSpotify(library()[:2] + old)
    gw = spotify_gateway(client, store, fake)
    await store.set_cursor("spotify_liked_dump", datetime(2026, 9, 20, 12, tzinfo=UTC))

    await gw.sync()

    assert fake.offsets == [0], "two September tracks then an older one: one page is enough"


@pytest.mark.asyncio
async def test_spotify_resync_with_nothing_new_writes_nothing(env):
    client, store, transport = env
    gw = spotify_gateway(client, store, FakeSpotify(library()))
    await gw.sync()
    before = {r: d["updated_at"] for r, d in (await dump_docs(client)).items()}
    transport.calls.clear()

    for rng in ("all_time", "since_last_sync"):
        result = await gw.sync(SyncRange(rng))
        assert (result.created, result.updated) == (0, 0)

    assert transport.writes() == []
    assert {r: d["updated_at"] for r, d in (await dump_docs(client)).items()} == before


@pytest.mark.asyncio
async def test_spotify_hand_edit_survives_and_unliked_song_leaves_a_refreshed_month(env):
    client, store, _ = env
    fake = FakeSpotify(library())
    gw = spotify_gateway(client, store, fake)
    await gw.sync()
    sep = (await dump_docs(client))["spotify:dump:2026-09"]
    await client.update_document(sep["id"], body={"title": "September mixtape", "tags": ["music", "mine"]})
    await client.publish_document(sep["id"])
    await store.set_cursor("spotify_liked_dump", datetime(2026, 9, 20, 12, tzinfo=UTC))

    fake.items = [i for i in fake.items if i["track"]["id"] != "s1"]  # un-liked
    await gw.sync()

    sep = (await dump_docs(client))["spotify:dump:2026-09"]
    assert sep["body"]["song_count"] == 1
    assert sep["body"]["title"] == "September mixtape" and sep["body"]["tags"] == ["music", "mine"]


@pytest.mark.asyncio
async def test_spotify_custom_range_can_reach_before_the_floor_and_leaves_the_cursor(env):
    client, store, _ = env

    result = await spotify_gateway(client, store, FakeSpotify(library())).sync(
        SyncRange("custom", date(2024, 12, 1), date(2024, 12, 31))
    )

    assert result.created == 1
    assert set(await dump_docs(client)) == {"spotify:dump:2024-12"}
    assert await store.get_cursor("spotify_liked_dump") is None


def test_spotify_month_bounds():
    from starlette_cms_gateways.base import SyncWindow

    assert month_bounds(SyncWindow("all_time")) == ("2025-01", None)
    assert month_bounds(SyncWindow("since_last_sync", changed_since=datetime(2026, 9, 19, tzinfo=UTC))) == ("2026-09", None)
    assert month_bounds(SyncWindow("since_last_sync", changed_since=datetime(2020, 1, 1, tzinfo=UTC))) == ("2025-01", None)
    assert month_bounds(SyncWindow("custom", start=date(2024, 12, 5), end=date(2025, 2, 1))) == ("2024-12", "2025-02")


def test_outing_report_shows_where_the_radius_matters():
    from cms.inat_outing_report import report

    obs = [
        raw_obs(1, "2026-05-03", *PARK), raw_obs(2, "2026-05-03", *GARDEN),   # ~1.2 km apart
        raw_obs(3, "2026-05-10", *PARK), raw_obs(4, "2026-05-10", *PARK_NEAR),  # always together
    ]
    out = report(obs, [500, 2000])
    assert "2026-05-03" in out and "depends on radius" in out
    assert "1 day(s) where the radius changes the answer" in out
    assert "2026-05-10" not in report(obs, [500, 2000], only_differing=True)


# ---------------------------------------------------------------------------
# The 3 km radius, on days shaped like the real ones
# ---------------------------------------------------------------------------
#
# The real coordinates are not in this repo, so these are built to the same shape (the
# shape the decision rests on): sightings spread along a trail with hops over 1 km, and a
# day in two cities. `python -m cms.inat_outing_report --only-differing` checks real data.


def trail(day: str, hops_km: list[float], start=(40.70, -73.95)) -> list[dict]:
    lat, lon = start
    out = [raw_obs(1, day, lat, lon, time="08:00")]
    for i, hop in enumerate(hops_km, start=2):
        lat += hop * KM
        out.append(raw_obs(i, day, lat, lon, time=f"{8 + i}:00"))
    return out


OAKLAND = (37.8044, -122.2712)
ALBANY = (37.8869, -122.2978)  # ~9.5 km north


def test_three_km_gives_one_two_and_one_outings_on_the_real_days():
    may_25 = trail("2026-05-25", [1.6, 1.6])  # a 3.2 km hike, a sighting every 1.6 km
    jul_4 = [
        raw_obs(10, "2026-07-04", *OAKLAND, time="09:00", place="Oakland, CA"),
        raw_obs(11, "2026-07-04", *ALBANY, time="14:00", place="Albany, CA"),
    ]
    sep_5 = trail("2026-09-05", [1.1, 2.4, 0.4])

    assert inat.DEFAULT_RADIUS_M == 3000
    assert [len(cluster_observations(day)) for day in (may_25, jul_4, sep_5)] == [1, 2, 1]
    # ...and why 1 km was wrong: it splits both hikes.
    assert [len(cluster_observations(day, 1000)) for day in (may_25, jul_4, sep_5)] == [3, 2, 3]


def test_every_caller_clusters_at_the_configured_radius(monkeypatch):
    obs = trail("2026-05-25", [1.6, 1.6])
    monkeypatch.setenv("INATURALIST_USERNAME", "tester")
    monkeypatch.setenv("INATURALIST_OUTING_RADIUS_M", "1000")

    assert INaturalistFieldTripsGateway(cms_client=None).cluster_radius_m == 1000  # type: ignore[arg-type]
    assert inat.outing_radius_m() == 1000
    assert len(cluster_observations(obs)) == 3, "no radius passed: the env override still applies"
    monkeypatch.delenv("INATURALIST_OUTING_RADIUS_M")
    assert len(cluster_observations(obs)) == 1


# ---------------------------------------------------------------------------
# Tags are owned; quality_grade is not stored
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_inat_adding_a_bird_later_adds_the_birds_tag_and_overwrites_a_hand_edit(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK, common="Oak", name="Quercus", iconic="Plantae")]
    gw = inat_gateway(client, store)
    await gw.sync()
    doc = (await outing_docs(client))["inaturalist:outing:2026-05-03"]
    assert doc["body"]["tags"] == ["plants"]
    await client.update_document(doc["id"], body={"title": "Oaks", "tags": ["plants", "favourite"]})
    await client.publish_document(doc["id"])

    api.db.append(raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:40", updated="2099-01-01T00:00:00+00:00"))
    result = await gw.sync()

    assert result.updated == 1
    edited = (await outing_docs(client))["inaturalist:outing:2026-05-03"]
    assert edited["body"]["tags"] == ["birds", "plants"], "tags follow the observations"
    assert edited["body"]["title"] == "Oaks", "the title stays the editor's"


@pytest.mark.asyncio
async def test_spotify_tags_stay_seeded(env):
    client, store, _ = env
    gw = SpotifyLikedDumpGateway(
        cms_client=client, job_store=store, spotify_client=FakeSpotify([liked("a", "2026-08-01T10:00:00Z")])
    )
    await gw.sync()
    assert "tags" not in SpotifyLikedDumpGateway.owned_fields
    sep = (await client.find_by_import_ref("spotify_liked_dump", "spotify:dump:2026-08"))
    await client.update_document(sep["id"], body={"tags": ["music", "mine"]})
    await client.publish_document(sep["id"])
    gw._sp = FakeSpotify([liked("b", "2026-08-09T10:00:00Z"), liked("a", "2026-08-01T10:00:00Z")])

    await gw.sync(SyncRange("all_time"))

    sep = (await client.find_by_import_ref("spotify_liked_dump", "spotify:dump:2026-08"))
    assert sep["body"]["tags"] == ["music", "mine"] and sep["body"]["song_count"] == 2


@pytest.mark.asyncio
async def test_a_community_id_change_is_not_an_update(env, api):
    """quality_grade moves when people identify an observation; the site never shows it."""
    client, store, transport = env
    api.db = [raw_obs(1, "2026-05-03", *PARK, quality_grade="needs_id")]
    gw = inat_gateway(client, store)
    await gw.sync()
    doc = (await outing_docs(client))["inaturalist:outing:2026-05-03"]
    assert "quality_grade" not in doc["body"]["observations"][0]

    api.db[0]["quality_grade"] = "research"
    api.db[0]["updated_at"] = "2099-01-01T00:00:00+00:00"
    transport.calls.clear()
    result = await gw.sync()

    assert (result.updated, result.skipped) == (0, 1)
    assert transport.writes() == []


# ---------------------------------------------------------------------------
# A post left alone is caught up by an all_time run
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_inat_outing_a_person_has_a_draft_on_is_left_alone_then_caught_up_by_all_time(env, api):
    client, store, _ = env
    api.db = [raw_obs(1, "2026-05-03", *PARK, time="09:00")]
    gw = inat_gateway(client, store)
    await gw.sync()
    doc = (await outing_docs(client))["inaturalist:outing:2026-05-03"]
    await client.update_document(doc["id"], body={"title": "Half-written"})  # a person's draft

    api.db.append(raw_obs(2, "2026-05-03", *PARK_NEAR, time="09:40", updated="2099-01-01T00:00:00+00:00"))
    left = await gw.sync()
    assert left.deferred == ["inaturalist:outing:2026-05-03"]
    assert await store.get_cursor(KEY) == left.started_at, "being left alone does not hold the cursor"

    # They publish; iNaturalist has nothing newer, so an incremental run does not meet the outing.
    api.db[1]["updated_at"] = "2000-01-01T00:00:00+00:00"
    await client.publish_document(doc["id"])
    quiet = await gw.sync()
    assert (quiet.updated, quiet.deferred) == (0, [])

    caught_up = await gw.sync(SyncRange("all_time"))
    assert caught_up.updated == 1
    edited = (await outing_docs(client))["inaturalist:outing:2026-05-03"]
    assert edited["body"]["observation_count"] == 2 and edited["body"]["title"] == "Half-written"


@pytest.mark.asyncio
async def test_spotify_month_a_person_has_a_draft_on_is_left_alone_then_caught_up_by_all_time(env):
    client, store, _ = env
    sp = FakeSpotify([liked("a", "2026-08-01T10:00:00Z")])
    gw = SpotifyLikedDumpGateway(cms_client=client, job_store=store, spotify_client=sp)
    await gw.sync()
    aug = await client.find_by_import_ref("spotify_liked_dump", "spotify:dump:2026-08")
    await client.update_document(aug["id"], body={"title": "Half-written"})  # a person's draft

    sp.items = [liked("b", "2026-08-09T10:00:00Z"), liked("a", "2026-08-01T10:00:00Z")]
    left = await gw.sync(SyncRange("all_time"))
    assert left.deferred == ["spotify:dump:2026-08"]

    await client.publish_document(aug["id"])
    caught_up = await gw.sync(SyncRange("all_time"))

    assert caught_up.updated == 1
    aug = await client.find_by_import_ref("spotify_liked_dump", "spotify:dump:2026-08")
    assert aug["body"]["song_count"] == 2 and aug["body"]["title"] == "Half-written"
