(() => {
  const api = window.SiteSettings;
  if (!api) return;

  const AUTH_KEY = "julian_site_studio_auth_v1";
  const AUTH_SALT = "julian-site-studio-v1";
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const setupPanel = document.getElementById("setup-panel");
  const loginPanel = document.getElementById("login-panel");
  const editorPanel = document.getElementById("editor-panel");
  const statusEl = document.getElementById("studio-status");
  const unsavedEl = document.getElementById("studio-unsaved");
  const sectionSortList = document.getElementById("section-sort-list");
  const projectSortList = document.getElementById("project-order-list");
  const previewFrame = document.getElementById("studio-preview");

  let sectionOrder = [...api.HOME_SECTION_KEYS];
  let sectionVisibility = {};
  let projectOrder = [];
  let isDirty = false;

  function field(id) {
    return document.getElementById(id);
  }

  function setStatus(message, type = "info") {
    statusEl.textContent = message;
    statusEl.dataset.status = type;
  }

  function setDirty(next) {
    isDirty = Boolean(next);
    unsavedEl.textContent = isDirty ? "Unsaved changes" : "Saved";
    unsavedEl.dataset.unsaved = isDirty ? "yes" : "no";
  }

  function onOff(checked) {
    return checked ? "ON" : "OFF";
  }

  function normalizeSectionOrder(order) {
    const seen = new Set();
    const out = [];
    if (Array.isArray(order)) {
      order.forEach((key) => {
        if (!api.HOME_SECTION_KEYS.includes(key) || seen.has(key)) return;
        seen.add(key);
        out.push(key);
      });
    }
    api.HOME_SECTION_KEYS.forEach((key) => {
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

  function getProjectCount() {
    return api.DEFAULT_SETTINGS.content.projects.length;
  }

  async function hashPassphrase(passphrase) {
    const clean = String(passphrase || "").trim();
    if (!clean) return "";
    if (!window.crypto || !window.crypto.subtle) {
      return `${AUTH_SALT}:${btoa(clean)}`;
    }
    const bytes = new TextEncoder().encode(`${AUTH_SALT}|${clean}`);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getStoredAuthHash() {
    try {
      return window.localStorage.getItem(AUTH_KEY) || "";
    } catch (_err) {
      return "";
    }
  }

  function setStoredAuthHash(hash) {
    try {
      window.localStorage.setItem(AUTH_KEY, hash);
    } catch (_err) {
      // Ignore storage errors.
    }
  }

  function clearStoredAuthHash() {
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch (_err) {
      // Ignore storage errors.
    }
  }

  function showPanel(panelName) {
    const setPanelState = (panel, visible) => {
      panel.hidden = !visible;
      panel.classList.toggle("hidden", !visible);
    };
    setPanelState(setupPanel, panelName === "setup");
    setPanelState(loginPanel, panelName === "login");
    setPanelState(editorPanel, panelName === "editor");
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".studio-sort-item:not(.dragging)")
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  function makeSortable(listEl, parseKey, onSorted) {
    listEl.ondragover = (event) => {
      event.preventDefault();
      const dragging = listEl.querySelector(".studio-sort-item.dragging");
      if (!dragging) return;
      const afterElement = getDragAfterElement(listEl, event.clientY);
      if (!afterElement) {
        listEl.appendChild(dragging);
      } else {
        listEl.insertBefore(dragging, afterElement);
      }
    };

    listEl.querySelectorAll(".studio-sort-item").forEach((item) => {
      item.draggable = true;
      item.ondragstart = () => {
        item.classList.add("dragging");
      };
      item.ondragend = () => {
        item.classList.remove("dragging");
        const keys = [...listEl.querySelectorAll(".studio-sort-item")].map((node) =>
          parseKey(node.getAttribute("data-key"))
        );
        onSorted(keys);
      };
    });
  }

  function renderSectionSortList() {
    sectionOrder = normalizeSectionOrder(sectionOrder);
    sectionSortList.innerHTML = "";

    sectionOrder.forEach((key) => {
      const item = document.createElement("li");
      item.className = "studio-sort-item";
      item.setAttribute("data-key", key);
      item.innerHTML = `
        <span class="drag-handle" aria-hidden="true">⋮⋮</span>
        <div class="sort-copy">
          <strong>${api.HOME_SECTION_LABELS[key] || key}</strong>
          <span>Drag to reorder</span>
        </div>
        <label class="switch">
          <input type="checkbox" class="section-visible" ${api.isOn(sectionVisibility[key]) ? "checked" : ""}>
          <span>Visible</span>
        </label>
      `;
      const toggle = item.querySelector(".section-visible");
      toggle.addEventListener("change", () => {
        sectionVisibility[key] = onOff(toggle.checked);
        setDirty(true);
      });
      sectionSortList.appendChild(item);
    });

    makeSortable(
      sectionSortList,
      (value) => value,
      (nextOrder) => {
        sectionOrder = normalizeSectionOrder(nextOrder);
        setDirty(true);
      }
    );
  }

  function renderProjectOrderList() {
    const total = getProjectCount();
    projectOrder = normalizeProjectOrder(projectOrder, total);
    projectSortList.innerHTML = "";

    projectOrder.forEach((index) => {
      const title = field(`project-${index + 1}-title`)?.value || `Project ${index + 1}`;
      const meta = field(`project-${index + 1}-meta`)?.value || "";
      const item = document.createElement("li");
      item.className = "studio-sort-item";
      item.setAttribute("data-key", String(index));
      item.innerHTML = `
        <span class="drag-handle" aria-hidden="true">⋮⋮</span>
        <div class="sort-copy">
          <strong>${title}</strong>
          <span>${meta}</span>
        </div>
      `;
      projectSortList.appendChild(item);
    });

    makeSortable(
      projectSortList,
      (value) => Number(value),
      (nextOrder) => {
        projectOrder = normalizeProjectOrder(nextOrder, total);
        setDirty(true);
      }
    );
  }

  function fillForm(settings) {
    field("theme").value = settings.theme;
    field("hero-frame-pad").value = settings.design.heroFramePad;
    field("hero-header-height").value = settings.design.heroHeaderHeight;
    field("hero-tile-width").value = settings.design.heroTileWidth;
    field("hero-tile-height").value = settings.design.heroTileHeight;
    field("card-radius").value = settings.design.cardRadius;

    field("toggle-works").checked = api.isOn(settings.featureToggles.works_section_under_super_syd);
    field("toggle-works-3d").checked = api.isOn(settings.featureToggles.works_section_3d_poster_mode);
    field("toggle-projects").checked = api.isOn(settings.pageToggles.projects);
    field("toggle-about").checked = api.isOn(settings.pageToggles.about);
    field("toggle-privacy").checked = api.isOn(settings.pageToggles.privacy);
    field("toggle-project-aastry").checked = api.isOn(settings.pageToggles.project_aastry);
    field("toggle-project-crimson-ring").checked = api.isOn(settings.pageToggles.project_crimson_ring);
    field("toggle-project-super-syd").checked = api.isOn(settings.pageToggles.project_super_syd);

    field("works-title").value = settings.content.works.title;
    field("works-lede").value = settings.content.works.lede;
    field("coming-soon-copy").value = settings.content.superSyd.comingSoonCopy;
    field("teaser-url").value = settings.content.superSyd.teaserEmbedUrl;
    field("previs-url").value = settings.content.superSyd.previsEmbedUrl;

    settings.content.projects.forEach((project, index) => {
      const n = index + 1;
      field(`project-${n}-title`).value = project.title;
      field(`project-${n}-meta`).value = project.meta;
      field(`project-${n}-poster`).value = project.posterSrc;
      field(`project-${n}-alt`).value = project.posterAlt;
      field(`project-${n}-detail`).value = project.detail;
      field(`project-${n}-link`).value = project.link;
      field(`project-${n}-page-key`).textContent = project.pageKey;
    });

    sectionOrder = normalizeSectionOrder(settings.layout.homeSectionOrder);
    sectionVisibility = clone(settings.layout.sectionVisibility);
    projectOrder = normalizeProjectOrder(settings.layout.projectOrder, getProjectCount());

    renderSectionSortList();
    renderProjectOrderList();
    setDirty(false);
  }

  function collectForm() {
    const base = api.loadSettings();
    const settings = clone(base);

    settings.theme = field("theme").value === "DARK" ? "DARK" : "LIGHT";
    settings.design.heroFramePad = Number(field("hero-frame-pad").value);
    settings.design.heroHeaderHeight = Number(field("hero-header-height").value);
    settings.design.heroTileWidth = Number(field("hero-tile-width").value);
    settings.design.heroTileHeight = Number(field("hero-tile-height").value);
    settings.design.cardRadius = Number(field("card-radius").value);

    settings.featureToggles.works_section_under_super_syd = onOff(field("toggle-works").checked);
    settings.featureToggles.works_section_3d_poster_mode = onOff(field("toggle-works-3d").checked);
    settings.pageToggles.projects = onOff(field("toggle-projects").checked);
    settings.pageToggles.about = onOff(field("toggle-about").checked);
    settings.pageToggles.privacy = onOff(field("toggle-privacy").checked);
    settings.pageToggles.project_aastry = onOff(field("toggle-project-aastry").checked);
    settings.pageToggles.project_crimson_ring = onOff(field("toggle-project-crimson-ring").checked);
    settings.pageToggles.project_super_syd = onOff(field("toggle-project-super-syd").checked);

    settings.layout.homeSectionOrder = normalizeSectionOrder(sectionOrder);
    settings.layout.sectionVisibility = {
      ...settings.layout.sectionVisibility,
      ...sectionVisibility
    };
    settings.layout.projectOrder = normalizeProjectOrder(projectOrder, getProjectCount());

    settings.content.works.title = field("works-title").value;
    settings.content.works.lede = field("works-lede").value;
    settings.content.superSyd.comingSoonCopy = field("coming-soon-copy").value;
    settings.content.superSyd.teaserEmbedUrl = api.toEmbedUrl(
      field("teaser-url").value,
      settings.content.superSyd.teaserEmbedUrl
    );
    settings.content.superSyd.previsEmbedUrl = api.toEmbedUrl(
      field("previs-url").value,
      settings.content.superSyd.previsEmbedUrl
    );

    settings.content.projects = settings.content.projects.map((project, index) => {
      const n = index + 1;
      return {
        ...project,
        title: field(`project-${n}-title`).value,
        meta: field(`project-${n}-meta`).value,
        posterSrc: field(`project-${n}-poster`).value,
        posterAlt: field(`project-${n}-alt`).value,
        detail: field(`project-${n}-detail`).value,
        link: field(`project-${n}-link`).value
      };
    });

    return api.normalizeSettings(settings);
  }

  function exportSettings() {
    const settings = api.loadSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "julian-site-settings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function refreshPreview() {
    if (!previewFrame) return;
    previewFrame.src = `index.html?studioPreview=${Date.now()}`;
  }

  function applyPreset(type) {
    const current = collectForm();
    if (type === "landing") {
      current.featureToggles.works_section_under_super_syd = "OFF";
      current.featureToggles.works_section_3d_poster_mode = "OFF";
      Object.keys(current.pageToggles).forEach((key) => {
        current.pageToggles[key] = "OFF";
      });
      current.layout.sectionVisibility.super_syd = "ON";
      current.layout.sectionVisibility.works_intro = "OFF";
      current.layout.sectionVisibility.works_classic = "OFF";
      current.layout.sectionVisibility.works_3d = "OFF";
    } else if (type === "portfolio") {
      current.featureToggles.works_section_under_super_syd = "ON";
      current.featureToggles.works_section_3d_poster_mode = "ON";
      Object.keys(current.pageToggles).forEach((key) => {
        current.pageToggles[key] = "ON";
      });
      Object.keys(current.layout.sectionVisibility).forEach((key) => {
        current.layout.sectionVisibility[key] = "ON";
      });
    } else if (type === "classic") {
      current.featureToggles.works_section_under_super_syd = "ON";
      current.featureToggles.works_section_3d_poster_mode = "OFF";
      current.layout.sectionVisibility.works_classic = "ON";
      current.layout.sectionVisibility.works_3d = "OFF";
    }

    fillForm(api.normalizeSettings(current));
    setDirty(true);
    setStatus("Preset applied. Click Save Settings to publish.", "info");
  }

  async function setupPassphrase(event) {
    event.preventDefault();
    const passphrase = field("setup-passphrase").value;
    const confirm = field("setup-passphrase-confirm").value;
    if (!passphrase.trim()) {
      setStatus("Passphrase cannot be empty.", "error");
      return;
    }
    if (passphrase !== confirm) {
      setStatus("Passphrase mismatch. Re-enter both values.", "error");
      return;
    }
    const hash = await hashPassphrase(passphrase);
    setStoredAuthHash(hash);
    field("setup-passphrase").value = "";
    field("setup-passphrase-confirm").value = "";
    startEditor();
    setStatus("Studio unlocked. Settings are now editable.", "ok");
  }

  async function login(event) {
    event.preventDefault();
    const passphrase = field("login-passphrase").value;
    const enteredHash = await hashPassphrase(passphrase);
    const storedHash = getStoredAuthHash();
    if (!storedHash || enteredHash !== storedHash) {
      setStatus("Incorrect passphrase.", "error");
      return;
    }
    field("login-passphrase").value = "";
    startEditor();
    setStatus("Studio unlocked.", "ok");
  }

  function startEditor() {
    showPanel("editor");
    fillForm(api.loadSettings());
    refreshPreview();
  }

  function logout() {
    showPanel("login");
    setStatus("Locked. Enter passphrase to edit.", "info");
  }

  async function initialize() {
    const storedHash = getStoredAuthHash();
    if (!storedHash) {
      showPanel("setup");
      setStatus("Create a passphrase to initialize Studio.", "info");
      return;
    }
    showPanel("login");
    setStatus("Enter passphrase to unlock Studio.", "info");
  }

  document.getElementById("setup-form").addEventListener("submit", setupPassphrase);
  document.getElementById("login-form").addEventListener("submit", login);

  field("save-settings").addEventListener("click", () => {
    const saved = api.saveSettings(collectForm());
    fillForm(saved);
    refreshPreview();
    setStatus("Saved and published to local settings.", "ok");
  });

  field("revert-settings").addEventListener("click", () => {
    fillForm(api.loadSettings());
    setStatus("Reverted to last saved settings.", "info");
  });

  field("reset-settings").addEventListener("click", () => {
    const defaults = api.resetSettings();
    fillForm(defaults);
    refreshPreview();
    setStatus("Reset to defaults.", "ok");
  });

  field("export-settings").addEventListener("click", () => {
    exportSettings();
    setStatus("Settings exported.", "ok");
  });

  field("refresh-preview").addEventListener("click", () => {
    refreshPreview();
  });

  field("preset-landing").addEventListener("click", () => applyPreset("landing"));
  field("preset-portfolio").addEventListener("click", () => applyPreset("portfolio"));
  field("preset-classic").addEventListener("click", () => applyPreset("classic"));

  field("import-settings-file").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const saved = api.saveSettings(parsed);
      fillForm(saved);
      refreshPreview();
      setStatus("Imported and saved.", "ok");
    } catch (_err) {
      setStatus("Import failed. File must be valid JSON.", "error");
    }
    event.target.value = "";
  });

  field("open-home").addEventListener("click", () => {
    window.open("index.html", "_blank", "noopener");
  });

  field("studio-logout").addEventListener("click", logout);
  field("clear-passphrase").addEventListener("click", () => {
    clearStoredAuthHash();
    showPanel("setup");
    setStatus("Passphrase cleared. Set a new one.", "info");
  });

  editorPanel.addEventListener("input", (event) => {
    setDirty(true);
    if (event.target.id && event.target.id.match(/^project-\d+-title$/)) {
      renderProjectOrderList();
    }
  });
  editorPanel.addEventListener("change", () => {
    setDirty(true);
  });

  initialize();
})();
