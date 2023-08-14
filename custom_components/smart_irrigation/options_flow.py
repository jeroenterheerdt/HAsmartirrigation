from homeassistant.helpers.selector import selector
import voluptuous as vol
from homeassistant import config_entries
from . import const
from .helpers import test_api_key, InvalidAuth,CannotConnect


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation config flow options handler."""

    # options flow should allow update of API key (if set) and version (only if api key set)

    def __init__(self, config_entry):
        """Initialize HACS options flow."""
        self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}
        self._owm_api_key = self.config_entry.data.get(const.CONF_OWM_API_KEY);
        self._owm_api_version = self.config_entry.data.get(const.CONF_OWM_API_VERSION);

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        self._errors = {}
        #set default values based on config
        if user_input is not None:
            #validation
            try:
                # store values entered
                self._owm_api_key = user_input[const.CONF_OWM_API_KEY].strip()
                self._owm_api_version = user_input[const.CONF_OWM_API_VERSION]
                await test_api_key(self.hass, api_key=self._owm_api_key, api_version=self._owm_api_version)
                return self.async_create_entry(title="", data=user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"
        return self.async_show_form(
            step_id="init", data_schema=vol.Schema(
                {
                    vol.Required(const.CONF_OWM_API_KEY,default=self._owm_api_key): str,
                    vol.Required(const.CONF_OWM_API_VERSION, default=self._owm_api_version): selector(
                        {"select": {"options": ["2.5", "3.0"]}}
                    ),
                }
            ), errors=self._errors
        )
