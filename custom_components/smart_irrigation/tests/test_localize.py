"""Tests for the Smart Irrigation localization utilities."""

from pathlib import Path

from custom_components.smart_irrigation.localize import get_string_from_data, localize
import pytest


@pytest.mark.asyncio
async def test_localize_returns_key_for_missing_file(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Test localize returns the key if the language file is missing."""
    # Patch LANGUAGE_FILES_DIR and SUPPORTED_LANGUAGES if needed
    result = await localize("test.key", "zz")
    assert result == "test.key"


def test_get_string_from_data_returns_value() -> None:
    """Test get_string_from_data returns the correct value."""
    data = {"foo": {"bar": "baz"}}
    assert get_string_from_data(["foo", "bar"], data) == "baz"
