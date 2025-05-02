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
        # Fix: Check specifically for None, as 0.0 is valid data but evaluates to False
        if et_data is not None:
            # Ensure the value is a float before returning
            try:
                return float(et_data)
            except (ValueError, TypeError):
                 _LOGGER.error(f"Invalid non-numeric Evapotranspiration data received by Passthrough module: {et_data}")
                 # Return 0 if conversion fails, consistent with the original else block's return
                 return 0
        else:
            _LOGGER.error("No Evapotranspiration data specified (et_data is None) for Passthrough module")
            return 0
