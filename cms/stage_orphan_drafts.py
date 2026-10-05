"""
One-off: move existing drafts that are in no changeset into the default changeset.

New drafts join "Staging" on their own (``CMS(default_changeset=...)``, set in
``cms/main.py``), but drafts that existed before that, such as posts the MCP bot made
earlier, are in no changeset. Publishing "Staging" would skip them. This finds them
and, with ``--apply``, adds them to it. It changes no document and no other changeset.

A draft is a document of one of ``--types`` (default ``blog_post``) that is unpublished
or has unpublished edits, and that no open, review or scheduled changeset holds.

    # what would move (writes nothing)
    uv run python -m cms.stage_orphan_drafts --cms-url https://cms.joellithgow.com

    # move them (needs the API key)
    uv run python -m cms.stage_orphan_drafts --cms-url https://cms.joellithgow.com \
        --api-key "$CMS_API_KEY" --apply

If no "Staging" changeset is open, ``--apply`` makes one with ``--title`` (it must match the
CMS's ``CMS_DEFAULT_CHANGESET`` for new drafts to join the same one). Run it again any time:
a draft already staged is not an orphan, so a second run finds nothing.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from dataclasses import dataclass
from typing import Any

import httpx

HELD = ("open", "review", "scheduled")
PAGE = 100


@dataclass
class Orphan:
    id: str
    doc_type: str
    slug: str
    why: str  # "new draft" | "unpublished edits"


async def _documents(http: httpx.AsyncClient, doc_type: str, **query: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    offset = 0
    while True:
        resp = await http.get(
            "/api/documents", params={"type": doc_type, "limit": PAGE, "offset": offset, **query}
        )
        resp.raise_for_status()
        page = resp.json()["documents"]
        out.extend(page)
        if len(page) < PAGE:
            return out
        offset += PAGE


async def find_orphans(http: httpx.AsyncClient, types: list[str]) -> list[Orphan]:
    """Drafts of ``types`` that no open, review or scheduled changeset holds."""
    resp = await http.get("/api/changesets", params={"include_documents": "true"})
    resp.raise_for_status()
    held = {
        d["id"]
        for cs in resp.json()["changesets"]
        if cs["status"] in HELD
        for d in cs.get("documents", [])
    }

    found: dict[str, Orphan] = {}
    for doc_type in types:
        for doc in await _documents(http, doc_type, published="false"):
            found[doc["id"]] = Orphan(doc["id"], doc_type, doc.get("slug", ""), "new draft")
        for doc in await _documents(http, doc_type, has_draft="true"):
            found.setdefault(
                doc["id"], Orphan(doc["id"], doc_type, doc.get("slug", ""), "unpublished edits")
            )
    return sorted(
        (o for o in found.values() if o.id not in held), key=lambda o: (o.doc_type, o.slug)
    )


async def default_changeset_id(http: httpx.AsyncClient, title: str) -> str:
    """The open default changeset's id, creating one called ``title`` if none is open."""
    resp = await http.get("/api/changesets/default")
    resp.raise_for_status()
    existing = resp.json().get("changeset")
    if existing:
        return existing["id"]
    resp = await http.post("/api/changesets", json={"title": title})
    resp.raise_for_status()
    return resp.json()["id"]


async def run(args: argparse.Namespace, *, http: httpx.AsyncClient | None = None) -> int:
    own = http is None
    headers = {"Authorization": f"Bearer {args.api_key}"} if args.api_key else {}
    http = http or httpx.AsyncClient(base_url=args.cms_url, headers=headers, timeout=30)
    try:
        orphans = await find_orphans(http, args.types)
        print(f"{'APPLY' if args.apply else 'REPORT'} against {args.cms_url}")
        if not orphans:
            print("No drafts outside a changeset. Nothing to do.")
            return 0
        for o in orphans:
            print(f"  {o.doc_type:<12} {o.slug:<40} {o.why}")

        if not args.apply:
            print(f"\n{len(orphans)} draft(s) would move to {args.title!r}. Pass --apply to move them.")
            return 0

        changeset_id = await default_changeset_id(http, args.title)
        moved = 0
        for o in orphans:
            resp = await http.post(f"/api/changesets/{changeset_id}/documents/{o.id}")
            if resp.status_code == 409:  # already in it
                continue
            resp.raise_for_status()
            moved += 1
        print(f"\nMoved {moved} draft(s) to {args.title!r}.")
        return 0
    finally:
        if own:
            await http.aclose()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cms-url", default=os.environ.get("CMS_URL", "https://cms.joellithgow.com"))
    ap.add_argument("--api-key", default=os.environ.get("CMS_API_KEY"))
    ap.add_argument("--types", nargs="+", default=["blog_post"], help="document types to stage")
    ap.add_argument("--title", default="Staging", help="the default changeset's title")
    ap.add_argument("--apply", action="store_true", help="move them (default: report only)")
    args = ap.parse_args()
    if args.apply and not args.api_key:
        sys.exit("--apply writes, so it needs --api-key (or CMS_API_KEY)")
    sys.exit(asyncio.run(run(args)))


if __name__ == "__main__":
    main()
