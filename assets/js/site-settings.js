(() => {
  const STORAGE_KEY = "julian_site_settings_v1";

  const HOME_SECTION_LABELS = {
    super_syd: "Super Syd Feature",
    works_intro: "Works Intro",
    works_classic: "Works Grid (Classic)",
    works_3d: "Works Grid (3D Posters)"
  };
  const HOME_SECTION_KEYS = Object.keys(HOME_SECTION_LABELS);

  const PAGE_KEY_BY_FILE = {
    "projects.html": "projects",
    "about.html": "about",
    "privacy-policy.html": "privacy",
    "project-aastry.html": "project_aastry",
    "project-crimson-ring.html": "project_crimson_ring",
    "project-super-syd.html": "project_super_syd"
  };

  const DEFAULT_SETTINGS = {
    theme: "LIGHT",
    featureToggles: {
      works_section_under_super_syd: "ON",
      works_section_3d_poster_mode: "ON"
    },
    pageToggles: {
      projects: "OFF",
      about: "OFF",
      privacy: "OFF",
      project_aastry: "OFF",
      project_crimson_ring: "OFF",
      project_super_syd: "OFF"
    },
    layout: {
      homeSectionOrder: [...HOME_SECTION_KEYS],
      sectionVisibility: {
        super_syd: "ON",
        works_intro: "ON",
        works_classic: "ON",
        works_3d: "ON"
      },
      projectOrder: [0, 1, 2]
    },
    design: {
      heroFramePad: 20,
      heroHeaderHeight: 40,
      heroTileWidth: 453,
      heroTileHeight: 180,
      cardRadius: 18
    },
    content: {
      works: {
        title: "Works",
        lede: "Selected projects and current collaborations."
      },
      superSyd: {
        comingSoonCopy: "... Coming soon,",
        teaserEmbedUrl: "https://www.youtube-nocookie.com/embed/0m8tLDqzj0I?rel=0&playsinline=1&modestbranding=1",
        previsEmbedUrl: "https://www.youtube-nocookie.com/embed/D_Eh8zvQmb8?rel=0&playsinline=1&modestbranding=1"
      },
      projects: [
        {
          id: "aastry",
          pageKey: "project_aastry",
          title: "Aastry",
          meta: "Cinematographer • Narrative",
          posterSrc: "assets/images/AstrayPoster.png",
          posterAlt: "Aastry poster",
          detail: "A character-forward narrative piece built with restrained movement and emotionally motivated lighting.",
          link: "project-aastry.html"
        },
        {
          id: "crimson_ring",
          pageKey: "project_crimson_ring",
          title: "Crimson Ring",
          meta: "Cinematographer • Narrative",
          posterSrc: "assets/images/project_02.svg",
          posterAlt: "Crimson Ring poster",
          detail: "A high-contrast visual direction that uses kinetic framing and color tension to track escalation.",
          link: "project-crimson-ring.html"
        },
        {
          id: "super_syd",
          pageKey: "project_super_syd",
          title: "Super Syd",
          meta: "Cinematographer • Narrative",
          posterSrc: "assets/images/super_syd_canva.png",
          posterAlt: "Super Syd poster",
          detail: "A playful coming-of-age visual language blending wonder, motion, and intimate sisterhood beats.",
          link: "project-super-syd.html"
        }
      ]
    }
  };

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const isOn = (value) => String(value || "").toUpperCase() === "ON";
  const normalizeOnOff = (value, fallback) => (String(value || fallback).toUpperCase() === "OFF" ? "OFF" : "ON");
  const normalizeText = (value, fallback) => {
    if (typeof value !== "string") return fallback;
    return value.trim() || fallback;
  };
  const normalizeNumber = (value, fallback, min, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };

  function normalizeTheme(value, fallback) {
    return String(value || fallback).toUpperCase() === "DARK" ? "DARK" : "LIGHT";
  }

  function normalizeSectionOrder(order) {
    const seen = new Set();
    const out = [];
    if (Array.isArray(order)) {
      order.forEach((key) => {
        if (!HOME_SECTION_KEYS.includes(key) || seen.has(key)) return;
        seen.add(key);
        out.push(key);
      });
    }
    HOME_SECTION_KEYS.forEach((key) => {
      if (!seen.has(key)) out.push(key);
    });
    return out;
  }

  function normalizeProjectOrder(order, total) {
    const seen = new Set();
    const out = [];
    if (Array.isArray(order)) {
      order.forEach((index) => {
        const parsed = Number(index);
        if (!Number.isInteger(parsed) || parsed < 0 || parsed >= total || seen.has(parsed)) return;
        seen.add(parsed);
        out.push(parsed);
      });
    }
    for (let i = 0; i < total; i += 1) {
      if (!seen.has(i)) out.push(i);
    }
    return out;
  }

  function normalizeProject(project, fallback) {
    if (!isObject(project)) return clone(fallback);
    return {
      id: normalizeText(project.id, fallback.id),
      pageKey: normalizeText(project.pageKey, fallback.pageKey),
      title: normalizeText(project.title, fallback.title),
      meta: normalizeText(project.meta, fallback.meta),
      posterSrc: normalizeText(project.posterSrc, fallback.posterSrc),
      posterAlt: normalizeText(project.posterAlt, fallback.posterAlt),
      detail: normalizeText(project.detail, fallback.detail),
      link: normalizeText(project.link, fallback.link)
    };
  }

  function normalizeSettings(raw) {
    const defaults = clone(DEFAULT_SETTINGS);
    if (!isObject(raw)) return defaults;

    const out = clone(defaults);
    out.theme = normalizeTheme(raw.theme, defaults.theme);

    if (isObject(raw.featureToggles)) {
      Object.keys(out.featureToggles).forEach((key) => {
        out.featureToggles[key] = normalizeOnOff(raw.featureToggles[key], out.featureToggles[key]);
      });
    }

    if (isObject(raw.pageToggles)) {
      Object.keys(out.pageToggles).forEach((key) => {
        out.pageToggles[key] = normalizeOnOff(raw.pageToggles[key], out.pageToggles[key]);
      });
    }

    if (isObject(raw.layout)) {
      out.layout.homeSectionOrder = normalizeSectionOrder(raw.layout.homeSectionOrder);
      if (isObject(raw.layout.sectionVisibility)) {
        HOME_SECTION_KEYS.forEach((key) => {
          out.layout.sectionVisibility[key] = normalizeOnOff(
            raw.layout.sectionVisibility[key],
            out.layout.sectionVisibility[key]
          );
        });
      }
      out.layout.projectOrder = normalizeProjectOrder(
        raw.layout.projectOrder,
        out.content.projects.length
      );
    }

    if (isObject(raw.design)) {
      out.design.heroFramePad = normalizeNumber(raw.design.heroFramePad, out.design.heroFramePad, 0, 120);
      out.design.heroHeaderHeight = normalizeNumber(raw.design.heroHeaderHeight, out.design.heroHeaderHeight, 24, 140);
      out.design.heroTileWidth = normalizeNumber(raw.design.heroTileWidth, out.design.heroTileWidth, 260, 1200);
      out.design.heroTileHeight = normalizeNumber(raw.design.heroTileHeight, out.design.heroTileHeight, 120, 600);
      out.design.cardRadius = normalizeNumber(raw.design.cardRadius, out.design.cardRadius, 8, 48);
    }

    if (isObject(raw.content)) {
      if (isObject(raw.content.works)) {
        out.content.works.title = normalizeText(raw.content.works.title, out.content.works.title);
        out.content.works.lede = normalizeText(raw.content.works.lede, out.content.works.lede);
      }

      if (isObject(raw.content.superSyd)) {
        out.content.superSyd.comingSoonCopy = normalizeText(
          raw.content.superSyd.comingSoonCopy,
          out.content.superSyd.comingSoonCopy
        );
        out.content.superSyd.teaserEmbedUrl = normalizeText(
          raw.content.superSyd.teaserEmbedUrl,
          out.content.superSyd.teaserEmbedUrl
        );
        out.content.superSyd.previsEmbedUrl = normalizeText(
          raw.content.superSyd.previsEmbedUrl,
          out.content.superSyd.previsEmbedUrl
        );
      }

      if (Array.isArray(raw.content.projects)) {
        out.content.projects = out.content.projects.map((fallbackProject, index) =>
          normalizeProject(raw.content.projects[index], fallbackProject)
        );
        out.layout.projectOrder = normalizeProjectOrder(out.layout.projectOrder, out.content.projects.length);
      }
    }

    return out;
  }

  function safeReadStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function loadSettings() {
    return normalizeSettings(safeReadStorage());
  }

  function saveSettings(settings) {
    const normalized = normalizeSettings(settings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (_err) {
      // Ignore storage write failures and still return normalized settings.
    }
    return normalized;
  }

  function resetSettings() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_err) {
      // Ignore storage failures.
    }
    return clone(DEFAULT_SETTINGS);
  }

  function setVisibility(el, visible) {
    el.hidden = !visible;
    if (!visible) {
      el.setAttribute("aria-hidden", "true");
      if (el.tagName === "A") el.setAttribute("tabindex", "-1");
      return;
    }
    el.removeAttribute("aria-hidden");
    if (el.tagName === "A") el.removeAttribute("tabindex");
  }

  function toEmbedUrl(input, fallback) {
    const value = String(input || "").trim();
    if (!value) return fallback;

    const fallbackUrl = String(fallback || "").trim();
    let parsed;
    try {
      parsed = new URL(value, window.location.origin);
    } catch (_err) {
      return fallbackUrl || value;
    }

    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    let videoId = "";

    if (host === "youtu.be") {
      videoId = parsed.pathname.replace(/\//g, "").trim();
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (parsed.pathname === "/watch") videoId = parsed.searchParams.get("v") || "";
      if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/")[2] || "";
      if (parsed.pathname.startsWith("/embed/")) videoId = parsed.pathname.split("/")[2] || "";
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1`;
    }

    if (value.includes("/embed/")) return value;
    return fallbackUrl || value;
  }

  function getOrderedProjects(settings) {
    const projects = Array.isArray(settings.content.projects) ? settings.content.projects : [];
    const order = normalizeProjectOrder(settings.layout.projectOrder, projects.length);
    return order.map((index) => projects[index]).filter(Boolean);
  }

  function applyDesignSettings(doc, settings) {
    const root = doc.documentElement || document.documentElement;
    root.style.setProperty("--hero-frame-pad", `${settings.design.heroFramePad}px`);
    root.style.setProperty("--hero-header-height", `${settings.design.heroHeaderHeight}px`);
    root.style.setProperty("--hero-tile-width", `${settings.design.heroTileWidth}px`);
    root.style.setProperty("--hero-tile-height", `${settings.design.heroTileHeight}px`);
    root.style.setProperty("--radius", `${settings.design.cardRadius}px`);
  }

  function applyWorksContent(doc, settings) {
    const introTitle = doc.querySelector(".projects-intro .h1");
    const introLede = doc.querySelector(".projects-intro .lede");
    if (introTitle) introTitle.textContent = settings.content.works.title;
    if (introLede) introLede.textContent = settings.content.works.lede;

    const projects = getOrderedProjects(settings);

    const classicCards = Array.from(doc.querySelectorAll(".cards .card-poster"));
    classicCards.forEach((card, index) => {
      const project = projects[index];
      if (!project) return;
      card.setAttribute("href", project.link);
      if (project.pageKey) card.setAttribute("data-page-key", project.pageKey);
      const img = card.querySelector("img");
      if (img) {
        img.setAttribute("src", project.posterSrc);
        img.setAttribute("alt", project.posterAlt);
      }
      const title = card.querySelector(".card-title");
      const meta = card.querySelector(".card-meta");
      if (title) title.textContent = project.title;
      if (meta) meta.textContent = project.meta;
    });

    const listingCards = Array.from(doc.querySelectorAll('.cards > a[data-page-key^="project_"]'));
    listingCards.forEach((card, index) => {
      const project = projects[index];
      if (!project) return;
      card.setAttribute("href", project.link);
      if (project.pageKey) card.setAttribute("data-page-key", project.pageKey);
      const img = card.querySelector("img");
      if (img) {
        img.setAttribute("src", project.posterSrc);
        img.setAttribute("alt", project.posterAlt);
      }
      const title = card.querySelector(".card-title");
      const meta = card.querySelector(".card-meta");
      if (title) title.textContent = project.title;
      if (meta) meta.textContent = project.meta;
    });

    const cards3d = Array.from(doc.querySelectorAll(".works-3d-grid .works-3d-card"));
    cards3d.forEach((card, index) => {
      const project = projects[index];
      if (!project) return;
      card.setAttribute("data-project-title", project.title);
      const frontImg = card.querySelector(".works-3d-front img");
      if (frontImg) {
        frontImg.setAttribute("src", project.posterSrc);
        frontImg.setAttribute("alt", project.posterAlt);
      }

      const frontTitle = card.querySelector(".works-3d-caption h3");
      const frontMeta = card.querySelector(".works-3d-caption p");
      const backTitle = card.querySelector(".works-3d-back h3");
      const backText = card.querySelector(".works-3d-back p");
      const moreLink = card.querySelector(".works-3d-more");

      if (frontTitle) frontTitle.textContent = project.title;
      if (frontMeta) frontMeta.textContent = project.meta;
      if (backTitle) backTitle.textContent = project.title;
      if (backText) backText.textContent = project.detail;
      if (moreLink) {
        moreLink.setAttribute("href", project.link);
        if (project.pageKey) moreLink.setAttribute("data-page-key", project.pageKey);
      }
    });
  }

  function applySuperSydContent(doc, settings) {
    const copyEl = doc.querySelector(".coming-soon-copy");
    if (copyEl) copyEl.textContent = settings.content.superSyd.comingSoonCopy;

    const teaser = doc.querySelector(".coming-soon-video");
    if (teaser) {
      teaser.setAttribute(
        "src",
        toEmbedUrl(settings.content.superSyd.teaserEmbedUrl, DEFAULT_SETTINGS.content.superSyd.teaserEmbedUrl)
      );
    }

    const previs = doc.querySelector(".seed-video-embed iframe");
    if (previs) {
      previs.setAttribute(
        "src",
        toEmbedUrl(settings.content.superSyd.previsEmbedUrl, DEFAULT_SETTINGS.content.superSyd.previsEmbedUrl)
      );
    }
  }

  function applyHomeLayout(doc, settings) {
    const homeMain = doc.querySelector("main.page");
    if (!homeMain) return;

    const sectionMap = new Map();
    doc.querySelectorAll("[data-studio-section]").forEach((el) => {
      sectionMap.set(el.getAttribute("data-studio-section"), el);
    });
    if (sectionMap.size === 0) return;

    const orderedKeys = normalizeSectionOrder(settings.layout.homeSectionOrder);
    orderedKeys.forEach((key) => {
      const el = sectionMap.get(key);
      if (el) homeMain.appendChild(el);
    });

    const worksEnabled = isOn(settings.featureToggles.works_section_under_super_syd);
    const works3dEnabled = worksEnabled && isOn(settings.featureToggles.works_section_3d_poster_mode);

    HOME_SECTION_KEYS.forEach((key) => {
      const section = sectionMap.get(key);
      if (!section) return;

      let visible = isOn(settings.layout.sectionVisibility[key] || "ON");
      if (key === "works_intro") visible = visible && worksEnabled;
      if (key === "works_classic") visible = visible && worksEnabled && !works3dEnabled;
      if (key === "works_3d") visible = visible && worksEnabled && works3dEnabled;
      setVisibility(section, visible);
    });
  }

  function applySiteSettings(doc = document) {
    const settings = loadSettings();
    const html = doc.documentElement || document.documentElement;
    html.setAttribute("data-site-theme", settings.theme.toLowerCase());
    applyDesignSettings(doc, settings);

    const path = window.location.pathname.split("/").pop() || "index.html";
    const currentPageKey = PAGE_KEY_BY_FILE[path] || null;
    if (currentPageKey && !isOn(settings.pageToggles[currentPageKey])) {
      window.location.replace("index.html");
      return settings;
    }

    doc.querySelectorAll("[data-feature-key]").forEach((el) => {
      const key = el.getAttribute("data-feature-key");
      const visible = isOn(settings.featureToggles[key] || "ON");
      setVisibility(el, visible);
    });

    doc.querySelectorAll("[data-page-key]").forEach((el) => {
      const key = el.getAttribute("data-page-key");
      const visible = isOn(settings.pageToggles[key] || "ON");
      setVisibility(el, visible);
    });

    const worksEnabled = isOn(settings.featureToggles.works_section_under_super_syd);
    const works3dEnabled = worksEnabled && isOn(settings.featureToggles.works_section_3d_poster_mode);
    doc.querySelectorAll("[data-works-variant]").forEach((el) => {
      const variant = el.getAttribute("data-works-variant");
      let visible = worksEnabled;
      if (variant === "classic") visible = worksEnabled && !works3dEnabled;
      if (variant === "poster_3d") visible = works3dEnabled;
      setVisibility(el, visible);
    });

    applyHomeLayout(doc, settings);
    applyWorksContent(doc, settings);
    applySuperSydContent(doc, settings);
    return settings;
  }

  window.SiteSettings = {
    STORAGE_KEY,
    HOME_SECTION_KEYS: [...HOME_SECTION_KEYS],
    HOME_SECTION_LABELS: { ...HOME_SECTION_LABELS },
    DEFAULT_SETTINGS: clone(DEFAULT_SETTINGS),
    PAGE_KEY_BY_FILE: clone(PAGE_KEY_BY_FILE),
    isOn,
    toEmbedUrl,
    normalizeSettings,
    loadSettings,
    saveSettings,
    resetSettings,
    getOrderedProjects,
    applySiteSettings
  };
})();
