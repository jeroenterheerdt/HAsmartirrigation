import logging
import datetime
import requests
import json

from ..smart_irrigation import pyeto
from ..smart_irrigation.pyeto import convert, fao

import homeassistant.components.smart_irrigation as smart_irrigation
from homeassistant.components import sensor
from homeassistant.helpers.event import async_track_utc_time_change
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import HomeAssistantType, ConfigType

_LOGGER = logging.getLogger(__name__)

DEPENDENCIES = ["smart_irrigation"]

# Open Weather Map API URL
OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"

from homeassistant.const import (
    CONF_NAME,
    CONF_API_KEY,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_LATITUDE,
    CONF_ELEVATION,
    CONF_LONGITUDE,
    CONF_TYPE,
)

# UNIT_OF_MEASUREMENTS
UNIT_OF_MEASUREMENT_GPM = "gpm"
UNIT_OF_MEASUREMENT_INCH = "inch"
UNIT_OF_MEASUREMENT_GALLON = "gal"
UNIT_OF_MEASUREMENT_MM = "mm"
UNIT_OF_MEASUREMENT_LITER = "l"
UNIT_OF_MEASUREMENT_LPM = "lpm"
UNIT_OF_MEASUREMENT_SQ_FT = "sq ft"
UNIT_OF_MEASUREMENT_FT = "ft"
UNIT_OF_MEASUREMENT_METER = "m"
UNIT_OF_MEASUREMENT_METER2 = "m2"
UNIT_OF_MEASUREMENT_SECOND = "s"

# METRIC TO IMPERIAL (US) FACTORS
MM_TO_INCH_FACTOR = 0.03937008
LITER_TO_GALLON_FACTOR = 0.26417205
M2_TO_SQ_FT_FACTOR = 10.7639104
M_TO_FT_FACTOR = 3.2808399

# SETTINGS
SETTING_METRIC = "metric"


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    _LOGGER.warning("discinfo: {}".format(discovery_info))
    if discovery_info:
        obj = SmartIrrigationSensor(hass, discovery_info)
        async_add_entities([obj])
        hass.data[smart_irrigation.DATA_KEY].append(obj)


async def async_setup_entry(hass, config_entry, async_add_entities):
    api_key = config_entry.data.get(CONF_API_KEY)
    name = config_entry.data.get(CONF_NAME)
    if name is None:
        name = smart_irrigation.DEFAULT_NAME
    latitude = hass.config.as_dict().get(CONF_LATITUDE)
    longitude = hass.config.as_dict().get(CONF_LONGITUDE)
    elevation = hass.config.as_dict().get(
        CONF_ELEVATION
    )  # is always in m, regardless of unit of measurement configured

    # _LOGGER.warning(
    #    "api: {}, name: {}, lat: {}, lon: {}, ele: {}".format(
    #        api_key, name, latitude, longitude, elevation
    #    )
    # )

    system_of_measurement = SETTING_METRIC
    # depending on this we need to convert to metric internally or not
    if hass.config.as_dict().get("unit_system").get("length") == "mi":
        system_of_measurement = "US"

    # _LOGGER.warning("system of measurement: {}".format(system_of_measurement))

    # mm_or_inches = UNIT_OF_MEASUREMENT_MM
    # liters_or_gallons = UNIT_OF_MEASUREMENT_LITER
    # lpm_or_gpm = UNIT_OF_MEASUREMENT_LPM
    # if SYSTEM_OF_MEASUREMENT == "US":
    #    mm_or_inches = UNIT_OF_MEASUREMENT_INCH
    #    liters_or_gallons = UNIT_OF_MEASUREMENT_GALLON
    #    lpm_or_gpm = UNIT_OF_MEASUREMENT_GPM

    number_of_sprinklers = config_entry.data.get(
        smart_irrigation.CONF_NUMBER_OF_SPRINKLERS
    )
    flow = config_entry.data.get(
        smart_irrigation.CONF_FLOW
    )  # either in lpm or in gpm depending on unit_of_measurement
    area = config_entry.data.get(
        smart_irrigation.CONF_AREA
    )  # either in m2 or in sq ft depending on unit_of_measurement
    monthly_et = [
        float(x)
        for x in config_entry.data.get(smart_irrigation.CONF_MONTHLY_ET).split(",")
    ]
    # _LOGGER.warning("values before conversion:")
    # _LOGGER.warning(
    #    "num: {}, flow: {}, area: {}, monthly_et: {}".format(
    #        number_of_sprinklers, flow, area, monthly_et
    #    )
    # )

    # unit conversion
    if system_of_measurement == "US":
        flow = flow / LITER_TO_GALLON_FACTOR
        area = area / M2_TO_SQ_FT_FACTOR
        monthly_et = [x / MM_TO_INCH_FACTOR for x in monthly_et]

    # _LOGGER.warning(
    #    "after conversion: flow: {}, area: {}, monthly_et: {}".format(
    #        flow, area, monthly_et
    #    )
    # )

    # calculate throughput and other dependent fixed calculations
    # these will need to be exposed as sensors!
    # peak_et = max(monthly_et)
    # throughput = number_of_sprinklers * flow
    # precipitation_rate = (throughput * 60) / area
    # base_schedule_index = peak_et / precipitation_rate * 60

    # _LOGGER.warning(
    #   "peak ET: {}, throughput: {}, precipitation_rate: {}, base_schedule_index: {}".format(
    #       peak_et, throughput, precipitation_rate, base_schedule_index
    #   )
    # )

    # store settings
    settings = {
        smart_irrigation.CONF_API_KEY: api_key,
        smart_irrigation.CONF_NAME: name,
        smart_irrigation.CONF_LATITUDE: latitude,
        smart_irrigation.CONF_LONGITUDE: longitude,
        smart_irrigation.CONF_ELEVATION: elevation,
        smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT: system_of_measurement,
        smart_irrigation.CONF_NUMBER_OF_SPRINKLERS: number_of_sprinklers,
        smart_irrigation.CONF_FLOW: flow,
        smart_irrigation.CONF_AREA: area,
        smart_irrigation.CONF_MONTHLY_ET: monthly_et,
    }
    hass.data[smart_irrigation.DOMAIN] = settings

    obj = SmartIrrigationSensor(hass, config_entry)
    async_add_entities([obj])
    hass.data[smart_irrigation.DATA_KEY].append(obj)
    return True


class SmartIrrigationSensor(RestoreEntity):
    """Representation of a Smart Irrigation sensor."""

    _name = ""

    def __init__(self, hass, conf):
        """Initialize the sensor."""
        self.hass = hass
        if not isinstance(conf, dict):
            return

        # load settings from hass data DOMAIN
        self._settings = self.hass.data[smart_irrigation.DOMAIN]
        self._type = conf.get(CONF_TYPE)
        self._name = self._settings[smart_irrigation.CONF_NAME] + " " + self._type
        _LOGGER.warning(self._name)

        self._state = 0
        self._unit_of_measurement = "unknown"
        self._icon = ""

        # base_schedule_index = peak_et / precipitation_rate * 60
        if self._type == smart_irrigation.TYPE_BASE_SCHEDULE_INDEX:
            self._unit_of_measurement = UNIT_OF_MEASUREMENT_SECOND
            # set state
            self._monthly_et = self._settings[smart_irrigation.CONF_MONTHLY_ET]
            self._peak_et = max(self._monthly_et)
            self._area = self._settings[smart_irrigation.CONF_AREA]
            self._number_of_sprinklers = self._settings[
                smart_irrigation.CONF_NUMBER_OF_SPRINKLERS
            ]
            self._flow = self._settings[smart_irrigation.CONF_FLOW]  # already in lpm
            self._throughput = self._number_of_sprinklers * self._flow
            self._precipitation_rate = (self._throughput * 60) / self._area
            self._state = (self._peak_et / self._precipitation_rate * 60) * 60
        elif (
            self._type == smart_irrigation.TYPE_PRECIPITATION
            or self._type == smart_irrigation.TYPE_EVATRANSPIRATION
            or self._type == smart_irrigation.TYPE_ADJUSTED_RUN_TIME
        ):
            if self._type == smart_irrigation.TYPE_ADJUSTED_RUN_TIME:
                self._unit_of_measurement = UNIT_OF_MEASUREMENT_SECOND
            elif (
                self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
            ):
                self._unit_of_measurement = UNIT_OF_MEASUREMENT_MM
            else:
                self._unit_of_measurement = UNIT_OF_MEASUREMENT_INCH

            if self._type == smart_irrigation.TYPE_PRECIPITATION:
                # make sure to return those two as attributes as well.
                # talk to the API here, make sure to store the values internally in mm, not in inch!
                self._rain = 0.0
                self._snow = 0.0
                self._state = self._rain + self._snow

            elif self._type == smart_irrigation.TYPE_EVATRANSPIRATION:
                self._state = 0.0
            elif self._type == smart_irrigation.TYPE_ADJUSTED_RUN_TIME:
                # bucket == self._precipitation - self.et
                # waterbudget
                # adjusted run time
                self._waterbudget = 0.0
                self._bucket = 0.0
                self._state = 0.0

            # set up the update timer
            async_track_utc_time_change(
                hass, self._async_update_every_hour, minute=0, second=0
            )

            # call the update right now
            self.update_now(hass)

        _LOGGER.warning(self.name)

    def get_data_from_OWM(self):
        """Talk to Open Weather Map to get the latest forecast"""
        url = OWM_URL.format(
            self._settings[smart_irrigation.CONF_LATITUDE],
            self._settings[smart_irrigation.CONF_LONGITUDE],
            self._settings[smart_irrigation.CONF_API_KEY].strip(),
        )
        d = None
        try:
            r = requests.get(url)
            d = json.loads(r.text)
            return d
        except Exception as e:
            _LOGGER.error("Failed to get OWM URL {}".format(r.text))
            pass

    def estimate_fao56_daily(
        self,
        day_of_year,
        temp_c,
        temp_c_min,
        temp_c_max,
        tdew,
        elevation,
        latitude,
        rh,
        wind_m_s,
        atmos_pres,
    ):
        """ Estimate fao56 from weather """
        sha = pyeto.sunset_hour_angle(
            pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year)
        )
        daylight_hours = pyeto.daylight_hours(sha)
        sunshine_hours = 0.8 * daylight_hours
        ird = pyeto.inv_rel_dist_earth_sun(day_of_year)
        et_rad = pyeto.et_rad(
            pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year), sha, ird
        )
        sol_rad = pyeto.sol_rad_from_sun_hours(daylight_hours, sunshine_hours, et_rad)
        net_in_sol_rad = pyeto.net_in_sol_rad(sol_rad=sol_rad, albedo=0.23)
        cs_rad = pyeto.cs_rad(elevation, et_rad)
        avp = pyeto.avp_from_tdew(tdew)
        net_out_lw_rad = pyeto.net_out_lw_rad(
            pyeto.convert.celsius2kelvin(temp_c_min),
            pyeto.convert.celsius2kelvin(temp_c_max),
            sol_rad,
            cs_rad,
            avp,
        )
        net_rad = pyeto.net_rad(net_in_sol_rad, net_out_lw_rad)
        eto = pyeto.fao56_penman_monteith(
            net_rad=net_rad,
            t=pyeto.convert.celsius2kelvin(temp_c),
            ws=wind_m_s,
            svp=pyeto.svp_from_t(temp_c),
            avp=avp,
            delta_svp=pyeto.delta_svp(temp_c),
            psy=pyeto.psy_const(atmos_pres),
        )
        return eto

    def calculate_fao56_daily(self, d):
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        t_day = d["temp"]["day"]
        t_min = d["temp"]["min"]
        t_max = d["temp"]["max"]
        t_dew = float(d["dew_point"])
        pressure = d["pressure"]
        RH_hr = d["humidity"]
        u_2 = d["wind_speed"]
        # print("CALCULATE_FAO56:")
        # print("t_day: {}".format(t_day))
        # print("t_min: {}".format(t_min))
        # print("t_max: {}".format(t_max))
        # print("t_dew: {}".format(t_dew))
        # print("RH_hr: {}".format(RH_hr))
        # print("u_2: {}".format(u_2))
        # print("pressure: {}".format(pressure))
        fao56 = self.estimate_fao56_daily(
            day_of_year,
            t_day,
            t_min,
            t_max,
            t_dew,
            self._settings[smart_irrigation.CONF_ELEVATION],
            self._settings[smart_irrigation.CONF_LATITUDE],
            RH_hr,
            u_2,
            pressure,
        )

        return fao56

    def update_now(self, hass):
        # Get status from Open Weather Map
        owm_data = self.get_data_from_OWM()
        # determine precipitation
        owm_today = owm_data["daily"][0]

        if self._type == smart_irrigation.TYPE_PRECIPITATION:
            if "rain" in owm_today:
                self._rain = float(owm_today["rain"])
            if "snow" in owm_today:
                self._snow = float(owm_today["snow"])

            self._state = self._rain + self._snow
            _LOGGER.warning("precipitation: {}".format(self._state))
        elif self._type == smart_irrigation.TYPE_EVATRANSPIRATION:
            self._state = self.calculate_fao56_daily(owm_today)
        elif self._type == smart_irrigation.TYPE_ADJUSTED_RUN_TIME:
            # get percipitation and ev from the sensor!
            # _LOGGER.warning(
            #    "precip from hass: {}".format(
            #        hass.states.get("sensor.smart_irrigation.precipitation")
            #    )
            # )

            precipitation = 0
            ev = 0
            # get _peak_et from sensor
            peak_et = 0
            # get base_Schedule_index from sensor
            base_schedule_index = 0
            self._bucket = precipitation - ev
            if self._bucket < 0:
                # we need to irrigate
                self._water_budget = abs(self._bucket) / peak_et
                self._state = round(self._water_budget * base_schedule_index)
                _LOGGER.info(
                    "Bucket <0, irrigation needed. Number of seconds: {}".format(
                        self._state
                    )
                )
            else:
                _LOGGER.info("Bucket >= 0, no irrigation needed.")
            j = 0
        # self.async_schedule_update_ha_state()

    async def _async_update_every_hour(self, hass):
        """Update Precipitation, EV and Bucket"""
        self.update_now(hass)

    @property
    def should_poll(self):
        """No polling needed."""
        return False

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def unit_of_measurement(self):
        """Return the unit this state is expressed in."""
        return self._unit_of_measurement

    @property
    def state(self):
        """Return the state of the entity."""
        # internally values are stored in  the metric system, so if we are using the imperial system we need to convert before returning the value
        if (
            self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
            == SETTING_METRIC
        ):
            return self._state
        else:
            if (
                self._unit_of_measurement == UNIT_OF_MEASUREMENT_GPM
                or self._unit_of_measurement == UNIT_OF_MEASUREMENT_GALLON
            ):
                return round(self._state * LITER_TO_GALLON_FACTOR, 2)
            elif self._unit_of_measurement == UNIT_OF_MEASUREMENT_INCH:
                return round(self._state * MM_TO_INCH_FACTOR, 2)
            elif self._unit_of_measurement == UNIT_OF_MEASUREMENT_SQ_FT:
                return round(self._state * M2_TO_SQ_FT_FACTOR, 1)
            elif self._unit_of_measurement == UNIT_OF_MEASUREMENT_FT:
                return round(self._state * M_TO_FT_FACTOR, 1)
            elif self._unit_of_measurement == UNIT_OF_MEASUREMENT_SECOND:
                return round(self._state, 0)

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        if self._type == smart_irrigation.TYPE_BASE_SCHEDULE_INDEX:
            return {
                smart_irrigation.CONF_NUMBER_OF_SPRINKLERS: self._number_of_sprinklers,
                smart_irrigation.CONF_FLOW: self._flow
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._flow * LITER_TO_GALLON_FACTOR, 1),
                smart_irrigation.CONF_THROUGHPUT: self._throughput
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._throughput * LITER_TO_GALLON_FACTOR, 1),
                smart_irrigation.CONF_MONTHLY_ET: self._monthly_et
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else [round(x * MM_TO_INCH_FACTOR, 2) for x in self._monthly_et],
                smart_irrigation.CONF_PEAK_ET: self._peak_et
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._peak_et * MM_TO_INCH_FACTOR, 2),
                smart_irrigation.CONF_AREA: self._area
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._area * M2_TO_SQ_FT_FACTOR, 1),
                smart_irrigation.CONF_PRECIPITATION_RATE: self._precipitation_rate
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._precipitation_rate * MM_TO_INCH_FACTOR, 2),
            }
        elif self._type == smart_irrigation.TYPE_PRECIPITATION:
            return {
                smart_irrigation.CONF_RAIN: self._rain
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._rain * MM_TO_INCH_FACTOR, 2),
                smart_irrigation.CONF_SNOW: self._snow
                if self._settings[smart_irrigation.CONF_SYSTEM_OF_MEASUREMENT]
                == SETTING_METRIC
                else round(self._snow * MM_TO_INCH_FACTOR, 2),
            }
        else:
            return {}

    @property
    def icon(self):
        """Return the icon."""
        return self._icon

    async def async_set_value(self, value):
        """Set new value."""
        # num_value = float(value)
        # if num_value < self._min_ev or num_value > self._max_ev:
        #    _LOGGER.warning(
        #        "Invalid value: %s (range %s - %s)",
        #        num_value,
        #        self._min_ev,
        #        self._max_ev,
        #    )
        #    return
        # self._state = num_value
        # self.async_schedule_update_ha_state()
