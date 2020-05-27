"""Sensor platform for Smart Irrigation."""
import datetime
import asyncio
import logging

from ..smart_irrigation import pyeto
from homeassistant.core import callback, Event
from homeassistant.helpers import entity_registry as er

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
            self.hass.bus.async_listen(
                EVENT_BUCKET_UPDATED, lambda event: self._bucket_updated(event)
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
                        if self.coordinator.show_units:
                            numeric_part, unit = a_val.split(" ")
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
                            if a == CONF_EVAPOTRANSPIRATION:
                                self.evapotranspiration = numeric_part
                            elif a == CONF_NETTO_PRECIPITATION:
                                self.bucket_delta = numeric_part
                            elif a == CONF_PRECIPITATION:
                                self.precipitation = numeric_part
                            elif a == CONF_RAIN:
                                self.rain = numeric_part
                            elif a == CONF_SNOW:
                                self.snow = numeric_part
                            elif a == CONF_BUCKET:
                                self.bucket = numeric_part
                                self.coordinator.bucket = self.bucket
                            factor = 1
                            if self.coordinator.system_of_measurement != SETTING_METRIC:
                                factor = MM_TO_INCH_FACTOR
                                # unit should be included here as well
                                setattr(
                                    self,
                                    a,
                                    f"{round(numeric_part / MM_TO_INCH_FACTOR, 2)}",
                                )
                        elif a in (CONF_WATER_BUDGET, CONF_ADJUSTED_RUN_TIME_MINUTES):
                            # no need for conversion here
                            if a == CONF_WATER_BUDGET:
                                self.water_budget = numeric_part
                            # no need to store adjusted run time minutes
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
        self.hass.states.set(
            art_entity_id,
            result["art"],
            {
                CONF_BUCKET: self.show_mm_or_inch(self.bucket),
                CONF_WATER_BUDGET: self.show_percentage(result["wb"]),
            },
        )

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{DEFAULT_NAME} {self.type}"

    def update_state(self):
        """Update the state."""
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            return round(self.coordinator.base_schedule_index, 1)
        # hourly adjusted run time
        elif self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            data = self.coordinator.data["daily"][0]
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
                CONF_FLOW: self.show_liter_or_gallon(self.coordinator.flow),
                CONF_THROUGHPUT: self.show_liter_or_gallon_per_minute(
                    self.coordinator.throughput
                ),
                CONF_REFERENCE_ET: self.show_mm_or_inch(self.coordinator.reference_et),
                CONF_PEAK_ET: self.show_mm_or_inch(self.coordinator.peak_et),
                CONF_AREA: self.show_m2_or_sq_ft(self.coordinator.area),
                CONF_PRECIPITATION_RATE: self.show_mm_or_inch_per_hour(
                    self.coordinator.precipitation_rate
                ),
                CONF_BASE_SCHEDULE_INDEX_MINUTES: self.show_minutes(self.state),
            }
        elif self.type == TYPE_CURRENT_ADJUSTED_RUN_TIME:
            return {
                CONF_RAIN: self.show_mm_or_inch(self.rain),
                CONF_SNOW: self.show_mm_or_inch(self.snow),
                CONF_PRECIPITATION: self.show_mm_or_inch(self.precipitation),
                CONF_EVAPOTRANSPIRATION: self.show_mm_or_inch(self.evapotranspiration),
                CONF_NETTO_PRECIPITATION: self.show_mm_or_inch(self.bucket_delta),
                CONF_WATER_BUDGET: self.show_percentage(self.water_budget),
                CONF_ADJUSTED_RUN_TIME_MINUTES: self.show_minutes(self.state),
            }
        else:
            return {
                CONF_WATER_BUDGET: self.show_percentage(self.water_budget),
                CONF_BUCKET: self.show_mm_or_inch(self.bucket),
                CONF_LEAD_TIME: self.show_seconds(self.coordinator.lead_time),
                CONF_MAXIMUM_DURATION: self.show_seconds(
                    self.coordinator.maximum_duration
                ),
                CONF_ADJUSTED_RUN_TIME_MINUTES: self.show_minutes(self.state),
            }

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return ICON

    def get_precipitation(self, data):
        """Parse out precipitation info from OWM data."""
        if "rain" in data:
            self.rain = float(data["rain"])
        if "snow" in data:
            self.snow = float(data["snow"])
        _LOGGER.info("rain: {}, snow: {}".format(self.rain, self.snow))
        retval = self.rain + self.snow
        if isinstance(retval, str):
            if retval.count(".") > 1:
                retval = retval.split(".")[0] + "." + retval.split(".")[1]
        retval = float(retval)
        return retval

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
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        t_day = d["temp"]["day"]
        t_min = d["temp"]["min"]
        t_max = d["temp"]["max"]
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

    def show_liter_or_gallon(self, value):
        """Return nicely formatted liters or gallons."""
        if value is None:
            return "unknown"
        value = float(value)
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_LITERS}"
            return retval
        else:
            retval = f"{round(value * LITER_TO_GALLON_FACTOR,2)}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_GALLONS}"
            return retval

    def show_liter_or_gallon_per_minute(self, value):
        """Return nicely formatted liters or gallons."""
        if value is None:
            return "unknown"
        value = float(value)
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_LPM}"
            return retval
        else:
            retval = f"{round(value * LITER_TO_GALLON_FACTOR,2)}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_GPM}"
            return retval

    def show_mm_or_inch(self, value):
        """Return nicely formatted mm or inches."""
        if value is None:
            return "unknown"
        if not isinstance(value, list):
            value = float(value)
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_MMS}"
            return retval
        else:
            if isinstance(value, list):
                retval = f"{[round(x * MM_TO_INCH_FACTOR,2) for x in value]}"
            else:
                retval = f"{round(value * MM_TO_INCH_FACTOR,2)}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_INCHES}"
            return retval

    def show_mm_or_inch_per_hour(self, value):
        """Return nicely formatted mm or inches per hour."""
        if value is None:
            return "unknown"
        value = float(value)
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_MMS_HOUR}"
            return retval
        else:
            if isinstance(value, list):
                retval = f"{[round(x * MM_TO_INCH_FACTOR,2) for x in value]}"
            else:
                retval = f"{round(value * MM_TO_INCH_FACTOR,2)}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_INCHES_HOUR}"
            return retval

    def show_m2_or_sq_ft(self, value):
        """Return nicely formatted m2 or sq ft."""
        if value is None:
            return "unknown"
        value = float(value)
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_M2}"
            return retval
        else:
            retval = f"{round(value * M2_TO_SQ_FT_FACTOR,2)}"
            if self.coordinator.show_units:
                retval = retval + f" {UNIT_OF_MEASUREMENT_SQ_FT}"
            return retval

    def show_percentage(self, value):
        """Return nicely formatted percentages."""
        if value is None:
            return "unknown"
        value = float(value)
        retval = round(value * 100, 2)
        if self.coordinator.show_units:
            return f"{retval} %"
        else:
            return retval

    def show_seconds(self, value):
        """Return nicely formatted seconds."""
        if value is None:
            return "unknown"
        if self.coordinator.show_units:
            return f"{value} s"
        else:
            return value

    def show_minutes(self, value):
        """Return nicely formatted minutes."""
        if value is None:
            return "unknown"
        value = float(value)
        retval = round(value / 60, 2)
        if self.coordinator.show_units:
            return f"{retval} min"
        else:
            return retval

    def calculate_water_budget_and_adjusted_run_time(self, bucket_val):
        water_budget = 0
        adjusted_run_time = 0
        if bucket_val is None or bucket_val >= 0:
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
