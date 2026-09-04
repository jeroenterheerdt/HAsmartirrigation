"""Every shipped engine has to say which sources it reads.

The sensor-group editor offers only those, so an engine that declares nothing
would have its group edited blind, and an engine whose declaration is wrong
would have a source hidden that its calculation actually needs.
"""

from pathlib import Path

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.consumes import (
    ALWAYS_CONSUMED,
    CONSUMED_BY_ENGINE,
    consumed_mappings,
)

CALCMODULES = Path("custom_components/smart_irrigation/calcmodules")


def _shipped_engine_dirs():
    return sorted(
        p.name
        for p in CALCMODULES.iterdir()
        if p.is_dir() and (p / "__init__.py").exists() and not p.name.startswith("_")
    )


def test_there_are_engines_to_check():
    assert _shipped_engine_dirs()


@pytest.mark.parametrize("directory", _shipped_engine_dirs())
def test_every_shipped_engine_declares_its_sources(directory):
    """Adding an engine without declaring what it reads must fail here."""
    declared = {name.lower() for name in CONSUMED_BY_ENGINE}

    assert directory.lower() in declared, (
        f"the {directory} engine ships but does not say which sources it reads, "
        "so its sensor groups would be edited blind"
    )


def test_pyeto_asks_for_the_weather_and_not_for_evapotranspiration():
    sources = consumed_mappings("PyETO")

    assert const.MAPPING_TEMPERATURE in sources
    assert const.MAPPING_WINDSPEED in sources
    assert const.MAPPING_EVAPOTRANSPIRATION not in sources


def test_passthrough_asks_only_for_evapotranspiration():
    sources = consumed_mappings("Passthrough")

    assert const.MAPPING_EVAPOTRANSPIRATION in sources
    assert const.MAPPING_TEMPERATURE not in sources
    assert const.MAPPING_WINDSPEED not in sources


def test_static_asks_for_no_weather_at_all():
    """Its delta lives in the module's own configuration."""
    assert set(consumed_mappings("Static")) == set(ALWAYS_CONSUMED)


@pytest.mark.parametrize("engine", [*CONSUMED_BY_ENGINE, "Something else", None])
def test_rain_always_counts(engine):
    """The bucket is evapotranspiration minus rain, whichever engine produced it."""
    sources = consumed_mappings(engine)

    for rain in ALWAYS_CONSUMED:
        assert rain in sources


def test_an_unknown_engine_hides_nothing():
    """A third-party engine should leave the editor as it was, not empty it."""
    sources = consumed_mappings("Not one of ours")

    for declared in CONSUMED_BY_ENGINE.values():
        for source in declared:
            assert source in sources
