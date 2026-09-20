"""
MCP server for gateway management — trigger syncs, list gateways, view results.

Runs alongside the main CMS MCP server on port 8003 (streamable-http).

Usage:
    uv run python -m cms.gateway_mcp_server --port 8003
"""
from __future__ import annotations

import os
import sys
from collections.abc import AsyncIterator

# ---------------------------------------------------------------------------
# FastMCP setup
# ---------------------------------------------------------------------------
try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    try:
        from mcp.server.fastmcp.server import FastMCP as _FastMCP
        from mcp.server.fastmcp import FastMCP  # noqa: F811

        FastMCP = _FastMCP
    except ImportError:
        # mcp >= 2.x renamed FastMCP → MCPServer
        from mcp.server.mcpserver import MCPServer
        from starlette_cms_gateways.client import CMSClient
        from starlette_cms_gateways.discovery import discover_gateways

        sys.exit("mcp >= 2.x not supported yet — pin mcp<2 or use mcp 1.x")
from starlette_cms_gateways.client import CMSClient, CMSError
from starlette_cms_gateways.discovery import discover_gateways

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CMS_URL = os.environ.get("CMS_URL", "http://cms-prod:8000")
CMS_API_KEY = os.environ.get("CMS_API_KEY", "")

# ---------------------------------------------------------------------------
# MCP server
# ---------------------------------------------------------------------------

mcp = FastMCP("joellithgow-gateways")


def _get_client() -> CMSClient:
    return CMSClient(base_url=CMS_URL.rstrip("/"), api_key=CMS_API_KEY or None)


async def _sync_gateway_inner(gateway_name: str, client: CMSClient) -> dict:
    """Run a single gateway sync, return result summary."""
    gateways = discover_gateways()
    if gateway_name not in gateways:
        available = ", ".join(sorted(gateways)) or "(none)"
        return {"error": f"Unknown gateway {gateway_name!r}. Available: {available}"}

    gateway_cls = gateways[gateway_name]
    try:
        gateway = gateway_cls(cms_client=client)
        result = await gateway.sync()
        return {
            "gateway": gateway_name,
            "created": result.created,
            "updated": result.updated,
            "skipped": result.skipped,
            "errors": len(result.errors),
            "error_details": [
                {"import_ref": ref, "message": msg} for ref, msg in (result.errors or [])
            ],
        }
    except CMSError as exc:
        return {"gateway": gateway_name, "error": str(exc)}


# ── Tools ────────────────────────────────────────────────────────────────


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
        lines.append(
            f"- **{name}**  "
            f"service=`{svc}`  block=`{bt}`  "
            f"auto_publish={auto}  immutable={imm}"
        )
    return "\n".join(lines)


@mcp.tool()
async def sync_gateway(gateway_name: str) -> str:
    """
    Run a full sync for a named gateway.

    Discovers external service data (Spotify liked songs, iNaturalist field
    trips, etc.) and upserts it as CMS documents. Call ``list_gateways`` first
    to see available gateway names.

    Args:
        gateway_name: The entry-point name of the gateway, e.g.
            ``spotify-liked-dump`` or ``inaturalist-field-trips``.
    """
    client = _get_client()
    try:
        result = await _sync_gateway_inner(gateway_name, client)
    finally:
        await client.close()

    if "error" in result:
        return f"❌ {result['error']}"

    parts = [
        f"✅ Synced **{result['gateway']}**",
        f"  • Created: {result['created']}",
        f"  • Updated: {result['updated']}",
        f"  • Skipped: {result['skipped']}",
        f"  • Errors: {result['errors']}",
    ]
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
    import json

    client = _get_client()
    try:
        data = await client.list_documents(doc_type=block_type, limit=limit)
    finally:
        await client.close()

    docs = data.get("documents", [])
    total = data.get("total", 0)
    text = (
        f"{total} document(s) of type {block_type!r} "
        f"(showing {len(docs)}):\n"
        + json.dumps(docs, indent=2, default=str)
    )
    return text


# ── Entry point ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Gateway MCP server")
    parser.add_argument("--port", type=int, default=8003, help="HTTP port")
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Bind address",
    )
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="streamable-http",
    )
    args = parser.parse_args()

    if args.transport in ("sse", "streamable-http"):
        mcp.settings.host = args.host
        mcp.settings.port = args.port

    mcp.run(transport=args.transport)