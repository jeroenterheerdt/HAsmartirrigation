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
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
)

_LOGGER = logging.getLogger(__name__)

# KNMI EDR API URLs
KNMI_OBSERVATIONS_URL = "https://api.dataplatform.knmi.nl/edr/v1/collections/observations/position"
KNMI_FORECAST_URL = "https://api.dataplatform.knmi.nl/edr/v1/collections/harmonie_arome_cy43_p1/position"

RETRY_TIMES = 3

# Required KNMI parameter names for validation (based on KNMI parameter codes)
KNMI_wind_speed_key_name = "ff"  # Wind speed in m/s
KNMI_pressure_key_name = "pp"   # Atmospheric pressure in hPa
KNMI_humidity_key_name = "uu"   # Relative humidity in %
KNMI_temp_key_name = "ta"       # Air temperature in Celsius
KNMI_dew_point_key_name = "td"  # Dew point temperature in Celsius
KNMI_precip_key_name = "rr"     # Precipitation amount in mm
KNMI_precip_duration_key_name = "dr"  # Precipitation duration in minutes

# For forecast data
KNMI_max_temp_key_name = "tx"   # Maximum temperature
KNMI_min_temp_key_name = "tn"   # Minimum temperature
KNMI_forecast_precip_key_name = "tp"  # Total precipitation

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
    "ff": {"max": 50, "min": 0},      # Wind speed m/s
    "ta": {"max": 45, "min": -25},    # Temperature °C
    "td": {"max": 35, "min": -30},    # Dew point °C
    "uu": {"max": 100, "min": 0},     # Humidity %
    "pp": {"max": 1050, "min": 950},  # Pressure hPa
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
        self.api_version = api_version.strip()  # Not used by KNMI but kept for compatibility
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        
        # KNMI EDR API expects coords in specific format
        self.coords = f"POINT({self.longitude} {self.latitude})"
        
        # Set up headers for API authentication
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }
        
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
                # Get forecast data for next 7 days
                end_time = datetime.datetime.now() + datetime.timedelta(days=7)
                start_time = datetime.datetime.now() + datetime.timedelta(days=1)
                
                # Format times for KNMI API (ISO format)
                datetime_param = f"{start_time.isoformat()}/{end_time.isoformat()}"
                
                # Parameters we want from the forecast
                parameter_names = [
                    KNMI_max_temp_key_name,
                    KNMI_min_temp_key_name,
                    KNMI_wind_speed_key_name,
                    KNMI_pressure_key_name,
                    KNMI_humidity_key_name,
                    KNMI_dew_point_key_name,
                    KNMI_forecast_precip_key_name,
                ]
                
                params = {
                    "coords": self.coords,
                    "datetime": datetime_param,
                    "parameter-name": ",".join(parameter_names),
                    "f": "json",
                }
                
                for i in range(RETRY_TIMES):
                    req = requests.get(
                        KNMI_FORECAST_URL,
                        headers=self.headers,
                        params=params,
                        timeout=60
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
                    "KNMIClient get_forecast_data called API %s and received %s",
                    KNMI_FORECAST_URL,
                    doc,
                )
                
                # Parse KNMI EDR response
                if "ranges" in doc and doc["ranges"]:
                    parsed_data_total = []
                    
                    # Group data by day
                    daily_data = self._group_forecast_by_day(doc["ranges"])
                    
                    for day_data in daily_data:
                        if not day_data:  # Skip empty days
                            continue
                            
                        parsed_data = {}
                        
                        # Calculate daily averages and extremes
                        parsed_data[MAPPING_WINDSPEED] = self._convert_wind_speed_to_2m(
                            self._safe_average(day_data, KNMI_wind_speed_key_name)
                        )
                        
                        parsed_data[MAPPING_PRESSURE] = self.relative_to_absolute_pressure(
                            self._safe_average(day_data, KNMI_pressure_key_name),
                            self.elevation,
                        )
                        
                        parsed_data[MAPPING_HUMIDITY] = self._safe_average(day_data, KNMI_humidity_key_name)
                        
                        # Get min/max temperatures
                        max_temp = self._safe_max(day_data, KNMI_max_temp_key_name)
                        min_temp = self._safe_min(day_data, KNMI_min_temp_key_name)
                        
                        parsed_data[MAPPING_MAX_TEMP] = max_temp
                        parsed_data[MAPPING_MIN_TEMP] = min_temp
                        parsed_data[MAPPING_TEMPERATURE] = (max_temp + min_temp) / 2.0
                        
                        parsed_data[MAPPING_DEWPOINT] = self._safe_average(day_data, KNMI_dew_point_key_name)
                        
                        # Sum precipitation for the day
                        parsed_data[MAPPING_PRECIPITATION] = self._safe_sum(day_data, KNMI_forecast_precip_key_name)
                        
                        parsed_data_total.append(parsed_data)
                    
                    self._cached_forecast_data = parsed_data_total
                    self._last_time_called = datetime.datetime.now()
                    return parsed_data_total
                    
                _LOGGER.warning(
                    "Ignoring KNMI input: missing or empty 'ranges' in KNMI API return"
                )
                return None
                
            except requests.RequestException as ex:
                _LOGGER.error("Error reading from KNMI: %s", ex)
                return None
            except json.JSONDecodeError as ex:
                _LOGGER.error("Error decoding KNMI API response: %s", ex)
                return None
            except Exception as ex:
                _LOGGER.error("Unexpected error in KNMI forecast: %s", ex)
                return None
        else:
            # return cached_data
            _LOGGER.info("Returning cached KNMI forecastdata")
            return self._cached_forecast_data

    def get_data(self):
        """Validate and return current weather data."""
        if (
            self._cached_data is None
            or self.override_cache
            or datetime.datetime.now()
            >= self._last_time_called + datetime.timedelta(seconds=self.cache_seconds)
        ):
            try:
                # Get current observations (last hour)
                end_time = datetime.datetime.now()
                start_time = end_time - datetime.timedelta(hours=1)
                
                # Format times for KNMI API
                datetime_param = f"{start_time.isoformat()}/{end_time.isoformat()}"
                
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
                    "f": "json",
                }
                
                for i in range(RETRY_TIMES):
                    req = requests.get(
                        KNMI_OBSERVATIONS_URL,
                        headers=self.headers,
                        params=params,
                        timeout=60
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
                        _LOGGER.warning("No recent observation data available from KNMI")
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
                    precip_mm = latest_data.get(KNMI_precip_key_name, 0.0)
                    precip_duration_min = latest_data.get(KNMI_precip_duration_key_name, 0.0)
                    
                    if precip_duration_min > 0:
                        # Convert to mm/h
                        parsed_data[MAPPING_CURRENT_PRECIPITATION] = (precip_mm * 60) / precip_duration_min
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
                    dt = datetime.datetime.fromisoformat(time_str.replace("Z", "+00:00"))
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
        """Get the most recent observation from the ranges data."""
        latest_time = None
        latest_data = {}
        
        for param_name, param_data in ranges_data.items():
            if "values" not in param_data:
                continue
                
            for time_str, value in param_data["values"].items():
                try:
                    dt = datetime.datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                    
                    if latest_time is None or dt > latest_time:
                        latest_time = dt
                        latest_data = {param_name: value}
                    elif dt == latest_time:
                        latest_data[param_name] = value
                        
                except (ValueError, AttributeError) as ex:
                    _LOGGER.debug("Could not parse time '%s': %s", time_str, ex)
                    continue
        
        return latest_data

    def _get_daily_precipitation(self):
        """Get daily precipitation sum from last 24 hours."""
        try:
            # Get precipitation data for last 24 hours
            end_time = datetime.datetime.now()
            start_time = end_time - datetime.timedelta(hours=24)
            
            datetime_param = f"{start_time.isoformat()}/{end_time.isoformat()}"
            
            params = {
                "coords": self.coords,
                "datetime": datetime_param,
                "parameter-name": KNMI_precip_key_name,
                "f": "json",
            }
            
            req = requests.get(
                KNMI_OBSERVATIONS_URL,
                headers=self.headers,
                params=params,
                timeout=30
            )
            
            if req.status_code == 200:
                doc = json.loads(req.text)
                if "ranges" in doc and KNMI_precip_key_name in doc["ranges"]:
                    values = doc["ranges"][KNMI_precip_key_name].get("values", {})
                    total_precip = sum(v for v in values.values() if v is not None)
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
