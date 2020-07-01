"""Config flow for Smart Irrigation integration."""
from .OWMClient import OWMClient
from .helpers import (
    map_source_to_sensor,
    check_all,
    check_reference_et,
    check_time,
)
from .const import (  # pylint: disable=unused-import
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
    CONF_SWITCH_SOURCE_SOLAR_RADIATION,
    CONF_SOURCE_SWITCHES,
    CONF_SENSORS,
    CONF_INITIAL_UPDATE_DELAY,
    DEFAULT_INITIAL_UPDATE_DELAY,
    DOMAIN,
    DEFAULT_REFERENCE_ET,
    CONF_COASTAL,
    DEFAULT_COASTAL,
    CONF_ESTIMATE_SOLRAD_FROM_TEMP,
    DEFAULT_ESTIMATE_SOLRAD_FROM_TEMP,
    CONF_SWITCH_CALCULATE_ET,
    CONF_SENSOR_ET,
    CONF_SENSOR_PRECIPITATION,
)

import logging
import voluptuous as vol
import copy

from homeassistant import config_entries, exceptions
from homeassistant.core import callback

_LOGGER = logging.getLogger(__name__)


class SmartIrrigationConfigFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Irrigation."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    def __init__(self):
        """Initialize."""
        self._api_key = None
        self._name = NAME
        self._calculate_ET = True
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
            CONF_SWITCH_SOURCE_SOLAR_RADIATION: True,
        }

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}

        if user_input is not None:
            try:
                await self._check_unique(user_input[CONF_NAME])
                # store values entered
                self._name = user_input[CONF_NAME]

                # if it is true, skip step 0, else show step 0
                self.owm_source_settings[CONF_SWITCH_CALCULATE_ET] = user_input[
                    CONF_SWITCH_CALCULATE_ET
                ]
                if self.owm_source_settings[CONF_SWITCH_CALCULATE_ET]:
                    return await self._show_step_1(user_input)

                return await self._show_step_0(user_input)

            except NotUnique:
                _LOGGER.error("Instance name is not unique.")
                self._errors["base"] = "name"

            return await self._show_config_form(user_input)
        return await self._show_config_form(user_input)

    async def _show_config_form(self, user_input):
        """Show config form."""
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_NAME, default=NAME): str,
                    vol.Required(CONF_SWITCH_CALCULATE_ET, default=True): bool,
                }
            ),
            errors=self._errors,
        )

    async def async_step_step0(self, user_input=None):
        """Handle step 0."""
        self._errors = {}

        if user_input is not None:
            try:
                et_entity = user_input[CONF_SENSOR_ET]
                et_status = self.hass.states.get(et_entity)
                precip_entity = user_input[CONF_SENSOR_PRECIPITATION]
                precip_status = self.hass.states.get(precip_entity)
                if et_status is None or precip_status is None:
                    raise SensorNotFound
                # store values entered
                # self._sensors = user_input
                self._sensors[CONF_SENSOR_ET] = et_entity
                self._sensors[CONF_SENSOR_PRECIPITATION] = precip_entity

                # we can skip directly to step4 because we don't need all the other info if we are not calculating...
                return await self._show_step4(user_input)

            except SensorNotFound:
                self._errors["base"] = "sensornotfound"

            return await self._show_step_0(user_input)

    async def _show_step_0(self, user_input):
        """Show step 0."""
        return self.async_show_form(
            step_id="step0",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SENSOR_ET): str,
                    vol.Required(CONF_SENSOR_PRECIPITATION): str,
                }
            ),
            errors=self._errors,
        )

    async def async_step_step1(self, user_input=None):
        """Handle step 1."""
        self._errors = {}

        if user_input is not None:
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
            self.owm_source_settings[CONF_SWITCH_SOURCE_SOLAR_RADIATION] = bool(
                user_input.get(CONF_SWITCH_SOURCE_SOLAR_RADIATION, True)
            )
            # here is where it gets interesting:
            # - if all of the bools are true then we need to show step2a
            # - if none of the bools are true we can skip step2a and show step2b with all the textboxes to enter sensor names. validation needs to happen in this form as well.
            # - in case of a mix we need to show step2a but also step2b but then with part of the textboxes
            # show next step
            if check_all(self.owm_source_settings, True):
                return await self._show_step3(user_input)  # pure OWM
            return await self._show_step2(user_input)  # mix or pure sensors

        return await self._show_step_1(user_input)

    async def _show_step_1(self, user_input):
        """Show the configuration form to edit info."""
        return self.async_show_form(
            step_id="step1",
            data_schema=vol.Schema(
                {
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
                    vol.Required(
                        CONF_SWITCH_SOURCE_SOLAR_RADIATION, default=True
                    ): bool,
                }
            ),
            errors=self._errors,
        )

    async def _show_step2(self, user_input):
        """Show the configuration form step 2: Sensors."""
        # build the schema based on which values are false - they need text boxes.
        data_schema = vol.Schema({})
        for aval in self.owm_source_settings:
            if not self.owm_source_settings[aval]:
                # we need textbox for this setting
                bval = map_source_to_sensor(aval)
                if bval is not None:
                    data_schema = data_schema.extend({vol.Required(bval): str})
        return self.async_show_form(
            step_id="step2", data_schema=data_schema, errors=self._errors,
        )

    async def async_step_step2(self, user_input=None):
        """Handle a flow step2."""
        self._errors = {}

        if user_input is not None:
            try:
                # test sensors to make sure they are valid! raise exceptions (below)
                for sensor in user_input:
                    entity = user_input[sensor]
                    status = self.hass.states.get(entity)
                    if status is None:
                        raise SensorNotFound
                    # store the value
                    self._sensors[sensor] = entity
                # store the values
                # self._sensors.update(user_input)
                # show next step (step3 if not all values are false in the settings (except for radiation calculation), otherwise skip step3 and show step4)
                settings_for_check = copy.deepcopy(self.owm_source_settings)
                [
                    settings_for_check.pop(k)
                    for k in list(settings_for_check.keys())
                    if k
                    in (CONF_SWITCH_SOURCE_SOLAR_RADIATION, CONF_SWITCH_CALCULATE_ET)
                ]
                if check_all(settings_for_check, False):
                    # all values were set to false, so we do not need to show the OWM api step
                    return await self._show_step4(user_input)
                return await self._show_step3(user_input)
            except SensorNotFound:
                self._errors["base"] = "sensornotfound"
        return await self._show_step2(user_input)

    async def _show_step3(self, user_input):
        """Show the configuration form step 3: OWM API Key."""
        return self.async_show_form(
            step_id="step3",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): str}),
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
                    vol.Required(
                        CONF_REFERENCE_ET_1, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_2, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_3, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_4, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_5, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_6, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_7, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_8, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_9, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_10, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_11, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
                    vol.Required(
                        CONF_REFERENCE_ET_12, default=DEFAULT_REFERENCE_ET
                    ): vol.Coerce(float),
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
            valid_et = check_reference_et(reference_et)
            if valid_et:
                # store entered values
                self._reference_et = reference_et
                # show next step
                return await self._show_step5(user_input)
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
        """Get options flow."""
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

    async def _check_unique(self, thename):
        """Test if the specified name is not already claimed."""
        await self.async_set_unique_id(thename)
        self._abort_if_unique_id_configured()


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
                    # DISABLED : CHANGE_PERCENT has been disabled in v0.0.40 onwards since it introduced bugs.
                    # vol.Required(
                    #     CONF_CHANGE_PERCENT,
                    #     default=float(
                    #         self.options.get(
                    #             CONF_CHANGE_PERCENT, DEFAULT_CHANGE_PERCENT
                    #         )
                    #         * 100.0
                    #     ),
                    # ): vol.Coerce(float),
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
                    vol.Required(
                        CONF_INITIAL_UPDATE_DELAY,
                        default=self.options.get(
                            CONF_INITIAL_UPDATE_DELAY, DEFAULT_INITIAL_UPDATE_DELAY
                        ),
                    ): int,
                    vol.Required(
                        CONF_COASTAL,
                        default=self.options.get(CONF_COASTAL, DEFAULT_COASTAL),
                    ): bool,
                    vol.Required(
                        CONF_ESTIMATE_SOLRAD_FROM_TEMP,
                        default=self.options.get(
                            CONF_ESTIMATE_SOLRAD_FROM_TEMP,
                            DEFAULT_ESTIMATE_SOLRAD_FROM_TEMP,
                        ),
                    ): bool,
                },
            ),
            errors=self._errors,
        )

    async def async_step_user(self, user_input=None):
        """Handle a flow initialized by the user."""
        self._errors = {}
        if user_input is not None:

            valid_time = check_time(user_input[CONF_AUTO_REFRESH_TIME])
            if not valid_time:
                self._errors["base"] = "auto_refresh_time_error"
                return await self._show_options_form(user_input)
            if int(user_input[CONF_MAXIMUM_DURATION]) < -1:
                self._errors["base"] = "maximum_duration_error"
                return await self._show_options_form(user_input)
            if int(user_input[CONF_INITIAL_UPDATE_DELAY]) < 0:
                self._errors["base"] = "initial_update_delay_error"
                return await self._show_options_form(user_input)

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
            # LOGGER.info("name: {}".format(settings[CONF_NAME]))
            # await self._update_options(user_input)
            # return self.hass.config_entries.async_update_entry(
            #    self.config_entry,
            #    # unique_id=self.config_entry.unique_id,
            #    title=settings[CONF_NAME],
            #    data=settings,
            #    options=user_input,
            # )

            # assuming people enter 50% or so
            # DISABLED : CHANGE_PERCENT has been disabled in v0.0.40 onwards since it introduced bugs.
            # user_input[CONF_CHANGE_PERCENT] = user_input[CONF_CHANGE_PERCENT] / 100.0
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
