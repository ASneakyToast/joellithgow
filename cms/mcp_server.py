"""
MCP server entrypoint for the joellithgow CMS.

Wraps the starlette-cms MCP server (content CRUD / publish tools — thin HTTP
wrappers around the CMS API) and serves it over a chosen transport.

  - stdio (default) — local Claude Code / testing:
        uv run python -m cms.mcp_server
  - streamable-http — remote clients (the hermes content bot) via the
    cms-mcp sidecar container, fronted by nginx /mcp:
        uv run python -m cms.mcp_server --transport streamable-http --port 8002

The sidecar sets CMS_URL to the in-cluster service (http://cms-prod:8000); the
default below is the public URL so local stdio use works out of the box.
"""
import argparse
import os

from starlette_cms.mcp.server import build_mcp_server

CMS_URL = os.environ.get("CMS_URL", "https://cms.joellithgow.com")
CMS_API_KEY = os.environ.get("CMS_API_KEY")

mcp = build_mcp_server(base_url=CMS_URL, api_key=CMS_API_KEY)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="joellithgow CMS MCP server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="stdio",
        help="MCP transport (default: stdio)",
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Bind address for HTTP transports",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8002,
        help="HTTP port for SSE/streamable-http transports (default: 8002)",
    )
    args = parser.parse_args()

    if args.transport in ("sse", "streamable-http"):
        mcp.settings.host = args.host
        mcp.settings.port = args.port

    mcp.run(transport=args.transport)
