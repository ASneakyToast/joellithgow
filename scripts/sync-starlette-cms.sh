#!/usr/bin/env bash
# Sync the local starlette-cms package into the Docker build context.
# Run this after updating astraeus/packages/starlette-cms.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SRC="$REPO_ROOT/../astraeus/packages/starlette-cms"
DEST="$REPO_ROOT/starlette_cms_local"

if [ ! -d "$SRC" ]; then
  echo "Error: $SRC not found" >&2
  exit 1
fi

rm -rf "$DEST"
cp -r "$SRC" "$DEST"
echo "✅ Synced starlette-cms → starlette_cms_local/"
