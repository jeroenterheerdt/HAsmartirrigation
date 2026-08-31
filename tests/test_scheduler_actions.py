"""Recurring schedule actions call the coordinator with usable arguments.

Both "calculate" actions raised a TypeError instead of calculating:
``_async_calculate_all`` required ``delete_weather_data`` and the scheduler
passed nothing, and ``async_calculate_zone`` requires the aggregated weather
data for the zone, which the scheduler did not have. Reported in #793 by
frankyhun.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.scheduler import RecurringScheduleManager


def _manager():
    manager = RecurringScheduleManager.__new__(RecurringScheduleManager)
    manager.hass = MagicMock()
    manager.coordinator = MagicMock()
    manager.coordinator._async_calculate_all = AsyncMock()
    manager.coordinator.async_update_zone_config = AsyncMock()
    manager.coordinator._async_update_all = AsyncMock()
    manager.coordinator._async_update_zone = AsyncMock()
    return manager


@pytest.mark.asyncio
async def test_calculate_all_zones_action():
    manager = _manager()

    await manager._perform_schedule_action("calculate", "all", "nightly")

    manager.coordinator._async_calculate_all.assert_awaited_once_with()


@pytest.mark.asyncio
async def test_calculate_single_zone_action_goes_through_the_service_path():
    """The per-zone path has to gather the weather data first."""
    manager = _manager()

    await manager._perform_schedule_action("calculate", ["0", "1"], "nightly")

    assert manager.coordinator.async_update_zone_config.await_count == 2
    _args, kwargs = manager.coordinator.async_update_zone_config.await_args
    assert kwargs["zone_id"] == "1"
    assert kwargs["data"][const.ATTR_CALCULATE] == const.ATTR_CALCULATE
    assert kwargs["data"][const.ATTR_DELETE_WEATHER_DATA] is True


@pytest.mark.asyncio
async def test_update_actions_still_work():
    manager = _manager()

    await manager._perform_schedule_action("update", "all", "nightly")
    await manager._perform_schedule_action("update", ["0"], "nightly")

    manager.coordinator._async_update_all.assert_awaited_once()
    manager.coordinator._async_update_zone.assert_awaited_once_with("0")
