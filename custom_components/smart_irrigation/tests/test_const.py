"""Tests for the Smart Irrigation constants."""

from custom_components.smart_irrigation import const


def test_supported_languages() -> None:
    """Test supported languages constant."""
    assert isinstance(const.SUPPORTED_LANGUAGES, list)
    assert "en" in const.SUPPORTED_LANGUAGES


def test_language_files_dir() -> None:
    """Test language files directory constant."""
    assert isinstance(const.LANGUAGE_FILES_DIR, str)
    assert const.LANGUAGE_FILES_DIR != ""


def test_domain_constant() -> None:
    """Test domain constant."""
    assert const.DOMAIN == "smart_irrigation"
