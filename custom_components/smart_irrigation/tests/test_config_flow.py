"""Test Smart Irrigation config flow."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.config_flow import (
    SmartIrrigationConfigFlow,
    CannotConnect,
    InvalidAuth,
)

# Import MockConfigEntry from the root tests module
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
from tests.common import MockConfigEntry


# Mock problematic modules to prevent infrastructure issues
@pytest.fixture(autouse=True)
def mock_trigger_setup():
    """Mock trigger setup to prevent async_setup AttributeError."""
    with patch("homeassistant.helpers.trigger.async_setup", return_value=None):
        yield


@pytest.fixture(autouse=True)
def mock_timezone():
    """Mock timezone to UTC to prevent timezone mismatch."""
    with patch("homeassistant.util.dt.DEFAULT_TIME_ZONE", "UTC"):
        yield


@pytest.fixture(autouse=True)
def mock_setup_entry():
    """Mock setup entry to prevent integration loading issues."""
    with patch(
        "custom_components.smart_irrigation.async_setup_entry", return_value=True
    ):
        yield


@pytest.fixture(autouse=True)
def mock_unload_entry():
    """Mock unload entry to prevent cleanup issues."""
    with patch(
        "custom_components.smart_irrigation.async_unload_entry", return_value=True
    ):
        yield


class TestSmartIrrigationConfigFlow:
    """Test Smart Irrigation config flow."""

    async def test_form_user_step(self, hass: HomeAssistant) -> None:
        """Test we get the form for user step."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        assert result["type"] is FlowResultType.FORM
        assert result["errors"] == {}

    async def test_form_user_step_single_instance(self, hass: HomeAssistant) -> None:
        """Test single instance check."""
        # Create an existing config entry
        config_entry = MockConfigEntry(
            domain=const.DOMAIN,
            title=const.NAME,
            data={},
            entry_id="existing_entry",
        )
        config_entry.add_to_hass(hass)

        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        assert result["type"] is FlowResultType.ABORT
        assert result["reason"] == "single_instance_allowed"

    async def test_form_user_step_without_weather_service(
        self, hass: HomeAssistant
    ) -> None:
        """Test form submission without weather service."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: False,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input
        )

        assert result2["type"] is FlowResultType.CREATE_ENTRY
        assert result2["title"] == const.NAME
        assert result2["data"] == user_input

    async def test_form_user_step_with_weather_service(
        self, hass: HomeAssistant
    ) -> None:
        """Test form submission with weather service enabled."""
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input
        )

        assert result2["type"] is FlowResultType.FORM
        assert result2["step_id"] == "step1"

    async def test_weather_service_step_owm(self, hass: HomeAssistant) -> None:
        """Test weather service configuration step with OWM."""
        # Start flow and get to weather service step
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        # Configure weather service
        with patch(
            "custom_components.smart_irrigation.helpers.test_api_key", return_value=None
        ) as mock_test:
            user_input_2 = {
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
                const.CONF_WEATHER_SERVICE_API_KEY: "test_api_key",
            }

            result3 = await hass.config_entries.flow.async_configure(
                result2["flow_id"], user_input_2
            )

            assert result3["type"] is FlowResultType.CREATE_ENTRY
            assert result3["title"] == const.NAME
            expected_data = {**user_input_1, **user_input_2}
            assert result3["data"] == expected_data
            mock_test.assert_called_once()

    async def test_weather_service_invalid_api_key(self, hass: HomeAssistant) -> None:
        """Test weather service configuration with invalid API key."""
        # Start flow and get to weather service step
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        # Configure weather service with invalid API key
        with patch(
            "custom_components.smart_irrigation.helpers.test_api_key",
            side_effect=InvalidAuth,
        ):
            user_input_2 = {
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
                const.CONF_WEATHER_SERVICE_API_KEY: "invalid_key",
            }

            result3 = await hass.config_entries.flow.async_configure(
                result2["flow_id"], user_input_2
            )

            assert result3["type"] is FlowResultType.FORM
            assert result3["errors"]["base"] == "auth"

    async def test_weather_service_connection_error(self, hass: HomeAssistant) -> None:
        """Test weather service configuration with connection error."""
        # Start flow and get to weather service step
        result = await hass.config_entries.flow.async_init(
            const.DOMAIN, context={"source": config_entries.SOURCE_USER}
        )

        user_input_1 = {
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: True,
        }

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"], user_input_1
        )

        # Configure weather service with connection error
        with patch(
            "custom_components.smart_irrigation.helpers.test_api_key",
            side_effect=CannotConnect,
        ):
            user_input_2 = {
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
                const.CONF_WEATHER_SERVICE_API_KEY: "test_key",
            }

            result3 = await hass.config_entries.flow.async_configure(
                result2["flow_id"], user_input_2
            )

            assert result3["type"] is FlowResultType.FORM
            assert result3["errors"]["base"] == "auth"

    async def test_options_flow(self, hass: HomeAssistant) -> None:
        """Test options flow."""
        config_entry = MockConfigEntry(
            domain=const.DOMAIN,
            title=const.NAME,
            data={
                const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
                const.CONF_USE_WEATHER_SERVICE: False,
            },
            entry_id="test_entry",
        )
        config_entry.add_to_hass(hass)

        result = await hass.config_entries.options.async_init(config_entry.entry_id)

        assert result["type"] is FlowResultType.FORM
        assert result["step_id"] == "init"
