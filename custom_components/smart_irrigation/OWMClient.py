"""Client to talk to Open Weather Map API."""  # pylint: disable=invalid-name

import requests
import json
import logging
import math

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"

# Required OWM keys for validation
OWM_temp_key_name = "temp"
OWM_wind_speed_key_name = "wind_speed"
OWM_required_keys = {"wind_speed", "dew_point",OWM_temp_key_name,"humidity","pressure"}
OWM_required_key_temp = {"day","min","max"}

# Validators
OWM_validators = {
    "wind_speed":
        {"max": 135,
        "min":0},
    "dew_point":
        {"max":35,"min":0},
    "temp":
        {"max": 56.7, "min": -89.2},
    "humidity":
        {"max": 100,"min": 0},
    "pressure":
        {"max":1084.8, "min":870}
}

class OWMClient:  # pylint: disable=invalid-name
    """Open Weather Map Client."""

    def __init__(self, api_key, latitude, longitude):
        """Init."""
        self.api_key = api_key.strip()
        self.longitude = longitude
        self.latitude = latitude
        self.url = OWM_URL.format(latitude, longitude, api_key)

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
                        #check value
                        if k is not OWM_temp_key_name:
                            if data[k]<OWM_validators[k]["min"] or data[k]>OWM_validators[k]["max"]:
                                self.validationError(k,data[k],OWM_validators[k]["min"],OWM_validators[k]["max"])
                        if k == OWM_wind_speed_key_name:
                            #OWM reports wind speed at 10m height, so need to convert to 2m:
                            doc["daily"][0][OWM_wind_speed_key_name] = doc["daily"][0][OWM_wind_speed_key_name] * (4.87 / math.log((67.8 * 10) - 5.42))
                if OWM_temp_key_name in data:
                    for kt in OWM_required_key_temp:
                        if kt not in data[OWM_temp_key_name]:
                            self.raiseIOError(kt)
                        else:
                            #check value
                            if data[OWM_temp_key_name][kt]<OWM_validators["temp"]["min"] or data[OWM_temp_key_name][kt]>OWM_validators["temp"]["max"]:
                                self.validationError(kt,data[OWM_temp_key_name][kt],OWM_validators["temp"]["min"],OWM_validators["temp"]["max"])
            else:
                raise IOError("Missing required key 'daily' in OWM API return.")

            return doc
        except Exception as ex:
            raise ex

    def raiseIOError(self, key):
        raise IOError("Missing required key {0} in OWM API return".format(key))

    def validationError(self,key,value,minval,maxval):
        raise ValueError("Value {0} is not valid for {1}. Excepted range: {2}-{3}".format(value,key,minval,maxval))