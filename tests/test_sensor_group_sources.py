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
    assert (
        the_map[const.MAPPING_PRECIPITATION][const.MAPPING_CONF_SOURCE]
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
    conf = created[const.MAPPING_MAPPINGS]

    assert (
        conf[const.MAPPING_TEMPERATURE][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    # Rain comes from the service as a rate, not as a depth (#764).
    assert (
        conf[const.MAPPING_CURRENT_PRECIPITATION][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
    assert (
        conf[const.MAPPING_PRECIPITATION][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_NONE
    )


def _weather_group(current_precipitation, precipitation_source=None):
    """A group whose precipitation depth comes from the weather service."""
    if precipitation_source is None:
        precipitation_source = const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    return {
        const.MAPPING_ID: 0,
        const.MAPPING_NAME: "Weather group",
        const.MAPPING_MAPPINGS: {
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: precipitation_source,
                const.MAPPING_CONF_SENSOR: "",
            },
            const.MAPPING_CURRENT_PRECIPITATION: current_precipitation,
        },
    }


def _payload(mapping):
    return {
        "config": {
            const.CONF_USE_WEATHER_SERVICE: True,
            const.CONF_WEATHER_SERVICE: "Open-Meteo",
        },
        "zones": [],
        "mappings": [mapping],
    }


@pytest.mark.asyncio
async def test_sourceless_rate_slot_is_pointed_at_the_weather_service(hass):
    """Groups older than the rate field carry an empty slot for it.

    The water balance is now fed by the rate rather than by the service's own
    precipitation totals (#764), so leaving that slot sourceless would silently
    drop rain from the balance of every group that predates the field.
    """
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload(_weather_group({})))

    rate = store.mappings[0].mappings[const.MAPPING_CURRENT_PRECIPITATION]
    assert rate[const.MAPPING_CONF_SOURCE] == (
        const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )


@pytest.mark.asyncio
async def test_a_configured_rate_sensor_is_left_alone(hass):
    """Someone who wired their own rain rate sensor keeps it."""
    configured = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
        const.MAPPING_CONF_SENSOR: "sensor.rain_rate",
        const.MAPPING_CONF_UNIT: "mm/h",
    }
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload(_weather_group(configured)))

    assert store.mappings[0].mappings[const.MAPPING_CURRENT_PRECIPITATION] == configured


@pytest.mark.asyncio
async def test_a_group_that_does_not_use_the_service_for_rain_is_left_alone(hass):
    """A rain gauge already feeds the depth; do not add a service rate next to it."""
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(
        _payload(
            _weather_group({}, precipitation_source=const.MAPPING_CONF_SOURCE_SENSOR)
        )
    )

    assert store.mappings[0].mappings[const.MAPPING_CURRENT_PRECIPITATION] == {}


@pytest.mark.asyncio
async def test_the_depth_slot_stops_pointing_at_the_service(hass):
    """The panel no longer offers it there, so the stored source must agree.

    A source that does nothing is how a sensor group comes to look configured
    while it is not, which is the whole of #809.
    """
    configured_rate = {
        const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE,
        const.MAPPING_CONF_SENSOR: "",
        const.MAPPING_CONF_UNIT: "",
    }
    store = SmartIrrigationStorage(hass)
    await store._populate_from_data(_payload(_weather_group(configured_rate)))

    the_map = store.mappings[0].mappings
    assert (
        the_map[const.MAPPING_PRECIPITATION][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_NONE
    )
    assert (
        the_map[const.MAPPING_CURRENT_PRECIPITATION][const.MAPPING_CONF_SOURCE]
        == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
    )
