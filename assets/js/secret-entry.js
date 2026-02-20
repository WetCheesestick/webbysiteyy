(() => {
  const hotspot = document.querySelector(".secret-studio-hotspot");
  if (!hotspot) return;

  let taps = 0;
  let resetTimer = null;
  const REQUIRED_TAPS = 4;
  const WINDOW_MS = 1800;

  hotspot.addEventListener("click", (event) => {
    event.preventDefault();
    taps += 1;
    if (resetTimer) window.clearTimeout(resetTimer);

    if (taps >= REQUIRED_TAPS) {
      taps = 0;
      window.location.href = "studio-8391.html";
      return;
    }

    resetTimer = window.setTimeout(() => {
      taps = 0;
    }, WINDOW_MS);
  });
})();
