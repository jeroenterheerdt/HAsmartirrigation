"""Sensor platform for Smart Irrigation."""
import datetime
import asyncio
import logging

from homeassistant.core import callback, Event
from homeassistant.helpers.event import async_track_point_in_time

from .helpers import (
    show_percentage,
    show_mm_or_inch,
    show_seconds,
    show_minutes,
    show_mm_or_inch_per_hour,
    show_liter_or_gallon,
    show_liter_or_gallon_per_minute,
    show_m2_or_sq_ft,
    convert_F_to_C,
    estimate_fao56_daily,
    convert_to_float,
)

from .const import (  # pylint: disable=unused-import
    DOMAIN,
    ICON,
    TYPE_BASE_SCHEDULE_INDEX,
    TYPE_CURRENT_ADJUSTED_RUN_TIME,
    TYPE_ADJUSTED_RUN_TIME,
    UNIT_OF_MEASUREMENT_SECONDS,
    CONF_NUMBER_OF_SPRINKLERS,
    CONF_FLOW,
    CONF_THROUGHPUT,
    SETTING_METRIC,
    CONF_REFERENCE_ET,
    MM_TO_INCH_FACTOR,
    CONF_PEAK_ET,
    CONF_AREA,
    CONF_PRECIPITATION_RATE,
    CONF_PRECIPITATION,
    CONF_NETTO_PRECIPITATION,
    CONF_EVAPOTRANSPIRATION,
    CONF_WATER_BUDGET,
    CONF_RAIN,
    CONF_SNOW,
    CONF_BUCKET,
    EVENT_BUCKET_UPDATED,
    CONF_LEAD_TIME,
    CONF_MAXIMUM_DURATION,
    CONF_ADJUSTED_RUN_TIME_MINUTES,
    CONF_BASE_SCHEDULE_INDEX_MINUTES,
    EVENT_HOURLY_DATA_UPDATED,
    CONF_AUTO_REFRESH,
    CONF_AUTO_REFRESH_TIME,
    CONF_FORCE_MODE_DURATION,
    KMH_TO_MS_FACTOR,
    MILESH_TO_MS_FACTOR,
    PSI_TO_HPA_FACTOR,
    CONF_FORCE_MODE_ENABLED,
    EVENT_FORCE_MODE_TOGGLED,
    CONF_INITIAL_UPDATE_DELAY,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_ICON,
    CONF_SPRINKLER_ICON,
    CONF_COASTAL,
    CONF_ESTIMATE_SOLRAD_FROM_TEMP,
    W_TO_J_DAY_FACTOR,
    J_TO_MJ_FACTOR,
    M2_TO_SQ_FT_FACTOR,
    CONF_SENSOR_PRECIPITATION,
    CONF_SENSOR_DAILY_TEMPERATURE,
    CONF_SENSOR_DEWPOINT,
    CONF_SENSOR_HUMIDITY,
    CONF_SENSOR_MAXIMUM_TEMPERATURE,
    CONF_SENSOR_MINIMUM_TEMPERATURE,
    CONF_SENSOR_PRESSURE,
    CONF_SENSOR_WINDSPEED,
    CONF_SENSOR_SOLAR_RADIATION,
    CONF_SENSOR_ET,
    EVENT_IRRIGATE_START,
)
from .entity import SmartIrrigationEntity

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_devices):
    """Set up the sensor platform."""
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
        """Initialize SmartIrrigation Sensor."""
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
            _LOGGER.info(
                "sensor __init__ for current_adjusted_run_time. bucket_delta=0"
            )
        if self.type == TYPE_ADJUSTED_RUN_TIME:
            _LOGGER.info("sensor __init__ for adjusted_run_time. bucket=0")
            self.bucket = 0

    @asyncio.coroutine
    async def async_added_to_hass(self):
        """Complete the initialization."""
        await super().async_added_to_hass()
        # register this sensor in the coordinator
        self.coordinator.register_entity(self.type, self.entity_id)

        # listen to the bucket update event and force mode toggle event only for the adjusted run time sensor
        if self.type == TYPE_ADJUSTED_RUN_TIME:
            event_to_listen = f"{self.coordinator.name}_{EVENT_BUCKET_UPDATED}"
            self.hass.bus.async_listen(
                event_to_listen,
                lambda event: self._bucket_updated(  # pylint: disable=unnecessary-lambda
                    event
                ),
            )
            event_to_listen_2 = f"{self.coordinator.name}_{EVENT_FORCE_MODE_TOGGLED}"
            self.hass.bus.async_listen(
                event_to_listen_2,
                lambda event: self._force_mode_toggled(  # pylint: disable=unnecessary-lambda
                    event
                ),
            )
        # listen to the hourly data updated event only for the current adjusted run time sensor
        if self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            event_to_listen = f"{self.coordinator.name}_{EVENT_HOURLY_DATA_UPDATED}"
            self.hass.bus.async_listen(
                event_to_listen,
                lambda event: self._hourly_data_updated(  # pylint: disable=unnecessary-lambda
                    event
                ),
            )

        state = await self.async_get_last_state()
        if (  # pylint: disable=too-many-nested-blocks
            state is not None and state.state != "unavailable"
        ):
            self._state = float(state.state)
            _LOGGER.info(
                "async_added_t_hass type: {} state: {}, attributes: {}".format(
                    self.type, state.state, state.attributes
                )
            )
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
            for attr in confs:
                if attr in state.attributes:
                    try:
                        a_val = state.attributes[attr]

                        # no split needed if we don't show units
                        # ifstr is only temporary for debugging purposes
                        ifstr = False
                        if self.coordinator.show_units or (
                            isinstance(a_val, str) and " " in a_val
                        ):
                            numeric_part = float(a_val.split(" ")[0])
                            ifstr = True
                        else:
                            numeric_part = float(a_val)
                        _LOGGER.info(
                            "async_added_t_hass type: {}, attribute: {}, attribute_value: {}, numeric_part: {}, show_units: {}, a_val was str or contained ' ': {}".format(
                                self.type,
                                attr,
                                a_val,
                                numeric_part,
                                self.coordinator.show_units,
                                ifstr,
                            )
                        )
                        if attr in (
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
                            if attr == CONF_EVAPOTRANSPIRATION:
                                self.evapotranspiration = numeric_part
                            elif attr == CONF_NETTO_PRECIPITATION:
                                self.bucket_delta = numeric_part
                                _LOGGER.info(
                                    "async_added_to_hass restoring state, setting netto precipitation / bucket_delta to: {}".format(
                                        self.bucket_delta
                                    )
                                )
                            elif attr == CONF_PRECIPITATION:
                                self.precipitation = numeric_part
                            elif attr == CONF_RAIN:
                                self.rain = numeric_part
                            elif attr == CONF_SNOW:
                                self.snow = numeric_part
                            elif attr == CONF_BUCKET:
                                self.bucket = numeric_part
                                self.coordinator.bucket = self.bucket
                                _LOGGER.info(
                                    "async_added_to_hass restoring state, settting bucket to: {}".format(
                                        self.bucket
                                    )
                                )
                        elif attr in (
                            CONF_WATER_BUDGET,
                            CONF_ADJUSTED_RUN_TIME_MINUTES,
                        ):
                            # no need for conversion here
                            if attr == CONF_WATER_BUDGET:
                                self.water_budget = numeric_part
                            # no need to store adjusted run time minutes
                        # set the attribute
                        setattr(self, attr, f"{numeric_part}")

                    except Exception as ex:  # pylint: disable=broad-except
                        _LOGGER.error(ex)

    def update_adjusted_run_time_from_event(self):
        """Update the adjusted run time. Should only be called from _bucket_update and _force_mode_toggled event handlers."""
        _LOGGER.info("updated_adjusted_run_time_from_event called.")
        result = self.calculate_water_budget_and_adjusted_run_time(
            self.bucket, self.type
        )
        _LOGGER.info(
            "updated_adjusted_run_time_from_event: got result: {}. Setting attributes of daily adjusted run time (including result['wb']) and state == result['art']".format(
                result
            )
        )
        art_entity_id = self.coordinator.entities[TYPE_ADJUSTED_RUN_TIME]
        attr = self.get_attributes_for_daily_adjusted_run_time(
            self.bucket, result["wb"], result["art"]
        )
        self.hass.states.set(
            art_entity_id, result["art"], attr,
        )

        # make sure to fire the 'we need to start irrigation now' event in time so we finish just before sunrise
        sun_state = self.hass.states.get("sun.sun")
        if sun_state is not None:
            sun_rise = sun_state.attributes.get("next_rising")
            if sun_rise is not None:
                sun_rise = datetime.datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S%z")
                _LOGGER.info("sun_rise: {}".format(sun_rise))
                async_track_point_in_time(
                    self.hass, self._fire_start_event, point_in_time=sun_rise
                )
                time_to_fire = sun_rise - datetime.timedelta(seconds=result["art"])
                event_to_fire = f"{self.coordinator.name}_{EVENT_IRRIGATE_START}"
                _LOGGER.info("{} will fire at {}".format(event_to_fire, time_to_fire))

    async def _fire_start_event(self, *args):
        """Fire the irrigation start event.."""
        event_to_fire = f"{self.coordinator.name}_{EVENT_IRRIGATE_START}"
        self.coordinator.hass.bus.fire(event_to_fire, {})
        _LOGGER.info("fired start event: {}".format(event_to_fire))

    @callback
    def _bucket_updated(self, event: Event):
        """Receive the bucket updated event."""
        # update the sensor status.
        event_dict = event.as_dict()
        self.bucket = float(event_dict["data"][CONF_BUCKET])
        _LOGGER.info(
            "_bucket_updated, received bucket value {} from event_dict: {}".format(
                self.bucket, event_dict
            )
        )
        self.update_adjusted_run_time_from_event()

    @callback
    def _force_mode_toggled(self, event: Event):
        """Receive the force mode toggle event."""
        self.update_adjusted_run_time_from_event()

    @callback
    def _hourly_data_updated(self, event: Event):
        """Receive the hourly data updated event."""
        _LOGGER.info(
            "_hourly_data_updated, calling update_state for type {}".format(self.type)
        )
        self._state = self.update_state()
        self.hass.add_job(self.async_update_ha_state)

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self.type}"

    def get_attributes_for_daily_adjusted_run_time(self, bucket, water_budget, art):
        """Return the attributes for daily_adjusted_run_time."""
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
            # DISABLED : CHANGE_PERCENT has been disabled in v0.0.40 onwards since it introduced bugs.
            # CONF_CHANGE_PERCENT: show_percentage(
            #     self.coordinator.change_percent, self.coordinator.show_units,
            # ),
            CONF_MAXIMUM_DURATION: show_seconds(
                self.coordinator.maximum_duration, self.coordinator.show_units
            ),
            CONF_ADJUSTED_RUN_TIME_MINUTES: show_minutes(
                art, self.coordinator.show_units
            ),
            CONF_FORCE_MODE_DURATION: self.coordinator.force_mode_duration,
            CONF_FORCE_MODE_ENABLED: self.coordinator.force_mode,
            CONF_UNIT_OF_MEASUREMENT: UNIT_OF_MEASUREMENT_SECONDS,
            CONF_ICON: CONF_SPRINKLER_ICON,
        }

    def update_state(self):
        """Update the state."""
        _LOGGER.info("update_state for type: {}".format(self.type))
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            return round(self.coordinator.base_schedule_index, 1)
        # hourly adjusted run time
        if (  # pylint: disable=too-many-nested-blocks
            self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME
        ):
            data = {}
            # if we have an api, read the data
            if self.coordinator.api:
                data = self.coordinator.data["daily"][0]

            # retrieve the data from the sensors (if set) and build the data or overwrite what we got from the API
            if self.coordinator.sensors:
                for sensor, entity in self.coordinator.sensors.items():
                    # this is a sensor we will need to use.
                    sensor_state = self.hass.states.get(entity)
                    _LOGGER.info(
                        "update_state USING A SENSOR for instance {}, type: {}, sensor: {}, entity: {}, sensor_state: {}".format(  # pylint: disable=logging-format-interpolation
                            self.coordinator.name,
                            self.type,
                            sensor,
                            entity,
                            sensor_state,
                        )
                    )
                    if sensor_state is not None:
                        # we have the sensor_state - convert it to float
                        if (
                            isinstance(sensor_state.state, str)
                            and sensor_state.state.count(" ") > 0
                        ):
                            sensor_state = sensor_state.state.split(" ")[0]
                        else:
                            sensor_state = sensor_state.state

                        if sensor == CONF_SENSOR_PRECIPITATION:
                            # get precipitation from sensor, assuming there is no separate snow sensor
                            data["snow"] = 0.0
                            # metric: mm, imperial: inch
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["rain"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["rain"] = float(
                                    convert_to_float(sensor_state) / MM_TO_INCH_FACTOR
                                )
                        if sensor == CONF_SENSOR_ET:
                            # get et from sensor
                            # metric: mm, imperial: inch
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                self.evapotranspiration = convert_to_float(sensor_state)
                            else:
                                # imperial
                                self.evapotranspiration = float(
                                    convert_to_float(sensor_state) / MM_TO_INCH_FACTOR
                                )
                        if sensor == CONF_SENSOR_DEWPOINT:
                            # get dewpoint from sensor
                            # metric: C, imperial: F
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["dew_point"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["dew_point"] = convert_F_to_C(
                                    convert_to_float(sensor_state)
                                )
                        if sensor == CONF_SENSOR_DAILY_TEMPERATURE:
                            # get temperature from sensor
                            if "temp" not in data:
                                data["temp"] = {}
                            # metric: C, imperial: F
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["temp"]["day"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["temp"]["day"] = convert_F_to_C(
                                    convert_to_float(sensor_state)
                                )
                        if sensor == CONF_SENSOR_HUMIDITY:
                            # get humidity from sensor
                            # %, no conversion necessary
                            data["humidity"] = convert_to_float(sensor_state)
                        if sensor == CONF_SENSOR_MAXIMUM_TEMPERATURE:
                            # get max temp from sensor
                            if "temp" not in data:
                                data["temp"] = {}
                            # metric: C, imperial: F
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["temp"]["max"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["temp"]["max"] = convert_F_to_C(
                                    convert_to_float(sensor_state)
                                )
                        if sensor == CONF_SENSOR_MINIMUM_TEMPERATURE:
                            # get min temp from sensor
                            if "temp" not in data:
                                data["temp"] = {}
                            # metric: C, imperial: F
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["temp"]["min"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["temp"]["min"] = convert_F_to_C(
                                    convert_to_float(sensor_state)
                                )
                        if sensor == CONF_SENSOR_PRESSURE:
                            # get pressure from sensor
                            # metric: mbar, imperial: psi
                            # store in hPa (which is 1=1 with with mbar)
                            # we will convert it to kPa for the calculations.
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["pressure"] = convert_to_float(sensor_state)
                            else:
                                # imperial
                                data["pressure"] = float(
                                    convert_to_float(sensor_state) / PSI_TO_HPA_FACTOR
                                )
                        if sensor == CONF_SENSOR_WINDSPEED:
                            # get windspeed from sensor
                            # metric: km/h, imperial: m/h
                            # store in m/s
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["wind_speed"] = float(
                                    convert_to_float(sensor_state) / KMH_TO_MS_FACTOR
                                )
                            else:
                                # imperial: miles/h --> meter/s
                                data["wind_speed"] = float(
                                    convert_to_float(sensor_state) / MILESH_TO_MS_FACTOR
                                )
                        if sensor == CONF_SENSOR_SOLAR_RADIATION:
                            # get the solar radiation from sensor
                            # metric: W/m2, imperial: W/sq ft
                            # store in: MJ/m2
                            solrad = float(
                                convert_to_float(sensor_state) * W_TO_J_DAY_FACTOR
                            )
                            solrad = float(convert_to_float(solrad) / J_TO_MJ_FACTOR)
                            if self.coordinator.system_of_measurement == SETTING_METRIC:
                                data["solar_radiation"] = solrad
                            else:
                                data["solar_radiation"] = float(
                                    convert_to_float(solrad) / M2_TO_SQ_FT_FACTOR
                                )

            # parse precipitation out of the today data
            self.precipitation = self.get_precipitation(data)
            # calculate et out of the today data or from sensor if that is the configuration
            if CONF_SENSOR_ET in self.coordinator.sensors:
                _LOGGER.info(
                    "skipped calculating evapotranspiration, got the following value from a sensor: {}".format(
                        self.evapotranspiration
                    )
                )
            else:
                self.evapotranspiration = self.get_evapotranspiration(data)
                _LOGGER.info(
                    "calculated evapotranspiration: {}".format(self.evapotranspiration)
                )

            # calculate the adjusted runtime!
            self.precipitation = float(self.precipitation)
            self.evapotranspiration = float(self.evapotranspiration)
            self.bucket_delta = self.precipitation - self.evapotranspiration

            result = self.calculate_water_budget_and_adjusted_run_time(
                self.bucket_delta, self.type
            )
            self.water_budget = result["wb"]
            self.coordinator.hourly_precipitation_list.append(self.precipitation)
            self.coordinator.hourly_evapotranspiration_list.append(
                self.evapotranspiration
            )
            _LOGGER.info(
                "update_state: just updated hourly_precipitation_list: {} and hourly_evapotranspiration_list: {}".format(  # pylint: disable=logging-format-interpolation
                    self.coordinator.hourly_precipitation_list,
                    self.coordinator.hourly_evapotranspiration_list,
                )
            )
            return result["art"]
        # daily adjusted run time

        result = self.calculate_water_budget_and_adjusted_run_time(
            self.coordinator.bucket, self.type
        )
        _LOGGER.info(
            "calculating wb and art for daily adjusted run time, result: {}".format(
                result
            )
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
                CONF_INITIAL_UPDATE_DELAY: show_seconds(
                    self.coordinator.initial_update_delay, self.coordinator.show_units
                ),
                CONF_COASTAL: self.coordinator.coastal,
                CONF_ESTIMATE_SOLRAD_FROM_TEMP: self.coordinator.estimate_solrad_from_temp,
            }
        if self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
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
        return self.get_attributes_for_daily_adjusted_run_time(
            self.bucket, self.water_budget, self.state
        )

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return ICON

    def get_precipitation(self, data):
        """Parse out precipitation info from OWM data."""
        if data is not None:
            if "rain" in data:
                self.rain = float(data["rain"])
            if "snow" in data:
                self.snow = float(data["snow"])
            _LOGGER.info(
                "rain: {}, snow: {}".format(  # pylint: disable=logging-format-interpolation
                    self.rain, self.snow
                )
            )
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
        return 0.0

    def get_evapotranspiration(self, data):
        """Calculate Evantranspiration info from OWM data."""
        if data is not None:
            day_of_year = datetime.datetime.now().timetuple().tm_yday
            if "temp" in data:
                t_day = data["temp"]["day"]
                t_min = data["temp"]["min"]
                t_max = data["temp"]["max"]
            else:
                return 0.0
            t_dew = float(data["dew_point"])
            pressure = data["pressure"]
            RH_hr = data["humidity"]  # pylint: disable=invalid-name
            u_2 = data["wind_speed"]
            coastal = self.coordinator.coastal

            calculate_solar_radiation = True
            if CONF_SENSOR_SOLAR_RADIATION in self.coordinator.sensors:
                calculate_solar_radiation = False
            estimate_solrad_from_temp = self.coordinator.estimate_solrad_from_temp
            solrad = data.get("solar_radiation", None)
            fao56 = estimate_fao56_daily(
                day_of_year,
                t_day,  # in celcius, will be converted to kelvin later
                t_min,  # in celcius, will be converted to kelvin later
                t_max,  # in celcius, will be converted to kelvin later
                t_dew,  # in celcius, no need for conversion
                self.coordinator.elevation,  # in meters
                self.coordinator.latitude,
                RH_hr,  # %
                u_2,  # in m/s
                pressure,  # in hPa, will be converted to kPa later
                coastal,  # bool, defaults to False
                calculate_solar_radiation,  # bool, defaults to True
                estimate_solrad_from_temp,  # bool, defaults to True
                solrad,  # solar radiation value, only set if calculate_solar_radiation == False
            )
            return fao56
        return 0.0

    def calculate_water_budget_and_adjusted_run_time(self, bucket_val, thetype):
        """Calculate water budget and adjusted run time based on bucket_val."""
        water_budget = 0
        adjusted_run_time = 0
        # if force_mode is on just return the force mode duration but only for the daily adjusted run time
        if self.coordinator.force_mode and thetype == TYPE_ADJUSTED_RUN_TIME:
            water_budget = 1
            adjusted_run_time = self.coordinator.force_mode_duration
        else:
            if (
                bucket_val is None
                or isinstance(bucket_val, str)
                or (isinstance(bucket_val, (float, int)) and bucket_val >= 0)
            ):
                # we do not need to irrigate
                water_budget = 0
                # return 0 for adjusted runtime
                adjusted_run_time = 0
            else:
                # we need to irrigate
                water_budget = abs(bucket_val) / self.coordinator.peak_et
                # return adjusted runtime for hourly adjusted run time
                if thetype == TYPE_CURRENT_ADJUSTED_RUN_TIME:
                    adjusted_run_time = round(
                        water_budget * self.coordinator.base_schedule_index
                    )
                elif thetype == TYPE_ADJUSTED_RUN_TIME:
                    # make adjustments just for daily: lead_time, change percent and maximum_duration
                    adjusted_run_time = (
                        round(water_budget * self.coordinator.base_schedule_index)
                        + self.coordinator.lead_time
                    )
                    # DISABLED : CHANGE_PERCENT has been disabled in v0.0.40 onwards since it introduced bugs.
                    # # change_percent. default == 1, so this will have no effect.
                    # adjusted_run_time = float(
                    #     adjusted_run_time * self.coordinator.change_percent
                    # )
                    # adjusted run time is capped at maximum duration (if not -1)
                    if (
                        self.coordinator.maximum_duration != -1
                        and adjusted_run_time > self.coordinator.maximum_duration
                    ):
                        adjusted_run_time = self.coordinator.maximum_duration
        _LOGGER.info(
            "Calculated water_budget = {} and adjusted_run_time: {} for type: {}. Bucket value was: {}, and base schedule index is: {}, force mode is: {}, force mode duration is: {}, lead_time is: {}, maximum_duration: {}, change percentage: {}, type: {}".format(  # pylint: disable=logging-format-interpolation
                water_budget,
                adjusted_run_time,
                thetype,
                bucket_val,
                self.coordinator.base_schedule_index,
                self.coordinator.force_mode,
                self.coordinator.force_mode_duration,
                self.coordinator.lead_time,
                self.coordinator.maximum_duration,
                self.coordinator.change_percent,
                self.type,
            )
        )
        return {"wb": water_budget, "art": adjusted_run_time}
