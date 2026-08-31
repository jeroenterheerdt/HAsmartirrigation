"""The precipitation rate has to reach the water balance (#571).

``Current Precipitation`` was collected, unit-converted and shown in the panel,
but ``calculate_module`` only ever read ``Precipitation``, so a sensor group that
maps a rain-rate sensor and nothing else watered straight through the rain.

The two fields are different physical quantities: ``Precipitation`` is a depth in
mm accumulated over the interval, ``Current Precipitation`` is a rate in mm/h
that has to be integrated over the interval to become a depth. Exactly one of
them may feed the bucket.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self, mapping=None):
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()
        self.store.get_mapping = MagicMock(return_value=mapping)


ZONE = {const.ZONE_ID: 0, const.ZONE_MAPPING: 1}


def _mapping(aggregate=None):
    conf = {}
    if aggregate is not None:
        conf[const.MAPPING_CONF_AGGREGATE] = aggregate
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {const.MAPPING_CURRENT_PRECIPITATION: conf},
    }


def test_a_precipitation_depth_wins_over_the_rate():
    """Every weather service supplies both; counting both would double the rain."""
    coordinator = _Coordinator(_mapping())
    weatherdata = {
        const.MAPPING_PRECIPITATION: 2.7,
        const.MAPPING_CURRENT_PRECIPITATION: 4.0,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 2.7


def test_a_depth_of_zero_still_wins():
    """A measured zero is an answer, not a missing value."""
    coordinator = _Coordinator(_mapping())
    weatherdata = {
        const.MAPPING_PRECIPITATION: 0,
        const.MAPPING_CURRENT_PRECIPITATION: 4.0,
        const.MAPPING_DATA_MULTIPLIER: 1.0,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 0


def test_the_rate_is_integrated_over_the_interval():
    """4 mm/h for the 6 hours since the last calculation is 24 mm."""
    coordinator = _Coordinator(_mapping())
    weatherdata = {
        const.MAPPING_CURRENT_PRECIPITATION: 4.0,
        const.MAPPING_DATA_MULTIPLIER: 6 / 24,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == pytest.approx(
        24.0
    )


def test_a_riemann_aggregated_rate_is_already_a_depth():
    """The Riemann sum integrated it over the samples; do not integrate twice."""
    coordinator = _Coordinator(_mapping(const.MAPPING_CONF_AGGREGATE_RIEMANNSUM))
    weatherdata = {
        const.MAPPING_CURRENT_PRECIPITATION: 3.5,
        const.MAPPING_DATA_MULTIPLIER: 6 / 24,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 3.5


def test_no_precipitation_at_all_is_zero():
    coordinator = _Coordinator(_mapping())

    assert coordinator._precipitation_for_interval(ZONE, {}) == 0


@pytest.mark.asyncio
async def test_riemann_integrates_a_rate_in_hours_not_days():
    """The rate is in mm/h, so dt must be hours.

    Solar radiation is normalised to a per-day rate upstream and integrates in
    days (#784). Applying the same dt to mm/h overstated the rain 24-fold.
    """
    coordinator = _Coordinator()
    start = datetime(2026, 8, 30, 0, 0, 0)
    # A steady 2 mm/h through 6 hourly samples is 5 hours of covered interval.
    data_by_sensor = {
        const.MAPPING_CURRENT_PRECIPITATION: [2.0] * 6,
        const.RETRIEVED_AT: [start + timedelta(hours=i) for i in range(6)],
    }
    resultdata = {}

    await coordinator._aggregate_sensor_data(
        data_by_sensor,
        _mapping(const.MAPPING_CONF_AGGREGATE_RIEMANNSUM),
        resultdata,
    )

    assert resultdata[const.MAPPING_CURRENT_PRECIPITATION] == pytest.approx(10.0)


@pytest.mark.asyncio
async def test_riemann_with_a_single_sample_uses_the_calculation_interval():
    """One sample carries no interval of its own, so use the calculation's."""
    coordinator = _Coordinator()
    resultdata = {const.MAPPING_DATA_MULTIPLIER: 3 / 24}

    await coordinator._aggregate_sensor_data(
        {const.MAPPING_CURRENT_PRECIPITATION: [2.0]},
        _mapping(const.MAPPING_CONF_AGGREGATE_RIEMANNSUM),
        resultdata,
    )

    assert resultdata[const.MAPPING_CURRENT_PRECIPITATION] == pytest.approx(6.0)
