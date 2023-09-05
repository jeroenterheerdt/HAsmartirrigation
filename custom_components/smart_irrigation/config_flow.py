"""Config flow for the Smart Irrigation integration."""
import voluptuous as vol
from homeassistant.core import callback
from homeassistant.helpers.selector import selector
from homeassistant import config_entries, exceptions

from . import const
from .helpers import test_api_key, InvalidAuth, CannotConnect
from .options_flow import SmartIrrigationOptionsFlowHandler

class SmartIrrigationConfigFlow(config_entries.ConfigFlow, domain=const.DOMAIN):
    """Config flow for SmartIrrigation."""

    CONNECTION_CLASS = config_entries.CONN_CLASS_LOCAL_POLL

    def __init__(self):
        self._errors = {}
        self._name = ""
        self._owm_api_key = ""
        self._owm_api_version = 3.0

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""

        self._errors = {}
        # Only a single instance of the integration
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            try:
                await self._check_unique(user_input[const.CONF_INSTANCE_NAME])
                self._name = user_input[const.CONF_INSTANCE_NAME]
                self._use_owm = user_input[const.CONF_USE_OWM]
                if not self._use_owm:
                    #else create the entry right away
                    return self.async_create_entry(title=const.NAME, data=user_input)
                return await self._show_step_1(user_input)
            except NotUnique:
                self._errors["base"] = "name"
        return await self._show_step_user(user_input)

    async def _show_step_user(self,user_input):
        return self.async_show_form(
            step_id = "user",
            data_schema=vol.Schema(
                {
                    vol.Required(const.CONF_INSTANCE_NAME, default=const.NAME): str,
                    vol.Required(const.CONF_USE_OWM, default=True): bool,
                }
            ),
            errors = self._errors,
        )

    async def async_step_step1(self, user_input=None):
        """Handle a step 1."""

        self._errors = {}
        if user_input is not None:
            try:
                # store values entered
                self._owm_api_key = user_input[const.CONF_OWM_API_KEY].strip()
                self._owm_api_version = user_input[const.CONF_OWM_API_VERSION]
                user_input[const.CONF_USE_OWM] = self._use_owm
                user_input[const.CONF_INSTANCE_NAME] = self._name
                await test_api_key(
                    self.hass,self._owm_api_key,self._owm_api_version
                )
                return self.async_create_entry(title=const.NAME, data=user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"


            return await self._show_step_1(user_input)
        return await self._show_step_1(user_input)

    async def _show_step_1(self,user_input):
        return self.async_show_form(
            step_id = "step1",
            data_schema=vol.Schema(
                {

                    vol.Required(const.CONF_OWM_API_KEY): str,
                    vol.Required(const.CONF_OWM_API_VERSION, default="3.0"): selector(
                        {"select": {"options": ["2.5", "3.0"]}}
                    ),
                }
            ),
            errors = self._errors,
        )


    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get options flow."""
        return SmartIrrigationOptionsFlowHandler(config_entry)



    async def _check_unique(self, thename):
        """Test if the specified name is not already claimed."""
        await self.async_set_unique_id(thename)
        self._abort_if_unique_id_configured()



class NotUnique(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""