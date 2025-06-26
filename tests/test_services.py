import pytest
import homeassistant.core as ha
from custom_components.smart_irrigation.services import (
    handle_calculate_zones,
    handle_reset_bucket,
    handle_reset_all_buckets
)

async def test_handle_reset_all_buckets(hass, hass_ws_client, basic_zone_entity):
    # Set two buckets manually
    hass.states.async_set("sensor.smart_irrigation_zone1", "5.0", {"bucket": 5.0})
    hass.states.async_set("sensor.smart_irrigation_zone2", "-3.0", {"bucket": -3.0})
    await hass.services.async_call(
        "smart_irrigation", "reset_all_buckets", {}, blocking=True
    )
    assert float(hass.states.get("sensor.smart_irrigation_zone1").attributes["bucket"]) == 0.0
    assert float(hass.states.get("sensor.smart_irrigation_zone2").attributes["bucket"]) == 0.0

async def test_handle_calculate_zones_non_automatic(hass, basic_zone_entity):
    # Entity set to manual should not get calculated
    hass.states.async_set("sensor.smart_irrigation_zone_manual", "0.0", {"bucket": 0.0, "state": "manual"})
    await hass.services.async_call(
        "smart_irrigation", "calculate_zones", {}, blocking=True
    )
    assert hass.states.get("sensor.smart_irrigation_zone_manual").attributes["bucket"] == 0.0
