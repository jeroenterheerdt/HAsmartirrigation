import datetime
import logging

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.components.http.data_validator import RequestDataValidator
from homeassistant.components.websocket_api import (
    async_register_command,
    async_response,
    decorators,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from . import const

_LOGGER = logging.getLogger(__name__)


@callback
@decorators.websocket_command(
    {
        vol.Required("type"): const.DOMAIN + "_config_updated",
    }
)
@decorators.async_response
async def handle_subscribe_updates(hass: HomeAssistant, connection, msg):
    """Handle subscribe updates."""

    @callback
    def async_handle_event():
        """Forward events to websocket."""
        connection.send_message(
            {
                "id": msg["id"],
                "type": "event",
            }
        )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, const.DOMAIN + "_update_frontend", async_handle_event
    )
    connection.send_result(msg["id"])


class SmartIrrigationConfigView(HomeAssistantView):
    url = "/api/" + const.DOMAIN + "/config"
    name = "api:" + const.DOMAIN + ":config"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.CONF_CALC_TIME): cv.string,
                vol.Optional(const.CONF_UNITS): cv.string,
                vol.Optional(const.CONF_AUTO_CALC_ENABLED): cv.boolean,
                vol.Optional(const.CONF_AUTO_UPDATE_ENABLED): cv.boolean,
                vol.Optional(const.CONF_AUTO_UPDATE_SCHEDULE): cv.string,
                vol.Optional(const.CONF_AUTO_UPDATE_DELAY): cv.string,
                vol.Optional(const.CONF_AUTO_UPDATE_INTERVAL): cv.string,
                vol.Optional(const.CONF_AUTO_CLEAR_ENABLED): cv.boolean,
                vol.Optional(const.CONF_CLEAR_TIME): cv.string,
                vol.Optional(const.CONF_CONTINUOUS_UPDATES): cv.boolean,
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        await coordinator.async_update_config(data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


class SmartIrrigationModuleView(HomeAssistantView):
    url = "/api/" + const.DOMAIN + "/modules"
    name = "api:" + const.DOMAIN + ":modules"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.MODULE_ID): vol.Coerce(int),
                vol.Optional(const.MODULE_NAME): cv.string,
                vol.Optional(const.MODULE_DESCRIPTION): vol.Or(None, cv.string),
                vol.Optional(const.MODULE_CONFIG): vol.Coerce(dict),
                vol.Optional(const.MODULE_SCHEMA): vol.Coerce(list),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
            },
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        if const.MODULE_ID in data:
            module = int(data[const.MODULE_ID])
            # del data[const.ZONE_ID]
        else:
            module = None
        await coordinator.async_update_module_config(module, data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


class SmartIrrigationAllModuleView(HomeAssistantView):
    url = "/api/" + const.DOMAIN + "/allmodules"
    name = "api:" + const.DOMAIN + ":allmodules"


class SmartIrrigationMappingView(HomeAssistantView):
    url = "/api/" + const.DOMAIN + "/mappings"
    name = "api:" + const.DOMAIN + ":mapping"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.MAPPING_ID): vol.Coerce(int),
                vol.Optional(const.MAPPING_NAME): cv.string,
                vol.Optional(const.MAPPING_MAPPINGS): vol.Coerce(dict),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
                vol.Optional(const.MAPPING_DATA): vol.Coerce(list),
                vol.Optional(const.MAPPING_DATA_LAST_UPDATED): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.MAPPING_DATA_LAST_ENTRY): vol.Or(
                    None, vol.Coerce(list)
                ),
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        if const.MAPPING_ID in data:
            mapping = int(data[const.MAPPING_ID])
            # del data[const.ZONE_ID]
        else:
            mapping = None
        await coordinator.async_update_mapping_config(mapping, data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


class SmartIrrigationZoneView(HomeAssistantView):
    url = "/api/" + const.DOMAIN + "/zones"
    name = "api:" + const.DOMAIN + ":zones"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.ZONE_ID): vol.Coerce(int),
                vol.Optional(const.ZONE_NAME): cv.string,
                vol.Optional(const.ZONE_SIZE): cv.positive_float,
                vol.Optional(const.ZONE_THROUGHPUT): cv.positive_float,
                vol.Optional(const.ZONE_STATE): vol.In(const.ZONE_STATES),
                vol.Optional(const.ZONE_DURATION): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_BUCKET): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_OLD_BUCKET): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_DELTA): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_MODULE): vol.Or(int, str, None),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
                vol.Optional(const.ATTR_CALCULATE): cv.boolean,
                vol.Optional(const.ATTR_CALCULATE_ALL): cv.boolean,
                vol.Optional(const.ATTR_UPDATE): cv.boolean,
                vol.Optional(const.ATTR_UPDATE_ALL): cv.boolean,
                vol.Optional(const.ATTR_RESET_ALL_BUCKETS): cv.boolean,
                vol.Optional(const.ATTR_OVERRIDE_CACHE): cv.boolean,
                vol.Optional(const.ZONE_EXPLANATION): vol.Coerce(str),
                vol.Optional(const.ZONE_MULTIPLIER): vol.Coerce(float),
                vol.Optional(const.ZONE_MAPPING): vol.Or(int, str, None),
                vol.Optional(const.ZONE_LEAD_TIME): vol.Coerce(float),
                vol.Optional(const.ZONE_MAXIMUM_DURATION): vol.Coerce(float),
                vol.Optional(const.ZONE_MAXIMUM_BUCKET): vol.Or(float, int, None),
                vol.Optional(const.ZONE_LAST_CALCULATED): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.ZONE_LAST_UPDATED): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.ZONE_NUMBER_OF_DATA_POINTS): vol.Or(int, None),
                vol.Optional(const.ATTR_CLEAR_ALL_WEATHERDATA): cv.boolean,
                vol.Optional(const.ZONE_DRAINAGE_RATE): vol.Or(float, int, None),
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        if const.ZONE_ID in data:
            zone = int(data[const.ZONE_ID])
            # del data[const.ZONE_ID]
        else:
            zone = None
        await coordinator.async_update_zone_config(zone, data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


@callback
def websocket_get_config(hass: HomeAssistant, connection, msg):
    """Publish config data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    config = coordinator.store.async_get_config()
    connection.send_result(msg["id"], config)


@callback
def websocket_get_zones(hass: HomeAssistant, connection, msg):
    """Publish zone data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    zones = coordinator.store.get_zones()
    connection.send_result(msg["id"], zones)


@callback
def websocket_get_modules(hass: HomeAssistant, connection, msg):
    """Publish module data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    modules = coordinator.store.get_modules()
    connection.send_result(msg["id"], modules)


@callback
@async_response
async def websocket_get_all_modules(hass: HomeAssistant, connection, msg):
    """Publish all module data. This is not retrieved from the store."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    modules = await coordinator.async_get_all_modules()
    connection.send_result(msg["id"], modules)


@callback
def websocket_get_mappings(hass: HomeAssistant, connection, msg):
    """Publish mapping data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    mappings = coordinator.store.get_mappings()
    connection.send_result(msg["id"], mappings)


async def async_register_websockets(hass: HomeAssistant):
    hass.http.register_view(SmartIrrigationConfigView)
    hass.http.register_view(SmartIrrigationZoneView)
    hass.http.register_view(SmartIrrigationModuleView)
    hass.http.register_view(SmartIrrigationAllModuleView)
    hass.http.register_view(SmartIrrigationMappingView)

    async_register_command(hass, handle_subscribe_updates)

    async_register_command(
        hass,
        const.DOMAIN + "/config",
        websocket_get_config,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/config"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/zones",
        websocket_get_zones,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/zones"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/modules",
        websocket_get_modules,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/modules"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/allmodules",
        websocket_get_all_modules,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/allmodules"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/mappings",
        websocket_get_mappings,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/mappings"}
        ),
    )
