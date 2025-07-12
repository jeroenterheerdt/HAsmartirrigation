"""The Smart Irrigation Integration."""

import contextlib
import datetime
import logging
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
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import (
    altitudeToPressure,
    check_time,
    convert_between,
    convert_list_to_dict,
    convert_mapping_to_metric,
    loadModules,
    relative_to_absolute_pressure,
)
from .localize import localize
from .panel import async_register_panel, async_unregister_panel
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

    async_unregister_panel(hass)
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    await coordinator.async_unload()
    return True


async def async_remove_entry(hass: HomeAssistant, entry):
    """Remove Smart Irrigation config entry."""
    async_unregister_panel(hass)
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
            )
        elif self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = None
            await self.store.async_update_config(data)

    async def update_subscriptions(self, config=None):
        """Update sensor subscriptions for Smart Irrigation coordinator."""
        # WIP v2024.6.X: move to subscriptions
        # remove all existing sensor subscriptions
        _LOGGER.debug("[update_subscriptions]: removing all sensor subscriptions")
        for s in self._sensor_subscriptions:
            with contextlib.suppress(Exception):
                s()

        # check if continuous updates are enabled, if not, skip this
        # and log a debug message
        if config is None:
            config = await self.store.async_get_config()
        if not config.get(const.CONF_CONTINUOUS_UPDATES):
            _LOGGER.debug(
                "[update_subscriptions]: continuous updates are disabled, skipping"
            )
            return

        # subscribe to all sensors
        self._sensors_to_subscribe_to = await self.get_sensors_to_subscribe_to()

        if self._sensors_to_subscribe_to is not None:
            for s in self._sensors_to_subscribe_to:
                _LOGGER.debug("[update_subscriptions]: subscribing to %s", s)
                self._sensor_subscriptions.append(
                    async_track_state_change_event(
                        self.hass,
                        s,
                        self.async_sensor_state_changed,
                    )
                )

    async def get_sensors_to_subscribe_to(self):
        """Return a list of sensor entity IDs to subscribe to for state changes."""
        zones = await self.store.async_get_zones()
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        sensors_to_subscribe_to = []
        # loop over the mappings and store sensor data
        for mapping_id in mappings:
            (
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            mapping = self.store.get_mapping(mapping_id)
            _LOGGER.debug(
                "[get_sensors_to_subscribe_to]: mapping %s: %s",
                mapping_id,
                mapping[const.MAPPING_MAPPINGS],
            )
            if sensor_in_mapping:
                for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
                    _LOGGER.debug("[get_sensors_to_subscribe_to]: %s %s", key, the_map)
                    if not isinstance(the_map, str):
                        if the_map.get(
                            const.MAPPING_CONF_SOURCE
                        ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(
                            const.MAPPING_CONF_SENSOR
                        ):
                            # this mapping maps to a sensor, so retrieve its value from HA
                            if (
                                the_map.get(const.MAPPING_CONF_SENSOR)
                                not in sensors_to_subscribe_to
                            ):
                                sensors_to_subscribe_to.append(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                )
                            else:
                                _LOGGER.debug(
                                    "[get_sensors_to_subscribe_to]: already added"
                                )
                        else:
                            _LOGGER.debug(
                                "[get_sensors_to_subscribe_to]: not mapped to a sensor"
                            )
                    else:
                        _LOGGER.debug(
                            "[get_sensors_to_subscribe_to]: the_map is a str, skipping"
                        )
            else:
                _LOGGER.debug("[get_sensors_to_subscribe_to]: sensor not in mapping")

        return sensors_to_subscribe_to

    async def async_sensor_state_changed(
        self, event: Event
    ) -> None:  # old signature: entity, old_state, new_state):
        """Handle a sensor state change event."""
        timestamp = datetime.datetime.now()

        # old_state_obj = event.data.get("old_state")
        new_state_obj: State | None = event.data.get("new_state")
        if new_state_obj is None:
            return
        entity = event.data.get("entity_id")
        the_new_state = new_state_obj.state

        # ignore states that don't have an actual value
        if new_state_obj.state in [None, STATE_UNKNOWN, STATE_UNAVAILABLE]:
            _LOGGER.debug(
                "[async_sensor_state_changed]: new state for %s is %s, ignoring",
                entity,
                the_new_state,
            )
            return
        _LOGGER.debug(
            "[async_sensor_state_changed]: new state for %s is %s",
            entity,
            the_new_state,
        )

        # get sensor debounce time from config
        debounce = 0
        the_config = await self.store.async_get_config()
        if the_config[const.CONF_SENSOR_DEBOUNCE]:
            debounce = int(the_config[const.CONF_SENSOR_DEBOUNCE])
            _LOGGER.debug(
                "[async_sensor_state_changed]: sensor debounce is %s ms", debounce
            )

        # get the mapping that uses this sensor
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:
            if mapping.get(const.MAPPING_MAPPINGS):
                for key, val in mapping.get(const.MAPPING_MAPPINGS).items():
                    if (
                        isinstance(val, str)
                        or val.get(const.MAPPING_CONF_SENSOR) != entity
                    ) and val.get(
                        const.MAPPING_CONF_SOURCE
                    ) != const.MAPPING_CONF_SOURCE_STATIC_VALUE:
                        continue

                    if (
                        val.get(const.MAPPING_CONF_SOURCE)
                        == const.MAPPING_CONF_SOURCE_STATIC_VALUE
                    ):
                        the_new_state = val.get(const.MAPPING_CONF_STATIC_VALUE)
                    # add the mapping data with the new sensor value
                    if the_new_state is None:
                        continue

                    if const.MAPPING_DATA in mapping:
                        mapping_data = mapping.get(const.MAPPING_DATA)
                    else:
                        mapping_data = []
                    # conversion to metric
                    mapping_data.append(
                        {
                            key: convert_mapping_to_metric(
                                float(the_new_state),
                                key,
                                val.get(const.MAPPING_CONF_UNIT),
                                self.hass.config.units is METRIC_SYSTEM,
                            ),
                            const.RETRIEVED_AT: timestamp,
                        }
                    )
                    # store the value in the last entry
                    data_last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
                    if data_last_entry is None or len(data_last_entry) == 0:
                        data_last_entry = {}
                    if isinstance(data_last_entry, list):
                        data_last_entry = convert_list_to_dict(data_last_entry)
                    data_last_entry[key] = mapping_data[-1][key]
                    changes = {
                        const.MAPPING_DATA: mapping_data,
                        const.MAPPING_DATA_LAST_UPDATED: timestamp,
                        const.MAPPING_DATA_LAST_ENTRY: data_last_entry,
                    }
                    await self.store.async_update_mapping(
                        mapping.get(const.MAPPING_ID), changes
                    )
                    _LOGGER.debug(
                        "[async_sensor_state_changed]: updated sensor group %s %s",
                        mapping.get(const.MAPPING_ID),
                        key,
                    )

            mapping_id = mapping.get(const.MAPPING_ID)
            if debounce > 0:
                # Cancel any previously scheduled update
                if self._debounced_update_cancel:
                    _LOGGER.debug(
                        "[async_sensor_state_changed]: cancelling previously scheduled update"
                    )
                    self._debounced_update_cancel()

                # Schedule the update
                _LOGGER.debug(
                    "[async_sensor_state_changed]: scheduling update in %s ms", debounce
                )
                self._debounced_update_cancel = async_call_later(
                    self.hass,
                    timedelta(milliseconds=debounce),
                    # This callback may run off-loop, so use call_soon_threadsafe
                    lambda now, mid=mapping_id: self.hass.loop.call_soon_threadsafe(
                        self.hass.async_create_task,
                        self.async_continuous_update_for_mapping(mid),
                    ),
                )
            else:
                _LOGGER.debug(
                    "[async_sensor_state_changed]: no debounce, doing update now"
                )
                await self.async_continuous_update_for_mapping(mapping_id)

    async def async_continuous_update_for_mapping(self, mapping_id):
        """Perform a continuous update for a specific mapping if it does not use a weather service.

        Args:
            mapping_id: The ID of the mapping to update.

        This method checks if the mapping uses a weather service to avoid unnecessary API calls,
        and if not, updates and calculates all automatic zones that use this mapping, assuming their modules do not use forecasting.

        """
        self._debounced_update_cancel = None

        if mapping_id is None:
            return
        mapping = self.store.get_mapping(mapping_id)
        if mapping is None:
            return

        _LOGGER.info(
            "[async_continuous_update_for_mapping] considering sensor group %s",
            mapping_id,
        )
        if self.check_mapping_sources(mapping_id)[0]:
            _LOGGER.info(
                "[async_continuous_update_for_mapping] sensor group uses weather service, skipping automatic update to avoid API calls that can incur costs"
            )
            return

        # mapping does not use Weather Service
        zones = await self._get_zones_that_use_this_mapping(mapping_id)
        zones_to_calculate = []
        for z in zones:
            zones_to_calculate.append(z)
            zone = self.store.get_zone(z)
            if zone is None or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] zone %s is not automatic, skipping",
                    z,
                )
                continue
            if zone.get(const.ZONE_MODULE) is None:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] zone %s has no module, skipping",
                    z,
                )
                continue

            # check the module is not pyeto or if it is, that it does not use forecasting
            mod = self.store.get_module(zone.get(const.ZONE_MODULE))
            if mod is None:
                continue

            can_calculate = False
            if mod.get(const.MODULE_NAME) != "PyETO":
                can_calculate = True
                _LOGGER.info(
                    "[async_continuous_update_for_mapping]: module is not PyETO, so we can calculate for zone %s",
                    zone.get(const.ZONE_ID),
                )
            else:
                # module is PyETO. Check the config for forecast days == 0
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping]: module is PyETO, checking config"
                )
                if mod.get(const.MODULE_CONFIG):
                    _LOGGER.debug(
                        "[async_continuous_update_for_mapping]: module has config: %s",
                        mod.get(const.MODULE_CONFIG),
                    )
                    _LOGGER.debug(
                        "[async_continuous_update_for_mapping]: mod.get(forecast_days,0) returns forecast_days: %s",
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 0
                        ),
                    )
                    # there is a config on the module, so let's check it
                    if (
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 0
                        )
                        == 0
                        or mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS
                        )
                        == "0"
                        or mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS
                        )
                        is None
                    ):
                        can_calculate = True
                        _LOGGER.info(
                            "Checked config for PyETO module on zone %s, forecast_days==0 or None, so we can calculate",
                            zone.get(const.ZONE_ID),
                        )
                    else:
                        _LOGGER.info(
                            "Checked config for PyETO module on zone %s, forecast_days>0, skipping to avoid API calls that can incur costs",
                            zone.get(const.ZONE_ID),
                        )
                else:
                    # default config for pyeto is forecast = 0, since there is no config we can calculate
                    can_calculate = True
                    _LOGGER.info(
                        "[async_continuous_update_for_mapping] for sensor group %s: sensor group does use weather service, skipping automatic update to avoid API calls that can incur costs",
                        mapping_id,
                    )

            _LOGGER.debug(
                "[async_continuous_update_for_mapping]: can_calculate: %s",
                can_calculate,
            )
            if can_calculate:
                # get the zone and calculate
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping] for sensor group %s: calculating zone %s",
                    mapping_id,
                    zone.get(const.ZONE_ID),
                )
                await self.async_calculate_zone(
                    z,
                    continuous_updates=True,
                )
                zones_to_calculate.remove(z)
            else:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] for sensor group %s: zone %s has module %s that uses forecasting, skipping to avoid API calls that can incur costs",
                    mapping_id,
                    z,
                    mod.get(const.MODULE_NAME),
                )

        # remove weather data from this mapping unless there are zones we did not calculate!
        _LOGGER.debug(
            "[async_continuous_update_for_mapping] for sensor group %s: zones_to_calculate: %s. if this is empty this means that all zones for this sensor group have been calculated and therefore we can remove the weather data",
            mapping_id,
            zones_to_calculate,
        )
        if zones_to_calculate and len(zones_to_calculate) > 0:
            _LOGGER.debug(
                "[async_continuous_update_for_mapping] for sensor group %s: did not calculate all zones, keeping weather data for the sensor group",
                mapping_id,
            )
        else:
            _LOGGER.debug(
                "clearing weather data for sensor group %s since we calculated all dependent zones",
                mapping_id,
            )
            changes = {}
            changes = self.clear_weatherdata_for_mapping(mapping)
            await self.store.async_update_mapping(mapping_id, changes=changes)

    def clear_weatherdata_for_mapping(self, mapping):
        """Clear weather data for a given mapping and reset last updated timestamp.

        Args:
            mapping: The mapping dictionary to clear weather data for.

        Returns:
            dict: A dictionary with cleared weather data and reset last updated timestamp.

        """
        return {
            const.MAPPING_DATA: [],
            const.MAPPING_DATA_LAST_UPDATED: None,
        }

    async def set_up_auto_calc_time(self, data):
        """Set up the automatic calculation time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_calc_time_unsub:
            self._track_auto_calc_time_unsub()
            self._track_auto_calc_time_unsub = None
        if data[const.CONF_AUTO_CALC_ENABLED]:
            # make sure to unsub any existing and add for calc time
            if check_time(data[const.CONF_CALC_TIME]):
                # make sure we track this time and at that moment trigger the refresh of all modules of all zones that are on automatic
                timesplit = data[const.CONF_CALC_TIME].split(":")
                self._track_auto_calc_time_unsub = async_track_time_change(
                    self.hass,
                    self._async_calculate_all,
                    hour=timesplit[0],
                    minute=timesplit[1],
                    second=0,
                )
                _LOGGER.info(
                    "Scheduled auto calculate for %s", data[const.CONF_CALC_TIME]
                )
            else:
                _LOGGER.warning(
                    "Scheduled auto calculate time is not valid: %s",
                    data[const.CONF_CALC_TIME],
                )
                # raise ValueError("Time is not a valid time")
        else:
            # set OWM client cache to 0
            if self._WeatherServiceClient:
                self._WeatherServiceClient.cache_seconds = 0
            # remove all time trackers
            if self._track_auto_calc_time_unsub:
                self._track_auto_calc_time_unsub()
                self._track_auto_calc_time_unsub = None
            await self.store.async_update_config(data)

    async def set_up_auto_clear_time(self, data):
        """Set up the automatic clear time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_clear_time_unsub:
            self._track_auto_clear_time_unsub()
            self._track_auto_clear_time_unsub = None
        if data[const.CONF_AUTO_CLEAR_ENABLED]:
            # make sure to unsub any existing and add for clear time
            if check_time(data[const.CONF_CLEAR_TIME]):
                timesplit = data[const.CONF_CLEAR_TIME].split(":")

                self._track_auto_clear_time_unsub = async_track_time_change(
                    self.hass,
                    self._async_clear_all_weatherdata,
                    hour=timesplit[0],
                    minute=timesplit[1],
                    second=0,
                )
                _LOGGER.info(
                    "Scheduled auto clear of weatherdata for %s",
                    data[const.CONF_CLEAR_TIME],
                )
            else:
                _LOGGER.warning(
                    "Scheduled auto clear time is not valid: %s",
                    data[const.CONF_CLEAR_TIME],
                )
                raise ValueError("Time is not a valid time")
        await self.store.async_update_config(data)

    async def track_update_time(self, *args):
        """Track and schedule periodic updates for Smart Irrigation based on configuration."""
        # perform update once
        # Fire-and-forget: trigger immediate update in background
        self.hass.async_create_task(self._async_update_all())
        # use async_track_time_interval
        data = await self.store.async_get_config()
        the_time_delta = None
        interval = int(data[const.CONF_AUTO_UPDATE_INTERVAL])
        if data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_DAILY:
            # track time X days
            the_time_delta = timedelta(days=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_HOURLY:
            # track time X hours
            the_time_delta = timedelta(hours=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_MINUTELY:
            # track time X minutes
            the_time_delta = timedelta(minutes=interval)
        # update cache for OWMClient to time delta in seconds -1
        if self._WeatherServiceClient:
            self._WeatherServiceClient.cache_seconds = (
                the_time_delta.total_seconds() - 1
            )

        if self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = None
        self._track_auto_update_time_unsub = async_track_time_interval(
            self.hass, self._async_update_all, the_time_delta
        )
        _LOGGER.info("Scheduled auto update time interval for each %s", the_time_delta)

    async def _get_unique_mappings_for_automatic_zones(self, zones):
        mappings = [
            zone.get(const.ZONE_MAPPING)
            for zone in zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
        ]
        # remove duplicates
        return list(set(mappings))

    async def _get_zones_that_use_this_mapping(self, mapping):
        """Return a list of zone IDs that use the specified mapping."""
        return [
            z.get(const.ZONE_ID)
            for z in await self.store.async_get_zones()
            if z.get(const.ZONE_MAPPING) == mapping
        ]

    async def _async_update_all(self, *args):
        # update the weather data for all mappings for all zones that are automatic here and store it.
        # in _async_calculate_all we need to read that data back and if there is none, we log an error, otherwise apply aggregate and use data
        # this should skip any pure sensor zones if continuous updates is enabled, otherwise it should include them
        _LOGGER.info("Updating weather data for all automatic zones")
        zones = await self.store.async_get_zones()
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        # loop over the mappings and store sensor data
        for mapping_id in mappings:
            (
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            the_config = await self.store.async_get_config()
            if the_config.get(const.CONF_CONTINUOUS_UPDATES) and not owm_in_mapping:
                # if continuous updates are enabled, we do not need to update the mappings here for pure sensor mappings
                _LOGGER.debug(
                    "Continuous updates are enabled, skipping update for sensor group %s because it is not dependent on weather service and should already be included in the continuous updates",
                    mapping_id,
                )
                continue
            _LOGGER.debug(
                "Continuous updates are enabled, but updating sensor group %s as part of scheduled updates because it is dependent on weather service and therefore is not included in continuous updates",
                mapping_id,
            )
            mapping = self.store.get_mapping(mapping_id)
            weatherdata = None
            if self.use_weather_service and owm_in_mapping:
                # retrieve data from OWM
                weatherdata = await self.hass.async_add_executor_job(
                    self._WeatherServiceClient.get_data
                )

            if sensor_in_mapping:
                sensor_values = self.build_sensor_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, sensor_values
                )
            if static_in_mapping:
                static_values = self.build_static_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, static_values
                )
            if sensor_in_mapping or static_in_mapping:
                # if pressure type is set to relative, replace it with absolute. not necessary for OWM as it already happened
                # convert the relative pressure to absolute or estimate from height
                if (
                    mapping.get(const.MAPPING_MAPPINGS)
                    .get(const.MAPPING_PRESSURE)
                    .get(const.MAPPING_CONF_PRESSURE_TYPE)
                    == const.MAPPING_CONF_PRESSURE_RELATIVE
                ):
                    if const.MAPPING_PRESSURE in weatherdata:
                        weatherdata[const.MAPPING_PRESSURE] = (
                            relative_to_absolute_pressure(
                                weatherdata[const.MAPPING_PRESSURE],
                                self.hass.config.as_dict().get(CONF_ELEVATION),
                            )
                        )
                    else:
                        weatherdata[const.MAPPING_PRESSURE] = altitudeToPressure(
                            self.hass.config.as_dict().get(CONF_ELEVATION)
                        )

            # add the weatherdata value to the mappings sensor values
            if mapping is not None and weatherdata is not None:
                weatherdata[const.RETRIEVED_AT] = datetime.datetime.now()
                mapping_data = mapping[const.MAPPING_DATA]
                if isinstance(mapping_data, list):
                    mapping_data.append(weatherdata)
                elif isinstance(mapping_data, str):
                    mapping_data = [weatherdata]
                else:
                    _LOGGER.error(
                        "[async_update_all]: sensor group is unexpected type: %s",
                        mapping_data,
                    )
                _LOGGER.debug(
                    "async_update_all for mapping %s new weatherdata: %s",
                    mapping_id,
                    weatherdata,
                )
                changes = {
                    "data": mapping_data,
                    const.MAPPING_DATA_LAST_UPDATED: datetime.datetime.now(),
                }
                await self.store.async_update_mapping(mapping_id, changes)
                # store last updated and number of data points in the zone here.
                changes_to_zone = {
                    const.ZONE_LAST_UPDATED: changes[const.MAPPING_DATA_LAST_UPDATED],
                    const.ZONE_NUMBER_OF_DATA_POINTS: len(mapping_data) - 1,
                }
                zones_to_loop = await self._get_zones_that_use_this_mapping(mapping_id)
                for z in zones_to_loop:
                    await self.store.async_update_zone(z, changes_to_zone)
                    async_dispatcher_send(
                        self.hass,
                        const.DOMAIN + "_config_updated",
                        z,
                    )
            else:
                if mapping is None:
                    _LOGGER.warning(
                        "[async_update_all] Unable to find sensor group with id: %s",
                        mapping_id,
                    )
                if weatherdata is None:
                    _LOGGER.warning(
                        "[async_update_all] No weather data to parse for sensor group %s",
                        mapping_id,
                    )

    async def merge_weatherdata_and_sensor_values(self, wd, sv):
        """Merge weather data and sensor values dictionaries, giving precedence to sensor values.

        Args:
            wd: The weather data dictionary or None.
            sv: The sensor values dictionary or None.

        Returns:
            dict: A merged dictionary with sensor values overriding weather data where keys overlap.

        """
        if wd is None:
            return sv
        if sv is None:
            return wd
        retval = wd
        for key, val in sv.items():
            if key in retval:
                _LOGGER.debug(
                    "merge_weatherdata_and_sensor_values, overriding %s value %s from OWM with %s from sensors",
                    key,
                    retval[key],
                    val,
                )
            else:
                _LOGGER.debug(
                    "merge_weatherdata_and_sensor_values, adding %s value %s from sensors",
                    key,
                    val,
                )
            retval[key] = val

        return retval

    async def apply_aggregates_to_mapping_data(
        self, zone, mapping, continuous_updates=False
    ):
        """Apply aggregation functions to mapping data and return the aggregated result.

        Args:
            zone: The zone dictionary for which to aggregate mapping data.
            mapping: The mapping dictionary containing sensor data.
            continuous_updates: Whether continuous updates are enabled.

        Returns:
            dict or None: Aggregated mapping data or None if no data is available.

        """
        _LOGGER.debug(
            "[apply_aggregates_to_mapping_data]: zone: %s mapping: %s", zone, mapping
        )
        if not mapping.get(const.MAPPING_DATA):
            return None

        data = mapping.get(const.MAPPING_DATA)
        _LOGGER.debug(
            "[apply_aggregates_to_mapping_data]: there is mapping data: %s", data
        )
        data_by_sensor = self._group_data_by_sensor(data)
        resultdata = {}

        self._handle_retrieved_at(data_by_sensor, zone, resultdata, continuous_updates)
        self._aggregate_sensor_data(data_by_sensor, mapping, resultdata)
        self._fill_missing_from_last_entry(mapping, resultdata)

        _LOGGER.debug("apply_aggregates_to_mapping_data returns %s", resultdata)
        return resultdata

    def _group_data_by_sensor(self, data):
        """Group mapping data by sensor key."""
        data_by_sensor = {}
        for d in data:
            if isinstance(d, dict):
                for key, val in d.items():
                    if val is not None:
                        data_by_sensor.setdefault(key, []).append(val)
        # Drop MAX and MIN temp mapping because we calculate it from temp
        data_by_sensor.pop(const.MAPPING_MAX_TEMP, None)
        data_by_sensor.pop(const.MAPPING_MIN_TEMP, None)
        return data_by_sensor

    def _handle_retrieved_at(
        self, data_by_sensor, zone, resultdata, continuous_updates
    ):
        """Process retrieved_at timestamps and update resultdata with multiplier."""
        if const.RETRIEVED_AT not in data_by_sensor:
            return
        retrieved_ats = data_by_sensor.pop(const.RETRIEVED_AT)
        hour_multiplier = 1.0
        date_format_string = "%Y-%m-%dT%H:%M:%S.%f"
        formatted_retrieved_ats = []
        for item in retrieved_ats:
            if isinstance(item, datetime.datetime):
                formatted_retrieved_ats.append(item)
            elif isinstance(item, str):
                formatted_retrieved_ats.append(
                    datetime.datetime.strptime(item, date_format_string)
                )
        if not formatted_retrieved_ats:
            return

        diff = None
        if not continuous_updates:
            first_retrieved_at = min(formatted_retrieved_ats)
            last_retrieved_at = max(formatted_retrieved_ats)
            diff = last_retrieved_at - first_retrieved_at
            _LOGGER.debug(
                "[apply_aggregates_to_mapping_data]: first_retrieved_at: %s, last_retrieved_at: %s",
                first_retrieved_at,
                last_retrieved_at,
            )
        else:
            # for continuous updates, use interval from last calculation to now
            val = zone[const.ZONE_LAST_CALCULATED]
            if not val:
                _LOGGER.debug(
                    "[apply_aggregates_to_mapping_data]: zone has never been calculated, skipping"
                )
                return
            if isinstance(val, datetime.datetime):
                # already in datetime format
                last_zone_calc = val
            else:
                # string format, parse to datetime
                last_zone_calc = datetime.datetime.strptime(val, date_format_string)
            diff = datetime.datetime.now() - last_zone_calc
            _LOGGER.debug(
                "[apply_aggregates_to_mapping_data]: zone last calculated: %s",
                last_zone_calc,
            )

        # Get interval in hours, then days
        diff_in_hours = abs(diff.total_seconds() / 3600)
        hour_multiplier = diff_in_hours / 24
        resultdata[const.MAPPING_DATA_MULTIPLIER] = hour_multiplier
        _LOGGER.debug(
            "[apply_aggregates_to_mapping_data]: diff: %s diff_in_seconds: %s, diff_in_hours: %s, hour_multiplier: %s",
            diff,
            diff.total_seconds(),
            diff_in_hours,
            hour_multiplier,
        )

    def _aggregate_sensor_data(self, data_by_sensor, mapping, resultdata):
        """Aggregate sensor data by configured or default aggregate."""
        for key, d in data_by_sensor.items():
            _LOGGER.debug(
                "[apply_aggregates_to_mapping_data]: aggregation loop: key: %s, d: %s, len(d): %s",
                key,
                d,
                len(d),
            )
            if len(d) > 1:
                d = [float(i) for i in d]
                _LOGGER.debug(
                    "[apply_aggregates_to_mapping_data]: after conversion to float: applying aggregate to %s with values %s",
                    key,
                    d,
                )
                aggregate = const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT
                if key == const.MAPPING_PRECIPITATION:
                    aggregate = (
                        const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
                    )
                elif key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = max(d)
                    resultdata[const.MAPPING_MIN_TEMP] = min(d)
                mappings = mapping.get(const.MAPPING_MAPPINGS, {})
                if key in mappings:
                    aggregate = mappings[key].get(
                        const.MAPPING_CONF_AGGREGATE,
                        aggregate,
                    )
                _LOGGER.debug(
                    "[async_aggregate_to_mapping_data]: key: %s, aggregate: %s, data: %s",
                    key,
                    aggregate,
                    d,
                )
                if aggregate == const.MAPPING_CONF_AGGREGATE_AVERAGE:
                    resultdata[key] = statistics.mean(d)
                elif aggregate == const.MAPPING_CONF_AGGREGATE_FIRST:
                    resultdata[key] = d[0]
                elif aggregate == const.MAPPING_CONF_AGGREGATE_LAST:
                    resultdata[key] = d[-1]
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MAXIMUM:
                    resultdata[key] = max(d)
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MINIMUM:
                    resultdata[key] = min(d)
                elif aggregate == const.MAPPING_CONF_AGGREGATE_MEDIAN:
                    resultdata[key] = statistics.median(d)
                elif aggregate == const.MAPPING_CONF_AGGREGATE_SUM:
                    resultdata[key] = sum(d)
                elif aggregate == const.MAPPING_CONF_AGGREGATE_RIEMANNSUM:
                    # apply the riemann sum to the data in d
                    # Use the trapezoidal rule for Riemann sum approximation
                    # Assume each value in d is sampled at equal intervals
                    if len(d) < 2:
                        resultdata[key] = float(d[0])
                    else:
                        # Trapezoidal rule: sum((d[i] + d[i+1]) / 2) * dt
                        # dt is the interval between samples, assume 1 if not available
                        dt = 1.0
                        # If we have timestamps, use them to get dt
                        if const.RETRIEVED_AT in data_by_sensor:
                            timestamps = data_by_sensor[const.RETRIEVED_AT]
                            if len(timestamps) == len(d):
                                try:
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
                                    if len(times) > 1:
                                        dts = [
                                            (times[i + 1] - times[i]).total_seconds()
                                            for i in range(len(times) - 1)
                                        ]
                                        dt = statistics.mean(dts)
                                except (ValueError, TypeError) as err:
                                    _LOGGER.debug(
                                        "Failed to parse timestamps for Riemann sum: %s",
                                        err,
                                    )
                        # Calculate the sum
                        riemann_sum = 0.0
                        for i in range(len(d) - 1):
                            riemann_sum += ((d[i] + d[i + 1]) / 2) * dt
                        resultdata[key] = riemann_sum
            else:
                if key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = d[0]
                    resultdata[const.MAPPING_MIN_TEMP] = d[0]
                resultdata[key] = float(d[0])

    def _fill_missing_from_last_entry(self, mapping, resultdata):
        """Fill missing keys in resultdata from last entry data."""
        last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
        _LOGGER.debug(
            "[async_aggregate_to_mapping_data]: last entry data for sensor group: %s: %s",
            mapping.get(const.MAPPING_ID),
            last_entry,
        )
        if not last_entry:
            return
        for key, val in last_entry.items():
            if key not in resultdata:
                _LOGGER.debug(
                    "[async_aggregate_to_mapping_data]: %s is missing from resultdata, adding %s from last entry",
                    key,
                    val,
                )
                resultdata[key] = val
                if key == const.MAPPING_TEMPERATURE:
                    resultdata[const.MAPPING_MAX_TEMP] = val
                    resultdata[const.MAPPING_MIN_TEMP] = val

    async def _async_clear_all_weatherdata(self, *args):
        _LOGGER.info("Clearing all weatherdata")
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:
            changes = {}
            changes = self.clear_weatherdata_for_mapping(mapping)
            await self.store.async_update_mapping(mapping.get(const.MAPPING_ID), changes)

    async def _async_calculate_all(self, delete_weather_data=True, *args):
        _LOGGER.info("Calculating all automatic zones")
        # get all zones that are in automatic and for all of those, loop over the unique list of mappings
        # are any modules using OWM / sensors?

        unfiltered_zones = await self.store.async_get_zones()

        # skip over zones that use pure sensors (not weather service) if continuous updates are enabled
        the_config = await self.store.async_get_config()
        zones = []
        if the_config.get(const.CONF_CONTINUOUS_UPDATES):
            _LOGGER.debug(
                "Continuous updates are enabled, filtering out pure sensor zones"
            )
            # filter zones and only add zone if it uses a weather service
            for z in unfiltered_zones:
                mapping_id = z.get(const.ZONE_MAPPING)
                weather_service_in_mapping, sensor_in_mapping, static_in_mapping = (
                    self.check_mapping_sources(mapping_id=mapping_id)
                )
                if weather_service_in_mapping:
                    _LOGGER.debug(
                        "[async_calculate_all]: zone %s uses a weather service so should be included in the calculation even though continuous updates are on",
                        z.get(const.ZONE_ID),
                    )
                    zones.append(z)
                else:
                    _LOGGER.debug(
                        "[async_calculate_all]: Skipping zone %s from calculation because it uses a pure sensor mapping and continuous updates are enabled",
                        z.get(const.ZONE_ID),
                    )
        else:
            # no need to filter, continue with unfiltered zones
            zones = unfiltered_zones

        # for mapping_id in mappings:
        #    o, s, sv = self.check_mapping_sources(mapping_id = mapping_id)
        #    if o:
        #        owm_in_mapping = True
        # at least part of the data comes from OWM
        # if self.use_OWM and owm_in_mapping:
        #    # data comes at least partly from owm
        #    weatherdata = await self.hass.async_add_executor_job(self._OWMClient.get_data)

        # loop over zones and calculate
        for zone in zones:
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC:
                await self.async_calculate_zone(zone.get(const.ZONE_ID))
        # remove mapping data from all mappings used
        if delete_weather_data:
            mappings = await self._get_unique_mappings_for_automatic_zones(zones)
            for mapping_id in mappings:
                # remove sensor data from mapping
                changes = {}
                changes[const.MAPPING_DATA] = []
                if mapping_id is not None:
                    await self.store.async_update_mapping(mapping_id, changes=changes)

        # update start_event
        _LOGGER.debug("calling register start event from async_calculate_all")
        self.register_start_event()

    async def async_calculate_zone(self, zone_id, continuous_updates=False):
        """Calculate irrigation values for a specific zone.

        Args:
            zone_id: The ID of the zone to calculate.
            continuous_updates: Whether to use continuous updates for calculation.

        """
        _LOGGER.debug("async_calculate_zone: Calculating zone %s", zone_id)
        zone = self.store.get_zone(zone_id)
        mapping_id = zone[const.ZONE_MAPPING]
        # o_i_m, s_i_m, sv_in_m = self.check_mapping_sources(mapping_id = mapping_id)
        # if using pyeto and using a forecast o_i_m needs to be set to true!
        modinst = await self.getModuleInstanceByID(zone.get(const.ZONE_MODULE))
        forecastdata = None
        if modinst and modinst.name == "PyETO" and modinst.forecast_days > 0:
            if self.use_weather_service:
                # get forecast info from OWM
                forecastdata = await self.hass.async_add_executor_job(
                    self._WeatherServiceClient.get_forecast_data
                )
                # _LOGGER.debug("Retrieved forecast data: %s", forecastdata)
            else:
                _LOGGER.error(
                    "Error calculating zone %s. You have configured forecasting but there is no OWM API configured. Either configure the OWM API or stop using forecasting on the PyETO module",
                    zone.get(const.ZONE_NAME),
                )
                return
        mapping = self.store.get_mapping(mapping_id)
        # if there is sensor data on the mapping, apply aggregates to it.
        sensor_values = None
        if mapping is not None:
            if const.MAPPING_DATA in mapping and mapping.get(const.MAPPING_DATA):
                sensor_values = await self.apply_aggregates_to_mapping_data(
                    zone, mapping, continuous_updates
                )
            if sensor_values:
                # make sure we convert forecast data pressure to absolute!
                data = await self.calculate_module(
                    zone, weatherdata=sensor_values, forecastdata=forecastdata
                )
                # if continuous updates are on, add the current date time to set the last updated time
                if continuous_updates:
                    data[const.ZONE_LAST_UPDATED] = datetime.datetime.now()

                await self.store.async_update_zone(zone.get(const.ZONE_ID), data)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone.get(const.ZONE_ID),
                )
                async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")
            else:
                # no data to calculate with!
                _LOGGER.warning(
                    "Calculate for zone %s failed: no data available",
                    zone.get(const.ZONE_NAME),
                )
        else:
            _LOGGER.warning(
                "Calculate for zone %s failed: invalid sensor group specified",
                zone.get(const.ZONE_NAME),
            )

    async def getModuleInstanceByID(self, module_id):
        """Retrieve and instantiate a module by its ID.

        Args:
            module_id: The ID of the module to retrieve.

        Returns:
            The instantiated module object, or None if not found.

        """
        m = self.store.get_module(module_id)
        if m is None:
            return None
        # load the module dynamically
        mods = await self.hass.async_add_executor_job(loadModules, const.MODULE_DIR)
        modinst = None
        for mod in mods:
            if mods[mod]["class"] == m[const.MODULE_NAME]:
                themod = getattr(mods[mod]["module"], mods[mod]["class"])
                modinst = themod(
                    self.hass, description=m["description"], config=m["config"]
                )
                break
        return modinst

    async def calculate_module(self, zone, weatherdata, forecastdata):
        """Calculate irrigation values for a zone using the specified weather and forecast data.

        Args:
            zone: The zone dictionary containing configuration and state.
            weatherdata: Aggregated weather data for the calculation.
            forecastdata: Forecast data if required by the module.

        Returns:
            dict: Updated zone data including calculation results and explanation.

        """
        _LOGGER.debug("calculate_module for zone: %s", zone)
        # _LOGGER.debug("[calculate_module] for zone: %s, weatherdata: %s, forecastdata: %s", zone, weatherdata, forecastdata)
        mod_id = zone.get(const.ZONE_MODULE)
        m = self.store.get_module(mod_id)
        if m is None:
            return None
        modinst = await self.getModuleInstanceByID(mod_id)
        # precip = 0
        ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
        bucket = zone.get(const.ZONE_BUCKET)
        maximum_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
        if not ha_config_is_metric:
            bucket = convert_between(const.UNIT_INCH, const.UNIT_MM, bucket)
            if zone.get(const.ZONE_MAXIMUM_BUCKET) is not None:
                maximum_bucket = convert_between(
                    const.UNIT_INCH, const.UNIT_MM, zone.get(const.ZONE_MAXIMUM_BUCKET)
                )
        data = {}
        data[const.ZONE_OLD_BUCKET] = bucket
        explanation = ""

        if modinst:
            # if m[const.MODULE_NAME] == "PyETO":
            # if we have precip info from a sensor we don't need to call OWM to get it.
            # if precip_from_sensor is None:
            #        precip = self._OWMClient.get_precipitation(weatherdata)
            # else:
            #    precip = precip_from_sensor
            if m[const.MODULE_NAME] == "PyETO":
                # pyeto expects pressure in hpa, solar radiation in mj/m2/day and wind speed in m/s

                delta = modinst.calculate(
                    weather_data=weatherdata, forecast_data=forecastdata
                )
            elif m[const.MODULE_NAME] == "Static":
                delta = modinst.calculate()
            elif m[const.MODULE_NAME] == "Passthrough":
                if const.MAPPING_EVAPOTRANSPIRATION in weatherdata:
                    delta = 0 - modinst.calculate(
                        et_data=weatherdata[const.MAPPING_EVAPOTRANSPIRATION]
                    )
                else:
                    _LOGGER.error(
                        "No evapotranspiration value provided for Passthrough module for zone %s",
                        zone.get(const.ZONE_NAME),
                    )
                    return None
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            # data[const.ZONE_BUCKET] = round(bucket+delta,1)
            # data[const.ZONE_DELTA] = round(delta,1)
            _LOGGER.debug("[calculate-module]: retrieved from module: %s", delta)
            hour_multiplier = weatherdata.get(const.MAPPING_DATA_MULTIPLIER, 1.0)
            _LOGGER.debug("[calculate-module]: hour_multiplier: %s", hour_multiplier)
            data[const.ZONE_DELTA] = delta * hour_multiplier
            _LOGGER.debug("[calculate-module]: new delta: %s", delta * hour_multiplier)
            newbucket = bucket + (delta * hour_multiplier)

            # if maximum bucket configured, limit bucket with that.
            # any water above maximum is removed with runoff / bypass flow.
            if maximum_bucket is not None and newbucket > maximum_bucket:
                newbucket = float(maximum_bucket)
                _LOGGER.debug(
                    "[calculate-module]: capped new bucket because of maximum bucket: %s",
                    newbucket,
                )
            bucket_plus_delta_capped = newbucket

            # take drainage rate into account
            drainage_rate = zone.get(const.ZONE_DRAINAGE_RATE, 0.0)
            if drainage_rate is None:
                drainage_rate = 0.0
            if not ha_config_is_metric:
                # drainage_rate is in inch/h since HA is not in metric, so we need to adjust those first!
                # using inch and mm here since both are per hour
                drainage_rate = convert_between(
                    const.UNIT_INCH, const.UNIT_MM, drainage_rate
                )
            _LOGGER.debug("[calculate-module]: drainage_rate: %s", drainage_rate)
            # drainage only applies above field capacity (bucket > 0)
            drainage = 0
            if newbucket > 0:
                # drainage rate is related to water level, such that full drainage_rate
                # occurs at saturation (maximum_bucket), but is reduced below that point.
                # if maximum_bucket is not set, ignore this relationship and just
                # drain at a constant rate.
                drainage = drainage_rate * hour_multiplier * 24
                if maximum_bucket is not None:
                    # gamma is set by uniformity of soil particle size,
                    # but 2 is a reasonable approximation.
                    gamma = 2
                    drainage *= (newbucket / maximum_bucket) ** (
                        (2 + 3 * gamma) / gamma
                    )
                _LOGGER.debug("[calculate-module]: current_drainage: %s", drainage)
                newbucket = max(0, newbucket - drainage)

            data[const.ZONE_CURRENT_DRAINAGE] = drainage
            _LOGGER.debug("[calculate-module]: newbucket: %s", newbucket)
        else:
            _LOGGER.error("Unknown module for zone %s", zone.get(const.ZONE_NAME))
            return None
        explanation = (
            await localize(
                "module.calculation.explanation.module-returned-evapotranspiration-deficiency",
                self.hass.config.language,
            )
            + f" {data[const.ZONE_DELTA]:.2f}. "
        )
        explanation += (
            await localize(
                "module.calculation.explanation.bucket-was", self.hass.config.language
            )
            + f" {data[const.ZONE_OLD_BUCKET]:.2f}"
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.maximum-bucket-is",
                self.hass.config.language,
            )
            + f" {float(maximum_bucket):.1f}"
        )
        explanation += (
            ".<br/>"
            + await localize(
                "module.calculation.explanation.drainage-rate-is",
                self.hass.config.language,
            )
            + f" {float(drainage_rate):.1f}.<br/>"
        )

        # Define some localized strings here for cleaner code below
        hours_loc = await localize(
            "module.calculation.explanation.hours", self.hass.config.language
        )
        drainage_loc = await localize(
            "module.calculation.explanation.drainage", self.hass.config.language
        )
        drainage_rate_loc = await localize(
            "module.calculation.explanation.drainage-rate", self.hass.config.language
        )
        delta_loc = await localize(
            "module.calculation.explanation.delta", self.hass.config.language
        )
        old_bucket_loc = await localize(
            "module.calculation.explanation.old-bucket-variable",
            self.hass.config.language,
        )
        max_bucket_loc = await localize(
            "module.calculation.explanation.max-bucket-variable",
            self.hass.config.language,
        )

        if bucket_plus_delta_capped <= 0:
            explanation += (
                await localize(
                    "module.calculation.explanation.no-drainage",
                    self.hass.config.language,
                )
                + f" [{old_bucket_loc}] + [{delta_loc}] <= 0 ({data[const.ZONE_OLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f} = {bucket_plus_delta_capped:.2f})"
            )
        else:
            explanation += await localize(
                "module.calculation.explanation.current-drainage-is",
                self.hass.config.language,
            )
            if maximum_bucket is None:
                explanation += f" [{drainage_rate_loc}] * {hours_loc} = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} = {drainage:.2f}"
            else:
                explanation += f" [{drainage_rate_loc}] * [{hours_loc}] * (min([{old_bucket_loc}] + [{delta_loc}], [{max_bucket_loc}]) / [{max_bucket_loc}])^4 = {drainage_rate:.1f} * {24 * hour_multiplier:.2f} * ({bucket_plus_delta_capped:.2f} / {maximum_bucket:.1f})^4 = {drainage:.2f}"
        explanation += ".<br/>" + await localize(
            "module.calculation.explanation.new-bucket-values-is",
            self.hass.config.language,
        )

        if maximum_bucket is not None:
            explanation += f" min([{old_bucket_loc}] + [{delta_loc}], {max_bucket_loc}) - [{drainage_loc}] = min({data[const.ZONE_OLD_BUCKET]:.2f}{data[const.ZONE_DELTA]:+.2f}, {maximum_bucket:.1f}) - {drainage:.2f} = {newbucket:.2f}.<br/>"
        else:
            explanation += f" [{old_bucket_loc}] + [{delta_loc}] - [{drainage_loc}] = {data[const.ZONE_OLD_BUCKET]:.2f} + {data[const.ZONE_DELTA]:.2f} - {drainage:.2f} = {newbucket:.2f}.<br/>"

        if newbucket < 0:
            # calculate duration

            tput = zone.get(const.ZONE_THROUGHPUT)
            sz = zone.get(const.ZONE_SIZE)
            if not ha_config_is_metric:
                # throughput is in gpm and size is in sq ft since HA is not in metric, so we need to adjust those first!
                tput = convert_between(const.UNIT_GPM, const.UNIT_LPM, tput)
                sz = convert_between(const.UNIT_SQ_FT, const.UNIT_M2, sz)
            precipitation_rate = (tput * 60) / sz
            # new version of calculation below - this is the old version from V1. Switching to the new version removes the need for ET values to be passed in!
            # water_budget = 1
            # if mod.maximum_et != 0:
            #    water_budget = round(abs(data[const.ZONE_BUCKET])/mod.maximum_et,2)
            #
            # base_schedule_index = (mod.maximum_et / precipitation_rate * 60)*60

            # duration = water_budget * base_schedule_index
            # new version (2.0): ART = W * BSI = ( |B| / ETpeak ) * ( ETpeak / PR * 3600 ) = |B| / PR * 3600 = ( ET - P ) / PR * 3600
            # so duration = |B| / PR * 3600
            duration = abs(newbucket) / precipitation_rate * 3600
            explanation += (
                await localize(
                    "module.calculation.explanation.bucket-less-than-zero-irrigation-necessary",
                    self.hass.config.language,
                )
                + ".<br/>"
                + await localize(
                    "module.calculation.explanation.steps-taken-to-calculate-duration",
                    self.hass.config.language,
                )
                + ":<br/>"
            )
            # v1 only
            # explanation += "<ol><li>Water budget is defined as abs([bucket])/max(ET)={}</li>".format(water_budget)
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<ol><li>"
                + await localize(
                    "module.calculation.explanation.precipitation-rate-defined-as",
                    self.hass.config.language,
                )
                + " ["
                + await localize(
                    "common.attributes.throughput", self.hass.config.language
                )
                + "] * 60 / ["
                + await localize("common.attributes.size", self.hass.config.language)
                + f"] = {tput:.1f} * 60 / {sz:.1f} = {precipitation_rate:.1f}.</li>"
            )
            # v1 only
            # explanation += "<li>The base schedule index is defined as (max(ET)/[precipitation rate]*60)*60=({}/{}*60)*60={}</li>".format(mod.maximum_et,precipitation_rate,round(base_schedule_index,1))
            # explanation += "<li>the duration is calculated as [water_budget]*[base_schedule_index]={}*{}={}</li>".format(water_budget,round(base_schedule_index,1),round(duration))
            # beta25: temporarily removing all rounds to see if we can find the math issue reported in #186
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.duration-is-calculated-as",
                    self.hass.config.language,
                )
                + " abs(["
                + await localize(
                    "module.calculation.explanation.bucket", self.hass.config.language
                )
                + "]) / ["
                + await localize(
                    "module.calculation.explanation.precipitation-rate-variable",
                    self.hass.config.language,
                )
                + f"] * 3600 = {abs(newbucket):.2f} / {precipitation_rate:.1f} * 3600 = {duration:.0f}.</li>"
            )
            duration = zone.get(const.ZONE_MULTIPLIER) * duration
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.multiplier-is-applied",
                    self.hass.config.language,
                )
                + f" {zone.get(const.ZONE_MULTIPLIER)}, "
            )
            explanation += (
                await localize(
                    "module.calculation.explanation.duration-after-multiplier-is",
                    self.hass.config.language,
                )
                + f" {round(duration)}.</li>"
            )

            # get maximum duration if set and >=0 and override duration if it's higher than maximum duration
            explanation += (
                "<li>"
                + await localize(
                    "module.calculation.explanation.maximum-duration-is-applied",
                    self.hass.config.language,
                )
                + f" {zone.get(const.ZONE_MAXIMUM_DURATION):.0f}"
            )
            if (
                zone.get(const.ZONE_MAXIMUM_DURATION) is not None
                and zone.get(const.ZONE_MAXIMUM_DURATION) >= 0
                and duration > zone.get(const.ZONE_MAXIMUM_DURATION)
            ):
                duration = zone.get(const.ZONE_MAXIMUM_DURATION)
                explanation += (
                    ", "
                    + await localize(
                        "module.calculation.explanation.duration-after-maximum-duration-is",
                        self.hass.config.language,
                    )
                    + f" {duration:.0f}"
                )
            explanation += ".</li>"

            # add the lead time but only if duration is > 0 at this point
            if duration > 0.0:
                duration = round(zone.get(const.ZONE_LEAD_TIME) + duration)
                explanation += (
                    "<li>"
                    + await localize(
                        "module.calculation.explanation.lead-time-is-applied",
                        self.hass.config.language,
                    )
                    + f" {zone.get(const.ZONE_LEAD_TIME)}, "
                )
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )
                    + f" {duration}</li></ol>"
                )
                explanation += (
                    await localize(
                        "module.calculation.explanation.duration-after-lead-time-is",
                        self.hass.config.language,
                    )
                    + f" {duration}.</li></ol>"
                )

                # _LOGGER.debug("[calculate-module]: explanation: %s", explanation)
        else:
            # no need to irrigate, set duration to 0
            duration = 0
            explanation += (
                await localize(
                    "module.calculation.explanation.bucket-larger-than-or-equal-to-zero-no-irrigation-necessary",
                    self.hass.config.language,
                )
                + f" {duration}"
            )

        data[const.ZONE_BUCKET] = newbucket
        if not ha_config_is_metric:
            data[const.ZONE_BUCKET] = convert_between(
                const.UNIT_MM, const.UNIT_INCH, data[const.ZONE_BUCKET]
            )
        data[const.ZONE_DURATION] = duration
        data[const.ZONE_EXPLANATION] = explanation
        data[const.ZONE_LAST_CALCULATED] = datetime.datetime.now()
        return data

    async def async_update_module_config(
        self, module_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a module configuration.

        Args:
            module_id: The ID of the module to update or delete.
            data: The configuration data for the module.

        """
        if data is None:
            data = {}
        if module_id is not None:
            module_id = int(module_id)
        if const.ATTR_REMOVE in data:
            # delete a module
            zone = self.store.get_module(module_id)
            if not zone:
                return
            await self.store.async_delete_module(module_id)
        elif module_id is not None and self.store.get_module(module_id):
            # modify a module
            await self.store.async_update_module(module_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", module_id
            )
        else:
            # create a module
            await self.store.async_create_module(data)
            await self.store.async_get_config()

    async def async_update_mapping_config(
        self, mapping_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a mapping configuration.

        Args:
            mapping_id: The ID of the mapping to update or delete.
            data: The configuration data for the mapping.

        """
        _LOGGER.debug(
            "[async_update_mapping_config]: update for mapping %s, data: %s",
            mapping_id,
            data,
        )
        if data is None:
            data = {}
        if mapping_id is not None:
            mapping_id = int(mapping_id)
        if const.ATTR_REMOVE in data:
            # delete a mapping
            res = self.store.get_mapping(mapping_id)
            if not res:
                return
            await self.store.async_delete_mapping(mapping_id)
        elif mapping_id is not None and self.store.get_mapping(mapping_id):
            # modify a mapping
            await self.store.async_update_mapping(mapping_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", mapping_id
            )
        else:
            # create a mapping
            await self.store.async_create_mapping(data)
            await self.store.async_get_config()

        # update the list of sensors to follow - then unsubscribe / subscribe
        await self.update_subscriptions()

    def check_mapping_sources(self, mapping_id):
        """Check which data sources (weather service, sensor, static value) are present in a mapping.

        Args:
            mapping_id: The ID of the mapping to check.

        Returns:
            Tuple of booleans: (owm_in_mapping, sensor_in_mapping, static_in_mapping)

        """
        owm_in_mapping = False
        sensor_in_mapping = False
        static_in_mapping = False
        if mapping_id is not None:
            mapping = self.store.get_mapping(mapping_id)
            if mapping is not None:
                for the_map in mapping[const.MAPPING_MAPPINGS].values():
                    if not isinstance(the_map, str):
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
                        ):
                            owm_in_mapping = True
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_SENSOR
                        ):
                            sensor_in_mapping = True
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_STATIC_VALUE
                        ):
                            static_in_mapping = True
            else:
                _LOGGER.debug(
                    "[check_mapping_sources] sensor group %s is None", mapping_id
                )
            _LOGGER.debug(
                "check_mapping_sources for mapping_id %s returns OWM: %s, sensor: %s, static: %s",
                mapping_id,
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            )
        return owm_in_mapping, sensor_in_mapping, static_in_mapping

    def build_sensor_values_for_mapping(self, mapping):
        """Build a dictionary of sensor values for a given mapping by retrieving and converting sensor states from Home Assistant.

        Args:
            mapping: The mapping dictionary containing sensor configuration.

        Returns:
            dict: A dictionary of sensor keys and their corresponding metric values.

        """
        sensor_values = {}
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):
                if the_map.get(
                    const.MAPPING_CONF_SOURCE
                ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(
                    const.MAPPING_CONF_SENSOR
                ):
                    # this mapping maps to a sensor, so retrieve its value from HA
                    if self.hass.states.get(the_map.get(const.MAPPING_CONF_SENSOR)):
                        try:
                            val = float(
                                self.hass.states.get(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                ).state
                            )
                            # make sure to store the val as metric and do necessary conversions along the way
                            val = convert_mapping_to_metric(
                                val,
                                key,
                                the_map.get(const.MAPPING_CONF_UNIT),
                                self.hass.config.units is METRIC_SYSTEM,
                            )
                            # add val to sensor values
                            sensor_values[key] = val
                        except (ValueError, TypeError):
                            _LOGGER.warning(
                                "No / unknown value for sensor %s",
                                the_map.get(const.MAPPING_CONF_SENSOR),
                            )

        return sensor_values

    def build_static_values_for_mapping(self, mapping):
        """Build a dictionary of static values for a given mapping by retrieving and converting static values.

        Args:
            mapping: The mapping dictionary containing static value configuration.

        Returns:
            dict: A dictionary of sensor keys and their corresponding static metric values.

        """
        static_values = {}
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):
                if the_map.get(
                    const.MAPPING_CONF_SOURCE
                ) == const.MAPPING_CONF_SOURCE_STATIC_VALUE and the_map.get(
                    const.MAPPING_CONF_STATIC_VALUE
                ):
                    # this mapping maps to a static value, so return its value
                    val = float(the_map.get(const.MAPPING_CONF_STATIC_VALUE))
                    # first check we are not in metric mode already.
                    if self.hass.config.units is not METRIC_SYSTEM:
                        val = convert_mapping_to_metric(
                            val, key, the_map.get(const.MAPPING_CONF_UNIT), False
                        )
                    # add val to sensor values
                    static_values[key] = val
        return static_values

    async def async_update_zone_config(
        self, zone_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a zone configuration.

        Args:
            zone_id: The ID of the zone to update or delete.
            data: The configuration data for the mapping.

        """
        _LOGGER.debug("[async_update_zone_config]: updating zone %s", zone_id)
        if data is None:
            data = {}
        if zone_id is not None:
            zone_id = int(zone_id)
        if const.ATTR_REMOVE in data:
            # delete a zone
            zone = self.store.get_zone(zone_id)
            if not zone:
                return
            await self.store.async_delete_zone(zone_id)
            await self.async_remove_entity(zone_id)

        elif const.ATTR_CALCULATE in data:
            await self.async_calculate_zone(zone_id, data)
        elif const.ATTR_CALCULATE_ALL in data:
            # calculate all zones
            _LOGGER.info("Calculating all zones")
            data.pop(const.ATTR_CALCULATE_ALL)
            await self._async_calculate_all()

        elif const.ATTR_UPDATE in data:
            await self._async_update_zone_weatherdata(zone_id, data)
        elif const.ATTR_UPDATE_ALL in data:
            _LOGGER.info("Updating all zones")
            await self._async_update_all()
        elif const.ATTR_RESET_ALL_BUCKETS in data:
            # reset all buckets
            _LOGGER.info("Resetting all buckets")
            data.pop(const.ATTR_RESET_ALL_BUCKETS)
            await self.handle_reset_all_buckets(None)
        elif const.ATTR_CLEAR_ALL_WEATHERDATA in data:
            # clear all weatherdata
            _LOGGER.info("Clearing all weatherdata")
            data.pop(const.ATTR_CLEAR_ALL_WEATHERDATA)
            await self.handle_clear_weatherdata(None)
        elif zone_id is not None and self.store.get_zone(zone_id):
            # modify a zone
            entry = await self.store.async_update_zone(zone_id, data)
            async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated", zone_id)
            await self.update_subscriptions()
            # make sure to update the HA entity here by listening to this in sensor.py.
            # this should be called by changes from the UI (by user) or by a calculation module (updating a duration), which should be done in python
        else:
            # create a zone
            entry = await self.store.async_create_zone(data)

            async_dispatcher_send(self.hass, const.DOMAIN + "_register_entity", entry)

            await self.store.async_get_config()

        # update the start event
        _LOGGER.debug("calling register start event from async_update_zone_config")
        await self.register_start_event()

    async def register_start_event(self):
        """Register a callback to fire the irrigation start event before sunrise based on total duration of enabled zones."""
        # sun_state = self.hass.states.get("sun.sun")
        # if sun_state is not None:
        #    sun_rise = sun_state.attributes.get("next_rising")
        #    if sun_rise is not None:
        #        try:
        #            sun_rise = datetime.datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S.%f%z")
        #        except(ValueError):
        #            sun_rise = datetime.datetime.strptime(sun_rise, "%Y-%m-%dT%H:%M:%S%z")
        total_duration = await self.get_total_duration_all_enabled_zones()
        if self._track_sunrise_event_unsub:
            self._track_sunrise_event_unsub()
            self._track_sunrise_event_unsub = None
        if total_duration > 0:
            # time_to_wait = sun_rise - datetime.datetime.now(timezone.utc) - datetime.timedelta(seconds=total_duration)
            # time_to_fire = datetime.datetime.now(timezone.utc) + time_to_wait
            # time_to_fire = sun_rise - datetime.timedelta(seconds=total_duration)
            # time_to_wait = total_duration

            # time_to_fire = datetime.datetime.now(timezone.utc)+datetime.timedelta(seconds=total_duration)

            # self._track_sunrise_event_unsub = async_track_point_in_utc_time(
            #    self.hass, self._fire_start_event, point_in_time=time_to_fire
            # )
            self._track_sunrise_event_unsub = async_track_sunrise(
                self.hass,
                self._fire_start_event,
                datetime.timedelta(seconds=0 - total_duration),
            )
            # self._track_sunrise_event_unsub = async_call_later(self.hass, time_to_wait,self._fire_start_event)
            event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            _LOGGER.info(
                "Start irrigation event %s will fire at %s seconds before sunrise",
                event_to_fire,
                total_duration,
            )

    async def get_total_duration_all_enabled_zones(self):
        """Calculate the total duration for all enabled (automatic or manual) zones.

        Returns:
            int: The sum of durations for all enabled zones.

        """
        total_duration = 0
        zones = await self.store.async_get_zones()
        for zone in zones:
            if (
                zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
                or zone.get(const.ZONE_STATE) == const.ZONE_STATE_MANUAL
            ):
                total_duration += zone.get(const.ZONE_DURATION, 0)
        return total_duration

    @callback
    def _fire_start_event(self, *args):
        if not self._start_event_fired_today:
            event_to_fire = f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            self.hass.bus.fire(event_to_fire, {})
            _LOGGER.info("Fired start event: %s", event_to_fire)
            self._start_event_fired_today = True
            # save config asynchronously - fire-and-forget since this is a callback
            self.hass.async_create_task(
                self.store.async_update_config(
                    {const.START_EVENT_FIRED_TODAY: self._start_event_fired_today}
                )
            )
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
