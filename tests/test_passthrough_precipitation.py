"""Tests for the Passthrough module water balance (#790).

Passthrough bypasses the ET calculation but not the water balance: measured
precipitation must still refill the bucket. Before the fix, precipitation was
only applied for PyETO, so a Passthrough zone irrigated even when rain far
exceeded the ET loss (bucket could only ever drain).
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.passthrough import Passthrough
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Coordinator(CalculationMixin):
    def __init__(self):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        # get_mapping returns a dict or None in production; a bare MagicMock
        # would answer truthily to every .get(), including the greenhouse flag.
        self.store.get_mapping = MagicMock(return_value={})
        self.store.get_module = MagicMock(
            return_value={
                const.MODULE_NAME: "Passthrough",
                "description": "test",
                "config": {},
            }
        )

    async def getModuleInstanceByID(self, module_id):
        return Passthrough(None, description="test", config={})


def _zone():
    return {
        const.ZONE_NAME: "test zone",
        const.ZONE_MODULE: 1,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_DRAINAGE_RATE: 0.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_SIZE: 50.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_MAXIMUM_DURATION: 3600.0,
        const.ZONE_LEAD_TIME: 0.0,
    }


async def _calculate(weatherdata):
    coordinator = _Coordinator()
    with patch(
        "custom_components.smart_irrigation.calculation.localize",
        new=AsyncMock(return_value=""),
    ):
        return await coordinator.calculate_module(_zone(), weatherdata, None)


async def test_passthrough_rain_offsets_et():
    """#790: bucket 0, interval ET ~1.21mm, measured rain 5.4mm -> no irrigation."""
    data = await _calculate(
        {
            const.MAPPING_EVAPOTRANSPIRATION: 3.37,
            const.MAPPING_PRECIPITATION: 5.4,
            const.MAPPING_DATA_MULTIPLIER: 0.36,
        }
    )
    assert data[const.ZONE_DELTA] == pytest.approx(5.4 - 3.37 * 0.36)
    assert data[const.ZONE_BUCKET] > 0
    assert data[const.ZONE_DURATION] == 0


async def test_passthrough_no_rain_still_irrigates():
    """Without rain the ET loss still drives the bucket negative and irrigates."""
    data = await _calculate(
        {
            const.MAPPING_EVAPOTRANSPIRATION: 3.37,
            const.MAPPING_PRECIPITATION: 0.0,
            const.MAPPING_DATA_MULTIPLIER: 1.0,
        }
    )
    assert data[const.ZONE_DELTA] == pytest.approx(-3.37)
    assert data[const.ZONE_BUCKET] == pytest.approx(-3.37)
    assert data[const.ZONE_DURATION] > 0
