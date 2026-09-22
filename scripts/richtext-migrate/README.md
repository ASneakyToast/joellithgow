# body_markdown → RichTextField migration

One-time migration converting blog_post `body_markdown` from a Markdown string
to ProseMirror JSON, so the live editor gets true WYSIWYG + collaborative
editing (ADR 018/019). Reversible: ProseMirror JSON serializes back to Markdown.

Two halves, kept separate on purpose:

- **`compute.mjs`** — runs on a workstation, READS the CMS, and reuses the
  editor's exact converter (prosemirror-markdown, basic+lists schema) so stored
  JSON matches what the editor round-trips. GFM tables are HTML-ified first
  (the basic schema has no table node); raw HTML the author embedded survives
  as text and renders via `marked`.
- **`apply.py`** — runs in the CMS container, writes the converted body /
  draft_body straight into SQLite. Bypasses model validation deliberately: the
  API's PATCH targets only draft_body, the wrong place for migrating a
  published body.

## Run (staging first, then prod)

```bash
# 1. Back up first (prod: `make backup`).
# 2. Compute against the target CMS:
cd scripts/richtext-migrate
node compute.mjs https://cms-staging.joellithgow.com "$KEY" > bodymap.json
# 3. Copy in and dry-run, then apply:
docker cp bodymap.json <container>:/tmp/bodymap.json
docker cp apply.py <container>:/tmp/apply.py
docker exec <container> python3 /tmp/apply.py /app/joellithgow/cms/data/content.db /tmp/bodymap.json
docker exec <container> python3 /tmp/apply.py /app/joellithgow/cms/data/content.db /tmp/bodymap.json --apply
```

Then flip `cms/schema.py` body_markdown to `RichTextField` and restart the
container (cms/ is volume-mounted, so no image rebuild).
