"""Store constants."""

VERSION = "v2025.7.2"
NAME = "Smart Irrigation"
MANUFACTURER = "@jeroenterheerdt"

DOMAIN = "smart_irrigation"
CUSTOM_COMPONENTS = "custom_components"

LANGUAGE_FILES_DIR = "frontend/localize/languages"
SUPPORTED_LANGUAGES = ["de", "en", "es", "fr", "it", "nl", "no", "sk"]

START_EVENT_FIRED_TODAY = "starteventfiredtoday"

CONF_WEATHER_SERVICE = "weather_service"
CONF_WEATHER_SERVICE_API_KEY = "weather_service_api_key"
CONF_WEATHER_SERVICE_API_VERSION = "weather_service_api_version"
CONF_INSTANCE_NAME = "name"
CONF_REFERENCE_ET = "reference_evapotranspiration"
CONF_REFERENCE_ET_1 = "reference_evapotranspiration_1"
CONF_REFERENCE_ET_2 = "reference_evapotranspiration_2"
CONF_REFERENCE_ET_3 = "reference_evapotranspiration_3"
CONF_REFERENCE_ET_4 = "reference_evapotranspiration_4"
CONF_REFERENCE_ET_5 = "reference_evapotranspiration_5"
CONF_REFERENCE_ET_6 = "reference_evapotranspiration_6"
CONF_REFERENCE_ET_7 = "reference_evapotranspiration_7"
CONF_REFERENCE_ET_8 = "reference_evapotranspiration_8"
CONF_REFERENCE_ET_9 = "reference_evapotranspiration_9"
CONF_REFERENCE_ET_10 = "reference_evapotranspiration_10"
CONF_REFERENCE_ET_11 = "reference_evapotranspiration_11"
CONF_REFERENCE_ET_12 = "reference_evapotranspiration_12"
CONF_DEFAULT_REFERENCE_ET = 0.0
# V1 only, no longer used in V2
# CONF_MAXIMUM_ET = "maximum_et"
# DEFAULT_MAXIMUM_ET = 0

# Weather Services

CONF_WEATHER_SERVICE_OWM = "Open Weather Map"
CONF_WEATHER_SERVICE_PW = "Pirate Weather"
CONF_WEATHER_SERVICE_KNMI = "KNMI"
CONF_WEATHER_SERVICES = [
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
    CONF_WEATHER_SERVICE_KNMI,
]

CONF_DEFAULT_USE_WEATHER_SERVICE = False
CONF_DEFAULT_WEATHER_SERVICE = None
CONF_CALC_TIME = "calctime"
CONF_DEFAULT_CALC_TIME = "23:00"
CONF_AUTO_CALC_ENABLED = "autocalcenabled"
CONF_DEFAULT_AUTO_CALC_ENABLED = True

# Multiple calculation triggers configuration
CONF_CALC_TRIGGERS = "calctriggers"
CONF_DEFAULT_CALC_TRIGGERS = []

# Trigger types
TRIGGER_TYPE_SUNRISE = "sunrise"
TRIGGER_TYPE_SUNSET = "sunset"
TRIGGER_TYPE_AZIMUTH = "azimuth"
TRIGGER_TYPES = [TRIGGER_TYPE_SUNRISE, TRIGGER_TYPE_SUNSET, TRIGGER_TYPE_AZIMUTH]

# Trigger configuration keys
TRIGGER_ID = "id"
TRIGGER_TYPE = "type"
TRIGGER_OFFSET_BEFORE = "offset_before"
TRIGGER_OFFSET_AFTER = "offset_after"
TRIGGER_AZIMUTH_VALUE = "azimuth_value"
CONF_AUTO_UPDATE_ENABLED = "autoupdateenabled"
CONF_AUTO_UPDATE_SCHEDULE = "autoupdateschedule"
CONF_AUTO_UPDATE_MINUTELY = "minutes"
CONF_AUTO_UPDATE_HOURLY = "hours"
CONF_AUTO_UPDATE_DAILY = "days"
CONF_DEFAULT_AUTO_UPDATE_SCHEDULE = CONF_AUTO_UPDATE_HOURLY
CONF_DEFAULT_AUTO_UPDATED_ENABLED = True
CONF_AUTO_UPDATE_DELAY = "autoupdatedelay"
CONF_DEFAULT_AUTO_UPDATE_DELAY = "0"
CONF_AUTO_UPDATE_INTERVAL = "autoupdateinterval"
CONF_AUTO_CLEAR_ENABLED = "autoclearenabled"
CONF_DEFAULT_AUTO_CLEAR_ENABLED = True
CONF_CLEAR_TIME = "cleardatatime"
CONF_DEFAULT_CLEAR_TIME = "23:59"
CONF_DEFAULT_AUTO_UPDATE_INTERVAL = "1"
CONF_UNITS = "units"
CONF_IMPERIAL = "imperial"
CONF_METRIC = "metric"
CONF_USE_WEATHER_SERVICE = "use_weather_service"
CONF_DEFAULT_MAXIMUM_DURATION = (
    3600  # default maximum duration to one hour == 3600 seconds
)
CONF_DEFAULT_MAXIMUM_BUCKET = 24  # mm default maximum bucket of 24mm
CONF_DEFAULT_DRAINAGE_RATE = 50.8  # mm / hour (=2 inch per hour)
CONF_DEFAULT_CONTINUOUS_UPDATES = False  # continuous updates are disabled by default
CONF_CONTINUOUS_UPDATES = "continuousupdates"
CONF_SENSOR_DEBOUNCE = "sensor_debounce"
CONF_DEFAULT_SENSOR_DEBOUNCE = 100  # milliseconds, 0 = disabled

# PyETO specific config consts
CONF_PYETO_COASTAL = "coastal"
CONF_PYETO_SOLRAD_BEHAVIOR = "solrad_behavior"
CONF_PYETO_FORECAST_DAYS = "forecast_days"

CUSTOM_COMPONENTS = "custom_components"
INTEGRATION_FOLDER = DOMAIN
PANEL_FOLDER = "frontend"
PANEL_FILENAME = "dist/smart-irrigation.js"

PANEL_URL = "/api/panel_custom/smart-irrigation"
PANEL_TITLE = NAME
PANEL_ICON = "mdi:sprinkler"
PANEL_NAME = "smart-irrigation"

ATTR_REMOVE = "remove"
ATTR_CALCULATE = "calculate"
ATTR_CALCULATE_ALL = "calculate_all"
ATTR_SET_BUCKET = "set_bucket"
ATTR_NEW_BUCKET_VALUE = "new_bucket_value"
ATTR_SET_MULTIPLIER = "set_multiplier"
ATTR_NEW_MULTIPLIER_VALUE = "new_multiplier_value"
ATTR_NEW_THROUGHPUT_VALUE = "new_throughput_value"
ATTR_UPDATE = "update"
ATTR_UPDATE_ALL = "update_all"
ATTR_OVERRIDE_CACHE = "override_cache"
ATTR_RESET_ALL_BUCKETS = "reset_all_buckets"
ATTR_CLEAR_ALL_WEATHERDATA = "clear_all_weatherdata"
ATTR_NEW_STATE_VALUE = "new_state_value"
ATTR_NEW_DURATION_VALUE = "new_duration_value"
ATTR_DELETE_WEATHER_DATA = "delete_weather_data"

LIST_SET_ZONE_ALLOWED_ARGS = [
    ATTR_NEW_BUCKET_VALUE,
    ATTR_NEW_MULTIPLIER_VALUE,
    ATTR_NEW_DURATION_VALUE,
    ATTR_NEW_STATE_VALUE,
    ATTR_NEW_THROUGHPUT_VALUE,
]

ZONE_ID = "id"
ZONE_NAME = "name"
ZONE_SIZE = "size"
ZONE_THROUGHPUT = "throughput"
ZONE_STATE = "state"
ZONE_DURATION = "duration"
ZONE_STATE_DISABLED = "disabled"
ZONE_STATE_MANUAL = "manual"
ZONE_STATE_AUTOMATIC = "automatic"
ZONE_STATES = [ZONE_STATE_DISABLED, ZONE_STATE_MANUAL, ZONE_STATE_AUTOMATIC]
ZONE_MODULE = "module"
ZONE_BUCKET = "bucket"
ZONE_OLD_BUCKET = "old_bucket"
ZONE_DELTA = "delta"
ZONE_EXPLANATION = "explanation"
ZONE_MULTIPLIER = "multiplier"
ZONE_THROUGHPUT = "throughput"
ZONE_MAPPING = "mapping"
ZONE_LEAD_TIME = "lead_time"
ZONE_MAXIMUM_DURATION = "maximum_duration"
ZONE_MAXIMUM_BUCKET = "maximum_bucket"
ZONE_LAST_CALCULATED = "last_calculated"
ZONE_LAST_UPDATED = "last_updated"
ZONE_NUMBER_OF_DATA_POINTS = "number_of_data_points"
ZONE_DRAINAGE_RATE = "drainage_rate"
ZONE_CURRENT_DRAINAGE = "current_drainage"

MODULE_DIR = "calcmodules"
MODULE_ID = "id"
MODULE_NAME = "name"
MODULE_DESCRIPTION = "description"
MODULE_CONFIG = "config"
MODULE_SCHEMA = "schema"

CONF_IMPERIAL = "imperial"
CONF_METRIC = "metric"

MAPPING_ID = "id"
MAPPING_NAME = "name"
MAPPING_DATA = "data"
MAPPING_DATA_LAST_UPDATED = "data_last_updated"
MAPPING_DATA_LAST_ENTRY = "data_last_entry"
MAPPING_DATA_MULTIPLIER = "data_multiplier"
MAPPING_MAPPINGS = "mappings"
MAPPING_DEWPOINT = "Dewpoint"
MAPPING_EVAPOTRANSPIRATION = "Evapotranspiration"
MAPPING_HUMIDITY = "Humidity"
MAPPING_MAX_TEMP = "Maximum Temperature"
MAPPING_MIN_TEMP = "Minimum Temperature"
MAPPING_PRECIPITATION = "Precipitation"
MAPPING_CURRENT_PRECIPITATION = "Current Precipitation"
MAPPING_PRESSURE = "Pressure"
MAPPING_SOLRAD = "Solar Radiation"
MAPPING_TEMPERATURE = "Temperature"
MAPPING_WINDSPEED = "Windspeed"

MAPPING_CONF_SOURCE_WEATHER_SERVICE = "weather_service"
MAPPING_CONF_SOURCE_SENSOR = "sensor"
MAPPING_CONF_SOURCE_NONE = "none"
MAPPING_CONF_SOURCE_STATIC_VALUE = "static"

MAPPING_CONF_SOURCE = "source"
MAPPING_CONF_SENSOR = "sensorentity"
MAPPING_CONF_STATIC_VALUE = "static_value"
MAPPING_CONF_UNIT = "unit"
MAPPING_CONF_PRESSURE_TYPE = "pressure_type"
MAPPING_CONF_PRESSURE_ABSOLUTE = "absolute"
MAPPING_CONF_PRESSURE_RELATIVE = "relative"
MAPPING_CONF_AGGREGATE = "aggregate"
MAPPING_CONF_AGGREGATE_AVERAGE = "average"
MAPPING_CONF_AGGREGATE_FIRST = "first"
MAPPING_CONF_AGGREGATE_LAST = "last"
MAPPING_CONF_AGGREGATE_MAXIMUM = "maximum"
MAPPING_CONF_AGGREGATE_MEDIAN = "median"
MAPPING_CONF_AGGREGATE_MINIMUM = "minimum"
MAPPING_CONF_AGGREGATE_SUM = "sum"
MAPPING_CONF_AGGREGATE_RIEMANNSUM = "riemannsum"
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT = MAPPING_CONF_AGGREGATE_AVERAGE
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION = MAPPING_CONF_AGGREGATE_MAXIMUM
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MAX_TEMP = MAPPING_CONF_AGGREGATE_MAXIMUM
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MIN_TEMP = MAPPING_CONF_AGGREGATE_MINIMUM
MAPPING_CONF_AGGREGATE_OPTIONS = [
    MAPPING_CONF_AGGREGATE_AVERAGE,
    MAPPING_CONF_AGGREGATE_FIRST,
    MAPPING_CONF_AGGREGATE_LAST,
    MAPPING_CONF_AGGREGATE_MAXIMUM,
    MAPPING_CONF_AGGREGATE_MEDIAN,
    MAPPING_CONF_AGGREGATE_MINIMUM,
    MAPPING_CONF_AGGREGATE_SUM,
]

# For timestamps
RETRIEVED_AT = "retrieved"  # on weatherdata

EVENT_IRRIGATE_START = "start_irrigation_all_zones"

UNIT_M2 = "m<sup>2</sup>"
UNIT_SQ_FT = "sq ft"
UNIT_LPM = "l/m"
UNIT_GPM = "gal/m"
UNIT_SECONDS = "s"
UNIT_MM = "mm"
UNIT_INCH = "in"
UNIT_PERCENT = "%"
UNIT_MBAR = "mbar"
UNIT_MILLIBAR = "millibar"
UNIT_HPA = "hPa"
UNIT_PSI = "psi"
UNIT_INHG = "inch Hg"
UNIT_KMH = "km/h"
UNIT_MH = "mile/h"
UNIT_MS = "meter/s"
UNIT_W_M2 = "W/m2"
UNIT_W_SQFT = "W/sq ft"
UNIT_MJ_DAY_M2 = "MJ/day/m2"
UNIT_MJ_DAY_SQFT = "MJ/day/sq ft"
UNIT_MMH = "mm/h"
UNIT_INCHH = "inch/h"

# METRIC TO IMPERIAL (US) FACTORS
MM_TO_INCH_FACTOR = 0.03937008  # mm * factor = inch
LITER_TO_GALLON_FACTOR = 0.26417205  # l * factor = gal
M2_TO_SQ_FT_FACTOR = 10.7639104  # m2 * factor = sq ft
M_TO_FT_FACTOR = 3.2808399  # m * factor = ft
MBAR_TO_PSI_FACTOR = 0.01450377  # mbar = hpa * factor = psi
MBAR_TO_INHG_FACTOR = 0.029529983071445  # mbar = hpa * factor = inhg
KMH_TO_MILESH_FACTOR = 0.62137119  # kmh * factor = mph
MS_TO_MILESH_FACTOR = 2.23693629  # ms * factor = mph
W_M2_TO_W_SQ_FT_FACTOR = 0.09290304  # w/m2 * factor = w/sqft

# IMPERIAL (US) TO METRIC FACTORS
INCH_TO_MM_FACTOR = 25.4  # inch * factor = mm
GALLON_TO_LITER_FACTOR = 3.78541178  # gal * factor = l
SQ_FT_TO_M2_FACTOR = 0.0929030401442212  # sq ft * factor = m2
MILESH_TO_MS_FACTOR = 0.4470400004105615  # m/h * factor = ms
MILESH_TO_KMH_FACTOR = 1.609344  # m/h * factor = kmh
PSI_TO_HPA_FACTOR = 68.9475729  # psi * factor = hpa = mbar
INHG_TO_HPA_FACTOR = 33.8639  # inhg * factor = hpa = mbar
W_SQ_FT_TO_W_M2_FACTOR = 10.76391042  # w/sqft * factor = w/m2

# OTHER FACTORS
KMH_TO_MS_FACTOR = 0.277777777777778  # kmh * factor = ms
MS_TO_KMH_FACTOR = 3.6  # m/s * factor = kmh
W_TO_MJ_DAY_FACTOR = 0.0864  # w * factor = mj/day, same for w/m2 to mj/day/m2
K_TO_C_FACTOR = 273.15  # K-factor = C, C+factor=K
INHG_TO_PSI_FACTOR = 0.49115420057253  # inhg * factor = PSI
PSI_TO_INHG_FACTOR = 2.0360206576012  # psi * factor = inhg

SENSOR_ICON = "mdi:sprinkler"

# Services
SERVICE_CALCULATE_ALL_ZONES = "calculate_all_zones"
SERVICE_CALCULATE_ZONE = "calculate_zone"
SERVICE_UPDATE_ALL_ZONES = "update_all_zones"
SERVICE_UPDATE_ZONE = "update_zone"
SERVICE_RESET_BUCKET = "reset_bucket"
SERVICE_RESET_ALL_BUCKETS = "reset_all_buckets"
SERVICE_SET_BUCKET = "set_bucket"
SERVICE_SET_ALL_BUCKETS = "set_all_buckets"
SERVICE_SET_MULTIPLIER = "set_multiplier"
SERVICE_SET_ALL_MULTIPLIERS = "set_all_multipliers"
SERVICE_SET_ZONE = "set_zone"
SERVICE_ENTITY_ID = "entity_id"
SERVICE_CLEAR_WEATHERDATA = "clear_all_weather_data"
SERVICE_GENERATE_WATERING_CALENDAR = "generate_watering_calendar"
