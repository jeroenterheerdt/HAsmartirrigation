"""Client to talk to Pirate Weather API."""  # pylint: disable=invalid-name

import datetime
import json
import logging
import math
import sys

import requests

# DO NOT USE THESE FOR TESTING, INSTEAD DEFINE THE CONSTS IN THIS FILE
from ..const import (
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
PirateWeather_URL = "https://api.pirateweather.net/forecast/{}/{},{}?units={}&version={}&exclude=minutely,hourly,alerts"

# Required PirateWeather keys for validation
PirateWeather_wind_speed_key_name = "windSpeed"
PirateWeather_pressure_key_name = "pressure"
PirateWeather_humidity_key_name = "humidity"
PirateWeather_temp_key_name = "temperature"
PirateWeather_dew_point_key_name = "dewPoint"
PirateWeather_current_weather_key_name = "currently"
PirateWeather_daily_weather_key_name = "daily"
PirateWeather_required_keys = {
    PirateWeather_wind_speed_key_name,
    PirateWeather_dew_point_key_name,
    PirateWeather_temp_key_name,
    PirateWeather_humidity_key_name,
    PirateWeather_pressure_key_name,
}

max_temp_key_name = "max_temp"
min_temp_key_name = "min_temp"
precip_key_name = "precip"

PirateWeather_required_key_temp = {"day", "min", "max"}

# Validators
PirateWeatherValidators = {
    "windSpeed": {"max": 135, "min": 0},
    "dewPoint": {"max": 35, "min": -21},
    "temperature": {"max": 56.7, "min": -89.2},
    "humidity": {"max": 100, "min": 0},
    "pressure": {"max": 1084.8, "min": 870},
}


class PirateWeatherClient:  # pylint: disable=invalid-name
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
        self.api_version = api_version.strip()  # valid versions: 1 or 2
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        self.url = PirateWeather_URL.format(
            self.api_key, self.latitude, self.longitude, "si", self.api_version
        )
        # defaults to no cache
        self.cache_seconds = cache_seconds
        self.override_cache = override_cache
        # disabling cache for now
        self.override_cache = True
        self._last_time_called = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._cached_data = None
        self._cached_forecast_data = None

    def get_forecast_data(self):
        # TODO
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
                    "PirateWeatherClient get_forecast_data called API {} and received {}".format(
                        self.url, doc
                    )
                )
                if doc and "cod" in doc:
                    if doc["cod"] != 200:
                        raise IOError(
                            "Cannot talk to PirateWeather API, check API key."
                        )
                # parse out values from daily
                if "daily" in doc:
                    parsed_data_total = []
                    # get the required values from daily.
                    for x in range(1, len(doc["daily"]) - 1):
                        data = doc["daily"][x]
                        parsed_data = {}
                        for k in PirateWeather_required_keys:
                            if k not in data:
                                self.raiseIOError(k)
                            elif k not in [
                                PirateWeather_wind_speed_key_name,
                                PirateWeather_temp_key_name,
                                PirateWeather_pressure_key_name,
                            ]:
                                if (
                                    data[k] < PirateWeatherValidators[k]["min"]
                                    or data[k] > PirateWeatherValidators[k]["max"]
                                ):
                                    self.validationError(
                                        k,
                                        data[k],
                                        PirateWeatherValidators[k]["min"],
                                        PirateWeatherValidators[k]["max"],
                                    )
                            elif k is PirateWeather_temp_key_name:
                                for kt in PirateWeather_required_key_temp:
                                    if kt not in data[PirateWeather_temp_key_name]:
                                        self.raiseIOError(kt)
                                    elif (
                                        data[PirateWeather_temp_key_name][kt]
                                        < PirateWeatherValidators["temp"]["min"]
                                        or data[PirateWeather_temp_key_name][kt]
                                        > PirateWeatherValidators["temp"]["max"]
                                    ):
                                        self.validationError(
                                            kt,
                                            data[PirateWeather_temp_key_name][kt],
                                            PirateWeatherValidators["temp"]["min"],
                                            PirateWeatherValidators["temp"]["max"],
                                        )
                            elif k is PirateWeather_wind_speed_key_name:
                                # PirateWeather reports wind speed at 10m height, so need to convert to 2m:
                                data[PirateWeather_wind_speed_key_name] = data[
                                    PirateWeather_wind_speed_key_name
                                ] * (4.87 / math.log((67.8 * 10) - 5.42))
                            elif k is PirateWeather_pressure_key_name:
                                # PirateWeather provides relative pressure, replace it with estimated absolute pressure returning!
                                data[PirateWeather_pressure_key_name] = (
                                    self.relative_to_absolute_pressure(
                                        data[PirateWeather_pressure_key_name],
                                        self.elevation,
                                    )
                                )
                        parsed_data[MAPPING_WINDSPEED] = data[
                            PirateWeather_wind_speed_key_name
                        ]

                        parsed_data[MAPPING_PRESSURE] = data[
                            PirateWeather_pressure_key_name
                        ]

                        parsed_data[MAPPING_HUMIDITY] = data[
                            PirateWeather_humidity_key_name
                        ]
                        parsed_data[MAPPING_TEMPERATURE] = data[
                            PirateWeather_temp_key_name
                        ]["day"]
                        # also put in min/max here
                        parsed_data[MAPPING_MAX_TEMP] = data[
                            PirateWeather_temp_key_name
                        ]["max"]
                        parsed_data[MAPPING_MIN_TEMP] = data[
                            PirateWeather_temp_key_name
                        ]["min"]
                        parsed_data[MAPPING_DEWPOINT] = data[
                            PirateWeather_dew_point_key_name
                        ]
                        # add precip from daily
                        # if rain or snow are missing from the PirateWeather data set them to 0
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
                        "Ignoring PirateWeather input: missing required key 'daily' in PirateWeather API return"
                    )
                return None
            except Exception as ex:
                _LOGGER.error("Error reading from PirateWeather: {0}".format(ex))
                return None
        else:
            # return cached_data
            _LOGGER.info("Returning cached PirateWeather forecastdata")
            return self._cached_forecast_data

    def relative_to_absolute_pressure(self, pressure, height):
        """Convert relative pressure to absolute pressure."""
        # Constants
        g = 9.80665  # m/s^2
        M = 0.0289644  # kg/mol
        R = 8.31447  # J/(mol*K)
        T0 = 288.15  # K

        # Calculate temperature at given height
        temperature = T0 - (g * M * float(height)) / (R * T0)
        # Calculate absolute pressure at given height
        absolute_pressure = pressure * (T0 / temperature) ** (g * M / (R * 287))
        return absolute_pressure

    def get_data(self):
        # TODO
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
                    "PirateWeatherClient get_data called API {} and received {}".format(
                        self.url, doc
                    )
                )
                if "cod" in doc:
                    if doc["cod"] != 200:
                        raise IOError(
                            "Cannot talk to PirateWeather API, check API key."
                        )
                # parse out values for currently and rain/snow from daily[0].
                if (
                    PirateWeather_current_weather_key_name in doc
                    and PirateWeather_daily_weather_key_name in doc
                ):
                    parsed_data = {}
                    # get the required values from currently and daily.
                    data = doc[PirateWeather_current_weather_key_name]
                    for k in PirateWeather_required_keys:
                        if k not in data:
                            self.raiseIOError(k)
                        elif k not in [
                            PirateWeather_wind_speed_key_name,
                            PirateWeather_pressure_key_name,
                        ]:
                            if (
                                data[k] < PirateWeatherValidators[k]["min"]
                                or data[k] > PirateWeatherValidators[k]["max"]
                            ):
                                self.validationError(
                                    k,
                                    data[k],
                                    PirateWeatherValidators[k]["min"],
                                    PirateWeatherValidators[k]["max"],
                                )
                        elif k is PirateWeather_wind_speed_key_name:
                            # PirateWeather reports wind speed at 10m height, so need to convert to 2m:
                            data[PirateWeather_wind_speed_key_name] = data[
                                PirateWeather_wind_speed_key_name
                            ] * (4.87 / math.log((67.8 * 10) - 5.42))
                        elif k is PirateWeather_pressure_key_name:
                            # PirateWeather provides relative pressure, replace it with estimated absolute pressure returning!
                            data[PirateWeather_pressure_key_name] = (
                                self.relative_to_absolute_pressure(
                                    data[PirateWeather_pressure_key_name],
                                    self.elevation,
                                )
                            )
                    parsed_data[MAPPING_WINDSPEED] = data[
                        PirateWeather_wind_speed_key_name
                    ]
                    parsed_data[MAPPING_PRESSURE] = data[
                        PirateWeather_pressure_key_name
                    ]
                    parsed_data[MAPPING_HUMIDITY] = data[
                        PirateWeather_humidity_key_name
                    ]
                    parsed_data[MAPPING_TEMPERATURE] = data[PirateWeather_temp_key_name]
                    parsed_data[MAPPING_DEWPOINT] = data[
                        PirateWeather_dew_point_key_name
                    ]

                    # add precip from daily
                    dailydata = doc[PirateWeather_daily_weather_key_name]["data"][0]
                    if dailydata is not None:
                        parsed_data[MAPPING_PRECIPITATION] = dailydata[
                            "precipAccumulation"
                        ]
                        _LOGGER.debug(
                            "PirateWeatherCLIENT daily precipitation: {}".format(
                                dailydata["precipAccumulation"]
                            )
                        )

                    else:
                        parsed_data[MAPPING_PRECIPITATION] = 0.0
                    _LOGGER.debug(
                        "PirateWeatherCLIENT daily precipitation: {}".format(
                            parsed_data[MAPPING_PRECIPITATION]
                        )
                    )

                    self._cached_data = parsed_data
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data
                else:
                    _LOGGER.warning(
                        f"Ignoring PirateWeather input: missing required key '{PirateWeather_current_weather_key_name}' and '{PirateWeather_daily_weather_key_name}' in PirateWeather API return"
                    )
                return None
            except Exception as ex:
                _LOGGER.warning(ex)
                raise ex
        else:
            # return cached_data
            _LOGGER.info("Returning cached PirateWeather data")
            return self._cached_data

    def raiseIOError(self, key):
        raise IOError("Missing required key {} in PirateWeather API return".format(key))

    def validationError(self, key, value, minval, maxval):
        raise ValueError(
            "Value {} is not valid for {}. Excepted range: {}-{}".format(
                value, key, minval, maxval
            )
        )


# for testing call: python PirateWeatherClient [api_key] [api_version] [latitude] [longitude] [elevation]
if __name__ == "__main__":
    args = sys.argv[1:]
    client = PirateWeatherClient(args[0], args[1], args[2], args[3], args[4])
    print(client.get_data())
