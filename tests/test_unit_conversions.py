"""Every unit the panel can store has to convert to something.

The panel and the integration keep their own copies of the unit strings, and
they had drifted: the pressure unit offered first for a metric system is stored
as "millibar" while the conversions only knew it as "mbar". convert_pressure
returned None for it, the value was dropped from the record, and PyETO reported
pressure as missing, on a sensor that was working perfectly.
"""

import itertools

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.helpers import (
    convert_between,
    convert_mapping_to_metric,
)

# The unit strings the panel writes, per field, from frontend/src/helpers.ts
# getOptionsForMappingType. Kept here so the two copies drifting apart fails a
# test rather than a user's water balance.
PANEL_UNITS = {
    const.MAPPING_TEMPERATURE: ["\u00b0C", "\u00b0F"],
    const.MAPPING_DEWPOINT: ["\u00b0C", "\u00b0F"],
    const.MAPPING_PRECIPITATION: ["mm", "in"],
    const.MAPPING_EVAPOTRANSPIRATION: ["mm", "in"],
    const.MAPPING_CURRENT_PRECIPITATION: ["mm/h", "in/h"],
    const.MAPPING_HUMIDITY: ["%"],
    const.MAPPING_PRESSURE: ["millibar", "hPa", "psi", "inch Hg"],
    const.MAPPING_WINDSPEED: ["km/h", "meter/s", "mile/h", "knot"],
    const.MAPPING_SOLRAD: ["W/m2", "W/sq ft", "MJ/day/m2", "MJ/day/sq ft"],
}


@pytest.mark.parametrize(
    ("mapping", "unit"),
    [(mapping, unit) for mapping, units in PANEL_UNITS.items() for unit in units],
)
def test_every_unit_the_panel_offers_converts(mapping, unit):
    """None here means the value silently disappears from the record."""
    assert convert_mapping_to_metric(1.0, mapping, unit, True) is not None


def test_millibar_is_the_same_unit_as_mbar():
    assert convert_mapping_to_metric(
        1013.0, const.MAPPING_PRESSURE, "millibar", True
    ) == (convert_mapping_to_metric(1013.0, const.MAPPING_PRESSURE, "mbar", True))


GROUPS = [
    [const.UNIT_M2, const.UNIT_SQ_FT],
    [const.UNIT_LPM, const.UNIT_GPM],
    [const.UNIT_MM, const.UNIT_INCH],
    [
        const.UNIT_MBAR,
        const.UNIT_MILLIBAR,
        const.UNIT_HPA,
        const.UNIT_PSI,
        const.UNIT_INHG,
    ],
    [const.UNIT_KMH, const.UNIT_MH, const.UNIT_MS, const.UNIT_KNOTS],
    [const.UNIT_W_M2, const.UNIT_W_SQFT, const.UNIT_MJ_DAY_M2, const.UNIT_MJ_DAY_SQFT],
    [const.UNIT_MMH, const.UNIT_INCHH],
]


@pytest.mark.parametrize(
    ("a", "b"),
    [pair for group in GROUPS for pair in itertools.permutations(group, 2)],
)
def test_converting_there_and_back_returns_the_original(a, b):
    """A factor applied in the wrong direction would show up here."""
    there = convert_between(from_unit=a, to_unit=b, val=7.5)
    assert there is not None
    back = convert_between(from_unit=b, to_unit=a, val=there)
    assert back == pytest.approx(7.5)


def test_knots_convert_to_the_other_speeds():
    """A METAR reports wind in knots, and a nautical mile is not a land mile (#801)."""
    assert convert_between(
        from_unit=const.UNIT_KNOTS, to_unit=const.UNIT_MS, val=10.0
    ) == pytest.approx(5.14444, abs=1e-4)
    assert convert_between(
        from_unit=const.UNIT_KNOTS, to_unit=const.UNIT_KMH, val=10.0
    ) == pytest.approx(18.52, abs=1e-4)
    # Reading a knot as a land mile per hour is the 15% error this avoids.
    assert convert_between(
        from_unit=const.UNIT_KNOTS, to_unit=const.UNIT_MH, val=10.0
    ) == pytest.approx(11.5078, abs=1e-4)


def test_a_windspeed_in_knots_reaches_the_calculation_in_metres_per_second():
    assert convert_mapping_to_metric(
        10.0, const.MAPPING_WINDSPEED, const.UNIT_KNOTS, True
    ) == pytest.approx(5.14444, abs=1e-4)
