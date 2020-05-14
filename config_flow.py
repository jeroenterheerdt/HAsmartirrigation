"""Config flow for Smart Irrigation integration."""
import logging
import requests
import json
import voluptuous as vol

from homeassistant import config_entries, core, exceptions

from .const import DOMAIN  # pylint:disable=unused-import

_LOGGER = logging.getLogger(__name__)

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
)


class SmartIrrigationConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Irrigation."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    def __init__(self):
        """Initialize."""
        self._errors = {}

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}

        # only a single instance is allowed
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            valid_api = await self._test_api_key(user_input[CONF_API_KEY])
            reference_et = [
                user_input[CONF_REFERENCE_ET_1],
                user_input[CONF_REFERENCE_ET_2],
                user_input[CONF_REFERENCE_ET_3],
                user_input[CONF_REFERENCE_ET_4],
                user_input[CONF_REFERENCE_ET_5],
                user_input[CONF_REFERENCE_ET_6],
                user_input[CONF_REFERENCE_ET_7],
                user_input[CONF_REFERENCE_ET_8],
                user_input[CONF_REFERENCE_ET_9],
                user_input[CONF_REFERENCE_ET_10],
                user_input[CONF_REFERENCE_ET_11],
                user_input[CONF_REFERENCE_ET_12],
            ]

            valid_et = self._check_reference_et(reference_et)

            if valid_api and valid_et:
                return self.async_create_entry(title=NAME, data=user_input)
            if not valid_api:
                self._errors["base"] = "auth"
            elif not valid_et:
                self._errors["base"] = "reference_et_problem"
            return await self._show_config_form(user_input)
        return await self._show_config_form(user_input)

    async def _show_config_form(self, user_input):
        """Show the configuration form to edit info."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_API_KEY): str,
                    vol.Required(CONF_REFERENCE_ET_1): float,
                    vol.Required(CONF_REFERENCE_ET_2): float,
                    vol.Required(CONF_REFERENCE_ET_3): float,
                    vol.Required(CONF_REFERENCE_ET_4): float,
                    vol.Required(CONF_REFERENCE_ET_5): float,
                    vol.Required(CONF_REFERENCE_ET_6): float,
                    vol.Required(CONF_REFERENCE_ET_7): float,
                    vol.Required(CONF_REFERENCE_ET_8): float,
                    vol.Required(CONF_REFERENCE_ET_9): float,
                    vol.Required(CONF_REFERENCE_ET_10): float,
                    vol.Required(CONF_REFERENCE_ET_11): float,
                    vol.Required(CONF_REFERENCE_ET_12): float,
                    vol.Required(CONF_NUMBER_OF_SPRINKLERS): int,
                    vol.Required(CONF_FLOW): float,
                    vol.Required(CONF_AREA): int,
                }
            ),
            errors=self._errors,
        )

    async def _test_api_key(self, api_key):
        """Test access to Open Weather Map API here."""
        client = OWMClient(api_key=api_key, latitude=52.353218, longitude=5.0027695)

        try:
            client.get_data()
            return True
        except Exception as Ex:
            _LOGGER.error(Ex.strerror)
            return False

    def _check_reference_et(self, reference_et):
        """Check reference et values here."""
        try:
            if len(reference_et) != 12:
                return False
            else:
                all_floats = True
                for r in reference_et:
                    if not isinstance(r, float):
                        all_floats = False
                        break
                return all_floats
        except Exception as e:
            _LOGGER.error("Supplied reference ET was not valid.")
            return False

    def _check_irrigation_time(self, itime):
        """Check irrigation time."""
        timesplit = itime.split(":")
        if len(timesplit) != 2:
            return False
        else:
            try:
                hours = val(timesplit[0])
                minutes = val(timesplit[1])
                if hours >= 0 and hours <= 23 and minutes >= 0 and minutes <= 59:
                    return True
                else:
                    return False
            except ValueError as e:
                _LOGGER.error("No valid irrigation time specified.")
                return False
