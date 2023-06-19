"""Test the Smart Irrigation config flow."""
import pytest
from custom_components.smart_irrigation import config_flow
from custom_components.smart_irrigation.const import (
    DOMAIN,
)
from unittest import mock
from homeassistant.const import CONF_ACCESS_TOKEN, CONF_NAME, CONF_PATH

from pytest_homeassistant_custom_component.common import MockConfigEntry, AsyncMock, patch

