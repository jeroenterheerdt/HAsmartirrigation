"""The Smart Irrigation integration."""
import asyncio
import logging
import voluptuous as vol
import copy

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import discovery

from .const import DOMAIN
from homeassistant.const import (
    CONF_NAME,
    CONF_API_KEY,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_LATITUDE,
    CONF_ELEVATION,
    CONF_LONGITUDE,
    CONF_TYPE,
)

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)

DEPENDENCIES = ["discovery"]

PLATFORMS = ["sensor"]
DOMAIN = "smart_irrigation"
_LOGGER = logging.getLogger(__name__)
DATA_KEY = "smart_irrigation.devices"

TYPE_PRECIPITATION = "Precipitation"
TYPE_RAIN = "Rain"
TYPE_SNOW = "Snow"
TYPE_THROUGHPUT = "Throughput"
TYPE_PEAK_ET = "Peak Evatranspiration"
TYPE_PRECIPITATION_RATE = TYPE_PRECIPITATION + " Rate"
TYPE_BASE_SCHEDULE_INDEX = "Base Schedule Index"
TYPE_EVATRANSPIRATION = "Evatranspiration"
TYPE_ADJUSTED_RUN_TIME = "Adjusted Run Time"

# DEFAULTS
DEFAULT_NAME = "Smart Irrigation"

# CONFIGS
CONF_SYSTEM_OF_MEASUREMENT = "system_of_measurement"
CONF_NUMBER_OF_SPRINKLERS = "number_of_sprinklers"
CONF_FLOW = "flow"
CONF_AREA = "area"
CONF_MONTHLY_ET = "reference_et"
CONF_VALUE = "value"
CONF_THROUGHPUT = "throughput"
CONF_PEAK_ET = "peak_et"
CONF_PRECIPITATION_RATE = "precipitation_rate"
CONF_RAIN = "rain"
CONF_SNOW = "snow"
CONF_ET = "et"


async def async_setup(hass, config):
    """Set up the Smart Irrigation component."""

    if DATA_KEY not in hass.data:
        hass.data[DATA_KEY] = []

    _LOGGER.warning("config in setup: {}".format(config))
    name = config.get(CONF_NAME)
    if name is None:
        name = DEFAULT_NAME

    # create sensors
    cfgs = []
    # precipitation
    # cfg0 = copy.deepcopy(config)
    # cfg0[CONF_NAME] = name + " " + TYPE_PRECIPITATION
    # cfg0[CONF_TYPE] = TYPE_PRECIPITATION
    # cfgs.append(cfg0)
    # base_schedule_index
    # cfg2 = copy.deepcopy(config)
    # cfg2[CONF_NAME] = name + " " + TYPE_BASE_SCHEDULE_INDEX
    # cfg2[CONF_TYPE] = TYPE_BASE_SCHEDULE_INDEX
    # cfgs.append(cfg2)
    # evatranspiration
    # cfg3 = copy.deepcopy(config)
    # cfg3[CONF_NAME] = name + " " + TYPE_EVATRANSPIRATION
    # cfg3[CONF_TYPE] = TYPE_EVATRANSPIRATION
    # cfgs.append(cfg3)
    # adusted run time
    # cfg4 = copy.deepcopy(config)
    # cfg4[CONF_NAME] = name + " " + TYPE_ADJUSTED_RUN_TIME
    # cfg4[CONF_TYPE] = TYPE_ADJUSTED_RUN_TIME
    # cfgs.append(cfg4)
    for c in cfgs:
        # _LOGGER.warning(c)
        discovery.load_platform(hass, "sensor", DOMAIN, c, c)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Smart Irrigation from a config entry."""
    # TODO Store an API object for your platforms to access
    # hass.data[DOMAIN][entry.entry_id] = MyApi(...)
    for component in PLATFORMS:
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, component)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, component)
                for component in PLATFORMS
            ]
        )
    )
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
