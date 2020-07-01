"""Client to talk to Open Weather Map API."""  # pylint: disable=invalid-name

import requests
import json
import logging

_LOGGER = logging.getLogger(__name__)

# Open Weather Map URL
OWM_URL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat={}&lon={}&appid={}"


class OWMClient:  # pylint: disable=invalid-name
    """Open Weather Map Client."""

    def __init__(self, api_key, latitude, longitude):
        """Init."""
        self.api_key = api_key.strip()
        self.longitude = longitude
        self.latitude = latitude
        self.url = OWM_URL.format(latitude, longitude, api_key)

    def get_data(self):
        """Return data."""
        try:
            req = requests.get(self.url)
            doc = json.loads(req.text)
            if "cod" in doc:
                if doc["cod"] != 200:
                    ex = IOError()
                    ex.strerror = "Cannot talk to OWM API, check API key."
                    raise ex
                return doc
            return doc
        except Exception as ex:
            _LOGGER.error(
                "Failed to get OWM URL {}".format(  # pylint: disable=logging-format-interpolation
                    req.text
                )
            )
            raise ex
