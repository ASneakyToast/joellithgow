#!/usr/bin/env bash
# backup-prod-db.sh — Create a compressed backup of the prod CMS SQLite database.
# Runs on the EC2 instance (manually or via cron).
#
# Usage:
#   ./scripts/backup-prod-db.sh
#
# Output:
#   ~/backups/content-YYYYMMDD-HHmmss.db.gz   (timestamped, raw binary)
#   ~/backups/latest.db.gz                     (symlink → latest)

set -euo pipefail

BACKUP_DIR="$HOME/backups"
CONTAINER="joellithgow-cms-prod-1"
DB_PATH="/app/joellithgow/cms/data/content.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILENAME="content-${TIMESTAMP}.db.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Backing up prod DB from container $CONTAINER..."
# Copy the raw SQLite binary out of the container and gzip it.
# docker cp outputs a tar stream; pipe through tar -xO to extract the file contents.
docker cp "$CONTAINER:$DB_PATH" - \
  | tar -xO \
  | gzip > "$BACKUP_DIR/$FILENAME"

# Update the latest symlink
ln -sf "$BACKUP_DIR/$FILENAME" "$BACKUP_DIR/latest.db.gz"

SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
echo "✅ Backup written: $BACKUP_DIR/$FILENAME ($SIZE)"
echo "🔗 Symlink updated: $BACKUP_DIR/latest.db.gz"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "content-*.db.gz" -mtime +30 -delete
