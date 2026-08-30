"""Tests for sensor groups saved without a source on any of their fields.

Sensor groups added from the panel used to be stored with a plain empty string
for every field. ``check_mapping_sources`` skips non-dict entries, so such a
group reports no weather service, no sensor and no static value: nothing is ever
fetched for it and every zone linked to it fails to calculate, while the panel
still shows "weather service" (the first option of the source dropdown) for
every field. See issue #809.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    SmartIrrigationStorage,
    default_mapping_entry,
    normalize_mapping_conf,
)

SOURCELESS_MAPPING = {
    const.MAPPING_DEWPOINT: "",
    const.MAPPING_EVAPOTRANSPIRATION: "",
    const.MAPPING_HUMIDITY: "",
    const.MAPPING_PRECIPITATION: "",
    const.MAPPING_CURRENT_PRECIPITATION: "",
    const.MAPPING_PRESSURE: "",
    const.MAPPING_SOLRAD: "",
    const.MAPPING_TEMPERATURE: "",
    const.MAPPING_WINDSPEED: "",
}


def _payload_with_sourceless_group(use_weather_service=True):
    return {
        "config": {
            const.CONF_CALC_TIME: "23:00",
            const.CONF_USE_WEATHER_SERVICE: use_weather_service,
            const.CONF_WEATHER_SERVICE: "Open-Meteo",
        },
        "zones": [],
        "mappings": [
            {
                const.MAPPING_ID: 0,
                const.MAPPING_NAME: "Tuin",
                const.MAPPING_MAPPINGS: dict(SOURCELESS_MAPPING),
                const.MAPPING_DATA: [],
            }
        ],
    }


def test_default_mapping_entry_with_weather_service():
    """Regular fields come from the weather service; ET and solrad do not."""
    assert (
        default_mapping_entry(const.MAPPING_TEMPERATURE, True)[
            const.MAPPING_CONF_SOURCE
        ]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    for key in (const.MAPPING_EVAPOTRANSPIRATION, const.MAPPING_SOLRAD):
        assert (
            default_mapping_entry(key, True)[const.MAPPING_CONF_SOURCE]
            == const.MAPPING_CONF_SOURCE_NONE
        )


def test_default_mapping_entry_without_weather_service():
    """Without a weather service every field has to come from a sensor."""
    for key in (
        const.MAPPING_TEMPERATURE,
        const.MAPPING_EVAPOTRANSPIRATION,
        const.MAPPING_SOLRAD,
    ):
        assert (
            default_mapping_entry(key, False)[const.MAPPING_CONF_SOURCE]
            == const.MAPPING_CONF_SOURCE_SENSOR
        )


def test_normalize_leaves_configured_fields_untouched():
    """A field that already carries a source keeps it, sensor and unit included."""
    configured = {
        const.MAPPING_TEMPERATURE: {
            const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
            const.MAPPING_CONF_SENSOR: "sensor.outside_temperature",
            const.MAPPING_CONF_UNIT: "°C",
        },
        # An empty dict is the slot the loader backfills for fields that did not
        # exist yet in older stores; it is a deliberate "not configured", not the
        # sourceless string this repairs.
        const.MAPPING_CURRENT_PRECIPITATION: {},
    }
    result = normalize_mapping_conf(configured, True)

    assert result[const.MAPPING_TEMPERATURE][const.MAPPING_CONF_SENSOR] == (
        "sensor.outside_temperature"
    )
    assert result[const.MAPPING_CURRENT_PRECIPITATION] == {}


@pytest.mark.asyncio
async def test_sourceless_group_is_repaired_on_load(hass):
    """A stored group without any source is repaired when the store loads."""
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload_with_sourceless_group())

    the_map = store.mappings[0].mappings
    assert all(isinstance(value, dict) for value in the_map.values())
    assert (
        the_map[const.MAPPING_TEMPERATURE][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    assert (
        the_map[const.MAPPING_SOLRAD][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_NONE
    )


@pytest.mark.asyncio
async def test_repaired_group_is_seen_as_weather_service_sourced(hass):
    """After the repair the coordinator finds a weather service on the group.

    This is the actual regression: check_mapping_sources returned (False, False,
    False) for these groups, so async_update_all never called the weather service
    and logged "No weather data to parse".
    """
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload_with_sourceless_group())

    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.store = store

    owm, sensor, static = coordinator.check_mapping_sources(mapping_id=0)
    assert owm is True
    assert sensor is False
    assert static is False


@pytest.mark.asyncio
async def test_created_group_gets_real_sources(hass):
    """A group created with sourceless fields is stored with real sources."""
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload_with_sourceless_group())

    created = await store.async_create_mapping(
        {
            const.MAPPING_NAME: "New group",
            const.MAPPING_MAPPINGS: dict(SOURCELESS_MAPPING),
        }
    )

    assert (
        created[const.MAPPING_MAPPINGS][const.MAPPING_PRECIPITATION][
            const.MAPPING_CONF_SOURCE
        ]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
