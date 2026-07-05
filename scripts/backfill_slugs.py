"""
One-shot backfill: copy slug from body JSON into the top-level CMS slug column.

Run against the live CMS after deploying the slug system-field fix:

    CMS_URL=https://cms.joellithgow.com \
    CMS_API_KEY=<key> \
    uv run python scripts/backfill_slugs.py

Safe to re-run — skips documents that already have a top-level slug set.
"""
import os
import sys
import httpx

CMS_URL = os.environ.get("CMS_URL", "https://cms.joellithgow.com")
API_KEY = os.environ.get("CMS_API_KEY")

if not API_KEY:
    print("ERROR: CMS_API_KEY not set", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

DOC_TYPES = ["blog_post", "project_page", "experience_entry"]


def fetch_all(doc_type: str) -> list[dict]:
    resp = httpx.get(
        f"{CMS_URL}/api/documents",
        params={"type": doc_type, "limit": 200},
        headers=HEADERS,
    )
    resp.raise_for_status()
    return resp.json().get("documents", [])


def patch_slug(doc_id: str, slug: str) -> None:
    resp = httpx.patch(
        f"{CMS_URL}/api/documents/{doc_id}",
        json={"slug": slug},
        headers=HEADERS,
    )
    resp.raise_for_status()


def main() -> None:
    total_patched = 0
    total_skipped = 0

    for doc_type in DOC_TYPES:
        print(f"\n── {doc_type} ──")
        docs = fetch_all(doc_type)

        for doc in docs:
            doc_id = doc["id"]
            current_slug = doc.get("slug") or ""
            body_slug = (doc.get("body") or {}).get("slug") or ""

            if current_slug:
                print(f"  SKIP  {doc_id[:8]}  slug already set: {current_slug!r}")
                total_skipped += 1
                continue

            if not body_slug:
                print(f"  WARN  {doc_id[:8]}  no slug in body — skipping")
                total_skipped += 1
                continue

            patch_slug(doc_id, body_slug)
            print(f"  OK    {doc_id[:8]}  slug set to {body_slug!r}")
            total_patched += 1

    print(f"\nDone — {total_patched} patched, {total_skipped} skipped.")


if __name__ == "__main__":
    main()
