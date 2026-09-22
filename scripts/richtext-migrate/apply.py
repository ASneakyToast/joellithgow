"""Apply the body_markdown -> ProseMirror-JSON migration to the CMS SQLite DB.

Runs inside the CMS container. Reads bodymap.json (produced by compute.mjs) and
writes the converted body / draft_body straight into cms_document, bypassing
model validation on purpose: the values are dicts and the field is still typed
str until the schema flips, and the API's PATCH would only touch draft_body.

Idempotent: compute.mjs only emits docs whose body_markdown is still a string,
so re-running after a partial migration is a no-op for already-converted docs.
Piccolo JSON() columns store a JSON string, so values are json.dumps'd.

Usage (in container):
  python3 apply.py <db_path> <bodymap.json>            # dry run
  python3 apply.py <db_path> <bodymap.json> --apply     # write
"""

import json
import sqlite3
import sys

TABLE = "cms_document"


def main() -> None:
    db_path, mapfile = sys.argv[1], sys.argv[2]
    apply = "--apply" in sys.argv[3:]

    rows = json.load(open(mapfile))
    db = sqlite3.connect(db_path)

    changed = 0
    for r in rows:
        doc_id = r["id"]
        exists = db.execute(f"SELECT 1 FROM {TABLE} WHERE id = ?", (doc_id,)).fetchone()
        if not exists:
            print(f"  SKIP {doc_id} ({r.get('slug')}): no such row")
            continue

        sets, params = [], []
        if r.get("body") is not None:
            sets.append("body = ?")
            params.append(json.dumps(r["body"]))
        if r.get("draft_body") is not None:
            sets.append("draft_body = ?")
            params.append(json.dumps(r["draft_body"]))
        if not sets:
            continue

        print(f"  {'WRITE' if apply else 'would write'} {r.get('slug')} ({doc_id}): {', '.join(s.split(' =')[0] for s in sets)}")
        if apply:
            params.append(doc_id)
            db.execute(f"UPDATE {TABLE} SET {', '.join(sets)} WHERE id = ?", params)
        changed += 1

    if apply:
        db.commit()
    print(f"{'applied' if apply else 'dry run'}: {changed} docs")


if __name__ == "__main__":
    main()
