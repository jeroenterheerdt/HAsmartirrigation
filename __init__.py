import logging
import json
import voluptuous as vol
import copy

from homeassistant.components.binary_sensor import DEVICE_CLASSES_SCHEMA
from homeassistant.const import (
     CONF_API_KEY
#    CONF_UNIT_OF_MEASUREMENT,CONF_API_KEY, CONF_LATITUDE, CONF_ELEVATION,CONF_LONGITUDE,CONF_DEVICES, CONF_BINARY_SENSORS, CONF_SWITCHES, CONF_HOST, CONF_PORT,
#    CONF_ID, CONF_NAME, CONF_TYPE, CONF_PIN, CONF_ZONE, 
#    ATTR_ENTITY_ID, ATTR_STATE, STATE_ON)
from homeassistant.helpers import discovery
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.entity_component import EntityComponent

_LOGGER = logging.getLogger(__name__)
DOMAIN = "smart_irrigation"

TYPE_RAIN = 'rain'

def setup(hass, config):
    hass.states.set("smart_irrigation.world", "Barf")
    #cfg = config.get(DOMAIN)
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
    return True

