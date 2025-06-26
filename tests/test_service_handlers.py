import homeassistant.core as ha
from custom_components.smart_irrigation.services import handle_reset_bucket

async def test_reset_bucket_service(hass, basic_zone_entity):
    state_before = float(hass.states.get(basic_zone_entity).attributes["bucket"])
    # Simulate that bucket was negative
    hass.states.async_set(basic_zone_entity, state_before, {"bucket": -10.0})
    await hass.services.async_call(
        "smart_irrigation", "reset_bucket",
        {"entity_id": basic_zone_entity},
        blocking=True,
    )
    state_after = float(hass.states.get(basic_zone_entity).attributes["bucket"])
    assert state_after == pytest.approx(0.0)
