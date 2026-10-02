"""The sync_gateway MCP tool: range arguments, the CMS-held cursor, and what it tells the caller."""

from __future__ import annotations

import httpx
import pytest
from starlette_cms_gateways.client import CMSClient

from cms import gateway_mcp_server as srv
from cms.gateways.inaturalist_field_trips import INaturalistFieldTripsGateway
from gateway_fakes import PARK, raw_obs


@pytest.fixture
def wired(env, api, monkeypatch):
    client, store, transport = env

    def fresh_client() -> CMSClient:
        # Like prod: each tool call builds, uses and closes its own client.
        http = httpx.AsyncClient(transport=transport, base_url="http://testserver")
        return CMSClient(base_url="http://testserver", _http_client=http)

    monkeypatch.setattr(srv, "_get_client", fresh_client)
    # The tool reads discover_gateways from the server module; the CMS's gateway API
    # (which serves the cursor) resolves gateway names with its own copy.
    gateways = {"inaturalist-field-trips": INaturalistFieldTripsGateway}
    monkeypatch.setattr(srv, "discover_gateways", lambda: gateways)
    monkeypatch.setattr("starlette_cms_gateways.admin.api.discover_gateways", lambda: gateways)
    return client, api, transport


@pytest.mark.asyncio
async def test_first_call_reports_that_it_synced_everything_then_goes_incremental(wired):
    _, api, _ = wired
    api.db = [raw_obs(1, "2026-05-03", *PARK)]

    first = await srv.sync_gateway("inaturalist-field-trips")
    second = await srv.sync_gateway("inaturalist-field-trips")

    assert "all_time" in first and "no cursor yet" in first and "Created: 1" in first
    assert "since_last_sync" in second and "no cursor yet" not in second
    assert "Created: 0" in second and "Updated: 0" in second


@pytest.mark.asyncio
async def test_custom_range_is_passed_through(wired):
    _, api, _ = wired
    api.db = [raw_obs(1, "2026-04-01", *PARK), raw_obs(2, "2026-05-03", *PARK)]

    out = await srv.sync_gateway(
        "inaturalist-field-trips", range="custom", from_date="2026-05-01", to_date="2026-05-31"
    )

    assert "custom" in out and "Created: 1" in out
    assert (api.requests[0]["d1"], api.requests[0]["d2"]) == ("2026-05-01", "2026-05-31")


@pytest.mark.asyncio
async def test_dates_alone_imply_a_custom_range(wired):
    _, api, _ = wired
    api.db = [raw_obs(2, "2026-05-03", *PARK)]

    out = await srv.sync_gateway("inaturalist-field-trips", from_date="2026-05-01")

    assert "custom" in out and api.requests[0]["d1"] == "2026-05-01"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "kwargs",
    [{"range": "sometimes"}, {"range": "custom"}, {"range": "all_time", "from_date": "2026-01-01"}],
)
async def test_bad_range_is_refused_before_anything_runs(wired, kwargs):
    _, api, transport = wired
    transport_calls = len(transport.calls)

    out = await srv.sync_gateway("inaturalist-field-trips", **kwargs)

    assert out.startswith("❌ Invalid range")
    assert api.requests == [] and len(transport.calls) == transport_calls


@pytest.mark.asyncio
async def test_deferred_documents_are_named_in_the_reply(wired):
    client, api, _ = wired
    api.db = [raw_obs(1, "2026-05-03", *PARK)]
    await srv.sync_gateway("inaturalist-field-trips")
    doc = await client.find_by_import_ref("inaturalist_outing", "inaturalist:outing:2026-05-03")
    await client.update_document(doc["id"], body={"title": "Half-written edit"})  # a human draft
    api.db.append(raw_obs(2, "2026-05-03", *PARK, updated="2099-01-01T00:00:00+00:00"))

    out = await srv.sync_gateway("inaturalist-field-trips", range="all_time")

    assert "Left alone: 1" in out and "inaturalist:outing:2026-05-03" in out
    assert "all_time" in out, "it says how to catch them up"
    assert "Updated: 0" in out


@pytest.mark.asyncio
async def test_the_cursor_the_tool_writes_is_the_one_the_cms_serves_and_the_run_is_in_history(wired, env):
    from datetime import datetime

    client, store, _ = env
    _, api, _ = wired
    api.db = [raw_obs(1, "2026-05-03", *PARK)]

    await srv.sync_gateway("inaturalist-field-trips")

    served = (await client._get_http().get(
        "http://testserver/api/gateways/inaturalist-field-trips/cursor"
    )).json()["cursor"]
    assert served and datetime.fromisoformat(served) == await store.get_cursor("inaturalist-field-trips")
    jobs = await store.list_for_gateway("inaturalist-field-trips")
    assert [j["status"] for j in jobs] == ["done"], "an MCP run is in the job history"
    assert jobs[0]["result"]["created"] == 1
    assert await store.get_last_synced("inaturalist-field-trips") is not None
