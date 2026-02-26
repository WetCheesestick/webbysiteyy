# Julian Schnitt Cinematography Reel

## Daily workflow (Studio -> GitHub)
1. Start Studio locally:
```bash
/Users/julianschnitt/Desktop/Julianschnitt.com/scripts/start-studio.sh
```
2. Open Studio:
```text
http://localhost:8000/studio-8391.html
```
3. Edit in Studio, then run one of the publish actions:
- `Publish to Folder`: writes published settings + robots tags locally.
- `Publish Live`: writes locally and runs git pull/rebase/autostash + push.
- `Rollback Published`: restores snapshot and pushes rollback commit.

## One-command Git publish behavior
`publish-site.sh` always:
- uses `/Users/julianschnitt/Desktop/Julianschnitt.com` as source of truth
- rebases first with `origin/main` (`git pull --rebase --autostash origin main`)
- stages all changes (`git add -A`)
- commits only when there are staged changes
- pushes to `origin main`
- prints final commit hash and branch status

## Studio API contract
These endpoints return a consistent response contract:
- `POST /__studio/validate`
- `POST /__studio/publish`
- `POST /__studio/publish-live`
- `POST /__studio/rollback-published`

Contract fields:
- `ok`
- `warnings`
- `checks`
- `files`
- `noindex`
- `publishingStatus`
- `commit`
- `branch`
- `status`
- `output`

Validation governance highlights:
- Legacy schema payloads are accepted and flagged with migration warnings.
- Missing alt text is an error for image assets actively used by live sections/projects.
- Missing alt text is a warning for unused image assets.
- Page toggle `OFF` expects `pages.<key>.seo.noindex = true`.
- `designTokens.reducedMotion` must be `ON` or `OFF`.

## Keyboard map
Studio keyboard interactions:
- `Cmd/Ctrl+S`: Save draft now
- `Cmd/Ctrl+Z`: Undo
- `Cmd/Ctrl+Shift+Z` or `Cmd/Ctrl+Y`: Redo
- `Arrow keys`: Nudge selected layer(s)
- `Shift + Arrow`: 10x nudge step
- `Arrow Left/Right` on Inspector tabs: roving tab navigation
- `Esc` in modal dialogs: close modal and restore prior focus

## QA and regression tests
### Python backend tests (pytest)
```bash
cd /Users/julianschnitt/Desktop/Julianschnitt.com
pytest -q
```

### Playwright e2e tests
```bash
cd /Users/julianschnitt/Desktop/Julianschnitt.com
npm install
npx playwright install
npm run test:e2e
```

Combined run:
```bash
npm test
```

Implemented regression coverage includes:
- migration safety and publish defaults upgrade
- keyboard-only editing and publish flow
- inspector tab accessibility and live region announcements
- YouTube intro/background probing independence
- page OFF -> noindex behavior
- publish-live diagnostics contract
- responsive desktop/tablet/mobile editor stability

## Troubleshooting
- If you see `fatal: not a git repository`, run commands from:
```bash
cd /Users/julianschnitt/Desktop/Julianschnitt.com
```
- If live publish fails, inspect `Publish Diagnostics` in Studio and retry after fixing git auth/rebase conflicts.
