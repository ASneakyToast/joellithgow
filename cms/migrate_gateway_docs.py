"""
One-off migration of gateway-synced documents to the curated, one-outing-per-place shape.

What it does, per document:

  inaturalist_outing
    * discards the stray draft revision a gateway sync left on the published doc
    * replaces the raw ~35 KB-per-observation payload with the curated fields the
      gateway now stores, and drops the stray ``draft`` key
    * re-keys a day that holds several places into one document per outing; the
      document that holds most of an outing's observations keeps its ref, slug and
      URL, and a new document gets ``nature-outing-YYYY-MM-DD-2`` and so on
    * stores the content hash the gateway will compute, so the next sync is a no-op
  spotify_liked_dump
    * discards stray gateway drafts and stores the new content hash. Payloads are
      already curated, so the body is not rewritten.

It works offline from what is already stored: no iNaturalist or Spotify call. Run an
``all_time`` gateway sync afterwards to pick up anything the stored data lacks.

Safety:
  * Dry run unless ``--apply`` is given. The dry run writes nothing and prints, per
    document, what would change, including what each pending draft differs by.
  * A draft is discarded only when everything it changes is a gateway-owned field. A
    draft that touches a human field (title, tags, notes, ...) is reported and the
    document is left entirely alone.
  * ``--apply`` against cms.joellithgow.com also needs ``--allow-prod``. Develop and
    check against a local restore of the Litestream replica first, and confirm a
    fresh snapshot exists before the prod run.
  * All writes go in one changeset, published at the end, so the history shows them
    as a single "gateway migration".

Usage:
    uv run python -m cms.migrate_gateway_docs --cms-url http://localhost:8001
    uv run python -m cms.migrate_gateway_docs --cms-url http://localhost:8001 --apply
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlsplit

from starlette_cms_gateways.base import GatewayItem
from starlette_cms_gateways.client import CMSClient

from cms.gateways.inaturalist_field_trips import (
    INaturalistFieldTripsGateway,
    assign_outing_keys,
    build_outing_item,
    cluster_observations,
    dominant_place,
    existing_outing,
    is_curated,
)
from cms.gateways.spotify_liked_dump import SpotifyLikedDumpGateway

OUTING = INaturalistFieldTripsGateway.block_type
DUMP = SpotifyLikedDumpGateway.block_type
OUTING_OWNED = set(INaturalistFieldTripsGateway.owned_fields)
DUMP_OWNED = set(SpotifyLikedDumpGateway.owned_fields)
PROD_HOST = "cms.joellithgow.com"
STRAY_KEY = "draft"


# ---------------------------------------------------------------------------
# Plan
# ---------------------------------------------------------------------------


@dataclass
class Action:
    """What to do to one document (or, for ``create``, one new document)."""

    kind: str  # update | create | clean | blocked | noop
    doc_type: str
    import_ref: str
    doc_id: str | None = None
    slug: str = ""
    discard_draft: bool = False
    body_patch: dict[str, Any] = field(default_factory=dict)
    meta_hash: str | None = None
    new_item: GatewayItem | None = None
    notes: list[str] = field(default_factory=list)


def _norm(value: Any) -> Any:
    """Round-trip through JSON so 2 and 2.0, tuples and lists compare as stored."""
    return json.loads(json.dumps(value, sort_keys=True))


def draft_verdict(
    published: dict[str, Any], draft: dict[str, Any] | None, owned: set[str]
) -> tuple[str, list[str]]:
    """
    ``("none"|"gateway-only"|"human-edits", fields_that_differ)``.

    A draft is the gateway's when every field it changes is one the gateway owns
    (or the stray ``draft`` key). Anything else might be a person's unpublished work.
    """
    if not draft:
        return "none", []
    keys = set(published) | set(draft)
    differing = sorted(
        k for k in keys if _norm(published.get(k)) != _norm(draft.get(k)) and k != STRAY_KEY
    )
    human = [k for k in differing if k not in owned]
    return ("human-edits" if human else "gateway-only"), differing


def _meta(doc: dict[str, Any]) -> dict[str, Any]:
    meta = doc.get("meta") or {}
    return json.loads(meta) if isinstance(meta, str) else meta


def _holds_raw(doc: dict[str, Any]) -> bool:
    obs = [o for o in (doc.get("body") or {}).get("observations") or [] if isinstance(o, dict)]
    return any(not is_curated(o) for o in obs)


def _auto_title(obs_group: list[dict[str, Any]], day: str) -> str:
    return dominant_place(obs_group) or day


def plan_outings(
    docs: list[dict[str, Any]], drafts: dict[str, dict[str, Any] | None]
) -> list[Action]:
    """Plan the outing migration from the stored documents and their draft bodies."""
    by_day: dict[str, list[dict[str, Any]]] = {}
    for doc in docs:
        parsed = existing_outing(doc)
        day = parsed[0] if parsed else (doc.get("body") or {}).get("outing_date") or "?"
        by_day.setdefault(day, []).append(doc)

    actions: list[Action] = []
    for day in sorted(by_day):
        day_docs = by_day[day]
        existing = [e[1] for d in day_docs if (e := existing_outing(d)) is not None]
        # Only documents still holding iNaturalist's raw payload are rebuilt. A curated
        # record no longer carries the taxon, photos and position the rebuild reads, so
        # rebuilding from it would wipe species_list, photo_urls and bounding_box.
        # Already-migrated documents are only cleaned (draft, stray key).
        raw_docs = [d for d in day_docs if _holds_raw(d)]
        all_obs = [
            o
            for d in raw_docs
            for o in (d.get("body") or {}).get("observations") or []
            if isinstance(o, dict)
        ]
        clusters = cluster_observations(all_obs) if all_obs else []
        keys = assign_outing_keys(day, clusters, existing) if clusters else []
        by_ref = {ref: (cluster, slug) for cluster, (ref, slug) in zip(clusters, keys, strict=True)}
        doc_refs = {d["import_ref"] for d in day_docs}

        for doc in day_docs:
            ref = doc["import_ref"]
            body = doc.get("body") or {}
            action = Action("noop", OUTING, ref, doc["id"], doc.get("slug", ""))
            verdict, differing = draft_verdict(body, drafts.get(doc["id"]), OUTING_OWNED)
            if verdict == "human-edits":
                action.kind = "blocked"
                action.notes.append(
                    f"pending draft changes human fields {differing}: left alone, decide by hand"
                )
                actions.append(action)
                continue
            if verdict == "gateway-only":
                action.discard_draft = True
                action.notes.append(f"discard gateway draft (differs in {differing})")
            if STRAY_KEY in body:
                action.notes.append(f"drop stray {STRAY_KEY!r} key")

            if ref in by_ref and doc in raw_docs:
                cluster, _ = by_ref[ref]
                item = build_outing_item(day, ref, doc.get("slug", ""), cluster)
                target = item.owned_body(INaturalistFieldTripsGateway.owned_fields)
                stale = {
                    k: v for k, v in target.items() if _norm(body.get(k)) != _norm(v)
                }
                if stale:
                    action.body_patch.update(target)
                    action.notes.append(
                        f"curate payload ({len(body.get('observations') or [])} raw → "
                        f"{len(cluster)} slim observations; changes {sorted(stale)})"
                    )
                if len(clusters) > 1:
                    if body.get("title") != _auto_title(all_obs, day):
                        action.notes.append(
                            f"day splits into {len(clusters)} outings; title was hand-edited, kept"
                        )
                    elif body.get("title") != item.body["title"]:
                        action.body_patch.update(
                            title=item.body["title"], place_guess=item.body["place_guess"]
                        )
                        action.notes.append(
                            f"day splits into {len(clusters)} outings; "
                            f"retitle to {item.body['title']!r}"
                        )
                    else:
                        action.notes.append(f"day splits into {len(clusters)} outings")
                new_hash = item.content_hash(INaturalistFieldTripsGateway.owned_fields)
                if _meta(doc).get("content_hash") != new_hash:
                    action.meta_hash = new_hash
            elif doc in raw_docs:
                action.notes.append("no cluster maps to this document; owned fields left as they are")

            if action.discard_draft or action.body_patch or action.meta_hash or STRAY_KEY in body:
                action.kind = "update" if (action.body_patch or action.meta_hash) else "clean"
            actions.append(action)

        for cluster, (ref, slug) in zip(clusters, keys, strict=True):
            if ref in doc_refs:
                continue
            item = build_outing_item(day, ref, slug, cluster)
            actions.append(
                Action(
                    "create", OUTING, ref, slug=slug, new_item=item,
                    notes=[f"new outing split from {day}: {len(cluster)} observations at {item.body['title']!r}"],
                )
            )
    return actions


def plan_dumps(
    docs: list[dict[str, Any]], drafts: dict[str, dict[str, Any] | None]
) -> list[Action]:
    """Plan the Spotify check: drafts, stored hash, and slug/publish_date stability."""
    actions: list[Action] = []
    for doc in sorted(docs, key=lambda d: d.get("import_ref", "")):
        ref = doc.get("import_ref") or ""
        body = doc.get("body") or {}
        month = ref.removeprefix("spotify:dump:")
        action = Action("noop", DUMP, ref, doc["id"], doc.get("slug", ""))

        if doc.get("slug") != f"spotify-dump-{month}":
            action.notes.append(f"WARN slug {doc.get('slug')!r} != spotify-dump-{month}")
        if body.get("publish_date") != f"{month}-01":
            action.notes.append(f"WARN publish_date {body.get('publish_date')!r} != {month}-01")
        extra = {k for s in body.get("songs") or [] for k in s} - {
            "track_name", "artist_name", "album_name", "album_art_url", "spotify_url", "liked_at",
        }
        if extra:
            action.notes.append(f"WARN songs carry uncurated keys {sorted(extra)}")
        if STRAY_KEY in body:
            action.notes.append(f"drop stray {STRAY_KEY!r} key")

        verdict, differing = draft_verdict(body, drafts.get(doc["id"]), DUMP_OWNED)
        if verdict == "human-edits":
            action.kind = "blocked"
            action.notes.append(f"pending draft changes human fields {differing}: left alone")
            actions.append(action)
            continue
        if verdict == "gateway-only":
            action.discard_draft = True
            action.notes.append(f"discard gateway draft (differs in {differing})")

        songs = body.get("songs") or []
        owned = {"songs": songs, "song_count": float(len(songs))}
        new_hash = GatewayItem("", "", owned).content_hash(SpotifyLikedDumpGateway.owned_fields)
        if _meta(doc).get("content_hash") != new_hash:
            action.meta_hash = new_hash
            action.notes.append("store the new content hash")
        if action.discard_draft or action.meta_hash or STRAY_KEY in body:
            action.kind = "update" if action.meta_hash or STRAY_KEY in body else "clean"
        actions.append(action)
    return actions


# ---------------------------------------------------------------------------
# IO
# ---------------------------------------------------------------------------


async def load(client: CMSClient, doc_type: str) -> tuple[list[dict], dict[str, dict | None]]:
    """All documents of a type, and each one's pending draft body (None if none)."""
    docs: list[dict] = []
    offset = 0
    while True:
        page = await client.list_documents(doc_type=doc_type, limit=100, offset=offset)
        batch = page.get("documents", [])
        docs += batch
        offset += len(batch)
        if not batch or offset >= page.get("total", 0):
            break
    drafts: dict[str, dict | None] = {}
    http = client._get_http()
    for doc in docs:
        if not doc.get("has_draft"):
            drafts[doc["id"]] = None
            continue
        resp = await http.get(
            f"{client.base_url}/api/documents/{doc['id']}",
            params={"draft": "true"},
            headers=client._auth_headers(),
        )
        resp.raise_for_status()
        drafts[doc["id"]] = resp.json().get("body")
    return docs, drafts


async def apply(client: CMSClient, actions: list[Action]) -> str | None:
    """Write the plan, in one changeset published at the end. Returns its id."""
    todo = [a for a in actions if a.kind in ("update", "clean", "create")]
    if not todo:
        return None
    cs_id = await client.create_changeset("gateway migration — curated payloads, one outing per place")
    for a in todo:
        if a.kind == "create":
            assert a.new_item is not None
            await client.create_document(
                doc_type=a.doc_type,
                slug=a.slug,
                body=a.new_item.body,
                import_ref=a.import_ref,
                meta={
                    "content_hash": a.new_item.content_hash(INaturalistFieldTripsGateway.owned_fields),
                    "title": a.new_item.title,
                },
                changeset_id=cs_id,
            )
            continue
        assert a.doc_id is not None
        if a.discard_draft:
            await client.discard_draft(a.doc_id)
        # Always PATCH, even with an empty body: the CMS re-validates the merged body
        # and drops any key the model does not know, which is what removes the stray
        # ``draft`` key.
        await client.update_document(
            a.doc_id,
            body=a.body_patch,
            meta={"content_hash": a.meta_hash} if a.meta_hash else None,
            changeset_id=cs_id,
        )
    await client.publish_changeset(cs_id)
    return cs_id


async def verify(client: CMSClient) -> list[str]:
    """Problems that remain after (or before) a migration. Empty means clean."""
    problems: list[str] = []
    for doc_type in (OUTING, DUMP):
        docs, _ = await load(client, doc_type)
        for d in docs:
            body = d.get("body") or {}
            ref = d.get("import_ref")
            if d.get("has_draft"):
                problems.append(f"{doc_type} {ref}: pending draft")
            if STRAY_KEY in body:
                problems.append(f"{doc_type} {ref}: stray {STRAY_KEY!r} key")
            if doc_type == OUTING:
                if body.get("publish_date") != body.get("outing_date"):
                    problems.append(f"{ref}: publish_date != outing_date")
                observed = {o.get("observed_on") for o in body.get("observations") or [] if isinstance(o, dict)}
                if observed and observed != {body.get("outing_date")}:
                    problems.append(f"{ref}: outing_date {body.get('outing_date')} but observations on {sorted(observed)}")
                raw = [o for o in body.get("observations") or [] if isinstance(o, dict) and "comments" in o]
                if raw:
                    problems.append(f"{ref}: still holds {len(raw)} raw observation payloads")
    return problems


def render(actions: list[Action]) -> str:
    lines: list[str] = []
    for a in actions:
        if a.kind == "noop" and not a.notes:
            continue
        lines.append(f"[{a.kind.upper():7}] {a.doc_type} {a.import_ref} ({a.slug})")
        lines += [f"           - {n}" for n in a.notes]
    counts: dict[str, int] = {}
    for a in actions:
        counts[a.kind] = counts.get(a.kind, 0) + 1
    lines.append("")
    lines.append("summary: " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    return "\n".join(lines)


async def run(
    cms_url: str,
    api_key: str | None,
    do_apply: bool,
    allow_prod: bool,
    *,
    client: CMSClient | None = None,
) -> int:
    host = urlsplit(cms_url).hostname or ""
    if do_apply and host == PROD_HOST and not allow_prod:
        print(f"refusing to --apply to {PROD_HOST} without --allow-prod", file=sys.stderr)
        return 2

    owns_client = client is None
    client = client or CMSClient(base_url=cms_url, api_key=api_key)
    try:
        outing_docs, outing_drafts = await load(client, OUTING)
        dump_docs, dump_drafts = await load(client, DUMP)
        actions = plan_outings(outing_docs, outing_drafts) + plan_dumps(dump_docs, dump_drafts)
        print(f"{'APPLY' if do_apply else 'DRY RUN'} against {cms_url}\n")
        print(render(actions))
        blocked = [a for a in actions if a.kind == "blocked"]
        if not do_apply:
            print("\nnothing written. Re-run with --apply to make these changes.")
            return 1 if blocked else 0
        cs = await apply(client, actions)
        print(f"\napplied in changeset {cs}" if cs else "\nnothing to apply")
        problems = await verify(client)
        for p in problems:
            print(f"STILL WRONG: {p}")
        print("verified clean" if not problems else f"{len(problems)} problem(s) remain")
        return 1 if (problems or blocked) else 0
    finally:
        if owns_client:
            await client.close()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cms-url", required=True)
    ap.add_argument("--api-key", default=os.environ.get("CMS_API_KEY"))
    ap.add_argument("--apply", action="store_true", help="write the changes (default: dry run)")
    ap.add_argument("--allow-prod", action="store_true", help=f"permit --apply against {PROD_HOST}")
    args = ap.parse_args()
    sys.exit(asyncio.run(run(args.cms_url, args.api_key, args.apply, args.allow_prod)))


if __name__ == "__main__":
    main()
