"""Tests for the dry-run mode of the calculate services.

A dry run must leave every piece of persisted state alone. The critical one is
``MAPPING_DATA_LAST_CALCULATION``: advancing it shrinks the next real
calculation's ``hour_multiplier`` and re-baselines the ``delta`` aggregates,
which double-counts precipitation.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch

from custom_components.smart_irrigation import calculation, const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.service_handlers import _summarize_calculations


class _Aggregator(CalculationMixin):
    """Minimal host exposing just the aggregation helpers under test."""

    def __init__(self):
        self.store = Mock()
        self.store.async_update_mapping = AsyncMock()


def _mapping(last_calculation=None):
    """Build a mapping with two temperature samples an hour apart."""
    now = datetime.now()
    earlier = now - timedelta(hours=1)
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {},
        const.MAPPING_DATA: [
            {
                const.MAPPING_TEMPERATURE: 10.0,
                const.RETRIEVED_AT: earlier.isoformat(),
            },
            {
                const.MAPPING_TEMPERATURE: 20.0,
                const.RETRIEVED_AT: now.isoformat(),
            },
        ],
        const.MAPPING_DATA_LAST_CALCULATION: last_calculation,
    }


async def test_dry_run_does_not_persist_last_calculation():
    """A dry run must not write the last-calculation marker."""
    agg = _Aggregator()
    mapping = _mapping()

    result = await agg.apply_aggregates_to_mapping_data(mapping, dry_run=True)

    assert result is not None
    agg.store.async_update_mapping.assert_not_called()


async def test_real_run_persists_last_calculation():
    """A normal run still writes the last-calculation marker."""
    agg = _Aggregator()
    mapping = _mapping()

    await agg.apply_aggregates_to_mapping_data(mapping, dry_run=False)

    agg.store.async_update_mapping.assert_called_once()
    _, changes = agg.store.async_update_mapping.call_args[0]
    assert const.MAPPING_DATA_LAST_CALCULATION in changes


async def test_dry_run_leaves_stored_last_calculation_untouched():
    """The dry run must not mutate the mapping dict it was handed either."""
    previous_run = datetime.now() - timedelta(hours=9)
    stored = {const.MAPPING_TIMESTAMP: previous_run}
    mapping = _mapping(last_calculation=stored)
    agg = _Aggregator()

    await agg.apply_aggregates_to_mapping_data(mapping, dry_run=True)

    # Same object, same content: no in-place timestamp bump, no new sensor keys.
    assert mapping[const.MAPPING_DATA_LAST_CALCULATION] is stored
    assert stored == {const.MAPPING_TIMESTAMP: previous_run}


async def test_dry_run_still_aggregates_min_and_max_temperature():
    """Skipping the write must not skip the aggregation itself."""
    agg = _Aggregator()

    result = await agg.apply_aggregates_to_mapping_data(_mapping(), dry_run=True)

    assert result[const.MAPPING_MAX_TEMP] == 20.0
    assert result[const.MAPPING_MIN_TEMP] == 10.0
    assert const.MAPPING_DATA_MULTIPLIER in result


def _zone_calculator():
    """Host for async_calculate_zone with the module maths stubbed out."""
    calc = _Aggregator()
    calc.hass = Mock()
    calc.store.get_zone = Mock(return_value={const.ZONE_ID: 1, const.ZONE_MAPPING: 1})
    calc.store.async_update_zone = AsyncMock()
    calc.calculate_module = AsyncMock(
        return_value={const.ZONE_BUCKET: -7.5, const.ZONE_DURATION: 900}
    )
    calc.seasonal_adjustment_manager = Mock()
    calc.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
        side_effect=lambda data, _zone_id: data
    )
    return calc


async def test_dry_run_zone_writes_nothing():
    """A dry run must not touch the bucket, the zone or the collected data."""
    calc = _zone_calculator()

    with patch.object(calculation, "async_dispatcher_send"):
        result = await calc.async_calculate_zone(
            1, {}, None, delete_weather_data=True, dry_run=True
        )

    calc.store.async_update_zone.assert_not_called()
    calc.store.async_update_mapping.assert_not_called()
    # The caller still gets the numbers back, since nothing was stored to read.
    assert result[const.ZONE_BUCKET] == -7.5


async def test_real_run_zone_writes_and_clears():
    """A normal run still commits the zone and clears the weather data."""
    calc = _zone_calculator()

    with patch.object(calculation, "async_dispatcher_send"):
        await calc.async_calculate_zone(
            1, {}, None, delete_weather_data=True, dry_run=False
        )

    calc.store.async_update_zone.assert_called_once()
    calc.store.async_update_mapping.assert_called_once()


def test_summarize_calculations_is_json_serializable():
    """The service response carries the numbers a dry run would otherwise hide."""
    summary = _summarize_calculations(
        {
            1: {
                const.ZONE_DELTA: -2.5,
                const.ZONE_BUCKET: -7.5,
                const.ZONE_DURATION: 900,
                const.ZONE_LAST_CALCULATED: datetime.now(),
            }
        }
    )

    assert summary == [
        {
            const.ZONE_ID: 1,
            const.ZONE_DELTA: -2.5,
            const.ZONE_BUCKET: -7.5,
            const.ZONE_DURATION: 900.0,
        }
    ]


def test_summarize_calculations_skips_empty_results():
    """Zones that produced nothing are left out rather than reported as zero."""
    assert _summarize_calculations({1: None, 2: {}}) == []
