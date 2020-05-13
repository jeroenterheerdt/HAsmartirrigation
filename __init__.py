import logging
import json
import voluptuous as vol
import copy

from homeassistant import config_entries, core, exceptions

from homeassistant.const import (
    CONF_API_KEY, CONF_UNIT_OF_MEASUREMENT, CONF_LATITUDE, CONF_ELEVATION,
    CONF_LONGITUDE)
#    ,CONF_DEVICES, CONF_BINARY_SENSORS, CONF_SWITCHES, CONF_HOST, CONF_PORT,
#    CONF_ID, CONF_NAME, CONF_TYPE, CONF_PIN, CONF_ZONE,
#    ATTR_ENTITY_ID, ATTR_STATE, STATE_ON)
#from homeassistant.helpers import discovery
from homeassistant.helpers import config_validation as cv
#from homeassistant.helpers.entity_component import EntityComponent

_LOGGER = logging.getLogger(__name__)
DOMAIN = "smart_irrigation"

# skipping config validation for now
#CONFIG_SCHEMA = vol.Schema(
#    {
#        DOMAIN: vol.Schema({
#           vol.Optional(CONF_API_KEY): cv.string,
#           vol.Required(CONF_NAME): cv.string,
#           vol.Optional(CONF_LATITUDE): cv.latitude,
#           vol.Optional(CONF_LONGITUDE): cv.longitude,
#           vol.Optional(CONF_ELEVATION): vol.Coerce(int),
#           vol.Optional(CONF_DEBUG,default=False): cv.boolean,
#           vol.Optional(CONF_EXTERNAL_SENSOR_RAIN_1h):cv.string,
#           vol.Required(CONF_RAIN_FACTOR): vol.Coerce(float),
#           vol.Required(CONF_MAX_EV): vol.Coerce(float),
#           vol.Required(CONF_MIN_EV): vol.Coerce(float),
#           vol.Optional(CONF_TAPS): vol.All(
#                    cv.ensure_list, [_TAP_SCHEMA]),
#        }),
#    },
#    extra=vol.ALLOW_EXTRA,
#)


TYPE_RAIN = 'rain'

API_KEY = ""
LATITUDE = 0.0
LONGITUDE = 0.0
ELEVATION = 0.0

def setup(hass, config):
    cfg = config.get(DOMAIN)
    API_KEY = cfg.get(CONF_API_KEY)
    LATITUDE = hass.config.as_Dict.get(CONF_LATITUDE)
    LONGITUDE = hass.config.as_Dict.get(CONF_LONGITUDE)
    ELEVATION = hass.config.as_Dict.get(CONF_ELEVATION) #in m
    _LOGGER.Warning(CONF_UNIT_OF_MEASUREMENT)

    _LOGGER.warning(hass.config.as_dict())
    return True
    #if cfg is None:
    #    cfg = {}
    #
    #if DOMAIN not in hass.data:
    #    hass.data[DOMAIN] = {
    #    }
    #
    #cfgs =[]
    #cfg0 = copy.deepcopy(cfg)
    #cfg0[CONF_NAME] = fix_name(cfg,TYPE_RAIN)
    #cfg0[CONF_UNIT_OF_MEASUREMENT] = "mm"
    #cfg0[CONF_TYPE] = TYPE_RAIN
    #cfgs.append(cfg0);

    #for c in cfgs:
    #   discovery.load_platform(hass, 'sensor',DOMAIN, c, c)
    # Return boolean to indicate that initialization was successful.