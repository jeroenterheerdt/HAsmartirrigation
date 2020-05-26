import requests
import json
import logging

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"


class OWMClient:
    """Open Weather Map Client"""

    def __init__(self, api_key, latitude, longitude):
        """Init."""
        self.api_key = api_key.strip()
        self.longitude = longitude
        self.latitude = latitude
        self.url = OWM_URL.format(latitude, longitude, api_key)

    def get_data(self):
        """Return data."""
        try:
            r = requests.get(self.url)
            d = json.loads(r.text)
            if "cod" in d:
                if d["cod"] != 200:
                    ex = IOError()
                    ex.strerror = "Cannot talk to OWM API, check API key."
                    raise ex
                else:
                    return d
            else:
                return d
        except Exception as Ex:
            _LOGGER.error("Failed to get OWM URL {}".format(r.text))
            _LOGGER.error(Ex.strerror)
            raise Ex
