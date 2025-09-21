"""Test enhanced scheduling functionality for Smart Irrigation."""

import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.irrigation_unlimited import (
    IrrigationUnlimitedIntegration,
)
from custom_components.smart_irrigation.scheduler import (
    RecurringScheduleManager,
    SeasonalAdjustmentManager,
)


class MockHomeAssistant:
    """Mock Home Assistant object for testing."""

    def __init__(self):
        self.bus = Mock()
        self.async_create_task = Mock()
        self.states = Mock()
        self.services = Mock()
        self.data = {const.DOMAIN: {}}

    def fire_event(self, event_type, data):
        """Mock event firing."""
        pass


class MockCoordinator:
    """Mock coordinator for testing."""

    def __init__(self):
        self.store = Mock()
        self.store.async_get_config = AsyncMock(return_value={})
        self.store.async_update_config = AsyncMock()
        self._async_calculate_all = AsyncMock()
        self._async_update_all = AsyncMock()
        self.async_calculate_zone = AsyncMock()


@pytest.fixture
def mock_hass():
    """Return a mock Home Assistant instance."""
    return MockHomeAssistant()


@pytest.fixture
def mock_coordinator():
    """Return a mock coordinator instance."""
    return MockCoordinator()


@pytest.fixture
def recurring_schedule_manager(mock_hass, mock_coordinator):
    """Return a RecurringScheduleManager instance."""
    return RecurringScheduleManager(mock_hass, mock_coordinator)


@pytest.fixture
def seasonal_adjustment_manager(mock_hass, mock_coordinator):
    """Return a SeasonalAdjustmentManager instance."""
    return SeasonalAdjustmentManager(mock_hass, mock_coordinator)


@pytest.fixture
def iu_integration(mock_hass, mock_coordinator):
    """Return an IrrigationUnlimitedIntegration instance."""
    return IrrigationUnlimitedIntegration(mock_hass, mock_coordinator)


class TestRecurringScheduleManager:
    """Test recurring schedule management functionality."""

    async def test_create_daily_schedule(self, recurring_schedule_manager):
        """Test creating a daily recurring schedule."""
        schedule_data = {
            const.SCHEDULE_CONF_NAME: "Daily Test",
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
            const.SCHEDULE_CONF_TIME: "06:00",
            const.SCHEDULE_CONF_ACTION: "calculate",
            const.SCHEDULE_CONF_ZONES: "all",
            const.SCHEDULE_CONF_ENABLED: True,
        }

        await recurring_schedule_manager.async_create_schedule(schedule_data)

        # Verify schedule was added
        schedules = recurring_schedule_manager.get_schedules()
        assert len(schedules) == 1
        assert schedules[0][const.SCHEDULE_CONF_NAME] == "Daily Test"
        assert schedules[0][const.SCHEDULE_CONF_TYPE] == const.SCHEDULE_TYPE_DAILY

    async def test_create_weekly_schedule(self, recurring_schedule_manager):
        """Test creating a weekly recurring schedule."""
        schedule_data = {
            const.SCHEDULE_CONF_NAME: "Weekly Test",
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_WEEKLY,
            const.SCHEDULE_CONF_TIME: "07:00",
            const.SCHEDULE_CONF_DAYS_OF_WEEK: ["monday", "wednesday", "friday"],
            const.SCHEDULE_CONF_ACTION: "irrigate",
            const.SCHEDULE_CONF_ZONES: [1, 2],
            const.SCHEDULE_CONF_ENABLED: True,
        }

        await recurring_schedule_manager.async_create_schedule(schedule_data)

        schedules = recurring_schedule_manager.get_schedules()
        assert len(schedules) == 1
        assert schedules[0][const.SCHEDULE_CONF_DAYS_OF_WEEK] == [
            "monday",
            "wednesday",
            "friday",
        ]

    async def test_update_schedule(self, recurring_schedule_manager):
        """Test updating an existing schedule."""
        # Create initial schedule
        schedule_data = {
            const.SCHEDULE_CONF_NAME: "Test Schedule",
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
            const.SCHEDULE_CONF_TIME: "06:00",
            const.SCHEDULE_CONF_ENABLED: True,
        }

        await recurring_schedule_manager.async_create_schedule(schedule_data)
        schedules = recurring_schedule_manager.get_schedules()
        schedule_id = schedules[0][const.SCHEDULE_CONF_ID]

        # Update the schedule
        update_data = {
            const.SCHEDULE_CONF_NAME: "Updated Schedule",
            const.SCHEDULE_CONF_TIME: "07:30",
            const.SCHEDULE_CONF_ENABLED: False,
        }

        await recurring_schedule_manager.async_update_schedule(schedule_id, update_data)

        # Verify updates
        schedules = recurring_schedule_manager.get_schedules()
        assert schedules[0][const.SCHEDULE_CONF_NAME] == "Updated Schedule"
        assert schedules[0][const.SCHEDULE_CONF_TIME] == "07:30"
        assert schedules[0][const.SCHEDULE_CONF_ENABLED] is False

    async def test_delete_schedule(self, recurring_schedule_manager):
        """Test deleting a schedule."""
        # Create schedule
        schedule_data = {
            const.SCHEDULE_CONF_NAME: "To Delete",
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
            const.SCHEDULE_CONF_TIME: "06:00",
        }

        await recurring_schedule_manager.async_create_schedule(schedule_data)
        schedules = recurring_schedule_manager.get_schedules()
        assert len(schedules) == 1

        schedule_id = schedules[0][const.SCHEDULE_CONF_ID]

        # Delete schedule
        await recurring_schedule_manager.async_delete_schedule(schedule_id)

        # Verify deletion
        schedules = recurring_schedule_manager.get_schedules()
        assert len(schedules) == 0

    def test_validate_schedule_data(self, recurring_schedule_manager):
        """Test schedule data validation."""
        # Valid data should not raise exception
        valid_data = {
            const.SCHEDULE_CONF_NAME: "Valid Schedule",
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
            const.SCHEDULE_CONF_TIME: "06:00",
        }

        recurring_schedule_manager._validate_schedule_data(valid_data)

        # Missing required field should raise exception
        invalid_data = {
            const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
        }

        with pytest.raises(ValueError, match="Missing required field"):
            recurring_schedule_manager._validate_schedule_data(invalid_data)

        # Invalid schedule type should raise exception
        invalid_type_data = {
            const.SCHEDULE_CONF_NAME: "Invalid Type",
            const.SCHEDULE_CONF_TYPE: "invalid_type",
        }

        with pytest.raises(ValueError, match="Invalid schedule type"):
            recurring_schedule_manager._validate_schedule_data(invalid_type_data)


class TestSeasonalAdjustmentManager:
    """Test seasonal adjustment functionality."""

    async def test_create_seasonal_adjustment(self, seasonal_adjustment_manager):
        """Test creating a seasonal adjustment."""
        adjustment_data = {
            const.SEASONAL_CONF_NAME: "Summer Boost",
            const.SEASONAL_CONF_MONTH_START: 6,
            const.SEASONAL_CONF_MONTH_END: 8,
            const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 1.5,
            const.SEASONAL_CONF_THRESHOLD_ADJUSTMENT: -3.0,
            const.SEASONAL_CONF_ZONES: "all",
            const.SEASONAL_CONF_ENABLED: True,
        }

        await seasonal_adjustment_manager.async_create_adjustment(adjustment_data)

        adjustments = seasonal_adjustment_manager.get_adjustments()
        assert len(adjustments) == 1
        assert adjustments[0][const.SEASONAL_CONF_NAME] == "Summer Boost"
        assert adjustments[0][const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT] == 1.5

    async def test_apply_seasonal_adjustments(self, seasonal_adjustment_manager):
        """Test applying seasonal adjustments to zone data."""
        # Create a summer adjustment
        adjustment_data = {
            const.SEASONAL_CONF_NAME: "Summer Test",
            const.SEASONAL_CONF_MONTH_START: 6,
            const.SEASONAL_CONF_MONTH_END: 8,
            const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 1.5,
            const.SEASONAL_CONF_ZONES: "all",
            const.SEASONAL_CONF_ENABLED: True,
        }

        await seasonal_adjustment_manager.async_create_adjustment(adjustment_data)

        # Mock current month as July (summer)
        with patch("datetime.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2024, 7, 15)

            zone_data = {
                const.ZONE_MULTIPLIER: 1.0,
                const.ZONE_BUCKET: 0.0,
            }

            result = await seasonal_adjustment_manager.apply_seasonal_adjustments(
                zone_data, zone_id=1
            )

            # Verify multiplier was adjusted
            assert result[const.ZONE_MULTIPLIER] == 1.5

    async def test_seasonal_adjustment_month_range(self, seasonal_adjustment_manager):
        """Test seasonal adjustments with cross-year month ranges."""
        # Create winter adjustment (Dec-Feb)
        adjustment_data = {
            const.SEASONAL_CONF_NAME: "Winter Test",
            const.SEASONAL_CONF_MONTH_START: 12,
            const.SEASONAL_CONF_MONTH_END: 2,
            const.SEASONAL_CONF_MULTIPLIER_ADJUSTMENT: 0.5,
            const.SEASONAL_CONF_ZONES: "all",
            const.SEASONAL_CONF_ENABLED: True,
        }

        await seasonal_adjustment_manager.async_create_adjustment(adjustment_data)

        # Test January (within winter range)
        with patch("datetime.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2024, 1, 15)

            zone_data = {const.ZONE_MULTIPLIER: 1.0}

            result = await seasonal_adjustment_manager.apply_seasonal_adjustments(
                zone_data, zone_id=1
            )

            assert result[const.ZONE_MULTIPLIER] == 0.5


class TestIrrigationUnlimitedIntegration:
    """Test Irrigation Unlimited integration functionality."""

    async def test_initialization(self, iu_integration):
        """Test integration initialization."""
        await iu_integration.async_initialize()

        # Should be disabled by default
        assert not iu_integration.is_enabled()

    async def test_zone_matching(self, iu_integration):
        """Test zone matching with IU entities."""
        # Mock IU entities
        iu_integration._iu_entities = {
            "switch.irrigation_unlimited_c1_z1": {
                "entity_id": "switch.irrigation_unlimited_c1_z1",
                "friendly_name": "Zone 1 Lawn",
            },
            "switch.irrigation_unlimited_c1_z2": {
                "entity_id": "switch.irrigation_unlimited_c1_z2",
                "friendly_name": "Zone 2 Garden",
            },
        }

        # Test zone matching
        zone1 = {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn"}
        zone2 = {const.ZONE_ID: 2, const.ZONE_NAME: "Garden"}

        match1 = await iu_integration._find_matching_iu_entity(zone1)
        match2 = await iu_integration._find_matching_iu_entity(zone2)

        assert match1 is not None
        assert match1["entity_id"] == "switch.irrigation_unlimited_c1_z1"
        assert match2 is not None
        assert match2["entity_id"] == "switch.irrigation_unlimited_c1_z2"

    async def test_get_iu_status(self, iu_integration):
        """Test getting IU status."""
        # Enable integration
        iu_integration._sync_enabled = True
        iu_integration._iu_entities = {
            "switch.irrigation_unlimited_c1_z1": {
                "entity_id": "switch.irrigation_unlimited_c1_z1",
                "friendly_name": "Zone 1",
            }
        }

        status = await iu_integration.async_get_iu_status()

        assert status["enabled"] is True
        assert status["total_entities"] == 1
        assert len(status["entities"]) == 1


def test_schedule_id_generation():
    """Test unique schedule ID generation."""
    manager = RecurringScheduleManager(None, None)

    id1 = manager._generate_schedule_id()
    id2 = manager._generate_schedule_id()

    assert id1 != id2
    assert id1.startswith("schedule_")
    assert id2.startswith("schedule_")


def test_adjustment_id_generation():
    """Test unique adjustment ID generation."""
    manager = SeasonalAdjustmentManager(None, None)

    id1 = manager._generate_adjustment_id()
    id2 = manager._generate_adjustment_id()

    assert id1 != id2
    assert id1.startswith("adjustment_")
    assert id2.startswith("adjustment_")


if __name__ == "__main__":
    pytest.main([__file__])
