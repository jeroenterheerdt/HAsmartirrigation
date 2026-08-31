"""The run length a start trigger works back from depends on the sequencing (#552).

A trigger that has to finish at sunrise subtracts the length of the whole run
from it. Zones watered one after another take the sum of their durations; zones
watered at once are done when the longest one is. Summing in the parallel case
started the run hours before it needed to, in the middle of the night for
anybody with several large zones.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(sequencing, *durations, state=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: i,
                const.ZONE_STATE: state or const.ZONE_STATE_AUTOMATIC,
                const.ZONE_DURATION: duration,
            }
            for i, duration in enumerate(durations)
        ]
    )
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_ZONE_SEQUENCING: sequencing}
    )
    return coordinator


@pytest.mark.asyncio
async def test_sequential_zones_take_the_sum():
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_SEQUENTIAL, 3600, 3600, 1200)

    assert await coordinator.get_total_duration_all_enabled_zones() == 8400


@pytest.mark.asyncio
async def test_parallel_zones_are_done_with_the_longest():
    """Two one-hour zones at once finish in an hour, not two."""
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_PARALLEL, 3600, 3600, 1200)

    assert await coordinator.get_total_duration_all_enabled_zones() == 3600


@pytest.mark.asyncio
async def test_the_default_is_still_the_sum():
    """Sequencing is sequential unless it was changed, so nothing moves for anyone."""
    coordinator = _coordinator(None, 3600, 1200)
    coordinator.store.async_get_config = AsyncMock(return_value={})

    assert await coordinator.get_total_duration_all_enabled_zones() == 4800


@pytest.mark.asyncio
async def test_disabled_zones_do_not_count():
    coordinator = _coordinator(
        const.CONF_ZONE_SEQUENCING_PARALLEL, 3600, state=const.ZONE_STATE_DISABLED
    )

    assert await coordinator.get_total_duration_all_enabled_zones() == 0


@pytest.mark.asyncio
async def test_no_zones_at_all():
    coordinator = _coordinator(const.CONF_ZONE_SEQUENCING_PARALLEL)

    assert await coordinator.get_total_duration_all_enabled_zones() == 0
