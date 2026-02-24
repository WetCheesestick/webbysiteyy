Cinematographer - New York - Florida

## Daily workflow (Studio -> GitHub)
1. Start Studio locally:
```bash
/Users/julianschnitt/Desktop/Julianschnitt.com/scripts/start-studio.sh
```
2. Open Studio:
```text
http://localhost:8000/studio-8391.html
```
3. Make edits in Studio, then click **Publish to Folder**.
4. Publish all repo changes to GitHub from anywhere:
```bash
/Users/julianschnitt/Desktop/Julianschnitt.com/scripts/publish-site.sh "Your commit message"
```
If you omit the commit message, a timestamped message is used automatically.

## One-command behavior
`publish-site.sh` always:
- uses `/Users/julianschnitt/Desktop/Julianschnitt.com` as source of truth
- rebases first with `origin/main` (`git pull --rebase --autostash origin main`)
- stages all changes (`git add -A`)
- commits only when there are staged changes
- pushes to `origin main`
- prints final commit hash and branch status

## Troubleshooting
- If you ever see `fatal: not a git repository`, you ran Git outside the repo.
- Use the script directly from any folder:
```bash
/Users/julianschnitt/Desktop/Julianschnitt.com/scripts/publish-site.sh
```
That script auto-enters the correct repo path before doing any Git commands.
