"""Client to talk to KNMI Data Platform API."""  # pylint: disable=invalid-name

import datetime
import json
import logging
import math
import sys

import requests

# DO NOT USE THESE FOR TESTING, INSTEAD DEFINE THE CONSTS IN THIS FILE
from ..const import (  # noqa: TID252
    MAPPING_CURRENT_PRECIPITATION,
    MAPPING_DEWPOINT,
    MAPPING_HUMIDITY,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)

_LOGGER = logging.getLogger(__name__)

# KNMI EDR API URLs
KNMI_OBSERVATIONS_URL = (
    "https://api.dataplatform.knmi.nl/edr/v1/collections/observations/position"
)
KNMI_LOCATIONS_URL = (
    "https://api.dataplatform.knmi.nl/edr/v1/collections/observations/locations"
)
KNMI_FORECAST_URL = "https://api.dataplatform.knmi.nl/edr/v1/collections/harmonie_arome_cy43_p1/position"

RETRY_TIMES = 3

# Required KNMI parameter names for validation (based on KNMI parameter codes)
KNMI_wind_speed_key_name = "ff_10m_10"  # Wind speed in m/s
KNMI_pressure_key_name = "p_nap_msl_10"  # Atmospheric pressure in hPa
KNMI_humidity_key_name = "u_10"  # Relative humidity in %
KNMI_temp_key_name = "t_dryb_10"  # Air temperature in Celsius
KNMI_dew_point_key_name = "t_dewp_10"  # Dew point temperature in Celsius
KNMI_precip_key_name = "ri_regenm_10"  # Precipitation intensity in mm/h (10-minute average)
KNMI_precip_duration_key_name = "dr_regenm_10"  # Precipitation duration in seconds (within 10-minute period)

# For forecast data - using gridded collections
KNMI_max_temp_key_name = "tx_dryb_10"  # Maximum temperature
KNMI_min_temp_key_name = "tn_dryb_10"  # Minimum temperature
KNMI_forecast_precip_key_name = "ri_regenm_10"  # Precipitation intensity

KNMI_required_keys = {
    KNMI_wind_speed_key_name,
    KNMI_pressure_key_name,
    KNMI_humidity_key_name,
    KNMI_temp_key_name,
    KNMI_dew_point_key_name,
}

KNMI_required_keys_daily = {
    KNMI_wind_speed_key_name,
    KNMI_pressure_key_name,
    KNMI_humidity_key_name,
    KNMI_max_temp_key_name,
    KNMI_min_temp_key_name,
    KNMI_dew_point_key_name,
    KNMI_forecast_precip_key_name,
}

# Validators (based on typical Dutch weather ranges)
KNMIValidators = {
    "ff_10m_10": {"max": 50, "min": 0},  # Wind speed m/s
    "t_dryb_10": {"max": 45, "min": -25},  # Temperature °C
    "t_dewp_10": {"max": 35, "min": -30},  # Dew point °C
    "u_10": {"max": 100, "min": 0},  # Humidity %
    "p_nap_msl_10": {"max": 1050, "min": 950},  # Pressure hPa
}


class KNMIClient:  # pylint: disable=invalid-name
    """KNMI Data Platform Client."""

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
        self.api_version = (
            api_version.strip() if api_version is not None else "1.0"
        )  # Not used by KNMI but kept for compatibility
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation

        # Set up headers for API authentication
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

        # Initialize cache variables
        self.cache_seconds = cache_seconds
        self.override_cache = override_cache
        # disabling cache for now
        self.override_cache = True
        self._last_time_called = datetime.datetime(1900, 1, 1, 0, 0, 0)
        self._cached_data = None
        self._cached_forecast_data = None
        self._weather_stations = None  # Cache for weather stations
        
        # Defer nearest station lookup until first API call to avoid blocking HTTP requests during init
        self.nearest_station = None
        self._station_initialized = False
        self.coords = None  # Will be set when station is found

    def get_forecast_data(self):
        """Return forecast data.

        Note: KNMI doesn't provide real-time forecast API similar to other weather services.
        This method returns None to indicate no forecast data is available.
        Smart Irrigation will fall back to current observations for calculations.
        """
        _LOGGER.warning(
            "KNMI forecast data not available. Smart Irrigation will use current observations only."
        )
        return None

    def _ensure_station_initialized(self):
        """Ensure nearest weather station is found and coordinates are set."""
        if not self._station_initialized:
            # Find nearest weather station and use its coordinates
            self.nearest_station = self._find_nearest_station(self.latitude, self.longitude)
            if self.nearest_station:
                _LOGGER.info(
                    "Using KNMI weather station '%s' (ID: %s) at [%.4f, %.4f] for location [%.4f, %.4f]",
                    self.nearest_station["name"],
                    self.nearest_station["id"],
                    self.nearest_station["longitude"],
                    self.nearest_station["latitude"],
                    self.longitude,
                    self.latitude,
                )
                # Use station coordinates for API calls
                self.coords = f"POINT({self.nearest_station['longitude']} {self.nearest_station['latitude']})"
            else:
                _LOGGER.warning(
                    "No KNMI weather station found near [%.4f, %.4f], using original coordinates",
                    self.longitude,
                    self.latitude,
                )
                # KNMI EDR API expects coords in specific format
                self.coords = f"POINT({self.longitude} {self.latitude})"
            
            self._station_initialized = True

    def get_data(self):
        """Validate and return current weather data."""
        # Ensure station is initialized before making API calls
        self._ensure_station_initialized()
        
        if (
            self._cached_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                # Get current observations (with delay for processing)
                end_time = datetime.datetime.now() - datetime.timedelta(
                    hours=2
                )  # 2 hours ago to account for processing delay
                start_time = end_time - datetime.timedelta(hours=1)  # 1 hour window

                # Format times for KNMI API
                datetime_param = f"{start_time.isoformat()}Z/{end_time.isoformat()}Z"

                # Parameters we want from observations
                parameter_names = [
                    KNMI_temp_key_name,
                    KNMI_wind_speed_key_name,
                    KNMI_pressure_key_name,
                    KNMI_humidity_key_name,
                    KNMI_dew_point_key_name,
                    KNMI_precip_key_name,
                    KNMI_precip_duration_key_name,
                ]

                params = {
                    "coords": self.coords,
                    "datetime": datetime_param,
                    "parameter-name": ",".join(parameter_names),
                    "f": "CoverageJSON",
                }

                for i in range(RETRY_TIMES):
                    req = requests.get(
                        KNMI_OBSERVATIONS_URL,
                        headers=self.headers,
                        params=params,
                        timeout=60,
                    )
                    if req.status_code == 200:
                        break
                    i = i + 1

                if req.status_code != 200:
                    _LOGGER.error(
                        "KNMI API returned error status code: %s - %s",
                        req.status_code,
                        req.text,
                    )
                    return None

                doc = json.loads(req.text)
                _LOGGER.debug(
                    "KNMIClient get_data called API %s and received %s",
                    KNMI_OBSERVATIONS_URL,
                    doc,
                )

                # Parse KNMI EDR response
                if "ranges" in doc and doc["ranges"]:
                    parsed_data = {}

                    # Get the most recent data point
                    latest_data = self._get_latest_observation(doc["ranges"])

                    if not latest_data:
                        _LOGGER.warning(
                            "No recent observation data available from KNMI"
                        )
                        return None

                    # Validate required keys and extract data
                    for k in KNMI_required_keys:
                        if k not in latest_data:
                            self.raiseIOError(k)
                        elif k in KNMIValidators:
                            value = latest_data[k]
                            if (
                                value < KNMIValidators[k]["min"]
                                or value > KNMIValidators[k]["max"]
                            ):
                                self.validationError(
                                    k,
                                    value,
                                    KNMIValidators[k]["min"],
                                    KNMIValidators[k]["max"],
                                )

                    # Convert and store the data
                    parsed_data[MAPPING_WINDSPEED] = self._convert_wind_speed_to_2m(
                        latest_data[KNMI_wind_speed_key_name]
                    )

                    parsed_data[MAPPING_PRESSURE] = self.relative_to_absolute_pressure(
                        latest_data[KNMI_pressure_key_name],
                        self.elevation,
                    )

                    parsed_data[MAPPING_HUMIDITY] = latest_data[KNMI_humidity_key_name]
                    parsed_data[MAPPING_TEMPERATURE] = latest_data[KNMI_temp_key_name]
                    parsed_data[MAPPING_DEWPOINT] = latest_data[KNMI_dew_point_key_name]

                    # Calculate current precipitation intensity (mm/h)
                    # KNMI provides ri_regenm_10 as precipitation intensity in mm/h
                    # and dr_regenm_10 as duration of precipitation in seconds within the 10-min period
                    precip_intensity_mm_h = latest_data.get(KNMI_precip_key_name, 0.0)
                    precip_duration_sec = latest_data.get(KNMI_precip_duration_key_name, 0.0)

                    # Use the intensity directly as it's already in mm/h
                    # Only report precipitation if there was actual precipitation duration
                    if precip_duration_sec > 0 and precip_intensity_mm_h > 0:
                        parsed_data[MAPPING_CURRENT_PRECIPITATION] = precip_intensity_mm_h
                    else:
                        parsed_data[MAPPING_CURRENT_PRECIPITATION] = 0.0

                    # Daily precipitation - get sum from last 24 hours
                    parsed_data[MAPPING_PRECIPITATION] = self._get_daily_precipitation()

                    _LOGGER.debug(
                        "KNMIClient daily precipitation: %s",
                        parsed_data[MAPPING_PRECIPITATION],
                    )

                    self._cached_data = parsed_data
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data

                _LOGGER.warning(
                    "Ignoring KNMI input: missing or empty 'ranges' in KNMI API return"
                )
                return None

            except Exception as ex:
                _LOGGER.warning("Error in KNMI get_data: %s", ex)
                raise
        else:
            # return cached_data
            _LOGGER.info("Returning cached KNMI data")
            return self._cached_data

    def _convert_wind_speed_to_2m(self, wind_speed_10m):
        """Convert wind speed from 10m height to 2m height using logarithmic profile."""
        if wind_speed_10m is None:
            return 0.0
        # KNMI reports wind speed at 10m height, convert to 2m using same formula as other clients
        return wind_speed_10m * (4.87 / math.log((67.8 * 10) - 5.42))

    def relative_to_absolute_pressure(self, pressure, height):
        """Convert relative pressure to absolute pressure."""
        if pressure is None:
            return None
        # Constants
        g = 9.80665  # m/s^2
        M = 0.0289644  # kg/mol
        R = 8.31447  # J/(mol*K)
        T0 = 288.15  # K

        # Calculate temperature at given height
        temperature = T0 - (g * M * float(height)) / (R * T0)
        # Calculate absolute pressure at given height
        return pressure * (T0 / temperature) ** (g * M / (R * 287))

    def _group_forecast_by_day(self, ranges_data):
        """Group forecast data by day."""
        daily_groups = {}

        for param_name, param_data in ranges_data.items():
            if "values" not in param_data:
                continue

            for time_str, value in param_data["values"].items():
                # Parse the time and group by date
                try:
                    dt = datetime.datetime.fromisoformat(
                        time_str.replace("Z", "+00:00")
                    )
                    date_key = dt.date()

                    if date_key not in daily_groups:
                        daily_groups[date_key] = {}

                    if param_name not in daily_groups[date_key]:
                        daily_groups[date_key][param_name] = []

                    daily_groups[date_key][param_name].append(value)

                except (ValueError, AttributeError) as ex:
                    _LOGGER.debug("Could not parse time '%s': %s", time_str, ex)
                    continue

        # Convert to list sorted by date
        return [daily_groups[date] for date in sorted(daily_groups.keys())]

    def _get_latest_observation(self, ranges_data):
        """Get the most recent observation from the CoverageJSON ranges data."""
        latest_data = {}

        # For CoverageJSON format, values are arrays corresponding to time axis
        for param_name, param_data in ranges_data.items():
            if "values" not in param_data:
                continue

            values = param_data["values"]
            if values and len(values) > 0:
                # Get the last (most recent) value
                latest_data[param_name] = values[-1]

        return latest_data

    def _get_daily_precipitation(self):
        """Get daily precipitation sum from last 24 hours."""
        # Ensure station is initialized before making API calls
        self._ensure_station_initialized()
        
        try:
            # Get precipitation data for last 24 hours
            end_time = datetime.datetime.now() - datetime.timedelta(
                hours=3
            )  # 3 hours ago to account for processing delay
            start_time = end_time - datetime.timedelta(hours=24)

            datetime_param = f"{start_time.isoformat()}Z/{end_time.isoformat()}Z"

            params = {
                "coords": self.coords,
                "datetime": datetime_param,
                "parameter-name": KNMI_precip_key_name,
                "f": "CoverageJSON",
            }

            req = requests.get(
                KNMI_OBSERVATIONS_URL, headers=self.headers, params=params, timeout=30
            )

            if req.status_code == 200:
                doc = json.loads(req.text)
                if "ranges" in doc and KNMI_precip_key_name in doc["ranges"]:
                    values = doc["ranges"][KNMI_precip_key_name].get("values", [])
                    # KNMI provides precipitation intensity in mm/h for 10-minute periods
                    # Convert each 10-minute intensity reading to actual precipitation amount
                    # intensity (mm/h) * (10 minutes / 60 minutes) = mm in that 10-minute period
                    total_precip = sum(v * (10 / 60) for v in values if v is not None and v > 0)
                    return total_precip

        except Exception as ex:
            _LOGGER.debug("Could not get daily precipitation: %s", ex)

        return 0.0

    def _safe_average(self, data_dict, key):
        """Safely calculate average of values for a key."""
        if key not in data_dict or not data_dict[key]:
            return 0.0
        values = [v for v in data_dict[key] if v is not None]
        return sum(values) / len(values) if values else 0.0

    def _safe_max(self, data_dict, key):
        """Safely get maximum value for a key."""
        if key not in data_dict or not data_dict[key]:
            return 0.0
        values = [v for v in data_dict[key] if v is not None]
        return max(values) if values else 0.0

    def _safe_min(self, data_dict, key):
        """Safely get minimum value for a key."""
        if key not in data_dict or not data_dict[key]:
            return 0.0
        values = [v for v in data_dict[key] if v is not None]
        return min(values) if values else 0.0

    def _safe_sum(self, data_dict, key):
        """Safely sum values for a key."""
        if key not in data_dict or not data_dict[key]:
            return 0.0
        values = [v for v in data_dict[key] if v is not None]
        return sum(values) if values else 0.0

    def _find_nearest_station(self, lat, lon):
        """Find the nearest KNMI weather station to given coordinates."""
        try:
            stations = self._get_weather_stations()
            if not stations:
                return None

            min_distance = float("inf")
            nearest_station = None

            for station in stations:
                station_lat = station["latitude"]
                station_lon = station["longitude"]

                # Calculate distance using Haversine formula
                distance = self._calculate_distance(lat, lon, station_lat, station_lon)

                if distance < min_distance:
                    min_distance = distance
                    nearest_station = station

            if nearest_station:
                _LOGGER.debug(
                    "Nearest KNMI station: %s (%.2f km away)",
                    nearest_station["name"],
                    min_distance,
                )

            return nearest_station

        except Exception as ex:
            _LOGGER.warning("Could not find nearest KNMI weather station: %s", ex)
            return None

    def _get_weather_stations(self):
        """Get list of all KNMI weather stations."""
        if self._weather_stations is not None:
            return self._weather_stations

        try:
            req = requests.get(
                KNMI_LOCATIONS_URL,
                headers=self.headers,
                timeout=30,
            )

            if req.status_code == 200:
                data = json.loads(req.text)
                stations = []

                for feature in data.get("features", []):
                    if feature.get("type") == "Feature":
                        coords = feature.get("geometry", {}).get("coordinates", [])
                        properties = feature.get("properties", {})

                        if len(coords) >= 2:
                            station = {
                                "id": feature.get("id"),
                                "name": properties.get("name", "Unknown"),
                                "longitude": coords[0],
                                "latitude": coords[1],
                                "elevation": coords[2] if len(coords) > 2 else 0,
                            }
                            stations.append(station)

                self._weather_stations = stations
                _LOGGER.debug("Loaded %d KNMI weather stations", len(stations))
                return stations
            else:
                _LOGGER.error("Failed to get KNMI weather stations: %s", req.status_code)
                return []

        except Exception as ex:
            _LOGGER.warning("Error getting KNMI weather stations: %s", ex)
            return []

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula (in km)."""
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        # Earth's radius in kilometers
        earth_radius = 6371.0

        return earth_radius * c

    def raiseIOError(self, key):
        """Raise an OSError when a required key is missing in the KNMI API return."""
        raise OSError(f"Missing required key {key} in KNMI API return")

    def validationError(self, key, value, minval, maxval):
        """Raise a ValueError if a value is outside the expected range for a key."""
        raise ValueError(
            f"Value {value} is not valid for {key}. Expected range: {minval}-{maxval}"
        )


# for testing call: python KNMIClient [api_key] [api_version] [latitude] [longitude] [elevation]
if __name__ == "__main__":
    args = sys.argv[1:]
    client = KNMIClient(args[0], args[1], args[2], args[3], args[4])
    print(client.get_data())  # noqa: T201
    print(client.get_forecast_data())  # noqa: T201
