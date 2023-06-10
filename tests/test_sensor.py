"""Test the Smart Irrigation sensor."""
import pytest
from custom_components.smart_irrigation import config_flow
from custom_components.smart_irrigation.sensor import SmartIrrigationSensor
from custom_components.smart_irrigation.const import (
    DOMAIN,
    CONF_API_KEY,
    CONF_AREA,
    CONF_FLOW,
    CONF_NUMBER_OF_SPRINKLERS,
    CONF_REFERENCE_ET,
    CONF_SENSORS,
    CONF_INITIAL_UPDATE_DELAY,
    CONF_AUTO_REFRESH
)
from unittest import mock
from homeassistant.const import CONF_ACCESS_TOKEN, CONF_NAME, CONF_PATH

from pytest_homeassistant_custom_component.common import MockConfigEntry, AsyncMock, patch, State, mock_restore_cache


async def test_add_sensor(hass):
    """Tests adding a basic sensor."""
    zone_name = "test_zone"
    mock_sensor_data = {
        CONF_AREA: 100,
        CONF_FLOW: 10,
        CONF_NUMBER_OF_SPRINKLERS: 1,
        CONF_REFERENCE_ET: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        CONF_SENSORS: [],
    }
    mock_sensor_options = {
        CONF_INITIAL_UPDATE_DELAY: 0,
        CONF_AUTO_REFRESH: False
    }
    entry = MockConfigEntry(
        domain=DOMAIN, 
        data=mock_sensor_data, 
        title=zone_name, 
        options=mock_sensor_options)

    fake_state = State(f"{DOMAIN}.{entry.entry_id}", {
        "daily": [0, 0,]
    })
    mock_restore_cache(hass, (fake_state,))

    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get(f"sensor.{zone_name}_base_schedule_index")

    assert state
    assert state.state == '0.0'
