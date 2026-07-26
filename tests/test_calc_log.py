"""Tests for the opt-in calculation audit log (#12)."""

import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calc_log import (
    CalculationLogger,
    redact_record,
)
from custom_components.smart_irrigation.calculation import CalculationMixin


class _Hass:
    """A hass double that runs "executor" jobs inline and writes under tmp_path."""

    def __init__(self, root: Path) -> None:
        self.config = SimpleNamespace(path=lambda *parts: str(root.joinpath(*parts)))

    async def async_add_executor_job(self, func, *args):
        return func(*args)


class _Coordinator(CalculationMixin):
    """Minimal host for the calculation mixin's audit-log helpers."""

    def __init__(self, hass, store, calc_logger) -> None:
        self.hass = hass
        self.store = store
        self.calc_logger = calc_logger
        self._mapping_audits = {}
        self._pending_calc_record = None


def _store(*, calc_log_enabled=True):
    store = Mock()
    store.get_config = Mock(
        return_value={const.CONF_CALC_LOG_ENABLED: calc_log_enabled}
    )
    store.async_update_mapping = AsyncMock()
    return store


def _mapping(records):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Weather station",
        const.MAPPING_DATA: records,
        const.MAPPING_MAPPINGS: {
            const.MAPPING_TEMPERATURE: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                const.MAPPING_CONF_SENSOR: "sensor.outside_temperature",
            },
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                const.MAPPING_CONF_SENSOR: "sensor.rain_today",
                const.MAPPING_CONF_AGGREGATE: const.MAPPING_CONF_AGGREGATE_SUM,
            },
        },
    }


def _records():
    return [
        {
            const.MAPPING_TEMPERATURE: 12.0,
            const.MAPPING_PRECIPITATION: 0.0,
            const.RETRIEVED_AT: "2026-07-26T06:00:00.000000",
        },
        {
            const.MAPPING_TEMPERATURE: 26.0,
            const.MAPPING_PRECIPITATION: 1.5,
            const.RETRIEVED_AT: "2026-07-27T06:00:00.000000",
        },
    ]


@pytest.fixture
def logger(tmp_path):
    """A CalculationLogger writing under a temporary config directory."""
    return CalculationLogger(_Hass(tmp_path))


async def test_append_and_read_back(logger):
    """A logged record can be read back verbatim."""
    await logger.async_log({"zone": {"name": "Lawn"}, "outputs": {"duration": 900}})
    await logger.async_log({"zone": {"name": "Border"}, "outputs": {"duration": 0}})

    records = await logger.async_read_recent(10)

    assert [r["zone"]["name"] for r in records] == ["Lawn", "Border"]
    assert records[0]["outputs"]["duration"] == 900


async def test_rotation_keeps_exactly_one_backup(logger, monkeypatch):
    """Past the size cap the file rotates, bounding disk use at 2x the cap."""
    monkeypatch.setattr(const, "CALC_LOG_MAX_BYTES", 200)

    for index in range(40):
        await logger.async_log({"index": index, "padding": "x" * 50})

    assert Path(logger.path).exists()
    assert Path(logger.backup_path).exists()
    # Only one backup: an older one would have been replaced.
    assert not Path(logger.backup_path + ".1").exists()
    assert Path(logger.path).stat().st_size < const.CALC_LOG_MAX_BYTES * 2

    # The tail still reads across the rotation boundary, oldest first.
    records = await logger.async_read_recent(5)
    assert [r["index"] for r in records] == sorted(r["index"] for r in records)
    assert records[-1]["index"] == 39


async def test_a_torn_line_is_skipped_and_does_not_swallow_the_next_record(logger):
    """A half-written line (crash mid-write) costs that line, and only that line."""
    await logger.async_log({"index": 1})
    with open(logger.path, "a", encoding="utf-8") as fptr:
        fptr.write('{"index": 2, "trunc')

    assert [r["index"] for r in await logger.async_read_recent(10)] == [1]

    await logger.async_log({"index": 3})

    assert [r["index"] for r in await logger.async_read_recent(10)] == [1, 3]


async def test_unserializable_values_do_not_break_logging(logger):
    """Audit logging must never break a calculation."""
    await logger.async_log({"bad": {1, 2}, "zone": object()})

    # Written via the str()/sorted() fallbacks rather than raising.
    records = await logger.async_read_recent(10)
    assert len(records) == 1
    assert records[0]["bad"] == [1, 2]


def test_is_enabled_defaults_to_off(logger):
    """The feature is opt-in: no config, or no key, means off."""
    assert logger.is_enabled(None) is False
    assert logger.is_enabled({}) is False
    assert logger.is_enabled({const.CONF_CALC_LOG_ENABLED: True}) is True


def test_redact_record_rounds_coordinates_and_drops_entities():
    """The diagnostics copy carries no home location and no entity ids."""
    record = {
        "module": {"latitude": 52.379189, "elevation": 12},
        "inputs": {
            "fields": {
                const.MAPPING_TEMPERATURE: {
                    "value": 21.0,
                    "entity": "sensor.outside_temperature",
                },
                const.MAPPING_MAX_TEMP: {"value": 26.0, "derived_from": "Temperature"},
            }
        },
    }

    redacted = redact_record(record)

    assert redacted["module"]["latitude"] == 52.4
    assert redacted["module"]["elevation"] == 12
    fields = redacted["inputs"]["fields"]
    assert fields[const.MAPPING_TEMPERATURE]["entity"] == "[redacted]"
    assert fields[const.MAPPING_TEMPERATURE]["value"] == 21.0
    assert "entity" not in fields[const.MAPPING_MAX_TEMP]
    # The original is untouched.
    assert record["module"]["latitude"] == 52.379189


async def test_aggregation_audit_captures_sources_and_interval(tmp_path):
    """Aggregating a sensor group records how each field was produced."""
    coordinator = _Coordinator(
        _Hass(tmp_path), _store(), CalculationLogger(_Hass(tmp_path))
    )
    mapping = _mapping(_records())

    await coordinator.apply_aggregates_to_mapping_data(mapping)

    audit = coordinator._mapping_audit_store()[1]  # noqa: SLF001
    assert audit["name"] == "Weather station"
    assert audit["records"] == 2
    assert audit["interval"]["source"] == const.RETRIEVED_AT
    assert audit["interval"]["hours"] == pytest.approx(24.0)
    assert audit["multiplier"] == pytest.approx(1.0)

    temperature = audit["fields"][const.MAPPING_TEMPERATURE]
    assert temperature["source"] == const.MAPPING_CONF_SOURCE_SENSOR
    assert temperature["entity"] == "sensor.outside_temperature"
    assert temperature["aggregate"] == const.MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT
    assert temperature["count"] == 2
    # min/max of the raw records make a single outlier visible.
    assert (temperature["min"], temperature["max"]) == (12.0, 26.0)

    precipitation = audit["fields"][const.MAPPING_PRECIPITATION]
    assert precipitation["aggregate"] == const.MAPPING_CONF_AGGREGATE_SUM
    assert precipitation["value"] == pytest.approx(1.5)

    # Max/min temperature are derived from the temperature records, not mapped.
    assert audit["fields"][const.MAPPING_MAX_TEMP] == {
        "value": 26.0,
        "aggregate": const.MAPPING_CONF_AGGREGATE_MAXIMUM,
        "derived_from": const.MAPPING_TEMPERATURE,
    }


async def test_no_audit_is_built_when_logging_is_off(tmp_path):
    """Nothing is collected (and nothing is written) while the switch is off."""
    coordinator = _Coordinator(
        _Hass(tmp_path),
        _store(calc_log_enabled=False),
        CalculationLogger(_Hass(tmp_path)),
    )

    await coordinator.apply_aggregates_to_mapping_data(_mapping(_records()))

    assert coordinator._mapping_audit_store() == {}  # noqa: SLF001
    assert (
        coordinator._build_calc_record(  # noqa: SLF001
            zone={const.ZONE_ID: 0, const.ZONE_MAPPING: 1},
            module_name="PyETO",
            modinst=SimpleNamespace(last_trace={"eto": 4.0}),
            weatherdata={},
            forecastdata=None,
            metric=True,
            values={},
        )
        is None
    )


async def test_dry_run_records_are_written_but_flagged(tmp_path):
    """A dry run is logged -- it is when one asks why -- but never looks real."""
    hass = _Hass(tmp_path)
    calc_logger = CalculationLogger(hass)
    coordinator = _Coordinator(hass, _store(), calc_logger)
    coordinator._pending_calc_record = {"outputs": {}}  # noqa: SLF001

    await coordinator._async_write_calc_record(  # noqa: SLF001
        {const.ZONE_DURATION: 900, const.ZONE_BUCKET: -3.5}, dry_run=True
    )

    record = json.loads(Path(calc_logger.path).read_text(encoding="utf-8"))
    assert record["dry_run"] is True
    assert record["outputs"]["final"][const.ZONE_DURATION] == 900


async def test_record_chains_inputs_intermediates_and_outputs(tmp_path):
    """One record carries the whole chain, and is written on calculation."""
    hass = _Hass(tmp_path)
    calc_logger = CalculationLogger(hass)
    coordinator = _Coordinator(hass, _store(), calc_logger)
    mapping = _mapping(_records())
    weatherdata = await coordinator.apply_aggregates_to_mapping_data(mapping)

    zone = {
        const.ZONE_ID: 3,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MAPPING: 1,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_MAXIMUM_DURATION: 3600,
    }
    trace = {"eto": 4.0, "sol_rad": 22.1, "sol_rad_estimated": True}
    coordinator._pending_calc_record = coordinator._build_calc_record(  # noqa: SLF001
        zone=zone,
        module_name="PyETO",
        modinst=SimpleNamespace(last_trace=trace),
        weatherdata=weatherdata,
        forecastdata=[{}, {}],
        metric=True,
        values={
            "bucket_before": -1.0,
            "delta": -2.5,
            "bucket_after": -3.5,
            "throughput": 10.0,
            "duration": 900,
        },
    )

    await coordinator._async_write_calc_record(  # noqa: SLF001
        {const.ZONE_DURATION: 900, const.ZONE_BUCKET: -3.5, const.ZONE_MULTIPLIER: 1.0}
    )

    lines = Path(calc_logger.path).read_text(encoding="utf-8").splitlines()
    assert len(lines) == 1
    record = json.loads(lines[0])

    assert record["version"] == const.VERSION
    assert record["dry_run"] is False
    assert record["zone"]["name"] == "Lawn"
    assert record["inputs"]["sensor_group"]["name"] == "Weather station"
    assert record["inputs"]["fields"][const.MAPPING_TEMPERATURE]["count"] == 2
    assert record["inputs"]["aggregate"][const.MAPPING_MAX_TEMP] == 26.0
    # The multiplier lives in the outputs, not among the module's inputs.
    assert const.MAPPING_DATA_MULTIPLIER not in record["inputs"]["aggregate"]
    assert record["inputs"]["forecast_records"] == 2
    assert record["module"] == trace
    assert record["outputs"]["bucket_before"] == -1.0
    assert record["outputs"]["bucket_after"] == -3.5
    # 10 l/min for 900 s = 150 l = 0.15 m3.
    assert record["outputs"]["volume_m3"] == pytest.approx(0.15)
    assert record["outputs"]["final"][const.ZONE_DURATION] == 900

    # The pending record is written exactly once.
    assert coordinator._pending_calc_record is None  # noqa: SLF001

    # Several zones commonly share a sensor group, so the aggregation audit is
    # kept and the next zone gets the same detail...
    second = coordinator._build_calc_record(  # noqa: SLF001
        zone={**zone, const.ZONE_ID: 4, const.ZONE_NAME: "Border"},
        module_name="PyETO",
        modinst=SimpleNamespace(last_trace=trace),
        weatherdata=weatherdata,
        forecastdata=None,
        metric=True,
        values={"duration": 0},
    )
    assert second["inputs"]["fields"][const.MAPPING_TEMPERATURE]["count"] == 2

    # ...but a calculation without fresh aggregated data gets no stale audit.
    without_data = coordinator._build_calc_record(  # noqa: SLF001
        zone=zone,
        module_name="PyETO",
        modinst=SimpleNamespace(last_trace=trace),
        weatherdata=None,
        forecastdata=None,
        metric=True,
        values={"duration": 0},
    )
    assert without_data["inputs"]["fields"] == {}
    assert without_data["inputs"]["sensor_group"]["records"] is None
