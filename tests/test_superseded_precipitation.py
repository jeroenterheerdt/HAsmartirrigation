"""Rain an asserted bucket value already covered is not credited again (#811).

``reset_bucket`` is the last step of the documented irrigation automation: it
says the soil is at field capacity now. The rain collected since the last
calculation fell before that, so it is part of what the assertion covers, but
the calculation window spans the moment of the reset and credited it to the
bucket afterwards, on top of the value just asserted.

Worked through with 8 mm of overnight rain, a 12 mm deficit and 4 mm of ET the
next day: the closed loop lands on -4 because the bucket is credited by the
water applied, while a reset landed on +4, over-credited by exactly the rain.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.store = MagicMock()
        # get_mapping returns a dict or None in production; a bare MagicMock
        # would answer truthily to every .get(), including the greenhouse flag.
        self.store.get_mapping = MagicMock(return_value={})


def _zone(superseded=0.0):
    return {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_MAPPING: 0,
        const.ZONE_PRECIPITATION_SUPERSEDED: superseded,
    }


def _weatherdata(depth):
    return {
        const.MAPPING_PRECIPITATION: depth,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
    }


def test_without_a_reset_all_the_rain_counts():
    coordinator = _Coordinator()

    assert coordinator._precipitation_net_of_superseded(
        _zone(), _weatherdata(8.0)
    ) == pytest.approx(8.0)


def test_rain_covered_by_a_reset_is_not_counted_again():
    """The 8 mm that fell before the reset is what the reset was about."""
    coordinator = _Coordinator()

    assert coordinator._precipitation_net_of_superseded(
        _zone(superseded=8.0), _weatherdata(8.0)
    ) == pytest.approx(0.0)


def test_rain_after_the_reset_still_counts():
    """3 mm more fell during the day; only the overnight 8 mm was superseded."""
    coordinator = _Coordinator()

    assert coordinator._precipitation_net_of_superseded(
        _zone(superseded=8.0), _weatherdata(11.0)
    ) == pytest.approx(3.0)


def test_the_result_never_goes_negative():
    coordinator = _Coordinator()

    assert (
        coordinator._precipitation_net_of_superseded(
            _zone(superseded=20.0), _weatherdata(8.0)
        )
        == 0.0
    )


@pytest.mark.asyncio
async def test_resetting_the_bucket_records_the_rain_it_covers():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=_zone())
    coordinator.precipitation_since_last_calculation = AsyncMock(return_value=8.0)

    data = await coordinator._supersede_precipitation_on_bucket_set(
        0, {const.ATTR_NEW_BUCKET_VALUE: 0}
    )

    assert data[const.ZONE_PRECIPITATION_SUPERSEDED] == 8.0


@pytest.mark.asyncio
async def test_crediting_the_bucket_records_nothing():
    """Observed watering credits by the water applied; its balance is already right."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=_zone())
    coordinator.precipitation_since_last_calculation = AsyncMock(return_value=8.0)

    data = await coordinator._supersede_precipitation_on_bucket_set(
        0, {const.ZONE_BUCKET: -8.0}
    )

    assert const.ZONE_PRECIPITATION_SUPERSEDED not in data


@pytest.mark.asyncio
async def test_a_failure_does_not_block_the_reset():
    """Losing the marker costs accuracy; failing leaves an automation half done."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=_zone())
    coordinator.precipitation_since_last_calculation = AsyncMock(
        side_effect=RuntimeError("boom")
    )

    data = await coordinator._supersede_precipitation_on_bucket_set(
        0, {const.ATTR_NEW_BUCKET_VALUE: 0}
    )

    assert data == {const.ATTR_NEW_BUCKET_VALUE: 0}
