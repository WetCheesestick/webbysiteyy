(() => {
  const OPENING_ANIMATION_STYLE = "STACKED"; // STACKED | LEGACY
  const OPENING_EXPANDED_SIZE = "FULL"; // FULL | FRAMED
  const FRAMED_INSET_X_PX = 78;
  const FRAMED_INSET_Y_PX = 74;
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
  const openingContainer = document.querySelector(".main-item .opening-container");
  const openingLayers = Array.from(document.querySelectorAll(".main-item .opening-item")).filter((layer) => !layer.hidden);
  const stackedSweepLayers = openingLayers.filter((layer) => layer.classList.contains("not-first"));
  const mainVideoLayer = document.querySelector(".main-item .main-video");
  const introMode = String(hero?.getAttribute("data-intro-mode") || "original").toLowerCase();

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

  const useSingleStyle =
    introMode === "single" &&
    mainVideoLayer &&
    openingLayers.length >= 1;
  const useStackedStyle =
    !useSingleStyle &&
    OPENING_ANIMATION_STYLE.toUpperCase() === "STACKED" &&
    mainVideoLayer &&
    stackedSweepLayers.length > 0;
  const useFramedExpanded = OPENING_EXPANDED_SIZE.toUpperCase() === "FRAMED";
  const framedInsetX = Math.max(18, Math.min(FRAMED_INSET_X_PX, Math.round(window.innerWidth * 0.07)));
  const framedInsetY = Math.max(18, Math.min(FRAMED_INSET_Y_PX, Math.round(window.innerHeight * 0.08)));

  const expandedState = useFramedExpanded
    ? {
        width: `calc(100% - ${framedInsetX * 2}px)`,
        height: `calc(100% - ${framedInsetY * 2}px)`,
        top: framedInsetY,
        yPercent: 0,
        borderRadius: 5
      }
    : {
        width: "100%",
        height: "100%",
        borderRadius: 5
      };

  function resetStackedStartState() {
    hero.classList.remove("intro-expanded");
    if (openingContainer) {
      gsap.set(openingContainer, { autoAlpha: 1 });
    }
    gsap.set(hero, {
      position: "relative",
      top: "50%",
      yPercent: -50,
      width: "",
      height: "",
      borderRadius: 5
    });
    gsap.set(header, { opacity: 0 });
    gsap.set(stackedSweepLayers, { y: 0 });
    gsap.set(mainVideoLayer, { y: 0 });
  }

  function jumpToStackedEndState() {
    hero.classList.add("intro-expanded");
    if (openingContainer) {
      gsap.set(openingContainer, { autoAlpha: 0 });
    }
    gsap.set(stackedSweepLayers, { y: "-100%" });
    gsap.set(mainVideoLayer, { y: "-100%" });
    gsap.set(hero, expandedState);
    gsap.set(header, { opacity: 1 });
  }

  function resetSingleStartState() {
    hero.classList.remove("intro-expanded");
    if (openingContainer) {
      gsap.set(openingContainer, { autoAlpha: 1 });
    }
    gsap.set(hero, {
      position: "relative",
      top: "50%",
      yPercent: -50,
      width: "",
      height: "",
      borderRadius: 5
    });
    gsap.set(header, { opacity: 0 });
    gsap.set(openingLayers, { yPercent: 0 });
    gsap.set(mainVideoLayer, { y: 0 });
  }

  function jumpToSingleEndState() {
    hero.classList.add("intro-expanded");
    gsap.set(openingLayers, { yPercent: -100 });
    gsap.set(mainVideoLayer, { y: "-100%" });
    if (openingContainer) {
      gsap.set(openingContainer, { autoAlpha: 0 });
    }
    gsap.set(hero, expandedState);
    gsap.set(header, { opacity: 1 });
  }

  function resetLegacyStartState() {
    hero.classList.remove("intro-expanded");
    if (openingContainer) {
      gsap.set(openingContainer, { autoAlpha: 1 });
    }
    gsap.set(hero, { position: "relative", top: "50%", yPercent: -50, width: "", height: "", borderRadius: "" });
    gsap.set(openingLayers, { yPercent: 100 });
    gsap.set(openingLayers[0], { yPercent: 0 });
    gsap.set(header, { opacity: 0 });
  }

  function jumpToLegacyEndState() {
    const lastLayer = openingLayers[openingLayers.length - 1];
    gsap.set(openingLayers, { yPercent: -100 });
    gsap.set(lastLayer, { yPercent: 0 });
    gsap.set(hero, expandedState);
    gsap.set(header, { opacity: 1 });
  }

  if (useSingleStyle) {
    resetSingleStartState();
  } else if (useStackedStyle) {
    resetStackedStartState();
  } else {
    resetLegacyStartState();
  }

  // If reduced motion, jump to the end state.
  if (reduced) {
    if (useSingleStyle) {
      jumpToSingleEndState();
    } else if (useStackedStyle) {
      jumpToStackedEndState();
    } else {
      jumpToLegacyEndState();
    }
    return;
  }

  // Prevent scroll while intro runs.
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.classList.add("intro-running");

  let finished = false;
  function endIntro() {
    if (finished) return;
    finished = true;
    hero.classList.add("intro-expanded");
    document.body.style.overflow = prevOverflow || "";
    document.body.classList.remove("intro-running");
    window.clearTimeout(fallbackTimer);
  }

  const tl = gsap.timeline({
    defaults: { ease: "power4.inOut" },
    onComplete: endIntro
  });

  if (useSingleStyle) {
    const SINGLE_HOLD = 0.38;
    const SINGLE_SWIPE_DURATION = 0.24;
    const SINGLE_EXPAND_DURATION = 0.44;
    const SINGLE_HEADER_FADE = 0.24;

    tl.from(hero, {
      opacity: 0,
      duration: 0.24,
      delay: 0.08
    })
      .to(mainVideoLayer, {
        y: "-100%",
        duration: SINGLE_SWIPE_DURATION
      }, `+=${SINGLE_HOLD}`)
      .to(openingLayers[0], {
        yPercent: -100,
        duration: SINGLE_SWIPE_DURATION
      }, "<")
      .add(() => {
        if (openingContainer) {
          gsap.set(openingContainer, { autoAlpha: 0 });
        }
      })
      .to(hero, {
        ...expandedState,
        duration: SINGLE_EXPAND_DURATION
      })
      .fromTo(header, { opacity: 0 }, { opacity: 1, duration: SINGLE_HEADER_FADE, delay: 0.08 }, "<");
  } else if (useStackedStyle) {
    tl.from(hero, {
      opacity: 0,
      duration: 0.5,
      delay: 0.5,
      ease: "power4.inOut"
    })
      .to(stackedSweepLayers, {
        y: "-100%",
        delay: 0.5,
        duration: 0.3,
        ease: "power4.inOut",
        stagger: 0.3
      })
      .to(mainVideoLayer, {
        y: "-100%",
        duration: 0.3,
        ease: "power4.inOut",
        stagger: 0.3
      })
      .add(() => {
        // Prevent double-layer ghosting once the main background layer takes over.
        if (openingContainer) {
          gsap.set(openingContainer, { autoAlpha: 0 });
        }
      })
      .to(hero, {
        ...expandedState,
        duration: 1,
        ease: "power4.inOut"
      })
      .fromTo(
        header,
        {
          opacity: 0
        },
        {
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: "power4.inOut"
        },
        "<"
      );
  } else {
    const HOLD_BETWEEN_CLIPS = 0.17;
    const SWIPE_DURATION = 0.16;
    const INTRO_FADE_DURATION = 0.14;
    const INTRO_FADE_DELAY = 0.02;
    const EXPAND_DURATION = 0.36;
    const HEADER_FADE_DURATION = 0.22;

    tl.from(hero, { opacity: 0, duration: INTRO_FADE_DURATION, delay: INTRO_FADE_DELAY });

    for (let i = 1; i < openingLayers.length; i += 1) {
      tl.to(openingLayers[i], { yPercent: 0, duration: SWIPE_DURATION }, `+=${HOLD_BETWEEN_CLIPS}`)
        .to(openingLayers[i - 1], { yPercent: -100, duration: SWIPE_DURATION }, "<");
    }

    tl.to(
      hero,
      { ...expandedState, duration: EXPAND_DURATION },
      `+=${HOLD_BETWEEN_CLIPS * 0.35}`
    ).fromTo(header, { opacity: 0 }, { opacity: 1, duration: HEADER_FADE_DURATION, delay: 0.08 }, "<");
  }

  // Safety fallback: keep smooth motion but never stay stuck mid-intro.
  const fallbackTimer = window.setTimeout(() => {
    if (!finished) {
      tl.kill();
      if (useSingleStyle) {
        jumpToSingleEndState();
      } else if (useStackedStyle) {
        jumpToStackedEndState();
      } else {
        jumpToLegacyEndState();
      }
      endIntro();
    }
  }, useSingleStyle ? 4600 : useStackedStyle ? 9000 : 4200);
})();
