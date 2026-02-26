#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/julianschnitt/Desktop/Julianschnitt.com"
PORT="8000"
STUDIO_URL="http://localhost:${PORT}/studio-8391.html"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Error: $REPO_DIR is not a Git repository (.git missing)."
  exit 1
fi

cd "$REPO_DIR"

REQUIRED_FILES=(
  "studio-8391.html"
  "assets/js/studio.js"
  "serve_with_cors.py"
)

for required in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$required" ]]; then
    echo "Error: Required Studio file missing: $REPO_DIR/$required"
    exit 1
  fi
done

echo "[studio] Repo: $REPO_DIR"
echo "[studio] URL: $STUDIO_URL"

if lsof -tiTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[studio] Port ${PORT} is already in use."
  echo "[studio] Studio is likely already running: $STUDIO_URL"
  echo "[studio] If needed, stop old server: pkill -f serve_with_cors.py"
  exit 0
fi

echo "[studio] Starting local server..."
python3 serve_with_cors.py
