"""A rain forecast is a statement about the sky, not about a greenhouse.

The skip decision is one decision for the whole install, so a wet forecast used
to pause everything, including zones under glass that the rain cannot reach.
Those are the plants most dependent on being watered, and pausing them waters
nothing at all.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _zone(zone_id, mapping=1, state=const.ZONE_STATE_AUTOMATIC, duration=600):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: state,
        const.ZONE_MAPPING: mapping,
        const.ZONE_DURATION: duration,
        const.ZONE_BUCKET: -5.0,
    }


def _coordinator(zones, greenhouse_groups=()):
    coord = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coord.hass = MagicMock()
    coord.store = MagicMock()
    coord.store.async_get_zones = AsyncMock(return_value=zones)
    coord.store.async_update_zone = AsyncMock()
    coord.store.get_mapping = MagicMock(
        side_effect=lambda mid: {
            const.MAPPING_ID: mid,
            const.MAPPING_GREENHOUSE: mid in greenhouse_groups,
        }
    )
    return coord


class TestWhichZonesTheRainCanReach:
    @pytest.mark.asyncio
    async def test_a_greenhouse_zone_is_sheltered(self):
        coord = _coordinator([_zone(1, mapping=7)], greenhouse_groups={7})

        assert await coord.async_zones_sheltered_from_rain() == {1}

    @pytest.mark.asyncio
    async def test_an_outdoor_zone_is_not(self):
        coord = _coordinator([_zone(1, mapping=7)])

        assert await coord.async_zones_sheltered_from_rain() == set()

    @pytest.mark.asyncio
    async def test_a_mixed_install_shelters_only_the_greenhouse(self):
        coord = _coordinator(
            [_zone(1, mapping=7), _zone(2, mapping=8)], greenhouse_groups={7}
        )

        assert await coord.async_zones_sheltered_from_rain() == {1}

    @pytest.mark.asyncio
    async def test_a_zone_that_is_not_automatic_is_not_counted(self):
        """Its duration is one its owner set, not one we decide about."""
        coord = _coordinator(
            [_zone(1, mapping=7, state=const.ZONE_STATE_MANUAL)],
            greenhouse_groups={7},
        )

        assert await coord.async_zones_sheltered_from_rain() == set()

    @pytest.mark.asyncio
    async def test_a_zone_with_no_sensor_group_is_not_sheltered(self):
        coord = _coordinator([_zone(1, mapping=None)], greenhouse_groups={7})

        assert await coord.async_zones_sheltered_from_rain() == set()


class TestHoldingBackTheExposedZones:
    @pytest.mark.asyncio
    async def test_an_exposed_zone_does_not_run(self, monkeypatch):
        monkeypatch.setattr(
            "custom_components.smart_irrigation.triggers.async_dispatcher_send",
            lambda *a, **k: None,
        )
        coord = _coordinator([_zone(1), _zone(2)])

        await coord._hold_back_zones_exposed_to_rain(sheltered={1})

        written = coord.store.async_update_zone.await_args_list
        assert len(written) == 1
        assert written[0].args[0] == 2
        assert written[0].args[1] == {const.ZONE_DURATION: 0}

    @pytest.mark.asyncio
    async def test_the_bucket_is_left_alone_so_the_deficit_rolls_over(
        self, monkeypatch
    ):
        """Exactly what a whole skipped day would have done to it: nothing."""
        monkeypatch.setattr(
            "custom_components.smart_irrigation.triggers.async_dispatcher_send",
            lambda *a, **k: None,
        )
        coord = _coordinator([_zone(1)])

        await coord._hold_back_zones_exposed_to_rain(sheltered=set())

        assert const.ZONE_BUCKET not in coord.store.async_update_zone.await_args.args[1]

    @pytest.mark.asyncio
    async def test_a_zone_with_nothing_to_water_is_not_touched(self, monkeypatch):
        monkeypatch.setattr(
            "custom_components.smart_irrigation.triggers.async_dispatcher_send",
            lambda *a, **k: None,
        )
        coord = _coordinator([_zone(1, duration=0)])

        await coord._hold_back_zones_exposed_to_rain(sheltered=set())

        coord.store.async_update_zone.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_a_manual_zone_keeps_the_duration_its_owner_set(self, monkeypatch):
        monkeypatch.setattr(
            "custom_components.smart_irrigation.triggers.async_dispatcher_send",
            lambda *a, **k: None,
        )
        coord = _coordinator([_zone(1, state=const.ZONE_STATE_MANUAL)])

        await coord._hold_back_zones_exposed_to_rain(sheltered=set())

        coord.store.async_update_zone.assert_not_awaited()
