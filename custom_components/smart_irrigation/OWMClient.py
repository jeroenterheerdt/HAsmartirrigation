"""Client to talk to Open Weather Map API."""  # pylint: disable=invalid-name

import requests
import json
import logging
import math

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
OWM_URL = (
    "https://api.openweathermap.org/data/{}/onecall?units={}&lat={}&lon={}&appid={}"
)

# Required OWM keys for validation
OWM_temp_key_name = "temp"
OWM_wind_speed_key_name = "wind_speed"
OWM_required_keys = {
    "wind_speed",
    "dew_point",
    OWM_temp_key_name,
    "humidity",
    "pressure",
}
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

    def __init__(self,api_key, api_version, latitude, longitude):
        """Init."""
        self.api_key = api_key.strip().replace(" ","")
        self.api_version = api_version.strip()
        self.longitude = longitude
        self.latitude = latitude
        self.url = OWM_URL.format(api_version, "metric", latitude, longitude, api_key)

    def get_data(self):
        """Validate and return data."""
        try:
            req = requests.get(self.url)
            doc = json.loads(req.text)
            if "cod" in doc:
                if doc["cod"] != 200:
                    raise IOError("Cannot talk to OWM API, check API key.")
            if "daily" in doc:
                data = doc["daily"][0]
                for k in OWM_required_keys:
                    if k not in data:
                        self.raiseIOError(k)
                    else:
                        # check value
                        if k is not OWM_temp_key_name:
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
                        if k == OWM_wind_speed_key_name:
                            # OWM reports wind speed at 10m height, so need to convert to 2m:
                            doc["daily"][0][OWM_wind_speed_key_name] = doc["daily"][0][
                                OWM_wind_speed_key_name
                            ] * (4.87 / math.log((67.8 * 10) - 5.42))
                if OWM_temp_key_name in data:
                    for kt in OWM_required_key_temp:
                        if kt not in data[OWM_temp_key_name]:
                            self.raiseIOError(kt)
                        else:
                            # check value
                            if (
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
            else:
                _LOGGER.warning(
                    "Ignoring OWM input: missing required key 'daily' in OWM API return"
                )
                return None
            return doc
        except Exception as ex:
            _LOGGER.warning(ex)
            raise ex

    def raiseIOError(self, key):
        raise IOError("Missing required key {0} in OWM API return".format(key))

    def validationError(self, key, value, minval, maxval):
        raise ValueError(
            "Value {0} is not valid for {1}. Excepted range: {2}-{3}".format(
                value, key, minval, maxval
            )
        )

    def get_precipitation(self,data):
        """Parse out precipitation info from OWM data."""
        if data is not None:
            # if rain or snow are missing from the OWM data set them to 0
            if "rain" in data:
                self.rain = float(data["rain"])
            else:
                self.rain = 0
            if "snow" in data:
                self.snow = float(data["snow"])
            else:
                self.snow = 0
            #_LOGGER.info(
            #    "rain: {}, snow: {}".format(  # pylint: disable=logging-format-interpolation
            #        self.rain, self.snow
            #    )
            #)
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