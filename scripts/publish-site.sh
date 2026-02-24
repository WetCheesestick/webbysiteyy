#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/julianschnitt/Desktop/Julianschnitt.com"
REMOTE="origin"
BRANCH="main"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Error: $REPO_DIR is not a Git repository (.git missing)."
  exit 1
fi

cd "$REPO_DIR"

echo "[publish] Repo: $REPO_DIR"
echo "[publish] Syncing with $REMOTE/$BRANCH via rebase..."
git pull --rebase --autostash "$REMOTE" "$BRANCH"

echo "[publish] Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "[publish] nothing to commit"
  echo "[publish] Branch status:"
  git status -sb
  echo "[publish] Current commit: $(git rev-parse --short HEAD)"
  exit 0
fi

if [[ $# -gt 0 ]]; then
  COMMIT_MSG="$*"
else
  COMMIT_MSG="Studio publish $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "[publish] Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "[publish] Pushing to $REMOTE/$BRANCH..."
git push "$REMOTE" "$BRANCH"

echo "[publish] Done"
echo "[publish] Current commit: $(git rev-parse --short HEAD)"
echo "[publish] Branch status:"
git status -sb
