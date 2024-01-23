"""The Static module for Smart Irrigation Integration."""
import logging
import voluptuous as vol
from ..calcmodule import SmartIrrigationCalculationModule
#v1 only, no longer used in v2
# from ...const import CONF_MAXIMUM_ET, DEFAULT_MAXIMUM_ET
from ..localize import localize
_LOGGER = logging.getLogger(__name__)

CONF_DELTA = "delta"

DEFAULT_DELTA = 0.0
SCHEMA = vol.Schema(
    {
        vol.Required(CONF_DELTA, default=DEFAULT_DELTA): vol.Coerce(float),
    }
)

class Static(SmartIrrigationCalculationModule):
    def __init__(self, hass, config: {}) -> None:
        super().__init__(name="Static", description=localize("calcmodules.static.description",hass.config.language)+".", config=config, schema=SCHEMA)
        self._delta = DEFAULT_DELTA
        if config:
            self._delta = float(config.get(CONF_DELTA, DEFAULT_DELTA))

    def calculate(self):
        return self._delta