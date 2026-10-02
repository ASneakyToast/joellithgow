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
from starlette_cms_gateways.client import CMSClient
from starlette_cms_gateways.jobstore import JobStore

from cms.schema import register_documents
from gateway_fakes import INAT_URL, FakeINat, RecordingTransport


@pytest_asyncio.fixture
async def env(tmp_path, monkeypatch):
    """``(client, job_store, transport)`` over a fresh CMS with the site's schema."""
    monkeypatch.setenv("INATURALIST_USERNAME", "tester")
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    try:
        cms = CMS(database_url=f"sqlite:///{db_path}", auth="none")
        register_documents(cms)
        app = Starlette(routes=[Mount("/", app=cms.app)])
        async with cms.lifespan_context(None):
            transport = RecordingTransport(app)
            http = httpx.AsyncClient(transport=transport, base_url="http://testserver")
            client = CMSClient(base_url="http://testserver", _http_client=http)
            store = JobStore(tmp_path / "jobs.db")
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
