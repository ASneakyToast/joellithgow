"""
MCP server for gateway management — trigger syncs, list gateways, view results.

Runs alongside the content MCP server as the cms-gateway-mcp sidecar on port
8003 (streamable-http), fronted by nginx /mcp/gateway. Exposes the Spotify /
iNaturalist gateway sync tools to remote clients (the hermes content bot).

Usage:
    uv run python -m cms.gateway_mcp_server --transport streamable-http --port 8003
"""
from __future__ import annotations

import argparse
import json
import os

from mcp.server.fastmcp import FastMCP
from starlette_cms_gateways.base import SyncRange
from starlette_cms_gateways.client import CMSClient, CMSError
from starlette_cms_gateways.discovery import discover_gateways
from starlette_cms_gateways.jobstore import JobStore

CMS_URL = os.environ.get("CMS_URL", "http://cms-prod:8000")
CMS_API_KEY = os.environ.get("CMS_API_KEY", "")
# Holds each gateway's sync cursor. Without a file that survives restarts,
# since_last_sync falls back to an all-time sync every run — correct (syncs are
# idempotent) but slower. Point this at a mounted volume to keep the cursor.
GATEWAY_JOBS_DB = os.environ.get("GATEWAY_JOBS_DB", "gateway_jobs.db")

mcp = FastMCP("joellithgow-gateways")


def _get_client() -> CMSClient:
    return CMSClient(base_url=CMS_URL.rstrip("/"), api_key=CMS_API_KEY or None)


async def _sync_gateway_inner(
    gateway_name: str,
    client: CMSClient,
    sync_range: SyncRange | None = None,
    job_store: JobStore | None = None,
) -> dict:
    """Run a single gateway sync, return result summary."""
    gateways = discover_gateways()
    if gateway_name not in gateways:
        available = ", ".join(sorted(gateways)) or "(none)"
        return {"error": f"Unknown gateway {gateway_name!r}. Available: {available}"}

    gateway_cls = gateways[gateway_name]
    try:
        gateway = gateway_cls(
            cms_client=client,
            job_store=job_store if job_store is not None else JobStore(GATEWAY_JOBS_DB),
            job_store_key=gateway_name,
        )
        result = await gateway.sync(sync_range)
        return {
            "gateway": gateway_name,
            "range": result.window.to_dict() if result.window else {"mode": gateway.range.mode},
            "created": result.created,
            "updated": result.updated,
            "skipped": result.skipped,
            "deferred": result.deferred,
            "errors": len(result.errors),
            "error_details": [
                {"import_ref": ref, "message": msg} for ref, msg in (result.errors or [])
            ],
        }
    except CMSError as exc:
        return {"gateway": gateway_name, "error": str(exc)}


@mcp.tool()
async def list_gateways() -> str:
    """List all available gateway implementations and their metadata."""
    gateways = discover_gateways()
    if not gateways:
        return "No gateways found."

    lines = ["## Available Gateways\n"]
    for name, cls in sorted(gateways.items()):
        svc = getattr(cls, "service_name", "?")
        bt = getattr(cls, "block_type", "?")
        auto = getattr(cls, "auto_publish", False)
        imm = getattr(cls, "immutable", False)
        default_range = getattr(cls, "default_range", "since_last_sync")
        lines.append(
            f"- **{name}**  "
            f"service=`{svc}`  block=`{bt}`  "
            f"auto_publish={auto}  immutable={imm}  default_range={default_range}"
        )
    return "\n".join(lines)


@mcp.tool()
async def sync_gateway(
    gateway_name: str,
    range: str | None = None,  # noqa: A002
    from_date: str | None = None,
    to_date: str | None = None,
) -> str:
    """
    Sync a named gateway into the CMS.

    Discovers external service data (Spotify liked songs, iNaturalist field
    trips, etc.) and upserts it as CMS documents. A re-sync that finds nothing
    new changes nothing, and fields you edited in the editor are never
    overwritten. Call ``list_gateways`` first to see available gateway names.

    Args:
        gateway_name: The entry-point name of the gateway, e.g.
            ``spotify-liked-dump`` or ``inaturalist-field-trips``.
        range: What to cover. ``since_last_sync`` (the default for both
            gateways) fetches only what changed since the last clean run;
            ``all_time`` re-reads everything (first run, or to repair);
            ``custom`` backfills ``from_date``..``to_date``.
        from_date: ``YYYY-MM-DD``. For ``custom``: the first observed date
            (iNaturalist) or liked month (Spotify) to include.
        to_date: ``YYYY-MM-DD``. For ``custom``: the last one to include.
    """
    try:
        sync_range = (
            SyncRange.parse(range, from_date, to_date) if (range or from_date or to_date) else None
        )
    except ValueError as exc:
        return f"❌ Invalid range: {exc}"

    client = _get_client()
    try:
        result = await _sync_gateway_inner(gateway_name, client, sync_range)
    finally:
        await client.close()

    if "error" in result:
        return f"❌ {result['error']}"

    mode = result["range"]["mode"]
    note = " (no cursor yet, so everything)" if result["range"].get("fell_back") else ""
    parts = [
        f"✅ Synced **{result['gateway']}** — {mode}{note}",
        f"  • Created: {result['created']}",
        f"  • Updated: {result['updated']}",
        f"  • Skipped (nothing new): {result['skipped']}",
        f"  • Errors: {result['errors']}",
    ]
    if result["deferred"]:
        parts.append(
            f"  • Deferred: {len(result['deferred'])} — someone has an unpublished draft "
            "on these, so they were left alone and will be retried:"
        )
        parts += [f"    - `{ref}`" for ref in result["deferred"]]
    if result.get("error_details"):
        for err in result["error_details"]:
            parts.append(f"    - `{err['import_ref']}`: {err['message']}")

    return "\n".join(parts)


@mcp.tool()
async def get_recent_gateway_items(
    block_type: str,
    limit: int = 20,
) -> str:
    """
    List recently synced CMS documents for a specific gateway service.

    Args:
        block_type: The CMS document type for this gateway, e.g.
            ``spotify_liked_song`` or ``inaturalist_outing``.
        limit: Maximum number of documents to return. Default 20.
    """
    client = _get_client()
    try:
        data = await client.list_documents(doc_type=block_type, limit=limit)
    finally:
        await client.close()

    docs = data.get("documents", [])
    total = data.get("total", 0)
    return (
        f"{total} document(s) of type {block_type!r} "
        f"(showing {len(docs)}):\n"
        + json.dumps(docs, indent=2, default=str)
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="joellithgow gateway MCP server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="streamable-http",
        help="MCP transport (default: streamable-http)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Bind address for HTTP transports",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8003,
        help="HTTP port for SSE/streamable-http transports (default: 8003)",
    )
    args = parser.parse_args()

    if args.transport in ("sse", "streamable-http"):
        mcp.settings.host = args.host
        mcp.settings.port = args.port

    mcp.run(transport=args.transport)
