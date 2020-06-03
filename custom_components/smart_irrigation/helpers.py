"""Helper functions."""

from .const import (
    SETTING_METRIC,
    UNIT_OF_MEASUREMENT_LITERS,
    LITER_TO_GALLON_FACTOR,
    UNIT_OF_MEASUREMENT_GALLONS,
    UNIT_OF_MEASUREMENT_LPM,
    UNIT_OF_MEASUREMENT_GPM,
    UNIT_OF_MEASUREMENT_MMS,
    MM_TO_INCH_FACTOR,
    UNIT_OF_MEASUREMENT_INCHES,
    UNIT_OF_MEASUREMENT_MMS_HOUR,
    UNIT_OF_MEASUREMENT_INCHES_HOUR,
    UNIT_OF_MEASUREMENT_M2,
    M2_TO_SQ_FT_FACTOR,
    UNIT_OF_MEASUREMENT_SQ_FT,
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

from ..smart_irrigation import pyeto


def show_liter_or_gallon(value, som, show_units):
    """Return nicely formatted liters or gallons."""
    if value is None:
        return "unknown"
    value = float(value)
    if som == SETTING_METRIC:
        retval = f"{value}"
        if show_units:
            retval = retval + f" {UNIT_OF_MEASUREMENT_LITERS}"
        return retval
    retval = f"{round(value * LITER_TO_GALLON_FACTOR,2)}"
    if show_units:
        retval = retval + f" {UNIT_OF_MEASUREMENT_GALLONS}"
    return retval


def show_liter_or_gallon_per_minute(value, som, show_units):
    """Return nicely formatted liters or gallons."""
    if value is None:
        return "unknown"
    value = float(value)
    if som == SETTING_METRIC:
        retval = f"{value}"
        if show_units:
            retval = retval + f" {UNIT_OF_MEASUREMENT_LPM}"
        return retval
    retval = f"{round(value * LITER_TO_GALLON_FACTOR,2)}"
    if show_units:
        retval = retval + f" {UNIT_OF_MEASUREMENT_GPM}"
    return retval


def show_mm_or_inch(value, som, show_units):
    """Return nicely formatted mm or inches."""
    if value is None:
        return "unknown"
    if not isinstance(value, list):
        value = float(value)
    if som == SETTING_METRIC:
        retval = f"{value}"
        if show_units:
            retval = retval + f" {UNIT_OF_MEASUREMENT_MMS}"
        return retval
    if isinstance(value, list):
        retval = f"{[round(x * MM_TO_INCH_FACTOR,2) for x in value]}"
    else:
        retval = f"{round(value * MM_TO_INCH_FACTOR,2)}"
    if show_units:
        retval = retval + f" {UNIT_OF_MEASUREMENT_INCHES}"
    return retval


def show_mm_or_inch_per_hour(value, som, show_units):
    """Return nicely formatted mm or inches per hour."""
    if value is None:
        return "unknown"
    value = float(value)
    if som == SETTING_METRIC:
        retval = f"{value}"
        if show_units:
            retval = retval + f" {UNIT_OF_MEASUREMENT_MMS_HOUR}"
        return retval
    if isinstance(value, list):
        retval = f"{[round(x * MM_TO_INCH_FACTOR,2) for x in value]}"
    else:
        retval = f"{round(value * MM_TO_INCH_FACTOR,2)}"
    if show_units:
        retval = retval + f" {UNIT_OF_MEASUREMENT_INCHES_HOUR}"
    return retval


def show_m2_or_sq_ft(value, som, show_units):
    """Return nicely formatted m2 or sq ft."""
    if value is None:
        return "unknown"
    value = float(value)
    if som == SETTING_METRIC:
        retval = f"{value}"
        if show_units:
            retval = retval + f" {UNIT_OF_MEASUREMENT_M2}"
        return retval
    retval = f"{round(value * M2_TO_SQ_FT_FACTOR,2)}"
    if show_units:
        retval = retval + f" {UNIT_OF_MEASUREMENT_SQ_FT}"
    return retval


def show_percentage(value, show_units):
    """Return nicely formatted percentages."""
    if value is None:
        return "unknown"
    value = float(value)
    retval = round(value * 100, 2)
    if show_units:
        return f"{retval} %"
    return retval


def show_seconds(value, show_units):
    """Return nicely formatted seconds."""
    if value is None:
        return "unknown"
    if show_units:
        return f"{value} s"
    return value


def show_minutes(value, show_units):
    """Return nicely formatted minutes."""
    if value is None:
        return "unknown"
    value = float(value)
    retval = round(value / 60, 2)
    if show_units:
        return f"{retval} min"
    return retval


def map_source_to_sensor(source):
    """Returns the sensor setting for the source."""
    if source == CONF_SWITCH_SOURCE_PRECIPITATION:
        return CONF_SENSOR_PRECIPITATION
    if source == CONF_SWITCH_SOURCE_DAILY_TEMPERATURE:
        return CONF_SENSOR_DAILY_TEMPERATURE
    if source == CONF_SWITCH_SOURCE_DEWPOINT:
        return CONF_SENSOR_DEWPOINT
    if source == CONF_SWITCH_SOURCE_HUMIDITY:
        return CONF_SENSOR_HUMIDITY
    if source == CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE:
        return CONF_SENSOR_MAXIMUM_TEMPERATURE
    if source == CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE:
        return CONF_SENSOR_MINIMUM_TEMPERATE
    if source == CONF_SWITCH_SOURCE_PRESSURE:
        return CONF_SENSOR_PRESSURE
    if source == CONF_SWITCH_SOURCE_WINDSPEED:
        return CONF_SENSOR_WINDSPEED
    return None


def convert_F_to_C(value):  # pylint: disable=invalid-name
    """Convert Fahrenheit to Celcius."""
    return float((float(value) - 32.0) / 1.8)


def check_all(settings, boolval):
    """Returns true if all of the elements in the dictionary are equal to b (true/false)."""
    retval = True
    for aval in settings:
        if settings[aval] != boolval:
            retval = False
            break
    return retval


def check_reference_et(reference_et):
    """Check reference et values here."""
    try:
        if len(reference_et) != 12:
            return False
        all_floats = True
        for ref in reference_et:
            if not isinstance(ref, float):
                all_floats = False
                break
        return all_floats
    except Exception:  # pylint: disable=broad-except
        return False


def check_time(itime):
    """Check time."""
    timesplit = itime.split(":")
    if len(timesplit) != 2:
        return False
    try:
        hours = int(timesplit[0])
        minutes = int(timesplit[1])
        if hours in range(0, 24) and minutes in range(
            0, 60
        ):  # range does not include upper bound
            return True
        return False
    except ValueError:
        return False


def estimate_fao56_daily(  # pylint: disable=invalid-name
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
    sha = pyeto.sunset_hour_angle(pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year))
    daylight_hours = pyeto.daylight_hours(sha)
    sunshine_hours = 0.8 * daylight_hours
    ird = pyeto.inv_rel_dist_earth_sun(day_of_year)
    et_rad = pyeto.et_rad(pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year), sha, ird)
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
        psy=pyeto.psy_const(
            atmos_pres / 10
        ),  # value stored is in hPa, but needs to be provided in kPa
    )
    return eto
