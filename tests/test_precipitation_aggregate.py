"""Tests for the default aggregate applied to weather-service precipitation.

The generic default is "delta", which only makes sense for a monotonic rain
counter: it adds up the increases and throws away every decrease. Open-Meteo
reports today's precipitation *total*, forecast for the rest of the day, so that
total moves in both directions during the day. Under "delta" the result becomes
the highest forecast ever seen, several times the rain that actually fell, which
is what blew up the bucket in issue #787.
"""

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.store import SmartIrrigationStorage

# A rainy day as Open-Meteo reports it: an early forecast of 25 mm that is
# corrected downwards all day and settles on 2.7 mm of actual rain.
REVISED_DAILY_TOTALS = [0.0, 25.1, 18.4, 9.6, 4.2, 2.7]


def _mapping(source=const.MAPPING_CONF_SOURCE_WEATHER_SERVICE, aggregate=None):
    conf = {const.MAPPING_CONF_SOURCE: source}
    if aggregate is not None:
        conf[const.MAPPING_CONF_AGGREGATE] = aggregate
    return {
        const.MAPPING_ID: 0,
        const.MAPPING_NAME: "Weather group",
        const.MAPPING_MAPPINGS: {const.MAPPING_PRECIPITATION: conf},
        const.MAPPING_DATA_LAST_CALCULATION: {},
    }


async def _load(coordinator, mapping):
    """Put the mapping in the store so the aggregation can write back to it."""
    await coordinator.store._populate_from_data(
        {
            "config": {const.CONF_WEATHER_SERVICE: coordinator.weather_service},
            "mappings": [mapping],
        }
    )


def _coordinator(hass, weather_service):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = hass
    coordinator.weather_service = weather_service
    coordinator.store = SmartIrrigationStorage(hass)
    return coordinator


def test_open_meteo_precipitation_defaults_to_last(hass):
    """Open-Meteo delivers a daily total, so the last one is the day's rain."""
    coordinator = _coordinator(hass, const.CONF_WEATHER_SERVICE_OM)
    assert (
        coordinator._default_precipitation_aggregate(_mapping())
        == const.MAPPING_CONF_AGGREGATE_LAST
    )


def test_other_services_keep_the_delta_default(hass):
    """The other services are untouched; their handling is tracked in #764."""
    coordinator = _coordinator(hass, const.CONF_WEATHER_SERVICE_OWM)
    assert (
        coordinator._default_precipitation_aggregate(_mapping())
        == const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
    )


def test_sensor_sourced_precipitation_keeps_the_delta_default(hass):
    """A user's own rain gauge is a counter, delta stays right for it."""
    coordinator = _coordinator(hass, const.CONF_WEATHER_SERVICE_OM)
    mapping = _mapping(source=const.MAPPING_CONF_SOURCE_SENSOR)
    assert (
        coordinator._default_precipitation_aggregate(mapping)
        == const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION
    )


@pytest.mark.asyncio
async def test_revised_forecast_no_longer_multiplies_the_rain(hass):
    """A day of downward forecast revisions yields the rain that fell."""
    coordinator = _coordinator(hass, const.CONF_WEATHER_SERVICE_OM)
    mapping = _mapping()
    await _load(coordinator, mapping)

    resultdata = {}
    await coordinator._aggregate_sensor_data(
        {const.MAPPING_PRECIPITATION: list(REVISED_DAILY_TOTALS)},
        mapping,
        resultdata,
    )

    assert resultdata[const.MAPPING_PRECIPITATION] == pytest.approx(2.7)


@pytest.mark.asyncio
async def test_explicit_aggregate_still_wins(hass):
    """A user who configured an aggregate keeps it."""
    coordinator = _coordinator(hass, const.CONF_WEATHER_SERVICE_OM)
    mapping = _mapping(aggregate=const.MAPPING_CONF_AGGREGATE_MAXIMUM)
    await _load(coordinator, mapping)

    resultdata = {}
    await coordinator._aggregate_sensor_data(
        {const.MAPPING_PRECIPITATION: list(REVISED_DAILY_TOTALS)},
        mapping,
        resultdata,
    )

    assert resultdata[const.MAPPING_PRECIPITATION] == pytest.approx(25.1)


@pytest.mark.asyncio
async def test_calculate_all_can_be_called_without_arguments(hass):
    """The recurring scheduler calls it with no argument at all.

    ``_async_calculate_all`` used to require ``delete_weather_data``, so a
    recurring schedule with the "calculate all zones" action raised a TypeError
    instead of calculating.
    """
    import inspect

    signature = inspect.signature(SmartIrrigationCoordinator._async_calculate_all)
    assert signature.parameters["delete_weather_data"].default is True
