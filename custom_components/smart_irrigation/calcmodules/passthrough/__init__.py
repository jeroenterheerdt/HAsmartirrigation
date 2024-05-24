"""The Passthrough module for Smart Irrigation Integration."""

import logging
import voluptuous as vol
from ..calcmodule import SmartIrrigationCalculationModule

# v1 only, no longer used in v2
# from ...const import CONF_MAXIMUM_ET, DEFAULT_MAXIMUM_ET
from ..localize import localize

_LOGGER = logging.getLogger(__name__)
SCHEMA = vol.Schema({})


class Passthrough(SmartIrrigationCalculationModule):
    def __init__(self, hass, description, config={}) -> None:
        super().__init__(
            name="Passthrough", description=description, schema=SCHEMA, config=config
        )
        self._hass = hass

    def calculate(self, et_data=None):
        if et_data:
            return et_data
        else:
            _LOGGER.error("No Evapotranspiration data specified for Passthrough module")
            return 0
