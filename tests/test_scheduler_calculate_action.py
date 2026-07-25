"""A recurring schedule with action "calculate" must actually calculate.

`_perform_schedule_action` used to call `_async_calculate_all()` and
`async_calculate_zone(zone_id)` without the arguments those helpers require, so
every scheduled calculation died with a TypeError. The coordinator here is
autospecced from the real class, so a call with a wrong signature fails the test
the same way it failed at runtime.
"""

from unittest.mock import AsyncMock, MagicMock, create_autospec

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.scheduler import RecurringScheduleManager


def _zone(zone_id, mapping_id=1, module_id=1):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_MAPPING: mapping_id,
        const.ZONE_MODULE: module_id,
    }


def _pyeto_module(forecast_days=0):
    modinst = MagicMock()
    modinst.name = "PyETO"
    modinst.forecast_days = forecast_days
    return modinst


def _make_manager(zones=None, mappings=None, modinst=None, use_weather_service=False):
    """Build a schedule manager on top of an autospecced coordinator."""
    zones = zones or {}
    mappings = mappings if mappings is not None else {1: {const.MAPPING_DATA: [{}]}}

    hass = MagicMock()
    hass.async_add_executor_job = AsyncMock(return_value="forecast-data")

    coordinator = create_autospec(SmartIrrigationCoordinator, instance=True)
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(side_effect=zones.get)
    coordinator.store.get_mapping = MagicMock(side_effect=mappings.get)
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator.use_weather_service = use_weather_service
    coordinator._WeatherServiceClient = MagicMock()
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(
        return_value={"temperature": 20}
    )
    coordinator.getModuleInstanceByID = AsyncMock(return_value=modinst)

    return RecurringScheduleManager(hass, coordinator), coordinator


async def test_calculate_all_passes_delete_weather_data():
    """`all` zones goes through _async_calculate_all with its required argument."""
    manager, coordinator = _make_manager()

    await manager._perform_schedule_action("calculate", "all", "Nightly")

    coordinator._async_calculate_all.assert_awaited_once_with(delete_weather_data=True)


async def test_calculate_zone_gathers_weather_data():
    """A per-zone calculation aggregates the mapping data before calculating."""
    mapping = {const.MAPPING_DATA: [{"temperature": 20}]}
    manager, coordinator = _make_manager(zones={1: _zone(1)}, mappings={1: mapping})

    await manager._perform_schedule_action("calculate", [1], "Nightly")

    coordinator.apply_aggregates_to_mapping_data.assert_awaited_once_with(mapping)
    coordinator.async_calculate_zone.assert_awaited_once_with(
        1, {"temperature": 20}, None
    )


async def test_calculate_zone_without_sensor_data_is_skipped():
    """No sensor data: the zone is skipped instead of calculated with None."""
    manager, coordinator = _make_manager(
        zones={1: _zone(1)}, mappings={1: {const.MAPPING_DATA: []}}
    )

    await manager._perform_schedule_action("calculate", [1], "Nightly")

    coordinator.apply_aggregates_to_mapping_data.assert_not_awaited()
    coordinator.async_calculate_zone.assert_not_awaited()
    coordinator.store.async_update_mapping.assert_not_awaited()


async def test_unknown_zone_is_skipped():
    """A schedule pointing at a deleted zone does not blow up the whole action."""
    manager, coordinator = _make_manager(zones={})

    await manager._perform_schedule_action("calculate", [42], "Nightly")

    coordinator.async_calculate_zone.assert_not_awaited()


async def test_calculate_zone_fetches_forecast_for_pyeto():
    """PyETO with forecasting enabled gets forecast data passed in."""
    manager, coordinator = _make_manager(
        zones={1: _zone(1)},
        modinst=_pyeto_module(forecast_days=2),
        use_weather_service=True,
    )

    await manager._perform_schedule_action("calculate", [1], "Nightly")

    coordinator.async_calculate_zone.assert_awaited_once_with(
        1, {"temperature": 20}, "forecast-data"
    )


async def test_pyeto_forecast_without_weather_service_is_skipped():
    """Forecasting configured without a weather service: skip, do not calculate."""
    manager, coordinator = _make_manager(
        zones={1: _zone(1)},
        modinst=_pyeto_module(forecast_days=2),
        use_weather_service=False,
    )

    await manager._perform_schedule_action("calculate", [1], "Nightly")

    coordinator.async_calculate_zone.assert_not_awaited()


async def test_shared_mapping_is_cleared_once_after_all_zones():
    """Zones sharing a mapping all get data; the mapping is cleared once, at the end."""
    manager, coordinator = _make_manager(
        zones={1: _zone(1, mapping_id=7), 2: _zone(2, mapping_id=7)},
        mappings={7: {const.MAPPING_DATA: [{"temperature": 20}]}},
    )

    await manager._perform_schedule_action("calculate", [1, 2], "Nightly")

    assert coordinator.async_calculate_zone.await_count == 2
    coordinator.store.async_update_mapping.assert_awaited_once_with(
        7, {const.MAPPING_DATA: []}
    )


async def test_update_action_still_uses_the_update_helpers():
    """The update action is unaffected by the calculate fix."""
    manager, coordinator = _make_manager(zones={1: _zone(1)})

    await manager._perform_schedule_action("update", "all", "Nightly")
    await manager._perform_schedule_action("update", [1], "Nightly")

    coordinator._async_update_all.assert_awaited_once()
    coordinator._async_update_zone.assert_awaited_once_with(1)
