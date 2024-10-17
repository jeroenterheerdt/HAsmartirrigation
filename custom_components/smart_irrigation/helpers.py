from datetime import datetime
import importlib
import logging
import os
import sys

from homeassistant import exceptions
from homeassistant.const import UnitOfTemperature, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant

from .const import (
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
    CUSTOM_COMPONENTS,
    DOMAIN,
    GALLON_TO_LITER_FACTOR,
    INCH_TO_MM_FACTOR,
    INHG_TO_HPA_FACTOR,
    INHG_TO_PSI_FACTOR,
    K_TO_C_FACTOR,
    KMH_TO_MILESH_FACTOR,
    KMH_TO_MS_FACTOR,
    LITER_TO_GALLON_FACTOR,
    M2_TO_SQ_FT_FACTOR,
    MAPPING_DEWPOINT,
    MAPPING_EVAPOTRANSPIRATION,
    MAPPING_HUMIDITY,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_SOLRAD,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
    MBAR_TO_INHG_FACTOR,
    MBAR_TO_PSI_FACTOR,
    MILESH_TO_KMH_FACTOR,
    MILESH_TO_MS_FACTOR,
    MM_TO_INCH_FACTOR,
    MS_TO_KMH_FACTOR,
    MS_TO_MILESH_FACTOR,
    PSI_TO_HPA_FACTOR,
    PSI_TO_INHG_FACTOR,
    SQ_FT_TO_M2_FACTOR,
    UNIT_GPM,
    UNIT_HPA,
    UNIT_INCH,
    UNIT_INHG,
    UNIT_KMH,
    UNIT_LPM,
    UNIT_M2,
    UNIT_MBAR,
    UNIT_MH,
    UNIT_MILLIBAR,
    UNIT_MJ_DAY_M2,
    UNIT_MJ_DAY_SQFT,
    UNIT_MM,
    UNIT_MS,
    UNIT_PERCENT,
    UNIT_PSI,
    UNIT_SECONDS,
    UNIT_SQ_FT,
    UNIT_W_M2,
    UNIT_W_SQFT,
    W_M2_TO_W_SQ_FT_FACTOR,
    W_SQ_FT_TO_W_M2_FACTOR,
    W_TO_MJ_DAY_FACTOR,
)
from .weathermodules.OWMClient import OWMClient
from .weathermodules.PirateWeatherClient import PirateWeatherClient

_LOGGER = logging.getLogger(__name__)


def friendly_name_for_entity_id(entity_id: str, hass: HomeAssistant):
    """Helper to get friendly name for entity."""
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return state.attributes["friendly_name"]

    return entity_id


def omit(obj: dict, blacklisted_keys: list):
    return {key: val for key, val in obj.items() if key not in blacklisted_keys}


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


def convert_timestamp(val):
    outputformat = "%Y-%m-%d %H:%M:%S"
    if isinstance(val, str):
        return (datetime.fromisoformat(val).strftime(outputformat),)
    elif isinstance(val, datetime):
        return val.strftime(outputformat)
    else:
        return None


def convert_mapping_to_metric(val, mapping, unit, system_is_metric):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if mapping == MAPPING_HUMIDITY:
        # humidity unit is same in metric and imperial: %
        return val
    if mapping in [
        MAPPING_DEWPOINT,
        MAPPING_TEMPERATURE,
        MAPPING_MAX_TEMP,
        MAPPING_MIN_TEMP,
    ]:
        # either Celsius or F. If celsius, no need to convert.
        if unit:
            # a unit was set, convert it
            return convert_between(
                from_unit=unit, to_unit=UnitOfTemperature.CELSIUS, val=val
            )
        # no unit was set, so it's dependent on system_is_metric if we need to convert
        elif system_is_metric:
            return val
        else:
            # assume the unit is in F
            return convert_between(
                from_unit=UnitOfTemperature.FAHRENHEIT,
                to_unit=UnitOfTemperature.CELSIUS,
                val=val,
            )
    elif mapping in [MAPPING_PRECIPITATION, MAPPING_EVAPOTRANSPIRATION]:
        # either mm or inch. If mm no need to convert.
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_MM, val=val)
        elif system_is_metric:
            return val
        else:
            # assume the unit is in inch
            return convert_between(from_unit=UNIT_INCH, to_unit=UNIT_MM, val=val)
    elif mapping == MAPPING_PRESSURE:
        # either: mbar, hpa (default for metric), psi or inhg (default for imperial)
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_HPA, val=val)
        elif system_is_metric:
            return val
        else:
            # assume it's inHG
            return convert_between(from_unit=UNIT_INHG, to_unit=UNIT_HPA, val=val)
    elif mapping == MAPPING_SOLRAD:
        # either: assume w/m2 for metric, w/sqft for imperial
        if unit:
            _LOGGER.debug(
                f"[convert_mapping_to_metric]: unit set, converting {val} from {unit} to {UNIT_MJ_DAY_M2}"
            )
            return convert_between(from_unit=unit, to_unit=UNIT_MJ_DAY_M2, val=val)
        elif system_is_metric:
            # assume it's w/m2
            _LOGGER.debug(
                f"[convert_mapping_to_metric]: since system is metric and unit was not set, converting {val} from W/m2 to MJ/day/m2"
            )
            return convert_between(from_unit=UNIT_W_M2, to_unit=UNIT_MJ_DAY_M2, val=val)
        else:
            # assume it's w/sqft
            _LOGGER.debug(
                f"[convert_mapping_to_metric]: since system is imperial and unit was not set, converting {val} from W/sq ft to MJ/day/m2"
            )
            return convert_between(
                from_unit=UNIT_W_SQFT, to_unit=UNIT_MJ_DAY_M2, val=val
            )
    elif mapping == MAPPING_WINDSPEED:
        # either UNIT_KMH, unit: UNIT_MS (Default for metric), m/h (imperial)
        if unit:
            return convert_between(from_unit=unit, to_unit=UNIT_MS, val=val)
        elif system_is_metric:
            return val
        else:
            # assume it's m/h
            return convert_between(from_unit=UNIT_MH, to_unit=UNIT_MS, val=val)
    else:
        return None


def convert_between(from_unit, to_unit, val):
    _LOGGER.debug(
        "[convert_between]: Converting {} from {} to {}".format(val, from_unit, to_unit)
    )
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        _LOGGER.debug(
            ["[convert_between]: Value is None, Unknown or Unavailable, returning None"]
        )
        return None
    if from_unit == to_unit or from_unit in [UNIT_PERCENT, UNIT_SECONDS]:
        # no conversion necessary here!
        _LOGGER.debug(
            "[convert_between]: No conversion necessary, returning value {}".format(val)
        )
        return val
    # convert temperatures
    elif from_unit in [
        UnitOfTemperature.CELSIUS,
        UnitOfTemperature.FAHRENHEIT,
        UnitOfTemperature.KELVIN,
    ]:
        _LOGGER.debug("[convert_between]: Converting temperatures")
        return convert_temperatures(from_unit, to_unit, val)
    # convert lengths
    elif from_unit in [UNIT_MM, UNIT_INCH]:
        _LOGGER.debug("[convert_between]: Converting lengths")
        return convert_length(from_unit, to_unit, val)
    # convert volumes
    elif from_unit in [UNIT_LPM, UNIT_GPM]:
        _LOGGER.debug("[convert_between]: Converting volumes")
        return convert_volume(from_unit, to_unit, val)
    # convert areas
    elif from_unit in [UNIT_M2, UNIT_SQ_FT]:
        _LOGGER.debug("[convert_between]: Converting areas")
        return convert_area(from_unit, to_unit, val)
    # convert pressures
    elif from_unit in [UNIT_MBAR, UNIT_MILLIBAR, UNIT_HPA, UNIT_PSI, UNIT_INHG]:
        _LOGGER.debug("[convert_between]: Converting pressures")
        return convert_pressure(from_unit, to_unit, val)
    # convert speeds
    elif from_unit in [UNIT_KMH, UNIT_MS, UNIT_MH]:
        _LOGGER.debug("[convert_between]: Converting speeds")
        return convert_speed(from_unit, to_unit, val)
    # convert production/area
    elif from_unit in [UNIT_W_M2, UNIT_MJ_DAY_M2, UNIT_W_SQFT, UNIT_MJ_DAY_SQFT]:
        _LOGGER.debug("[convert_between]: Converting production/area")
        return convert_production(from_unit, to_unit, val)
    # unexpected from_unit
    _LOGGER.warning(
        "Unexpected conversion of {} from {} to {}".format(val, from_unit, to_unit)
    )
    return None


def convert_production(from_unit, to_unit, val):
    _LOGGER.debug(
        f"[convert production]: converting {val} from {from_unit} to {to_unit}"
    )
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        _LOGGER.debug("[convert production]: Value is None, Unknown or Unavailable")
        return None
    if to_unit == from_unit:
        _LOGGER.debug("[convert production]: No conversion necessary")
        return val
    if to_unit == UNIT_MJ_DAY_M2:
        _LOGGER.debug("[convert production]: Converting to MJ/day/m2")
        if from_unit == UNIT_W_M2:
            outval = float(float(val) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/m2 to MJ/day/m2. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_W_SQFT:
            outval = float((float(val) * W_SQ_FT_TO_W_M2_FACTOR) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/sq ft to MJ/day/m2. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float(float(val) * SQ_FT_TO_M2_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/sq ft to MJ/day/m2. Result: {outval}"
            )
            return outval
    elif to_unit == UNIT_MJ_DAY_SQFT:
        _LOGGER.debug("[convert production]: Converting to MJ/day/sq ft")
        if from_unit == UNIT_W_M2:
            outval = float((float(val) * W_M2_TO_W_SQ_FT_FACTOR) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/m2 to MJ/day/sq ft. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_W_SQFT:
            outval = float(float(val) * W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/sq ft to MJ/day/sq ft. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float(float(val) * M2_TO_SQ_FT_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/m2 to MJ/day/sq ft. Result: {outval}"
            )
            return outval
    elif to_unit == UNIT_W_M2:
        _LOGGER.debug("[convert production]: Converting to W/m2")
        if from_unit == UNIT_W_SQFT:
            outval = float(float(val) * W_SQ_FT_TO_W_M2_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/sq ft to W/m2. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float((float(val) / W_TO_MJ_DAY_FACTOR) * W_SQ_FT_TO_W_M2_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/sq ft to W/m2. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float(float(val) / W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/m2 to W/m2. Result: {outval}"
            )
            return outval
    elif to_unit == UNIT_W_SQFT:
        _LOGGER.debug("[convert production]: Converting to W/sq ft")
        if from_unit == UNIT_W_M2:
            outval = float(float(val) * W_M2_TO_W_SQ_FT_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from W/m2 to W/sq ft. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_M2:
            outval = float((float(val) / W_TO_MJ_DAY_FACTOR) * W_M2_TO_W_SQ_FT_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/m2 to W/sq ft. Result: {outval}"
            )
            return outval
        if from_unit == UNIT_MJ_DAY_SQFT:
            outval = float(float(val) / W_TO_MJ_DAY_FACTOR)
            _LOGGER.debug(
                f"[convert production]: Converting {val} from MJ/day/sq ft to W/sq ft. Result: {outval}"
            )
            return outval
    # unknown conversion
    return None


def convert_speed(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_KMH:
        if from_unit == UNIT_MS:
            return float(float(val) * MS_TO_KMH_FACTOR)
        elif from_unit == UNIT_MH:
            return float(float(val) * MILESH_TO_KMH_FACTOR)
    elif to_unit == UNIT_MS:
        if from_unit == UNIT_KMH:
            return float(float(val) * KMH_TO_MS_FACTOR)
        elif from_unit == UNIT_MH:
            return float(float(val) * MILESH_TO_MS_FACTOR)
    elif to_unit == UNIT_MH:
        if from_unit == UNIT_KMH:
            return float(float(val) * KMH_TO_MILESH_FACTOR)
        elif from_unit == UNIT_MS:
            return float(float(val) * MS_TO_MILESH_FACTOR)
    # unknown conversion
    return None


def convert_pressure(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit in [UNIT_MBAR, UNIT_HPA]:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            # 1 mbar = 1hpa
            return val
        elif from_unit == UNIT_PSI:
            return float(float(val) * PSI_TO_HPA_FACTOR)
        elif from_unit == UNIT_INHG:
            return float(float(val) * INHG_TO_HPA_FACTOR)
    if to_unit == UNIT_PSI:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            return float(float(val) * MBAR_TO_PSI_FACTOR)
        elif from_unit == UNIT_INHG:
            return float(float(val) * INHG_TO_PSI_FACTOR)
    if to_unit == UNIT_INHG:
        if from_unit in [UNIT_HPA, UNIT_MBAR]:
            return float(float(val) * MBAR_TO_INHG_FACTOR)
        elif from_unit == UNIT_PSI:
            return float(float(val) * PSI_TO_INHG_FACTOR)
    # unknown conversion
    return None


def convert_area(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_M2:
        if from_unit == UNIT_SQ_FT:
            return float(float(val) * SQ_FT_TO_M2_FACTOR)
    elif to_unit == UNIT_SQ_FT:
        if from_unit == UNIT_M2:
            return float(float(val) * M2_TO_SQ_FT_FACTOR)
    # unexpected conversion
    return None


def convert_volume(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_LPM:
        if from_unit == UNIT_GPM:
            return float(float(val) * GALLON_TO_LITER_FACTOR)
    elif to_unit == UNIT_GPM:
        if from_unit == UNIT_LPM:
            return float(float(val) * LITER_TO_GALLON_FACTOR)
    # unknown conversion
    return


def convert_length(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UNIT_MM:
        if from_unit == UNIT_INCH:
            return float(float(val) * INCH_TO_MM_FACTOR)
    elif to_unit == UNIT_INCH:
        if from_unit == UNIT_MM:
            return float(float(val) * MM_TO_INCH_FACTOR)
    # unknown conversion
    return None


def convert_temperatures(from_unit, to_unit, val):
    if val in (None, STATE_UNKNOWN, STATE_UNAVAILABLE):
        return None
    if to_unit == from_unit:
        return val
    if to_unit == UnitOfTemperature.CELSIUS:
        if from_unit == UnitOfTemperature.FAHRENHEIT:
            return float((float(val) - 32.0) / 1.8)
        elif from_unit == UnitOfTemperature.KELVIN:
            return val - K_TO_C_FACTOR
    elif to_unit == UnitOfTemperature.FAHRENHEIT:
        if from_unit == UnitOfTemperature.CELSIUS:
            return float((val * 1.8) + 32.0)
        elif from_unit == UnitOfTemperature.KELVIN:
            return float(1.8 * (val - 273) + 32)
    elif to_unit == UnitOfTemperature.KELVIN:
        if from_unit == UnitOfTemperature.FAHRENHEIT:
            return (val + 459.67) * (5.0 / 9.0)
        elif from_unit == UnitOfTemperature.CELSIUS:
            return val + K_TO_C_FACTOR
    # unable to do conversion because of unexpected to or from unit
    return None


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


def relative_to_absolute_pressure(pressure, height):
    """Convert relative pressure to absolute pressure."""
    # Constants
    g = 9.80665  # m/s^2
    M = 0.0289644  # kg/mol
    R = 8.31447  # J/(mol*K)
    T0 = 288.15  # K

    # Calculate temperature at given height
    temperature = T0 - (g * M * height) / (R * T0)

    # Calculate absolute pressure at given height
    absolute_pressure = pressure * (T0 / temperature) ** (g * M / (R * 287))

    return absolute_pressure


def altitudeToPressure(alt):
    """Take altitude in meters and convert it to hPa = mbar."""
    return 100 * ((44331.514 - alt) / 11880.516) ** (1 / 0.1902632) / 100


async def test_api_key(hass: HomeAssistant, weather_service, api_key):
    """Test access to Weather Service API here."""
    client = None
    test_lat = 52.353218
    test_lon = 5.0027695
    test_elev = 1
    if weather_service == CONF_WEATHER_SERVICE_OWM:
        client = OWMClient(
            api_key=api_key.strip(),
            api_version="3.0",
            latitude=test_lat,
            longitude=test_lon,
            elevation=test_elev,
        )
    elif weather_service == CONF_WEATHER_SERVICE_PW:
        client = PirateWeatherClient(
            api_key=api_key.strip(),
            api_version="1",
            latitude=test_lat,
            longitude=test_lon,
            elevation=test_elev,
        )
    if client:
        try:
            await hass.async_add_executor_job(client.get_data)
        except OSError:
            raise InvalidAuth
        except Exception:
            raise CannotConnect


def loadModules(moduleDir=None):
    if moduleDir:
        res = {}
        moduleDirFullPath = (
            os.path.dirname(os.path.realpath(__file__)) + os.sep + moduleDir
        )
        if moduleDirFullPath not in sys.path:
            sys.path.append(moduleDirFullPath)
        # check subfolders
        lst = os.listdir(moduleDirFullPath)
        # lst = os.listdir(os.path.abspath(moduleDir))
        thedir = []
        for d in lst:
            s = os.path.abspath(moduleDirFullPath) + os.sep + d
            if os.path.isdir(s) and os.path.exists(s + os.sep + "__init__.py"):
                thedir.append(d)
        # load the detected modules

        for d in thedir:
            if moduleDirFullPath + os.sep + d not in sys.path:
                sys.path.append(moduleDirFullPath + os.sep + d)
            mod = importlib.import_module(
                "." + d, package=CUSTOM_COMPONENTS + "." + DOMAIN + "." + moduleDir
            )
            if mod:
                theclasses = [
                    mod.__dict__[c]
                    for c in mod.__dict__
                    if (
                        isinstance(mod.__dict__[c], type)
                        and mod.__dict__[c].__module__ == mod.__name__
                    )
                ]
                if theclasses:
                    for theclass in theclasses:
                        if "__init__" in theclass.__dict__:
                            classname = (
                                str(theclass.__dict__["__init__"])
                                .split(".")[0]
                                .split(" ")[1]
                            )
                            res[d] = {"module": mod, "class": classname}
        return res
    return None


def convert_list_to_dict(lst):
    """Convert list to dict."""
    res_dict = {}
    for i in range(0, len(lst), 1):
        # print(i)
        # print(lst[i])
        if isinstance(lst[i], str):
            if i + 1 >= len(lst) or isinstance(lst[i + 1], str):
                res_dict[lst[i]] = None
            else:
                res_dict[lst[i]] = lst[i + 1]
    return res_dict


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""
