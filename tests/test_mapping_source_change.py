"""Changing where a sensor group reads from must not be read as a measurement.

A group owns one buffer of readings shared by its zones, and a difference-based
aggregate (delta, Riemann sum) compares readings inside it. Readings taken from
the old source are not comparable with the new one's: swapping a rain gauge
from a rate to a cumulative total makes the switch itself look like a single
enormous rainfall, big enough to pin every zone's bucket.
"""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.helpers import mapping_sources_changed


def _quantity(source="sensor", sensor="sensor.rain", unit="mm"):
    return {
        const.MAPPING_CONF_SOURCE: source,
        const.MAPPING_CONF_SENSOR: sensor,
        const.MAPPING_CONF_UNIT: unit,
    }


class TestWhatCountsAsAChange:
    def test_a_different_sensor_entity_counts(self):
        assert mapping_sources_changed(
            {const.MAPPING_PRECIPITATION: _quantity(sensor="sensor.old")},
            {const.MAPPING_PRECIPITATION: _quantity(sensor="sensor.new")},
        )

    def test_a_different_source_type_counts(self):
        assert mapping_sources_changed(
            {const.MAPPING_PRECIPITATION: _quantity(source="sensor")},
            {const.MAPPING_PRECIPITATION: _quantity(source="weather_service")},
        )

    def test_adding_a_quantity_counts(self):
        assert mapping_sources_changed({}, {const.MAPPING_PRECIPITATION: _quantity()})

    def test_an_identical_resave_does_not(self):
        mappings = {const.MAPPING_PRECIPITATION: _quantity()}
        assert not mapping_sources_changed(mappings, dict(mappings))

    def test_a_unit_change_alone_does_not(self):
        """Readings are converted to metric as they arrive, with the unit in
        force at that moment, so what is stored is not reinterpreted later."""
        assert not mapping_sources_changed(
            {const.MAPPING_PRECIPITATION: _quantity(unit="mm")},
            {const.MAPPING_PRECIPITATION: _quantity(unit="inch")},
        )

    def test_an_edit_that_carries_no_quantities_does_not(self):
        """Renaming the group must not throw its readings away."""
        assert not mapping_sources_changed(
            {const.MAPPING_PRECIPITATION: _quantity()}, None
        )

    def test_a_legacy_bare_string_does_not_crash_and_errs_to_invalidating(self):
        assert mapping_sources_changed(
            {const.MAPPING_PRECIPITATION: "sensor.rain"},
            {const.MAPPING_PRECIPITATION: _quantity()},
        )


@pytest.fixture
def coordinator():
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    coord = object.__new__(SmartIrrigationCoordinator)
    coord.hass = Mock()
    coord.store = Mock()
    coord.store.async_update_mapping = AsyncMock()
    coord.update_subscriptions = AsyncMock()
    return coord


async def test_a_source_change_drops_the_buffer_and_its_baselines(
    coordinator, monkeypatch
):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    coordinator.store.get_mapping = Mock(
        return_value={
            const.MAPPING_ID: 1,
            const.MAPPING_MAPPINGS: {
                const.MAPPING_PRECIPITATION: _quantity(sensor="sensor.old")
            },
            const.MAPPING_DATA: [{"precipitation": 1.0}],
        }
    )

    await coordinator.async_update_mapping_config(
        mapping_id=1,
        data={
            const.MAPPING_MAPPINGS: {
                const.MAPPING_PRECIPITATION: _quantity(sensor="sensor.new")
            }
        },
    )

    written = coordinator.store.async_update_mapping.await_args.args[1]
    assert written[const.MAPPING_DATA] == []
    assert written[const.MAPPING_DATA_LAST_ENTRY] == {}
    assert written[const.MAPPING_DATA_LAST_CALCULATION] == {}


async def test_renaming_a_group_keeps_its_readings(coordinator, monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    coordinator.store.get_mapping = Mock(
        return_value={
            const.MAPPING_ID: 1,
            const.MAPPING_MAPPINGS: {const.MAPPING_PRECIPITATION: _quantity()},
            const.MAPPING_DATA: [{"precipitation": 1.0}],
        }
    )

    await coordinator.async_update_mapping_config(
        mapping_id=1, data={const.MAPPING_NAME: "Back garden"}
    )

    written = coordinator.store.async_update_mapping.await_args.args[1]
    assert const.MAPPING_DATA not in written
