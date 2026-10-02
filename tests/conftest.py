"""Fixtures shared by the gateway and migration tests (a real in-process CMS)."""

from __future__ import annotations

import os
import tempfile

import httpx
import pytest
import pytest_asyncio
import respx
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette_cms import CMS
from starlette_cms_gateways.admin import GatewayAdmin
from starlette_cms_gateways.client import CMSClient

from cms.schema import register_documents
from gateway_fakes import INAT_URL, FakeINat, RecordingTransport


@pytest_asyncio.fixture
async def env(tmp_path, monkeypatch):
    """``(client, job_store, transport)`` over a fresh CMS with the site's schema.

    ``job_store`` is the CMS's own gateway state (cursor and job history), the
    same store the gateway API serves, so a run through the MCP tool or the CLI and a run
    handed ``job_store`` directly see one cursor.
    """
    monkeypatch.setenv("INATURALIST_USERNAME", "tester")
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        cms = CMS(database_url=f"sqlite:///{db_path}", auth="none")
        register_documents(cms)
        admin = GatewayAdmin(cms=cms)  # default state file: the CMS's own database
        app = Starlette(routes=[Mount("/", app=cms.app)])
        async with cms.lifespan_context(None):
            transport = RecordingTransport(app)
            http = httpx.AsyncClient(transport=transport, base_url="http://testserver")
            client = CMSClient(base_url="http://testserver", _http_client=http)
            store = admin.jobs
            try:
                yield client, store, transport
            finally:
                await http.aclose()
    finally:
        os.unlink(db_path)


@pytest.fixture
def api():
    fake = FakeINat()
    with respx.mock(assert_all_called=False) as mock:
        mock.get(INAT_URL).mock(side_effect=fake)
        yield fake
