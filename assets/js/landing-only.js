(() => {
  if (!window.SiteSettings || typeof window.SiteSettings.applySiteSettings !== "function") return;
  window.SiteSettings.applySiteSettings(document);
})();
