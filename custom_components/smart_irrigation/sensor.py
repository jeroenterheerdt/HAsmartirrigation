"""Sensor platform for Smart Irrigation."""
import datetime
import asyncio
import logging

from ..smart_irrigation import pyeto
from homeassistant.core import callback, Event
from homeassistant.helpers import entity_registry as er

from .helpers import (
    show_percentage,
    show_mm_or_inch,
    show_seconds,
    show_minutes,
    show_mm_or_inch_per_hour,
    show_liter_or_gallon,
    show_liter_or_gallon_per_minute,
    show_m2_or_sq_ft,
    map_source_to_sensor,
)

from .const import (
    DEFAULT_NAME,
    DOMAIN,
    ICON,
    TYPE_BASE_SCHEDULE_INDEX,
    TYPE_CURRENT_ADJUSTED_RUN_TIME,
    TYPE_ADJUSTED_RUN_TIME,
    UNIT_OF_MEASUREMENT_SECONDS,
    UNIT_OF_MEASUREMENT_UNKNOWN,
    CONF_NUMBER_OF_SPRINKLERS,
    CONF_FLOW,
    CONF_THROUGHPUT,
    SETTING_METRIC,
    LITER_TO_GALLON_FACTOR,
    CONF_REFERENCE_ET,
    MM_TO_INCH_FACTOR,
    CONF_PEAK_ET,
    CONF_AREA,
    M2_TO_SQ_FT_FACTOR,
    CONF_PRECIPITATION_RATE,
    CONF_PRECIPITATION,
    CONF_NETTO_PRECIPITATION,
    CONF_EVAPOTRANSPIRATION,
    CONF_WATER_BUDGET,
    CONF_RAIN,
    CONF_SNOW,
    CONF_BUCKET,
    EVENT_BUCKET_UPDATED,
    UNIT_OF_MEASUREMENT_LITERS,
    UNIT_OF_MEASUREMENT_GALLONS,
    UNIT_OF_MEASUREMENT_SQ_FT,
    UNIT_OF_MEASUREMENT_M2,
    UNIT_OF_MEASUREMENT_INCHES,
    UNIT_OF_MEASUREMENT_MMS,
    UNIT_OF_MEASUREMENT_INCHES_HOUR,
    UNIT_OF_MEASUREMENT_MMS_HOUR,
    UNIT_OF_MEASUREMENT_GPM,
    UNIT_OF_MEASUREMENT_LPM,
    UNIT_OF_MEASUREMENT_MINUTES,
    CONF_LEAD_TIME,
    CONF_MAXIMUM_DURATION,
    CONF_ADJUSTED_RUN_TIME_MINUTES,
    CONF_BASE_SCHEDULE_INDEX_MINUTES,
    EVENT_HOURLY_DATA_UPDATED,
    CONF_AUTO_REFRESH,
    CONF_AUTO_REFRESH_TIME,
    CONF_FORCE_MODE_DURATION,
    CONF_SWITCH_SOURCE_PRECIPITATION,
    CONF_SWITCH_SOURCE_DAILY_TEMPERATURE,
    CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE,
    CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE,
    CONF_SWITCH_SOURCE_DEWPOINT,
    CONF_SWITCH_SOURCE_PRESSURE,
    CONF_SWITCH_SOURCE_HUMIDITY,
    CONF_SWITCH_SOURCE_WINDSPEED,
    CONF_SENSOR_PRECIPITATION,
    CONF_SENSOR_DAILY_TEMPERATURE,
    CONF_SENSOR_DEWPOINT,
    CONF_SENSOR_HUMIDITY,
    CONF_SENSOR_MAXIMUM_TEMPERATURE,
    CONF_SENSOR_MINIMUM_TEMPERATE,
    CONF_SENSOR_PRESSURE,
    CONF_SENSOR_WINDSPEED,
)
from .entity import SmartIrrigationEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_devices):
    """Setup sensor platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]

    # async_add_devices([SmartIrrigationSensor(coordinator, entry)])
    async_add_devices(
        [
            SmartIrrigationSensor(hass, coordinator, entry, TYPE_BASE_SCHEDULE_INDEX),
            SmartIrrigationSensor(
                hass, coordinator, entry, TYPE_CURRENT_ADJUSTED_RUN_TIME
            ),
            SmartIrrigationSensor(hass, coordinator, entry, TYPE_ADJUSTED_RUN_TIME),
        ]
    )


class SmartIrrigationSensor(SmartIrrigationEntity):
    """SmartIrrigation Sensor class."""

    def __init__(self, hass, coordinator, entity, thetype):
        super(SmartIrrigationSensor, self).__init__(coordinator, entity, thetype)
        self._unit_of_measurement = UNIT_OF_MEASUREMENT_SECONDS
        self._state = 0.0
        if self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            self.precipitation = 0.0
            self.rain = 0.0
            self.snow = 0.0
            self.evapotranspiration = 0.0
            self.water_budget = 0.0
            self.bucket_delta = 0
        if self.type == TYPE_ADJUSTED_RUN_TIME:
            self.bucket = 0

    @asyncio.coroutine
    async def async_added_to_hass(self):
        """Complete the initialization."""
        await super().async_added_to_hass()
        # register this sensor in the coordinator
        self.coordinator.register_entity(self.type, self.entity_id)

        # listen to the bucket update event only for the adjusted run time sensor
        if self.type == TYPE_ADJUSTED_RUN_TIME:
            eventToListen = f"{self.coordinator.name}_{EVENT_BUCKET_UPDATED}"
            self.hass.bus.async_listen(
                eventToListen, lambda event: self._bucket_updated(event),
            )
        # listen to the hourly data updated event only for the current adjusted run time sensor
        if self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            eventToListen = f"{self.coordinator.name}_{EVENT_HOURLY_DATA_UPDATED}"
            self.hass.bus.async_listen(
                eventToListen, lambda event: self._hourly_data_updated(event),
            )
        state = await self.async_get_last_state()
        if state is not None and state.state != "unavailable":
            self._state = float(state.state)
            # _LOGGER.info(
            #    "async_added_t_hass type: {} state: {}, attributes: {}".format(
            #        self.type, state.state, state.attributes
            #    )
            # )
            confs = (
                CONF_EVAPOTRANSPIRATION,
                CONF_NETTO_PRECIPITATION,
                CONF_PRECIPITATION,
                CONF_RAIN,
                CONF_SNOW,
                CONF_WATER_BUDGET,
                CONF_BUCKET,
                CONF_ADJUSTED_RUN_TIME_MINUTES,
            )
            for a in confs:
                if a in state.attributes:
                    try:
                        a_val = state.attributes[a]
                        # no split needed if we don't show units
                        if self.coordinator.show_units or (
                            isinstance(a_val, str) and " " in a_val
                        ):
                            numeric_part = float(a_val.split(" ")[0])
                        else:
                            numeric_part = float(a_val)
                        if a in (
                            CONF_EVAPOTRANSPIRATION,
                            CONF_NETTO_PRECIPITATION,
                            CONF_PRECIPITATION,
                            CONF_RAIN,
                            CONF_SNOW,
                            CONF_BUCKET,
                        ):
                            # we need to convert this back and forth from imperial to metric...
                            if self.coordinator.system_of_measurement != SETTING_METRIC:
                                numeric_part = numeric_part / MM_TO_INCH_FACTOR
                            if a == CONF_EVAPOTRANSPIRATION:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.evapotranspiration = (
                                        numeric_part / MM_TO_INCH_FACTOR
                                    )
                                else:
                                    self.evapotranspiration = numeric_part
                            elif a == CONF_NETTO_PRECIPITATION:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.bucket_delta = numeric_part / MM_TO_INCH_FACTOR
                                else:
                                    self.bucket_delta = numeric_part
                            elif a == CONF_PRECIPITATION:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.precipitation = (
                                        numeric_part / MM_TO_INCH_FACTOR
                                    )
                                else:
                                    self.precipitation = numeric_part
                            elif a == CONF_RAIN:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.rain = numeric_part / MM_TO_INCH_FACTOR
                                else:
                                    self.rain = numeric_part
                            elif a == CONF_SNOW:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.snow = numeric_part / MM_TO_INCH_FACTOR
                                else:
                                    self.snow = numeric_part
                            elif a == CONF_BUCKET:
                                if (
                                    self.coordinator.system_of_measurement
                                    != SETTING_METRIC
                                ):
                                    self.bucket = numeric_part / MM_TO_INCH_FACTOR
                                else:
                                    self.bucket = numeric_part
                                self.coordinator.bucket = self.bucket
                        elif a in (CONF_WATER_BUDGET, CONF_ADJUSTED_RUN_TIME_MINUTES):
                            # no need for conversion here
                            if a == CONF_WATER_BUDGET:
                                self.water_budget = numeric_part
                            # no need to store adjusted run time minutes
                        # set the attribute
                        setattr(self, a, f"{numeric_part}")

                    except Exception as e:
                        _LOGGER.error(e)

    @callback
    def _bucket_updated(self, ev: Event):
        """Receive the bucket updated event."""
        # update the sensor status.
        e = ev.as_dict()
        self.bucket = float(e["data"][CONF_BUCKET])
        result = self.calculate_water_budget_and_adjusted_run_time(self.bucket)
        art_entity_id = self.coordinator.entities[TYPE_ADJUSTED_RUN_TIME]
        attr = self.get_attributes_for_daily_adjusted_run_time(
            self.bucket, result["wb"], result["art"]
        )
        self.hass.states.set(
            art_entity_id, result["art"], attr,
        )

    @callback
    def _hourly_data_updated(self, ev: Event):
        """Receive the hourly data updated event."""
        self._state = self.update_state()
        self.hass.add_job(self.async_update_ha_state)

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self.type}"

    def get_attributes_for_daily_adjusted_run_time(self, bucket, water_budget, art):
        """Returns the attributes for daily_adjusted_run_time."""
        return {
            CONF_WATER_BUDGET: show_percentage(
                water_budget, self.coordinator.show_units
            ),
            CONF_BUCKET: show_mm_or_inch(
                bucket,
                self.coordinator.system_of_measurement,
                self.coordinator.show_units,
            ),
            CONF_LEAD_TIME: show_seconds(
                self.coordinator.lead_time, self.coordinator.show_units,
            ),
            CONF_MAXIMUM_DURATION: show_seconds(
                self.coordinator.maximum_duration, self.coordinator.show_units
            ),
            CONF_ADJUSTED_RUN_TIME_MINUTES: show_minutes(
                art, self.coordinator.show_units
            ),
        }

    def update_state(self):
        """Update the state."""
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            return round(self.coordinator.base_schedule_index, 1)
        # hourly adjusted run time
        elif self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            data = {}
            # if we have an api, read the data
            if self.coordinator.api:
                data = self.coordinator.data["daily"][0]
            # retrieve the data from the sensors (if set) and build the data or overwrite what we got from the API
            if self.coordinator.sources:
                for s in self.coordinator.sources:
                    if not self.coordinator.sources[s]:
                        # this source is configured as a sensor
                        sensor_setting = map_source_to_sensor(s)
                        sensor_name = self.coordinator.sensors[sensor_setting]

                        sensor_state = self.hass.states.get(sensor_name)
                        _LOGGER.debug(
                            "source: {}, sensor_setting: {}, sensor_name: {}, sensor_state: {}".format(
                                s, sensor_setting, sensor_name, sensor_state
                            )
                        )
                        if sensor_state is not None:
                            _LOGGER.debug(
                                "state value: {}".format(sensor_state.state)
                            )
                            # we have the sensor_state - convert it to float
                            if (
                                isinstance(sensor_state.state, str)
                                and sensor_state.state.count(" ") > 0
                            ):
                                sensor_state = sensor_state.state.split(" ")[0]
                            else:
                                sensor_state = sensor_state.state
                            if s == CONF_SWITCH_SOURCE_PRECIPITATION:
                                # get precipitation from sensor, assuming there is no separate snow sensor
                                data["snow"] = 0.0
                                data["rain"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_DEWPOINT:
                                # get dewpoint from sensor
                                data["dew_point"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_DAILY_TEMPERATURE:
                                # get temperature from sensor
                                if not "temp" in data:
                                    data["temp"] = {}
                                data["temp"]["day"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_HUMIDITY:
                                # get humidity from sensor
                                data["humidity"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE:
                                # get max temp from sensor
                                if not "temp" in data:
                                    data["temp"] = {}
                                data["temp"]["max"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE:
                                # get min temp from sensor
                                if not "temp" in data:
                                    data["temp"] = {}
                                data["temp"]["min"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_PRESSURE:
                                # get pressure from sensor
                                data["pressure"] = float(sensor_state)
                            if s == CONF_SWITCH_SOURCE_WINDSPEED:
                                # get windspeed from sensor
                                data["wind_speed"] = float(sensor_state)
            # parse precipitation out of the today data
            self.precipitation = self.get_precipitation(data)
            # calculate et out of the today data
            self.evapotranspiration = self.get_evapotranspiration(data)
            # calculate the adjusted runtime!
            self.bucket_delta = self.precipitation - self.evapotranspiration

            result = self.calculate_water_budget_and_adjusted_run_time(
                self.bucket_delta
            )
            self.water_budget = result["wb"]
            self.coordinator.hourly_bucket_list.append(self.bucket_delta)
            _LOGGER.debug(
                "just updated hourly_bucket_list: {}".format(
                    self.coordinator.hourly_bucket_list
                )
            )
            return result["art"]
        else:
            # daily adjusted run time
            result = self.calculate_water_budget_and_adjusted_run_time(
                self.coordinator.bucket
            )
            self.water_budget = result["wb"]
            return result["art"]

    @property
    def state(self):
        """Return the state of the sensor."""
        self._state = self.update_state()
        return self._state

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement for the sensor."""
        return self._unit_of_measurement

    @property
    def device_state_attributes(self):
        """Return the state attributes."""
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            return {
                CONF_NUMBER_OF_SPRINKLERS: self.coordinator.number_of_sprinklers,
                CONF_FLOW: show_liter_or_gallon(
                    self.coordinator.flow,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_THROUGHPUT: show_liter_or_gallon_per_minute(
                    self.coordinator.throughput,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_REFERENCE_ET: show_mm_or_inch(
                    self.coordinator.reference_et,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_PEAK_ET: show_mm_or_inch(
                    self.coordinator.peak_et,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_AREA: show_m2_or_sq_ft(
                    self.coordinator.area,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_PRECIPITATION_RATE: show_mm_or_inch_per_hour(
                    self.coordinator.precipitation_rate,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_BASE_SCHEDULE_INDEX_MINUTES: show_minutes(
                    self.state, self.coordinator.show_units
                ),
                CONF_AUTO_REFRESH: self.coordinator.auto_refresh,
                CONF_AUTO_REFRESH_TIME: self.coordinator.auto_refresh_time,
                CONF_FORCE_MODE_DURATION: self.coordinator.force_mode_duration,
            }
        elif self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            return {
                CONF_RAIN: show_mm_or_inch(
                    self.rain,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_SNOW: show_mm_or_inch(
                    self.snow,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_PRECIPITATION: show_mm_or_inch(
                    self.precipitation,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_EVAPOTRANSPIRATION: show_mm_or_inch(
                    self.evapotranspiration,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_NETTO_PRECIPITATION: show_mm_or_inch(
                    self.bucket_delta,
                    self.coordinator.system_of_measurement,
                    self.coordinator.show_units,
                ),
                CONF_WATER_BUDGET: show_percentage(
                    self.water_budget, self.coordinator.show_units
                ),
                CONF_ADJUSTED_RUN_TIME_MINUTES: show_minutes(
                    self.state, self.coordinator.show_units
                ),
            }
        else:
            return self.get_attributes_for_daily_adjusted_run_time(
                self.bucket, self.water_budget, self.state
            )

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return ICON

    def get_precipitation(self, data):
        """Parse out precipitation info from OWM data."""
        if not data is None:
            if "rain" in data:
                self.rain = float(data["rain"])
            if "snow" in data:
                self.snow = float(data["snow"])
            _LOGGER.info("rain: {}, snow: {}".format(self.rain, self.snow))
            if isinstance(self.rain, str):
                self.rain = 0
            if isinstance(self.snow, str):
                self.snow = 0
            retval = self.rain + self.snow
            if isinstance(retval, str):
                if retval.count(".") > 1:
                    retval = retval.split(".")[0] + "." + retval.split(".")[1]
            retval = float(retval)
            return retval
        else:
            return 0.0

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

    def get_evapotranspiration(self, d):
        """Calculate Evantranspiration info from OWM data."""
        if d is not None:
            day_of_year = datetime.datetime.now().timetuple().tm_yday
            if "temp" in d:
                t_day = d["temp"]["day"]
                t_min = d["temp"]["min"]
                t_max = d["temp"]["max"]
            else:
                return 0.0
            t_dew = float(d["dew_point"])
            pressure = d["pressure"]
            RH_hr = d["humidity"]
            u_2 = d["wind_speed"]
            fao56 = self.estimate_fao56_daily(
                day_of_year,
                t_day,
                t_min,
                t_max,
                t_dew,
                self.coordinator.elevation,
                self.coordinator.latitude,
                RH_hr,
                u_2,
                pressure,
            )
            return fao56
        else:
            return 0.0

    def calculate_water_budget_and_adjusted_run_time(self, bucket_val):
        water_budget = 0
        adjusted_run_time = 0
        if (
            bucket_val is None
            or isinstance(bucket_val, str)
            or (
                (isinstance(bucket_val, int) or isinstance(bucket_val, float))
                and bucket_val >= 0
            )
        ):
            # we do not need to irrigate
            water_budget = 0
            # return 0 for adjusted runtime
            adjusted_run_time = 0
        else:
            # we need to irrigate
            water_budget = abs(bucket_val) / self.coordinator.peak_et
            # adjusted runtime including lead time if set up
            adjusted_run_time = (
                round(water_budget * self.coordinator.base_schedule_index)
                + self.coordinator.lead_time
            )
            # adjusted run time is capped at maximum duration (if not -1)
            if (
                self.coordinator.maximum_duration != -1
                and adjusted_run_time > self.coordinator.maximum_duration
            ):
                adjusted_run_time = self.coordinator.maximum_duration
        return {"wb": water_budget, "art": adjusted_run_time}
