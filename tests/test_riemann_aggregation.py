"""Tests for the Riemann sum aggregation in CalculationMixin (#784).

Values reaching _aggregate_sensor_data are already converted to per-day rates
(e.g. Solar Radiation W/m2 -> MJ/day/m2), so the trapezoidal integration must
use dt expressed in days. Using seconds inflated the result by ~86400x the
day-fraction (e.g. ~900x for a 15-minute sample interval).
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()


def _mapping_with_riemann(key):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_AGGREGATE: const.MAPPING_CONF_AGGREGATE_RIEMANNSUM}
        },
    }


async def test_riemann_sum_constant_rate_over_one_day():
    """A constant 20 MJ/day/m2 rate integrated over 24h must yield ~20, not ~20*86400."""
    coordinator = _Coordinator()
    start = datetime(2026, 7, 25, 0, 0, 0)
    samples = 5  # every 6 hours across one day
    data_by_sensor = {
        const.MAPPING_SOLRAD: [20.0] * samples,
        const.RETRIEVED_AT: [start + timedelta(hours=6 * i) for i in range(samples)],
    }
    resultdata = {}
    await coordinator._aggregate_sensor_data(
        data_by_sensor, _mapping_with_riemann(const.MAPPING_SOLRAD), resultdata
    )
    assert resultdata[const.MAPPING_SOLRAD] == pytest.approx(20.0)


async def test_riemann_sum_15_minute_interval():
    """15-minute samples must integrate with dt in days (#784 reported ~900x blow-up)."""
    coordinator = _Coordinator()
    start = datetime(2026, 7, 25, 12, 0, 0)
    data_by_sensor = {
        const.MAPPING_SOLRAD: [10.0, 20.0, 30.0],
        const.RETRIEVED_AT: [start + timedelta(minutes=15 * i) for i in range(3)],
    }
    resultdata = {}
    await coordinator._aggregate_sensor_data(
        data_by_sensor, _mapping_with_riemann(const.MAPPING_SOLRAD), resultdata
    )
    # trapezoids: ((10+20)/2 + (20+30)/2) * (900 / 86400) = 40 * 0.0104166...
    assert resultdata[const.MAPPING_SOLRAD] == pytest.approx(40.0 * 900.0 / 86400.0)
