"""Editing the start trigger takes effect without a restart (#800).

The panel saves the trigger through ``coordinator.async_update_config``, which
wrote it to the store and stopped there. The already registered sunrise/sunset
tracker kept the old schedule, so the Info tab showed the new start time while
irrigation still began at the old one until Home Assistant was restarted.
"""

from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator():
    """Build a coordinator without running its (very wide) __init__."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_update_config = AsyncMock()
    coordinator.set_up_auto_calc_time = AsyncMock()
    coordinator.set_up_auto_update_time = AsyncMock()
    coordinator.set_up_auto_clear_time = AsyncMock()
    coordinator.async_setup_observed_watering = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    return coordinator


async def _update(coordinator, data):
    with patch("custom_components.smart_irrigation.async_dispatcher_send"):
        await coordinator.async_update_config(data)


async def test_editing_a_trigger_reregisters_it():
    coordinator = _coordinator()

    await _update(
        coordinator,
        {
            const.CONF_IRRIGATION_START_TRIGGERS: [
                {
                    const.TRIGGER_CONF_NAME: "before sunrise",
                    const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
                    const.TRIGGER_CONF_OFFSET_MINUTES: -120,
                }
            ]
        },
    )

    assert coordinator.register_start_event.await_count == 1


async def test_selecting_another_trigger_reregisters_it():
    coordinator = _coordinator()

    await _update(coordinator, {const.CONF_ACTIVE_START_TRIGGER: "after sunset"})

    assert coordinator.register_start_event.await_count == 1


async def test_the_trigger_is_written_before_it_is_reregistered():
    """register_start_event reads the store, so the order matters."""
    coordinator = _coordinator()
    calls = []
    coordinator.store.async_update_config = AsyncMock(
        side_effect=lambda *a, **kw: calls.append("store")
    )
    coordinator.register_start_event = AsyncMock(
        side_effect=lambda *a, **kw: calls.append("register")
    )

    await _update(coordinator, {const.CONF_ACTIVE_START_TRIGGER: "after sunset"})

    assert calls == ["store", "register"]


async def test_unrelated_settings_do_not_reregister():
    """Saving the rest of the general settings must stay a cheap store write."""
    coordinator = _coordinator()

    await _update(coordinator, {const.CONF_DAYS_BETWEEN_IRRIGATION: 3})

    assert coordinator.register_start_event.await_count == 0
