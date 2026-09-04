"""Which sensor-group sources each calculation engine actually reads.

A sensor group used to be edited blind: every source was offered whatever
engine consumed the result, so a Passthrough group could be filled with
temperature and wind readings nothing would ever look at while its
evapotranspiration source sat empty. Saying what each engine needs is what lets
the editor show only that.

This lives next to the engines, and one place, on purpose. A copy of it in the
frontend would drift, and a source silently dropped from the editor is a water
balance quietly computed from less than the user thinks.
"""

from .. import const

# PyETO runs Penman-Monteith from the weather. Minimum and maximum temperature
# are derived from the Temperature source rather than mapped separately, and
# solar radiation is optional: without it PyETO estimates radiation from the
# temperature range, which is a coarser answer but still an answer.
_PYETO = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_DEWPOINT,
    const.MAPPING_HUMIDITY,
    const.MAPPING_PRESSURE,
    const.MAPPING_WINDSPEED,
    const.MAPPING_SOLRAD,
)

# Passthrough takes evapotranspiration already computed elsewhere.
_PASSTHROUGH = (const.MAPPING_EVAPOTRANSPIRATION,)

# Static uses a fixed delta held in the module's own configuration, so it asks
# the sensor group for nothing at all.
_STATIC = ()

CONSUMED_BY_ENGINE = {
    "PyETO": _PYETO,
    "Passthrough": _PASSTHROUGH,
    "Static": _STATIC,
}

# Rain is subtracted from whatever evapotranspiration the engine produced, so
# it matters to all of them. A greenhouse group hides these separately: there
# the rain is absent from the physical world, not from the engine.
ALWAYS_CONSUMED = (
    const.MAPPING_PRECIPITATION,
    const.MAPPING_CURRENT_PRECIPITATION,
)


def consumed_mappings(engine_name: str | None) -> list[str]:
    """The sources a group feeding ``engine_name`` needs, precipitation included.

    An unknown engine returns every source rather than none: a third-party or
    renamed engine should leave the editor as it was, not hide fields somebody
    depends on.
    """
    if engine_name in CONSUMED_BY_ENGINE:
        return list(CONSUMED_BY_ENGINE[engine_name]) + list(ALWAYS_CONSUMED)
    every = set()
    for sources in CONSUMED_BY_ENGINE.values():
        every.update(sources)
    return sorted(every) + list(ALWAYS_CONSUMED)
