"""
One-off migration of gateway-synced documents. Three read/write steps around one sync.

The gateways used to park a draft revision on every published doc they touched, and
Spotify months before ``MONTH_FLOOR`` exist that the site no longer wants. This
cleans that up, then lets an ordinary ``all_time`` sync do the rest: it rewrites the
owned fields, stamps the new content hashes, drops the stray ``draft`` key (the CMS
drops keys its models do not know on every write), splits 2026-07-04 into its two
outings, and publishes.

    report   Read-only. Prints, and writes nothing:
               1. every gateway doc with a pending draft: the gateway's own, or a
                  person's (with the fields that differ);
               2. the pre-floor Spotify months that would be deleted;
               3. what an ``all_time`` sync would create and update (a real run of
                  both gateways against iNaturalist and Spotify, with every write
                  recorded instead of made; it assumes the gateway-only drafts of
                  step 1 are gone, as they will be);
               4. the stale open changesets earlier gateway runs left behind, and what
                  ``apply`` will do to each (see below);
               5. the webhooks the migration will fire. Prod has one that rebuilds the
                  site on every publish and delete, and the CMS does not coalesce them:
                  each deleted month and each published post is a separate build.
             ``--snapshot-out FILE`` records each doc's slug and publish_date for verify.
    apply    Step 2 and 3 of the plan: discards the gateway-only drafts (a person's
             are listed and left alone). ``--delete-pre-floor`` also deletes the
             pre-floor Spotify docs, and then needs ``--snapshot-confirmed``: say, by
             passing it, that a fresh Litestream snapshot exists. Against prod it also
             needs ``--allow-prod``. It also cleans up the open changesets that old
             gateway runs left: one that holds only gateway docs is deleted; one that
             also holds other docs just loses the gateway docs; one that holds a doc a
             person has a draft on is left alone. Only ``open`` changesets are touched
             (``review`` and ``scheduled`` ones are deliberate), and no document changes.
    verify   Read-only. Checks the result of the sync that follows apply: no gateway
             doc has a pending draft, no open changeset is left holding gateway docs
             (the sync opens none), none has a ``draft`` key or a raw iNaturalist
             payload, slugs and publish_dates match the snapshot except on days that
             split, and (unless ``--skip-sync-check``) a second ``all_time`` sync
             would write nothing. Prints the titles of every split day to check by hand.

The sync itself is not run here. After ``apply``:

    PYTHONPATH=. uv run gateways sync inaturalist-field-trips --cms-url URL --api-key KEY --range all_time
    PYTHONPATH=. uv run gateways sync spotify-liked-dump      --cms-url URL --api-key KEY --range all_time

(``PYTHONPATH=.`` because the ``gateways`` script does not have the repo root on its path,
and so cannot import ``cms``. The MCP ``sync_gateway`` tool does the same run.)

Develop against a local ``litestream restore`` of prod (credentials in jlithgow-ops
``litestream-secrets.enc.yaml``) served by a local CMS. Never against prod first.

    uv run python -m cms.migrate_gateway_docs report --cms-url http://localhost:8001 \
        --snapshot-out before.json
"""

from __future__ import annotations

import argparse
import asyncio
import collections
import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlsplit

from starlette_cms_gateways.base import BaseGateway, SyncRange
from starlette_cms_gateways.client import CMSClient
from starlette_cms_gateways.drafts import draft_verdict, norm

from cms.gateways.inaturalist_field_trips import (
    INaturalistFieldTripsGateway,
    dominant_place,
    is_curated,
)
from cms.gateways.spotify_liked_dump import MONTH_FLOOR, SpotifyLikedDumpGateway

OUTING = INaturalistFieldTripsGateway.block_type
DUMP = SpotifyLikedDumpGateway.block_type
GATEWAY_TYPES = (OUTING, DUMP)
OWNED = {
    OUTING: INaturalistFieldTripsGateway.owned_fields,
    DUMP: SpotifyLikedDumpGateway.owned_fields,
}
PROD_HOST = "cms.joellithgow.com"
STRAY_KEY = "draft"


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------


@dataclass
class DraftFinding:
    doc_type: str
    import_ref: str
    doc_id: str
    slug: str
    verdict: str  # gateway-only | human-edits
    differing: list[str]
    note: str = ""


@dataclass
class Loaded:
    docs: dict[str, list[dict[str, Any]]]
    drafts: list[DraftFinding]


async def load(client: CMSClient) -> Loaded:
    """Every gateway doc, and a verdict on each pending draft."""
    docs: dict[str, list[dict[str, Any]]] = {}
    findings: list[DraftFinding] = []
    for doc_type in GATEWAY_TYPES:
        rows: list[dict[str, Any]] = []
        offset = 0
        while True:
            page = await client.list_documents(doc_type=doc_type, limit=100, offset=offset)
            batch = page.get("documents", [])
            rows += batch
            offset += len(batch)
            if not batch or offset >= page.get("total", 0):
                break
        docs[doc_type] = rows
        for doc in rows:
            if not doc.get("has_draft"):
                continue
            ref, slug = doc.get("import_ref") or "?", doc.get("slug", "")
            if doc.get("draft_deleted") or doc.get("draft_published") is not None:
                findings.append(
                    DraftFinding(
                        doc_type, ref, doc["id"], slug, "human-edits", [],
                        "staged deletion or publish-state change",
                    )
                )
                continue
            draft = await client.get_draft_body(doc["id"])
            verdict, differing = draft_verdict(
                doc.get("body") or {}, draft, OWNED[doc_type], ignore=(STRAY_KEY,)
            )
            if verdict == "none":  # a draft equal to live, or the flags above: nothing of a person's
                verdict = "gateway-only"
            findings.append(DraftFinding(doc_type, ref, doc["id"], slug, verdict, differing))
    return Loaded(docs, findings)


def pre_floor(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Spotify docs for months before the floor."""
    return sorted(
        (d for d in docs if (d.get("import_ref") or "").removeprefix("spotify:dump:") < MONTH_FLOOR),
        key=lambda d: d.get("import_ref", ""),
    )


# ---------------------------------------------------------------------------
# What an all_time sync would do
# ---------------------------------------------------------------------------


class PreviewClient(CMSClient):
    """
    A CMS client that reads for real and records every write instead of making it.

    ``discarded`` are doc ids whose pending draft the preview treats as already
    discarded (what ``apply`` will have done before the sync runs).
    """

    def __init__(self, *args: Any, discarded: set[str] = frozenset(), **kwargs: Any) -> None:  # type: ignore[assignment]
        super().__init__(*args, **kwargs)
        self.discarded = set(discarded)
        self.writes: list[tuple[str, str]] = []
        self.created: list[tuple[str, str]] = []  # (import_ref, title)
        self.updated: dict[str, list[str]] = {}  # import_ref → fields that change
        self._seen: dict[str, dict[str, Any]] = {}  # doc id → doc

    async def find_by_import_ref(self, doc_type: str, import_ref: str) -> dict[str, Any] | None:
        doc = await super().find_by_import_ref(doc_type, import_ref)
        if doc is not None:
            if doc["id"] in self.discarded:
                doc = {**doc, "has_draft": False}
            self._seen[doc["id"]] = doc
        return doc

    async def create_changeset(self, title: str) -> str:
        self.writes.append(("changeset", title))
        return "preview"

    async def create_document(self, *, doc_type, slug, body, import_ref=None, **kwargs):  # type: ignore[no-untyped-def]
        self.writes.append(("create", import_ref or slug))
        self.created.append((import_ref or slug, body.get("title", "")))
        return {"id": f"preview-{import_ref}"}

    async def update_document(self, doc_id, *, body, **kwargs):  # type: ignore[no-untyped-def]
        doc = self._seen.get(doc_id, {})
        ref = doc.get("import_ref") or doc_id
        live = doc.get("body") or {}
        self.writes.append(("update", ref))
        self.updated[ref] = sorted(k for k, v in body.items() if norm(live.get(k)) != norm(v))
        return {"id": doc_id}

    async def publish_document(self, doc_id: str) -> dict[str, Any]:
        doc = self._seen.get(doc_id, {})
        self.writes.append(("publish", doc.get("import_ref") or doc_id))
        return {"id": doc_id}

    async def discard_draft(self, doc_id: str) -> dict[str, Any]:
        self.writes.append(("discard", doc_id))
        return {"id": doc_id}


@dataclass
class Preview:
    gateway: str
    created: list[tuple[str, str]] = field(default_factory=list)
    updated: dict[str, list[str]] = field(default_factory=dict)
    skipped: int = 0
    deferred: list[str] = field(default_factory=list)
    errors: list[tuple[str, str]] = field(default_factory=list)
    writes: int = 0


async def preview_sync(
    client: CMSClient,
    gateways: dict[str, type[BaseGateway] | BaseGateway],
    discarded: set[str] = frozenset(),  # type: ignore[assignment]
) -> list[Preview]:
    """Run each gateway ``all_time`` against *client*'s CMS without writing anything."""
    out: list[Preview] = []
    for name, gw in gateways.items():
        pc = PreviewClient(
            base_url=client.base_url,
            api_key=client._api_key,
            _http_client=client._get_http(),
            discarded=discarded,
        )
        try:
            gateway = gw(cms_client=pc) if isinstance(gw, type) else gw
        except KeyError as exc:  # a credential env var is missing: preview the other gateway anyway
            out.append(Preview(name, errors=[("-", f"{exc} is not set, so this gateway was not previewed")]))
            continue
        gateway._client = pc  # an injected instance must write nowhere, too
        result = await gateway.sync(SyncRange("all_time"))
        out.append(
            Preview(
                name, pc.created, pc.updated, result.skipped, result.deferred, result.errors,
                len(pc.writes),
            )
        )
    return out


# ---------------------------------------------------------------------------
# Stale changesets
# ---------------------------------------------------------------------------


@dataclass
class ChangesetPlan:
    """What to do to one open changeset that earlier gateway runs left behind."""

    id: str
    title: str
    action: str  # delete | unlink | keep
    gateway_docs: list[str]  # ids of the gateway docs in it
    others: int = 0  # documents in it that are not gateway docs
    note: str = ""


# The title a gateway run gave its own changeset (BaseGateway.sync): "<service> sync — <date>".
RUN_TITLE_MARKERS = tuple(f"{t} sync" for t in (INaturalistFieldTripsGateway.service_name, SpotifyLikedDumpGateway.service_name))


async def plan_changesets(client: CMSClient, loaded: Loaded) -> list[ChangesetPlan]:
    """
    The open changesets to clean up. Judged as if ``apply`` had already discarded the
    gateway-only drafts, so a changeset is only kept for a doc a *person* has a draft on.
    """
    blocked = {f.doc_id for f in loaded.drafts if f.verdict == "human-edits"}
    resp = await client._get_http().get(
        f"{client.base_url}/api/changesets",
        params={"status": "open", "include_documents": "true"},
        headers=client._auth_headers(),
    )
    resp.raise_for_status()
    plans: list[ChangesetPlan] = []
    for cs in resp.json().get("changesets", []):
        docs = cs.get("documents", [])
        mine = [d["id"] for d in docs if d.get("doc_type") in GATEWAY_TYPES]
        others = len(docs) - len(mine)
        if not mine:
            # Empty and named for a gateway run: debris. Anything else is not ours.
            if not docs and cs["title"].startswith(RUN_TITLE_MARKERS):
                plans.append(ChangesetPlan(cs["id"], cs["title"], "delete", [], 0, "empty"))
            continue
        if blocked & set(mine):
            plans.append(
                ChangesetPlan(cs["id"], cs["title"], "keep", mine, others,
                              "holds a doc a person has a draft on")
            )
        elif others:
            plans.append(ChangesetPlan(cs["id"], cs["title"], "unlink", mine, others))
        else:
            plans.append(ChangesetPlan(cs["id"], cs["title"], "delete", mine, 0))
    return plans


async def clean_changesets(client: CMSClient, plans: list[ChangesetPlan]) -> tuple[int, int]:
    """Carry out *plans*. Returns ``(deleted, unlinked)``. No document is touched."""
    http, deleted, unlinked = client._get_http(), 0, 0
    for plan in plans:
        base = f"{client.base_url}/api/changesets/{plan.id}"
        if plan.action == "delete":
            (await http.delete(base, headers=client._auth_headers())).raise_for_status()
            deleted += 1
        elif plan.action == "unlink":
            for doc_id in plan.gateway_docs:
                resp = await http.delete(f"{base}/documents/{doc_id}", headers=client._auth_headers())
                resp.raise_for_status()
            unlinked += 1
    return deleted, unlinked


# ---------------------------------------------------------------------------
# Webhooks
# ---------------------------------------------------------------------------

# What a migration writes, as the CMS events a webhook can subscribe to.
PUBLISH_EVENT, DELETE_EVENT = "document.published", "document.deleted"


async def active_webhooks(client: CMSClient) -> list[tuple[str, list[str]]]:
    """``(host, events)`` of each active webhook. Only the host: the URL is a secret."""
    resp = await client._get_http().get(
        f"{client.base_url}/api/webhooks", headers=client._auth_headers()
    )
    resp.raise_for_status()
    out = []
    for hook in resp.json().get("webhooks", []):
        if not hook.get("active", True):
            continue
        events = hook.get("events") or []
        if isinstance(events, str):
            events = json.loads(events)
        out.append((urlsplit(hook.get("url", "")).hostname or "?", events))
    return out


def expected_events(
    loaded: Loaded, previews: list[Preview] | None, *, delete_pre_floor: bool = True
) -> dict[str, int]:
    """How many publish and delete events the migration will fire (the sync's, if previewed)."""
    published = sum(len(p.created) + len(p.updated) for p in previews or [])
    return {
        PUBLISH_EVENT: published,
        DELETE_EVENT: len(pre_floor(loaded.docs[DUMP])) if delete_pre_floor else 0,
    }


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------


def snapshot(loaded: Loaded) -> dict[str, dict[str, Any]]:
    """What verify compares against: each gateway doc's slug and dates."""
    snap: dict[str, dict[str, Any]] = {}
    for docs in loaded.docs.values():
        for d in docs:
            body = d.get("body") or {}
            snap[d.get("import_ref") or d["id"]] = {
                "doc_type": d.get("doc_type"),
                "slug": d.get("slug"),
                "publish_date": body.get("publish_date"),
                "outing_date": body.get("outing_date"),
                "title": body.get("title"),
            }
    return snap


def render_report(
    loaded: Loaded,
    previews: list[Preview] | None,
    changesets: list[ChangesetPlan],
    hooks: list[tuple[str, list[str]]] | None = None,
) -> str:
    L: list[str] = []
    n_docs = {t: len(d) for t, d in loaded.docs.items()}
    L.append(f"gateway docs: {n_docs}")

    L += ["", "== 1. pending drafts ==="]
    own = [f for f in loaded.drafts if f.verdict == "gateway-only"]
    human = [f for f in loaded.drafts if f.verdict == "human-edits"]
    L.append(f"{len(own)} gateway-only (apply discards these), {len(human)} a person's (left alone)")
    for f in own:
        L.append(f"  gateway  {f.doc_type} {f.import_ref}: differs in {f.differing}")
    for f in human:
        L.append(
            f"  HUMAN    {f.doc_type} {f.import_ref}: differs in {f.differing} {f.note}".rstrip()
            + "   <- decide by hand: publish it or discard it"
        )

    L += ["", f"== 2. Spotify months before {MONTH_FLOOR} (apply --delete-pre-floor deletes) =="]
    old = pre_floor(loaded.docs[DUMP])
    L.append(f"{len(old)} doc(s)")
    for d in old:
        songs = len((d.get("body") or {}).get("songs") or [])
        pub = "published" if d.get("published") else "unpublished"
        L.append(f"  {d.get('import_ref')}  {d.get('slug')}  {songs} songs  {pub}")

    L += ["", "== 3. what an all_time sync would do (nothing was written) =="]
    if previews is None:
        L.append("skipped (--skip-sync-preview)")
    for p in previews or []:
        L.append(
            f"{p.gateway}: create {len(p.created)}, update {len(p.updated)}, "
            f"unchanged {p.skipped}, deferred {len(p.deferred)}, errors {len(p.errors)}"
        )
        for ref, title in p.created:
            L.append(f"  CREATE  {ref}  {title!r}")
        for ref, fields in sorted(p.updated.items()):
            tags = "   <- tags are owned now: a hand edit is overwritten" if "tags" in fields else ""
            L.append(f"  UPDATE  {ref}  {fields}{tags}")
        for ref in p.deferred:
            L.append(f"  DEFER   {ref}  (a person's draft is on it)")
        for ref, msg in p.errors:
            L.append(f"  ERROR   {ref}  {msg}")

    L += ["", "== 4. stale open changesets from old gateway runs (apply cleans these up) =="]
    L.append(
        f"{sum(c.action == 'delete' for c in changesets)} to delete, "
        f"{sum(c.action == 'unlink' for c in changesets)} to trim, "
        f"{sum(c.action == 'keep' for c in changesets)} to leave alone. No document changes."
    )
    for c in changesets:
        what = {
            "delete": f"DELETE  holds only gateway docs ({len(c.gateway_docs)})" if c.gateway_docs
            else "DELETE  empty, named for a gateway run",
            "unlink": f"TRIM    remove its {len(c.gateway_docs)} gateway doc(s); keeps {c.others} other(s)",
            "keep": f"KEEP    {c.note}",
        }[c.action]
        L.append(f"  {c.title!r} ({c.id}): {what}")

    L += ["", "== 5. webhooks this will fire =="]
    events = expected_events(loaded, previews)
    listening = [
        (host, [e for e in evs if e in events and events[e]]) for host, evs in hooks or []
    ]
    listening = [(h, evs) for h, evs in listening if evs]
    if not listening:
        L.append("no active webhook listens for the events this writes")
    for host, evs in listening:
        L.append(
            f"  {host}: " + ", ".join(f"{events[e]} x {e}" for e in evs)
            + ". The CMS sends one request per event and does not coalesce, so each can start a build."
        )
    if listening and previews is None:
        L.append("  (the publish count is 0 because the sync preview was skipped)")
    if listening:
        L.append(
            "  Decide before apply: the CMS has no way to pause a webhook (only create/delete), "
            "so either accept the builds or delete the hook, run the migration, and re-create it."
        )
    return "\n".join(L)


# ---------------------------------------------------------------------------
# Apply
# ---------------------------------------------------------------------------


async def delete_document(client: CMSClient, doc_id: str) -> None:
    resp = await client._get_http().delete(
        f"{client.base_url}/api/documents/{doc_id}", headers=client._auth_headers()
    )
    resp.raise_for_status()


async def apply(
    client: CMSClient, loaded: Loaded, *, delete_pre_floor: bool
) -> tuple[list[str], list[str], tuple[int, int]]:
    """
    Discard the gateway-only drafts, then (if asked) delete the pre-floor months, then
    clean up the changesets that held them. Returns ``(discarded, deleted, (deleted, trimmed))``.
    """
    discarded, deleted = [], []
    for f in loaded.drafts:
        if f.verdict == "gateway-only":
            await client.discard_draft(f.doc_id)
            discarded.append(f.import_ref)
    if delete_pre_floor:
        for d in pre_floor(loaded.docs[DUMP]):
            await delete_document(client, d["id"])
            deleted.append(d["import_ref"])
    # After the deletes: a deleted month is no longer in any changeset.
    cleaned = await clean_changesets(client, await plan_changesets(client, loaded))
    return discarded, deleted, cleaned


# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------


def split_days(outings: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Days with more than one outing document."""
    by_day: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    for d in outings:
        by_day[(d.get("body") or {}).get("outing_date") or "?"].append(d)
    return {day: ds for day, ds in by_day.items() if len(ds) > 1}


def verify_problems(
    loaded: Loaded,
    before: dict[str, dict[str, Any]] | None,
    previews: list[Preview] | None,
    changesets: list[ChangesetPlan] | None = None,
) -> tuple[list[str], list[str]]:
    """``(problems, notes)``. Problems fail the verify; notes are for a person to read."""
    problems: list[str] = []
    notes: list[str] = []
    for f in loaded.drafts:
        problems.append(f"{f.doc_type} {f.import_ref}: pending draft ({f.verdict})")
    for c in changesets or []:
        if c.action == "keep":
            notes.append(f"changeset {c.title!r} still holds a doc a person has a draft on")
        else:
            problems.append(f"open changeset {c.title!r} ({c.id}) is left over: {c.action}")
    for doc_type, docs in loaded.docs.items():
        for d in docs:
            body = d.get("body") or {}
            ref = d.get("import_ref")
            if STRAY_KEY in body:
                problems.append(f"{doc_type} {ref}: stray {STRAY_KEY!r} key")
            if doc_type == OUTING:
                obs = [o for o in body.get("observations") or [] if isinstance(o, dict)]
                if any(not is_curated(o) for o in obs):
                    problems.append(f"{ref}: still holds a raw iNaturalist payload")
    if pre_floor(loaded.docs[DUMP]):
        problems.append(f"{len(pre_floor(loaded.docs[DUMP]))} Spotify month(s) before {MONTH_FLOOR} remain")

    split = split_days(loaded.docs[OUTING])
    if before is not None:
        for d in loaded.docs[OUTING] + loaded.docs[DUMP]:
            ref = d.get("import_ref")
            was = before.get(ref)
            if was is None:
                continue
            body = d.get("body") or {}
            for key, now in (("slug", d.get("slug")), ("publish_date", body.get("publish_date"))):
                if was.get(key) != now and (body.get("outing_date") not in split):
                    problems.append(f"{ref}: {key} changed {was.get(key)!r} → {now!r}")
        created = set(snapshot(loaded)) - set(before)
        notes.append(f"{len(created)} doc(s) are new since the snapshot: {sorted(created)}")

    for day, docs in sorted(split.items()):
        notes.append(f"{day} split into {len(docs)} outings. Check the titles by hand:")
        for d in sorted(docs, key=lambda x: x.get("import_ref", "")):
            body = d.get("body") or {}
            obs = [o for o in body.get("observations") or [] if isinstance(o, dict)]
            notes.append(
                f"    {d.get('import_ref')}  slug={d.get('slug')}  title={body.get('title')!r}  "
                f"obs={len(obs)}  actually at: {dominant_place(obs) or '(no place)'!r}"
            )
    for p in previews or []:
        if p.writes:
            problems.append(f"a second all_time sync of {p.gateway} would still write {p.writes} time(s)")
        for ref, fields in sorted(p.updated.items()):
            problems.append(f"  would update {ref}: {fields}")
        for ref in p.deferred:
            problems.append(f"  would defer {ref}")
        for ref, msg in p.errors:
            problems.append(f"  would error on {ref}: {msg}")
    return problems, notes


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def real_gateways() -> dict[str, BaseGateway]:
    """The two gateways, built from the environment. Raises KeyError without credentials."""
    from starlette_cms_gateways.discovery import discover_gateways

    found = discover_gateways()
    return {name: cls for name, cls in found.items() if name in ("inaturalist-field-trips", "spotify-liked-dump")}  # type: ignore[misc]


async def run(args: argparse.Namespace, *, client: CMSClient | None = None, gateways=None) -> int:  # type: ignore[no-untyped-def]
    host = urlsplit(args.cms_url).hostname or ""
    if args.command == "apply" and host == PROD_HOST and not args.allow_prod:
        print(f"refusing to apply to {PROD_HOST} without --allow-prod", file=sys.stderr)
        return 2
    if args.command == "apply" and args.delete_pre_floor and not args.snapshot_confirmed:
        print(
            "refusing to delete without --snapshot-confirmed: take a fresh Litestream snapshot "
            "first and pass the flag to say you did",
            file=sys.stderr,
        )
        return 2

    owns = client is None
    client = client or CMSClient(base_url=args.cms_url, api_key=args.api_key)
    try:
        loaded = await load(client)

        async def maybe_preview(discarded: set[str]) -> list[Preview] | None:
            if getattr(args, "skip_sync_preview", False) or getattr(args, "skip_sync_check", False):
                return None
            gws = gateways if gateways is not None else real_gateways()
            return await preview_sync(client, gws, discarded)

        if args.command == "report":
            discarded = {f.doc_id for f in loaded.drafts if f.verdict == "gateway-only"}
            previews = await maybe_preview(discarded)
            print(f"REPORT against {args.cms_url} (nothing is written)\n")
            print(
                render_report(
                    loaded,
                    previews,
                    await plan_changesets(client, loaded),
                    await active_webhooks(client),
                )
            )
            if args.snapshot_out:
                with open(args.snapshot_out, "w") as f:
                    json.dump(snapshot(loaded), f, indent=1, sort_keys=True)
                print(f"\nsnapshot written to {args.snapshot_out}")
            return 0

        if args.command == "apply":
            print(f"APPLY against {args.cms_url}")
            discarded, deleted, (cs_deleted, cs_trimmed) = await apply(
                client, loaded, delete_pre_floor=args.delete_pre_floor
            )
            print(f"discarded {len(discarded)} gateway draft(s)")
            print(f"changesets: deleted {cs_deleted}, trimmed {cs_trimmed}")
            human = [f for f in loaded.drafts if f.verdict == "human-edits"]
            for f in human:
                print(f"  left alone (a person's draft): {f.import_ref} differs in {f.differing}")
            print(f"deleted {len(deleted)} pre-floor Spotify doc(s)")
            print(
                "\nnext: run one all_time sync per gateway (see this module's docstring), "
                "then `verify`."
            )
            return 1 if human else 0

        if args.command == "verify":
            before = None
            if args.snapshot:
                with open(args.snapshot) as f:
                    before = json.load(f)
            problems, notes = verify_problems(
                loaded, before, await maybe_preview(set()), await plan_changesets(client, loaded)
            )
            for n in notes:
                print(n)
            for p in problems:
                print(f"STILL WRONG: {p}")
            print("verified clean" if not problems else f"{len(problems)} problem(s)")
            return 1 if problems else 0
        raise AssertionError(args.command)
    finally:
        if owns:
            await client.close()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="command", required=True)
    for name in ("report", "apply", "verify"):
        p = sub.add_parser(name)
        p.add_argument("--cms-url", required=True)
        p.add_argument("--api-key", default=os.environ.get("CMS_API_KEY"))
    sub.choices["report"].add_argument("--snapshot-out", metavar="FILE")
    sub.choices["report"].add_argument("--skip-sync-preview", action="store_true")
    a = sub.choices["apply"]
    a.add_argument("--delete-pre-floor", action="store_true")
    a.add_argument("--snapshot-confirmed", action="store_true")
    a.add_argument("--allow-prod", action="store_true", help=f"permit apply against {PROD_HOST}")
    v = sub.choices["verify"]
    v.add_argument("--snapshot", metavar="FILE")
    v.add_argument("--skip-sync-check", action="store_true")
    sys.exit(asyncio.run(run(ap.parse_args())))


if __name__ == "__main__":
    main()
