"""A stale panel snapshot must not revert what an irrigation run recorded.

The panel saves a zone by POSTing the whole object it holds. It has no input for
what a zone records about itself (water delivered, when it last ran, the flow it
has measured), it only carries those fields through. A settings page left open
across a run therefore posts a pre-run copy of them back.

The fields stay accepted by the schema on purpose: rejecting a field the panel
sends fails the entire save with a 400, which is how v2026.8.3 broke every zone
edit (#813, #812). They are accepted and then ignored.
"""

from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.websockets import (
    SERVER_OWNED_ZONE_FIELDS,
    SmartIrrigationZoneView,
    _without_server_owned_fields,
)


def test_a_settings_save_keeps_the_settings():
    posted = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
    }

    assert _without_server_owned_fields(posted) == posted


def test_the_same_dict_comes_back_when_there_is_nothing_to_drop():
    """No needless copy on the common path."""
    posted = {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn"}

    assert _without_server_owned_fields(posted) is posted


@pytest.mark.parametrize("field", SERVER_OWNED_ZONE_FIELDS)
def test_a_server_owned_field_is_dropped(field):
    posted = {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn", field: 999}

    cleaned = _without_server_owned_fields(posted)

    assert field not in cleaned
    assert cleaned[const.ZONE_NAME] == "Lawn"


def test_the_bucket_is_not_server_owned():
    """The panel edits it directly and has a reset button for it."""
    assert const.ZONE_BUCKET not in SERVER_OWNED_ZONE_FIELDS

    posted = {const.ZONE_ID: 1, const.ZONE_BUCKET: -3.0}

    assert _without_server_owned_fields(posted)[const.ZONE_BUCKET] == -3.0


async def test_the_endpoint_hands_the_coordinator_the_cleaned_data(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.websockets.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    coordinator = Mock()
    coordinator.async_update_zone_config = AsyncMock()
    hass = Mock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    request = Mock()
    request.app = {"hass": hass}

    # Go through the real request path, so this also pins that the schema still
    # accepts these fields rather than rejecting the save outright.
    request.json = AsyncMock(
        return_value={
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Lawn",
            const.ZONE_WATER_USED: 0.0,
            const.ZONE_LAST_IRRIGATION: "2026-09-01T06:00:00",
        }
    )
    view = object.__new__(SmartIrrigationZoneView)
    await view.post(request)

    zone_id, data = coordinator.async_update_zone_config.await_args.args
    assert zone_id == 1
    assert data == {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn"}
