"""Sensor platform for Smart Irrigation."""
import datetime
from ..smart_irrigation import pyeto

from .const import (
    DEFAULT_NAME,
    DOMAIN,
    ICON,
    TYPE_BASE_SCHEDULE_INDEX,
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
    CONF_EVATRANSPIRATION,
    CONF_WATER_BUDGET,
    UNIT_OF_MEASUREMENT_LITERS,
    UNIT_OF_MEASUREMENT_GALLONS,
    UNIT_OF_MEASUREMENT_MMS,
    UNIT_OF_MEASUREMENT_INCHES,
    UNIT_OF_MEASUREMENT_M2,
    UNIT_OF_MEASUREMENT_SQ_FT,
    CONF_RAIN,
    CONF_SNOW,
    CONF_BUCKET,
)
from .entity import SmartIrrigationEntity


async def async_setup_entry(hass, entry, async_add_devices):
    """Setup sensor platform."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    # async_add_devices([SmartIrrigationSensor(coordinator, entry)])
    async_add_devices(
        [
            SmartIrrigationSensor(coordinator, entry, TYPE_BASE_SCHEDULE_INDEX),
            SmartIrrigationSensor(coordinator, entry, TYPE_ADJUSTED_RUN_TIME),
        ]
    )


class SmartIrrigationSensor(SmartIrrigationEntity):
    """SmartIrrigation Sensor class."""

    def __init__(self, coordinator, entity, thetype):
        super(SmartIrrigationSensor, self).__init__(coordinator, entity, thetype)
        self._unit_of_measurement = UNIT_OF_MEASUREMENT_UNKNOWN
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            self._unit_of_measurement = UNIT_OF_MEASUREMENT_SECONDS
        if self.type == TYPE_ADJUSTED_RUN_TIME:
            self._unit_of_measurement = UNIT_OF_MEASUREMENT_SECONDS
            self.precipitation = 0.0
            self.rain = 0.0
            self.snow = 0.0
            self.evatranspiration = 0.0
            self.water_budget = 0.0
            self.bucket = 0
            self.irrigation_time = ""

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{DEFAULT_NAME}_{self.type}"

    @property
    def state(self):
        """Return the state of the sensor."""
        if self.type == TYPE_BASE_SCHEDULE_INDEX:
            return round(self.coordinator.base_schedule_index, 1)
        else:
            data = self.coordinator.data["daily"][0]
            # parse percipitation out of the today data
            self.precipitation = self.get_precipitation(data)
            # calculate et out of the today data
            self.evatranspiration = self.get_evatranspiration(data)
            # calculate the adjusted runtime!
            self.bucket = self.precipitation - self.evatranspiration
            if self.bucket < 0:
                # we need to irrigate
                self.water_budget = abs(self.bucket) / self.coordinator.peak_et
                # adjusted runtime
                return round(self.water_budget * self.coordinator.base_schedule_index)
            else:
                # we do not need to irrigate
                self.water_budget = 0
                # return 0 for adjusted runtime
                return 0

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
                CONF_THROUGHPUT: self.show_liter_or_gallon(self.coordinator.throughput),
                CONF_REFERENCE_ET: self.show_mm_or_inch(self.coordinator.reference_et),
                CONF_PEAK_ET: self.show_mm_or_inch(self.coordinator.peak_et),
                CONF_AREA: self.show_m2_or_sq_ft(self.coordinator.area),
                CONF_PRECIPITATION_RATE: self.show_mm_or_inch(
                    self.coordinator.precipitation_rate
                ),
            }
        elif self.type == TYPE_ADJUSTED_RUN_TIME:
            return {
                CONF_RAIN: self.show_mm_or_inch(self.rain),
                CONF_SNOW: self.show_mm_or_inch(self.snow),
                CONF_PRECIPITATION: self.show_mm_or_inch(self.precipitation),
                CONF_EVATRANSPIRATION: self.show_mm_or_inch(self.evatranspiration),
                CONF_BUCKET: self.show_mm_or_inch(self.bucket),
                CONF_WATER_BUDGET: self.show_percentage(self.water_budget),
            }
        else:
            return {"type": self.type}

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
        return self.rain + self.snow

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

    def get_evatranspiration(self, d):
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

    def show_liter_or_gallon(self, value, show_unit=True):
        """Return nicely formatted liters or gallons."""
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if show_unit:
                retval = retval + f" {UNIT_OF_MEASUREMENT_LITERS}"
            return retval
        else:
            retval = f"{round(value * LITER_TO_GALLON_FACTOR,2)}"
            if show_unit:
                retval = retval + f" {UNIT_OF_MEASUREMENT_GALLONS}"
            return retval

    def show_mm_or_inch(self, value, show_unit=True):
        """Return nicely formatted mm or inches."""
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if show_unit:
                retval = retval + f" {UNIT_OF_MEASUREMENT_MMS}"
            return retval
        else:
            if isinstance(value, list):
                retval = f"{[round(x * MM_TO_INCH_FACTOR,2) for x in value]}"
            else:
                retval = f"{round(value * MM_TO_INCH_FACTOR,2)}"
            if show_unit:
                retval = retval + f" {UNIT_OF_MEASUREMENT_INCHES}"
            return retval

    def show_m2_or_sq_ft(self, value, show_unit=True):
        """Return nicely formatted m2 or sq ft."""
        if self.coordinator.system_of_measurement == SETTING_METRIC:
            retval = f"{value}"
            if show_unit:
                retval = retval + " {UNIT_OF_MEASUREMENT_M2}"
            return retval
        else:
            retval = f"{round(value * M2_TO_SQ_FT_FACTOR,2)}"
            if show_unit:
                retval = retval + f" {UNIT_OF_MEASUREMENT_SQ_FT}"
            return retval

    def show_percentage(self, value, show_unit=True):
        """Return nicely formatted percentages."""
        retval = value * 100
        if show_unit:
            return f"{retval} %"
        else:
            return retval
