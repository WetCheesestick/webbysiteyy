import { expect, test, type Page } from "@playwright/test";

async function exitFocusModeIfNeeded(page: Page) {
  const leftPanel = page.locator("#left-panel");
  if (await leftPanel.isVisible()) return;

  const toggle = page.locator("#toggle-focus-mode");
  if (await toggle.isVisible()) {
    await toggle.click();
  }

  await expect(leftPanel).toBeVisible();
  await expect(page.locator("#right-panel")).toBeVisible();
}

async function ensureInspectorReady(page: Page) {
  const inspectorContent = page.locator("#inspector-content");
  if (await inspectorContent.isVisible()) return;

  const firstLayerSelect = page.locator("#layer-list [data-layer-key] button[data-action='select']").first();
  await expect(firstLayerSelect).toBeVisible();
  await firstLayerSelect.click();
  await expect(inspectorContent).toBeVisible();
}

async function unlockStudio(page: Page) {
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.goto("/studio-8391.html");

  const setupPanel = page.locator("#setup-panel");
  const loginPanel = page.locator("#login-panel");

  if (await setupPanel.isVisible()) {
    await page.fill("#setup-passphrase", "studio-passphrase");
    await page.fill("#setup-passphrase-confirm", "studio-passphrase");
    await page.click("#setup-form button[type='submit']");
  } else if (await loginPanel.isVisible()) {
    await page.fill("#login-passphrase", "studio-passphrase");
    await page.click("#login-form button[type='submit']");
  }

  await expect(page.locator("#editor-panel")).toBeVisible();
  await exitFocusModeIfNeeded(page);
}

function okValidationPayload() {
  return {
    ok: true,
    warnings: [],
    checks: {},
    files: [],
    noindex: [],
    publishingStatus: "validated",
    commit: "",
    branch: "",
    status: "",
    output: "Validation passed.",
    errors: []
  };
}

test("keyboard-only editing flow can add, modify, and publish without mouse", async ({ page }) => {
  await page.route("**/__studio/validate", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(okValidationPayload()) });
  });

  await page.route("**/__studio/publish", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...okValidationPayload(),
        files: ["assets/js/studio-published-settings.js", "assets/js/studio-published-settings.json"],
        noindex: [],
        publishingStatus: "saved_local",
        output: "Saved locally."
      })
    });
  });

  await unlockStudio(page);

  const layerRows = page.locator("#layer-list [data-layer-key]");
  const beforeCount = await layerRows.count();

  const quickAddHero = page.locator("#quick-add-hero");
  await expect(quickAddHero).toBeVisible();
  await quickAddHero.focus();
  await page.keyboard.press("Enter");

  await expect(async () => {
    expect(await layerRows.count()).toBeGreaterThan(beforeCount);
  }).toPass();

  await page.locator("#layer-list [data-layer-key] button[data-action='select']").first().focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");

  await page.locator("#publish-folder").focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("#status-pill")).toContainText("Published to folder");
});

test("inspector tabs and live region expose screen-reader state", async ({ page }) => {
  await unlockStudio(page);
  await ensureInspectorReady(page);

  const globalTab = page.locator("[data-inspector-tab-btn='global']");
  const layerTab = page.locator("[data-inspector-tab-btn='layer']");

  await expect(globalTab).toHaveAttribute("role", "tab");
  await expect(globalTab).toHaveAttribute("aria-selected", "true");

  await globalTab.focus();
  await page.keyboard.press("ArrowRight");

  await expect(layerTab).toHaveAttribute("aria-selected", "true");
  await expect(layerTab).toHaveAttribute("tabindex", "0");

  await page.locator("#save-draft").focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("#studio-live-region")).not.toHaveText("");
});

test("youtube probing keeps intro/background quality state independent", async ({ page }) => {
  await page.route("**/__studio/youtube-resolutions", async (route) => {
    const raw = route.request().postData() || "{}";
    const body = JSON.parse(raw) as { url?: string };
    const url = String(body.url || "");
    const tiers = url.includes("INTROPRB001") ? ["hd1080", "hd720"] : ["hd2160", "hd1080"];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, videoId: "AbCdEfGhI01", tiers })
    });
  });

  await unlockStudio(page);
  await ensureInspectorReady(page);
  await page.click("[data-inspector-tab-btn='global']");

  await page.fill("#intro-single-url", "https://www.youtube.com/watch?v=INTROPRB001");
  await page.fill("#background-video-url", "https://www.youtube.com/watch?v=BACKGPRB01A");
  await page.click("#refresh-youtube-resolutions");

  await expect(page.locator("#intro-quality-available")).toContainText("Available resolutions");
  await expect(page.locator("#background-quality-available")).toContainText("Available resolutions");

  await expect(page.locator("#intro-quality-target option[value='hd720']")).toHaveCount(1);
  await expect(page.locator("#background-quality-target option[value='hd2160']")).toHaveCount(1);
});

test("page OFF behavior keeps noindex preview and publish payload aligned", async ({ page }) => {
  let publishRequest: Record<string, unknown> | null = null;

  await page.route("**/__studio/validate", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(okValidationPayload()) });
  });

  await page.route("**/__studio/publish", async (route) => {
    publishRequest = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...okValidationPayload(),
        publishingStatus: "saved_local",
        files: ["assets/js/studio-published-settings.js"],
        noindex: [{ pageKey: "projects", file: "projects.html", noindex: true, exists: true, updated: true }],
        output: "Saved."
      })
    });
  });

  await unlockStudio(page);
  await ensureInspectorReady(page);

  await page.click("[data-page-key='projects']");
  await page.click("[data-inspector-tab-btn='global']");

  const projectsToggle = page.locator("#toggle-page-projects");
  await projectsToggle.check();
  await projectsToggle.uncheck();

  await expect(page.locator("#seo-noindex-preview")).toContainText("Noindex preview: ON");

  await page.click("#publish-folder");

  await expect(page.locator("#status-pill")).toContainText("Noindex pages");
  expect(publishRequest).not.toBeNull();
  expect((publishRequest as any).settings.pageToggles.projects).toBe("OFF");
});

test("publish-live diagnostics include commit hash and git status", async ({ page }) => {
  await page.route("**/__studio/validate", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(okValidationPayload()) });
  });

  await page.route("**/__studio/publish-live", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...okValidationPayload(),
        publishingStatus: "live_published",
        files: ["assets/js/studio-published-settings.js"],
        noindex: [],
        git_pushed: true,
        commit: "deadbee",
        branch: "main",
        status: "## main",
        output: "push complete"
      })
    });
  });

  await unlockStudio(page);
  await page.click("#publish-draft");

  await expect(page.locator("#publish-report")).toContainText("deadbee");
  await expect(page.locator("#status-pill")).toContainText("Git pushed");
});

test("responsive preview modes remain stable across desktop/tablet/mobile", async ({ page }) => {
  await unlockStudio(page);

  const shell = page.locator("#preview-shell");
  await expect(shell).toBeVisible();

  await page.click(".view-btn[data-view='desktop']");
  await expect(shell).toHaveClass(/view-desktop/);

  await page.click(".view-btn[data-view='tablet']");
  await expect(shell).toHaveClass(/view-tablet/);

  await page.click(".view-btn[data-view='mobile']");
  await expect(shell).toHaveClass(/view-mobile/);

  await expect(page.locator("#preview-overlay")).toBeVisible();
});
