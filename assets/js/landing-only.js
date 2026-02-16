(() => {
  const FEATURE_TOGGLES = {
    works_section_under_super_syd: "ON", // ON or OFF
    works_section_3d_poster_mode: "ON" // ON or OFF
  };

  const PAGE_TOGGLES = {
    projects: "OFF", // ON or OFF
    about: "OFF", // ON or OFF
    privacy: "OFF", // ON or OFF
    project_aastry: "OFF", // ON or OFF
    project_crimson_ring: "OFF", // ON or OFF
    project_super_syd: "OFF" // ON or OFF
  };

  const PAGE_KEY_BY_FILE = {
    "projects.html": "projects",
    "about.html": "about",
    "privacy-policy.html": "privacy",
    "project-aastry.html": "project_aastry",
    "project-crimson-ring.html": "project_crimson_ring",
    "project-super-syd.html": "project_super_syd"
  };

  const isOn = (value) => String(value || "").toUpperCase() === "ON";
  const setVisibility = (el, visible) => {
    el.hidden = !visible;
    if (!visible) {
      el.setAttribute("aria-hidden", "true");
      if (el.tagName === "A") el.setAttribute("tabindex", "-1");
      return;
    }
    el.removeAttribute("aria-hidden");
    if (el.tagName === "A") el.removeAttribute("tabindex");
  };

  const path = window.location.pathname.split("/").pop() || "index.html";
  const currentPageKey = PAGE_KEY_BY_FILE[path] || null;

  if (currentPageKey && !isOn(PAGE_TOGGLES[currentPageKey])) {
    window.location.replace("index.html");
    return;
  }

  document.querySelectorAll("[data-feature-key]").forEach((el) => {
    const key = el.getAttribute("data-feature-key");
    const visible = isOn(FEATURE_TOGGLES[key] ?? "ON");
    setVisibility(el, visible);
  });

  document.querySelectorAll("[data-page-key]").forEach((el) => {
    const key = el.getAttribute("data-page-key");
    const visible = isOn(PAGE_TOGGLES[key] ?? "ON");
    setVisibility(el, visible);
  });

  const worksEnabled = isOn(FEATURE_TOGGLES.works_section_under_super_syd);
  const works3dEnabled = worksEnabled && isOn(FEATURE_TOGGLES.works_section_3d_poster_mode);

  document.querySelectorAll("[data-works-variant]").forEach((el) => {
    const variant = el.getAttribute("data-works-variant");
    let visible = worksEnabled;
    if (variant === "classic") visible = worksEnabled && !works3dEnabled;
    if (variant === "poster_3d") visible = works3dEnabled;
    setVisibility(el, visible);
  });
})();
