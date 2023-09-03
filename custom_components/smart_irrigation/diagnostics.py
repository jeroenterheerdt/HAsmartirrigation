"""Diagnostics support for Smart Irrigation."""
from __future__ import annotations
import json
import logging

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from . import const

_LOGGER = logging.getLogger(__name__)

async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    config_entry_info = config_entry.as_dict()
    diag: dict[str, Any] = {"config": config_entry_info}
    return diag