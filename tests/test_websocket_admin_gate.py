"""Secrets and whole-configuration access are for administrators only.

The panel is already admin-only, but these commands are registered on the
websocket API and can be called by any authenticated client without going
through it. The weather service payload carries the API key in clear.

Both halves are asserted on purpose. A test that only checked the gated
commands would still pass if a name were misspelled and nothing were gated at
all, and a gate quietly widened to the read commands would break the non-admin
Lovelace card on the roadmap without anyone noticing.
"""

from unittest.mock import Mock

import pytest
from homeassistant.exceptions import Unauthorized

from custom_components.smart_irrigation import websockets

# The handlers hand a coroutine to a Mock hass, which never awaits it.
pytestmark = pytest.mark.filterwarnings(
    "ignore:coroutine .* was never awaited:RuntimeWarning"
)

ADMIN_ONLY = [
    "websocket_get_weather_service",
    "websocket_set_weather_service",
]

OPEN_TO_ANY_USER = [
    "websocket_get_zones",
    "websocket_get_modules",
    "websocket_get_mappings",
    "websocket_get_config",
    "websocket_get_irrigation_info",
]


def _connection(is_admin):
    connection = Mock()
    connection.user = Mock(is_admin=is_admin)
    return connection


def _hass():
    hass = Mock()
    hass.data = {"smart_irrigation": {}}
    return hass


@pytest.mark.parametrize("name", ADMIN_ONLY + OPEN_TO_ANY_USER)
def test_the_handler_named_here_exists(name):
    """A misspelled name would make every other assertion vacuous."""
    assert callable(getattr(websockets, name))


@pytest.mark.parametrize("name", ADMIN_ONLY)
def test_a_non_admin_is_refused(name):
    with pytest.raises(Unauthorized):
        getattr(websockets, name)(_hass(), _connection(False), {"id": 1})


@pytest.mark.parametrize("name", ADMIN_ONLY)
def test_an_admin_is_not_refused(name):
    """Proves the gate is the user check and not something else failing."""
    getattr(websockets, name)(_hass(), _connection(True), {"id": 1})


@pytest.mark.parametrize("name", OPEN_TO_ANY_USER)
def test_reading_stays_open_to_any_authenticated_user(name):
    """A household member has to be able to see whether the garden is watered."""
    getattr(websockets, name)(_hass(), _connection(False), {"id": 1})


def test_the_secret_is_what_we_are_protecting():
    """Pin why the weather service command is gated, so it is not undone."""
    import inspect

    source = inspect.getsource(websockets.websocket_get_weather_service)
    assert "API_KEY" in source


def _request(is_admin):
    """A request the HTTP admin gate can read, backed by a Mock hass."""
    hass = _hass()
    coordinator = Mock()
    coordinator.store = Mock()
    hass.data["smart_irrigation"]["coordinator"] = coordinator
    request = {"hass_user": Mock(is_admin=is_admin)}
    request = type(
        "_Request",
        (dict,),
        {"app": {"hass": hass}, "json": None},
    )(request)
    return request


async def test_only_an_admin_can_dump_the_whole_configuration():
    view = object.__new__(websockets.SmartIrrigationExportView)

    with pytest.raises(Unauthorized):
        await view.get(_request(False))


async def test_only_an_admin_can_replace_the_whole_configuration():
    view = object.__new__(websockets.SmartIrrigationRestoreView)

    with pytest.raises(Unauthorized):
        await view.post(_request(False))
