#!/usr/bin/env bash
# restore-db.sh — Restore a CMS SQLite database from a .db.gz backup file
#                 into a running Docker container via docker cp.
# Runs on the EC2 instance.
#
# Usage:
#   ./scripts/restore-db.sh <backup-file.db.gz> <container-name>
#
# Examples:
#   # Restore latest backup into staging
#   ./scripts/restore-db.sh ~/backups/latest.db.gz joellithgow-cms-staging-1
#
#   # Restore a specific backup into staging
#   ./scripts/restore-db.sh ~/backups/content-20260705-120000.db.gz joellithgow-cms-staging-1

set -euo pipefail

BACKUP_FILE="${1:-}"
CONTAINER="${2:-}"
DB_PATH="/app/joellithgow/cms/data/content.db"
TMP_DB="/tmp/restore-$$.db"

if [[ -z "$BACKUP_FILE" || -z "$CONTAINER" ]]; then
  echo "Usage: $0 <backup-file.db.gz> <container-name>" >&2
  echo "Example containers: joellithgow-cms-staging-1  joellithgow-cms-prod-1" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Error: backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

echo "🔄 Restoring $BACKUP_FILE into $CONTAINER..."

# Decompress to a temp file, copy into the container, then clean up
gunzip -c "$BACKUP_FILE" > "$TMP_DB"
docker cp "$TMP_DB" "$CONTAINER:$DB_PATH"
rm -f "$TMP_DB"

echo "✅ Restore complete → $CONTAINER:$DB_PATH"
