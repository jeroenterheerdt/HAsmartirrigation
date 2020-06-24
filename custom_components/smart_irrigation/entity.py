"""SmartIrrigationEntity class."""
from homeassistant.helpers.restore_state import RestoreEntity
import logging

_LOGGER = logging.getLogger(__name__)


class SmartIrrigationEntity(RestoreEntity):
    """Smart Irrigation Entity."""

    def __init__(self, coordinator, config_entry, mytype):
        """Initialize the entity."""
        self.coordinator = coordinator
        self.config_entry = config_entry
        self.type = mytype
        self.entity_id = f"sensor.{coordinator.name}_{mytype.replace(' ','_')}".lower()

    @property
    def should_poll(self):
        """No need to poll. Coordinator notifies entity of updates."""
        return False

    @property
    def available(self):
        """Return if entity is available."""
        return self.coordinator.last_update_success

    @property
    def unique_id(self):
        """Return a unique ID to use for this entity."""
        return self.config_entry.entry_id + "_" + self.type

    async def async_added_to_hass(self):
        """Connect to dispatcher listening for entity data notifications."""
        self.async_on_remove(
            self.coordinator.async_add_listener(self.async_write_ha_state)
        )

    async def async_update(self):
        """Update Coordinator entity."""
        await self.coordinator.async_request_refresh()
