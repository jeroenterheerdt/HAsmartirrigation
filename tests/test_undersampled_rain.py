"""A coarse update interval must not multiply the rain it did see.

The weather services report the rain of the last hour only, so one sample
accounts for one hour however far apart the samples are. Averaging them over the
whole calculation interval extrapolates the hours that were never looked at: at
a six-hourly update, 6 mm falling in a sampled hour came out as 36 mm, and the
same 6 mm falling in an unsampled hour came out as 0.

Under-counting what was not observed is unavoidable and honest. Multiplying what
was observed is not.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()
        self.store.get_mapping = MagicMock(
            return_value={
                const.MAPPING_ID: 0,
                const.MAPPING_MAPPINGS: {const.MAPPING_CURRENT_PRECIPITATION: {}},
            }
        )


ZONE = {const.ZONE_ID: 0, const.ZONE_MAPPING: 0}


async def _rain_seen(interval_hours, rainy_sample_index):
    """A day where 6 mm falls in one hour, sampled every `interval_hours`."""
    coordinator = _Coordinator()
    count = 24 // interval_hours
    samples = [6.0 if i == rainy_sample_index else 0.0 for i in range(count)]
    resultdata = {const.MAPPING_DATA_MULTIPLIER: 1.0}
    await coordinator._aggregate_sensor_data(
        {const.MAPPING_CURRENT_PRECIPITATION: samples},
        {
            const.MAPPING_ID: 0,
            const.MAPPING_MAPPINGS: {const.MAPPING_CURRENT_PRECIPITATION: {}},
            const.MAPPING_DATA_LAST_CALCULATION: {},
        },
        resultdata,
        persist=False,
    )
    return coordinator._precipitation_for_interval(ZONE, resultdata)


@pytest.mark.asyncio
@pytest.mark.parametrize("interval_hours", [1, 2, 3, 6, 12])
async def test_observed_rain_is_never_multiplied(interval_hours):
    """Whatever the interval, 6 mm observed is 6 mm, not 6 times the gap."""
    assert await _rain_seen(interval_hours, rainy_sample_index=0) == pytest.approx(6.0)


@pytest.mark.asyncio
async def test_hourly_sampling_is_exact():
    """24 contiguous hourly samples cover the whole day."""
    assert await _rain_seen(1, rainy_sample_index=7) == pytest.approx(6.0)


@pytest.mark.asyncio
async def test_rain_in_an_hour_that_was_never_sampled_is_lost():
    """Unavoidable and by design: nothing looked at that hour."""
    assert await _rain_seen(6, rainy_sample_index=None) == pytest.approx(0.0)


@pytest.mark.asyncio
async def test_more_samples_than_hours_does_not_inflate_the_interval():
    """Quarter-hourly sampling still covers one day, not four."""
    coordinator = _Coordinator()
    resultdata = {const.MAPPING_DATA_MULTIPLIER: 1.0}
    await coordinator._aggregate_sensor_data(
        {const.MAPPING_CURRENT_PRECIPITATION: [1.0] * 96},
        {
            const.MAPPING_ID: 0,
            const.MAPPING_MAPPINGS: {const.MAPPING_CURRENT_PRECIPITATION: {}},
            const.MAPPING_DATA_LAST_CALCULATION: {},
        },
        resultdata,
        persist=False,
    )

    # A steady 1 mm/h over a day is 24 mm, not 96.
    assert coordinator._precipitation_for_interval(ZONE, resultdata) == pytest.approx(
        24.0
    )
