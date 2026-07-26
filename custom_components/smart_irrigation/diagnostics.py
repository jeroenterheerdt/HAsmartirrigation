"""Diagnostics support for Smart Irrigation."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import const
from .calc_log import redact_record

_LOGGER = logging.getLogger(__name__)

REDACTED = "[redacted]"


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    # Build a separate dict for the diagnostics output. Never mutate
    # hass.data[DOMAIN] in place: popping the coordinator (or redacting the API
    # key on the live dict) would break the running integration until a reload
    # (#758 - tabs stop loading after downloading diagnostics).
    data = hass.data[const.DOMAIN]
    coordinator = data.get("coordinator")
    diagnostics: dict[str, Any] = {
        key: value for key, value in data.items() if key not in ("coordinator", "zones")
    }
    if coordinator is not None:
        store = coordinator.store
        if store is not None:
            # Manually configured coordinates pinpoint the user's home and
            # diagnostics files get attached to public issues, so redact them
            # (#806). Copy first: async_get_config may hand back the live dict.
            config = dict(await store.async_get_config())
            for key in (
                const.CONF_MANUAL_LATITUDE,
                const.CONF_MANUAL_LONGITUDE,
                const.CONF_MANUAL_ELEVATION,
            ):
                if config.get(key) is not None:
                    config[key] = REDACTED
            diagnostics["store"] = {
                "config": config,
                "mappings": await store.async_get_mappings(),
                "modules": await store.async_get_modules(),
                "zones": await store.async_get_zones(),
            }
        else:
            _LOGGER.warning("Store is not available")
        # Calculation audit log (#12): attach the most recent records so a
        # "the calculated amount looks wrong" report arrives with the numbers
        # that produced it. Coordinates are rounded and entity ids dropped.
        calc_logger = getattr(coordinator, "calc_logger", None)
        if calc_logger is not None:
            records = await calc_logger.async_read_recent(
                const.CALC_LOG_DIAGNOSTICS_RECORDS
            )
            diagnostics["calculation_log"] = [
                redact_record(record) for record in records
            ]
    else:
        _LOGGER.warning("Coordinator is not available")
    if const.CONF_WEATHER_SERVICE_API_KEY in diagnostics:
        diagnostics[const.CONF_WEATHER_SERVICE_API_KEY] = REDACTED
    return diagnostics
