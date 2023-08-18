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
    storagedata = ""
    try:
        store = hass.data[const.DOMAIN]["coordinator"].store
        storagefile = store._store.path
        with open(storagefile) as f:
            data = json.load(f)
        storagedata = data.get('data')
    except:
        _LOGGER.error("unable to load storage file to generate diagnostics.")
    diag: dict[str, Any] = {"config": config_entry.as_dict(), "storage": storagedata}
    return diag
