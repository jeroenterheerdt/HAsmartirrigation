"""The Smart Irrigation integration."""
import asyncio
from datetime import timedelta
import logging
import datetime
import weakref

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
import homeassistant.util.dt as dt
from homeassistant.helpers.event import (
    async_track_time_change,
    async_track_point_in_time,
)

from homeassistant.const import (
    CONF_LATITUDE,
    CONF_ELEVATION,
    CONF_LONGITUDE,
)

from .OWMClient import OWMClient
from .const import (
    CONF_API_KEY,
    CONF_REFERENCE_ET,
    CONF_NUMBER_OF_SPRINKLERS,
    CONF_FLOW,
    CONF_AREA,
    DOMAIN,
    STARTUP_MESSAGE,
    SETTING_METRIC,
    SETTING_US,
    MM_TO_INCH_FACTOR,
    LITER_TO_GALLON_FACTOR,
    M2_TO_SQ_FT_FACTOR,
    CONF_BUCKET,
    EVENT_BUCKET_UPDATED,
    SERVICE_RESET_BUCKET,
    SERVICE_SET_BUCKET,
    SERVICE_CALCULATE_DAILY_ADJUSTED_RUN_TIME,
    SERVICE_CALCULATE_HOURLY_ADJUSTED_RUN_TIME,
    CONF_LEAD_TIME,
    CONF_MAXIMUM_DURATION,
    CONF_FORCE_MODE_DURATION,
    CONF_SHOW_UNITS,
    CONF_AUTO_REFRESH,
    CONF_AUTO_REFRESH_TIME,
    EVENT_HOURLY_DATA_UPDATED,
    CONF_SENSORS,
    SERVICE_ENABLE_FORCE_MODE,
    SERVICE_DISABLE_FORCE_MODE,
    EVENT_FORCE_MODE_TOGGLED,
    CONF_CHANGE_PERCENT,
    DEFAULT_LEAD_TIME,
    DEFAULT_MAXIMUM_DURATION,
    DEFAULT_FORCE_MODE_DURATION,
    DEFAULT_SHOW_UNITS,
    DEFAULT_AUTO_REFRESH,
    DEFAULT_AUTO_REFRESH_TIME,
    DEFAULT_CHANGE_PERCENT,
    CONF_INITIAL_UPDATE_DELAY,
    DEFAULT_INITIAL_UPDATE_DELAY,
    CONF_COASTAL,
    DEFAULT_COASTAL,
    CONF_ESTIMATE_SOLRAD_FROM_TEMP,
    DEFAULT_ESTIMATE_SOLRAD_FROM_TEMP,
    CONF_SENSOR_PRECIPITATION,
    CONF_SENSOR_ET,
    CONF_SWITCH_CALCULATE_ET,
)

from .helpers import average_of_list, last_of_list


_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(minutes=58)
# SCAN_INTERVAL = timedelta(minutes=5)

PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up this integration using YAML is not supported."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up this integration using UI."""
    if hass.data.get(DOMAIN) is None:
        hass.data.setdefault(DOMAIN, {})
        _LOGGER.info(STARTUP_MESSAGE)
    api_key = entry.data.get(CONF_API_KEY)
    area = entry.data.get(CONF_AREA)
    flow = entry.data.get(CONF_FLOW)
    number_of_sprinklers = entry.data.get(CONF_NUMBER_OF_SPRINKLERS)
    reference_et = entry.data.get(CONF_REFERENCE_ET)
    reference_et = [float(x) for x in reference_et]
    sensors = entry.data.get(CONF_SENSORS)
    _LOGGER.info("{} sensors: {}".format(entry.title, sensors))
    # convert values to internal metric representation if required.
    # depending on this we need to convert to metric internally or not

    system_of_measurement = (
        SETTING_METRIC if hass.config.units.is_metric else SETTING_US
    )
    # unit conversion
    if system_of_measurement == SETTING_US:
        flow = flow / LITER_TO_GALLON_FACTOR
        area = area / M2_TO_SQ_FT_FACTOR
        reference_et = [x / MM_TO_INCH_FACTOR for x in reference_et]

    peak_et = max(reference_et)
    throughput = number_of_sprinklers * flow
    precipitation_rate = (throughput * 60) / area
    base_schedule_index = (peak_et / precipitation_rate * 60) * 60  # in seconds
    latitude = hass.config.as_dict().get(CONF_LATITUDE)
    longitude = hass.config.as_dict().get(CONF_LONGITUDE)
    elevation = hass.config.as_dict().get(CONF_ELEVATION)

    name = entry.title
    name = name.replace(" ", "_")

    # handle options: lead time, change_percent, max duration, force_mode_duration, show units, auto refresh, auto refresh time
    lead_time = entry.options.get(CONF_LEAD_TIME, DEFAULT_LEAD_TIME)
    change_percent = entry.options.get(CONF_CHANGE_PERCENT, DEFAULT_CHANGE_PERCENT)
    maximum_duration = entry.options.get(
        CONF_MAXIMUM_DURATION, DEFAULT_MAXIMUM_DURATION
    )
    force_mode_duration = entry.options.get(
        CONF_FORCE_MODE_DURATION, DEFAULT_FORCE_MODE_DURATION
    )
    show_units = entry.options.get(CONF_SHOW_UNITS, DEFAULT_SHOW_UNITS)
    auto_refresh = entry.options.get(CONF_AUTO_REFRESH, DEFAULT_AUTO_REFRESH)
    auto_refresh_time = entry.options.get(
        CONF_AUTO_REFRESH_TIME, DEFAULT_AUTO_REFRESH_TIME
    )
    initial_update_delay = entry.options.get(
        CONF_INITIAL_UPDATE_DELAY, DEFAULT_INITIAL_UPDATE_DELAY
    )
    coastal = entry.options.get(CONF_COASTAL, DEFAULT_COASTAL)
    estimate_solrad_from_temp = entry.options.get(
        CONF_ESTIMATE_SOLRAD_FROM_TEMP, DEFAULT_ESTIMATE_SOLRAD_FROM_TEMP
    )

    # set up coordinator
    coordinator = SmartIrrigationUpdateCoordinator(
        hass,
        api_key=api_key,
        longitude=longitude,
        latitude=latitude,
        elevation=elevation,
        system_of_measurement=system_of_measurement,
        area=area,
        flow=flow,
        number_of_sprinklers=number_of_sprinklers,
        reference_et=reference_et,
        peak_et=peak_et,
        throughput=throughput,
        precipitation_rate=precipitation_rate,
        base_schedule_index=base_schedule_index,
        lead_time=lead_time,
        maximum_duration=maximum_duration,
        force_mode_duration=force_mode_duration,
        show_units=show_units,
        auto_refresh=auto_refresh,
        auto_refresh_time=auto_refresh_time,
        sensors=sensors,
        change_percent=change_percent,
        initial_update_delay=initial_update_delay,
        coastal=coastal,
        estimate_solrad_from_temp=estimate_solrad_from_temp,
        name=name,
    )

    await coordinator.async_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data[DOMAIN][entry.entry_id] = coordinator

    for platform in PLATFORMS:
        coordinator.platforms.append(platform)
        hass.async_add_job(
            hass.config_entries.async_forward_entry_setup(entry, platform)
        )

    # add update listener if not already added.
    if weakref.ref(async_reload_entry) not in entry.update_listeners:
        entry.add_update_listener(async_reload_entry)

    # register the services
    hass.services.async_register(
        DOMAIN, f"{name}_{SERVICE_RESET_BUCKET}", coordinator.handle_reset_bucket,
    )
    hass.services.async_register(
        DOMAIN, f"{name}_{SERVICE_SET_BUCKET}", coordinator.handle_set_bucket,
    )
    hass.services.async_register(
        DOMAIN,
        f"{name}_{SERVICE_CALCULATE_HOURLY_ADJUSTED_RUN_TIME}",
        coordinator.handle_calculate_hourly_adjusted_run_time,
    )
    hass.services.async_register(
        DOMAIN,
        f"{name}_{SERVICE_CALCULATE_DAILY_ADJUSTED_RUN_TIME}",
        coordinator.handle_calculate_daily_adjusted_run_time,
    )
    hass.services.async_register(
        DOMAIN,
        f"{name}_{SERVICE_ENABLE_FORCE_MODE}",
        coordinator.handle_enable_force_mode,
    )
    hass.services.async_register(
        DOMAIN,
        f"{name}_{SERVICE_DISABLE_FORCE_MODE}",
        coordinator.handle_disable_force_mode,
    )
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Reload config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    if coordinator.entry_setup_completed:
        await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Handle removal of an entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    unloaded = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, platform)
                for platform in PLATFORMS
                if platform in coordinator.platforms
            ]
        )
    )
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unloaded


class SmartIrrigationUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API and storing settings."""

    def __init__(
        self,
        hass,
        api_key,
        longitude,
        latitude,
        elevation,
        system_of_measurement,
        area,
        flow,
        number_of_sprinklers,
        reference_et,
        peak_et,
        throughput,
        precipitation_rate,
        base_schedule_index,
        lead_time,
        maximum_duration,
        force_mode_duration,
        show_units,
        auto_refresh,
        auto_refresh_time,
        sensors,
        change_percent,
        initial_update_delay,
        coastal,
        estimate_solrad_from_temp,
        name,
    ):
        """Initialize."""
        if api_key:
            self.api = OWMClient(
                api_key=api_key, longitude=longitude, latitude=latitude
            )
        else:
            self.api = None
        self.longitude = longitude
        self.latitude = latitude
        self.elevation = elevation
        self.system_of_measurement = system_of_measurement
        self.area = area
        self.flow = flow
        self.number_of_sprinklers = number_of_sprinklers
        self.reference_et = reference_et
        self.peak_et = peak_et
        self.throughput = throughput
        self.precipitation_rate = precipitation_rate
        self.base_schedule_index = base_schedule_index
        self.lead_time = lead_time
        self.change_percent = float(change_percent)
        self.maximum_duration = maximum_duration
        self.force_mode_duration = force_mode_duration
        # initialize force mode as Off
        self.force_mode = False
        self.show_units = show_units
        self.auto_refresh = auto_refresh
        self.auto_refresh_time = auto_refresh_time
        self.initial_update_delay = int(initial_update_delay)
        self.coastal = coastal
        self.estimate_solrad_from_temp = estimate_solrad_from_temp
        self.name = name
        self.sensors = sensors
        self.hourly_precipitation_list = []
        self.hourly_evapotranspiration_list = []
        self.platforms = []
        self.bucket = 0
        self.hass = hass
        self.entities = {}
        self.entry_setup_completed = False
        super().__init__(hass, _LOGGER, name=name, update_interval=SCAN_INTERVAL)

        # last update of the day happens at specified local time if auto_refresh is on
        if self.auto_refresh:
            hour = int(self.auto_refresh_time.split(":")[0])
            minute = int(self.auto_refresh_time.split(":")[1])
            if minute < 10:
                minute_str = f"0{minute}"
            else:
                minute_str = minute
            _LOGGER.info(
                "Auto refresh is enabled. Scheduling for %s:%s.", hour, minute_str
            )
            async_track_time_change(
                hass,
                self._async_update_last_of_day,
                hour=hour,
                minute=minute,
                second=0,
            )
        # initial_update_delay only when > 0
        if self.initial_update_delay > 0:
            # get current time
            initial_update_time = dt.now() + datetime.timedelta(
                seconds=self.initial_update_delay
            )
            _LOGGER.info(
                "Initial update scheduled for {}".format(  # pylint: disable=logging-format-interpolation
                    initial_update_time
                )  # pylint: disable=logging-format-interpolation
            )

            async_track_point_in_time(
                hass, self._async_initial_update, point_in_time=initial_update_time
            )
        self.entry_setup_completed = True

    def register_entity(self, thetype, entity):
        """Register an entity."""
        _LOGGER.info("registering: type: {}, entity: {}".format(thetype, entity))
        self.entities[thetype] = entity

    def fire_bucket_updated_event(self):
        """Fire bucket_updated event so the sensor can update itself."""
        event_to_fire = f"{self.name}_{EVENT_BUCKET_UPDATED}"
        self.hass.bus.fire(event_to_fire, {CONF_BUCKET: self.bucket})

    def handle_reset_bucket(self, call):
        """Handle the service reset_bucket call."""
        _LOGGER.info("Reset bucket service called, resetting bucket to 0.")
        self.bucket = 0
        self.fire_bucket_updated_event()

    def handle_set_bucket(self, call):
        """Handle the service set_bucket call."""
        if "value" in call.data:
            value = float(call.data.get("value"))
            if self.system_of_measurement != SETTING_METRIC:
                value = value / MM_TO_INCH_FACTOR
            _LOGGER.info(
                "Set bucket service called, resetting bucket to provided value {}, converted to metric: {}".format(
                    call.data.get("value"), value
                )
            )
            self.bucket = value
            self.fire_bucket_updated_event()
        else:
            _LOGGER.info(
                "ignoring call of set_bucket service, no new value specified. specify a value like this: value: 1"
            )

    async def handle_calculate_daily_adjusted_run_time(self, call):
        """Handle the service calculate_daily_adjusted_run_time call."""
        _LOGGER.info(
            "Calculate Daily Adjusted Run Time service called, calculating now."
        )
        self._update_last_of_day()

    async def handle_calculate_hourly_adjusted_run_time(self, call):
        """Handle the service calculate_hourly_adjusted_run_time call."""
        _LOGGER.info(
            "Calculate Hourly Adjusted Run Time service called, calculating now."
        )
        self.data = await self._async_update_data()
        # fire an event so the sensor can update itself.
        event_to_fire = f"{self.name}_{EVENT_HOURLY_DATA_UPDATED}"
        self.hass.bus.fire(event_to_fire, {})

    async def handle_enable_force_mode(self, call):
        """Handle the service enable_force_mode call."""
        _LOGGER.info("handling enable_force_mode service call.")
        self.force_mode = True
        event_to_fire = f"{self.name}_{EVENT_FORCE_MODE_TOGGLED}"
        self.hass.bus.fire(event_to_fire, {})

    async def handle_disable_force_mode(self, call):
        """Handle the service disable_force_mode call."""
        _LOGGER.info("handling disable_force_mode service call.")
        self.force_mode = False
        event_to_fire = f"{self.name}_{EVENT_FORCE_MODE_TOGGLED}"
        self.hass.bus.fire(event_to_fire, {})

    def _update_last_of_day(self):
        _LOGGER.info("ENTERING _update_last_of_day. bucket is {}".format(self.bucket))

        # if bucket has a unit, parse it out
        if isinstance(self.bucket, str) and " " in self.bucket:
            self.bucket = float(self.bucket.split(" "[0]))
            _LOGGER.info("parsed out unit, bucket is {}".format(self.bucket))
        if len(self.hourly_precipitation_list) > 0:

            use_owm = True
            if CONF_SENSOR_PRECIPITATION in self.sensors:
                use_owm = False
            _LOGGER.info("using OWM for precipitation: {}".format(use_owm))
            # are we using OWM for precipitation?
            if use_owm:
                # this is applicable when using OWM (average)
                average_precip = average_of_list(self.hourly_precipitation_list)
                _LOGGER.info(
                    "average_precip set to {}, which is average of hourly_precipitation_list: {}".format(
                        average_precip, self.hourly_precipitation_list
                    )
                )
                average_evapotranspiration = average_of_list(
                    self.hourly_evapotranspiration_list
                )
                _LOGGER.info(
                    "average_evapotranspiration set to {}, which is average of hourly_evapotranspiration_list: {}".format(
                        average_evapotranspiration, self.hourly_evapotranspiration_list
                    )
                )
                bucket_delta = average_precip - average_evapotranspiration
            else:
                # when using a sensor for precipitation just take the most recent (last item in the list) because we assume it is a daily actual value (cumulative)
                precip = last_of_list(self.hourly_precipitation_list)
                _LOGGER.info(
                    "precip set to {}, which is last item of hourly_precipitation_list: {}".format(
                        precip, self.hourly_precipitation_list
                    )
                )
                # when using a sensor for evapotranspiration take the most recent value (last item in the list) because we assume it is a daily actual value (cumulative)
                if CONF_SENSOR_ET in self.sensors:
                    evapotranspiration = last_of_list(
                        self.hourly_evapotranspiration_list
                    )
                    _LOGGER.info(
                        "since we use a sensor, evapotranspiration set to {}, which is last item of hourly_evapotranspiration_list: {}".format(
                            evapotranspiration, self.hourly_evapotranspiration_list
                        )
                    )
                else:
                    evapotranspiration = average_of_list(
                        self.hourly_evapotranspiration_list
                    )
                    _LOGGER.info(
                        "since we are calculating, evapotranspiration set to {}, which is average of hourly_evapotranspiration_list: {}".format(
                            evapotranspiration, self.hourly_evapotranspiration_list
                        )
                    )
                bucket_delta = precip - evapotranspiration

            _LOGGER.info(
                "bucket_delta set to {}, which is the difference between precipitation and evapotranspiration".format(
                    bucket_delta
                )
            )
        else:
            bucket_delta = 0
            _LOGGER.info(
                "setting bucket_delta to 0 because there is no hourly_precipitation_list."
            )

        _LOGGER.info(
            "Updating bucket: {} with bucket_delta: {}".format(  # pylint: disable=logging-format-interpolation
                self.bucket, bucket_delta
            )  # pylint: disable=logging-format-interpolation
        )
        # empty the hourly precipitation list
        self.hourly_precipitation_list = []
        self.hourly_evapotranspiration_list = []
        self.bucket = self.bucket + bucket_delta
        _LOGGER.info(
            "hourly_precipitation_list and hourly_evapotranspiration_list are now empty, bucket is {}".format(
                self.bucket
            )
        )
        # fire an event so the sensor can update itself.
        event_to_fire = f"{self.name}_{EVENT_BUCKET_UPDATED}"
        self.hass.bus.fire(event_to_fire, {CONF_BUCKET: self.bucket})

    async def _async_update_last_of_day(self, *args):
        _LOGGER.info(
            "Updating for last time today, calculating adjusted run time for next irrigation time!"
        )
        # no need to call the api if we have no api ;)
        if self.api:
            # data comes at least partly from owm
            await self.hass.async_add_executor_job(self.api.get_data)
        self._update_last_of_day()
        _LOGGER.info("Bucket for today is: %s mm", self.bucket)
        # don't think this is necessary any more.
        # return data

    async def _async_initial_update(self, *args):
        """Start initial update."""
        # update just once
        _LOGGER.info(
            "Initial update triggered - calling calculate hourly adjusted run time now."
        )
        await self.handle_calculate_hourly_adjusted_run_time(call=None)

    async def _async_update_data(self):
        """Update data via library."""
        _LOGGER.info("Updating Smart Irrigation Data")
        try:
            if self.api:
                # data comes at least partly from owm
                data = await self.hass.async_add_executor_job(self.api.get_data)
                return data
            # data comes purely from sensors
            return None
        except Exception as exception:
            raise UpdateFailed(exception)
