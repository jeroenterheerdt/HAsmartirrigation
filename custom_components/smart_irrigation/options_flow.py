import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers.selector import selector

from . import const
from .helpers import CannotConnect, InvalidAuth, test_api_key


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation config flow options handler."""

    # options flow should allow change of use OWM (boolean)
    # options flow should allow update of API key (if set) and version (only if api key set)

    def __init__(self, config_entry) -> None:
        """Initialize HACS options flow."""
        self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}
        # migrate from use_owm to weather_service
        if "use_owm" in self.config_entry.data:
            self._use_weather_service = self.config_entry.data.get("use_owm")
            self._weather_service = const.CONF_WEATHER_SERVICE_OWM
            self._weather_service_api_key = self.config_entry.data.get("owm_api_key")
        if const.CONF_USE_WEATHER_SERVICE in self.options and self.options.get(
            const.CONF_USE_WEATHER_SERVICE
        ) != self.config_entry.data.get(const.CONF_USE_WEATHER_SERVICE):
            self._use_weather_service = self.options.get(const.CONF_USE_WEATHER_SERVICE)
        else:
            self._use_weather_service = self.config_entry.data.get(
                const.CONF_USE_WEATHER_SERVICE
            )
        if const.CONF_WEATHER_SERVICE in self.options:
            self._weather_service = self.options.get(const.CONF_WEATHER_SERVICE)
        else:
            self._weather_service = self.config_entry.data.get(
                const.CONF_WEATHER_SERVICE
            )
        if const.CONF_WEATHER_SERVICE_API_KEY in self.options:
            self._weather_service_api_key = self.options.get(
                const.CONF_WEATHER_SERVICE_API_KEY
            )
        else:
            self._weather_service_api_key = self.config_entry.data.get(
                const.CONF_WEATHER_SERVICE_API_KEY
            )
        if self._weather_service_api_key is not None:
            self._weather_service_api_key = self._weather_service_api_key.strip()
        if const.CONF_WEATHER_SERVICE_API_VERSION in self.options:
            self._owm_api_version = self.options.get(
                const.CONF_WEATHER_SERVICE_API_VERSION
            )
        else:
            self._owm_api_version = self.config_entry.data.get(
                const.CONF_WEATHER_SERVICE_API_VERSION
            )

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        self._errors = {}
        # set default values based on config
        if user_input is not None:
            # validation
            try:
                # store values entered
                self._use_weather_service = user_input[const.CONF_USE_WEATHER_SERVICE]
                if not self._use_weather_service:
                    # update the entry right away and remove the API info
                    user_input[const.CONF_WEATHER_SERVICE_API_KEY] = None
                    # forcing it to be 3.0 because of sunsetting of 2.5 API by OWM in June 2024
                    # user_input[const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
                    return self.async_create_entry(title="", data=user_input)
                else:
                    # show the next step where you can configure / update API key/version
                    return await self._show_step_1(user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        const.CONF_USE_WEATHER_SERVICE,
                        default=self._use_weather_service,
                    ): bool,
                }
            ),
            errors=self._errors,
        )

    async def _show_step_1(self, user_input):
        return self.async_show_form(
            step_id="step1",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        const.CONF_WEATHER_SERVICE, default=self._weather_service
                    ): selector({"select": {"options": const.CONF_WEATHER_SERVICES}}),
                    vol.Required(
                        const.CONF_WEATHER_SERVICE_API_KEY,
                        default=self._weather_service_api_key,
                    ): str,
                    # vol.Required(const.CONF_OWM_API_VERSION, default=self._owm_api_version): selector(
                    #    {"select": {"options": ["2.5", "3.0"]}}
                    # ),
                }
            ),
            errors=self._errors,
        )

    async def async_step_step1(self, user_input=None):
        """Handle a step 1."""

        self._errors = {}
        if user_input is not None:
            try:
                # store values entered
                self._weather_service_api_key = user_input[
                    const.CONF_WEATHER_SERVICE_API_KEY
                ].strip()
                self._weather_service = user_input[const.CONF_WEATHER_SERVICE]
                # forcing it to be 3.0 because of sunsetting of 2.5 API by OWM in June 2024
                # user_input[const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
                # self._owm_api_version = user_input[
                #    const.CONF_WEATHER_SERVICE_API_VERSION
                # ]
                user_input[const.CONF_USE_WEATHER_SERVICE] = self._use_weather_service
                await test_api_key(
                    self.hass, self._weather_service, self._weather_service_api_key
                )
                return self.async_create_entry(title="", data=user_input)

            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"

            return await self._show_step_1(user_input)
        return await self._show_step_1(user_input)
