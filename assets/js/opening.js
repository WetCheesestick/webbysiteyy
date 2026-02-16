(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function forceTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  forceTop();
  window.requestAnimationFrame(forceTop);
  window.addEventListener("pageshow", forceTop);

  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".main-item");
  const openingLayers = Array.from(document.querySelectorAll(".main-item .opening-item"));
  const HOLD_BETWEEN_CLIPS = 0.55;
  const SWIPE_DURATION = 0.3;
  const INTRO_FADE_DURATION = 0.35;
  const INTRO_FADE_DELAY = 0.2;
  const EXPAND_DURATION = 0.78;
  const HEADER_FADE_DURATION = 0.65;

  // Small helper: if elements with data-src exist, copy to src (useful if you later swap to real lazy-loading)
  function hydrateVideoSources() {
    document.querySelectorAll("video[data-src]").forEach(v => {
      const ds = v.getAttribute("data-src");
      if (ds && !v.getAttribute("src")) v.setAttribute("src", ds);
    });
  }

  hydrateVideoSources();

  if (!header || !hero || openingLayers.length === 0) {
    if (header) header.style.opacity = "1";
    return;
  }

  if (!window.gsap) {
    header.style.opacity = "1";
    return;
  }

  // Reset to the same start state on every refresh.
  gsap.set(hero, { position: "relative", top: "50%", yPercent: -50, width: "", height: "", borderRadius: "" });
  gsap.set(openingLayers, { yPercent: 100 });
  gsap.set(openingLayers[0], { yPercent: 0 });
  gsap.set(header, { opacity: 0 });

  function jumpToEndState() {
    const lastLayer = openingLayers[openingLayers.length - 1];
    gsap.set(openingLayers, { yPercent: -100 });
    gsap.set(lastLayer, { yPercent: 0 });
    gsap.set(hero, { width: "100%", height: "100%", top: 0, yPercent: 0, borderRadius: 0 });
    gsap.set(header, { opacity: 1 });
  }

  // If reduced motion, jump to the end state.
  if (reduced) {
    jumpToEndState();
    return;
  }

  // Prevent scroll while intro runs.
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  let finished = false;
  function endIntro() {
    if (finished) return;
    finished = true;
    document.body.style.overflow = prevOverflow || "";
    window.clearTimeout(fallbackTimer);
  }

  const tl = gsap.timeline({
    defaults: { ease: "power4.inOut" },
    onComplete: endIntro
  });

  tl.from(hero, { opacity: 0, duration: INTRO_FADE_DURATION, delay: INTRO_FADE_DELAY });

  for (let i = 1; i < openingLayers.length; i += 1) {
    tl.to(openingLayers[i], { yPercent: 0, duration: SWIPE_DURATION }, `+=${HOLD_BETWEEN_CLIPS}`)
      .to(openingLayers[i - 1], { yPercent: -100, duration: SWIPE_DURATION }, "<");
  }

  tl.to(
    hero,
    { width: "100%", height: "100%", duration: EXPAND_DURATION, borderRadius: 0, top: 0, yPercent: 0 },
    `+=${HOLD_BETWEEN_CLIPS * 0.35}`
  ).fromTo(header, { opacity: 0 }, { opacity: 1, duration: HEADER_FADE_DURATION, delay: 0.08 }, "<");

  // Safety fallback: keep smooth motion but never stay stuck on opening_03.
  const fallbackTimer = window.setTimeout(() => {
    if (!finished) {
      tl.kill();
      jumpToEndState();
      endIntro();
    }
  }, 9000);
})();
