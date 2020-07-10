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
    CONF_SENSOR_MINIMUM_TEMPERATURE,
    CONF_SENSOR_PRESSURE,
    CONF_SENSOR_WINDSPEED,
    CONF_SENSOR_SOLAR_RADIATION,
    CONF_SWITCH_SOURCE_SOLAR_RADIATION,
    CONF_SWITCH_CALCULATE_ET,
    CONF_SENSOR_ET,
)

from ..smart_irrigation import pyeto


def show_liter_or_gallon(value, som, show_units):
    """Return nicely formatted liters or gallons."""
    if value is None:
        return "unknown"
    factor = 1.0
    unit_of_measurement = UNIT_OF_MEASUREMENT_LITERS
    if not som == SETTING_METRIC:
        factor = LITER_TO_GALLON_FACTOR
        unit_of_measurement = UNIT_OF_MEASUREMENT_GALLONS
    retval = f"{round(float(value) * factor,2)}"
    if show_units:
        retval = retval + f" {unit_of_measurement}"
    return retval


def show_liter_or_gallon_per_minute(value, som, show_units):
    """Return nicely formatted liters or gallons."""
    if value is None:
        return "unknown"
    factor = 1.0
    unit_of_measurement = UNIT_OF_MEASUREMENT_LPM
    if not som == SETTING_METRIC:
        factor = LITER_TO_GALLON_FACTOR
        unit_of_measurement = UNIT_OF_MEASUREMENT_GPM
    retval = f"{round(float(value) * factor,2)}"
    if show_units:
        retval = retval + f" {unit_of_measurement}"
    return retval


def show_mm_or_inch(value, som, show_units):
    """Return nicely formatted mm or inches."""
    if value is None:
        return "unknown"
    factor = 1.0
    unit_of_measurement = UNIT_OF_MEASUREMENT_MMS
    if not som == SETTING_METRIC:
        factor = MM_TO_INCH_FACTOR
        unit_of_measurement = UNIT_OF_MEASUREMENT_INCHES
    if isinstance(value, list):
        retval = f"{[round(float(x) * factor,2) for x in value]}"
    else:
        retval = f"{round(float(value) * factor,2)}"
    if show_units:
        retval = retval + f" {unit_of_measurement}"
    return retval


def show_mm_or_inch_per_hour(value, som, show_units):
    """Return nicely formatted mm or inches per hour."""
    if value is None:
        return "unknown"
    factor = 1.0
    unit_of_measurement = UNIT_OF_MEASUREMENT_MMS_HOUR
    if not som == SETTING_METRIC:
        factor = MM_TO_INCH_FACTOR
        unit_of_measurement = UNIT_OF_MEASUREMENT_INCHES_HOUR
    if isinstance(value, list):
        retval = f"{[round(float(x) * factor,2) for x in value]}"
    else:
        retval = f"{round(float(value) * factor,2)}"
    if show_units:
        retval = retval + f" {unit_of_measurement}"
    return retval


def show_m2_or_sq_ft(value, som, show_units):
    """Return nicely formatted m2 or sq ft."""
    if value is None:
        return "unknown"
    factor = 1.0
    unit_of_measurement = UNIT_OF_MEASUREMENT_M2
    if not som == SETTING_METRIC:
        factor = M2_TO_SQ_FT_FACTOR
        unit_of_measurement = UNIT_OF_MEASUREMENT_SQ_FT
    retval = f"{round(float(value) * factor,2)}"
    if show_units:
        retval = retval + f" {unit_of_measurement}"
    return retval


def show_percentage(value, show_units):
    """Return nicely formatted percentages."""
    if value is None:
        return "unknown"
    retval = round(float(value) * 100.0, 2)
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
    retval = round(float(value) / 60.0, 2)
    if show_units:
        return f"{retval} min"
    return retval


def map_source_to_sensor(source):
    """Return the sensor setting for the source."""
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
        return CONF_SENSOR_MINIMUM_TEMPERATURE
    if source == CONF_SWITCH_SOURCE_PRESSURE:
        return CONF_SENSOR_PRESSURE
    if source == CONF_SWITCH_SOURCE_WINDSPEED:
        return CONF_SENSOR_WINDSPEED
    if source == CONF_SWITCH_SOURCE_SOLAR_RADIATION:
        return CONF_SENSOR_SOLAR_RADIATION
    if source == CONF_SWITCH_CALCULATE_ET:
        return CONF_SENSOR_ET
    return None


def convert_F_to_C(value):  # pylint: disable=invalid-name
    """Convert Fahrenheit to Celcius."""
    return float((float(value) - 32.0) / 1.8)


def check_all(settings, boolval):
    """Return true if all of the elements in the dictionary are equal to b (true/false)."""
    retval = True
    for aval in settings:
        if settings[aval] != boolval:
            retval = False
            break
    return retval


def reset_to(settings, boolval):
    """Reset all values in the dictionary to the specified bool value."""
    for setting in settings:
        settings[setting] = boolval
    return settings


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
        # test that max > 0
        if all_floats and max(reference_et) == 0:
            return False
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


def convert_to_float(float_value):
    """Try to convert to float, otherwise returns 0."""
    try:
        return float(float_value)
    except ValueError:
        return 0


def average_of_list(the_list):
    """Return average of provided list."""
    if len(the_list) == 0:
        return 0
    return (sum(the_list) * 1.0) / len(the_list)

def last_of_list(the_list):
    """Return the last item of the provided list."""
    if len(the_list) == 0:
        return None
    return the_list[len(the_list) - 1]

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
    coastal=False,
    calculate_solar_radiation=True,
    estimate_solrad_from_temp=True,
    sol_rad=None,
):
    """Estimate fao56 from weather."""
    sha = pyeto.sunset_hour_angle(pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year))
    daylight_hours = pyeto.daylight_hours(sha)

    ird = pyeto.inv_rel_dist_earth_sun(day_of_year)
    et_rad = pyeto.et_rad(pyeto.deg2rad(latitude), pyeto.sol_dec(day_of_year), sha, ird)

    cs_rad = pyeto.cs_rad(elevation, et_rad)

    # if we need to calculate solar_radiation we need to override the value passed in.
    if calculate_solar_radiation or sol_rad is None:
        if estimate_solrad_from_temp:
            sol_rad = pyeto.sol_rad_from_t(
                et_rad, cs_rad, temp_c_min, temp_c_max, coastal
            )
        else:
            # this is the default behavior for version < 0.0.50
            sol_rad = pyeto.sol_rad_from_sun_hours(
                daylight_hours, 0.8 * daylight_hours, et_rad
            )
    net_in_sol_rad = pyeto.net_in_sol_rad(sol_rad=sol_rad, albedo=0.23)
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
