"""A start trigger can be a clock time rather than a solar event (#807).

Sunrise and sunset move through the season, which is the point of them, but
some people want irrigation finished by a fixed hour: before the household is
up, or before a shared supply gets busy. With "account for duration" on, the run
is worked back from that time so it finishes then; with it off, it starts then.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._track_irrigation_triggers_unsub = []
    return coordinator


async def _register(at, total_duration, account_for_duration):
    coordinator = _coordinator()
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_time_change"
    ) as tracker:
        await coordinator._register_time_trigger(
            at, "Finish by six thirty", total_duration, account_for_duration, {}
        )
    return tracker


@pytest.mark.asyncio
async def test_starting_at_the_time():
    """Duration not accounted for: the run starts at the time given."""
    tracker = await _register("06:30", 3600, False)

    assert tracker.call_args.kwargs["hour"] == 6
    assert tracker.call_args.kwargs["minute"] == 30


@pytest.mark.asyncio
async def test_finishing_at_the_time():
    """Duration accounted for: an hour-long run starts at 05:30 to finish at 06:30."""
    tracker = await _register("06:30", 3600, True)

    assert tracker.call_args.kwargs["hour"] == 5
    assert tracker.call_args.kwargs["minute"] == 30


@pytest.mark.asyncio
async def test_working_back_across_midnight():
    """Finishing at 00:30 after a two-hour run means starting the evening before."""
    tracker = await _register("00:30", 7200, True)

    assert tracker.call_args.kwargs["hour"] == 22
    assert tracker.call_args.kwargs["minute"] == 30


@pytest.mark.asyncio
async def test_an_invalid_time_registers_nothing():
    """Rather than raising out of the trigger registration."""
    coordinator = _coordinator()

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_time_change"
    ) as tracker:
        await coordinator._register_time_trigger("not a time", "Bad", 0, True, {})

    tracker.assert_not_called()
    assert coordinator._track_irrigation_triggers_unsub == []


@pytest.mark.asyncio
async def test_the_tracker_is_kept_so_it_can_be_released():
    """A trigger that is not unsubscribed survives a reload and doubles up."""
    coordinator = _coordinator()

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_time_change",
        return_value="unsub",
    ):
        await coordinator._register_time_trigger("06:00", "Six", 0, False, {})

    assert coordinator._track_irrigation_triggers_unsub == ["unsub"]


@pytest.mark.asyncio
async def test_the_type_is_dispatched_from_the_trigger_list():
    coordinator = _coordinator()
    coordinator._register_time_trigger = AsyncMock()

    await coordinator._register_trigger(
        {
            const.TRIGGER_CONF_NAME: "Six thirty",
            const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_TIME,
            const.TRIGGER_CONF_AT: "06:30",
            const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,
        },
        3600,
    )

    coordinator._register_time_trigger.assert_awaited_once()
    assert coordinator._register_time_trigger.await_args.args[0] == "06:30"
