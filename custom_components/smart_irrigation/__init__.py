"""The Smart Irrigation integration."""
import asyncio
from datetime import timedelta
import logging
import datetime

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.event import async_track_time_change

from homeassistant.const import (
    CONF_UNIT_OF_MEASUREMENT,
    CONF_LATITUDE,
    CONF_ELEVATION,
    CONF_LONGITUDE,
)

from .OWMClient import OWMClient
from .const import (
    CONF_API_KEY,
    CONF_REFERENCE_ET,
    CONF_REFERENCE_ET_1,
    CONF_REFERENCE_ET_2,
    CONF_REFERENCE_ET_3,
    CONF_REFERENCE_ET_4,
    CONF_REFERENCE_ET_5,
    CONF_REFERENCE_ET_6,
    CONF_REFERENCE_ET_7,
    CONF_REFERENCE_ET_8,
    CONF_REFERENCE_ET_9,
    CONF_REFERENCE_ET_10,
    CONF_REFERENCE_ET_11,
    CONF_REFERENCE_ET_12,
    CONF_NUMBER_OF_SPRINKLERS,
    CONF_FLOW,
    CONF_AREA,
    DOMAIN,
    PLATFORMS,
    NAME,
    STARTUP_MESSAGE,
    SETTING_METRIC,
    SETTING_US,
    MM_TO_INCH_FACTOR,
    LITER_TO_GALLON_FACTOR,
    M2_TO_SQ_FT_FACTOR,
    M_TO_FT_FACTOR,
    CONF_NETTO_PRECIPITATION,
    CONF_BUCKET,
    CONF_WATER_BUDGET,
    EVENT_BUCKET_UPDATED,
    SERVICE_RESET_BUCKET,
    SERVICE_CALCULATE_DAILY_ADJUSTED_RUN_TIME,
    SERVICE_CALCULATE_HOURLY_ADJUSTED_RUN_TIME,
    TYPE_CURRENT_ADJUSTED_RUN_TIME,
    CONF_LEAD_TIME,
    CONF_MAXIMUM_DURATION,
    CONF_FORCE_MODE_DURATION,
    CONF_SHOW_UNITS,
    CONF_AUTO_REFRESH,
    CONF_AUTO_REFRESH_TIME,
    CONF_NAME,
)

_LOGGER = logging.getLogger(__name__)

# SCAN_INTERVAL = timedelta(minutes=58)
SCAN_INTERVAL = timedelta(minutes=5)

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

    # convert values to internal metric representation if required.
    system_of_measurement = SETTING_METRIC
    # depending on this we need to convert to metric internally or not
    if hass.config.as_dict().get("unit_system").get("length") == "mi":
        system_of_measurement = SETTING_US
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

    # handle options: lead time, max duration, force_mode_duration, show units, auto refresh, auto refresh time
    lead_time = entry.options.get(CONF_LEAD_TIME, 0)
    maximum_duration = entry.options.get(CONF_MAXIMUM_DURATION, -1)
    force_mode_duration = entry.options.get(CONF_FORCE_MODE_DURATION, 0)
    show_units = entry.options.get(CONF_SHOW_UNITS, False)
    auto_refresh = entry.options.get(CONF_AUTO_REFRESH, True)
    auto_refresh_time = entry.options.get(CONF_AUTO_REFRESH_TIME, "23:00")

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
        name=name,
    )

    await coordinator.async_refresh()

    if not coordinator.last_update_success:
        raise ConfigEntryNotReady

    hass.data[DOMAIN][entry.entry_id] = coordinator

    for p in PLATFORMS:
        coordinator.platforms.append(p)
        hass.async_add_job(hass.config_entries.async_forward_entry_setup(entry, p))

    entry.add_update_listener(async_reload_entry)

    # register the services
    hass.services.async_register(
        DOMAIN, f"{name}_{SERVICE_RESET_BUCKET}", coordinator.handle_reset_bucket,
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

    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Reload config entry."""
    _LOGGER.warning("async_reload_entry")
    coordinator = hass.data[DOMAIN][entry.entry_id]
    if coordinator.entry_setup_completed:
        await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Handle removal of an entry."""
    _LOGGER.warning("async unload entry")
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
        name,
    ):
        """Initialize."""
        self.api = OWMClient(api_key=api_key, longitude=longitude, latitude=latitude)
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
        self.maximum_duration = maximum_duration
        self.force_mode_duration = force_mode_duration
        self.show_units = show_units
        self.auto_refresh = auto_refresh
        self.auto_refresh_time = auto_refresh_time
        self.name = name
        self.platforms = []
        self.bucket = 0
        self.hass = hass
        self.entities = {}
        self.entry_setup_completed = False
        # should this be name? or domain?
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=SCAN_INTERVAL)

        # last update of the day happens at specified local time if auto_refresh is on
        if self.auto_refresh:
            _LOGGER.info(
                "Auto refresh is enabled. Scheduling for {}".format(
                    self.auto_refresh_time
                )
            )
            async_track_time_change(
                hass,
                self._async_update_last_of_day,
                hour=self.auto_refresh_time.split(":")[0],
                minute=self.auto_refresh_time.split(":")[1],
                second=0,
            )
        self.entry_setup_completed = True

    def register_entity(self, thetype, entity):
        self.entities[thetype] = entity
        self.entry_setup_completed = True

    def handle_reset_bucket(self, call):
        """Handle the service reset_bucket call."""
        _LOGGER.info("Reset bucket service called, resetting bucket to 0.")
        self.bucket = 0
        # fire an event so the sensor can update itself.
        self.hass.bus.fire(EVENT_BUCKET_UPDATED, {CONF_BUCKET: self.bucket})

    def handle_calculate_daily_adjusted_run_time(self, call):
        """Handle the service calculate_daily_adjusted_run_time call."""
        _LOGGER.info(
            "Calculate Daily Adjusted Run Time service called, calculating now."
        )
        self._update_last_of_day()

    def handle_calculate_hourly_adjusted_run_time(self, call):
        """Handle the service calculate_hourly_adjusted_run_time call."""
        _LOGGER.info(
            "Calculate Hourly Adjusted Run Time service called, calculating now."
        )
        self._async_update_data()

    def _update_last_of_day(self):
        cart_entity_id = self.entities[TYPE_CURRENT_ADJUSTED_RUN_TIME]
        # update the bucket based on the current bucket_delta.
        cart = self.hass.states.get(cart_entity_id)
        # this might be in metric or imperial, we need to convert it to metric.
        bucket_delta = float(cart.attributes[CONF_NETTO_PRECIPITATION].split(" ")[0])
        if self.system_of_measurement != SETTING_METRIC:
            bucket_delta = bucket_delta / MM_TO_INCH_FACTOR
        self.bucket = self.bucket + bucket_delta

        # fire an event so the sensor can update itself.
        self.hass.bus.fire(EVENT_BUCKET_UPDATED, {CONF_BUCKET: self.bucket})

    async def _async_update_last_of_day(self, *args):
        _LOGGER.info(
            "Updating for last time today, calculating adjusted run time for next irrigation time!"
        )
        data = await self.hass.async_add_executor_job(self.api.get_data)
        self._update_last_of_day()
        _LOGGER.info("Bucket for today is: {} mm".format(self.bucket))
        return data

    async def _async_update_data(self):
        """Update data via library."""
        _LOGGER.info("Updating Smart Irrigation Data")
        try:
            data = await self.hass.async_add_executor_job(self.api.get_data)
            return data
        except Exception as exception:
            raise UpdateFailed(exception)
