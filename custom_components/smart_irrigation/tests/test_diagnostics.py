"""Test the Smart Irrigation diagnostics."""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation.const import (
    CONF_WEATHER_SERVICE_API_KEY,
    DOMAIN,
)
from custom_components.smart_irrigation.diagnostics import (
    async_get_config_entry_diagnostics,
)
from custom_components.smart_irrigation.store import SmartIrrigationStorage


class TestSmartIrrigationDiagnostics:
    """Test Smart Irrigation diagnostics."""

    @pytest.fixture
    def mock_hass(self):
        """Return a mock Home Assistant instance."""
        hass = Mock()
        hass.data = {DOMAIN: {}}
        return hass

    @pytest.fixture
    def mock_config_entry(self):
        """Return a mock config entry."""
        return Mock()

    @pytest.fixture
    def mock_store(self):
        """Return a mock store.

        Spec'd against the real storage class so diagnostics can only call
        methods that actually exist (#782: get_mappings/get_modules/get_zones
        do not exist, only the async plural getters do).
        """
        store = Mock(spec=SmartIrrigationStorage)
        store.async_get_config = AsyncMock(return_value={"test_config": "value"})
        store.async_get_mappings = AsyncMock(return_value=[{"test_mapping": "value"}])
        store.async_get_modules = AsyncMock(return_value=[{"test_module": "value"}])
        store.async_get_zones = AsyncMock(return_value=[{"test_zone": "value"}])
        return store

    @pytest.fixture
    def mock_calc_logger(self):
        """Return a mock calculation audit logger with one record."""
        calc_logger = Mock()
        calc_logger.async_read_recent = AsyncMock(
            return_value=[
                {
                    "zone": {"name": "Lawn"},
                    "module": {"latitude": 52.379189},
                    "inputs": {"fields": {"Temperature": {"entity": "sensor.temp"}}},
                }
            ]
        )
        return calc_logger

    @pytest.fixture
    def mock_coordinator(self, mock_store, mock_calc_logger):
        """Return a mock coordinator."""
        coordinator = Mock()
        coordinator.store = mock_store
        coordinator.calc_logger = mock_calc_logger
        return coordinator

    async def test_async_get_config_entry_diagnostics_with_coordinator(
        self, mock_hass, mock_config_entry, mock_coordinator
    ):
        """Test diagnostics with coordinator available."""
        mock_hass.data[DOMAIN] = {
            "coordinator": mock_coordinator,
            "zones": {"zone1": "data"},
            "test_data": "value",
        }

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert "store" in result
        assert result["store"]["config"] == {"test_config": "value"}
        assert result["store"]["mappings"] == [{"test_mapping": "value"}]
        assert result["store"]["modules"] == [{"test_module": "value"}]
        assert result["store"]["zones"] == [{"test_zone": "value"}]
        assert result["test_data"] == "value"
        assert "coordinator" not in result
        assert "zones" not in result

    async def test_async_get_config_entry_diagnostics_with_api_key_redaction(
        self, mock_hass, mock_config_entry, mock_coordinator
    ):
        """Test diagnostics with API key redaction."""
        mock_hass.data[DOMAIN] = {
            "coordinator": mock_coordinator,
            CONF_WEATHER_SERVICE_API_KEY: "secret_api_key",
            "other_data": "value",
        }

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert result[CONF_WEATHER_SERVICE_API_KEY] == "[redacted]"
        assert result["other_data"] == "value"

    async def test_async_get_config_entry_diagnostics_no_coordinator(
        self, mock_hass, mock_config_entry, caplog
    ):
        """Test diagnostics without coordinator."""
        mock_hass.data[DOMAIN] = {
            "test_data": "value",
        }

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert result["test_data"] == "value"
        assert "Coordinator is not available" in caplog.text

    async def test_async_get_config_entry_diagnostics_includes_calculation_log(
        self, mock_hass, mock_config_entry, mock_coordinator
    ):
        """The recent calculation-log records are attached, redacted (#12)."""
        mock_hass.data[DOMAIN] = {"coordinator": mock_coordinator}

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert len(result["calculation_log"]) == 1
        record = result["calculation_log"][0]
        assert record["zone"]["name"] == "Lawn"
        # Coordinates rounded and entity ids dropped before sharing.
        assert record["module"]["latitude"] == 52.4
        assert record["inputs"]["fields"]["Temperature"]["entity"] == "[redacted]"

    async def test_async_get_config_entry_diagnostics_no_store(
        self, mock_hass, mock_config_entry, mock_calc_logger, caplog
    ):
        """Test diagnostics with coordinator but no store."""
        mock_coordinator = Mock()
        mock_coordinator.store = None
        mock_coordinator.calc_logger = mock_calc_logger

        mock_hass.data[DOMAIN] = {
            "coordinator": mock_coordinator,
            "test_data": "value",
        }

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert result["test_data"] == "value"
        assert "Store is not available" in caplog.text

    async def test_async_get_config_entry_diagnostics_empty_data(
        self, mock_hass, mock_config_entry
    ):
        """Test diagnostics with empty data."""
        mock_hass.data[DOMAIN] = {}

        result = await async_get_config_entry_diagnostics(mock_hass, mock_config_entry)

        assert result == {}
