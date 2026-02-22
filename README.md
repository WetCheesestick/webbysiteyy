BLANK PORTFOLIO TEMPLATE (opening video reveal)

Folder structure:
- index.html
- projects.html
- about.html
- privacy-policy.html
- assets/
  - css/styles.css
  - js/opening.js
  - videos/
    - opening_01.mp4
    - opening_02.mp4
    - opening_03.mp4
    - background.mp4
  - images/
    - (put your thumbnails, portraits, logos, etc.)

HOW TO ADD YOUR VIDEOS
1) Put your MP4s in: assets/videos/
2) Rename them to match the defaults OR change the paths in index.html:
   - assets/videos/opening_01.mp4
   - assets/videos/opening_02.mp4
   - assets/videos/opening_03.mp4
   - assets/videos/background.mp4

Best encoding for autoplay:
- H.264 + AAC in an .mp4 container
- keep videos muted (autoplay policies)
- add playsinline (iOS)

RUNNING LOCALLY
- If you have VS Code: install “Live Server” and right-click index.html → “Open with Live Server”
- Or use Python:
  python3 -m http.server 8000
  then open http://localhost:8000

OPENING SETTINGS
- Edit assets/js/opening.js to adjust timing, easing, or disable “play once per session”.
- Edit assets/css/styles.css to change the starting tile size (main-item), border radius, etc.

PRODUCTION SAFETY (GITHUB PAGES)
- This repo now deploys with GitHub Actions via `.github/workflows/deploy-pages.yml`.
- The deploy artifact excludes local-only admin files:
  - `studio-8391.html`
  - `assets/js/secret-entry.js`
  - `serve_with_cors.py`
- `index.html` only loads `secret-entry.js` on `localhost`, `127.0.0.1`, or `file://`.

GO LIVE CHECKLIST
1) In GitHub repo settings: `Settings -> Pages -> Build and deployment -> Source = GitHub Actions`.
2) Push to `main`; the workflow will publish only `_site` (sanitized production files).
3) Use a custom domain in `Settings -> Pages` (or `CNAME`) and point DNS from Namecheap to GitHub Pages.

SECURITY HEADERS
- GitHub Pages does not let you set strict response headers directly.
- For strict headers and access control, place Cloudflare in front of your domain and set:
  - `Strict-Transport-Security`
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
