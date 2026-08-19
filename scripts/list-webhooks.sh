#!/usr/bin/env bash
# List CMS webhook rows (url + events + active) across the EC2 containers.
# Read-only: selects from the cms_webhook table in each container's content.db.
# Usage: bash scripts/list-webhooks.sh   (run on EC2, or via `make webhooks`)
set -euo pipefail

DB="/app/joellithgow/cms/data/content.db"

for container in joellithgow-cms-prod-1 joellithgow-cms-staging-1; do
	echo "== ${container} =="
	docker exec -i "${container}" python - "${DB}" <<'PY' 2>/dev/null || echo "  (container/db unavailable)"
import os
import sqlite3
import sys

path = sys.argv[1]

# Never create the DB: bail if the file is missing, and open read-only.
if not os.path.exists(path):
    print("  (no content.db)")
    raise SystemExit

con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)

# Guard: the table only exists once the CMS has initialised its schema.
exists = con.execute(
    "select name from sqlite_master where type='table' and name='cms_webhook'"
).fetchone()
if not exists:
    print("  (no cms_webhook table)")
    raise SystemExit

rows = list(con.execute("select id, url, events, active from cms_webhook"))
if not rows:
    print("  (no webhooks registered)")
for row_id, url, events, active in rows:
    flag = "active" if active else "inactive"
    print(f"  [{flag}] {url}  events={events}  id={row_id}")
PY
done
