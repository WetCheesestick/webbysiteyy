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
