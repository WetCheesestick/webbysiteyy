(() => {
  const STORAGE_KEYS = {
    published: "julian_site_settings_published_v2",
    draft: "julian_site_settings_draft_v2",
    legacy: "julian_site_settings_v1"
  };

  const HOME_BASE_SECTION_LABELS = {
    super_syd: "Super Syd Feature",
    works_intro: "Works Intro",
    works_classic: "Works Grid (Classic)",
    works_3d: "Works Grid (3D Posters)"
  };

  const HOME_BASE_SECTION_KEYS = Object.keys(HOME_BASE_SECTION_LABELS);

  const PAGE_KEY_BY_FILE = {
    "projects.html": "projects",
    "about.html": "about",
    "privacy-policy.html": "privacy",
    "project-aastry.html": "project_aastry",
    "project-crimson-ring.html": "project_crimson_ring",
    "project-super-syd.html": "project_super_syd"
  };

  const CUSTOM_BLOCK_TEMPLATES = {
    text_banner: {
      label: "Text Banner",
      description: "Headline and supporting text.",
      content: {
        kicker: "Featured",
        heading: "Add your headline",
        body: "Use this section for a short message, announcement, or update.",
        buttonLabel: "Learn more",
        buttonHref: "#"
      },
      style: {
        maxWidth: 1080,
        padTop: 20,
        padBottom: 20,
        background: "",
        textColor: "",
        radius: 16,
        align: "left"
      }
    },
    quote: {
      label: "Quote",
      description: "Standalone quote highlight.",
      content: {
        quote: "Cinema is emotion in motion.",
        attribution: "- Julian Schnitt"
      },
      style: {
        maxWidth: 980,
        padTop: 24,
        padBottom: 24,
        background: "",
        textColor: "",
        radius: 18,
        align: "center"
      }
    },
    media_split: {
      label: "Media Split",
      description: "Media on one side, copy on the other.",
      content: {
        kicker: "Case Study",
        heading: "Add section title",
        body: "Pair an image or embed with context and a call to action.",
        imageSrc: "",
        imageAlt: "",
        buttonLabel: "Open",
        buttonHref: "#"
      },
      style: {
        maxWidth: 1120,
        padTop: 20,
        padBottom: 20,
        background: "",
        textColor: "",
        radius: 16,
        align: "left"
      }
    },
    cta: {
      label: "Call To Action",
      description: "Compact action block with button.",
      content: {
        heading: "Ready to collaborate?",
        body: "Reach out and let’s build something visually bold.",
        buttonLabel: "Get in touch",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 900,
        padTop: 18,
        padBottom: 18,
        background: "",
        textColor: "",
        radius: 20,
        align: "center"
      }
    }
  };

  const CUSTOM_BLOCK_TYPE_LABELS = Object.keys(CUSTOM_BLOCK_TEMPLATES).reduce((out, type) => {
    out[type] = CUSTOM_BLOCK_TEMPLATES[type].label;
    return out;
  }, {});

  const DEFAULT_SECTION_STYLE = {
    maxWidth: 1080,
    padTop: 0,
    padBottom: 0,
    background: "",
    textColor: "",
    radius: 0,
    align: "left",
    layoutMode: "flow",
    freeX: 0,
    freeY: 0,
    freeW: 0,
    freeH: 0,
    zIndex: 1
  };

  const DEFAULT_SETTINGS = {
    version: 2,
    theme: "LIGHT",
    featureToggles: {
      works_section_under_super_syd: "ON",
      works_section_3d_poster_mode: "ON",
      opening_single_intro_mode: "OFF"
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
      homeSectionOrder: [...HOME_BASE_SECTION_KEYS],
      sectionVisibility: {
        super_syd: "ON",
        works_intro: "ON",
        works_classic: "ON",
        works_3d: "ON"
      },
      sectionLocks: {
        super_syd: "OFF",
        works_intro: "OFF",
        works_classic: "OFF",
        works_3d: "OFF"
      },
      sectionStyles: {
        super_syd: { ...DEFAULT_SECTION_STYLE },
        works_intro: { ...DEFAULT_SECTION_STYLE },
        works_classic: { ...DEFAULT_SECTION_STYLE },
        works_3d: { ...DEFAULT_SECTION_STYLE }
      },
      projectOrder: [0, 1, 2],
      customBlocks: []
    },
    design: {
      heroFramePad: 20,
      heroHeaderHeight: 40,
      heroTileWidth: 453,
      heroTileHeight: 180,
      cardRadius: 18,
      contentMaxWidth: 1080
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
      opening: {
        singleIntroEmbedUrl: "https://youtu.be/XJsnuIRlA9k",
        backgroundEmbedUrl: "https://youtu.be/zDLFZ_0GTLg"
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
    },
    mediaLibrary: [
      {
        id: "media_opening_1",
        type: "video",
        label: "Opening 1 (YouTube)",
        url: "https://youtu.be/JaXuggpCLs8"
      },
      {
        id: "media_opening_2",
        type: "video",
        label: "Opening 2 (YouTube)",
        url: "https://youtu.be/fsxOK0UAhko"
      },
      {
        id: "media_opening_3",
        type: "video",
        label: "Opening 3 (YouTube)",
        url: "https://youtu.be/_HPmOGqlu_0"
      },
      {
        id: "media_background",
        type: "video",
        label: "Background (YouTube)",
        url: "https://youtu.be/zDLFZ_0GTLg"
      },
      {
        id: "media_opening_single",
        type: "video",
        label: "Opening Single (YouTube)",
        url: "https://youtu.be/XJsnuIRlA9k"
      },
      {
        id: "media_super_syd_poster",
        type: "image",
        label: "Super Syd Poster",
        url: "assets/images/super_syd_canva.png"
      }
    ]
  };

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const isOn = (value) => String(value || "").toUpperCase() === "ON";
  const normalizeOnOff = (value, fallback) => (String(value || fallback).toUpperCase() === "OFF" ? "OFF" : "ON");

  function getBundledPublishedSettings() {
    try {
      if (typeof window === "undefined") return null;
      const candidate = window.__STUDIO_PUBLISHED_SETTINGS__;
      if (!isObject(candidate)) return null;
      return normalizeSettings(candidate);
    } catch (_err) {
      return null;
    }
  }

  function normalizeText(value, fallback) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  function normalizeFreeText(value, fallback = "") {
    if (typeof value !== "string") return fallback;
    return value.trim();
  }

  function normalizeNumber(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  }

  function normalizeTheme(value, fallback) {
    return String(value || fallback).toUpperCase() === "DARK" ? "DARK" : "LIGHT";
  }

  function normalizeAlign(value, fallback = "left") {
    const clean = String(value || fallback).toLowerCase();
    if (clean === "center" || clean === "right") return clean;
    return "left";
  }

  function makeCustomKey(id) {
    return `custom:${id}`;
  }

  function isCustomKey(key) {
    return String(key || "").startsWith("custom:");
  }

  function customIdFromKey(key) {
    return String(key || "").replace(/^custom:/, "");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "block";
  }

  function uid(prefix = "block") {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${stamp}-${rand}`;
  }

  function normalizeSectionStyle(style, fallback = DEFAULT_SECTION_STYLE) {
    const source = isObject(style) ? style : {};
    const layoutMode = String(source.layoutMode || fallback.layoutMode || "flow").toLowerCase() === "free"
      ? "free"
      : "flow";
    return {
      maxWidth: normalizeNumber(source.maxWidth, fallback.maxWidth, 300, 1800),
      padTop: normalizeNumber(source.padTop, fallback.padTop, 0, 320),
      padBottom: normalizeNumber(source.padBottom, fallback.padBottom, 0, 320),
      background: normalizeFreeText(source.background, fallback.background),
      textColor: normalizeFreeText(source.textColor, fallback.textColor),
      radius: normalizeNumber(source.radius, fallback.radius, 0, 80),
      align: normalizeAlign(source.align, fallback.align),
      layoutMode,
      freeX: normalizeNumber(source.freeX, fallback.freeX || 0, -5000, 12000),
      freeY: normalizeNumber(source.freeY, fallback.freeY || 0, -5000, 24000),
      freeW: normalizeNumber(source.freeW, fallback.freeW || 0, 0, 6000),
      freeH: normalizeNumber(source.freeH, fallback.freeH || 0, 0, 6000),
      zIndex: normalizeNumber(source.zIndex, fallback.zIndex || 1, 1, 200)
    };
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

  function getTemplateForType(type) {
    return CUSTOM_BLOCK_TEMPLATES[type] || CUSTOM_BLOCK_TEMPLATES.text_banner;
  }

  function normalizeCustomBlock(block, index = 0) {
    const source = isObject(block) ? block : {};
    const normalizedType = Object.prototype.hasOwnProperty.call(CUSTOM_BLOCK_TEMPLATES, source.type)
      ? source.type
      : "text_banner";
    const template = getTemplateForType(normalizedType);
    const fallbackLabel = `${template.label} ${index + 1}`;

    const id = slugify(source.id || uid("block"));
    const contentFallback = template.content;
    const sourceContent = isObject(source.content) ? source.content : {};
    const content = Object.keys(contentFallback).reduce((out, key) => {
      out[key] = normalizeFreeText(sourceContent[key], contentFallback[key]);
      return out;
    }, {});

    return {
      id,
      key: makeCustomKey(id),
      type: normalizedType,
      label: normalizeText(source.label, fallbackLabel),
      visible: normalizeOnOff(source.visible, "ON"),
      locked: normalizeOnOff(source.locked, "OFF"),
      description: normalizeFreeText(source.description, template.description),
      style: normalizeSectionStyle(source.style, template.style),
      content
    };
  }

  function normalizeMediaItem(item, index = 0) {
    const source = isObject(item) ? item : {};
    const type = String(source.type || "image").toLowerCase();
    const normalizedType = type === "video" ? "video" : "image";
    const label = normalizeText(source.label, `Media ${index + 1}`);
    const id = slugify(source.id || `${normalizedType}-${label}-${index + 1}`) || uid("media");
    return {
      id,
      type: normalizedType,
      label,
      url: normalizeFreeText(source.url, "")
    };
  }

  function getAllSectionKeys(settings) {
    const custom = settings.layout.customBlocks.map((block) => makeCustomKey(block.id));
    return [...HOME_BASE_SECTION_KEYS, ...custom];
  }

  function normalizeSectionOrder(order, allKeys) {
    const allowed = Array.isArray(allKeys) ? allKeys : [];
    const seen = new Set();
    const out = [];

    if (Array.isArray(order)) {
      order.forEach((key) => {
        if (!allowed.includes(key) || seen.has(key)) return;
        seen.add(key);
        out.push(key);
      });
    }

    allowed.forEach((key) => {
      if (!seen.has(key)) out.push(key);
    });

    return out;
  }

  function normalizeSectionMap(rawMap, keys, fallback = "ON") {
    const out = {};
    const source = isObject(rawMap) ? rawMap : {};
    keys.forEach((key) => {
      out[key] = normalizeOnOff(source[key], fallback);
    });
    return out;
  }

  function normalizeSectionStyles(rawMap, keys) {
    const out = {};
    const source = isObject(rawMap) ? rawMap : {};
    keys.forEach((key) => {
      out[key] = normalizeSectionStyle(source[key], DEFAULT_SECTION_STYLE);
    });
    return out;
  }

  function ensureUniqueCustomBlocks(blocks) {
    const seen = new Set();
    const out = [];
    blocks.forEach((block, index) => {
      let next = normalizeCustomBlock(block, index);
      if (seen.has(next.id)) {
        next = normalizeCustomBlock({ ...next, id: `${next.id}-${index + 1}` }, index);
      }
      seen.add(next.id);
      out.push(next);
    });
    return out;
  }

  function normalizeSettings(raw) {
    const defaults = clone(DEFAULT_SETTINGS);
    if (!isObject(raw)) return defaults;

    const out = clone(defaults);
    out.version = 2;
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

    if (isObject(raw.design)) {
      out.design.heroFramePad = normalizeNumber(raw.design.heroFramePad, out.design.heroFramePad, 0, 180);
      out.design.heroHeaderHeight = normalizeNumber(raw.design.heroHeaderHeight, out.design.heroHeaderHeight, 24, 180);
      out.design.heroTileWidth = normalizeNumber(raw.design.heroTileWidth, out.design.heroTileWidth, 240, 1600);
      out.design.heroTileHeight = normalizeNumber(raw.design.heroTileHeight, out.design.heroTileHeight, 120, 900);
      out.design.cardRadius = normalizeNumber(raw.design.cardRadius, out.design.cardRadius, 0, 80);
      out.design.contentMaxWidth = normalizeNumber(raw.design.contentMaxWidth, out.design.contentMaxWidth, 720, 1920);
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

      if (isObject(raw.content.opening)) {
        out.content.opening.singleIntroEmbedUrl = normalizeText(
          raw.content.opening.singleIntroEmbedUrl,
          out.content.opening.singleIntroEmbedUrl
        );
        out.content.opening.backgroundEmbedUrl = normalizeText(
          raw.content.opening.backgroundEmbedUrl,
          out.content.opening.backgroundEmbedUrl
        );
      }

      if (Array.isArray(raw.content.projects)) {
        out.content.projects = out.content.projects.map((fallbackProject, index) =>
          normalizeProject(raw.content.projects[index], fallbackProject)
        );
      }
    }

    const customBlocks = ensureUniqueCustomBlocks(
      isObject(raw.layout) && Array.isArray(raw.layout.customBlocks) ? raw.layout.customBlocks : out.layout.customBlocks
    );
    out.layout.customBlocks = customBlocks;

    const allKeys = getAllSectionKeys(out);

    if (isObject(raw.layout)) {
      out.layout.homeSectionOrder = normalizeSectionOrder(raw.layout.homeSectionOrder, allKeys);
      out.layout.sectionVisibility = normalizeSectionMap(raw.layout.sectionVisibility, allKeys, "ON");
      out.layout.sectionLocks = normalizeSectionMap(raw.layout.sectionLocks, allKeys, "OFF");
      out.layout.sectionStyles = normalizeSectionStyles(raw.layout.sectionStyles, allKeys);
      out.layout.projectOrder = normalizeProjectOrder(raw.layout.projectOrder, out.content.projects.length);
    } else {
      out.layout.homeSectionOrder = normalizeSectionOrder(out.layout.homeSectionOrder, allKeys);
      out.layout.sectionVisibility = normalizeSectionMap(out.layout.sectionVisibility, allKeys, "ON");
      out.layout.sectionLocks = normalizeSectionMap(out.layout.sectionLocks, allKeys, "OFF");
      out.layout.sectionStyles = normalizeSectionStyles(out.layout.sectionStyles, allKeys);
      out.layout.projectOrder = normalizeProjectOrder(out.layout.projectOrder, out.content.projects.length);
    }

    if (Array.isArray(raw.mediaLibrary)) {
      out.mediaLibrary = raw.mediaLibrary.map((item, index) => normalizeMediaItem(item, index));
    }

    const mediaIds = new Set(out.mediaLibrary.map((item) => item.id));
    DEFAULT_SETTINGS.mediaLibrary.forEach((item, index) => {
      if (mediaIds.has(item.id)) return;
      out.mediaLibrary.push(normalizeMediaItem(item, out.mediaLibrary.length + index));
      mediaIds.add(item.id);
    });

    return out;
  }

  function safeReadStorage(storageKey) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function safeWriteStorage(storageKey, value) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (_err) {
      // Ignore write errors.
    }
  }

  function safeRemoveStorage(storageKey) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (_err) {
      // Ignore remove errors.
    }
  }

  function migrateLegacyIfNeeded() {
    const publishedRaw = safeReadStorage(STORAGE_KEYS.published);
    if (publishedRaw) return normalizeSettings(publishedRaw);

    const bundled = getBundledPublishedSettings();
    if (bundled) return normalizeSettings(bundled);

    const legacyRaw = safeReadStorage(STORAGE_KEYS.legacy);
    if (!legacyRaw) return clone(DEFAULT_SETTINGS);

    const migrated = normalizeSettings(legacyRaw);
    safeWriteStorage(STORAGE_KEYS.published, migrated);
    return migrated;
  }

  function loadPublishedSettings() {
    const published = migrateLegacyIfNeeded();
    return normalizeSettings(published);
  }

  function loadDraftSettings() {
    const draftRaw = safeReadStorage(STORAGE_KEYS.draft);
    if (draftRaw) return normalizeSettings(draftRaw);
    return clone(loadPublishedSettings());
  }

  function saveDraftSettings(settings) {
    const normalized = normalizeSettings(settings);
    safeWriteStorage(STORAGE_KEYS.draft, normalized);
    return normalized;
  }

  function savePublishedSettings(settings) {
    const normalized = normalizeSettings(settings);
    safeWriteStorage(STORAGE_KEYS.published, normalized);
    return normalized;
  }

  function publishDraft(settings = null) {
    const draft = settings ? normalizeSettings(settings) : loadDraftSettings();
    safeWriteStorage(STORAGE_KEYS.draft, draft);
    safeWriteStorage(STORAGE_KEYS.published, draft);
    return draft;
  }

  function discardDraftSettings() {
    safeRemoveStorage(STORAGE_KEYS.draft);
    return loadPublishedSettings();
  }

  function resetSettings() {
    const defaults = clone(DEFAULT_SETTINGS);
    safeWriteStorage(STORAGE_KEYS.published, defaults);
    safeRemoveStorage(STORAGE_KEYS.draft);
    safeRemoveStorage(STORAGE_KEYS.legacy);
    return defaults;
  }

  function deepEqual(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function hasDraftChanges(draftSettings = null, publishedSettings = null) {
    const draft = draftSettings ? normalizeSettings(draftSettings) : loadDraftSettings();
    const published = publishedSettings ? normalizeSettings(publishedSettings) : loadPublishedSettings();
    return !deepEqual(draft, published);
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

  function extractYoutubeVideoId(input, fallback = "") {
    const value = String(input || "").trim();
    if (!value) return String(fallback || "").trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

    let parsed;
    try {
      parsed = new URL(value, window.location.origin);
    } catch (_err) {
      return String(fallback || "").trim();
    }

    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") {
      return parsed.pathname.replace(/\//g, "").trim() || String(fallback || "").trim();
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v") || String(fallback || "").trim();
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] || String(fallback || "").trim();
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] || String(fallback || "").trim();
    }

    return String(fallback || "").trim();
  }

  function applyOpeningContent(doc, settings) {
    const hero = doc.querySelector(".main-item");
    if (!hero) return;

    const openingItems = Array.from(hero.querySelectorAll(".opening-item"));
    if (!openingItems.length) return;

    const openingIframes = openingItems.map((item) => item.querySelector(".opening-yt")).filter(Boolean);
    const finalIframe = hero.querySelector(".main-video .opening-yt");

    const defaultOpeningIds = ["JaXuggpCLs8", "fsxOK0UAhko", "_HPmOGqlu_0"];
    const defaultSingleId = "XJsnuIRlA9k";
    const defaultBackgroundId = "zDLFZ_0GTLg";
    const useSingleMode = isOn(settings.featureToggles.opening_single_intro_mode);
    const singleId = extractYoutubeVideoId(settings.content.opening.singleIntroEmbedUrl, defaultSingleId);
    const backgroundId = extractYoutubeVideoId(settings.content.opening.backgroundEmbedUrl, defaultBackgroundId);

    hero.setAttribute("data-intro-mode", useSingleMode ? "single" : "original");

    openingIframes.forEach((iframe, index) => {
      if (useSingleMode && index === 0) {
        iframe.setAttribute("data-yt-id", singleId || defaultSingleId);
        iframe.setAttribute("title", "Opening Single");
      } else {
        iframe.setAttribute("data-yt-id", defaultOpeningIds[index] || defaultOpeningIds[0]);
        iframe.setAttribute("title", `Opening ${index + 1}`);
      }
      iframe.setAttribute("src", "");
    });

    openingItems.forEach((item, index) => {
      setVisibility(item, !useSingleMode || index === 0);
    });

    if (finalIframe) {
      finalIframe.setAttribute("data-yt-id", backgroundId || defaultBackgroundId);
      finalIframe.setAttribute("title", "Background opening");
      finalIframe.setAttribute("src", "");
    }
  }

  function getOrderedProjects(settings) {
    const projects = Array.isArray(settings.content.projects) ? settings.content.projects : [];
    const order = normalizeProjectOrder(settings.layout.projectOrder, projects.length);
    return order.map((index) => projects[index]).filter(Boolean);
  }

  function getSectionCatalog(settings) {
    const normalized = normalizeSettings(settings);
    const order = normalizeSectionOrder(normalized.layout.homeSectionOrder, getAllSectionKeys(normalized));
    const byCustomId = new Map(normalized.layout.customBlocks.map((block) => [block.id, block]));

    return order.map((key) => {
      if (HOME_BASE_SECTION_LABELS[key]) {
        return {
          key,
          id: key,
          label: HOME_BASE_SECTION_LABELS[key],
          type: "base",
          templateType: "base",
          isCustom: false,
          visible: normalizeOnOff(normalized.layout.sectionVisibility[key], "ON"),
          locked: normalizeOnOff(normalized.layout.sectionLocks[key], "OFF"),
          style: normalizeSectionStyle(normalized.layout.sectionStyles[key], DEFAULT_SECTION_STYLE)
        };
      }

      const id = customIdFromKey(key);
      const block = byCustomId.get(id);
      if (!block) {
        return {
          key,
          id,
          label: "Missing block",
          type: "custom",
          templateType: "text_banner",
          isCustom: true,
          visible: "OFF",
          locked: "OFF",
          style: normalizeSectionStyle(DEFAULT_SECTION_STYLE, DEFAULT_SECTION_STYLE)
        };
      }

      return {
        key,
        id: block.id,
        label: block.label,
        type: "custom",
        templateType: block.type,
        isCustom: true,
        visible: normalizeOnOff(normalized.layout.sectionVisibility[key], block.visible),
        locked: normalizeOnOff(normalized.layout.sectionLocks[key], block.locked),
        style: normalizeSectionStyle(normalized.layout.sectionStyles[key], block.style),
        block: clone(block)
      };
    });
  }

  function withMutation(settings, mutateFn) {
    const draft = normalizeSettings(settings);
    mutateFn(draft);
    return normalizeSettings(draft);
  }

  function createCustomBlock(type = "text_banner") {
    return normalizeCustomBlock(
      {
        id: uid("block"),
        type,
        label: getTemplateForType(type).label,
        visible: "ON",
        locked: "OFF",
        description: getTemplateForType(type).description,
        style: getTemplateForType(type).style,
        content: getTemplateForType(type).content
      },
      0
    );
  }

  function insertCustomBlock(settings, type = "text_banner", insertAfterKey = null) {
    return withMutation(settings, (draft) => {
      const block = createCustomBlock(type);
      draft.layout.customBlocks.push(block);
      const key = makeCustomKey(block.id);

      const nextOrder = normalizeSectionOrder(draft.layout.homeSectionOrder, getAllSectionKeys(draft));
      if (insertAfterKey && nextOrder.includes(insertAfterKey)) {
        const index = nextOrder.indexOf(insertAfterKey);
        nextOrder.splice(index + 1, 0, key);
      } else {
        nextOrder.push(key);
      }

      draft.layout.homeSectionOrder = normalizeSectionOrder(nextOrder, getAllSectionKeys(draft));
      draft.layout.sectionVisibility[key] = "ON";
      draft.layout.sectionLocks[key] = "OFF";
      draft.layout.sectionStyles[key] = normalizeSectionStyle(block.style, DEFAULT_SECTION_STYLE);
    });
  }

  function duplicateCustomBlock(settings, key) {
    return withMutation(settings, (draft) => {
      if (!isCustomKey(key)) return;
      const id = customIdFromKey(key);
      const original = draft.layout.customBlocks.find((block) => block.id === id);
      if (!original) return;

      const duplicate = normalizeCustomBlock(
        {
          ...clone(original),
          id: uid("block"),
          label: `${original.label} Copy`
        },
        draft.layout.customBlocks.length
      );
      draft.layout.customBlocks.push(duplicate);

      const originalKey = makeCustomKey(original.id);
      const duplicateKey = makeCustomKey(duplicate.id);
      const nextOrder = normalizeSectionOrder(draft.layout.homeSectionOrder, getAllSectionKeys(draft));
      const index = nextOrder.indexOf(originalKey);
      if (index >= 0) {
        nextOrder.splice(index + 1, 0, duplicateKey);
      } else {
        nextOrder.push(duplicateKey);
      }

      draft.layout.homeSectionOrder = normalizeSectionOrder(nextOrder, getAllSectionKeys(draft));
      draft.layout.sectionVisibility[duplicateKey] = draft.layout.sectionVisibility[originalKey] || "ON";
      draft.layout.sectionLocks[duplicateKey] = "OFF";
      draft.layout.sectionStyles[duplicateKey] = normalizeSectionStyle(
        draft.layout.sectionStyles[originalKey],
        duplicate.style
      );
    });
  }

  function deleteCustomBlock(settings, key) {
    return withMutation(settings, (draft) => {
      if (!isCustomKey(key)) return;
      const id = customIdFromKey(key);
      draft.layout.customBlocks = draft.layout.customBlocks.filter((block) => block.id !== id);
      draft.layout.homeSectionOrder = draft.layout.homeSectionOrder.filter((sectionKey) => sectionKey !== key);
      delete draft.layout.sectionVisibility[key];
      delete draft.layout.sectionLocks[key];
      delete draft.layout.sectionStyles[key];
    });
  }

  function updateCustomBlock(settings, blockId, updates) {
    return withMutation(settings, (draft) => {
      const index = draft.layout.customBlocks.findIndex((block) => block.id === blockId);
      if (index < 0) return;

      const current = draft.layout.customBlocks[index];
      const nextType = updates && updates.type ? updates.type : current.type;
      const template = getTemplateForType(nextType);
      const merged = {
        ...current,
        ...updates,
        type: nextType,
        content: {
          ...template.content,
          ...current.content,
          ...(isObject(updates?.content) ? updates.content : {})
        },
        style: {
          ...template.style,
          ...current.style,
          ...(isObject(updates?.style) ? updates.style : {})
        }
      };

      const normalized = normalizeCustomBlock(merged, index);
      draft.layout.customBlocks[index] = normalized;
      const key = makeCustomKey(normalized.id);
      draft.layout.sectionVisibility[key] = normalizeOnOff(updates?.visible, draft.layout.sectionVisibility[key] || normalized.visible);
      draft.layout.sectionLocks[key] = normalizeOnOff(updates?.locked, draft.layout.sectionLocks[key] || normalized.locked);
      draft.layout.sectionStyles[key] = normalizeSectionStyle(updates?.style || draft.layout.sectionStyles[key], normalized.style);
    });
  }

  function reorderSections(settings, orderedKeys) {
    return withMutation(settings, (draft) => {
      draft.layout.homeSectionOrder = normalizeSectionOrder(orderedKeys, getAllSectionKeys(draft));
    });
  }

  function setSectionVisibility(settings, key, visible) {
    return withMutation(settings, (draft) => {
      const allKeys = getAllSectionKeys(draft);
      if (!allKeys.includes(key)) return;
      draft.layout.sectionVisibility[key] = normalizeOnOff(visible ? "ON" : "OFF", "ON");
    });
  }

  function setSectionLock(settings, key, locked) {
    return withMutation(settings, (draft) => {
      const allKeys = getAllSectionKeys(draft);
      if (!allKeys.includes(key)) return;
      draft.layout.sectionLocks[key] = normalizeOnOff(locked ? "ON" : "OFF", "OFF");
    });
  }

  function setSectionStyle(settings, key, styleUpdates) {
    return withMutation(settings, (draft) => {
      const allKeys = getAllSectionKeys(draft);
      if (!allKeys.includes(key)) return;
      const current = draft.layout.sectionStyles[key] || DEFAULT_SECTION_STYLE;
      draft.layout.sectionStyles[key] = normalizeSectionStyle({ ...current, ...(styleUpdates || {}) }, current);
    });
  }

  function upsertMediaItem(settings, item) {
    return withMutation(settings, (draft) => {
      const normalized = normalizeMediaItem(item, draft.mediaLibrary.length);
      const existingIndex = draft.mediaLibrary.findIndex((entry) => entry.id === normalized.id);
      if (existingIndex >= 0) {
        draft.mediaLibrary[existingIndex] = normalized;
      } else {
        draft.mediaLibrary.push(normalized);
      }
    });
  }

  function deleteMediaItem(settings, mediaId) {
    return withMutation(settings, (draft) => {
      draft.mediaLibrary = draft.mediaLibrary.filter((item) => item.id !== mediaId);
    });
  }

  function applyDesignSettings(doc, settings) {
    const root = doc.documentElement || document.documentElement;
    root.style.setProperty("--hero-frame-pad", `${settings.design.heroFramePad}px`);
    root.style.setProperty("--hero-header-height", `${settings.design.heroHeaderHeight}px`);
    root.style.setProperty("--hero-tile-width", `${settings.design.heroTileWidth}px`);
    root.style.setProperty("--hero-tile-height", `${settings.design.heroTileHeight}px`);
    root.style.setProperty("--radius", `${settings.design.cardRadius}px`);
    root.style.setProperty("--content-max-width", `${settings.design.contentMaxWidth}px`);
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

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildCustomBlockHtml(block) {
    const c = block.content;

    if (block.type === "quote") {
      return `
        <div class="studio-custom-inner studio-custom-quote" data-align="${escapeHtml(block.style.align)}">
          <blockquote>${escapeHtml(c.quote || "")}</blockquote>
          <cite>${escapeHtml(c.attribution || "")}</cite>
        </div>
      `;
    }

    if (block.type === "media_split") {
      const imageHtml = c.imageSrc
        ? `<img src="${escapeHtml(c.imageSrc)}" alt="${escapeHtml(c.imageAlt || block.label)}" loading="lazy" />`
        : `<div class="studio-custom-media-placeholder">Add media in Studio</div>`;
      const buttonHtml = c.buttonLabel
        ? `<a class="studio-custom-button" href="${escapeHtml(c.buttonHref || "#")}">${escapeHtml(c.buttonLabel)}</a>`
        : "";

      return `
        <div class="studio-custom-inner studio-custom-split" data-align="${escapeHtml(block.style.align)}">
          <div class="studio-custom-media">${imageHtml}</div>
          <div class="studio-custom-copy">
            <p class="studio-custom-kicker">${escapeHtml(c.kicker || "")}</p>
            <h3>${escapeHtml(c.heading || "")}</h3>
            <p>${escapeHtml(c.body || "")}</p>
            ${buttonHtml}
          </div>
        </div>
      `;
    }

    if (block.type === "cta") {
      const buttonHtml = c.buttonLabel
        ? `<a class="studio-custom-button" href="${escapeHtml(c.buttonHref || "#")}">${escapeHtml(c.buttonLabel)}</a>`
        : "";
      return `
        <div class="studio-custom-inner studio-custom-cta" data-align="${escapeHtml(block.style.align)}">
          <h3>${escapeHtml(c.heading || "")}</h3>
          <p>${escapeHtml(c.body || "")}</p>
          ${buttonHtml}
        </div>
      `;
    }

    const buttonHtml = c.buttonLabel
      ? `<a class="studio-custom-button" href="${escapeHtml(c.buttonHref || "#")}">${escapeHtml(c.buttonLabel)}</a>`
      : "";

    return `
      <div class="studio-custom-inner studio-custom-text" data-align="${escapeHtml(block.style.align)}">
        <p class="studio-custom-kicker">${escapeHtml(c.kicker || "")}</p>
        <h3>${escapeHtml(c.heading || "")}</h3>
        <p>${escapeHtml(c.body || "")}</p>
        ${buttonHtml}
      </div>
    `;
  }

  function applySectionStyle(section, style) {
    const normalized = normalizeSectionStyle(style, DEFAULT_SECTION_STYLE);
    section.style.paddingTop = normalized.padTop ? `${normalized.padTop}px` : "";
    section.style.paddingBottom = normalized.padBottom ? `${normalized.padBottom}px` : "";
    section.style.background = normalized.background || "";
    section.style.color = normalized.textColor || "";
    section.style.borderRadius = normalized.radius ? `${normalized.radius}px` : "";
    section.setAttribute("data-align", normalized.align);

    if (normalized.layoutMode === "free") {
      section.style.position = "absolute";
      section.style.left = `${normalized.freeX}px`;
      section.style.top = `${normalized.freeY}px`;
      section.style.width = normalized.freeW > 0 ? `${normalized.freeW}px` : "min(860px, calc(100% - 24px))";
      section.style.maxWidth = "none";
      section.style.marginLeft = "0";
      section.style.marginRight = "0";
      section.style.zIndex = String(normalized.zIndex || 1);
      section.style.pointerEvents = "";
      if (normalized.freeH > 0) {
        section.style.height = `${normalized.freeH}px`;
        section.style.overflow = "auto";
      } else {
        section.style.height = "";
        section.style.overflow = "";
      }
      section.setAttribute("data-layout-mode", "free");
      return;
    }

    section.style.position = "";
    section.style.left = "";
    section.style.top = "";
    section.style.width = "";
    section.style.height = "";
    section.style.zIndex = "";
    section.style.overflow = "";
    section.style.maxWidth = normalized.maxWidth ? `${normalized.maxWidth}px` : "";
    section.style.marginLeft = normalized.maxWidth ? "auto" : "";
    section.style.marginRight = normalized.maxWidth ? "auto" : "";
    section.setAttribute("data-layout-mode", "flow");
  }

  function upsertCustomBlockElement(doc, homeMain, block) {
    const key = makeCustomKey(block.id);
    let section = homeMain.querySelector(`[data-studio-section="${key}"]`);
    if (!section) {
      section = doc.createElement("section");
      section.className = "studio-custom-block";
      section.setAttribute("data-studio-section", key);
      section.setAttribute("data-custom-block", "yes");
      homeMain.appendChild(section);
    }

    section.className = `studio-custom-block studio-custom-${block.type.replace(/_/g, "-")}`;
    section.setAttribute("data-custom-type", block.type);
    section.setAttribute("data-custom-id", block.id);
    section.innerHTML = buildCustomBlockHtml(block);

    return section;
  }

  function applyHomeLayout(doc, settings) {
    const homeMain = doc.querySelector("main.page");
    if (!homeMain) return;

    const blockByKey = new Map(settings.layout.customBlocks.map((block) => [makeCustomKey(block.id), block]));

    const staleCustom = Array.from(homeMain.querySelectorAll('[data-custom-block="yes"]'));
    staleCustom.forEach((el) => {
      const key = el.getAttribute("data-studio-section") || "";
      if (!blockByKey.has(key)) el.remove();
    });

    const sectionMap = new Map();
    homeMain.querySelectorAll("[data-studio-section]").forEach((el) => {
      sectionMap.set(el.getAttribute("data-studio-section"), el);
    });

    settings.layout.customBlocks.forEach((block) => {
      const el = upsertCustomBlockElement(doc, homeMain, block);
      sectionMap.set(makeCustomKey(block.id), el);
    });

    const allKeys = getAllSectionKeys(settings);
    const orderedKeys = normalizeSectionOrder(settings.layout.homeSectionOrder, allKeys);
    orderedKeys.forEach((key) => {
      const section = sectionMap.get(key);
      if (section) homeMain.appendChild(section);
    });

    const worksEnabled = isOn(settings.featureToggles.works_section_under_super_syd);
    const works3dEnabled = worksEnabled && isOn(settings.featureToggles.works_section_3d_poster_mode);

    let freeBottom = 0;

    orderedKeys.forEach((key) => {
      const section = sectionMap.get(key);
      if (!section) return;

      let visible = isOn(settings.layout.sectionVisibility[key] || "ON");
      if (key === "works_intro") visible = visible && worksEnabled;
      if (key === "works_classic") visible = visible && worksEnabled && !works3dEnabled;
      if (key === "works_3d") visible = visible && worksEnabled && works3dEnabled;

      if (isCustomKey(key)) {
        const block = blockByKey.get(key);
        if (block) visible = visible && isOn(block.visible);
      }

      setVisibility(section, visible);

      const styleSource = settings.layout.sectionStyles[key] || DEFAULT_SECTION_STYLE;
      const block = blockByKey.get(key);
      const mergedStyle = block ? { ...block.style, ...styleSource } : styleSource;
      applySectionStyle(section, mergedStyle);

      const normalizedStyle = normalizeSectionStyle(mergedStyle, DEFAULT_SECTION_STYLE);
      if (visible && normalizedStyle.layoutMode === "free") {
        const heightGuess = normalizedStyle.freeH > 0 ? normalizedStyle.freeH : section.offsetHeight || 220;
        freeBottom = Math.max(freeBottom, normalizedStyle.freeY + heightGuess + 40);
      }
    });

    homeMain.style.position = "relative";
    const flowBottom = Array.from(homeMain.querySelectorAll("[data-studio-section]")).reduce((max, section) => {
      if (section.hidden) return max;
      if (section.getAttribute("data-layout-mode") === "free") return max;
      return Math.max(max, section.offsetTop + section.offsetHeight + 20);
    }, 0);
    const minHeight = Math.max(flowBottom, freeBottom, 0);
    homeMain.style.minHeight = minHeight > 0 ? `${minHeight}px` : "";
  }

  function detectDraftMode(options = {}) {
    if (options.mode === "draft") return true;
    if (options.mode === "published") return false;

    const search = window.location.search || "";
    const params = new URLSearchParams(search);
    return params.get("studioMode") === "draft";
  }

  function applySiteSettings(doc = document, options = {}) {
    const useDraft = detectDraftMode(options);
    const settings = useDraft ? loadDraftSettings() : loadPublishedSettings();

    const html = doc.documentElement || document.documentElement;
    html.setAttribute("data-site-theme", settings.theme.toLowerCase());
    applyDesignSettings(doc, settings);
    applyOpeningContent(doc, settings);

    const path = window.location.pathname.split("/").pop() || "index.html";
    const currentPageKey = PAGE_KEY_BY_FILE[path] || null;
    if (currentPageKey && !isOn(settings.pageToggles[currentPageKey]) && !useDraft) {
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

  function loadSettings() {
    return loadPublishedSettings();
  }

  function saveSettings(settings) {
    const normalized = normalizeSettings(settings);
    savePublishedSettings(normalized);
    saveDraftSettings(normalized);
    return normalized;
  }

  window.SiteSettings = {
    STORAGE_KEYS: { ...STORAGE_KEYS },
    STORAGE_KEY: STORAGE_KEYS.published,
    HOME_SECTION_KEYS: [...HOME_BASE_SECTION_KEYS],
    HOME_SECTION_LABELS: { ...HOME_BASE_SECTION_LABELS },
    CUSTOM_BLOCK_TYPE_LABELS: { ...CUSTOM_BLOCK_TYPE_LABELS },
    CUSTOM_BLOCK_TEMPLATES: clone(CUSTOM_BLOCK_TEMPLATES),
    DEFAULT_SETTINGS: clone(DEFAULT_SETTINGS),
    PAGE_KEY_BY_FILE: clone(PAGE_KEY_BY_FILE),
    isOn,
    toEmbedUrl,
    normalizeSettings,
    loadSettings,
    saveSettings,
    resetSettings,
    loadPublishedSettings,
    savePublishedSettings,
    loadDraftSettings,
    saveDraftSettings,
    publishDraft,
    discardDraftSettings,
    hasDraftChanges,
    getAllSectionKeys,
    getSectionCatalog,
    getOrderedProjects,
    createCustomBlock,
    insertCustomBlock,
    duplicateCustomBlock,
    deleteCustomBlock,
    updateCustomBlock,
    reorderSections,
    setSectionVisibility,
    setSectionLock,
    setSectionStyle,
    upsertMediaItem,
    deleteMediaItem,
    applySiteSettings
  };
})();
