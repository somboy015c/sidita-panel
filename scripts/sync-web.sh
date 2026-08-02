#!/usr/bin/env bash
# Pulls the latest site content from the sidita-admin repo into www/.
#
# Usage:
#   ./scripts/sync-web.sh
#   SOURCE_REPO=https://github.com/you/repo ./scripts/sync-web.sh
#
set -euo pipefail

SOURCE_REPO="${SOURCE_REPO:-https://github.com/somboy015c/sidita-admin.git}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main}"
WWW_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/www"
TMP_DIR="$(mktemp -d)"

echo "==> Cloning $SOURCE_REPO ($SOURCE_BRANCH)"
git clone --depth 1 --branch "$SOURCE_BRANCH" "$SOURCE_REPO" "$TMP_DIR"

echo "==> Copying web assets into $WWW_DIR"
mkdir -p "$WWW_DIR"
find "$WWW_DIR" -mindepth 1 -maxdepth 1 ! -name '.gitkeep' -exec rm -rf {} +
cp -r "$TMP_DIR"/* "$WWW_DIR"/

rm -rf "$TMP_DIR"

echo "==> Injecting app-only overrides (overrides.css, onboarding)"
OVERRIDES_DIR="$(dirname "${BASH_SOURCE[0]}")/../overrides"
cp "$OVERRIDES_DIR/overrides.css" "$WWW_DIR/overrides.css"
cp "$OVERRIDES_DIR/onboarding.css" "$WWW_DIR/onboarding.css"
cp "$OVERRIDES_DIR/onboarding.js" "$WWW_DIR/onboarding.js"
INDEX_FILE="$WWW_DIR/index.html"
if [ -f "$INDEX_FILE" ] && ! grep -q "overrides.css" "$INDEX_FILE"; then
  perl -i -pe 's{</head>}{  <link rel="stylesheet" href="overrides.css">\n  <link rel="stylesheet" href="onboarding.css">\n</head>}' "$INDEX_FILE"
fi
if [ -f "$INDEX_FILE" ] && ! grep -q "onboarding.js" "$INDEX_FILE"; then
  perl -i -pe 's{</body>}{  <script src="onboarding.js"></script>\n</body>}' "$INDEX_FILE"
fi

echo "==> Done. Review changes with 'git status', then commit and push."
echo "    (No native project to re-sync here — Electron just loads www/ directly.)"
