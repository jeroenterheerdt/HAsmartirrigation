import logging
import json
import voluptuous as vol
import copy

from homeassistant import config_entries, core, exceptions

from homeassistant.const import (
    CONF_NAME, CONF_API_KEY, CONF_UNIT_OF_MEASUREMENT, CONF_LATITUDE, CONF_ELEVATION,
    CONF_LONGITUDE, CONF_TYPE)
#    ,CONF_DEVICES, CONF_BINARY_SENSORS, CONF_SWITCHES, CONF_HOST, CONF_PORT,
#    CONF_ID, CONF_NAME, CONF_TYPE, CONF_PIN, CONF_ZONE,
#    ATTR_ENTITY_ID, ATTR_STATE, STATE_ON)
from homeassistant.helpers import discovery
from homeassistant.helpers import config_validation as cv
#from homeassistant.helpers.entity_component import EntityComponent

_LOGGER = logging.getLogger(__name__)
DOMAIN = "smart_irrigation"

CONF_NUMBER_OF_SPRINKLERS = "number_of_sprinklers"
CONF_FLOW = "flow"
CONF_AREA = "area"
CONF_MONTHLY_ET = "reference_et"
CONF_VALUE = "value"
# skipping config validation for now
#used for config validating
DEFAULT_NAME = "Smart Irrigation"
DEFAULT_NUMBER_OF_SPRINKLERS = 1
DEFAULT_FLOW = 0.0
DEFAULT_AREA = 0
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

DEPENDENCIES = ['discovery']

# METRIC TO IMPERIAL (US) FACTORS
MM_TO_INCH_FACTOR = 0.03937008
LITER_TO_GALLON_FACTOR = 0.26417205
M2_TO_SQ_FT_FACTOR = 10.7639104
M_TO_FT_FACTOR = 3.2808399

# Open Weather Map API URL
OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"

# Types
TYPE_RAIN = "rain"
TYPE_SNOW = "snow"
TYPE_THROUGHPUT = "throughput"
TYPE_PEAK_ET = "peak_et"
TYPE_PRECIPITATION = "precipitation"
TYPE_PRECIPITATION_RATE = "precipitation_rate"
TYPE_BASE_SCHEDULE_INDEX = "base_schedule_index"

def setup(hass, config):
    cfg = config.get(DOMAIN)
    
    # this can all go to the sensors config until line 110
    api_key = cfg.get(CONF_API_KEY)
    name = cfg.get(CONF_NAME)
    latitude = hass.config.as_dict().get(CONF_LATITUDE)
    longitude = hass.config.as_dict().get(CONF_LONGITUDE)
    elevation = hass.config.as_dict().get(CONF_ELEVATION)  # is always in m, regardless of unit of measurement configured

    #depending on this we need to convert to metric internally or not
    unit_of_measurement = "metric"
    if hass.config.as_dict().get("unit_system").get("length") == "mi":
        unit_of_measurement = "US"

    mm_or_inches = "mm"
    liters_or_gallons = "liter"
    lpm_or_gpm = "lpm"
    if unit_of_measurement == "US":
         mm_or_inches = "inch"
         liters_or_gallons = "gallon"
         lpm_or_gpm = "gpm"
    
    number_of_sprinklers = cfg.get(CONF_NUMBER_OF_SPRINKLERS) 
    flow = cfg.get(CONF_FLOW)  # either in lpm or in gpm depending on unit_of_measurement
    area = cfg.get(CONF_AREA)  # either in m2 or in sq ft depending on unit_of_measurement
    monthly_et = [float(x) for x in cfg.get(CONF_MONTHLY_ET).split(',')]

    # unit conversion
    if unit_of_measurement == "US":
        flow = flow / LITER_TO_GALLON_FACTOR
        area = area / M2_TO_SQ_FT_FACTOR
        monthly_et = [x / MM_TO_INCH_FACTOR for x in monthly_et]

    # calculate throughput and other dependent fixed calculations
    peak_et = max(monthly_et)
    throughput = number_of_sprinklers*flow
    precipitation_rate = (throughput*60) / area
    base_schedule_index = peak_et / precipitation_rate * 60

    # create sensors
    cfgs = []
    # precipitation
    cfg0 = copy.deepcopy(cfg)
    cfg0[CONF_NAME] = name+"_"+TYPE_PRECIPITATION
    cfg0[CONF_UNIT_OF_MEASUREMENT] = mm_or_inches
    cfg0[CONF_TYPE] = TYPE_PRECIPITATION
    cfgs.append(cfg0)
    # rain
    cfg1 = copy.deepcopy(cfg)
    cfg1[CONF_NAME] = name+"_"+TYPE_RAIN
    cfg1[CONF_UNIT_OF_MEASUREMENT] = mm_or_inches
    cfg1[CONF_TYPE] = TYPE_RAIN
    cfgs.append(cfg1)
    # snow
    cfg2 = copy.deepcopy(cfg)
    cfg2[CONF_NAME] = name+"_"+TYPE_SNOW
    cfg2[CONF_UNIT_OF_MEASUREMENT] = mm_or_inches
    cfg2[CONF_TYPE] = TYPE_SNOW
    cfgs.append(cfg2)
    # throughput
    cfg3 = copy.deepcopy(cfg)
    cfg3[CONF_NAME] = name+"_"+TYPE_THROUGHPUT
    cfg3[CONF_UNIT_OF_MEASUREMENT] = lpm_or_gpm
    cfg3[CONF_TYPE] = TYPE_THROUGHPUT
    cfg3[CONF_VALUE] = throughput
    cfgs.append(cfg3)
    # peak_et
    cfg4 = copy.deepcopy(cfg)
    cfg4[CONF_NAME] = name+"_"+TYPE_PEAK_ET
    cfg4[CONF_UNIT_OF_MEASUREMENT] = mm_or_inches
    cfg4[CONF_TYPE] = TYPE_PEAK_ET
    cfg4[CONF_VALUE] = peak_et
    cfgs.append(cfg4)
    # precipitation_rate
    cfg5 = copy.deepcopy(cfg)
    cfg5[CONF_NAME] = name+"_"+TYPE_PRECIPITATION_RATE
    cfg5[CONF_UNIT_OF_MEASUREMENT] = mm_or_inches
    cfg5[CONF_TYPE] = TYPE_PRECIPITATION_RATE
    cfg5[CONF_VALUE] = precipitation_rate
    cfgs.append(cfg5)
    # base_schedule_index
    cfg6 = copy.deepcopy(cfg)
    cfg6[CONF_NAME] = name+"_"+TYPE_BASE_SCHEDULE_INDEX
    cfg6[CONF_UNIT_OF_MEASUREMENT] = "min"
    cfg6[CONF_TYPE] = TYPE_BASE_SCHEDULE_INDEX
    cfg6[CONF_VALUE] = base_schedule_index
    cfgs.append(cfg6)

    for c in cfgs:
        _LOGGER.warning(c)
        discovery.load_platform(hass, 'sensor', DOMAIN, c, c)
    return True
