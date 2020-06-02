"""Config flow for Smart Irrigation integration."""
import logging
import voluptuous as vol

from homeassistant import config_entries, exceptions
from homeassistant.core import callback

_LOGGER = logging.getLogger(__name__)

from .OWMClient import OWMClient
from .helpers import map_source_to_sensor
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
    NAME,
    CONF_LEAD_TIME,
    CONF_MAXIMUM_DURATION,
    CONF_FORCE_MODE_DURATION,
    CONF_SHOW_UNITS,
    CONF_AUTO_REFRESH,
    CONF_AUTO_REFRESH_TIME,
    CONF_NAME,
    DEFAULT_LEAD_TIME,
    DEFAULT_MAXIMUM_DURATION,
    DEFAULT_FORCE_MODE_DURATION,
    DEFAULT_SHOW_UNITS,
    DEFAULT_AUTO_REFRESH,
    DEFAULT_AUTO_REFRESH_TIME,
    CONF_SWITCH_SOURCE_PRECIPITATION,
    CONF_SWITCH_SOURCE_DAILY_TEMPERATURE,
    CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE,
    CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE,
    CONF_SWITCH_SOURCE_DEWPOINT,
    CONF_SWITCH_SOURCE_PRESSURE,
    CONF_SWITCH_SOURCE_HUMIDITY,
    CONF_SWITCH_SOURCE_WINDSPEED,
    CONF_SOURCE_SWITCHES,
    CONF_SENSORS,
    DOMAIN,
)


class SmartIrrigationConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Irrigation."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    def __init__(self):
        """Initialize."""
        self._api_key = None
        self._name = NAME
        self._reference_et = {}
        self._errors = {}
        self._sensors = {}
        self.owm_source_settings = {
            CONF_SWITCH_SOURCE_PRECIPITATION: True,
            CONF_SWITCH_SOURCE_DAILY_TEMPERATURE: True,
            CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE: True,
            CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE: True,
            CONF_SWITCH_SOURCE_DEWPOINT: True,
            CONF_SWITCH_SOURCE_PRESSURE: True,
            CONF_SWITCH_SOURCE_HUMIDITY: True,
            CONF_SWITCH_SOURCE_WINDSPEED: True,
        }

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}

        if user_input is not None:
            try:
                await self._check_unique(user_input[CONF_NAME])
                # store values entered
                self._name = user_input[CONF_NAME]
                self.owm_source_settings[CONF_SWITCH_SOURCE_PRECIPITATION] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_PRECIPITATION, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_DAILY_TEMPERATURE] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_DAILY_TEMPERATURE, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_DEWPOINT] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_DEWPOINT, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_PRESSURE] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_PRESSURE, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_HUMIDITY] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_HUMIDITY, True)
                )
                self.owm_source_settings[CONF_SWITCH_SOURCE_WINDSPEED] = bool(
                    user_input.get(CONF_SWITCH_SOURCE_WINDSPEED, True)
                )
                # here is where it gets interesting:
                # - if all of the bools are true then we need to show step2a
                # - if none of the bools are true we can skip step2a and show step2b with all the textboxes to enter sensor names. validation needs to happen in this form as well.
                # - in case of a mix we need to show step2a but also step2b but then with part of the textboxes
                # show next step
                if self.check_all(self.owm_source_settings, True):
                    return await self._show_step3(user_input)  # pure OWM
                else:
                    return await self._show_step2(user_input)  # mix or pure sensors

            except NotUnique:
                _LOGGER.error("Instance name is not unique.")
                self._errors["base"] = "name"

            return await self._show_config_form(user_input)
        return await self._show_config_form(user_input)

    async def _show_config_form(self, user_input):
        """Show the configuration form to edit info."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=NAME): str,
                    # switches for owm or own sensors (true = owm, false = own sensor)
                    vol.Required(CONF_SWITCH_SOURCE_PRECIPITATION, default=True): bool,
                    vol.Required(
                        CONF_SWITCH_SOURCE_DAILY_TEMPERATURE, default=True
                    ): bool,
                    vol.Required(
                        CONF_SWITCH_SOURCE_MINIMUM_TEMPERATURE, default=True
                    ): bool,
                    vol.Required(
                        CONF_SWITCH_SOURCE_MAXIMUM_TEMPERATURE, default=True
                    ): bool,
                    vol.Required(CONF_SWITCH_SOURCE_DEWPOINT, default=True): bool,
                    vol.Required(CONF_SWITCH_SOURCE_PRESSURE, default=True): bool,
                    vol.Required(CONF_SWITCH_SOURCE_HUMIDITY, default=True): bool,
                    vol.Required(CONF_SWITCH_SOURCE_WINDSPEED, default=True): bool,
                }
            ),
            errors=self._errors,
        )

    def check_all(self, settings, b):
        """Returns true if all of the elements in the dictionary are equal to b (true/false)."""
        retval = True
        for a in settings:
            if settings[a] != b:
                retval = False
                break
        return retval

    async def _show_step2(self, user_input):
        """Show the configuration form step 2: Sensors."""
        # build the schema based on which values are false - they need text boxes.
        data_schema = vol.Schema({})
        for a in self.owm_source_settings:
            if not self.owm_source_settings[a]:
                # we need textbox for this setting
                b = map_source_to_sensor(a)
                if not b is None:
                    data_schema = data_schema.extend({vol.Required(b): str})
        return self.async_show_form(
            step_id="step2", data_schema=data_schema, errors=self._errors,
        )

    async def async_step_step2(self, user_input=None):
        """Handle a flow step2."""
        self._errors = {}

        if user_input is not None:
            try:
                # test sensors to make sure they are valid! raise exceptions (below)
                for s in user_input:
                    entity = user_input[s]
                    status = self.hass.states.get(entity)
                    if status is None:
                        raise SensorNotFound

                # store the values
                self._sensors = user_input
                # show next step (step3 if not all values are false in the settings, otherwise skip step3 and show step4)
                if self.check_all(self.owm_source_settings, False):
                    # all values were set to false, so we do not need to show the OWM api step
                    return await self._show_step4(user_input)
                else:
                    return await self._show_step3(user_input)
            except SensorNotFound:
                self._errors["base"] = "sensornotfound"
        return await self._show_step2(user_input)

    async def _show_step3(self, user_input):
        """Show the configuration form step 3: OWM API Key."""
        return self.async_show_form(
            step_id="step3",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str,}),
            errors=self._errors,
        )

    async def async_step_step3(self, user_input=None):
        """Handle a flow step3."""
        self._errors = {}

        if user_input is not None:
            try:
                await self._test_api_key(user_input[CONF_API_KEY])
                self._api_key = user_input[CONF_API_KEY].strip()
                return await self._show_step4(user_input)
            except InvalidAuth:
                self._errors["base"] = "auth"
            except CannotConnect:
                self._errors["base"] = "auth"
        return await self._show_step3(user_input)

    async def _show_step4(self, user_input):
        """Show the configuration form step 4: reference ET values."""
        return self.async_show_form(
            step_id="step4",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_REFERENCE_ET_1): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_2): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_3): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_4): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_5): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_6): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_7): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_8): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_9): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_10): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_11): vol.Coerce(float),
                    vol.Required(CONF_REFERENCE_ET_12): vol.Coerce(float),
                }
            ),
            errors=self._errors,
        )

    async def async_step_step4(self, user_input=None):
        """Handle a flow step4."""
        self._errors = {}

        if user_input is not None:
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
            if valid_et:
                # store entered values
                self._reference_et = reference_et
                # show next step
                return await self._show_step5(user_input)
            else:
                self._errors["base"] = "reference_evapotranspiration_problem"
        return await self._show_step4(user_input)

    async def async_step_step5(self, user_input=None):
        """Handle a flow step5."""
        self._errors = {}

        if user_input is not None:
            user_input[CONF_API_KEY] = self._api_key
            user_input[CONF_REFERENCE_ET] = self._reference_et
            user_input[CONF_NAME] = self._name
            # store the other settings in user_input here as well!
            user_input[CONF_SOURCE_SWITCHES] = self.owm_source_settings
            user_input[CONF_SENSORS] = self._sensors
            await self.async_set_unique_id(self._name)
            self._abort_if_unique_id_configured()

            return self.async_create_entry(title=self._name, data=user_input)

        return await self._show_step5(user_input)

    async def _show_step5(self, user_input):
        """Show the configuration form step 2: reference ET values."""
        return self.async_show_form(
            step_id="step5",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NUMBER_OF_SPRINKLERS): vol.Coerce(float),
                    vol.Required(CONF_FLOW): vol.Coerce(float),
                    vol.Required(CONF_AREA): vol.Coerce(float),
                }
            ),
            errors=self._errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return SmartIrrigationOptionsFlowHandler(config_entry)

    async def _test_api_key(self, api_key):
        """Test access to Open Weather Map API here."""
        client = OWMClient(
            api_key=api_key.strip(), latitude=52.353218, longitude=5.0027695
        )
        try:
            await self.hass.async_add_executor_job(client.get_data)
        except OSError:
            raise InvalidAuth
        except Exception:
            raise CannotConnect

    async def _check_unique(self, n):
        """Test if the specified name is not already claimed."""
        await self.async_set_unique_id(n)
        self._abort_if_unique_id_configured()

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
        except Exception as ex:
            _LOGGER.error("Supplied reference Evapotranspiration was not valid.")
            return False


class SmartIrrigationOptionsFlowHandler(config_entries.OptionsFlow):
    """Smart Irrigation config flow options handler."""

    def __init__(self, config_entry):
        """Initialize HACS options flow."""
        self.config_entry = config_entry
        self.options = dict(config_entry.options)
        self._errors = {}

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        return await self.async_step_user()

    def _check_time(self, itime):
        """Check time."""
        timesplit = itime.split(":")
        if len(timesplit) != 2:
            return False
        else:
            try:
                hours = int(timesplit[0])
                minutes = int(timesplit[1])
                if hours >= 0 and hours <= 23 and minutes >= 0 and minutes <= 59:
                    return True
                else:
                    return False
            except ValueError as ex:
                _LOGGER.error("No valid time specified.")
                return False

    async def _show_options_form(self, user_input):
        """Show the options form to edit info."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    # vol.Required(
                    #    CONF_NUMBER_OF_SPRINKLERS,
                    #    default=self.options.get(
                    #        CONF_NUMBER_OF_SPRINKLERS,
                    #        self.config_entry.data.get(CONF_NUMBER_OF_SPRINKLERS),
                    #    ),
                    # ): vol.Coerce(float),
                    # vol.Required(
                    #    CONF_FLOW,
                    #    default=self.options.get(
                    #        CONF_FLOW, self.config_entry.data.get(CONF_FLOW),
                    #    ),
                    # ): vol.Coerce(float),
                    # vol.Required(
                    #    CONF_AREA,
                    #    default=self.options.get(
                    #        CONF_AREA, self.config_entry.data.get(CONF_AREA),
                    #    ),
                    # ): vol.Coerce(float),
                    vol.Required(
                        CONF_LEAD_TIME,
                        default=self.options.get(CONF_LEAD_TIME, DEFAULT_LEAD_TIME),
                    ): int,
                    vol.Required(
                        CONF_MAXIMUM_DURATION,
                        default=self.options.get(
                            CONF_MAXIMUM_DURATION, DEFAULT_MAXIMUM_DURATION
                        ),
                    ): int,
                    vol.Required(
                        CONF_FORCE_MODE_DURATION,
                        default=self.options.get(
                            CONF_FORCE_MODE_DURATION, DEFAULT_FORCE_MODE_DURATION
                        ),
                    ): int,
                    vol.Required(
                        CONF_SHOW_UNITS,
                        default=self.options.get(CONF_SHOW_UNITS, DEFAULT_SHOW_UNITS),
                    ): bool,
                    vol.Required(
                        CONF_AUTO_REFRESH,
                        default=self.options.get(
                            CONF_AUTO_REFRESH, DEFAULT_AUTO_REFRESH
                        ),
                    ): bool,
                    vol.Required(
                        CONF_AUTO_REFRESH_TIME,
                        default=self.options.get(
                            CONF_AUTO_REFRESH_TIME, DEFAULT_AUTO_REFRESH_TIME
                        ),
                    ): str,
                },
            ),
            errors=self._errors,
        )

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}
        if user_input is not None:

            valid_time = self._check_time(user_input[CONF_AUTO_REFRESH_TIME])
            if not valid_time:
                self._errors["base"] = "auto_refresh_time_error"
                return await self._show_options_form(user_input)
            else:
                # commented out for later right now this results in a NoneType object is not subscriptable in core/homeassistant/data_entry_flow.py (#214)
                # store num_sprinklers, flow, area in data settings as well!
                # data = {**self.config_entry.data}
                # data[CONF_NUMBER_OF_SPRINKLERS] = float(
                #    user_input[CONF_NUMBER_OF_SPRINKLERS]
                # )
                # data[CONF_FLOW] = float(user_input[CONF_FLOW])
                # data[CONF_AREA] = float(user_input[CONF_AREA])
                # _LOGGER.debug("data: {}".format(data))
                # self.hass.config_entries.async_update_entry(
                #    self.config_entry, data=data
                # )
                # settings = {}
                # for x in self.config_entry.data:
                #    settings[x] = self.config_entry.data[x]

                # settings[CONF_NUMBER_OF_SPRINKLERS] = user_input[
                #    CONF_NUMBER_OF_SPRINKLERS
                # ]
                # settings[CONF_FLOW] = user_input[CONF_FLOW]
                # settings[CONF_AREA] = user_input[CONF_AREA]
                # _LOGGER.debug("settings: {}".format(settings))
                # _LOGGER.debug("unique id: {}".format(self.config_entry.unique_id))
                # LOGGER.warning("name: {}".format(settings[CONF_NAME]))
                # await self._update_options(user_input)
                # return self.hass.config_entries.async_update_entry(
                #    self.config_entry,
                #    # unique_id=self.config_entry.unique_id,
                #    title=settings[CONF_NAME],
                #    data=settings,
                #    options=user_input,
                # )

                return await self._update_options(user_input)

        return await self._show_options_form(user_input)

    async def _update_options(self, user_input=None):
        """Update config entry options."""
        return self.async_create_entry(
            title=self.config_entry.data.get(NAME), data=user_input
        )


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""


class NotUnique(exceptions.HomeAssistantError):
    """Error to indicate there is invalid auth."""


class SensorNotFound(exceptions.HomeAssistantError):
    """Error to indicate a sensor is not found."""
