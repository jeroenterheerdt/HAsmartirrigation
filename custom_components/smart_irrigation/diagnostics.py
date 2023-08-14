"""Diagnostics support for Smart Irrigation."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    # control_unit: ControlUnit = hass.data[DOMAIN][CONTROL_UNITS][config_entry.entry_id]

    #diag: dict[str, Any] = {
    #    "config": async_redact_data(config_entry.as_dict(), REDACT_CONFIG)
    #}

    diag: dict[str, Any] = {"config": config_entry.as_dict()}

    # platform_stats, device_types = control_unit.async_get_entity_stats()

    # diag["platform_stats"] = platform_stats
    # diag["devices"] = device_types

    #diag["zones"] =
    return diag
