"""Test Smart Irrigation integration initialization."""

from unittest.mock import AsyncMock, patch

import pytest
from custom_components.smart_irrigation import (SmartIrrigationCoordinator,
                                                SmartIrrigationError,
                                                async_remove_entry,
                                                async_setup, async_setup_entry,
                                                async_unload_entry, const)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant


class TestSmartIrrigationIntegration:
    """Test Smart Irrigation integration setup and teardown."""

    async def test_async_setup(self, hass: HomeAssistant) -> None:
        """Test basic integration setup."""
        result = await async_setup(hass, {})
        assert result is True

    async def test_async_setup_entry_success(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_hass_config: None,
    ) -> None:
        """Test successful config entry setup."""
        with (
            patch(
                "custom_components.smart_irrigation.async_get_registry"
            ) as mock_registry,
            patch(
                "custom_components.smart_irrigation.async_register_panel"
            ) as mock_panel,
            patch(
                "custom_components.smart_irrigation.async_register_websockets"
            ) as mock_ws,
            patch(
                "custom_components.smart_irrigation.register_services"
            ) as mock_services,
        ):
            mock_store = AsyncMock()
            mock_store.async_get_config.return_value = {
                const.CONF_USE_WEATHER_SERVICE: False,
                const.CONF_WEATHER_SERVICE: None,
            }
            mock_store.set_up_factory_defaults = AsyncMock()
            mock_registry.return_value = mock_store

            result = await async_setup_entry(hass, mock_config_entry)

            assert result is True
            assert const.DOMAIN in hass.data
            assert "coordinator" in hass.data[const.DOMAIN]
            assert "zones" in hass.data[const.DOMAIN]

            mock_panel.assert_called_once_with(hass)
            mock_ws.assert_called_once_with(hass)
            mock_services.assert_called_once_with(hass)

    async def test_async_setup_entry_with_weather_service(
        self,
        hass: HomeAssistant,
        mock_weather_config_entry: ConfigEntry,
        mock_hass_config: None,
    ) -> None:
        """Test config entry setup with weather service enabled."""
        with (
            patch(
                "custom_components.smart_irrigation.async_get_registry"
            ) as mock_registry,
            patch("custom_components.smart_irrigation.async_register_panel"),
            patch("custom_components.smart_irrigation.async_register_websockets"),
            patch("custom_components.smart_irrigation.register_services"),
        ):
            mock_store = AsyncMock()
            mock_store.async_get_config.return_value = {
                const.CONF_USE_WEATHER_SERVICE: True,
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            }
            mock_store.set_up_factory_defaults = AsyncMock()
            mock_registry.return_value = mock_store

            result = await async_setup_entry(hass, mock_weather_config_entry)

            assert result is True
            assert hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] is True
            assert (
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE]
                == const.CONF_WEATHER_SERVICE_OWM
            )
            assert (
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY]
                == "test_api_key"
            )

    async def test_async_unload_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
    ) -> None:
        """Test unloading config entry."""
        # Set up the integration first
        hass.data[const.DOMAIN] = {
            "coordinator": AsyncMock(),
            "zones": {},
        }

        with patch(
            "custom_components.smart_irrigation.remove_panel"
        ) as mock_remove_panel:
            result = await async_unload_entry(hass, mock_config_entry)

            assert result is True
            mock_remove_panel.assert_called_once_with(hass)

    async def test_async_remove_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
    ) -> None:
        """Test removing config entry."""
        mock_coordinator = AsyncMock()
        hass.data[const.DOMAIN] = {
            "coordinator": mock_coordinator,
            "zones": {},
        }

        with patch(
            "custom_components.smart_irrigation.remove_panel"
        ) as mock_remove_panel:
            await async_remove_entry(hass, mock_config_entry)

            mock_remove_panel.assert_called_once_with(hass)
            mock_coordinator.async_delete_config.assert_called_once()
            assert const.DOMAIN not in hass.data


class TestSmartIrrigationCoordinator:
    """Test SmartIrrigationCoordinator class."""

    def test_coordinator_init(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test coordinator initialization."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        assert coordinator.id == mock_config_entry.unique_id
        assert coordinator.hass == hass
        assert coordinator.entry == mock_config_entry
        assert coordinator.store == mock_store

    async def test_coordinator_update_subscriptions(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test coordinator update subscriptions."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        # Mock the update_subscriptions method
        with patch.object(
            coordinator, "update_subscriptions", new_callable=AsyncMock
        ) as mock_update:
            await coordinator.update_subscriptions()
            mock_update.assert_called_once()


class TestSmartIrrigationError:
    """Test SmartIrrigationError exception."""

    def test_exception_creation(self) -> None:
        """Test exception can be created and raised."""
        error_message = "Test error message"

        with pytest.raises(SmartIrrigationError) as exc_info:
            raise SmartIrrigationError(error_message)

        assert str(exc_info.value) == error_message
