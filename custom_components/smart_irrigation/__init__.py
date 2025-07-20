"""The Smart Irrigation Integration."""

import contextlib
import datetime
import logging
import math
import re
import statistics
from datetime import timedelta

from homeassistant.components.sensor import DOMAIN as PLATFORM
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_ELEVATION,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import Event, HomeAssistant, State, asyncio, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_sunrise,
    async_track_sunset,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import (
    altitudeToPressure,
    calculate_solar_azimuth,
    check_time,
    convert_between,
    convert_list_to_dict,
    convert_mapping_to_metric,
    find_next_solar_azimuth_time,
    loadModules,
    relative_to_absolute_pressure,
)
from .localize import localize
from .panel import async_register_panel, remove_panel
from .store import async_get_registry
from .weathermodules.KNMIClient import KNMIClient
from .weathermodules.OWMClient import OWMClient
from .weathermodules.PirateWeatherClient import PirateWeatherClient
from .websockets import async_register_websockets

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(const.DOMAIN)


async def async_setup(hass: HomeAssistant, config):
    """Track states and offer events for sensors."""
    # this did not work. Users will have to reload the integration / i.e. restart HA if they make this change.
    # listener for core config changes (for unit changes)
    # hass.bus.listen("core_config_updated", handle_core_config_change)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Smart Irrigation from a config entry."""
    session = async_get_clientsession(hass)

    store = await async_get_registry(hass)
    # store Weather Service info in hass.data
    hass.data.setdefault(const.DOMAIN, {})
    # load store info into hass.data[const.DOMAIN]
    config = await store.async_get_config()
    hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = config.get(
        const.CONF_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE
    )
    hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = config.get(
        const.CONF_WEATHER_SERVICE, const.CONF_DEFAULT_WEATHER_SERVICE
    )

    # check the entry to see if it matches up, if not, set it.
    if const.CONF_USE_WEATHER_SERVICE in entry.data:
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = entry.data.get(
            const.CONF_USE_WEATHER_SERVICE
        )
        if hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE]:
            if const.CONF_WEATHER_SERVICE in entry.data:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = entry.data.get(
                    const.CONF_WEATHER_SERVICE
                )
            if const.CONF_WEATHER_SERVICE_API_KEY in entry.data:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                    entry.data.get(const.CONF_WEATHER_SERVICE_API_KEY).strip()
                )
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                entry.data.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )
    # check for OWM config and migrate accordingly
    if entry.data.get("use_owm"):
        if "owm_api_key" in entry.data:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = entry.data[
                "owm_api_key"
            ]
    # logic here is: if options are set that do not agree with the data settings, use the options
    # handle options flow data
    if const.CONF_USE_WEATHER_SERVICE in entry.options and entry.options.get(
        const.CONF_USE_WEATHER_SERVICE
    ) != entry.data.get(const.CONF_USE_WEATHER_SERVICE):
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = entry.options.get(
            const.CONF_USE_WEATHER_SERVICE
        )
        if const.CONF_WEATHER_SERVICE in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = entry.options.get(
                const.CONF_WEATHER_SERVICE
            )
        if const.CONF_WEATHER_SERVICE_API_KEY in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                entry.options.get(const.CONF_WEATHER_SERVICE_API_KEY)
            )
            if hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] is not None:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = hass.data[
                    const.DOMAIN
                ][const.CONF_WEATHER_SERVICE_API_KEY].strip()
        if const.CONF_WEATHER_SERVICE_API_VERSION in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                entry.options.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )

    # Removed because of addition of other weather services than OWM
    # check if API version is 2.5, force it to be 3.0. API keys should still be valid.
    # if const.CONF_WEATHER_SERVICE_API_VERSION in hass.data[const.DOMAIN]:
    #    if hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] == "2.5":
    #        hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
    coordinator = SmartIrrigationCoordinator(hass, session, entry, store)

    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(const.DOMAIN, coordinator.id)},
        name=const.NAME,
        model=const.NAME,
        sw_version=const.VERSION,
        manufacturer=const.MANUFACTURER,
    )

    hass.data[const.DOMAIN]["coordinator"] = coordinator
    hass.data[const.DOMAIN]["zones"] = {}

    # make sure we capture the use_owm state
    await store.async_update_config(
        {const.CONF_USE_WEATHER_SERVICE: coordinator.use_weather_service}
    )

    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=coordinator.id, data={})

    _LOGGER.info("Calling async_forward_entry_setups")
    await hass.config_entries.async_forward_entry_setups(entry, [PLATFORM])
    _LOGGER.info("Finished calling async_forward_entry_setups")
    # update listener for options flow
    entry.async_on_unload(entry.add_update_listener(options_update_listener))

    # Register the panel (frontend)
    await async_register_panel(hass)

    # Websocket support
    await async_register_websockets(hass)

    # Register custom services
    register_services(hass)

    # Finish up by setting factory defaults if needed for zones, mappings and modules
    await store.set_up_factory_defaults()

    await coordinator.update_subscriptions()
    return True


async def options_update_listener(hass: HomeAssistant, config_entry):
    """Handle options update."""
    # copy the api key and version to the hass data
    if const.DOMAIN in hass.data:
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = (
            config_entry.options.get(const.CONF_USE_WEATHER_SERVICE)
        )
        if hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE]:
            if const.CONF_WEATHER_SERVICE in config_entry.options:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = (
                    config_entry.options.get(const.CONF_WEATHER_SERVICE)
                )
            if const.CONF_WEATHER_SERVICE_API_KEY in config_entry.options:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                    config_entry.options.get(const.CONF_WEATHER_SERVICE_API_KEY).strip()
                )
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                config_entry.options.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )
        else:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = None
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = None
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = None
        await hass.config_entries.async_reload(config_entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry):
    """Unload Smart Irrigation config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[hass.config_entries.async_forward_entry_unload(entry, PLATFORM)]
        )
    )
    if not unload_ok:
        return False

    remove_panel(hass)
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    await coordinator.async_unload()
    return True


async def async_remove_entry(hass: HomeAssistant, entry):
    """Remove Smart Irrigation config entry."""
    remove_panel(hass)
    if const.DOMAIN in hass.data:
        if "coordinator" in hass.data[const.DOMAIN]:
            coordinator = hass.data[const.DOMAIN]["coordinator"]
            await coordinator.async_delete_config()
        del hass.data[const.DOMAIN]


class SmartIrrigationError(Exception):
    """Exception raised for errors in the Smart Irrigation integration."""


class SmartIrrigationCoordinator(DataUpdateCoordinator):
    """Define an object to hold Smart Irrigation device."""

    def __init__(self, hass: HomeAssistant, session, entry, store) -> None:
        """Initialize."""
        self.id = entry.unique_id
        self.hass = hass
        self.entry = entry
        self.store = store
        self.use_weather_service = hass.data[const.DOMAIN][
            const.CONF_USE_WEATHER_SERVICE
        ]

        self.weather_service = hass.data[const.DOMAIN].get(
            const.CONF_WEATHER_SERVICE, None
        )
        self._WeatherServiceClient = None
        if self.use_weather_service:
            if self.weather_service == const.CONF_WEATHER_SERVICE_OWM:
                self._WeatherServiceClient = OWMClient(
                    api_key=hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY],
                    api_version=hass.data[const.DOMAIN].get(
                        const.CONF_WEATHER_SERVICE_API_VERSION
                    ),
                    latitude=self.hass.config.as_dict().get(CONF_LATITUDE),
                    longitude=self.hass.config.as_dict().get(CONF_LONGITUDE),
                    elevation=self.hass.config.as_dict().get(CONF_ELEVATION),
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_PW:
                self._WeatherServiceClient = PirateWeatherClient(
                    api_key=hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY],
                    api_version="1",
                    latitude=self.hass.config.as_dict().get(CONF_LATITUDE),
                    longitude=self.hass.config.as_dict().get(CONF_LONGITUDE),
                    elevation=self.hass.config.as_dict().get(CONF_ELEVATION),
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_KNMI:
                self._WeatherServiceClient = KNMIClient(
                    api_key=hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY],
                    api_version=hass.data[const.DOMAIN].get(
                        const.CONF_WEATHER_SERVICE_API_VERSION, "1"
                    ),
                    latitude=self.hass.config.as_dict().get(CONF_LATITUDE),
                    longitude=self.hass.config.as_dict().get(CONF_LONGITUDE),
                    elevation=self.hass.config.as_dict().get(CONF_ELEVATION),
                )

        # Initialize latitude and elevation for calendar generation and other features
        # Try to get from Home Assistant config first, then entry data, then options, then defaults
        self._latitude = self._get_config_value(CONF_LATITUDE, 45.0)
        self._elevation = self._get_config_value(CONF_ELEVATION, 0)

        # Log a warning if using default values for user awareness
        if self._latitude == 45.0 and hass.config.as_dict().get(CONF_LATITUDE) is None:
            _LOGGER.warning(
                "Latitude not configured in Home Assistant, using default latitude of 45.0 for watering calendar calculations"
            )
        if self._elevation == 0 and hass.config.as_dict().get(CONF_ELEVATION) is None:
            _LOGGER.warning(
                "Elevation not configured in Home Assistant, using default elevation of 0m for watering calendar calculations"
            )

        self._subscriptions = []

        self._subscriptions.append(
            async_dispatcher_connect(
                hass,
                const.DOMAIN + "_platform_loaded",
                self.setup_SmartIrrigation_entities,
            )
        )
        self._track_auto_calc_time_unsub = None
        self._track_auto_update_time_unsub = None
        self._track_auto_clear_time_unsub = None
        self._track_sunrise_event_unsub = None
        self._track_irrigation_triggers_unsub = []  # List to track multiple triggers
        self._track_midnight_time_unsub = None
        self._debounced_update_cancel = None
        # set up auto calc time and auto update time from data
        the_config = self.store.get_config()
        the_config[const.CONF_USE_WEATHER_SERVICE] = self.use_weather_service
        the_config[const.CONF_WEATHER_SERVICE] = self.weather_service
        if the_config[const.CONF_AUTO_UPDATE_ENABLED]:
            # Fire-and-forget: schedule auto update timer setup in background
            hass.loop.create_task(self.set_up_auto_update_time(the_config))
        if the_config[const.CONF_AUTO_CALC_ENABLED]:
            # Fire-and-forget: schedule auto calc timer setup in background
            hass.loop.create_task(self.set_up_auto_calc_time(the_config))
        if the_config[const.CONF_AUTO_CLEAR_ENABLED]:
            # Fire-and-forget: schedule auto clear timer setup in background
            hass.loop.create_task(self.set_up_auto_clear_time(the_config))
        if the_config[const.START_EVENT_FIRED_TODAY]:
            self._start_event_fired_today = True
        else:
            self._start_event_fired_today = False

        # WIP v2024.6.X:
        # experiment with subscriptions on sensors
        self._sensor_subscriptions = []
        self._sensors_to_subscribe_to = []

        # set up sunrise tracking
        _LOGGER.debug("calling register start event from init")
        # Fire-and-forget: register start event tracking in background
        asyncio.create_task(self.register_start_event())

        # set up midnight tracking
        self._track_midnight_time_unsub = async_track_time_change(
            hass, self._reset_event_fired_today, 0, 0, 0
        )

        super().__init__(hass, _LOGGER, name=const.DOMAIN)

    def _get_config_value(self, key: str, default_value):
        """Get configuration value from Home Assistant config, entry data, or options with fallback to default.

        Args:
            key: Configuration key to look up (e.g., CONF_LATITUDE, CONF_ELEVATION)
            default_value: Default value to use if not found anywhere

        Returns:
            The configuration value or default_value if not found
        """
        # Try Home Assistant config first (most reliable)
        value = self.hass.config.as_dict().get(key)
        if value is not None:
            return value

        # Try config entry data
        if hasattr(self.entry, "data") and key in self.entry.data:
            return self.entry.data[key]

        # Try config entry options
        if hasattr(self.entry, "options") and key in self.entry.options:
            return self.entry.options[key]

        # Fall back to default
        return default_value

    async def setup_SmartIrrigation_entities(self):  # noqa: D102
        zones = await self.store.async_get_zones()

        for zone in zones:
            # self.async_create_zone(zone)
            async_dispatcher_send(self.hass, const.DOMAIN + "_register_entity", zone)

    async def async_update_config(self, data):  # noqa: D102
        _LOGGER.debug("[async_update_config]: config changed: %s", data)
        # handle auto calc changes
        await self.set_up_auto_calc_time(data)
        # handle auto update changes, includings updating OWMClient cache settings
        await self.set_up_auto_update_time(data)
        # handle auto clear changes
        await self.set_up_auto_clear_time(data)
        await self.store.async_update_config(data)
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated")

    async def set_up_auto_update_time(self, data):  # noqa: D102
        # WIP v2024.6.X:
        # experiment to use subscriptions to catch all updates instead of just on a time schedule
        await self.update_subscriptions(data)
        if data[const.CONF_AUTO_UPDATE_ENABLED]:
            # CONF_AUTO_UPDATE_SCHEDULE: minute, hour, day
            # CONF_AUTO_UPDATE_INTERVAL: X
            # CONF_AUTO_UPDATE_TIME: first update time
            # 2023.9.0-beta14 experiment: ignore auto update time. Instead do a delay?

            # if check_time(data[const.CONF_AUTO_UPDATE_TIME]):
            # first auto update time is valid
            # update only the actual changed value: auto update time
            #    timesplit = data[const.CONF_AUTO_UPDATE_TIME].split(":")
            #    if self._track_auto_update_time_unsub:
            #        self._track_auto_update_time_unsub()
            #    self._track_auto_update_time_unsub = async_track_time_change(
            #        self.hass,
            #        self._async_track_update_time,
            #        hour=timesplit[0],
            #        minute=timesplit[1],
            #        second=0
            #    )
            #    _LOGGER.info("Scheduled auto update first time update for {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            # else:
            #    _LOGGER.warning("Schedule auto update time is not valid: {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            #    raise ValueError("Time is not a valid time")
            # call update track time after waiting [update_delay] seconds

            delay = 0
            if const.CONF_AUTO_UPDATE_DELAY in data:
                if int(data[const.CONF_AUTO_UPDATE_DELAY]) > 0:
                    delay = int(data[const.CONF_AUTO_UPDATE_DELAY])
                    _LOGGER.info("Delaying auto update with %s seconds", delay)
            async_call_later(
                self.hass, timedelta(seconds=delay), self.track_update_time
            #    timesplit = data[const.CONF_AUTO_UPDATE_TIME].split(":")
            #    if self._track_auto_update_time_unsub:
            #        self._track_auto_update_time_unsub()
            #    self._track_auto_update_time_unsub = async_track_time_change(
            #        self.hass,ync_update_config(data)
            #        self._async_track_update_time,
            #        hour=timesplit[0],, config=None):
            #        minute=timesplit[1],r Smart Irrigation coordinator."""
            #        second=0 to subscriptions
            #    )ll existing sensor subscriptions
            #    _LOGGER.info("Scheduled auto update first time update for {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            # else:lf._sensor_subscriptions:
            #    _LOGGER.warning("Schedule auto update time is not valid: {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            #    raise ValueError("Time is not a valid time")
            # call update track time after waiting [update_delay] seconds
        # check if continuous updates are enabled, if not, skip this
            delay = 0ebug message
            if const.CONF_AUTO_UPDATE_DELAY in data:
                if int(data[const.CONF_AUTO_UPDATE_DELAY]) > 0:
                    delay = int(data[const.CONF_AUTO_UPDATE_DELAY])
                    _LOGGER.info("Delaying auto update with %s seconds", delay)
            async_call_later(criptions]: continuous updates are disabled, skipping"
                self.hass, timedelta(seconds=delay), self.track_update_time
            )eturn
        elif self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = Nonet_sensors_to_subscribe_to()
            await self.store.async_update_config(data)
        if self._sensors_to_subscribe_to is not None:
    async def update_subscriptions(self, config=None):
        """Update sensor subscriptions for Smart Irrigation coordinator."""s)
        # WIP v2024.6.X: move to subscriptionsend(
        # remove all existing sensor subscriptions(
        _LOGGER.debug("[update_subscriptions]: removing all sensor subscriptions")
        for s in self._sensor_subscriptions:
            with contextlib.suppress(Exception):changed,
                s() )
                )
        # check if continuous updates are enabled, if not, skip this
        # and log a debug messagecribe_to(self):
        if config is None:f sensor entity IDs to subscribe to for state changes."""
            config = await self.store.async_get_config()
        if not config.get(const.CONF_CONTINUOUS_UPDATES):tomatic_zones(zones)
            _LOGGER.debug(be_to = []
                "[update_subscriptions]: continuous updates are disabled, skipping"
            )apping_id in mappings:
            return
                owm_in_mapping,
        # subscribe to all sensors
        self._sensors_to_subscribe_to = await self.get_sensors_to_subscribe_to()
            ) = self.check_mapping_sources(mapping_id=mapping_id)
        if self._sensors_to_subscribe_to is not None:id)
            for s in self._sensors_to_subscribe_to:
                _LOGGER.debug("[update_subscriptions]: subscribing to %s", s)
                self._sensor_subscriptions.append(
                    async_track_state_change_event(
                        self.hass,
                        s,apping:
                        self.async_sensor_state_changed,G_MAPPINGS].items():
                    )LOGGER.debug("[get_sensors_to_subscribe_to]: %s %s", key, the_map)
                )   if not isinstance(the_map, str):
                        if the_map.get(
    async def get_sensors_to_subscribe_to(self):OURCE
        """Return a list of sensor entity IDs to subscribe to for state changes."""
        zones = await self.store.async_get_zones()SOR
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        sensors_to_subscribe_to = []apping maps to a sensor, so retrieve its value from HA
        # loop over the mappings and store sensor data
        for mapping_id in mappings:_map.get(const.MAPPING_CONF_SENSOR)
            (                   not in sensors_to_subscribe_to
                owm_in_mapping,
                sensor_in_mapping,nsors_to_subscribe_to.append(
                static_in_mapping,  the_map.get(const.MAPPING_CONF_SENSOR)
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            mapping = self.store.get_mapping(mapping_id)
            _LOGGER.debug(      _LOGGER.debug(
                "[get_sensors_to_subscribe_to]: mapping %s: %s",o]: already added"
                mapping_id,     )
                mapping[const.MAPPING_MAPPINGS],
            )               _LOGGER.debug(
            if sensor_in_mapping:[get_sensors_to_subscribe_to]: not mapped to a sensor"
                for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
                    _LOGGER.debug("[get_sensors_to_subscribe_to]: %s %s", key, the_map)
                    if not isinstance(the_map, str):
                        if the_map.get(rs_to_subscribe_to]: the_map is a str, skipping"
                            const.MAPPING_CONF_SOURCE
                        ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(
                            const.MAPPING_CONF_SENSORibe_to]: sensor not in mapping")
                        ):
                            # this mapping maps to a sensor, so retrieve its value from HA
                            if (
                                the_map.get(const.MAPPING_CONF_SENSOR)
                                not in sensors_to_subscribe_to
                            ):e: entity, old_state, new_state):
                                sensors_to_subscribe_to.append(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                )
                            else:ata.get("old_state")
                                _LOGGER.debug(ta.get("new_state")
                                    "[get_sensors_to_subscribe_to]: already added"
                                )
                        else:et("entity_id")
                            _LOGGER.debug(e
                                "[get_sensors_to_subscribe_to]: not mapped to a sensor"
                            )don't have an actual value
                    else:state in [None, STATE_UNKNOWN, STATE_UNAVAILABLE]:
                        _LOGGER.debug(
                            "[get_sensors_to_subscribe_to]: the_map is a str, skipping"
                        )
            else:he_new_state,
                _LOGGER.debug("[get_sensors_to_subscribe_to]: sensor not in mapping")
            return
        return sensors_to_subscribe_to
            "[async_sensor_state_changed]: new state for %s is %s",
    async def async_sensor_state_changed(
        self, event: Event
    ) -> None:  # old signature: entity, old_state, new_state):
        """Handle a sensor state change event."""
        timestamp = datetime.datetime.now()fig
        debounce = 0
        # old_state_obj = event.data.get("old_state")g()
        new_state_obj: State | None = event.data.get("new_state")
        if new_state_obj is None:nfig[const.CONF_SENSOR_DEBOUNCE])
            returnR.debug(
        entity = event.data.get("entity_id")]: sensor debounce is %s ms", debounce
        the_new_state = new_state_obj.state

        # ignore states that don't have an actual value
        if new_state_obj.state in [None, STATE_UNKNOWN, STATE_UNAVAILABLE]:
            _LOGGER.debug(pings:
                "[async_sensor_state_changed]: new state for %s is %s, ignoring",
                entity,, val in mapping.get(const.MAPPING_MAPPINGS).items():
                the_new_state,
            )           isinstance(val, str)
            return      or val.get(const.MAPPING_CONF_SENSOR) != entity
        _LOGGER.debug(and val.get(
            "[async_sensor_state_changed]: new state for %s is %s",
            entity, ) != const.MAPPING_CONF_SOURCE_STATIC_VALUE:
            the_new_state,ntinue
        )
                    if (
        # get sensor debounce time from configCONF_SOURCE)
        debounce = 0    == const.MAPPING_CONF_SOURCE_STATIC_VALUE
        the_config = await self.store.async_get_config()
        if the_config[const.CONF_SENSOR_DEBOUNCE]:nst.MAPPING_CONF_STATIC_VALUE)
            debounce = int(the_config[const.CONF_SENSOR_DEBOUNCE])ue
            _LOGGER.debug(_new_state is None:
                "[async_sensor_state_changed]: sensor debounce is %s ms", debounce
            )
                    if const.MAPPING_DATA in mapping:
        # get the mapping that uses this sensorget(const.MAPPING_DATA)
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:data = []
            if mapping.get(const.MAPPING_MAPPINGS):
                for key, val in mapping.get(const.MAPPING_MAPPINGS).items():
                    if ({
                        isinstance(val, str)ping_to_metric(
                        or val.get(const.MAPPING_CONF_SENSOR) != entity
                    ) and val.get(y,
                        const.MAPPING_CONF_SOURCEPING_CONF_UNIT),
                    ) != const.MAPPING_CONF_SOURCE_STATIC_VALUE:_SYSTEM,
                        continue
                            const.RETRIEVED_AT: timestamp,
                    if (}
                        val.get(const.MAPPING_CONF_SOURCE)
                        == const.MAPPING_CONF_SOURCE_STATIC_VALUE
                    ):ta_last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
                        the_new_state = val.get(const.MAPPING_CONF_STATIC_VALUE)
                    # add the mapping data with the new sensor value
                    if the_new_state is None:ntry, list):
                        continuet_entry = convert_list_to_dict(data_last_entry)
                    data_last_entry[key] = mapping_data[-1][key]
                    if const.MAPPING_DATA in mapping:
                        mapping_data = mapping.get(const.MAPPING_DATA)
                    else:onst.MAPPING_DATA_LAST_UPDATED: timestamp,
                        mapping_data = []A_LAST_ENTRY: data_last_entry,
                    # conversion to metric
                    mapping_data.append(nc_update_mapping(
                        {apping.get(const.MAPPING_ID), changes
                            key: convert_mapping_to_metric(
                                float(the_new_state),
                                key,or_state_changed]: updated sensor group %s %s",
                                val.get(const.MAPPING_CONF_UNIT),
                                self.hass.config.units is METRIC_SYSTEM,
                            ),
                            const.RETRIEVED_AT: timestamp,
                        }mapping.get(const.MAPPING_ID)
                    )ce > 0:
                    # store the value in the last entrye
                    data_last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
                    if data_last_entry is None or len(data_last_entry) == 0:
                        data_last_entry = {}_changed]: cancelling previously scheduled update"
                    if isinstance(data_last_entry, list):
                        data_last_entry = convert_list_to_dict(data_last_entry)
                    data_last_entry[key] = mapping_data[-1][key]
                    changes = {update
                        const.MAPPING_DATA: mapping_data,
                        const.MAPPING_DATA_LAST_UPDATED: timestamp,e in %s ms", debounce
                        const.MAPPING_DATA_LAST_ENTRY: data_last_entry,
                    }_debounced_update_cancel = async_call_later(
                    await self.store.async_update_mapping(
                        mapping.get(const.MAPPING_ID), changes
                    ) This callback may run off-loop, so use call_soon_threadsafe
                    _LOGGER.debug(d=mapping_id: self.hass.loop.call_soon_threadsafe(
                        "[async_sensor_state_changed]: updated sensor group %s %s",
                        mapping.get(const.MAPPING_ID),or_mapping(mid),
                        key,
                    )
            else:
            mapping_id = mapping.get(const.MAPPING_ID)
            if debounce > 0:sensor_state_changed]: no debounce, doing update now"
                # Cancel any previously scheduled update
                if self._debounced_update_cancel:e_for_mapping(mapping_id)
                    _LOGGER.debug(
                        "[async_sensor_state_changed]: cancelling previously scheduled update"
                    )continuous update for a specific mapping if it does not use a weather service.
                    self._debounced_update_cancel()
        Args:
                # Schedule the update mapping to update.
                _LOGGER.debug(
                    "[async_sensor_state_changed]: scheduling update in %s ms", debounceI calls,
                )t, updates and calculates all automatic zones that use this mapping, assuming their modules do not use forecasting.
                self._debounced_update_cancel = async_call_later(
                    self.hass,
                    timedelta(milliseconds=debounce),
                    # This callback may run off-loop, so use call_soon_threadsafe
                    lambda now, mid=mapping_id: self.hass.loop.call_soon_threadsafe(
                        self.hass.async_create_task,
                        self.async_continuous_update_for_mapping(mid),
                    ),None:
                )n
            else:
                _LOGGER.debug(
                    "[async_sensor_state_changed]: no debounce, doing update now"
                )ng_id,
                await self.async_continuous_update_for_mapping(mapping_id)
        if self.check_mapping_sources(mapping_id)[0]:
    async def async_continuous_update_for_mapping(self, mapping_id):
        """Perform a continuous update for a specific mapping if it does not use a weather service.automatic update to avoid API calls that can incur costs"
            )
        Args:eturn
            mapping_id: The ID of the mapping to update.
        # mapping does not use Weather Service
        This method checks if the mapping uses a weather service to avoid unnecessary API calls,
        and if not, updates and calculates all automatic zones that use this mapping, assuming their modules do not use forecasting.
        for z in zones:
        """ zones_to_calculate.append(z)
        self._debounced_update_cancel = None
            if zone is None or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
        if mapping_id is None:
            return  "[async_continuous_update_for_mapping] zone %s is not automatic, skipping",
        mapping = self.store.get_mapping(mapping_id)
        if mapping is None:
            returnntinue
            if zone.get(const.ZONE_MODULE) is None:
        _LOGGER.info(ER.info(
            "[async_continuous_update_for_mapping] considering sensor group %s",, skipping",
            mapping_id,
        )       )
        if self.check_mapping_sources(mapping_id)[0]:
            _LOGGER.info(
                "[async_continuous_update_for_mapping] sensor group uses weather service, skipping automatic update to avoid API calls that can incur costs"
            )od = self.store.get_module(zone.get(const.ZONE_MODULE))
            return is None:
                continue
        # mapping does not use Weather Service
        zones = await self._get_zones_that_use_this_mapping(mapping_id)
        zones_to_calculate = []DULE_NAME) != "PyETO":
        for z in zones:culate = True
            zones_to_calculate.append(z)
            zone = self.store.get_zone(z)date_for_mapping]: module is not PyETO, so we can calculate for zone %s",
            if zone is None or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] zone %s is not automatic, skipping",
                    z,le is PyETO. Check the config for forecast days == 0
                )LOGGER.debug(
                continueync_continuous_update_for_mapping]: module is PyETO, checking config"
            if zone.get(const.ZONE_MODULE) is None:
                _LOGGER.info(nst.MODULE_CONFIG):
                    "[async_continuous_update_for_mapping] zone %s has no module, skipping",
                    z,  "[async_continuous_update_for_mapping]: module has config: %s",
                )       mod.get(const.MODULE_CONFIG),
                continue
                    _LOGGER.debug(
            # check the module is not pyeto or if it is, that it does not use forecastingreturns forecast_days: %s",
            mod = self.store.get_module(zone.get(const.ZONE_MODULE))
            if mod is None: const.CONF_PYETO_FORECAST_DAYS, 0
                continue),
                    )
            can_calculate = Falseconfig on the module, so let's check it
            if mod.get(const.MODULE_NAME) != "PyETO":
                can_calculate = Truet.MODULE_CONFIG).get(
                _LOGGER.info(onst.CONF_PYETO_FORECAST_DAYS, 0
                    "[async_continuous_update_for_mapping]: module is not PyETO, so we can calculate for zone %s",
                    zone.get(const.ZONE_ID),
                )       or mod.get(const.MODULE_CONFIG).get(
            else:           const.CONF_PYETO_FORECAST_DAYS
                # module is PyETO. Check the config for forecast days == 0
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping]: module is PyETO, checking config"
                )           const.CONF_PYETO_FORECAST_DAYS
                if mod.get(const.MODULE_CONFIG):
                    _LOGGER.debug(
                        "[async_continuous_update_for_mapping]: module has config: %s",
                        mod.get(const.MODULE_CONFIG),
                    )   _LOGGER.info(
                    _LOGGER.debug(ed config for PyETO module on zone %s, forecast_days==0 or None, so we can calculate",
                        "[async_continuous_update_for_mapping]: mod.get(forecast_days,0) returns forecast_days: %s",
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 0
                        ),OGGER.info(
                    )       "Checked config for PyETO module on zone %s, forecast_days>0, skipping to avoid API calls that can incur costs",
                    # there is a config on the module, so let's check it
                    if ()
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 00, since there is no config we can calculate
                        )alculate = True
                        == 0info(
                        or mod.get(const.MODULE_CONFIG).get(g] for sensor group %s: sensor group does use weather service, skipping automatic update to avoid API calls that can incur costs",
                            const.CONF_PYETO_FORECAST_DAYS
                        )
                        == "0"
                        or mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYSn_calculate: %s",
                        )late,
                        is None
                    ):culate:
                        can_calculate = True
                        _LOGGER.info(
                            "Checked config for PyETO module on zone %s, forecast_days==0 or None, so we can calculate",
                            zone.get(const.ZONE_ID),
                        )get(const.ZONE_ID),
                    else:
                        _LOGGER.info(ulate_zone(
                            "Checked config for PyETO module on zone %s, forecast_days>0, skipping to avoid API calls that can incur costs",
                            zone.get(const.ZONE_ID),
                        )
                else:_to_calculate.remove(z)
                    # default config for pyeto is forecast = 0, since there is no config we can calculate
                    can_calculate = True
                    _LOGGER.info(nuous_update_for_mapping] for sensor group %s: zone %s has module %s that uses forecasting, skipping to avoid API calls that can incur costs",
                        "[async_continuous_update_for_mapping] for sensor group %s: sensor group does use weather service, skipping automatic update to avoid API calls that can incur costs",
                        mapping_id,
                    )od.get(const.MODULE_NAME),
                )
            _LOGGER.debug(
                "[async_continuous_update_for_mapping]: can_calculate: %s",id not calculate!
                can_calculate,
            )[async_continuous_update_for_mapping] for sensor group %s: zones_to_calculate: %s. if this is empty this means that all zones for this sensor group have been calculated and therefore we can remove the weather data",
            if can_calculate:
                # get the zone and calculate
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping] for sensor group %s: calculating zone %s",
                    mapping_id,
                    zone.get(const.ZONE_ID),r_mapping] for sensor group %s: did not calculate all zones, keeping weather data for the sensor group",
                )apping_id,
                await self.async_calculate_zone(
                    z,
                    continuous_updates=True,
                )clearing weather data for sensor group %s since we calculated all dependent zones",
                zones_to_calculate.remove(z)
            else:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] for sensor group %s: zone %s has module %s that uses forecasting, skipping to avoid API calls that can incur costs",
                    mapping_id,ync_update_mapping(mapping_id, changes=changes)
                    z,
                    mod.get(const.MODULE_NAME),ping):
                )weather data for a given mapping and reset last updated timestamp.

        # remove weather data from this mapping unless there are zones we did not calculate!
        _LOGGER.debug(he mapping dictionary to clear weather data for.
            "[async_continuous_update_for_mapping] for sensor group %s: zones_to_calculate: %s. if this is empty this means that all zones for this sensor group have been calculated and therefore we can remove the weather data",
            mapping_id,
            zones_to_calculate,with cleared weather data and reset last updated timestamp.
        )
        if zones_to_calculate and len(zones_to_calculate) > 0:
            _LOGGER.debug(
                "[async_continuous_update_for_mapping] for sensor group %s: did not calculate all zones, keeping weather data for the sensor group",
                mapping_id,ATA_LAST_UPDATED: None,
            )
        else:
            _LOGGER.debug(calc_time(self, data):
                "clearing weather data for sensor group %s since we calculated all dependent zones","
                mapping_id,any existing track_time_changes
            )lf._track_auto_calc_time_unsub:
            changes = {}auto_calc_time_unsub()
            changes = self.clear_weatherdata_for_mapping(mapping)
            await self.store.async_update_mapping(mapping_id, changes=changes)
            # make sure to unsub any existing and add for calc time
    def clear_weatherdata_for_mapping(self, mapping)::
        """Clear weather data for a given mapping and reset last updated timestamp.sh of all modules of all zones that are on automatic
                timesplit = data[const.CONF_CALC_TIME].split(":")
        Args:   self._track_auto_calc_time_unsub = async_track_time_change(
            mapping: The mapping dictionary to clear weather data for.
                    self._async_calculate_all,
        Returns:    hour=timesplit[0],
            dict: A dictionary with cleared weather data and reset last updated timestamp.
                    second=0,
        """     )
        return {_LOGGER.info(
            const.MAPPING_DATA: [], calculate for %s", data[const.CONF_CALC_TIME]
            const.MAPPING_DATA_LAST_UPDATED: None,
        }   else:
                _LOGGER.warning(
    async def set_up_auto_calc_time(self, data):me is not valid: %s",
        """Set up the automatic calculation time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_calc_time_unsub:not a valid time")
            self._track_auto_calc_time_unsub()
            self._track_auto_calc_time_unsub = None
        if data[const.CONF_AUTO_CALC_ENABLED]:
            # make sure to unsub any existing and add for calc time
            if check_time(data[const.CONF_CALC_TIME]):
                # make sure we track this time and at that moment trigger the refresh of all modules of all zones that are on automatic
                timesplit = data[const.CONF_CALC_TIME].split(":")
                self._track_auto_calc_time_unsub = async_track_time_change(
                    self.hass,sync_update_config(data)
                    self._async_calculate_all,
                    hour=timesplit[0],elf, data):
                    minute=timesplit[1],me for Smart Irrigation based on configuration data."""
                    second=0,y existing track_time_changes
                )track_auto_clear_time_unsub:
                _LOGGER.info(clear_time_unsub()
                    "Scheduled auto calculate for %s", data[const.CONF_CALC_TIME]
                )onst.CONF_AUTO_CLEAR_ENABLED]:
            else:e sure to unsub any existing and add for clear time
                _LOGGER.warning(onst.CONF_CLEAR_TIME]):
                    "Scheduled auto calculate time is not valid: %s",
                    data[const.CONF_CALC_TIME],
                )elf._track_auto_clear_time_unsub = async_track_time_change(
                # raise ValueError("Time is not a valid time")
        else:       self._async_clear_all_weatherdata,
            # set OWM client cache to 0
            if self._WeatherServiceClient:
                self._WeatherServiceClient.cache_seconds = 0
            # remove all time trackers
            if self._track_auto_calc_time_unsub:
                self._track_auto_calc_time_unsub()erdata for %s",
                self._track_auto_calc_time_unsub = None
            await self.store.async_update_config(data)
            else:
    async def set_up_auto_clear_time(self, data):
        """Set up the automatic clear time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_clear_time_unsub:
            self._track_auto_clear_time_unsub() valid time")
            self._track_auto_clear_time_unsub = None
        if data[const.CONF_AUTO_CLEAR_ENABLED]:
            # make sure to unsub any existing and add for clear time
            if check_time(data[const.CONF_CLEAR_TIME]):t Irrigation based on configuration."""
                timesplit = data[const.CONF_CLEAR_TIME].split(":")
        # Fire-and-forget: trigger immediate update in background
                self._track_auto_clear_time_unsub = async_track_time_change(
                    self.hass,_interval
                    self._async_clear_all_weatherdata,
                    hour=timesplit[0],
                    minute=timesplit[1],UTO_UPDATE_INTERVAL])
                    second=0,TO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_DAILY:
                )ck time X days
                _LOGGER.info(timedelta(days=interval)
                    "Scheduled auto clear of weatherdata for %s",AUTO_UPDATE_HOURLY:
                    data[const.CONF_CLEAR_TIME],
                )ime_delta = timedelta(hours=interval)
            else:[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_MINUTELY:
                _LOGGER.warning(es
                    "Scheduled auto clear time is not valid: %s",
                    data[const.CONF_CLEAR_TIME],ta in seconds -1
                )WeatherServiceClient:
                raise ValueError("Time is not a valid time")
        await self.store.async_update_config(data)
            )
    async def track_update_time(self, *args):
        """Track and schedule periodic updates for Smart Irrigation based on configuration."""
        # perform update onceupdate_time_unsub()
        # Fire-and-forget: trigger immediate update in background
        self.hass.async_create_task(self._async_update_all())_interval(
        # use async_track_time_intervalte_all, the_time_delta
        data = await self.store.async_get_config()
        the_time_delta = Noneed auto update time interval for each %s", the_time_delta)
        interval = int(data[const.CONF_AUTO_UPDATE_INTERVAL])
        if data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_DAILY:
            # track time X days
            the_time_delta = timedelta(days=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_HOURLY:
            # track time X hoursNE_STATE) == const.ZONE_STATE_AUTOMATIC
            the_time_delta = timedelta(hours=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_MINUTELY:
            # track time X minutes
            the_time_delta = timedelta(minutes=interval)
        # update cache for OWMClient to time delta in seconds -1
        if self._WeatherServiceClient:hat use the specified mapping."""
            self._WeatherServiceClient.cache_seconds = (
                the_time_delta.total_seconds() - 1
            )or z in await self.store.async_get_zones()
            if z.get(const.ZONE_MAPPING) == mapping
        if self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = None
        self._track_auto_update_time_unsub = async_track_time_interval(re automatic here and store it.
            self.hass, self._async_update_all, the_time_deltaack and if there is none, we log an error, otherwise apply aggregate and use data
        ) this should skip any pure sensor zones if continuous updates is enabled, otherwise it should include them
        _LOGGER.info("Scheduled auto update time interval for each %s", the_time_delta)
        zones = await self.store.async_get_zones()
    async def _get_unique_mappings_for_automatic_zones(self, zones):es(zones)
        mappings = [the mappings and store sensor data
            zone.get(const.ZONE_MAPPING)
            for zone in zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
        ]       sensor_in_mapping,
        # remove duplicatesapping,
        return list(set(mappings))_sources(mapping_id=mapping_id)
            the_config = await self.store.async_get_config()
    async def _get_zones_that_use_this_mapping(self, mapping):nd not owm_in_mapping:
        """Return a list of zone IDs that use the specified mapping."""update the mappings here for pure sensor mappings
        return [_LOGGER.debug(
            z.get(const.ZONE_ID)updates are enabled, skipping update for sensor group %s because it is not dependent on weather service and should already be included in the continuous updates",
            for z in await self.store.async_get_zones()
            if z.get(const.ZONE_MAPPING) == mapping
        ]       continue
            _LOGGER.debug(
    async def _async_update_all(self, *args):ed, but updating sensor group %s as part of scheduled updates because it is dependent on weather service and therefore is not included in continuous updates",
        # update the weather data for all mappings for all zones that are automatic here and store it.
        # in _async_calculate_all we need to read that data back and if there is none, we log an error, otherwise apply aggregate and use data
        # this should skip any pure sensor zones if continuous updates is enabled, otherwise it should include them
        _LOGGER.info("Updating weather data for all automatic zones")
        zones = await self.store.async_get_zones()_mapping:
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        # loop over the mappings and store sensor datad_executor_job(
        for mapping_id in mappings:rviceClient.get_data
            (   )
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,lf.build_sensor_values_for_mapping(mapping)
            ) = self.check_mapping_sources(mapping_id=mapping_id)nsor_values(
            the_config = await self.store.async_get_config()
            if the_config.get(const.CONF_CONTINUOUS_UPDATES) and not owm_in_mapping:
                # if continuous updates are enabled, we do not need to update the mappings here for pure sensor mappings
                _LOGGER.debug(= self.build_static_values_for_mapping(mapping)
                    "Continuous updates are enabled, skipping update for sensor group %s because it is not dependent on weather service and should already be included in the continuous updates",
                    mapping_id,, static_values
                )
                continue_mapping or static_in_mapping:
            _LOGGER.debug(ure type is set to relative, replace it with absolute. not necessary for OWM as it already happened
                "Continuous updates are enabled, but updating sensor group %s as part of scheduled updates because it is dependent on weather service and therefore is not included in continuous updates",
                mapping_id,
            )       mapping.get(const.MAPPING_MAPPINGS)
            mapping = self.store.get_mapping(mapping_id)
            weatherdata = None.MAPPING_CONF_PRESSURE_TYPE)
            if self.use_weather_service and owm_in_mapping:
                # retrieve data from OWM
                weatherdata = await self.hass.async_add_executor_job(
                    self._WeatherServiceClient.get_dataURE] = (
                )           relative_to_absolute_pressure(
                                weatherdata[const.MAPPING_PRESSURE],
            if sensor_in_mapping:elf.hass.config.as_dict().get(CONF_ELEVATION),
                sensor_values = self.build_sensor_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, sensor_values
                )       weatherdata[const.MAPPING_PRESSURE] = altitudeToPressure(
            if static_in_mapping:hass.config.as_dict().get(CONF_ELEVATION)
                static_values = self.build_static_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, static_values mappings sensor values
                )pping is not None and weatherdata is not None:
            if sensor_in_mapping or static_in_mapping:time.datetime.now()
                # if pressure type is set to relative, replace it with absolute. not necessary for OWM as it already happened
                # convert the relative pressure to absolute or estimate from height
                if (mapping_data.append(weatherdata)
                    mapping.get(const.MAPPING_MAPPINGS)
                    .get(const.MAPPING_PRESSURE)
                    .get(const.MAPPING_CONF_PRESSURE_TYPE)
                    == const.MAPPING_CONF_PRESSURE_RELATIVE
                ):      "[async_update_all]: sensor group is unexpected type: %s",
                    if const.MAPPING_PRESSURE in weatherdata:
                        weatherdata[const.MAPPING_PRESSURE] = (
                            relative_to_absolute_pressure(
                                weatherdata[const.MAPPING_PRESSURE],: %s",
                                self.hass.config.as_dict().get(CONF_ELEVATION),
                            )ta,
                        )
                    else: {
                        weatherdata[const.MAPPING_PRESSURE] = altitudeToPressure(
                            self.hass.config.as_dict().get(CONF_ELEVATION)(),
                        )
                await self.store.async_update_mapping(mapping_id, changes)
            # add the weatherdata value to the mappings sensor values zone here.
            if mapping is not None and weatherdata is not None:
                weatherdata[const.RETRIEVED_AT] = datetime.datetime.now()AST_UPDATED],
                mapping_data = mapping[const.MAPPING_DATA]mapping_data) - 1,
                if isinstance(mapping_data, list):
                    mapping_data.append(weatherdata)s_that_use_this_mapping(mapping_id)
                elif isinstance(mapping_data, str):
                    mapping_data = [weatherdata]e_zone(z, changes_to_zone)
                else:sync_dispatcher_send(
                    _LOGGER.error(
                        "[async_update_all]: sensor group is unexpected type: %s",
                        mapping_data,
                    )
                _LOGGER.debug(
                    "async_update_all for mapping %s new weatherdata: %s",
                    mapping_id,ning(
                    weatherdata,update_all] Unable to find sensor group with id: %s",
                )       mapping_id,
                changes = {
                    "data": mapping_data,
                    const.MAPPING_DATA_LAST_UPDATED: datetime.datetime.now(),
                }       "[async_update_all] No weather data to parse for sensor group %s",
                await self.store.async_update_mapping(mapping_id, changes)
                # store last updated and number of data points in the zone here.
                changes_to_zone = {
                    const.ZONE_LAST_UPDATED: changes[const.MAPPING_DATA_LAST_UPDATED],
                    const.ZONE_NUMBER_OF_DATA_POINTS: len(mapping_data) - 1,nce to sensor values.
                }
                zones_to_loop = await self._get_zones_that_use_this_mapping(mapping_id)
                for z in zones_to_loop:nary or None.
                    await self.store.async_update_zone(z, changes_to_zone)
                    async_dispatcher_send(
                        self.hass,
                        const.DOMAIN + "_config_updated",overriding weather data where keys overlap.
                        z,
                    )
            else:None:
                if mapping is None:
                    _LOGGER.warning(
                        "[async_update_all] Unable to find sensor group with id: %s",
                        mapping_id,
                    )in sv.items():
                if weatherdata is None:
                    _LOGGER.warning(
                        "[async_update_all] No weather data to parse for sensor group %s",with %s from sensors",
                        mapping_id,
                    )etval[key],
                    val,
    async def merge_weatherdata_and_sensor_values(self, wd, sv):
        """Merge weather data and sensor values dictionaries, giving precedence to sensor values.
                _LOGGER.debug(
        Args:       "merge_weatherdata_and_sensor_values, adding %s value %s from sensors",
            wd: The weather data dictionary or None.
            sv: The sensor values dictionary or None.
                )
        Returns:al[key] = val
            dict: A merged dictionary with sensor values overriding weather data where keys overlap.
        return retval
        """
        if wd is None:gregates_to_mapping_data(
            return svapping, continuous_updates=False
        if sv is None:
            return wdegation functions to mapping data and return the aggregated result.
        retval = wd
        for key, val in sv.items():
            if key in retval:ctionary for which to aggregate mapping data.
                _LOGGER.debug(ng dictionary containing sensor data.
                    "merge_weatherdata_and_sensor_values, overriding %s value %s from OWM with %s from sensors",
                    key,
                    retval[key],
                    val,: Aggregated mapping data or None if no data is available.
                )
            else:
                _LOGGER.debug(
                    "merge_weatherdata_and_sensor_values, adding %s value %s from sensors",
                    key,
                    val,onst.MAPPING_DATA) is None:
                )n None
            retval[key] = val
        data = mapping.get(const.MAPPING_DATA)
        return retval(
            "[apply_aggregates_to_mapping_data]: there is mapping data: %s", data
    async def apply_aggregates_to_mapping_data(
        self, zone, mapping, continuous_updates=Falseata)
    ):  resultdata = {}
        """Apply aggregation functions to mapping data and return the aggregated result.
        self._handle_retrieved_at(data_by_sensor, zone, resultdata, continuous_updates)
        Args:_aggregate_sensor_data(data_by_sensor, mapping, resultdata)
            zone: The zone dictionary for which to aggregate mapping data.
            mapping: The mapping dictionary containing sensor data.
            continuous_updates: Whether continuous updates are enabled.sultdata)
        return resultdata
        Returns:
            dict or None: Aggregated mapping data or None if no data is available.
        """Group mapping data by sensor key."""
        """a_by_sensor = {}
        _LOGGER.debug(
            "[apply_aggregates_to_mapping_data]: zone: %s mapping: %s", zone, mapping
        )       for key, val in d.items():
        if mapping.get(const.MAPPING_DATA) is None:
            return None data_by_sensor.setdefault(key, []).append(val)
        # Drop MAX and MIN temp mapping because we calculate it from temp
        data = mapping.get(const.MAPPING_DATA)EMP, None)
        _LOGGER.debug(.pop(const.MAPPING_MIN_TEMP, None)
            "[apply_aggregates_to_mapping_data]: there is mapping data: %s", data
        )
        data_by_sensor = self._group_data_by_sensor(data)
        resultdata = {}ensor, zone, resultdata, continuous_updates
    ):
        self._handle_retrieved_at(data_by_sensor, zone, resultdata, continuous_updates)
        self._aggregate_sensor_data(data_by_sensor, mapping, resultdata)
        self._fill_missing_from_last_entry(mapping, resultdata)
        retrieved_ats = data_by_sensor.pop(const.RETRIEVED_AT)
        _LOGGER.debug("apply_aggregates_to_mapping_data returns %s", resultdata)
        return resultdatag = "%Y-%m-%dT%H:%M:%S.%f"
        formatted_retrieved_ats = []
    def _group_data_by_sensor(self, data):
        """Group mapping data by sensor key."""me):
        data_by_sensor = {}etrieved_ats.append(item)
        for d in data:tance(item, str):
            if isinstance(d, dict):_ats.append(
                for key, val in d.items():time(item, date_format_string)
                    if val is not None:
                        data_by_sensor.setdefault(key, []).append(val)
        # Drop MAX and MIN temp mapping because we calculate it from temp
        data_by_sensor.pop(const.MAPPING_MAX_TEMP, None)
        data_by_sensor.pop(const.MAPPING_MIN_TEMP, None)
        return data_by_sensorates:
            last_calc_val = zone.get(const.ZONE_LAST_CALCULATED)
    def _handle_retrieved_at(e difference between last calculation an previous calculation
        self, data_by_sensor, zone, resultdata, continuous_updates
    ):          if isinstance(last_calc_val, str):
        """Process retrieved_at timestamps and update resultdata with multiplier."""
        if const.RETRIEVED_AT not in data_by_sensor:e.datetime.fromisoformat(
            return          last_calc_val
        retrieved_ats = data_by_sensor.pop(const.RETRIEVED_AT)
        hour_multiplier = 1.0lueError:
        date_format_string = "%Y-%m-%dT%H:%M:%S.%f"me.datetime.strptime(
        formatted_retrieved_ats = []c_val, "%Y-%m-%dT%H:%M:%S"
        for item in retrieved_ats:
            if isinstance(item, datetime.datetime):
                formatted_retrieved_ats.append(item)al
            elif isinstance(item, str):
                formatted_retrieved_ats.append(ed_retrieved_ats)
                    datetime.datetime.strptime(item, date_format_string)
                )LOGGER.debug(
        if not formatted_retrieved_ats:_at]: last_calculated_dt: %s, last_retrieved_at: %s",
            return  last_calculated_dt,
                    last_retrieved_at,
        diff = None
        if not continuous_updates:
            last_calc_val = zone.get(const.ZONE_LAST_CALCULATED)calculation
            # try to calculate difference between last calculation an previous calculation
            if last_calc_val:d_at = max(formatted_retrieved_ats)
                if isinstance(last_calc_val, str):etrieved_at
                    try:debug(
                        last_calculated_dt = datetime.datetime.fromisoformat(rieved_at: %s",
                            last_calc_val
                        )retrieved_at,
                    except ValueError:
                        last_calculated_dt = datetime.datetime.strptime(
                            last_calc_val, "%Y-%m-%dT%H:%M:%S"alculation to now
                        )nst.ZONE_LAST_CALCULATED]
                else:l:
                    last_calculated_dt = last_calc_val
                    "[_handle_retrieved_at]: zone has never been calculated, skipping"
                last_retrieved_at = max(formatted_retrieved_ats)
                diff = last_retrieved_at - last_calculated_dt
                _LOGGER.debug( datetime.datetime):
                    "[_handle_retrieved_at]: last_calculated_dt: %s, last_retrieved_at: %s",
                    last_calculated_dt,
                    last_retrieved_at,
                ) string format, parse to datetime
            else:ast_zone_calc = datetime.datetime.strptime(val, date_format_string)
                # Fallback for first startup without a previous calculation
                first_retrieved_at = min(formatted_retrieved_ats)
                last_retrieved_at = max(formatted_retrieved_ats)s",
                diff = last_retrieved_at - first_retrieved_at
                _LOGGER.debug(
                    "[_handle_retrieved_at]: first_retrieved_at: %s, last_retrieved_at: %s",
                    first_retrieved_at,ays
                    last_retrieved_at,_seconds() / 3600)
                )iplier = diff_in_hours / 24
        else:tdata[const.MAPPING_DATA_MULTIPLIER] = hour_multiplier
            # for continuous updates, use interval from last calculation to now
            val = zone[const.ZONE_LAST_CALCULATED]_in_seconds: %s, diff_in_hours: %s, hour_multiplier: %s",
            if not val:
                _LOGGER.debug((),
                    "[_handle_retrieved_at]: zone has never been calculated, skipping"
                )multiplier,
                return
            if isinstance(val, datetime.datetime):
                # already in datetime format_sensor, mapping, resultdata):
                last_zone_calc = valconfigured or default aggregate."""
            else:d in data_by_sensor.items():
                # string format, parse to datetime
                last_zone_calc = datetime.datetime.strptime(val, date_format_string)s, len(d): %s",
            diff = datetime.datetime.now() - last_zone_calc
            _LOGGER.debug(
                "[_handle_retrieved_at]: zone last calculated: %s",
                last_zone_calc,
            )f len(d) > 1:
                d = [float(i) for i in d]
        # Get interval in hours, then days
        diff_in_hours = abs(diff.total_seconds() / 3600) after conversion to float: applying aggregate to %s with values %s",
        hour_multiplier = diff_in_hours / 24
        resultdata[const.MAPPING_DATA_MULTIPLIER] = hour_multiplier
        _LOGGER.debug(
            "[_handle_retrieved_at]: diff: %s diff_in_seconds: %s, diff_in_hours: %s, hour_multiplier: %s",
            diff,f key == const.MAPPING_PRECIPITATION:
            diff.total_seconds(),
            diff_in_hours,nst.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
            hour_multiplier,
        )       elif key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = max(d)
    def _aggregate_sensor_data(self, data_by_sensor, mapping, resultdata):
        """Aggregate sensor data by configured or default aggregate."""
        for key, d in data_by_sensor.items():
            _LOGGER.debug(ate = mappings[key].get(
                "[apply_aggregates_to_mapping_data]: aggregation loop: key: %s, d: %s, len(d): %s",
                key,    aggregate,
                d,  )
                len(d),.debug(
            )       "[async_aggregate_to_mapping_data]: key: %s, aggregate: %s, data: %s",
            if len(d) > 1:
                d = [float(i) for i in d]
                _LOGGER.debug(
                    "[apply_aggregates_to_mapping_data]: after conversion to float: applying aggregate to %s with values %s",
                    key,gate == const.MAPPING_CONF_AGGREGATE_AVERAGE:
                    d,sultdata[key] = statistics.mean(d)
                )lif aggregate == const.MAPPING_CONF_AGGREGATE_FIRST:
                aggregate = const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT
                if key == const.MAPPING_PRECIPITATION:GGREGATE_LAST:
                    aggregate = (y] = d[-1]
                        const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
                    )esultdata[key] = max(d)
                elif key == const.MAPPING_TEMPERATURE:GGREGATE_MINIMUM:
                    resultdata[const.MAPPING_MAX_TEMP] = max(d)
                    resultdata[const.MAPPING_MIN_TEMP] = min(d)MEDIAN:
                mappings = mapping.get(const.MAPPING_MAPPINGS, {})
                if key in mappings:onst.MAPPING_CONF_AGGREGATE_SUM:
                    aggregate = mappings[key].get(
                        const.MAPPING_CONF_AGGREGATE,AGGREGATE_RIEMANNSUM:
                        aggregate,emann sum to the data in d
                    ) Use the trapezoidal rule for Riemann sum approximation
                _LOGGER.debug(ach value in d is sampled at equal intervals
                    "[async_aggregate_to_mapping_data]: key: %s, aggregate: %s, data: %s",
                    key,resultdata[key] = float(d[0])
                    aggregate,
                    d,  # Trapezoidal rule: sum((d[i] + d[i+1]) / 2) * dt
                )       # dt is the interval between samples, assume 1 if not available
                if aggregate == const.MAPPING_CONF_AGGREGATE_AVERAGE:
                    resultdata[key] = statistics.mean(d)m to get dt
                elif aggregate == const.MAPPING_CONF_AGGREGATE_FIRST:
                    resultdata[key] = d[0]ata_by_sensor[const.RETRIEVED_AT]
                elif aggregate == const.MAPPING_CONF_AGGREGATE_LAST:
                    resultdata[key] = d[-1]
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MAXIMUM:
                    resultdata[key] = max(d)mat_string = "%Y-%m-%dT%H:%M:%S.%f"
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MINIMUM:
                    resultdata[key] = min(d) timestamps:
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MEDIAN:time):
                    resultdata[key] = statistics.median(d))
                elif aggregate == const.MAPPING_CONF_AGGREGATE_SUM:
                    resultdata[key] = sum(d)times.append(
                elif aggregate == const.MAPPING_CONF_AGGREGATE_RIEMANNSUM:(
                    # apply the riemann sum to the data in dformat_string
                    # Use the trapezoidal rule for Riemann sum approximation
                    # Assume each value in d is sampled at equal intervals
                    if len(d) < 2:  # Calculate average dt in seconds
                        resultdata[key] = float(d[0]):
                    else:               dts = [
                        # Trapezoidal rule: sum((d[i] + d[i+1]) / 2) * dtal_seconds()
                        # dt is the interval between samples, assume 1 if not available
                        dt = 1.0        ]
                        # If we have timestamps, use them to get dt
                        if const.RETRIEVED_AT in data_by_sensor:s err:
                            timestamps = data_by_sensor[const.RETRIEVED_AT]
                            if len(timestamps) == len(d):timestamps for Riemann sum: %s",
                                try:    err,
                                    # Convert all to datetime
                                    date_format_string = "%Y-%m-%dT%H:%M:%S.%f"
                                    times = []
                                    for t in timestamps:
                                        if isinstance(t, datetime.datetime):
                                            times.append(t)
                                        elif isinstance(t, str):
                                            times.append(
                                                datetime.datetime.strptime(
                                                    t, date_format_string
                                                )
                                            )
                                    # Calculate average dt in seconds
                                    if len(times) > 1:ntry data."""
                                        dts = [DATA_LAST_ENTRY)
                                            (times[i + 1] - times[i]).total_seconds()
                                            for i in range(len(times) - 1) group: %s: %s",
                                        ],
                                        dt = statistics.mean(dts)
                                except (ValueError, TypeError) as err:
                                    _LOGGER.debug(
                                        "Failed to parse timestamps for Riemann sum: %s",
                                        err,
                                    )
                        # Calculate the sum
                        riemann_sum = 0.0mapping_data]: %s is missing from resultdata, adding %s from last entry",
                        for i in range(len(d) - 1):
                            riemann_sum += ((d[i] + d[i + 1]) / 2) * dt
                        resultdata[key] = riemann_sum
            else:esultdata[key] = val
                if key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = d[0]
                    resultdata[const.MAPPING_MIN_TEMP] = d[0]
                resultdata[key] = float(d[0])
    async def _async_clear_all_weatherdata(self, *args):
    def _fill_missing_from_last_entry(self, mapping, resultdata):
        """Fill missing keys in resultdata from last entry data."""
        last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
        _LOGGER.debug({}
            "[async_aggregate_to_mapping_data]: last entry data for sensor group: %s: %s",
            mapping.get(const.MAPPING_ID),mapping(
            last_entry,.get(const.MAPPING_ID), changes
        )   )
        if not last_entry:
            returnnc_calculate_all(self, delete_weather_data=True, *args):
        for key, val in last_entry.items():atic zones")
            if key not in resultdata:utomatic and for all of those, loop over the unique list of mappings
                _LOGGER.debug(g OWM / sensors?
                    "[async_aggregate_to_mapping_data]: %s is missing from resultdata, adding %s from last entry",
                    key, = await self.store.async_get_zones()
                    val,
                )er zones that use pure sensors (not weather service) if continuous updates are enabled
                resultdata[key] = val.async_get_config()
                if key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = val
                    resultdata[const.MAPPING_MIN_TEMP] = val
                "Continuous updates are enabled, filtering out pure sensor zones"
    async def _async_clear_all_weatherdata(self, *args):
        _LOGGER.info("Clearing all weatherdata")it uses a weather service
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:et(const.ZONE_MAPPING)
            changes = {}service_in_mapping, sensor_in_mapping, static_in_mapping = (
            changes = self.clear_weatherdata_for_mapping(mapping)_id)
            await self.store.async_update_mapping(
                mapping.get(const.MAPPING_ID), changes
            )       _LOGGER.debug(
                        "[async_calculate_all]: zone %s uses a weather service so should be included in the calculation even though continuous updates are on",
    async def _async_calculate_all(self, delete_weather_data=True, *args):
        _LOGGER.info("Calculating all automatic zones")
        # get all zones that are in automatic and for all of those, loop over the unique list of mappings
        # are any modules using OWM / sensors?
                    _LOGGER.debug(
        unfiltered_zones = await self.store.async_get_zones() %s from calculation because it uses a pure sensor mapping and continuous updates are enabled",
                        z.get(const.ZONE_ID),
        # skip over zones that use pure sensors (not weather service) if continuous updates are enabled
        the_config = await self.store.async_get_config()
        zones = []eed to filter, continue with unfiltered zones
        if the_config.get(const.CONF_CONTINUOUS_UPDATES):
            _LOGGER.debug(
                "Continuous updates are enabled, filtering out pure sensor zones"
            )o, s, sv = self.check_mapping_sources(mapping_id = mapping_id)
            # filter zones and only add zone if it uses a weather service
            for z in unfiltered_zones:
                mapping_id = z.get(const.ZONE_MAPPING)
                weather_service_in_mapping, sensor_in_mapping, static_in_mapping = (
                    self.check_mapping_sources(mapping_id=mapping_id)
                )herdata = await self.hass.async_add_executor_job(self._OWMClient.get_data)
                if weather_service_in_mapping:
                    _LOGGER.debug(ulate
                        "[async_calculate_all]: zone %s uses a weather service so should be included in the calculation even though continuous updates are on",
                        z.get(const.ZONE_ID),const.ZONE_STATE_AUTOMATIC:
                    ) self.async_calculate_zone(zone.get(const.ZONE_ID))
                    zones.append(z)all mappings used
                else:ther_data:
                    _LOGGER.debug(_get_unique_mappings_for_automatic_zones(zones)
                        "[async_calculate_all]: Skipping zone %s from calculation because it uses a pure sensor mapping and continuous updates are enabled",
                        z.get(const.ZONE_ID),ping
                    )es = {}
        else:   changes[const.MAPPING_DATA] = []
            # no need to filter, continue with unfiltered zones
            zones = unfiltered_zones.async_update_mapping(mapping_id, changes=changes)

        # for mapping_id in mappings:
        #    o, s, sv = self.check_mapping_sources(mapping_id = mapping_id)l")
        #    if o:.register_start_event()
        #        owm_in_mapping = True
        # at least part of the data comes from OWMcontinuous_updates=False):
        # if self.use_OWM and owm_in_mapping:specific zone.
        #    # data comes at least partly from owm
        #    weatherdata = await self.hass.async_add_executor_job(self._OWMClient.get_data)
            zone_id: The ID of the zone to calculate.
        # loop over zones and calculate to use continuous updates for calculation.
        for zone in zones:
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC:
                await self.async_calculate_zone(zone.get(const.ZONE_ID))id)
        # remove mapping data from all mappings used
        if delete_weather_data:.ZONE_MAPPING]
            mappings = await self._get_unique_mappings_for_automatic_zones(zones)_id)
            for mapping_id in mappings:recast o_i_m needs to be set to true!
                # remove sensor data from mappingD(zone.get(const.ZONE_MODULE))
                changes = {}
                changes[const.MAPPING_DATA] = []nd modinst.forecast_days > 0:
                if mapping_id is not None:
                    await self.store.async_update_mapping(mapping_id, changes=changes)
                forecastdata = await self.hass.async_add_executor_job(
        # update start_eventatherServiceClient.get_forecast_data
        _LOGGER.debug("calling register start event from async_calculate_all")
        await self.register_start_event()d forecast data: %s", forecastdata)
            else:
    async def async_calculate_zone(self, zone_id, continuous_updates=False):
        """Calculate irrigation values for a specific zone.nfigured forecasting but there is no OWM API configured. Either configure the OWM API or stop using forecasting on the PyETO module",
                    zone.get(const.ZONE_NAME),
        Args:   )
            zone_id: The ID of the zone to calculate.
            continuous_updates: Whether to use continuous updates for calculation.
        # if there is sensor data on the mapping, apply aggregates to it.
        """sor_values = None
        _LOGGER.debug("async_calculate_zone: Calculating zone %s", zone_id)
        zone = self.store.get_zone(zone_id)g and mapping.get(const.MAPPING_DATA):
        mapping_id = zone[const.ZONE_MAPPING]ply_aggregates_to_mapping_data(
        # o_i_m, s_i_m, sv_in_m = self.check_mapping_sources(mapping_id = mapping_id)
        # if using pyeto and using a forecast o_i_m needs to be set to true!
        modinst = await self.getModuleInstanceByID(zone.get(const.ZONE_MODULE))
        forecastdata = None we convert forecast data pressure to absolute!
        if modinst and modinst.name == "PyETO" and modinst.forecast_days > 0:
            if self.use_weather_service:nsor_values, forecastdata=forecastdata
                # get forecast info from OWM
                forecastdata = await self.hass.async_add_executor_job(ime to set the last updated time
                    self._WeatherServiceClient.get_forecast_data
                )   data[const.ZONE_LAST_UPDATED] = datetime.datetime.now()
                # _LOGGER.debug("Retrieved forecast data: %s", forecastdata)
            else:wait self.store.async_update_zone(zone.get(const.ZONE_ID), data)
                _LOGGER.error(er_send(
                    "Error calculating zone %s. You have configured forecasting but there is no OWM API configured. Either configure the OWM API or stop using forecasting on the PyETO module",
                    zone.get(const.ZONE_NAME),dated",
                )   zone.get(const.ZONE_ID),
                return
        mapping = self.store.get_mapping(mapping_id)st.DOMAIN + "_update_frontend")
        # if there is sensor data on the mapping, apply aggregates to it.
        sensor_values = None calculate with!
        if mapping is not None:(
            if const.MAPPING_DATA in mapping and mapping.get(const.MAPPING_DATA):
                sensor_values = await self.apply_aggregates_to_mapping_data(
                    zone, mapping, continuous_updates
                )
            if sensor_values:
                # make sure we convert forecast data pressure to absolute!ied",
                data = await self.calculate_module(
                    zone, weatherdata=sensor_values, forecastdata=forecastdata
                )
                # if continuous updates are on, add the current date time to set the last updated time
                if continuous_updates:module by its ID.
                    data[const.ZONE_LAST_UPDATED] = datetime.datetime.now()
        Args:
                await self.store.async_update_zone(zone.get(const.ZONE_ID), data)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",f not found.
                    zone.get(const.ZONE_ID),
                )
                async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")
            else:one:
                # no data to calculate with!
                _LOGGER.warning(cally
                    "Calculate for zone %s failed: no data available",st.MODULE_DIR)
                    zone.get(const.ZONE_NAME),
                )n mods:
        else:f mods[mod]["class"] == m[const.MODULE_NAME]:
            _LOGGER.warning(attr(mods[mod]["module"], mods[mod]["class"])
                "Calculate for zone %s failed: invalid sensor group specified",
                zone.get(const.ZONE_NAME),=m["description"], config=m["config"]
            )   )
                break
    async def getModuleInstanceByID(self, module_id):
        """Retrieve and instantiate a module by its ID.
    async def calculate_module(self, zone, weatherdata, forecastdata):
        Args:lculate irrigation values for a zone using the specified weather and forecast data.
            module_id: The ID of the module to retrieve.
        Args:
        Returns:: The zone dictionary containing configuration and state.
            The instantiated module object, or None if not found.ion.
            forecastdata: Forecast data if required by the module.
        """
        m = self.store.get_module(module_id)
        if m is None:ated zone data including calculation results and explanation.
            return None
        # load the module dynamically
        mods = await self.hass.async_add_executor_job(loadModules, const.MODULE_DIR)
        modinst = Noneg("[calculate_module] for zone: %s, weatherdata: %s, forecastdata: %s", zone, weatherdata, forecastdata)
        for mod in mods:t(const.ZONE_MODULE)
            if mods[mod]["class"] == m[const.MODULE_NAME]:
                themod = getattr(mods[mod]["module"], mods[mod]["class"])
                modinst = themod(
                    self.hass, description=m["description"], config=m["config"]
                )= 0
                breakmetric = self.hass.config.units is METRIC_SYSTEM
        return modinstget(const.ZONE_BUCKET)
        maximum_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
    async def calculate_module(self, zone, weatherdata, forecastdata):
        """Calculate irrigation values for a zone using the specified weather and forecast data.
            if zone.get(const.ZONE_MAXIMUM_BUCKET) is not None:
        Args:   maximum_bucket = convert_between(
            zone: The zone dictionary containing configuration and state.AXIMUM_BUCKET)
            weatherdata: Aggregated weather data for the calculation.
            forecastdata: Forecast data if required by the module.
        data[const.ZONE_OLD_BUCKET] = bucket
        Returns:ion = ""
            dict: Updated zone data including calculation results and explanation.
        hour_multiplier = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 1.0)
        """
        _LOGGER.debug("calculate_module for zone: %s", zone)
        # _LOGGER.debug("[calculate_module] for zone: %s, weatherdata: %s, forecastdata: %s", zone, weatherdata, forecastdata)
        mod_id = zone.get(const.ZONE_MODULE)sensor we don't need to call OWM to get it.
        m = self.store.get_module(mod_id)ne:
        if m is None:precip = self._OWMClient.get_precipitation(weatherdata)
            return None
        modinst = await self.getModuleInstanceByID(mod_id)
        # precip = 0st.MODULE_NAME] == "PyETO":
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEMj/m2/day and wind speed in m/s
        bucket = zone.get(const.ZONE_BUCKET)
        maximum_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
        if not ha_config_is_metric:atherdata,
            bucket = convert_between(const.UNIT_INCH, const.UNIT_MM, bucket)
            if zone.get(const.ZONE_MAXIMUM_BUCKET) is not None:
                maximum_bucket = convert_between(
                    const.UNIT_INCH, const.UNIT_MM, zone.get(const.ZONE_MAXIMUM_BUCKET)
                )elta = modinst.calculate()
        data = {}m[const.MODULE_NAME] == "Passthrough":
        data[const.ZONE_OLD_BUCKET] = bucketIRATION in weatherdata:
        explanation = ""a = 0 - modinst.calculate(
                        et_data=weatherdata[const.MAPPING_EVAPOTRANSPIRATION]
        hour_multiplier = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 1.0)
                else:
        if modinst: _LOGGER.error(
            # if m[const.MODULE_NAME] == "PyETO":lue provided for Passthrough module for zone %s",
            # if we have precip info from a sensor we don't need to call OWM to get it.
            # if precip_from_sensor is None:
            #        precip = self._OWMClient.get_precipitation(weatherdata)
            # else:5: temporarily removing all rounds to see if we can find the math issue reported in #186
            #    precip = precip_from_sensord(bucket+delta,1)
            if m[const.MODULE_NAME] == "PyETO":lta,1)
                # pyeto expects pressure in hpa, solar radiation in mj/m2/day and wind speed in m/s
            data[const.ZONE_DELTA] = delta
                delta = modinst.calculate(le]: new delta: %s", delta)
                    weather_data=weatherdata,
                    forecast_data=forecastdata,
                    hour_multiplier=hour_multiplier,cket with that.
                ) water above maximum is removed with runoff / bypass flow.
            elif m[const.MODULE_NAME] == "Static":ucket > maximum_bucket:
                delta = modinst.calculate()ucket)
            elif m[const.MODULE_NAME] == "Passthrough":
                if const.MAPPING_EVAPOTRANSPIRATION in weatherdata:of maximum bucket: %s",
                    delta = 0 - modinst.calculate(
                        et_data=weatherdata[const.MAPPING_EVAPOTRANSPIRATION]
                    )us_delta_capped = newbucket
                else:
                    _LOGGER.error(nto account
                        "No evapotranspiration value provided for Passthrough module for zone %s",
                        zone.get(const.ZONE_NAME),
                    )age_rate = 0.0
                    return None_metric:
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            # data[const.ZONE_BUCKET] = round(bucket+delta,1)our
            # data[const.ZONE_DELTA] = round(delta,1)
            _LOGGER.debug("[calculate-module]: retrieved from module: %s", delta)
            data[const.ZONE_DELTA] = delta
            _LOGGER.debug("[calculate-module]: new delta: %s", delta)ainage_rate)
            newbucket = bucket + deltaove field capacity (bucket > 0)
            drainage = 0
            # if maximum bucket configured, limit bucket with that.
            # any water above maximum is removed with runoff / bypass flow.rainage_rate
            if maximum_bucket is not None and newbucket > maximum_bucket:elow that point.
                newbucket = float(maximum_bucket)gnore this relationship and just
                _LOGGER.debug(onstant rate.
                    "[calculate-module]: capped new bucket because of maximum bucket: %s",
                    newbucket,ket is not None and maximum_bucket > 0:
                )   # gamma is set by uniformity of soil particle size,
            bucket_plus_delta_capped = newbucketoximation.
                    gamma = 2
            # take drainage rate into accountmaximum_bucket) ** (
            drainage_rate = zone.get(const.ZONE_DRAINAGE_RATE, 0.0)
            if drainage_rate is None:
                drainage_rate = 0.0culate-module]: current_drainage: %s", drainage)
            if not ha_config_is_metric:ucket - drainage)
                # drainage_rate is in inch/h since HA is not in metric, so we need to adjust those first!
                # using inch and mm here since both are per hour
                drainage_rate = convert_between(ewbucket: %s", newbucket)
                    const.UNIT_INCH, const.UNIT_MM, drainage_rate
                )ER.error("Unknown module for zone %s", zone.get(const.ZONE_NAME))
            _LOGGER.debug("[calculate-module]: drainage_rate: %s", drainage_rate)
            # drainage only applies above field capacity (bucket > 0)
            drainage = 0ze(
            if newbucket > 0:lation.explanation.module-returned-evapotranspiration-deficiency",
                # drainage rate is related to water level, such that full drainage_rate
                # occurs at saturation (maximum_bucket), but is reduced below that point.
                # if maximum_bucket is not set, ignore this relationship and just
                # drain at a constant rate.
                drainage = drainage_rate * hour_multiplier * 24
                if maximum_bucket is not None and maximum_bucket > 0:
                    # gamma is set by uniformity of soil particle size,config.language
                    # but 2 is a reasonable approximation.
                    gamma = 2ZONE_OLD_BUCKET]:.2f}"
                    drainage *= (newbucket / maximum_bucket) ** (
                        (2 + 3 * gamma) / gamma
                    )
                _LOGGER.debug("[calculate-module]: current_drainage: %s", drainage)
                newbucket = max(0, newbucket - drainage)bucket-is",
                self.hass.config.language,
            data[const.ZONE_CURRENT_DRAINAGE] = drainage
            _LOGGER.debug("[calculate-module]: newbucket: %s", newbucket)
        else:
            _LOGGER.error("Unknown module for zone %s", zone.get(const.ZONE_NAME))
            return None
        explanation = (alize(
            await localize(culation.explanation.drainage-rate-is",
                "module.calculation.explanation.module-returned-evapotranspiration-deficiency",
                self.hass.config.language,
            ) f" {float(drainage_rate):.1f}.<br/>"
            + f" {data[const.ZONE_DELTA]:.2f}. "
        )
        explanation += (calized strings here for cleaner code below
            await localize(ocalize(
                "module.calculation.explanation.bucket-was", self.hass.config.language
            )
            + f" {data[const.ZONE_OLD_BUCKET]:.2f}"
        )   "module.calculation.explanation.drainage", self.hass.config.language
        explanation += (
            ".<br/>"e_loc = await localize(
            + await localize(on.explanation.drainage-rate", self.hass.config.language
                "module.calculation.explanation.maximum-bucket-is",
                self.hass.config.language,
            )module.calculation.explanation.delta", self.hass.config.language
            + f" {float(maximum_bucket):.1f}"
        )ld_bucket_loc = await localize(
        explanation += (ulation.explanation.old-bucket-variable",
            ".<br/>"s.config.language,
            + await localize(
                "module.calculation.explanation.drainage-rate-is",
                self.hass.config.language,n.max-bucket-variable",
            )elf.hass.config.language,
            + f" {float(drainage_rate):.1f}.<br/>"
        )
        if bucket_plus_delta_capped <= 0:
        # Define some localized strings here for cleaner code below
        hours_loc = await localize(
            "module.calculation.explanation.hours", self.hass.config.language
        )           self.hass.config.language,
        drainage_loc = await localize(
            "module.calculation.explanation.drainage", self.hass.config.languageLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f} = {bucket_plus_delta_capped:.2f})"
        )   )
        drainage_rate_loc = await localize(
            "module.calculation.explanation.drainage-rate", self.hass.config.language
        )       "module.calculation.explanation.current-drainage-is",
        delta_loc = await localize(nguage,
            "module.calculation.explanation.delta", self.hass.config.language
        )   if maximum_bucket is None or maximum_bucket <= 0:
        old_bucket_loc = await localize(nage_rate_loc}] * {hours_loc} = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} = {drainage:.2f}"
            "module.calculation.explanation.old-bucket-variable",
            self.hass.config.language,ainage_rate_loc}] * [{hours_loc}] * (min([{old_bucket_loc}] + [{delta_loc}], [{max_bucket_loc}]) / [{max_bucket_loc}])^4 = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} * ({bucket_plus_delta_capped:.2f} / {maximum_bucket:.1f})^4 = {drainage:.2f}"
        )xplanation += ".<br/>" + await localize(
        max_bucket_loc = await localize(ion.new-bucket-values-is",
            "module.calculation.explanation.max-bucket-variable",
            self.hass.config.language,
        )
        if maximum_bucket is not None and maximum_bucket > 0:
        if bucket_plus_delta_capped <= 0:ucket_loc}] + [{delta_loc}], {max_bucket_loc}) - [{drainage_loc}] = min({data[const.ZONE_OLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f}, {maximum_bucket:.1f}) - {drainage:.2f} = {newbucket:.2f}.<br/>"
            explanation += (
                await localize({old_bucket_loc}] + [{delta_loc}] - [{drainage_loc}] = {data[const.ZONE_OLD_BUCKET]:.2f} + {data[const.ZONE_DELTA]:.2f} - {drainage:.2f} = {newbucket:.2f}.<br/>"
                    "module.calculation.explanation.no-drainage",
                    self.hass.config.language,
                )culate duration
                + f" [{old_bucket_loc}] + [{delta_loc}] <= 0 ({data[const.ZONE_OLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f} = {bucket_plus_delta_capped:.2f})"
            )put = zone.get(const.ZONE_THROUGHPUT)
        else:z = zone.get(const.ZONE_SIZE)
            explanation += await localize(
                "module.calculation.explanation.current-drainage-is",is not in metric, so we need to adjust those first!
                self.hass.config.language,st.UNIT_GPM, const.UNIT_LPM, tput)
            )   sz = convert_between(const.UNIT_SQ_FT, const.UNIT_M2, sz)
            if maximum_bucket is None or maximum_bucket <= 0:
                explanation += f" [{drainage_rate_loc}] * {hours_loc} = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} = {drainage:.2f}"ues to be passed in!
            else:er_budget = 1
                explanation += f" [{drainage_rate_loc}] * [{hours_loc}] * (min([{old_bucket_loc}] + [{delta_loc}], [{max_bucket_loc}]) / [{max_bucket_loc}])^4 = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} * ({bucket_plus_delta_capped:.2f} / {maximum_bucket:.1f})^4 = {drainage:.2f}"
        explanation += ".<br/>" + await localize(nst.ZONE_BUCKET])/mod.maximum_et,2)
            "module.calculation.explanation.new-bucket-values-is",
            self.hass.config.language,od.maximum_et / precipitation_rate * 60)*60
        )
            # duration = water_budget * base_schedule_index
        if maximum_bucket is not None and maximum_bucket > 0:ak ) * ( ETpeak / PR * 3600 ) = |B| / PR * 3600 = ( ET - P ) / PR * 3600
            explanation += f" min([{old_bucket_loc}] + [{delta_loc}], {max_bucket_loc}) - [{drainage_loc}] = min({data[const.ZONE_OLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f}, {maximum_bucket:.1f}) - {drainage:.2f} = {newbucket:.2f}.<br/>"
        else:uration = abs(newbucket) / precipitation_rate * 3600
            explanation += f" [{old_bucket_loc}] + [{delta_loc}] - [{drainage_loc}] = {data[const.ZONE_OLD_BUCKET]:.2f} + {data[const.ZONE_DELTA]:.2f} - {drainage:.2f} = {newbucket:.2f}.<br/>"
                await localize(
        if newbucket < 0:le.calculation.explanation.bucket-less-than-zero-irrigation-necessary",
            # calculate durationnfig.language,
                )
            tput = zone.get(const.ZONE_THROUGHPUT)
            sz = zone.get(const.ZONE_SIZE)
            if not ha_config_is_metric:.explanation.steps-taken-to-calculate-duration",
                # throughput is in gpm and size is in sq ft since HA is not in metric, so we need to adjust those first!
                tput = convert_between(const.UNIT_GPM, const.UNIT_LPM, tput)
                sz = convert_between(const.UNIT_SQ_FT, const.UNIT_M2, sz)
            precipitation_rate = (tput * 60) / sz
            # new version of calculation below - this is the old version from V1. Switching to the new version removes the need for ET values to be passed in!
            # water_budget = 1<ol><li>Water budget is defined as abs([bucket])/max(ET)={}</li>".format(water_budget)
            # if mod.maximum_et != 0:oving all rounds to see if we can find the math issue reported in #186
            #    water_budget = round(abs(data[const.ZONE_BUCKET])/mod.maximum_et,2)
            #   "<ol><li>"
            # base_schedule_index = (mod.maximum_et / precipitation_rate * 60)*60
                    "module.calculation.explanation.precipitation-rate-defined-as",
            # duration = water_budget * base_schedule_index
            # new version (2.0): ART = W * BSI = ( |B| / ETpeak ) * ( ETpeak / PR * 3600 ) = |B| / PR * 3600 = ( ET - P ) / PR * 3600
            # so duration = |B| / PR * 3600
            duration = abs(newbucket) / precipitation_rate * 3600
            explanation += (attributes.throughput", self.hass.config.language
                await localize(
                    "module.calculation.explanation.bucket-less-than-zero-irrigation-necessary",
                    self.hass.config.language,butes.size", self.hass.config.language)
                ) f"] = {tput:.1f} * 60 / {sz:.1f} = {precipitation_rate:.1f}.</li>"
                + ".<br/>"
                + await localize(
                    "module.calculation.explanation.steps-taken-to-calculate-duration",pitation rate]*60)*60=({}/{}*60)*60={}</li>".format(mod.maximum_et,precipitation_rate,round(base_schedule_index,1))
                    self.hass.config.language, is calculated as [water_budget]*[base_schedule_index]={}*{}={}</li>".format(water_budget,round(base_schedule_index,1),round(duration))
                )a25: temporarily removing all rounds to see if we can find the math issue reported in #186
                + ":<br/>" (
            )   "<li>"
            # v1 onlyit localize(
            # explanation += "<ol><li>Water budget is defined as abs([bucket])/max(ET)={}</li>".format(water_budget)
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<ol><li>"
                + await localize(
                    "module.calculation.explanation.precipitation-rate-defined-as",age
                    self.hass.config.language,
                ) "]) / ["
                + " ["t localize(
                + await localize(lation.explanation.precipitation-rate-variable",
                    "common.attributes.throughput", self.hass.config.language
                )
                + "] * 60 / [" {abs(newbucket):.2f} / {precipitation_rate:.1f} * 3600 = {duration:.0f}.</li>"
                + await localize("common.attributes.size", self.hass.config.language)
                + f"] = {tput:.1f} * 60 / {sz:.1f} = {precipitation_rate:.1f}.</li>"
            )xplanation += (
            # v1 only"
            # explanation += "<li>The base schedule index is defined as (max(ET)/[precipitation rate]*60)*60=({}/{}*60)*60={}</li>".format(mod.maximum_et,precipitation_rate,round(base_schedule_index,1))
            # explanation += "<li>the duration is calculated as [water_budget]*[base_schedule_index]={}*{}={}</li>".format(water_budget,round(base_schedule_index,1),round(duration))
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<li>"zone.get(const.ZONE_MULTIPLIER)}, "
                + await localize(
                    "module.calculation.explanation.duration-is-calculated-as",
                    self.hass.config.language,
                )   "module.calculation.explanation.duration-after-multiplier-is",
                + " abs(["ass.config.language,
                + await localize(
                    "module.calculation.explanation.bucket", self.hass.config.language
                )
                + "]) / ["
                + await localize(n if set and >=0 and override duration if it's higher than maximum duration
                    "module.calculation.explanation.precipitation-rate-variable",
                    self.hass.config.language,
                ) await localize(
                + f"] * 3600 = {abs(newbucket):.2f} / {precipitation_rate:.1f} * 3600 = {duration:.0f}.</li>"
            )       self.hass.config.language,
            duration = zone.get(const.ZONE_MULTIPLIER) * duration
            explanation += (et(const.ZONE_MAXIMUM_DURATION):.0f}"
                                                               "<li>"
                + await localize(
                    "module.calculation.explanation.multiplier-is-applied",
                    self.hass.config.language,M_DURATION) >= 0
                )nd duration > zone.get(const.ZONE_MAXIMUM_DURATION)
                + f" {zone.get(const.ZONE_MULTIPLIER)}, "
            )   duration = zone.get(const.ZONE_MAXIMUM_DURATION)
            explanation += (+= (
                await localize(
                    "module.calculation.explanation.duration-after-multiplier-is",
                    self.hass.config.language,planation.duration-after-maximum-duration-is",
                )       self.hass.config.language,
                + f" {round(duration)}.</li>"
            )       + f" {duration:.0f}"
                )
            # get maximum duration if set and >=0 and override duration if it's higher than maximum duration
            explanation += (
                "<li>"lead time but only if duration is > 0 at this point
                + await localize(
                    "module.calculation.explanation.maximum-duration-is-applied",
                    self.hass.config.language,
                )   "<li>"
                + f" {zone.get(const.ZONE_MAXIMUM_DURATION):.0f}"
            )           "module.calculation.explanation.lead-time-is-applied",
            if (        self.hass.config.language,
                zone.get(const.ZONE_MAXIMUM_DURATION) is not None
                and zone.get(const.ZONE_MAXIMUM_DURATION) >= 0
                and duration > zone.get(const.ZONE_MAXIMUM_DURATION)
            ):  explanation += (
                duration = zone.get(const.ZONE_MAXIMUM_DURATION)
                explanation += (calculation.explanation.duration-after-lead-time-is",
                    ", "self.hass.config.language,
                    + await localize(
                        "module.calculation.explanation.duration-after-maximum-duration-is",
                        self.hass.config.language,
                    )nation += (
                    + f" {duration:.0f}"
                )       "module.calculation.explanation.duration-after-lead-time-is",
            explanation += ".</li>"onfig.language,
                    )
            # add the lead time but only if duration is > 0 at this point
            if duration > 0.0:
                duration = round(zone.get(const.ZONE_LEAD_TIME) + duration)
                explanation += ("[calculate-module]: explanation: %s", explanation)
                    "<li>"
                    + await localize(t duration to 0
                        "module.calculation.explanation.lead-time-is-applied",
                        self.hass.config.language,
                    ) localize(
                    + f" {zone.get(const.ZONE_LEAD_TIME)}, "arger-than-or-equal-to-zero-no-irrigation-necessary",
                )   self.hass.config.language,
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )NE_BUCKET] = newbucket
                    + f" {duration}</li></ol>"
                )const.ZONE_BUCKET] = convert_between(
                explanation += (onst.UNIT_INCH, data[const.ZONE_BUCKET]
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )NE_LAST_CALCULATED] = datetime.datetime.now()
                    + f" {duration}.</li></ol>"
                )
    async def async_update_module_config(
                # _LOGGER.debug("[calculate-module]: explanation: %s", explanation)
        else:
            # no need to irrigate, set duration to 0uration.
            duration = 0
            explanation += (
                await localize(f the module to update or delete.
                    "module.calculation.explanation.bucket-larger-than-or-equal-to-zero-no-irrigation-necessary",
                    self.hass.config.language,
                )
                + f" {duration}"
            )ata = {}
        if module_id is not None:
        data[const.ZONE_BUCKET] = newbucket
        if not ha_config_is_metric:a:
            data[const.ZONE_BUCKET] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_BUCKET]
            )f not module:
        data[const.ZONE_DURATION] = duration
        data[const.ZONE_EXPLANATION] = explanationodule_id)
        data[const.ZONE_LAST_CALCULATED] = datetime.datetime.now()e_id):
        return datay a module
            await self.store.async_update_module(module_id, data)
    async def async_update_module_config(
        self, module_id: int | None = None, data: dict | None = Noneid
    ):      )
        """Update, create, or delete a module configuration.
            # create a module
        Args:wait self.store.async_create_module(data)
            module_id: The ID of the module to update or delete.
            data: The configuration data for the module.
    async def async_update_mapping_config(
        """f, mapping_id: int | None = None, data: dict | None = None
        if data is None:
            data = {}eate, or delete a mapping configuration.
        if module_id is not None:
            module_id = int(module_id)
        if const.ATTR_REMOVE in data: mapping to update or delete.
            # delete a moduleration data for the mapping.
            module = self.store.get_module(module_id)
            if not module:
                return
            await self.store.async_delete_module(module_id)ing %s, data: %s",
        elif module_id is not None and self.store.get_module(module_id):
            # modify a module
            await self.store.async_update_module(module_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", module_id
            )pping_id is not None:
        else:apping_id = int(mapping_id)
            # create a modulein data:
            await self.store.async_create_module(data)
            await self.store.async_get_config()g_id)
            if not res:
    async def async_update_mapping_config(
        self, mapping_id: int | None = None, data: dict | None = None
    ):  elif mapping_id is not None and self.store.get_mapping(mapping_id):
        """Update, create, or delete a mapping configuration.
            await self.store.async_update_mapping(mapping_id, data)
        Args:sync_dispatcher_send(
            mapping_id: The ID of the mapping to update or delete.ng_id
            data: The configuration data for the mapping.
        else:
        """ # create a mapping
        _LOGGER.debug(.store.async_create_mapping(data)
            "[async_update_mapping_config]: update for mapping %s, data: %s",
            mapping_id,
            data,the list of sensors to follow - then unsubscribe / subscribe
        )wait self.update_subscriptions()
        if data is None:
            data = {}_sources(self, mapping_id):
        if mapping_id is not None:s (weather service, sensor, static value) are present in a mapping.
            mapping_id = int(mapping_id)
        if const.ATTR_REMOVE in data:
            # delete a mapping of the mapping to check.
            res = self.store.get_mapping(mapping_id)
            if not res:
                returnooleans: (owm_in_mapping, sensor_in_mapping, static_in_mapping)
            await self.store.async_delete_mapping(mapping_id)
        elif mapping_id is not None and self.store.get_mapping(mapping_id):
            # modify a mapping
            await self.store.async_update_mapping(mapping_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", mapping_id
            )apping = self.store.get_mapping(mapping_id)
        else:f mapping is not None:
            # create a mapping mapping[const.MAPPING_MAPPINGS].values():
            await self.store.async_create_mapping(data)
            await self.store.async_get_config()
                            the_map.get(const.MAPPING_CONF_SOURCE)
        # update the list of sensors to follow - then unsubscribe / subscribe
        await self.update_subscriptions()
                            owm_in_mapping = True
    def check_mapping_sources(self, mapping_id):
        """Check which data sources (weather service, sensor, static value) are present in a mapping.
                            == const.MAPPING_CONF_SOURCE_SENSOR
        Args:           ):
            mapping_id: The ID of the mapping to check.
                        if (
        Returns:            the_map.get(const.MAPPING_CONF_SOURCE)
            Tuple of booleans: (owm_in_mapping, sensor_in_mapping, static_in_mapping)
                        ):
        """                 static_in_mapping = True
        owm_in_mapping = False
        sensor_in_mapping = False
        static_in_mapping = Falseng_sources] sensor group %s is None", mapping_id
        if mapping_id is not None:
            mapping = self.store.get_mapping(mapping_id)
            if mapping is not None:ces for mapping_id %s returns OWM: %s, sensor: %s, static: %s",
                for the_map in mapping[const.MAPPING_MAPPINGS].values():
                    if not isinstance(the_map, str):
                        if (pping,
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
                        ):ing, sensor_in_mapping, static_in_mapping
                            owm_in_mapping = True
                        if (for_mapping(self, mapping):
                            the_map.get(const.MAPPING_CONF_SOURCE) by retrieving and converting sensor states from Home Assistant.
                            == const.MAPPING_CONF_SOURCE_SENSOR
                        ):
                            sensor_in_mapping = Trueng sensor configuration.
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_STATIC_VALUE metric values.
                        ):
                            static_in_mapping = True
            else:lues = {}
                _LOGGER.debug(pping[const.MAPPING_MAPPINGS].items():
                    "[check_mapping_sources] sensor group %s is None", mapping_id
                )f the_map.get(
            _LOGGER.debug(MAPPING_CONF_SOURCE
                "check_mapping_sources for mapping_id %s returns OWM: %s, sensor: %s, static: %s",
                mapping_id,APPING_CONF_SENSOR
                owm_in_mapping,
                sensor_in_mapping, maps to a sensor, so retrieve its value from HA
                static_in_mapping,tates.get(the_map.get(const.MAPPING_CONF_SENSOR)):
            )           try:
        return owm_in_mapping, sensor_in_mapping, static_in_mapping
                                self.hass.states.get(
    def build_sensor_values_for_mapping(self, mapping):APPING_CONF_SENSOR)
        """Build a dictionary of sensor values for a given mapping by retrieving and converting sensor states from Home Assistant.
                            )
        Args:               # make sure to store the val as metric and do necessary conversions along the way
            mapping: The mapping dictionary containing sensor configuration.
                                val,
        Returns:                key,
            dict: A dictionary of sensor keys and their corresponding metric values.
                                self.hass.config.units is METRIC_SYSTEM,
        """                 )
        sensor_values = {}  # add val to sensor values
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):TypeError):
                if the_map.get(GGER.warning(
                    const.MAPPING_CONF_SOURCE value for sensor %s",
                ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(,
                    const.MAPPING_CONF_SENSOR
                ):
                    # this mapping maps to a sensor, so retrieve its value from HA
                    if self.hass.states.get(the_map.get(const.MAPPING_CONF_SENSOR)):
                        try:for_mapping(self, mapping):
                            val = float(values for a given mapping by retrieving and converting static values.
                                self.hass.states.get(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                ).statenary containing static value configuration.
                            )
                            # make sure to store the val as metric and do necessary conversions along the way
                            val = convert_mapping_to_metric(esponding static metric values.
                                val,
                                key,
                                the_map.get(const.MAPPING_CONF_UNIT),
                                self.hass.config.units is METRIC_SYSTEM,
                            )(the_map, str):
                            # add val to sensor values
                            sensor_values[key] = val
                        except (ValueError, TypeError):ALUE and the_map.get(
                            _LOGGER.warning(C_VALUE
                                "No / unknown value for sensor %s",
                                the_map.get(const.MAPPING_CONF_SENSOR),s value
                            )at(the_map.get(const.MAPPING_CONF_STATIC_VALUE))
                    # first check we are not in metric mode already.
        return sensor_valueshass.config.units is not METRIC_SYSTEM:
                        val = convert_mapping_to_metric(
    def build_static_values_for_mapping(self, mapping):.MAPPING_CONF_UNIT), False
        """Build a dictionary of static values for a given mapping by retrieving and converting static values.
                    # add val to sensor values
        Args:       static_values[key] = val
            mapping: The mapping dictionary containing static value configuration.

        Returns:ync_update_zone_config(
            dict: A dictionary of sensor keys and their corresponding static metric values.
    ):
        """Update, create, or delete a zone configuration.
        static_values = {}
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):pdate or delete.
                if the_map.get(tion data for the mapping.
                    const.MAPPING_CONF_SOURCE
                ) == const.MAPPING_CONF_SOURCE_STATIC_VALUE and the_map.get(
                    const.MAPPING_CONF_STATIC_VALUEupdating zone %s", zone_id)
                ): None:
                    # this mapping maps to a static value, so return its value
                    val = float(the_map.get(const.MAPPING_CONF_STATIC_VALUE))
                    # first check we are not in metric mode already.
                    if self.hass.config.units is not METRIC_SYSTEM:
                        val = convert_mapping_to_metric(
                            val, key, the_map.get(const.MAPPING_CONF_UNIT), False
                        )
                    # add val to sensor values
                    static_values[key] = valne(zone_id)
        return static_values_remove_entity(zone_id)

    async def async_update_zone_config(ta:
        self, zone_id: int | None = None, data: dict | None = None
    ):  elif const.ATTR_CALCULATE_ALL in data:
        """Update, create, or delete a zone configuration.
            _LOGGER.info("Calculating all zones")
        Args:ata.pop(const.ATTR_CALCULATE_ALL)
            zone_id: The ID of the zone to update or delete.
            data: The configuration data for the mapping.
        elif const.ATTR_UPDATE in data:
        """ await self._async_update_zone_weatherdata(zone_id, data)
        _LOGGER.debug("[async_update_zone_config]: updating zone %s", zone_id)
        if data is None:("Updating all zones")
            data = {}f._async_update_all()
        if zone_id is not None:LL_BUCKETS in data:
            zone_id = int(zone_id)
        if const.ATTR_REMOVE in data:ll buckets")
            # delete a zoneATTR_RESET_ALL_BUCKETS)
            zone = self.store.get_zone(zone_id)(None)
            if not zone:CLEAR_ALL_WEATHERDATA in data:
                returnl weatherdata
            await self.store.async_delete_zone(zone_id)
            await self.async_remove_entity(zone_id)TA)
            await self.handle_clear_weatherdata(None)
        elif const.ATTR_CALCULATE in data:store.get_zone(zone_id):
            await self.async_calculate_zone(zone_id, data)
        elif const.ATTR_CALCULATE_ALL in data:ate_zone(zone_id, data)
            # calculate all zones(self.hass, const.DOMAIN + "_config_updated", zone_id)
            _LOGGER.info("Calculating all zones")
            data.pop(const.ATTR_CALCULATE_ALL)y here by listening to this in sensor.py.
            await self._async_calculate_all()s from the UI (by user) or by a calculation module (updating a duration), which should be done in python
        else:
        elif const.ATTR_UPDATE in data:
            await self._async_update_zone_weatherdata(zone_id, data)
        elif const.ATTR_UPDATE_ALL in data:
            _LOGGER.info("Updating all zones")onst.DOMAIN + "_register_entity", entry)
            await self._async_update_all()
        elif const.ATTR_RESET_ALL_BUCKETS in data:
            # reset all buckets
            _LOGGER.info("Resetting all buckets")
            data.pop(const.ATTR_RESET_ALL_BUCKETS)t from async_update_zone_config")
            await self.handle_reset_all_buckets(None)
        elif const.ATTR_CLEAR_ALL_WEATHERDATA in data:
            # clear all weatherdataself):
            _LOGGER.info("Clearing all weatherdata") start event based on configured triggers."""
            data.pop(const.ATTR_CLEAR_ALL_WEATHERDATA)
            await self.handle_clear_weatherdata(None)
        elif zone_id is not None and self.store.get_zone(zone_id):
            # modify a zonerise_event_unsub = None
            entry = await self.store.async_update_zone(zone_id, data)
            async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated", zone_id)
            await self.update_subscriptions()
            # make sure to update the HA entity here by listening to this in sensor.py.
            # this should be called by changes from the UI (by user) or by a calculation module (updating a duration), which should be done in python
        else: triggers configuration
            # create a zone.store.async_get_config()
            entry = await self.store.async_create_zone(data)IGGERS, [])
        
            async_dispatcher_send(self.hass, const.DOMAIN + "_register_entity", entry)
            # Backward compatibility: if no triggers configured, use legacy behavior
            await self.store.async_get_config()_trigger()
            return
        # update the start event
        _LOGGER.debug("calling register start event from async_update_zone_config")
        await self.register_start_event()
            _LOGGER.info("No enabled zones with duration > 0, skipping trigger registration")
    async def register_start_event(self):
        """Register callbacks to fire the irrigation start event based on configured triggers."""
        # Clear existing trigger subscriptions
        if self._track_sunrise_event_unsub:
            self._track_sunrise_event_unsub()CONF_ENABLED, True):
            self._track_sunrise_event_unsub = None
                
        for unsub in self._track_irrigation_triggers_unsub:YPE)
            unsub()minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
        self._track_irrigation_triggers_unsub.clear()CONF_NAME, "Unnamed Trigger")
            account_for_duration = trigger.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True)
        # Get triggers configuration
        config = await self.store.async_get_config()
        triggers = config.get(const.CONF_IRRIGATION_START_TRIGGERS, [])
                    await self._register_sunrise_trigger(offset_minutes, trigger_name, total_duration, account_for_duration)
        if not triggers:gger_type == const.TRIGGER_TYPE_SUNSET:
            # Backward compatibility: if no triggers configured, use legacy behavior, total_duration, account_for_duration)
            await self._register_legacy_sunrise_trigger()OLAR_AZIMUTH:
            return  azimuth_angle = trigger.get(const.TRIGGER_CONF_AZIMUTH_ANGLE, 0)
                    # Normalize azimuth angle to 0-360 range
        total_duration = await self.get_total_duration_all_enabled_zones()h_angle)
        if total_duration <= 0:_register_azimuth_trigger(azimuth_angle, offset_minutes, trigger_name, total_duration, account_for_duration)
            _LOGGER.info("No enabled zones with duration > 0, skipping trigger registration")
            return  _LOGGER.warning("Unknown trigger type: %s", trigger_type)
            except Exception as e:
        # Register each enabled triggero register trigger '%s': %s", trigger_name, e)
        for trigger in triggers:
            if not trigger.get(const.TRIGGER_CONF_ENABLED, True):
                continuelegacy sunrise trigger for backward compatibility."""
                ration = await self.get_total_duration_all_enabled_zones()
            trigger_type = trigger.get(const.TRIGGER_CONF_TYPE)
            offset_minutes = trigger.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0)
            trigger_name = trigger.get(const.TRIGGER_CONF_NAME, "Unnamed Trigger")
            account_for_duration = trigger.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True)
                datetime.timedelta(seconds=0 - total_duration),
            try:
                if trigger_type == const.TRIGGER_TYPE_SUNRISE:GATE_START}"
                    await self._register_sunrise_trigger(offset_minutes, trigger_name, total_duration, account_for_duration)
                elif trigger_type == const.TRIGGER_TYPE_SUNSET:%s seconds before sunrise",
                    await self._register_sunset_trigger(offset_minutes, trigger_name, total_duration, account_for_duration)
                elif trigger_type == const.TRIGGER_TYPE_SOLAR_AZIMUTH:
                    azimuth_angle = trigger.get(const.TRIGGER_CONF_AZIMUTH_ANGLE, 0)
                    # Normalize azimuth angle to 0-360 range
                    azimuth_angle = helpers.normalize_azimuth_angle(azimuth_angle)tr, total_duration: int, account_for_duration: bool):
                    await self._register_azimuth_trigger(azimuth_angle, offset_minutes, trigger_name, total_duration, account_for_duration)
                else:ffset based on account_for_duration setting
                    _LOGGER.warning("Unknown trigger type: %s", trigger_type)
            except Exception as e::
                _LOGGER.error("Failed to register trigger '%s': %s", trigger_name, e)
                offset_seconds = -total_duration  # Negative for "before"
    async def _register_legacy_sunrise_trigger(self):
        """Register the legacy sunrise trigger for backward compatibility."""o finish at the target time
        total_duration = await self.get_total_duration_all_enabled_zones()
        if total_duration > 0:
            self._track_sunrise_event_unsub = async_track_sunrise(
                self.hass, = offset_minutes * 60
                self._fire_start_event,
                datetime.timedelta(seconds=0 - total_duration),
            )elf.hass,
            event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            _LOGGER.info(delta(seconds=offset_seconds),
                "Legacy start irrigation event %s will fire at %s seconds before sunrise",
                event_to_fire,_triggers_unsub.append(unsub)
                total_duration,
            )t_desc = f"{abs(offset_seconds)} seconds before" if offset_seconds < 0 else f"{offset_seconds} seconds after"
        duration_desc = " (accounting for total zone duration)" if account_for_duration else ""
    async def _register_sunrise_trigger(self, offset_minutes: int, trigger_name: str, total_duration: int, account_for_duration: bool):
        """Register a sunrise-based trigger."""ill fire %s sunrise%s",
        # Calculate offset based on account_for_duration setting
        if account_for_duration:
            if offset_minutes == 0:
                # Legacy behavior: use total duration for automatic timingname: str, total_duration: int, account_for_duration: bool):
                offset_seconds = -total_duration  # Negative for "before"
            else:te offset based on account_for_duration setting
                # Account for duration: subtract total duration from offset to finish at the target time
                offset_seconds = (offset_minutes * 60) - total_duration to finish at the target time
        else:ffset_seconds = (offset_minutes * 60) - total_duration
            # Start exactly at the specified time
            offset_seconds = offset_minutes * 60e
            offset_seconds = offset_minutes * 60
        unsub = async_track_sunrise(
            self.hass,track_sunset(
            self._fire_start_event,
            datetime.timedelta(seconds=offset_seconds),
        )   datetime.timedelta(seconds=offset_seconds),
        self._track_irrigation_triggers_unsub.append(unsub)
        self._track_irrigation_triggers_unsub.append(unsub)
        offset_desc = f"{abs(offset_seconds)} seconds before" if offset_seconds < 0 else f"{offset_seconds} seconds after"
        duration_desc = " (accounting for total zone duration)" if account_for_duration else ""set_seconds} seconds after"
        _LOGGER.info( = " (accounting for total zone duration)" if account_for_duration else ""
            "Registered sunrise trigger '%s': will fire %s sunrise%s",
            trigger_name, offset_desc, duration_descre %s sunset%s",
        )   trigger_name, offset_desc, duration_desc
        )
    async def _register_sunset_trigger(self, offset_minutes: int, trigger_name: str, total_duration: int, account_for_duration: bool):
        """Register a sunset-based trigger."""azimuth_angle: float, offset_minutes: int, trigger_name: str, total_duration: int, account_for_duration: bool):
        # Calculate offset based on account_for_duration setting
        if account_for_duration:nce of this azimuth
            # Account for duration: subtract total duration from offset to finish at the target time
            offset_seconds = (offset_minutes * 60) - total_duration0.0)
        else:
            # Start exactly at the specified timeth_time(
            offset_seconds = offset_minutes * 60datetime.datetime.now()
        )
        unsub = async_track_sunset(
            self.hass,h_time is None:
            self._fire_start_event,
            datetime.timedelta(seconds=offset_seconds), azimuth %s° for trigger '%s'",
        )       azimuth_angle, trigger_name
        self._track_irrigation_triggers_unsub.append(unsub)
            return
        offset_desc = f"{abs(offset_seconds)} seconds before" if offset_seconds < 0 else f"{offset_seconds} seconds after"
        duration_desc = " (accounting for total zone duration)" if account_for_duration else ""
        _LOGGER.info(r_duration:
            "Registered sunset trigger '%s': will fire %s sunset%s",set to finish at the target time
            trigger_name, offset_desc, duration_descime.timedelta(minutes=offset_minutes) - datetime.timedelta(seconds=total_duration)
        )lse:
            # Start exactly at the specified time
    async def _register_azimuth_trigger(self, azimuth_angle: float, offset_minutes: int, trigger_name: str, total_duration: int, account_for_duration: bool):
        """Register a solar azimuth-based trigger."""
        # Calculate next occurrence of this azimuth
        latitude = self._latitudes.event import async_track_point_in_utc_time
        longitude = self.hass.config.as_dict().get(CONF_LONGITUDE, 0.0)
        unsub = async_track_point_in_utc_time(
        next_azimuth_time = find_next_solar_azimuth_time(
            latitude, longitude, azimuth_angle, datetime.datetime.now()
        )   trigger_time,
        )
        if next_azimuth_time is None:rs_unsub.append(unsub)
            _LOGGER.warning(
                "Could not calculate next occurrence of azimuth %s° for trigger '%s'",lse ""
                azimuth_angle, trigger_nameotal zone duration)" if account_for_duration else ""
            )ER.info(
            returntered azimuth trigger '%s': will fire when sun reaches %s°%s at %s%s",
            trigger_name, azimuth_angle, offset_desc, trigger_time, duration_desc
        # Calculate trigger time based on account_for_duration setting
        if account_for_duration:
            # Account for duration: subtract total duration from offset to finish at the target time
            trigger_time = next_azimuth_time + datetime.timedelta(minutes=offset_minutes) - datetime.timedelta(seconds=total_duration)
        else:
            # Start exactly at the specified time
            trigger_time = next_azimuth_time + datetime.timedelta(minutes=offset_minutes)
        
        # Schedule the trigger
        from homeassistant.helpers.event import async_track_point_in_utc_time
        zones = await self.store.async_get_zones()
        unsub = async_track_point_in_utc_time(
            self.hass,
            self._fire_start_event,_STATE) == const.ZONE_STATE_AUTOMATIC
            trigger_time,et(const.ZONE_STATE) == const.ZONE_STATE_MANUAL
        )   ):
        self._track_irrigation_triggers_unsub.append(unsub)ION, 0)
        return total_duration
        offset_desc = f" with {offset_minutes} minute offset" if offset_minutes != 0 else ""
        duration_desc = " (accounting for total zone duration)" if account_for_duration else ""
        _LOGGER.info(recipitation is forecasted and should skip irrigation.
            "Registered azimuth trigger '%s': will fire when sun reaches %s°%s at %s%s",
            trigger_name, azimuth_angle, offset_desc, trigger_time, duration_desc
        )   bool: True if irrigation should be skipped due to precipitation, False otherwise.
        """
    async def get_total_duration_all_enabled_zones(self):
        """Calculate the total duration for all enabled (automatic or manual) zones.
        # Check if precipitation skip is enabled
        Returns:precipitation = config.get(const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION, const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION)
            int: The sum of durations for all enabled zones.
            return False
        """ 
        total_duration = 0 service is being used
        zones = await self.store.async_get_zones()F_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE)
        for zone in zones:_service:
            if (GER.debug("Weather service not enabled, cannot check precipitation forecast")
                zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_MANUAL
            ):precipitation threshold
                total_duration += zone.get(const.ZONE_DURATION, 0)LD_MM, const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM)
        return total_duration
        try:
    async def _check_precipitation_forecast(self) -> bool:
        """Check if precipitation is forecasted and should skip irrigation.CONF_DEFAULT_WEATHER_SERVICE)
            if weather_service is None:
        Returns:_LOGGER.debug("No weather service configured")
            bool: True if irrigation should be skipped due to precipitation, False otherwise.
        """     
            weather_client = None
            if weather_service == const.CONF_WEATHER_SERVICE_OWM:
                weather_client = self._OWMClient
            elif weather_service == const.CONF_WEATHER_SERVICE_PW:
                weather_client = self._PirateWeatherClient  
            elif weather_service == const.CONF_WEATHER_SERVICE_KNMI:
                weather_client = self._KNMIClient
                
            if weather_client is None:
                _LOGGER.debug("Weather client not available")
                return False
                
            # Get forecast data (today and tomorrow)
            forecast_data = weather_client.get_forecast_data()
            if not forecast_data:
                _LOGGER.debug("No forecast data available")
                return False
                
            # Check precipitation for today and tomorrow
            total_precipitation = 0.0
            for day_data in forecast_data[:2]:  # Check today and tomorrow only
                if const.MAPPING_PRECIPITATION in day_data:
                    total_precipitation += day_data[const.MAPPING_PRECIPITATION]
                    
            _LOGGER.debug("Forecast precipitation: %.1f mm (threshold: %.1f mm)", total_precipitation, threshold_mm)
            
            if total_precipitation >= threshold_mm:
                _LOGGER.info("Skipping irrigation due to forecasted precipitation: %.1f mm (threshold: %.1f mm)", 
                           total_precipitation, threshold_mm)
                return True
                
        except Exception as e:
            _LOGGER.warning("Error checking precipitation forecast: %s", e)
            
        return False

    @callback
    def _fire_start_event(self, *args):
        """Fire the irrigation start event if conditions are met."""
        if not self._start_event_fired_today:
            # Check for precipitation forecast asynchronously
            async def check_and_fire():
                try:
                    should_skip = await self._check_precipitation_forecast()
                    if should_skip:
                        _LOGGER.info("Irrigation start event skipped due to forecasted precipitation")
                        return
                        
                    # Fire the event
                    event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
                    self.hass.bus.fire(event_to_fire, {})
                    _LOGGER.info("Fired start event: %s", event_to_fire)
                    self._start_event_fired_today = True
                    
                    # Save config asynchronously
                    await self.store.async_update_config(
                        {const.START_EVENT_FIRED_TODAY: self._start_event_fired_today}
                    )
                except Exception as e:
                    _LOGGER.error("Error in precipitation check, firing irrigation event anyway: %s", e)
                    # Fire the event as fallback
                    event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
                    self.hass.bus.fire(event_to_fire, {})
                    _LOGGER.info("Fired start event (fallback): %s", event_to_fire)
                    self._start_event_fired_today = True
                    
                    # Save config asynchronously
                    await self.store.async_update_config(
                        {const.START_EVENT_FIRED_TODAY: self._start_event_fired_today}
                    )
                    
            # Schedule the async check
            self.hass.async_create_task(check_and_fire())
        else:
            _LOGGER.info("Did not fire start event, it was already fired today")

    @callback
    def _reset_event_fired_today(self, *args):
        if self._start_event_fired_today:
            _LOGGER.info("Resetting start event fired today tracker")
            self._start_event_fired_today = False
            # save config asynchronously - fire-and-forget since this is a callback
            self.hass.async_create_task(
                self.store.async_update_config(
                    {const.START_EVENT_FIRED_TODAY: self._start_event_fired_today}
                )
            )

    async def async_get_all_modules(self):
        """Get all ModuleEntries."""
        res = []
        mods = await self.hass.async_add_executor_job(loadModules, const.MODULE_DIR)
        for mod in mods:
            m = getattr(mods[mod]["module"], mods[mod]["class"])
            s = m(self.hass, None, {})
            res.append(
                {
                    "name": s.name,
                    "description": s.description,
                    "config": s.config,
                    "schema": s.schema_serialized(),
                }
            )
        return res

    async def async_remove_entity(self, zone_id: str):
        """Remove an entity corresponding to the given zone ID from Home Assistant.

        Args:
            zone_id: The ID of the zone whose entity should be removed.

        """
        entity_registry = er.async_get(self.hass)
        zone_id = int(zone_id)
        entity = self.hass.data[const.DOMAIN]["zones"][zone_id]
        entity_registry.async_remove(entity.entity_id)
        self.hass.data[const.DOMAIN]["zones"].pop(zone_id, None)

    async def async_unload(self):
        """Remove all Smart Irrigation objects."""

        # remove zone entities
        zones = list(self.hass.data[const.DOMAIN]["zones"].keys())
        for zone in zones:
            await self.async_remove_entity(zone)

        # remove subscriptions for coordinator
        while self._subscriptions:
            self._subscriptions.pop()()

    async def async_delete_config(self):
        """Wipe Smart Irrigation storage."""
        await self.store.async_delete()

    async def _async_set_all_buckets(self, val=0):
        """Set all buckets to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_BUCKET] = {}
        data[const.ATTR_NEW_BUCKET_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def _async_set_all_multipliers(self, val=0):
        """Set all multipliers to val."""
        zones = await self.store.async_get_zones()
        data = {}
        data[const.ATTR_SET_MULTIPLIER] = {}
        data[const.ATTR_NEW_MULTIPLIER_VALUE] = val

        for zone in zones:
            await self.async_update_zone_config(
                zone_id=zone.get(const.ZONE_ID), data=data
            )

    async def handle_calculate_all_zones(self, call):
        """Calculate all zones."""
        _LOGGER.info("Calculate all zones service called")
        await self._async_calculate_all(
            call.data.get(const.ATTR_DELETE_WEATHER_DATA, True)
        )

    async def handle_calculate_zone(self, call):
        """Calculate specific zone."""
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in call.data[const.SERVICE_ENTITY_ID]:
                _LOGGER.info("Calculate zone service called for zone %s", entity)
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_CALCULATE] = const.ATTR_CALCULATE
                        data[const.ATTR_DELETE_WEATHER_DATA] = call.data.get(
                            const.ATTR_DELETE_WEATHER_DATA, True
                        )
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_update_all_zones(self, call):
        """Update all zones."""
        _LOGGER.info("Update all zones service called")
        await self._async_update_all()

    async def handle_update_zone(self, call):
        """Update specific zone."""
        if const.SERVICE_ENTITY_ID in call.data:
            for entity in call.data[const.SERVICE_ENTITY_ID]:
                _LOGGER.info("Update zone service called for zone %s", entity)
                # find entity zone id and call update on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_UPDATE] = const.ATTR_UPDATE
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_reset_bucket(self, call):
        """Reset a specific zone bucket to 0."""
        if const.SERVICE_ENTITY_ID in call.data:
            eid = call.data[const.SERVICE_ENTITY_ID]
            if not isinstance(eid, list):
                eid = [call.data[const.SERVICE_ENTITY_ID]]
            for entity in eid:
                _LOGGER.info("Reset bucket service called for zone %s", entity)
                # find entity zone id and call calculate on the zone
                state = self.hass.states.get(entity)
                if state:
                    # find zone_id for zone with name
                    zone_id = state.attributes.get(const.ZONE_ID)
                    if zone_id is not None:
                        data = {}
                        data[const.ATTR_SET_BUCKET] = {}
                        data[const.ATTR_NEW_BUCKET_VALUE] = 0
                        await self.async_update_zone_config(zone_id=zone_id, data=data)

    async def handle_reset_all_buckets(self, call):
        """Reset all buckets to 0."""
        _LOGGER.info("Reset all buckets service called")
        await self._async_set_all_buckets(0)

    async def handle_set_all_buckets(self, call):
        """Reset all buckets to new value."""
        if const.ATTR_NEW_BUCKET_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_BUCKET_VALUE]
            _LOGGER.info("Set all buckets service called, new value: %s", new_value)
            await self._async_set_all_buckets(new_value)

    async def handle_set_zone(self, call):
        """Reset a specific zone state to new value."""
        if const.SERVICE_ENTITY_ID not in call.data:
            return

        eid = call.data[const.SERVICE_ENTITY_ID]
        if not isinstance(eid, list):
            eid = [call.data[const.SERVICE_ENTITY_ID]]

        data = call.data.copy()
        data.pop(const.SERVICE_ENTITY_ID)

        for entity in eid:
            _LOGGER.info("Set zone data service called with zone %s", entity)

            # find entity zone id and call calculate on the zone
            state = self.hass.states.get(entity)
            if not state:
                raise SmartIrrigationError(f"No state found for entity {entity}")

            # find zone_id for zone with name
            zone_id = state.attributes.get(const.ZONE_ID)
            if zone_id is None:
                raise SmartIrrigationError("No zone_id found in state attributes.")

            zone = self.store.get_zone(zone_id)
            zone_data = {}
            count = 0
            for v in data:
                if (
                    v not in const.LIST_SET_ZONE_ALLOWED_ARGS
                    and v != const.SERVICE_ENTITY_ID
                ):
                    raise SmartIrrigationError(f"Argument ({v}) is not allowed")

                if (
                    v == const.ATTR_NEW_DURATION_VALUE
                    and zone.get(const.ZONE_STATE) != const.ZONE_STATE_MANUAL
                ):
                    raise SmartIrrigationError(
                        "Can only set duration if zone state is set to manual."
                    )
                if v == const.ATTR_NEW_BUCKET_VALUE and data[v] > zone.get(
                    const.ZONE_MAXIMUM_BUCKET
                ):
                    raise SmartIrrigationError(
                        "Bucket size is above maximmum bucket allowed value."
                    )
                if v == const.ATTR_NEW_STATE_VALUE and data[v] in const.ZONE_STATE:
                    raise SmartIrrigationError(
                        f"Invalid value ({data[v]}) for zone state."
                    )

                m = re.match("^new_(.+)_value$", v)
                if m:
                    zone_data[m.group(1)] = data[v]
                    _LOGGER.info("Setting value for %s", m.group(1))
                    count += 1

            if count == 0:
                raise SmartIrrigationError("No valid parameter provided")

            if count > 0:
                await self.store.async_update_zone(zone_id, zone_data)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone_id,
                )

    async def handle_set_all_multipliers(self, call):
        """Reset all multipliers to new value."""
        if const.ATTR_NEW_MULTIPLIER_VALUE in call.data:
            new_value = call.data[const.ATTR_NEW_MULTIPLIER_VALUE]
            _LOGGER.info("Set all multipliers service called, new value: %s", new_value)
            await self._async_set_all_multipliers(new_value)

    async def handle_clear_weatherdata(self, call):
        """Clear all collected weatherdata."""
        await self._async_clear_all_weatherdata()

    async def handle_generate_watering_calendar(self, call):
        """Generate watering calendar service handler."""
        zone_id = call.data.get("zone_id")

        if zone_id is not None:
            zone_id = int(zone_id)

        _LOGGER.info("Generate watering calendar service called for zone %s", zone_id)

        try:
            calendar_data = await self.async_generate_watering_calendar(zone_id)

            # Store the result in hass.data for retrieval by automation
            if "watering_calendars" not in self.hass.data[const.DOMAIN]:
                self.hass.data[const.DOMAIN]["watering_calendars"] = {}

            self.hass.data[const.DOMAIN]["watering_calendars"]["last_generated"] = (
                calendar_data
            )

            # Fire an event with the calendar data
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_generated",
                {
                    "zone_id": zone_id,
                    "calendar_data": calendar_data,
                    "generated_at": datetime.datetime.now().isoformat(),
                },
            )

            _LOGGER.info(
                "Watering calendar generated successfully for %s zones",
                len(calendar_data),
            )

        except Exception as e:
            _LOGGER.error("Failed to generate watering calendar: %s", e)
            self.hass.bus.fire(
                f"{const.DOMAIN}_watering_calendar_error",
                {
                    "zone_id": zone_id,
                    "error": str(e),
                    "generated_at": datetime.datetime.now().isoformat(),
                },
            )

    async def async_generate_watering_calendar(self, zone_id: int | None = None):
        """Generate a 12-month watering calendar for a zone or all zones.

        Args:
            zone_id: The ID of the zone to generate calendar for. If None, generates for all zones.

        Returns:
            dict: Dictionary mapping zone IDs to their 12-month watering calendars.
        """
        _LOGGER.debug(
            "[async_generate_watering_calendar]: generating calendar for zone %s",
            zone_id,
        )

        # Get zones to process
        if zone_id is not None:
            zone = self.store.get_zone(zone_id)
            if not zone:
                raise SmartIrrigationError(f"Zone {zone_id} not found")
            zones = [zone]
        else:
            zones = await self.store.async_get_zones()

        calendar_data = {}

        for zone in zones:
            zone_id = zone.get(const.ZONE_ID)
            zone_name = zone.get(const.ZONE_NAME)

            _LOGGER.debug(
                "[async_generate_watering_calendar]: processing zone %s (%s)",
                zone_id,
                zone_name,
            )

            # Skip disabled zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                _LOGGER.debug(
                    "[async_generate_watering_calendar]: skipping disabled zone %s",
                    zone_id,
                )
                continue

            try:
                monthly_calendar = await self._calculate_monthly_watering_for_zone(zone)
                calendar_data[zone_id] = {
                    "zone_name": zone_name,
                    "zone_id": zone_id,
                    "monthly_estimates": monthly_calendar,
                    "generated_at": datetime.datetime.now().isoformat(),
                    "calculation_method": self._get_zone_calculation_method(zone),
                }
            except Exception as e:
                _LOGGER.warning(
                    "[async_generate_watering_calendar]: failed to calculate calendar for zone %s: %s",
                    zone_id,
                    e,
                )
                calendar_data[zone_id] = {
                    "zone_name": zone_name,
                    "zone_id": zone_id,
                    "monthly_estimates": [],
                    "error": str(e),
                    "generated_at": datetime.datetime.now().isoformat(),
                }

        return calendar_data

    async def _calculate_monthly_watering_for_zone(self, zone):
        """Calculate monthly watering estimates for a specific zone.

        Args:
            zone: The zone dictionary containing configuration.

        Returns:
            list: List of 12 monthly estimates with watering volumes.
        """
        mapping_id = zone.get(const.ZONE_MAPPING)
        module_id = zone.get(const.ZONE_MODULE)

        if mapping_id is None or module_id is None:
            raise SmartIrrigationError(
                f"Zone {zone.get(const.ZONE_ID)} missing mapping or module configuration"
            )

        # Get the calculation module instance
        modinst = await self.getModuleInstanceByID(module_id)
        if not modinst:
            raise SmartIrrigationError(
                f"Cannot load calculation module for zone {zone.get(const.ZONE_ID)}"
            )

        # Generate representative monthly climate data based on location
        monthly_data = self._generate_monthly_climate_data()

        monthly_estimates = []

        for month in range(1, 13):
            month_name = datetime.datetime(2024, month, 1).strftime("%B")
            month_data = monthly_data[month - 1]

            try:
                # Calculate ET and watering needs for this month using the zone's module
                if modinst.name == "PyETO":
                    et_estimate = self._calculate_monthly_et_pyeto(
                        month_data, modinst, month
                    )
                elif modinst.name == "Static":
                    et_estimate = modinst.calculate()
                else:
                    # For other modules like Passthrough, use a simple estimation
                    et_estimate = (
                        month_data.get("average_daily_et", 3.0) * 30
                    )  # mm/month

                # Calculate watering volume based on zone parameters
                watering_volume = self._calculate_monthly_watering_volume(
                    zone, et_estimate, month_data
                )

                monthly_estimates.append(
                    {
                        "month": month,
                        "month_name": month_name,
                        "estimated_et_mm": round(et_estimate, 2),
                        "estimated_watering_volume_liters": round(watering_volume, 1),
                        "average_temperature_c": month_data.get("avg_temp", 20.0),
                        "average_precipitation_mm": month_data.get(
                            "precipitation", 50.0
                        ),
                        "calculation_notes": f"Based on typical {month_name} climate patterns",
                    }
                )

            except Exception as e:
                _LOGGER.warning(
                    "[_calculate_monthly_watering_for_zone]: failed to calculate month %s for zone %s: %s",
                    month,
                    zone.get(const.ZONE_ID),
                    e,
                )
                monthly_estimates.append(
                    {
                        "month": month,
                        "month_name": month_name,
                        "estimated_et_mm": 0.0,
                        "estimated_watering_volume_liters": 0.0,
                        "error": str(e),
                    }
                )

        return monthly_estimates

    def _generate_monthly_climate_data(self):
        """Generate representative monthly climate data based on latitude.

        Returns:
            list: List of 12 monthly climate data dictionaries.
        """
        # Get latitude for seasonal variation (default to temperate zone if not available)
        latitude = abs(self._latitude or 45.0)

        # Base temperatures and seasonal variations based on latitude
        if latitude < 23.5:  # Tropical
            base_temp = 27.0
            temp_variation = 3.0
        elif latitude < 45.0:  # Subtropical
            base_temp = 22.0
            temp_variation = 8.0
        else:  # Temperate
            base_temp = 15.0
            temp_variation = 15.0

        monthly_data = []

        for month in range(1, 13):
            # Calculate seasonal temperature variation
            temp_factor = math.cos((month - 7) * math.pi / 6)  # Peak in July (month 7)
            if self._latitude and self._latitude < 0:  # Southern hemisphere
                temp_factor = -temp_factor

            avg_temp = base_temp + (temp_variation * temp_factor)
            min_temp = avg_temp - 5.0
            max_temp = avg_temp + 5.0

            # Simple precipitation model (more in winter for temperate, varies by location)
            if latitude > 35.0:  # Temperate zones
                precip_factor = 1.5 - 0.5 * math.cos(
                    (month - 1) * math.pi / 6
                )  # More in winter
            else:  # Tropical/subtropical
                precip_factor = 1.0 + 0.3 * math.sin(
                    (month - 1) * math.pi / 6
                )  # Slight seasonal variation

            precipitation = 60.0 * precip_factor  # Base 60mm/month

            # Humidity varies seasonally (higher in winter for temperate zones)
            humidity = 65.0 + 15.0 * math.cos((month - 7) * math.pi / 6)

            # Wind speed (slightly higher in winter)
            wind_speed = 3.0 + 1.0 * math.cos((month - 7) * math.pi / 6)

            # Pressure (standard sea level, adjusted for elevation)
            pressure = altitudeToPressure(self._elevation or 0)

            # Dewpoint estimation
            dewpoint = avg_temp - ((100 - humidity) / 5)

            monthly_data.append(
                {
                    "month": month,
                    "avg_temp": avg_temp,
                    "min_temp": min_temp,
                    "max_temp": max_temp,
                    "precipitation": precipitation,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "pressure": pressure,
                    "dewpoint": dewpoint,
                    "average_daily_et": 2.0
                    + 2.0 * math.cos((month - 7) * math.pi / 6),  # Higher ET in summer
                }
            )

        return monthly_data

    def _calculate_monthly_et_pyeto(self, month_data, modinst, month):
        """Calculate monthly ET using PyETO module.

        Args:
            month_data: Monthly climate data dictionary.
            modinst: PyETO module instance.
            month: Month number (1-12).

        Returns:
            float: Monthly ET estimate in mm.
        """
        # Create weather data in the format expected by PyETO
        weather_data = {
            const.MAPPING_TEMPERATURE: month_data["avg_temp"],
            const.MAPPING_MIN_TEMP: month_data["min_temp"],
            const.MAPPING_MAX_TEMP: month_data["max_temp"],
            const.MAPPING_PRECIPITATION: month_data["precipitation"],
            const.MAPPING_HUMIDITY: month_data["humidity"],
            const.MAPPING_WINDSPEED: month_data["wind_speed"],
            const.MAPPING_PRESSURE: month_data["pressure"],
            const.MAPPING_DEWPOINT: month_data["dewpoint"],
        }

        # Calculate daily ET and scale to monthly
        daily_et_delta = modinst.calculate_et_for_day(weather_data, hour_multiplier=1.0)

        # Get days in month
        import calendar

        days_in_month = calendar.monthrange(2024, month)[
            1
        ]  # Use 2024 as reference year

        # Convert daily ET delta to monthly total (remove precipitation since we want just ET)
        daily_et = abs(daily_et_delta) + month_data["precipitation"] / days_in_month
        monthly_et = daily_et * days_in_month

        return monthly_et

    def _calculate_monthly_watering_volume(self, zone, et_mm, month_data):
        """Calculate monthly watering volume in liters for a zone.

        Args:
            zone: Zone configuration dictionary.
            et_mm: Monthly evapotranspiration in mm.
            month_data: Monthly climate data.

        Returns:
            float: Watering volume in liters.
        """
        zone_size_m2 = zone.get(const.ZONE_SIZE, 1.0)  # Default 1 m²
        multiplier = zone.get(const.ZONE_MULTIPLIER, 1.0)
        precipitation_mm = month_data.get("precipitation", 0.0)

        # Convert from imperial if needed
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        if not ha_config_is_metric:
            zone_size_m2 = convert_between(
                const.UNIT_SQ_FT, const.UNIT_M2, zone_size_m2
            )

        # Calculate net water need (ET minus precipitation)
        net_water_need_mm = max(0, et_mm - precipitation_mm)

        # Apply zone multiplier
        adjusted_water_need_mm = net_water_need_mm * multiplier

        # Convert mm over area to liters (1mm over 1m² = 1 liter)
        volume_liters = adjusted_water_need_mm * zone_size_m2

        return volume_liters

    def _get_zone_calculation_method(self, zone):
        """Get the calculation method description for a zone.

        Args:
            zone: Zone configuration dictionary.

        Returns:
            str: Description of the calculation method used.
        """
        module_id = zone.get(const.ZONE_MODULE)
        if module_id is None:
            return "No calculation module configured"

        module = self.store.get_module(module_id)
        if module is None:
            return f"Module {module_id} not found"

        method_name = module.get(const.MODULE_NAME, "Unknown")

        if method_name == "PyETO":
            return "FAO-56 Penman-Monteith method using PyETO"
        if method_name == "Static":
            return "Static evapotranspiration rate"
        if method_name == "Passthrough":
            return "Direct evapotranspiration input"
        return f"{method_name} calculation method"


@callback
def register_services(hass: HomeAssistant):
    """Register services used by Smart Irrigation integration."""

    coordinator = hass.data[const.DOMAIN]["coordinator"]

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CALCULATE_ALL_ZONES,
        coordinator.handle_calculate_all_zones,
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_CALCULATE_ZONE, coordinator.handle_calculate_zone
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_UPDATE_ALL_ZONES,
        coordinator.handle_update_all_zones,
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_UPDATE_ZONE, coordinator.handle_update_zone
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_RESET_BUCKET, coordinator.handle_reset_bucket
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_RESET_ALL_BUCKETS,
        coordinator.handle_reset_all_buckets,
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_BUCKET, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_ALL_BUCKETS, coordinator.handle_set_all_buckets
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CLEAR_WEATHERDATA,
        coordinator.handle_clear_weatherdata,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_SET_ALL_MULTIPLIERS,
        coordinator.handle_set_all_multipliers,
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_MULTIPLIER, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_ZONE, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_GENERATE_WATERING_CALENDAR,
        coordinator.handle_generate_watering_calendar,
    )
