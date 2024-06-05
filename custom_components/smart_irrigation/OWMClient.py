"""Client to talk to Open Weather Map API."""  # pylint: disable=invalid-name

import datetime
import json
import logging
import math

import requests

from .const import (
    MAPPING_DEWPOINT,
    MAPPING_HUMIDITY,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
OWM_URL = (
    "https://api.openweathermap.org/data/{}/onecall?units={}&lat={}&lon={}&appid={}"
)

# Required OWM keys for validation
OWM_wind_speed_key_name = "wind_speed"
OWM_pressure_key_name = "pressure"
OWM_humidity_key_name = "humidity"
OWM_temp_key_name = "temp"
OWM_dew_point_key_name = "dew_point"

OWM_required_keys = {
    OWM_wind_speed_key_name,
    OWM_dew_point_key_name,
    OWM_temp_key_name,
    OWM_humidity_key_name,
    OWM_pressure_key_name,
}

max_temp_key_name = "max_temp"
min_temp_key_name = "min_temp"
precip_key_name = "precip"

OWM_required_key_temp = {"day", "min", "max"}

# Validators
OWM_validators = {
    "wind_speed": {"max": 135, "min": 0},
    "dew_point": {"max": 35, "min": -21},
    "temp": {"max": 56.7, "min": -89.2},
    "humidity": {"max": 100, "min": 0},
    "pressure": {"max": 1084.8, "min": 870},
}


class OWMClient:  # pylint: disable=invalid-name
    """Open Weather Map Client."""

    def __init__(
        self,
        api_key,
        api_version,
        latitude,
        longitude,
        elevation,
        cache_seconds=0,
        override_cache=False,
    ) -> None:
        """Init."""
        self.api_key = api_key.strip().replace(" ", "")
        # This should only be 3.0 going forward because of OWM Sunsetting 2.5 API.
        self.api_version = api_version.strip()
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        self.url = OWM_URL.format(api_version, "metric", latitude, longitude, api_key)
        # defaults to no cache
        self.cache_seconds = cache_seconds
        self.override_cache = override_cache
        # disabling cache for now
        self.override_cache = True
        self._last_time_called = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._cached_data = None
        self._cached_forecast_data = None

    def get_forecast_data(self):
        """Validate and return forecast data."""
        if (
            self._cached_forecast_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                req = requests.get(self.url, timeout=60)  # 60 seconds timeout
                doc = json.loads(req.text)
                _LOGGER.debug(
                    "OWMClient get_forecast_data called API {} and received {}".format(
                        self.url, doc
                    )
                )
                if doc and "cod" in doc:
                    if doc["cod"] != 200:
                        raise IOError("Cannot talk to OWM API, check API key.")
                # parse out values from daily
                if "daily" in doc:
                    parsed_data_total = []
                    # get the required values from daily.
                    for x in range(1, len(doc["daily"]) - 1):
                        data = doc["daily"][x]
                        parsed_data = {}
                        for k in OWM_required_keys:
                            if k not in data:
                                self.raiseIOError(k)
                            elif k not in [
                                OWM_wind_speed_key_name,
                                OWM_temp_key_name,
                                OWM_pressure_key_name,
                            ]:
                                if (
                                    data[k] < OWM_validators[k]["min"]
                                    or data[k] > OWM_validators[k]["max"]
                                ):
                                    self.validationError(
                                        k,
                                        data[k],
                                        OWM_validators[k]["min"],
                                        OWM_validators[k]["max"],
                                    )
                            elif k is OWM_temp_key_name:
                                for kt in OWM_required_key_temp:
                                    if kt not in data[OWM_temp_key_name]:
                                        self.raiseIOError(kt)
                                    elif (
                                        data[OWM_temp_key_name][kt]
                                        < OWM_validators["temp"]["min"]
                                        or data[OWM_temp_key_name][kt]
                                        > OWM_validators["temp"]["max"]
                                    ):
                                        self.validationError(
                                            kt,
                                            data[OWM_temp_key_name][kt],
                                            OWM_validators["temp"]["min"],
                                            OWM_validators["temp"]["max"],
                                        )
                            elif k is OWM_wind_speed_key_name:
                                # OWM reports wind speed at 10m height, so need to convert to 2m:
                                data[OWM_wind_speed_key_name] = data[
                                    OWM_wind_speed_key_name
                                ] * (4.87 / math.log((67.8 * 10) - 5.42))
                            elif k is OWM_pressure_key_name:
                                # OWM provides relative pressure, replace it with estimated absolute pressure returning!
                                data[OWM_pressure_key_name] = (
                                    self.relative_to_absolute_pressure(
                                        data[OWM_pressure_key_name], self.elevation
                                    )
                                )
                        parsed_data[MAPPING_WINDSPEED] = data[OWM_wind_speed_key_name]

                        parsed_data[MAPPING_PRESSURE] = data[OWM_pressure_key_name]

                        parsed_data[MAPPING_HUMIDITY] = data[OWM_humidity_key_name]
                        parsed_data[MAPPING_TEMPERATURE] = data[OWM_temp_key_name][
                            "day"
                        ]
                        # also put in min/max here
                        parsed_data[MAPPING_MAX_TEMP] = data[OWM_temp_key_name]["max"]
                        parsed_data[MAPPING_MIN_TEMP] = data[OWM_temp_key_name]["min"]
                        parsed_data[MAPPING_DEWPOINT] = data[OWM_dew_point_key_name]
                        # add precip from daily
                        # if rain or snow are missing from the OWM data set them to 0
                        rain = 0.0
                        snow = 0.0
                        parsed_data[MAPPING_PRECIPITATION] = 0.0
                        if "rain" in data:
                            rain = float(data["rain"])
                        if "snow" in data:
                            snow = float(data["snow"])
                        parsed_data[MAPPING_PRECIPITATION] = rain + snow
                        parsed_data_total.append(parsed_data)
                    self._cached_forecast_data = parsed_data_total
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data_total
                else:
                    _LOGGER.warning(
                        "Ignoring OWM input: missing required key 'daily' in OWM API return"
                    )
                return None
            except Exception as ex:
                _LOGGER.error("Error reading from OWM: {0}".format(ex))
                return None
        else:
            # return cached_data
            _LOGGER.info("Returning cached OWM forecastdata")
            return self._cached_forecast_data

    def relative_to_absolute_pressure(self, pressure, height):
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

    def get_data(self):
        """Validate and return data."""
        if (
            self._cached_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                req = requests.get(self.url, timeout=60)  # 60 seconds timeout
                doc = json.loads(req.text)
                _LOGGER.debug(
                    "OWMClient get_data called API {} and received {}".format(
                        self.url, doc
                    )
                )
                if "cod" in doc:
                    if doc["cod"] != 200:
                        raise IOError("Cannot talk to OWM API, check API key.")
                # parse out values for current and rain/snow from daily[0].
                if "current" in doc and "daily" in doc:
                    parsed_data = {}
                    # get the required values from current and daily.
                    data = doc["current"]
                    for k in OWM_required_keys:
                        if k not in data:
                            self.raiseIOError(k)
                        elif k not in [
                            OWM_wind_speed_key_name,
                            OWM_pressure_key_name,
                        ]:
                            if (
                                data[k] < OWM_validators[k]["min"]
                                or data[k] > OWM_validators[k]["max"]
                            ):
                                self.validationError(
                                    k,
                                    data[k],
                                    OWM_validators[k]["min"],
                                    OWM_validators[k]["max"],
                                )
                        elif k is OWM_wind_speed_key_name:
                            # OWM reports wind speed at 10m height, so need to convert to 2m:
                            data[OWM_wind_speed_key_name] = data[
                                OWM_wind_speed_key_name
                            ] * (4.87 / math.log((67.8 * 10) - 5.42))
                        elif k is OWM_pressure_key_name:
                            # OWM provides relative pressure, replace it with estimated absolute pressure returning!
                            data[OWM_pressure_key_name] = (
                                self.relative_to_absolute_pressure(
                                    data[OWM_pressure_key_name], self.elevation
                                )
                            )
                    parsed_data[MAPPING_WINDSPEED] = data[OWM_wind_speed_key_name]
                    parsed_data[MAPPING_PRESSURE] = data[OWM_pressure_key_name]
                    parsed_data[MAPPING_HUMIDITY] = data[OWM_humidity_key_name]
                    parsed_data[MAPPING_TEMPERATURE] = data[OWM_temp_key_name]
                    parsed_data[MAPPING_DEWPOINT] = data[OWM_dew_point_key_name]

                    # NOT used: also put in min/max here as just the current temp
                    # removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
                    # parsed_data[MAPPING_MAX_TEMP] = data[OWM_temp_key_name]
                    # parsed_data[MAPPING_MIN_TEMP] = data[OWM_temp_key_name]

                    # add precip from daily
                    dailydata = doc["daily"][0]
                    if dailydata is not None:
                        # if rain or snow are missing from the OWM data set them to 0
                        rain = 0.0
                        snow = 0.0
                        if "rain" in dailydata:
                            rain = float(dailydata["rain"])
                        if "snow" in dailydata:
                            snow = float(dailydata["snow"])
                        parsed_data[MAPPING_PRECIPITATION] = rain + snow
                        _LOGGER.debug("OWMCLIENT daily rain: {}".format(rain))

                        # get max temp and min temp and store
                        # removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
                        # parsed_data[MAPPING_MIN_TEMP] = dailydata[OWM_temp_key_name]["min"]
                        # parsed_data[MAPPING_MAX_TEMP] = dailydata[OWM_temp_key_name]["max"]
                    else:
                        parsed_data[MAPPING_PRECIPITATION] = 0.0
                    _LOGGER.debug(
                        "OWMCLIENT daily precipitation: {}".format(
                            parsed_data[MAPPING_PRECIPITATION]
                        )
                    )

                    self._cached_data = parsed_data
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data
                else:
                    _LOGGER.warning(
                        "Ignoring OWM input: missing required key 'current' and 'daily' in OWM API return"
                    )
                return None
            except Exception as ex:
                _LOGGER.warning(ex)
                raise ex
        else:
            # return cached_data
            _LOGGER.info("Returning cached OWM data")
            return self._cached_data

    def raiseIOError(self, key):
        raise IOError("Missing required key {} in OWM API return".format(key))

    def validationError(self, key, value, minval, maxval):
        raise ValueError(
            "Value {} is not valid for {}. Excepted range: {}-{}".format(
                value, key, minval, maxval
            )
        )
