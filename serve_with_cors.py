#!/usr/bin/env python3
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT_DIR = Path(__file__).resolve().parent
PUBLISHED_SETTINGS_JS = ROOT_DIR / "assets" / "js" / "studio-published-settings.js"
PUBLISHED_SETTINGS_JSON = ROOT_DIR / "assets" / "js" / "studio-published-settings.json"
PUBLISHED_SNAPSHOT_JSON = ROOT_DIR / "assets" / "js" / "studio-published-settings.snapshot.json"
PUBLISH_SCRIPT = ROOT_DIR / "scripts" / "publish-site.sh"
MANAGED_ROBOTS_TAG = '<meta name="robots" content="noindex,nofollow,noarchive" data-studio-robots="1" />'
PAGE_NOINDEX_FILES = {
    "index": "index.html",
    "projects": "projects.html",
    "about": "about.html",
    "privacy": "privacy-policy.html",
    "project_aastry": "project-aastry.html",
    "project_crimson_ring": "project-crimson-ring.html",
    "project_super_syd": "project-super-syd.html",
}
STUDIO_ENDPOINTS = {
    "/__studio/publish",
    "/__studio/publish-live",
    "/__studio/validate",
    "/__studio/youtube-resolutions",
    "/__studio/rollback-published",
}
YT_DLP_TIMEOUT_SECONDS = 15
YT_QUALITY_TIER_BY_HEIGHT = [
    (2880, "hd2880"),
    (2160, "hd2160"),
    (1440, "hd1440"),
    (1080, "hd1080"),
    (720, "hd720"),
    (480, "large"),
    (360, "medium"),
    (240, "small"),
    (0, "tiny"),
]
YT_TIER_SORT_ORDER = ["highres", "hd2880", "hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny"]
VALID_ON_OFF = {"ON", "OFF"}
VALID_DENSITIES = {"comfortable", "compact"}
REQUIRED_TEXT_PATHS = [
    ("content.works.title", "Works title is required."),
    ("content.works.lede", "Works subtitle is required."),
    ("content.opening.singleIntroEmbedUrl", "Single intro YouTube URL is required."),
    ("content.opening.backgroundEmbedUrl", "Background YouTube URL is required."),
]
HEX_COLOR_RE = re.compile(r"^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$")


def make_checks_payload():
    return {
        "accessibility": {"ok": True, "items": []},
        "youtube": {"ok": True, "items": []},
        "seo": {"ok": True, "items": []},
        "media": {"ok": True, "items": []},
        "pageToggles": {"ok": True, "items": []},
        "schema": {"ok": True, "items": []},
        "layout": {"ok": True, "items": []},
        "designTokens": {"ok": True, "items": []},
    }


def make_contract_base():
    return {
        "ok": True,
        "warnings": [],
        "checks": make_checks_payload(),
        "files": [],
        "noindex": [],
        "publishingStatus": "idle",
        "commit": "",
        "branch": "",
        "status": "",
        "output": "",
    }


def get_path_value(payload, path, default=None):
    cursor = payload
    for segment in path.split("."):
        if not isinstance(cursor, dict) or segment not in cursor:
            return default
        cursor = cursor[segment]
    return cursor


def append_issue(bucket, code, message, path="", meta=None):
    issue = {
        "code": str(code or "").strip() or "UNKNOWN",
        "message": str(message or "").strip() or "Validation issue",
    }
    if path:
        issue["path"] = path
    if isinstance(meta, dict) and meta:
        issue["meta"] = meta
    bucket.append(issue)


def parse_hex_color(value):
    text = str(value or "").strip()
    if not HEX_COLOR_RE.fullmatch(text):
        return None
    token = text[1:]
    if len(token) == 3:
        token = "".join(ch * 2 for ch in token)
    return tuple(int(token[idx : idx + 2], 16) for idx in (0, 2, 4))


def relative_luminance(rgb):
    if not isinstance(rgb, tuple) or len(rgb) != 3:
        return 0.0

    def channel(value):
        normalized = value / 255.0
        if normalized <= 0.03928:
            return normalized / 12.92
        return ((normalized + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(hex_a, hex_b):
    rgb_a = parse_hex_color(hex_a)
    rgb_b = parse_hex_color(hex_b)
    if not rgb_a or not rgb_b:
        return None
    lum_a = relative_luminance(rgb_a)
    lum_b = relative_luminance(rgb_b)
    lighter = max(lum_a, lum_b)
    darker = min(lum_a, lum_b)
    return (lighter + 0.05) / (darker + 0.05)


def is_valid_http_url(value):
    text = str(value or "").strip()
    if not text:
        return False
    try:
        parsed = urlparse(text)
    except Exception:
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def normalize_on_off(value, fallback="ON"):
    token = str(value if value is not None else fallback).strip().upper()
    return token if token in VALID_ON_OFF else str(fallback).strip().upper()


def is_on(value):
    return normalize_on_off(value, "ON") == "ON"


def normalize_media_url(value):
    return str(value or "").strip()


def normalize_noindex_bool(value, fallback=False):
    if isinstance(value, bool):
        return value
    return bool(fallback)


def build_noindex_expectations(settings):
    page_toggles = settings.get("pageToggles") if isinstance(settings, dict) else {}
    page_toggles = page_toggles if isinstance(page_toggles, dict) else {}
    pages = settings.get("pages") if isinstance(settings, dict) else {}
    pages = pages if isinstance(pages, dict) else {}

    entries = []
    for page_key, relative_path in PAGE_NOINDEX_FILES.items():
        toggle_value = normalize_on_off(page_toggles.get(page_key, "ON"), "ON")
        enabled = toggle_value == "ON"
        expected_noindex = not enabled

        page_cfg = pages.get(page_key)
        page_cfg = page_cfg if isinstance(page_cfg, dict) else {}
        seo_cfg = page_cfg.get("seo")
        seo_cfg = seo_cfg if isinstance(seo_cfg, dict) else {}
        configured_noindex = normalize_noindex_bool(seo_cfg.get("noindex"), fallback=expected_noindex)

        entries.append(
            {
                "pageKey": page_key,
                "file": relative_path,
                "exists": (ROOT_DIR / relative_path).exists(),
                "enabled": enabled,
                "expectedNoindex": expected_noindex,
                "configuredNoindex": configured_noindex,
                "noindex": expected_noindex,
                "ok": (not expected_noindex) or configured_noindex,
            }
        )

    return entries


def collect_active_image_urls(settings):
    urls = set()
    if not isinstance(settings, dict):
        return urls

    feature_toggles = settings.get("featureToggles")
    feature_toggles = feature_toggles if isinstance(feature_toggles, dict) else {}
    page_toggles = settings.get("pageToggles")
    page_toggles = page_toggles if isinstance(page_toggles, dict) else {}

    layout = settings.get("layout")
    layout = layout if isinstance(layout, dict) else {}
    section_visibility = layout.get("sectionVisibility")
    section_visibility = section_visibility if isinstance(section_visibility, dict) else {}
    custom_blocks = layout.get("customBlocks")
    custom_blocks = custom_blocks if isinstance(custom_blocks, list) else []

    for block in custom_blocks:
        if not isinstance(block, dict):
            continue
        block_id = str(block.get("id") or "").strip()
        if not block_id:
            continue
        section_key = f"custom:{block_id}"
        visible = normalize_on_off(section_visibility.get(section_key, block.get("visible", "ON")), "ON") == "ON"
        if not visible:
            continue
        content = block.get("content")
        content = content if isinstance(content, dict) else {}
        image_src = normalize_media_url(content.get("imageSrc"))
        if image_src:
            urls.add(image_src)

    works_enabled = is_on(feature_toggles.get("works_section_under_super_syd", "ON"))
    projects_page_enabled = is_on(page_toggles.get("projects", "OFF"))
    include_project_posters = works_enabled or projects_page_enabled
    if include_project_posters:
        projects = get_path_value(settings, "content.projects", [])
        if isinstance(projects, list):
            for project in projects:
                if not isinstance(project, dict):
                    continue
                poster_src = normalize_media_url(project.get("posterSrc"))
                if poster_src:
                    urls.add(poster_src)

    return urls


def extract_youtube_video_id(raw_url):
    if raw_url is None:
        return ""
    value = str(raw_url).strip()
    if not value:
        return ""
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value

    try:
        parsed = urlparse(value)
    except Exception:
        return ""

    host = (parsed.hostname or "").lower()
    path = parsed.path or ""
    if host.startswith("www."):
        host = host[4:]

    if host == "youtu.be":
        return path.strip("/").split("/")[0]

    if host.endswith("youtube.com") or host.endswith("youtube-nocookie.com"):
        if path == "/watch":
            return parse_qs(parsed.query).get("v", [""])[0]
        if path.startswith("/shorts/") or path.startswith("/embed/"):
            parts = [part for part in path.split("/") if part]
            if len(parts) >= 2:
                return parts[1]

    return ""


def sanitize_commit_message(raw_message):
    fallback = f"Studio live publish {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    if raw_message is None:
        return fallback
    message = str(raw_message).replace("\r", " ").replace("\n", " ").strip()
    message = re.sub(r"\s+", " ", message)
    if not message:
        return fallback
    return message[:120]


def map_height_to_tier(height):
    for min_height, tier in YT_QUALITY_TIER_BY_HEIGHT:
        if height >= min_height:
            return tier
    return "tiny"


def parse_tiers_from_yt_dlp_metadata(metadata):
    tiers = set()
    formats = metadata.get("formats")
    if not isinstance(formats, list):
        formats = []

    for fmt in formats:
        if not isinstance(fmt, dict):
            continue
        vcodec = str(fmt.get("vcodec") or "").lower()
        if not vcodec or vcodec == "none":
            continue
        height = fmt.get("height")
        if isinstance(height, (int, float)):
            tiers.add(map_height_to_tier(int(height)))

    requested = metadata.get("requested_formats")
    if isinstance(requested, list):
        for fmt in requested:
            if not isinstance(fmt, dict):
                continue
            height = fmt.get("height")
            if isinstance(height, (int, float)):
                tiers.add(map_height_to_tier(int(height)))

    quality_text = str(metadata.get("quality") or "").lower()
    if "highres" in quality_text:
        tiers.add("highres")

    return [tier for tier in YT_TIER_SORT_ORDER if tier in tiers]


def resolve_youtube_resolutions(raw_url):
    url = str(raw_url or "").strip()
    video_id = extract_youtube_video_id(url)
    if not video_id:
        return {"ok": False, "error": "PARSE_FAILED"}

    yt_dlp_path = subprocess.run(
        ["which", "yt-dlp"],
        text=True,
        capture_output=True,
        check=False,
    ).stdout.strip()
    if not yt_dlp_path:
        return {"ok": False, "error": "YT_DLP_MISSING", "videoId": video_id}

    command = [yt_dlp_path, "-J", "--no-warnings", f"https://www.youtube.com/watch?v={video_id}"]
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT_DIR,
            text=True,
            capture_output=True,
            check=False,
            timeout=YT_DLP_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "NETWORK_ERROR", "videoId": video_id}

    if completed.returncode != 0:
        stderr_text = (completed.stderr or "").lower()
        stdout_text = (completed.stdout or "").lower()
        combined = f"{stderr_text}\n{stdout_text}"
        if "private video" in combined or "sign in to confirm your age" in combined:
            return {"ok": False, "error": "VIDEO_UNAVAILABLE", "videoId": video_id}
        if "embedding disabled" in combined or "not available on this app" in combined:
            return {"ok": False, "error": "VIDEO_NOT_EMBEDDABLE", "videoId": video_id}
        return {"ok": False, "error": "NETWORK_ERROR", "videoId": video_id}

    try:
        metadata = json.loads(completed.stdout or "{}")
    except json.JSONDecodeError:
        return {"ok": False, "error": "NETWORK_ERROR", "videoId": video_id}

    if metadata.get("playable_in_embed") is False:
        return {"ok": False, "error": "VIDEO_NOT_EMBEDDABLE", "videoId": video_id}

    tiers = parse_tiers_from_yt_dlp_metadata(metadata)
    if not tiers:
        return {"ok": False, "error": "VIDEO_UNAVAILABLE", "videoId": video_id}

    return {"ok": True, "videoId": video_id, "tiers": tiers}


def validate_settings_payload(settings):
    response = make_contract_base()
    response["publishingStatus"] = "validated"
    errors = []
    warnings = []
    checks = make_checks_payload()

    if not isinstance(settings, dict):
        append_issue(errors, "SETTINGS_OBJECT_REQUIRED", "settings must be an object", "settings")
        response["ok"] = False
        response["warnings"] = warnings
        response["errors"] = errors
        response["checks"] = checks
        response["noindex"] = []
        response["output"] = "Validation failed."
        return response

    noindex_expectations = build_noindex_expectations(settings)
    response["noindex"] = noindex_expectations

    schema_version = settings.get("schemaVersion", 0)
    try:
        schema_version_num = int(schema_version)
    except Exception:
        schema_version_num = 0
    checks["schema"]["items"].append({"schemaVersion": schema_version_num, "ok": schema_version_num >= 3})
    if schema_version_num < 3:
        append_issue(
            warnings,
            "SCHEMA_MIGRATION_RECOMMENDED",
            "Settings are not on schemaVersion 3 yet; Studio will migrate on publish.",
            "schemaVersion",
            {"received": schema_version},
        )

    for path, message in REQUIRED_TEXT_PATHS:
        value = str(get_path_value(settings, path, "") or "").strip()
        if not value:
            append_issue(errors, "REQUIRED_FIELD", message, path)

    intro_url = str(get_path_value(settings, "content.opening.singleIntroEmbedUrl", "") or "").strip()
    background_url = str(get_path_value(settings, "content.opening.backgroundEmbedUrl", "") or "").strip()
    intro_id = extract_youtube_video_id(intro_url)
    background_id = extract_youtube_video_id(background_url)

    checks["youtube"]["items"].append(
        {
            "field": "content.opening.singleIntroEmbedUrl",
            "ok": bool(intro_id),
            "videoId": intro_id,
            "url": intro_url,
        }
    )
    checks["youtube"]["items"].append(
        {
            "field": "content.opening.backgroundEmbedUrl",
            "ok": bool(background_id),
            "videoId": background_id,
            "url": background_url,
        }
    )

    if not intro_id:
        append_issue(
            errors,
            "YOUTUBE_URL_INVALID",
            "Single intro URL must be a valid YouTube video URL.",
            "content.opening.singleIntroEmbedUrl",
        )
    if not background_id:
        append_issue(
            errors,
            "YOUTUBE_URL_INVALID",
            "Background URL must be a valid YouTube video URL.",
            "content.opening.backgroundEmbedUrl",
        )

    reduced_motion_raw = str(get_path_value(settings, "designTokens.reducedMotion", "OFF") or "OFF").strip().upper()
    reduced_motion_valid = reduced_motion_raw in VALID_ON_OFF
    checks["designTokens"]["items"].append({"token": "reducedMotion", "value": reduced_motion_raw, "ok": reduced_motion_valid})
    if not reduced_motion_valid:
        append_issue(
            warnings,
            "REDUCED_MOTION_INVALID",
            "designTokens.reducedMotion must be ON or OFF.",
            "designTokens.reducedMotion",
            {"received": reduced_motion_raw},
        )

    density_raw = str(get_path_value(settings, "designTokens.editorDensity", "comfortable") or "comfortable").strip().lower()
    density_valid = density_raw in VALID_DENSITIES
    checks["designTokens"]["items"].append({"token": "editorDensity", "value": density_raw, "ok": density_valid})
    if not density_valid:
        append_issue(
            warnings,
            "EDITOR_DENSITY_INVALID",
            "designTokens.editorDensity should be comfortable or compact.",
            "designTokens.editorDensity",
            {"received": density_raw},
        )

    page_toggles = settings.get("pageToggles")
    if not isinstance(page_toggles, dict):
        page_toggles = {}

    for page_key in PAGE_NOINDEX_FILES:
        raw_value = str(page_toggles.get(page_key, "ON")).strip().upper()
        valid = raw_value in VALID_ON_OFF
        value = raw_value if valid else "ON"
        checks["pageToggles"]["items"].append({"pageKey": page_key, "value": value, "ok": valid})
        if not valid:
            append_issue(
                warnings,
                "PAGE_TOGGLE_NORMALIZED",
                "Page toggle was not ON/OFF and will be normalized to ON.",
                f"pageToggles.{page_key}",
                {"received": page_toggles.get(page_key)},
            )

    pages = settings.get("pages")
    if not isinstance(pages, dict):
        pages = {}
        append_issue(
            warnings,
            "PAGES_OBJECT_MISSING",
            "pages object is missing; defaults will be generated from pageToggles.",
            "pages",
        )

    for page_key in PAGE_NOINDEX_FILES:
        page_cfg = pages.get(page_key)
        page_cfg = page_cfg if isinstance(page_cfg, dict) else {}
        seo = page_cfg.get("seo")
        seo = seo if isinstance(seo, dict) else {}
        title = str(seo.get("title", "") or "").strip()
        canonical = str(seo.get("canonical", "") or "").strip()
        canonical_valid = (not canonical) or is_valid_http_url(canonical)
        if not title:
            append_issue(
                warnings,
                "SEO_TITLE_MISSING",
                "SEO title is empty for this page.",
                f"pages.{page_key}.seo.title",
            )
        if canonical and not canonical_valid:
            append_issue(
                warnings,
                "SEO_CANONICAL_INVALID",
                "Canonical URL is not a valid http/https URL.",
                f"pages.{page_key}.seo.canonical",
                {"value": canonical},
            )
        checks["seo"]["items"].append(
            {
                "pageKey": page_key,
                "titlePresent": bool(title),
                "canonicalValid": canonical_valid,
            }
        )

    for expectation in noindex_expectations:
        page_key = expectation["pageKey"]
        checks["seo"]["items"].append(
            {
                "pageKey": page_key,
                "pageEnabled": expectation["enabled"],
                "expectedNoindex": expectation["expectedNoindex"],
                "configuredNoindex": expectation["configuredNoindex"],
                "ok": expectation["ok"],
            }
        )
        if not expectation["ok"]:
            append_issue(
                warnings,
                "PAGE_OFF_NOINDEX_EXPECTED",
                "Page is OFF but pages.<key>.seo.noindex is not true. Publish will enforce noindex.",
                f"pages.{page_key}.seo.noindex",
                {
                    "pageEnabled": expectation["enabled"],
                    "expectedNoindex": expectation["expectedNoindex"],
                    "configuredNoindex": expectation["configuredNoindex"],
                },
            )

    media_items = settings.get("mediaLibrary")
    if not isinstance(media_items, list):
        media_items = []

    active_image_urls = collect_active_image_urls(settings)
    missing_alt_used = 0
    missing_alt_unused = 0
    used_images = 0

    for index, item in enumerate(media_items):
        if not isinstance(item, dict):
            continue
        item_type = str(item.get("type", "")).lower()
        if item_type != "image":
            continue

        item_url = normalize_media_url(item.get("url"))
        used = bool(item_url) and item_url in active_image_urls
        if used:
            used_images += 1

        alt_value = str(item.get("alt", "") or item.get("description", "") or "").strip()
        if alt_value:
            continue

        issue_meta = {
            "id": item.get("id"),
            "label": item.get("label"),
            "url": item_url,
            "used": used,
        }

        if used:
            missing_alt_used += 1
            append_issue(
                errors,
                "MEDIA_ALT_REQUIRED_USED_ASSET",
                "Image asset used by live sections/projects must include alt text.",
                f"mediaLibrary[{index}]",
                issue_meta,
            )
        else:
            missing_alt_unused += 1
            append_issue(
                warnings,
                "MEDIA_ALT_MISSING_UNUSED",
                "Unused image asset is missing alt text.",
                f"mediaLibrary[{index}]",
                issue_meta,
            )

    checks["media"]["items"].append(
        {
            "total": len(media_items),
            "activeImageUrls": len(active_image_urls),
            "usedImageAssets": used_images,
            "missingAltUsed": missing_alt_used,
            "missingAltUnused": missing_alt_unused,
            "ok": missing_alt_used == 0,
        }
    )

    layer_settings = settings.get("layers")
    if isinstance(layer_settings, dict):
        snap = layer_settings.get("snap")
        if isinstance(snap, dict):
            snap_size = snap.get("size", 8)
            try:
                snap_value = max(1, min(64, int(snap_size)))
            except Exception:
                snap_value = 8
            checks["layout"]["items"].append({"snapSize": snap_value, "ok": snap_value >= 1})

    section_styles = get_path_value(settings, "layout.sectionStyles", {})
    if not isinstance(section_styles, dict):
        section_styles = {}

    for key, style in section_styles.items():
        if not isinstance(style, dict):
            continue
        mode = str(style.get("layoutMode", "flow")).strip().lower()
        if mode == "free":
            free_w = style.get("freeW")
            free_h = style.get("freeH")
            try:
                width_value = float(free_w)
            except Exception:
                width_value = 0.0
            try:
                height_value = float(free_h)
            except Exception:
                height_value = 0.0
            if width_value <= 0:
                append_issue(
                    errors,
                    "LAYER_GEOMETRY_INVALID",
                    "Free layout requires freeW > 0.",
                    f"layout.sectionStyles.{key}.freeW",
                )
            if height_value <= 0:
                append_issue(
                    errors,
                    "LAYER_GEOMETRY_INVALID",
                    "Free layout requires freeH > 0.",
                    f"layout.sectionStyles.{key}.freeH",
                )

        ratio = contrast_ratio(style.get("background"), style.get("textColor"))
        if ratio is not None and ratio < 4.5:
            append_issue(
                warnings,
                "LOW_CONTRAST",
                "Potential low contrast between background and text color.",
                f"layout.sectionStyles.{key}",
                {"contrastRatio": round(ratio, 2)},
            )
            checks["accessibility"]["items"].append(
                {
                    "sectionKey": key,
                    "contrastRatio": round(ratio, 2),
                    "ok": False,
                }
            )

    checks["youtube"]["ok"] = all(item.get("ok") for item in checks["youtube"]["items"]) if checks["youtube"]["items"] else True
    checks["seo"]["ok"] = not any(issue["code"].startswith("SEO_") for issue in warnings) and not any(
        issue["code"] == "PAGE_OFF_NOINDEX_EXPECTED" for issue in warnings
    )
    checks["media"]["ok"] = missing_alt_used == 0
    checks["pageToggles"]["ok"] = all(item.get("ok") for item in checks["pageToggles"]["items"]) if checks["pageToggles"]["items"] else True
    checks["accessibility"]["ok"] = not any(not item.get("ok", True) for item in checks["accessibility"]["items"])
    checks["schema"]["ok"] = not any(issue.get("code") == "SCHEMA_MIGRATION_RECOMMENDED" for issue in warnings)
    checks["layout"]["ok"] = not any(issue.get("code") == "LAYER_GEOMETRY_INVALID" for issue in errors)
    checks["designTokens"]["ok"] = all(item.get("ok") for item in checks["designTokens"]["items"]) if checks["designTokens"]["items"] else True

    response["ok"] = len(errors) == 0
    response["warnings"] = warnings
    response["errors"] = errors
    response["checks"] = checks
    response["output"] = "Validation passed." if response["ok"] else "Validation failed."
    return response


def backup_current_published_settings():
    if not PUBLISHED_SETTINGS_JSON.exists():
        return False
    try:
        PUBLISHED_SNAPSHOT_JSON.parent.mkdir(parents=True, exist_ok=True)
        PUBLISHED_SNAPSHOT_JSON.write_text(PUBLISHED_SETTINGS_JSON.read_text(encoding="utf-8"), encoding="utf-8")
        return True
    except Exception:
        return False


def load_snapshot_settings():
    if not PUBLISHED_SNAPSHOT_JSON.exists():
        return None
    try:
        data = json.loads(PUBLISHED_SNAPSHOT_JSON.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def write_published_settings(settings):
    PUBLISHED_SETTINGS_JS.parent.mkdir(parents=True, exist_ok=True)
    PUBLISHED_SETTINGS_JSON.parent.mkdir(parents=True, exist_ok=True)

    js_body = (
        "// Auto-generated by Studio local publish\n"
        f"window.__STUDIO_PUBLISHED_SETTINGS__ = {json.dumps(settings, indent=2)};\n"
    )
    PUBLISHED_SETTINGS_JS.write_text(js_body, encoding="utf-8")
    PUBLISHED_SETTINGS_JSON.write_text(json.dumps(settings, indent=2), encoding="utf-8")

    return [
        str(PUBLISHED_SETTINGS_JS.relative_to(ROOT_DIR)),
        str(PUBLISHED_SETTINGS_JSON.relative_to(ROOT_DIR)),
    ]


def upsert_page_robots_tag(file_path, should_noindex):
    html = file_path.read_text(encoding="utf-8")
    cleaned = re.sub(
        r"\s*<meta[^>]*data-studio-robots=[\"']1[\"'][^>]*>\s*",
        "\n",
        html,
        flags=re.IGNORECASE,
    )
    changed = cleaned != html

    if should_noindex:
        cleaned, insertions = re.subn(
            r"(<head\b[^>]*>)",
            rf"\1\n    {MANAGED_ROBOTS_TAG}",
            cleaned,
            count=1,
            flags=re.IGNORECASE,
        )
        if insertions == 0:
            raise ValueError(f"Could not locate <head> in {file_path.name}")
        changed = True

    if changed:
        file_path.write_text(cleaned, encoding="utf-8")
    return changed


def sync_noindex_pages(settings):
    page_toggles = settings.get("pageToggles") if isinstance(settings, dict) else {}
    page_toggles = page_toggles if isinstance(page_toggles, dict) else {}

    results = []
    for page_key, relative_path in PAGE_NOINDEX_FILES.items():
        target_file = ROOT_DIR / relative_path
        if not target_file.exists():
            results.append(
                {
                    "pageKey": page_key,
                    "file": relative_path,
                    "exists": False,
                    "enabled": is_on(page_toggles.get(page_key, "ON")),
                    "noindex": False,
                    "updated": False,
                    "ok": False,
                }
            )
            continue

        enabled = is_on(page_toggles.get(page_key, "ON"))
        should_noindex = not enabled
        updated = upsert_page_robots_tag(target_file, should_noindex)
        results.append(
            {
                "pageKey": page_key,
                "file": relative_path,
                "exists": True,
                "enabled": enabled,
                "noindex": should_noindex,
                "updated": updated,
                "ok": True,
            }
        )
    return results


def read_git(command):
    return subprocess.check_output(command, cwd=ROOT_DIR, text=True, stderr=subprocess.DEVNULL).strip()


def run_publish_live(commit_message):
    result = {
        "git_pushed": False,
        "commit": "",
        "branch": "",
        "status": "",
        "output": "",
        "error": "",
    }

    if not PUBLISH_SCRIPT.exists():
        result["error"] = f"Publish script not found: {PUBLISH_SCRIPT}"
        result["output"] = result["error"]
        return result

    command = ["/bin/zsh", str(PUBLISH_SCRIPT), commit_message]
    completed = subprocess.run(
        command,
        cwd=ROOT_DIR,
        text=True,
        capture_output=True,
        timeout=180,
        check=False,
    )

    output_text = "\n".join(part for part in [completed.stdout.strip(), completed.stderr.strip()] if part).strip()
    result["output"] = output_text

    if completed.returncode != 0:
        result["error"] = output_text or f"publish-site.sh exited with code {completed.returncode}"
        return result

    result["git_pushed"] = True
    try:
        result["commit"] = read_git(["git", "rev-parse", "--short", "HEAD"])
        result["branch"] = read_git(["git", "branch", "--show-current"])
        result["status"] = read_git(["git", "status", "-sb"])
    except Exception:
        # Keep successful publish state even if status extraction fails.
        pass

    return result


def apply_publish_defaults(settings):
    if not isinstance(settings, dict):
        return {}
    normalized = dict(settings)
    normalized["schemaVersion"] = 3
    normalized["version"] = 3

    publishing = normalized.get("publishing")
    publishing = publishing if isinstance(publishing, dict) else {}
    publishing["lastPublishedAtUtc"] = datetime.now(timezone.utc).isoformat()
    publishing["lastStatus"] = "saved"
    publishing["lastError"] = ""
    normalized["publishing"] = publishing

    return normalized


def merge_validation_into_response(base_response, validation):
    response = dict(base_response)
    response["ok"] = bool(validation.get("ok", False))
    response["warnings"] = validation.get("warnings", []) if isinstance(validation.get("warnings"), list) else []
    response["checks"] = validation.get("checks", make_checks_payload())
    response["noindex"] = validation.get("noindex", []) if isinstance(validation.get("noindex"), list) else []
    response["errors"] = validation.get("errors", []) if isinstance(validation.get("errors"), list) else []
    return response


def rollback_published_snapshot(commit_message=None):
    response = make_contract_base()
    response["publishingStatus"] = "rollback_requested"

    snapshot = load_snapshot_settings()
    if not snapshot:
        response["ok"] = False
        response["publishingStatus"] = "rollback_unavailable"
        response["output"] = "No snapshot exists yet. Publish once before rollback."
        response["error"] = response["output"]
        response["errors"] = [
            {
                "code": "ROLLBACK_SNAPSHOT_MISSING",
                "message": response["output"],
                "path": "assets/js/studio-published-settings.snapshot.json",
            }
        ]
        return response

    validation = validate_settings_payload(snapshot)
    response = merge_validation_into_response(response, validation)

    if not validation.get("ok"):
        response["ok"] = False
        response["publishingStatus"] = "rollback_validation_failed"
        response["output"] = "Rollback snapshot failed validation."
        response["error"] = response["output"]
        return response

    backup_current_published_settings()
    files = write_published_settings(apply_publish_defaults(snapshot))
    noindex_updates = sync_noindex_pages(snapshot)

    response["files"] = files
    response["noindex"] = noindex_updates

    publish_result = run_publish_live(sanitize_commit_message(commit_message or "Studio rollback published snapshot"))
    response["git_pushed"] = publish_result.get("git_pushed", False)
    response["commit"] = publish_result.get("commit", "")
    response["branch"] = publish_result.get("branch", "")
    response["status"] = publish_result.get("status", "")
    response["output"] = publish_result.get("output", "")

    if publish_result.get("git_pushed"):
        response["ok"] = True
        response["publishingStatus"] = "rollback_live_published"
    else:
        response["ok"] = False
        response["publishingStatus"] = "rollback_saved_push_failed"
        response["error"] = publish_result.get("error") or "Rollback saved locally, but push failed."

    return response


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def write_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path not in STUDIO_ENDPOINTS:
            self.send_error(404, "Not Found")
            return

        if self.client_address[0] not in {"127.0.0.1", "::1"}:
            self.send_error(403, "Forbidden")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(content_length)
            payload = json.loads(raw.decode("utf-8")) if raw else {}
            if not isinstance(payload, dict):
                payload = {}

            if self.path == "/__studio/youtube-resolutions":
                result = resolve_youtube_resolutions(payload.get("url"))
                self.write_json(200, result)
                return

            if self.path == "/__studio/rollback-published":
                result = rollback_published_snapshot(payload.get("commitMessage"))
                self.write_json(200 if result.get("ok") else 422, result)
                return

            settings = payload.get("settings")
            validation = validate_settings_payload(settings)

            if self.path == "/__studio/validate":
                self.write_json(200 if validation.get("ok") else 422, validation)
                return

            response = merge_validation_into_response(make_contract_base(), validation)
            response["publishingStatus"] = "validation_failed" if not validation.get("ok") else "validated"

            if not validation.get("ok"):
                response["ok"] = False
                response["output"] = "Validation failed."
                response["error"] = response["output"]
                self.write_json(422, response)
                return

            normalized_settings = apply_publish_defaults(settings)
            backup_current_published_settings()
            files = write_published_settings(normalized_settings)
            noindex_updates = sync_noindex_pages(normalized_settings)

            response["ok"] = True
            response["files"] = files
            response["noindex"] = noindex_updates
            response["publishingStatus"] = "saved_local"
            response["output"] = "Settings published to folder."
            response["git_pushed"] = False

            if self.path == "/__studio/publish-live":
                commit_message = sanitize_commit_message(payload.get("commitMessage"))
                publish_result = run_publish_live(commit_message)
                response["git_pushed"] = publish_result.get("git_pushed", False)
                response["commit"] = publish_result.get("commit", "")
                response["branch"] = publish_result.get("branch", "")
                response["status"] = publish_result.get("status", "")
                response["output"] = publish_result.get("output", "")

                if publish_result.get("git_pushed"):
                    response["publishingStatus"] = "live_published"
                else:
                    response["publishingStatus"] = "saved_push_failed"
                    response["error"] = publish_result.get("error") or "Settings saved locally, but push failed."

            self.write_json(200, response)
        except Exception as err:
            response = make_contract_base()
            response["ok"] = False
            response["publishingStatus"] = "request_failed"
            response["output"] = str(err)
            response["error"] = str(err)
            response["errors"] = [{"code": "REQUEST_ERROR", "message": str(err)}]
            self.write_json(400, response)


def main():
    os.chdir(ROOT_DIR)
    server = ThreadingHTTPServer(("localhost", 8000), CORSRequestHandler)
    print("Serving Studio on http://localhost:8000")
    print("Local publish endpoint: POST /__studio/publish")
    print("Live publish endpoint: POST /__studio/publish-live")
    print("Validation endpoint: POST /__studio/validate")
    print("YouTube resolution endpoint: POST /__studio/youtube-resolutions")
    print("Rollback endpoint: POST /__studio/rollback-published")
    server.serve_forever()


if __name__ == "__main__":
    main()
