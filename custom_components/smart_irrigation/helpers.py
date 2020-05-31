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
    else:
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
    else:
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
    else:
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
    else:
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
    else:
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
    else:
        return retval


def show_seconds(value, show_units):
    """Return nicely formatted seconds."""
    if value is None:
        return "unknown"
    if show_units:
        return f"{value} s"
    else:
        return value


def show_minutes(value, show_units):
    """Return nicely formatted minutes."""
    if value is None:
        return "unknown"
    value = float(value)
    retval = round(value / 60, 2)
    if show_units:
        return f"{retval} min"
    else:
        return retval


def map_source_to_sensor(source):
    """Returns the sensor setting for the source."""
    if source == CONF_SWITCH_SOURCE_PRECIPITATION:
        return CONF_SENSOR_PRECIPITATION
    elif source == CONF_SWITCH_SOURCE_DAILY_TEMPERATURE:
        return CONF_SENSOR_DAILY_TEMPERATURE
    elif source == CONF_SWITCH_SOURCE_DEWPOINT:
        return CONF_SENSOR_DEWPOINT
    elif source == CONF_SWITCH_SOURCE_HUMIDITY:
        return CONF_SENSOR_HUMIDITY
    elif source == CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE:
        return CONF_SENSOR_MAXIMUM_TEMPERATURE
    elif source == CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE:
        return CONF_SENSOR_MINIMUM_TEMPERATE
    elif source == CONF_SWITCH_SOURCE_PRESSURE:
        return CONF_SENSOR_PRESSURE
    elif source == CONF_SWITCH_SOURCE_WINDSPEED:
        return CONF_SENSOR_WINDSPEED
    else:
        return None


def convertCtoF(value):
    return float((float(value) - 32.0) / 1.8)
