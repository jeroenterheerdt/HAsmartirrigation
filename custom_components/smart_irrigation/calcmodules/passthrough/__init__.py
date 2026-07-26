"""The Passthrough module for Smart Irrigation Integration."""

import logging

import voluptuous as vol
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation.calcmodules.calcmodule import (
    SmartIrrigationCalculationModule,
)

# v1 only, no longer used in v2
# from ...const import CONF_MAXIMUM_ET, DEFAULT_MAXIMUM_ET

_LOGGER = logging.getLogger(__name__)
SCHEMA = vol.Schema({})


class Passthrough(SmartIrrigationCalculationModule):
    """Calculation module that returns the input evapotranspiration value unchanged."""

    def __init__(self, hass: HomeAssistant | None, description, config=None) -> None:
        """Initialize the Passthrough calculation module.

        Args:
            hass: Home Assistant instance or None.
            description: Description of the calculation module.
            config: Optional configuration dictionary.

        """
        if config is None:
            config = {}
        super().__init__(
            name="Passthrough", description=description, schema=SCHEMA, config=config
        )
        self._hass = hass
        # Intermediates of the last calculate() call, for the calculation audit
        # log (#12). The inputs are few here, but "why this number" is asked of
        # the passthrough module just as often.
        self.last_trace: dict | None = None

    def calculate(self, et_data=None):
        """Return the input evapotranspiration value unchanged as a float.

        Args:
            et_data: The evapotranspiration data to pass through.

        Returns:
            The evapotranspiration value as a float, or 0 if input is invalid or None.

        """
        # Fix: Check specifically for None, as 0.0 is valid data but evaluates to False
        if et_data is not None:
            # Ensure the value is a float before returning
            try:
                eto = float(et_data)
            except (ValueError, TypeError):
                _LOGGER.error(
                    "Invalid non-numeric Evapotranspiration data received by Passthrough module: %s",
                    et_data,
                )
                self.last_trace = {
                    "module": self.name,
                    "et_input": et_data,
                    "eto": 0,
                    "error": "non-numeric evapotranspiration",
                }
                # Return 0 if conversion fails, consistent with the original else block's return
                return 0
            self.last_trace = {
                "module": self.name,
                "et_input": et_data,
                "eto": eto,
            }
            return eto
        _LOGGER.error(
            "No Evapotranspiration data specified (et_data is None) for Passthrough module"
        )
        self.last_trace = {
            "module": self.name,
            "et_input": None,
            "eto": 0,
            "error": "no evapotranspiration provided",
        }
        return 0
