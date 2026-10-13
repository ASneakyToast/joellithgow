"""
MCP server for Astraeus feedback and bug reports — file, list and triage.

Runs as the cms-feedback-mcp sidecar on port 8005 (streamable-http), fronted by
the mcp-proxy at /mcp/feedback. The tools are the starlette-cms-feedback
package's, wired to this CMS; reports are stored and auth-checked by the CMS.

Usage:
    uv run python -m cms.feedback_mcp_server --transport streamable-http --port 8005
"""
from __future__ import annotations

import argparse
import os

from starlette_cms_feedback.mcp.server import build_feedback_mcp_server

CMS_URL = os.environ.get("CMS_URL", "http://cms-prod:8000")
CMS_API_KEY = os.environ.get("CMS_API_KEY", "")

mcp = build_feedback_mcp_server(CMS_URL.rstrip("/"), CMS_API_KEY or None)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="joellithgow feedback MCP server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="streamable-http",
        help="MCP transport (default: streamable-http)",
    )
    parser.add_argument("--host", default="0.0.0.0", help="Bind address for HTTP transports")
    parser.add_argument(
        "--port",
        type=int,
        default=8005,
        help="HTTP port for SSE/streamable-http transports (default: 8005)",
    )
    args = parser.parse_args()

    if args.transport in ("sse", "streamable-http"):
        mcp.settings.host = args.host
        mcp.settings.port = args.port

    mcp.run(transport=args.transport)
