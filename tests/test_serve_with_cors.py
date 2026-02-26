import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "serve_with_cors.py"
SPEC = importlib.util.spec_from_file_location("studio_server", MODULE_PATH)
studio_server = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(studio_server)


def base_settings():
    return {
        "schemaVersion": 3,
        "version": 3,
        "designTokens": {"reducedMotion": "OFF", "editorDensity": "comfortable"},
        "featureToggles": {
            "works_section_under_super_syd": "ON",
            "works_section_3d_poster_mode": "ON",
            "opening_single_intro_mode": "OFF",
        },
        "pageToggles": {
            "index": "ON",
            "projects": "OFF",
            "about": "OFF",
            "privacy": "OFF",
            "project_aastry": "OFF",
            "project_crimson_ring": "OFF",
            "project_super_syd": "OFF",
        },
        "pages": {
            "index": {
                "enabled": True,
                "seo": {
                    "title": "Home",
                    "description": "Home",
                    "canonical": "https://julianschnitt.com/",
                    "noindex": False,
                },
            },
            "projects": {
                "enabled": False,
                "seo": {
                    "title": "Projects",
                    "description": "Projects",
                    "canonical": "https://julianschnitt.com/projects.html",
                    "noindex": True,
                },
            },
            "about": {
                "enabled": False,
                "seo": {
                    "title": "About",
                    "description": "About",
                    "canonical": "https://julianschnitt.com/about.html",
                    "noindex": True,
                },
            },
            "privacy": {
                "enabled": False,
                "seo": {
                    "title": "Privacy",
                    "description": "Privacy",
                    "canonical": "https://julianschnitt.com/privacy-policy.html",
                    "noindex": True,
                },
            },
            "project_aastry": {
                "enabled": False,
                "seo": {
                    "title": "Aastry",
                    "description": "Aastry",
                    "canonical": "https://julianschnitt.com/project-aastry.html",
                    "noindex": True,
                },
            },
            "project_crimson_ring": {
                "enabled": False,
                "seo": {
                    "title": "Crimson Ring",
                    "description": "Crimson Ring",
                    "canonical": "https://julianschnitt.com/project-crimson-ring.html",
                    "noindex": True,
                },
            },
            "project_super_syd": {
                "enabled": False,
                "seo": {
                    "title": "Super Syd",
                    "description": "Super Syd",
                    "canonical": "https://julianschnitt.com/project-super-syd.html",
                    "noindex": True,
                },
            },
        },
        "content": {
            "works": {"title": "Works", "lede": "Selected projects"},
            "opening": {
                "singleIntroEmbedUrl": "https://youtu.be/XJsnuIRlA9k",
                "backgroundEmbedUrl": "https://youtu.be/zDLFZ_0GTLg",
            },
            "projects": [
                {
                    "id": "one",
                    "title": "One",
                    "posterSrc": "assets/images/used-poster.jpg",
                    "posterAlt": "Used poster",
                }
            ],
        },
        "layout": {
            "sectionStyles": {},
            "sectionVisibility": {},
            "customBlocks": [],
        },
        "mediaLibrary": [],
    }


def test_validation_response_contract_fields():
    result = studio_server.validate_settings_payload(base_settings())
    for key in [
        "ok",
        "warnings",
        "checks",
        "files",
        "noindex",
        "robots",
        "seoSync",
        "publishingStatus",
        "commit",
        "branch",
        "status",
        "output",
        "errors",
    ]:
        assert key in result
    assert result["publishingStatus"] == "validated"


def test_legacy_payload_upgrades_to_v3_on_publish_defaults():
    settings = base_settings()
    settings["schemaVersion"] = 1
    settings["version"] = 1

    validation = studio_server.validate_settings_payload(settings)
    warning_codes = {entry["code"] for entry in validation["warnings"]}
    assert "SCHEMA_MIGRATION_RECOMMENDED" in warning_codes

    upgraded = studio_server.apply_publish_defaults(settings)
    assert upgraded["schemaVersion"] == 3
    assert upgraded["version"] == 3
    assert upgraded["publishing"]["lastStatus"] == "saved"


def test_media_alt_governance_used_vs_unused_images():
    settings = base_settings()
    settings["mediaLibrary"] = [
        {
            "id": "used-image",
            "type": "image",
            "label": "Used image",
            "url": "assets/images/used-poster.jpg",
            "alt": "",
        },
        {
            "id": "unused-image",
            "type": "image",
            "label": "Unused image",
            "url": "assets/images/unused.jpg",
            "alt": "",
        },
    ]

    result = studio_server.validate_settings_payload(settings)
    error_codes = {entry["code"] for entry in result["errors"]}
    warning_codes = {entry["code"] for entry in result["warnings"]}

    assert "MEDIA_ALT_REQUIRED_USED_ASSET" in error_codes
    assert "MEDIA_ALT_MISSING_UNUSED" in warning_codes


def test_page_off_requires_noindex_configuration_warning():
    settings = base_settings()
    settings["pageToggles"]["projects"] = "OFF"
    settings["pages"]["projects"]["seo"]["noindex"] = False

    result = studio_server.validate_settings_payload(settings)
    warning_codes = {entry["code"] for entry in result["warnings"]}

    assert "PAGE_OFF_NOINDEX_EXPECTED" in warning_codes
    projects_noindex = [entry for entry in result["noindex"] if entry["pageKey"] == "projects"]
    assert projects_noindex
    assert projects_noindex[0]["expectedNoindex"] is True


def test_reduced_motion_validation():
    settings = base_settings()
    settings["designTokens"]["reducedMotion"] = "MAYBE"

    result = studio_server.validate_settings_payload(settings)
    warning_codes = {entry["code"] for entry in result["warnings"]}

    assert "REDUCED_MOTION_INVALID" in warning_codes
    assert result["checks"]["designTokens"]["ok"] is False


def test_sync_noindex_pages_inserts_and_removes_tag(tmp_path, monkeypatch):
    html_file = tmp_path / "index.html"
    html_file.write_text("<html><head><title>T</title></head><body>ok</body></html>", encoding="utf-8")

    monkeypatch.setattr(studio_server, "ROOT_DIR", tmp_path)
    monkeypatch.setattr(studio_server, "PAGE_NOINDEX_FILES", {"index": "index.html"})

    off_result = studio_server.sync_noindex_pages({"pageToggles": {"index": "OFF"}})
    assert off_result[0]["noindex"] is True
    assert 'data-studio-robots="1"' in html_file.read_text(encoding="utf-8")

    on_result = studio_server.sync_noindex_pages({"pageToggles": {"index": "ON"}})
    assert on_result[0]["noindex"] is False
    assert 'data-studio-robots="1"' not in html_file.read_text(encoding="utf-8")


def test_sync_page_seo_meta_writes_title_description_and_canonical(tmp_path, monkeypatch):
    html_file = tmp_path / "index.html"
    html_file.write_text(
        "<html><head><title>Old</title></head><body>ok</body></html>",
        encoding="utf-8",
    )

    monkeypatch.setattr(studio_server, "ROOT_DIR", tmp_path)
    monkeypatch.setattr(studio_server, "PAGE_NOINDEX_FILES", {"index": "index.html"})

    settings = {
        "pageToggles": {"index": "ON"},
        "pages": {
            "index": {
                "seo": {
                    "title": "New Home Title",
                    "description": "Fresh home description.",
                    "canonical": "https://julianschnitt.com/",
                    "noindex": False,
                }
            }
        },
    }

    result = studio_server.sync_page_seo_meta(settings)
    updated_html = html_file.read_text(encoding="utf-8")
    assert "<title>New Home Title</title>" in updated_html
    assert 'data-studio-description="1"' in updated_html
    assert 'data-studio-canonical="1"' in updated_html
    assert result["seoSync"][0]["ok"] is True
    assert result["seoSync"][0]["updated"] is True


def test_sync_robots_txt_reflects_off_pages(tmp_path, monkeypatch):
    monkeypatch.setattr(studio_server, "ROOT_DIR", tmp_path)
    monkeypatch.setattr(
        studio_server,
        "PAGE_NOINDEX_FILES",
        {
            "index": "index.html",
            "projects": "projects.html",
        },
    )

    settings = {
        "pageToggles": {"index": "ON", "projects": "OFF"},
        "pages": {
            "index": {"seo": {"noindex": False}},
            "projects": {"seo": {"noindex": True}},
        },
    }

    result = studio_server.sync_robots_txt(settings)
    robots_body = (tmp_path / "robots.txt").read_text(encoding="utf-8")
    assert "User-agent: *" in robots_body
    assert "Allow: /" in robots_body
    assert "Disallow: /projects.html" in robots_body
    assert result["updated"] is True
    projects_rule = [item for item in result["rules"] if item["pageKey"] == "projects"]
    assert projects_rule
    assert projects_rule[0]["disallow"] is True


def test_run_publish_live_returns_commit_branch_and_status(monkeypatch, tmp_path):
    fake_script = tmp_path / "publish-site.sh"
    fake_script.write_text("#!/bin/zsh\nexit 0\n", encoding="utf-8")
    monkeypatch.setattr(studio_server, "PUBLISH_SCRIPT", fake_script)

    class FakeCompleted:
        returncode = 0
        stdout = "publish ok"
        stderr = ""

    def fake_run(*_args, **_kwargs):
        return FakeCompleted()

    def fake_read_git(command):
        if command[-1] == "HEAD":
            return "abc1234"
        if command[-1] == "--show-current":
            return "main"
        return "## main"

    monkeypatch.setattr(studio_server.subprocess, "run", fake_run)
    monkeypatch.setattr(studio_server, "read_git", fake_read_git)

    result = studio_server.run_publish_live("Publish test")
    assert result["git_pushed"] is True
    assert result["commit"] == "abc1234"
    assert result["branch"] == "main"
    assert "main" in result["status"]


def test_rollback_without_snapshot_returns_actionable_contract(monkeypatch):
    monkeypatch.setattr(studio_server, "load_snapshot_settings", lambda: None)

    result = studio_server.rollback_published_snapshot("Rollback")
    assert result["ok"] is False
    assert result["publishingStatus"] == "rollback_unavailable"
    assert "snapshot" in result["error"].lower()
