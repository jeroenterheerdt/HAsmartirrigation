"""The zone endpoint has to accept every field a zone is made of.

The panel reads a zone and posts the whole object back when any single field is
edited. Voluptuous rejects unknown keys, so a field added to ZoneEntry without
being added to this schema fails the entire save with a 400, whatever the user
was actually editing.

That is how v2026.8.3 shipped with `precipitation_superseded` breaking every
zone save from the panel (#813, #812). This test compares the two lists so the
next field cannot do it again.
"""

import re

import attr

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import ZoneEntry


def _accepted_keys():
    """The const-backed keys the zone endpoint's write schema allows."""
    source = open(
        "custom_components/smart_irrigation/websockets.py", encoding="utf-8"
    ).read()
    start = source.index("class SmartIrrigationZoneView")
    block = source[start : source.index("\nclass ", start + 10)]
    names = re.findall(r"vol\.Optional\(const\.([A-Z_]+)\)", block)
    return {
        getattr(const, name)
        for name in names
        if isinstance(getattr(const, name, None), str)
    }


def test_every_zone_field_is_accepted_by_the_endpoint():
    fields = set(attr.fields_dict(ZoneEntry).keys())

    missing = sorted(fields - _accepted_keys())

    assert not missing, (
        "these zone fields are returned by the API but rejected on save, "
        f"which fails every zone edit from the panel: {missing}"
    )
