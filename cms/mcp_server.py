"""
MCP server entrypoint for the joellithgow CMS.

This runs ON the EC2 as a sidecar (or embedded in the CMS container).
It exposes TWO categories of tools:

  1. **Content tools** — thin HTTP wrappers around the CMS API
     (from starlette_cms.mcp.server). These let Hermes create, read,
     update, publish, and delete documents.

  2. **SRE / operations tools** — local commands for backup, health,
     migrations, and DB management. These let Hermes do day-2 ops
     without SSH or SSM.

Usage (streamable-http, for Hermes native MCP client):
    uv run python -m cms.mcp_server --transport streamable-http --port 8002

Usage (stdio, for Claude Code / testing):
    uv run python -m cms.mcp_server
"""

from __future__ import annotations

import os
import platform
import subprocess
from datetime import UTC, datetime
from pathlib import Path

from starlette_cms.mcp.server import build_mcp_server

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Pointed at the local CMS container (Docker Compose internal network).
CMS_URL = os.environ.get("CMS_URL", "http://cms-prod:8000")
CMS_API_KEY = os.environ.get("CMS_API_KEY", "")

# Paths inside the Docker container
DATA_DIR = Path("/app/joellithgow/cms/data")
DB_PATH = DATA_DIR / "content.db"
BACKUP_DIR = DATA_DIR / "backups"

S3_BUCKET = os.environ.get("CMS_S3_BUCKET", "")
S3_PREFIX = os.environ.get("CMS_S3_PREFIX", "cms-backups")

# ---------------------------------------------------------------------------
# Build the combined MCP server
# ---------------------------------------------------------------------------

# Content tools (proxy to CMS HTTP API)
mcp = build_mcp_server(base_url=CMS_URL, api_key=CMS_API_KEY)

# ---------------------------------------------------------------------------
# SRE / operations tools
# ---------------------------------------------------------------------------


@mcp.tool()
async def get_system_health() -> dict:
    """
    Return CMS and host health: container status, disk usage, DB size,
    and uptime.

    Designed to be called by Hermes cron for proactive monitoring, or
    on-demand when troubleshooting.
    """
    result: dict = {"status": "ok", "checks": {}}

    # DB health
    db_exists = DB_PATH.exists()
    db_size = DB_PATH.stat().st_size if db_exists else 0
    result["checks"]["database"] = {
        "exists": db_exists,
        "size_bytes": db_size,
        "size_human": _human_size(db_size),
        "path": str(DB_PATH),
    }

    # Disk
    try:
        usage = shutil_disk_usage(str(DATA_DIR))
        result["checks"]["disk"] = {
            "total_bytes": usage.total,
            "used_bytes": usage.used,
            "free_bytes": usage.free,
            "percent_used": round(usage.used / usage.total * 100, 1),
        }
    except Exception as exc:
        result["checks"]["disk"] = {"error": str(exc)}

    # Docker container check (hint: only works inside Docker)
    hostname = platform.node()
    result["hostname"] = hostname

    # Environment info
    result["cms_url"] = CMS_URL
    result["api_key_set"] = bool(CMS_API_KEY)
    result["s3_backup_configured"] = bool(S3_BUCKET)

    # Overall status
    if any(
        c.get("error")
        for c in result["checks"].values()
    ):
        result["status"] = "degraded"

    return result


@mcp.tool()
async def backup_database(to_s3: bool = True) -> dict:
    """
    Create a compressed SQLite backup.

    The backup is saved to the local backups/ directory and optionally
    uploaded to S3.  Returns the backup file path, size, and (if S3
    upload is configured and requested) the S3 key.

    S3 upload requires the ``CMS_S3_BUCKET`` environment variable and
    the ``aws`` CLI installed in the container.
    """
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    local_path = BACKUP_DIR / f"content_{timestamp}.db.gz"

    # Compress the SQLite DB
    import gzip

    if not DB_PATH.exists():
        return {"error": f"Database not found at {DB_PATH}"}

    with open(DB_PATH, "rb") as f_in:
        with gzip.open(local_path, "wb", compresslevel=6) as f_out:
            f_out.write(f_in.read())

    backup_size = local_path.stat().st_size
    result = {
        "backup_file": str(local_path),
        "size_bytes": backup_size,
        "size_human": _human_size(backup_size),
        "timestamp": timestamp,
    }

    # S3 upload
    if to_s3 and S3_BUCKET:
        s3_key = f"{S3_PREFIX}/{timestamp}/{local_path.name}"
        try:
            proc = subprocess.run(
                ["aws", "s3", "cp", str(local_path), f"s3://{S3_BUCKET}/{s3_key}"],
                capture_output=True,
                text=True,
                timeout=120,
            )
            if proc.returncode == 0:
                result["s3_upload"] = {
                    "bucket": S3_BUCKET,
                    "key": s3_key,
                    "url": f"s3://{S3_BUCKET}/{s3_key}",
                }
            else:
                result["s3_upload"] = {
                    "error": f"Upload failed: {proc.stderr.strip()}"
                }
        except Exception as exc:
            result["s3_upload"] = {"error": str(exc)}
    elif to_s3 and not S3_BUCKET:
        result["s3_upload"] = {
            "skipped": "CMS_S3_BUCKET not configured — upload to S3 skipped"
        }

    return result


@mcp.tool()
async def run_migration() -> dict:
    """
    Run any pending Piccolo database migrations.

    Executes ``piccolo migrations forwards starlette_cms`` using the
    installed Piccolo CLI.

    Safe to run multiple times — already-applied migrations are skipped.
    """
    try:
        proc = subprocess.run(
            ["piccolo", "migrations", "forwards", "starlette_cms"],
            capture_output=True,
            text=True,
            timeout=120,
            env={**os.environ, "PICCOLO_CONF": "piccolo_conf"},
        )
        return {
            "success": proc.returncode == 0,
            "output": proc.stdout.strip(),
            "errors": proc.stderr.strip(),
            "returncode": proc.returncode,
        }
    except Exception as exc:
        return {"success": False, "error": str(exc)}


@mcp.tool()
async def export_all_content(output_dir: str = "") -> dict:
    """
    Export every document in the CMS as a single JSON file suitable for
    the Astro build to consume.

    Calls the CMS API's schema endpoint to discover all document types,
    then fetches every published document of each type and assembles a
    flat JSON export.

    Pass an ``output_dir`` to write the file to a specific location
    (default: ``cms/data/`` inside the container).
    """
    import json

    import httpx

    if not output_dir:
        output_dir = str(DATA_DIR)

    out_path = Path(output_dir) / "cms-export.json"

    url = CMS_URL.rstrip("/")
    headers = {"Content-Type": "application/json"}
    if CMS_API_KEY:
        headers["Authorization"] = f"Bearer {CMS_API_KEY}"

    async with httpx.AsyncClient(base_url=url, headers=headers, timeout=60) as client:
        # Discover types
        r = await client.get("/api/schema")
        r.raise_for_status()
        schema = r.json()
        definitions = schema.get("$defs", schema.get("definitions", {}))
        doc_types = list(definitions.keys())

        # Fetch all published documents of each type
        export: dict[str, list] = {}
        for dt in doc_types:
            all_docs: list = []
            offset = 0
            while True:
                r = await client.get(
                    "/api/documents",
                    params={"type": dt, "published": "true", "limit": 100, "offset": offset},
                )
                r.raise_for_status()
                data = r.json()
                docs = data.get("documents", [])
                all_docs.extend(docs)
                if len(docs) < 100:
                    break
                offset += 100
            export[dt] = all_docs

    export["_meta"] = {
        "exported_at": datetime.now(UTC).isoformat(),
        "document_types": len(doc_types),
        "total_documents": sum(len(d) for d in export.values()),
        "cms_version": schema.get("version", "unknown"),
    }

    out_path.write_text(json.dumps(export, indent=2))

    return {
        "file": str(out_path),
        "document_types": list(export.keys()),
        "document_counts": {k: len(v) for k, v in export.items() if k != "_meta"},
        "total_documents": export["_meta"]["total_documents"],
        "file_size_bytes": out_path.stat().st_size,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _human_size(bytes_: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if bytes_ < 1024:
            return f"{bytes_:.1f}{unit}"
        bytes_ /= 1024
    return f"{bytes_:.1f}TB"


def shutil_disk_usage(path: str):
    """Disk usage via subprocess (portable across POSIX)."""
    proc = subprocess.run(
        ["df", "-B1", "--output=size,used,avail", path],
        capture_output=True, text=True, timeout=10,
    )
    lines = proc.stdout.strip().split("\n")
    if len(lines) < 2:
        raise RuntimeError(f"df output unreadable: {proc.stdout}")
    parts = lines[1].split()
    from collections import namedtuple
    DU = namedtuple("disk_usage", ("total", "used", "free"))
    return DU(int(parts[0]), int(parts[1]), int(parts[2]))


# ---------------------------------------------------------------------------
# CLI runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="joellithgow CMS MCP server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="stdio",
        help="MCP transport (default: stdio)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8002,
        help="HTTP port for SSE/streamable-http transports (default: 8002)",
    )
    parser.add_argument("--host", default="0.0.0.0", help="Bind address")
    args = parser.parse_args()

    if args.transport in ("sse", "streamable-http"):
        mcp.settings.host = args.host
        mcp.settings.port = args.port

    mcp.run(transport=args.transport)