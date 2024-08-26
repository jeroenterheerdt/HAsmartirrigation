import asyncio
import logging

from homeassistant.components.sensor import DOMAIN as PLATFORM, SensorEntity
from homeassistant.components.sensor.const import SensorDeviceClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.entity import generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.util import slugify

from . import const
from .helpers import convert_timestamp
from .localize import localize

_LOGGER = logging.getLogger(__name__)


def setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the sensor platform."""


@callback
async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
):
    """Set up the SmartIrrigation sensor entities."""

    @callback
    def async_add_sensor_entity(config: dict):
        """Add each zone as Sensor entity."""
        entity_id = "{}.{}".format(
            PLATFORM, const.DOMAIN + "_" + slugify(config["name"])
        )

        sensor_entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            name=config["name"],
            id=config["id"],
            size=config["size"],
            throughput=config["throughput"],
            state=config["state"],
            duration=config["duration"],
            bucket=config["bucket"],
            last_updated=config["last_updated"],
            last_calculated=config["last_calculated"],
            number_of_data_points=config["number_of_data_points"],
            delta=config["delta"],
            drainage_rate=config["drainage_rate"],
        )
        if const.DOMAIN in hass.data:
            hass.data[const.DOMAIN]["zones"][config["id"]] = sensor_entity
            async_add_devices([sensor_entity])

    async_dispatcher_connect(
        hass, const.DOMAIN + "_register_entity", async_add_sensor_entity
    )
    async_dispatcher_send(hass, const.DOMAIN + "_platform_loaded")

    # register services if any here


class SmartIrrigationZoneEntity(SensorEntity, RestoreEntity):
    def __init__(
        self,
        hass: HomeAssistant,
        id: str,
        name: str,
        entity_id: str,
        size: float,
        throughput: float,
        state: str,
        duration: int,
        bucket: float,
        last_updated: str,
        last_calculated: str,
        number_of_data_points: int,
        delta: float,
        drainage_rate: float,
    ) -> None:
        """Initialize the sensor entity."""
        self._hass = hass
        self.entity_id = generate_entity_id(
            entity_id_format="sensor.{}", name=entity_id.split(".")[1], hass=hass
        )
        self._id = id
        self._name = name
        self._size = size
        self._throughput = throughput
        self._state = state
        self._duration = duration
        self._bucket = bucket
        self._last_updated = last_updated
        self._last_calculated = last_calculated
        self._number_of_data_points = number_of_data_points
        self._delta = delta
        self._drainage_rate = drainage_rate
        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self.async_update_sensor_entity
        )

    @callback
    def async_update_sensor_entity(self, id=None):
        """Update each zone as Sensor entity."""
        if self._id == id and self.hass and self.hass.data:
            # get the new values from store and update sensor state
            zone = self.hass.data[const.DOMAIN]["coordinator"].store.get_zone(id)
            self._name = zone["name"]
            self._size = zone["size"]
            self._throughput = zone["throughput"]
            self._state = zone["state"]
            self._duration = zone["duration"]
            self._bucket = zone["bucket"]
            self._last_updated = zone["last_updated"]
            self._last_calculated = zone["last_calculated"]
            self._number_of_data_points = zone["number_of_data_points"]
            self._delta = zone["delta"]
            self._drainage_rate = zone["drainage_rate"]
            self.async_schedule_update_ha_state()

    @property
    def device_info(self) -> dict:
        """Return info for device registry."""
        return {
            "identifiers": {
                (const.DOMAIN, self.hass.data[const.DOMAIN]["coordinator"].id)
            },
            "name": const.NAME,
            "model": const.NAME,
            "sw_version": const.VERSION,
            "manufacturer": const.MANUFACTURER,
        }

    @property
    def unique_id(self):
        """Return a unique ID to use for this entity."""

        return f"{self.entity_id}"

    @property
    def icon(self):
        """Return icon."""
        return const.SENSOR_ICON

    @property
    def name(self):
        """Return the friendly name to use for this entity."""
        return self._name

    @property
    def should_poll(self) -> bool:
        """Return the polling state."""
        return False

    @property
    def state(self):
        """Return the state of the device."""
        return self._duration

    @property
    def device_class(self):
        return SensorDeviceClass.DURATION

    @property
    def native_unit_of_measurement(self):
        return "s"

    @property
    def native_value(self):
        return self._duration

    @property
    def suggested_display_precision(self):
        return 0

    @property
    def suggested_unit_of_measurement(self):
        return "s"

    @property
    def extra_state_attributes(self):
        """Return the data of the entity."""
        _LOGGER.debug(
            f"[extra_state_attributes] bucket: {self._bucket}, et_value: {self._delta}"
        )
        return {
            "id": self._id,
            "size": self._size,
            "throughput": self._throughput,
            "drainage_rate": self._drainage_rate,
            "state": self._state,
            "bucket": self._bucket,
            "last_updated": convert_timestamp(self._last_updated),
            "last_calculated": convert_timestamp(self._last_calculated),
            "number_of_data_points": self._number_of_data_points,
            "et_value": self._delta,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.size", "en"), self._hass.loop
            # ).result(): self._size,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.throughput", "en"), self._hass.loop
            # ).result(): self._throughput,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.state", "en"), self._hass.loop
            # ).result(): self._state,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.bucket", "en"), self._hass.loop
            # ).result(): self._bucket,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.last_updated", "en"), self._hass.loop
            # ).result(): convert_timestamp(self._last_updated),
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.last_calculated", "en"), self._hass.loop
            # ).result(): convert_timestamp(self._last_calculated),
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.number_of_data_points", "en"),
            #    self._hass.loop,
            # ).result(): self._number_of_data_points,
        }

    async def async_added_to_hass(self):
        """Connect to dispatcher listening for entity data notifications."""
        _LOGGER.debug("{} is added to hass".format(self.entity_id))
        await super().async_added_to_hass()

        await self.async_get_last_state()

        # restore previous state
        # if state:
        # restore attributes
        # if "arm_mode" in state.attributes:
        #    self._arm_mode = state.attributes["arm_mode"]
        # if "changed_by" in state.attributes:
        #    self._changed_by = state.attributes["changed_by"]
        # if "open_sensors" in state.attributes:
        #    self.open_sensors = state.attributes["open_sensors"]
        # if "bypassed_sensors" in state.attributes:
        #    self._bypassed_sensors = state.attributes["bypassed_sensors"]

    async def async_will_remove_from_hass(self):
        await super().async_will_remove_from_hass()
        _LOGGER.debug("{} is removed from hass".format(self.entity_id))
