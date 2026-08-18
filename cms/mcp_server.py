"""
MCP server entrypoint for the joellithgow CMS.

Runs the starlette-cms MCP server pointed at the live Astraeus instance.

Usage (stdio transport, for Claude Code):
    uv run python -m cms.mcp_server
"""
import os
from starlette_cms.mcp.server import build_mcp_server

CMS_URL = os.environ.get("CMS_URL", "https://cms.joellithgow.com")
CMS_API_KEY = os.environ.get("CMS_API_KEY")

mcp = build_mcp_server(base_url=CMS_URL, api_key=CMS_API_KEY)

if __name__ == "__main__":
    mcp.run(transport="stdio")
