"""Calculation audit log: one JSON Lines record per zone calculation (#12).

A calculation is a black box once it has run: the only introspection available
is ``_LOGGER.debug`` output, which has to be enabled *before* the interesting
day, is interleaved with the rest of the Home Assistant log, and does not
correlate the sensor-group aggregation with the equation that consumed it.

This module writes the complete chain -- raw inputs, aggregates and the
aggregation method used, module intermediates, and the resulting bucket and
duration -- to ``<config>/smart_irrigation/calc_log.jsonl``, one record per
line. Two days can then be diffed with ``jq`` or pandas instead of being
reconstructed by hand.

The feature is opt-in (a switch in the general settings) and bounded: the file
is rotated at ``CALC_LOG_MAX_BYTES`` and a single backup is kept, so it can be
left on for a whole season. Writes never raise into the calculation: a failing
audit log must not stop a zone from being watered.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from . import const

_LOGGER = logging.getLogger(__name__)

# Keys that carry personal-ish data and are dropped or rounded before the log
# is attached to a diagnostics download.
_REDACTED_PLACEHOLDER = "[redacted]"


class CalculationLogger:
    """Append-only, size-capped JSON Lines log of calculations."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the logger for this Home Assistant instance."""
        self._hass = hass
        # str(): the path is only ever used for file operations, and tolerating
        # a non-string here keeps constructing the coordinator harmless in tests
        # that hand it a hass double.
        self._dir = str(hass.config.path(const.CALC_LOG_DIR))
        self._path = os.path.join(self._dir, const.CALC_LOG_FILENAME)

    @property
    def path(self) -> str:
        """Full path of the log file (it may not exist yet)."""
        return self._path

    @property
    def backup_path(self) -> str:
        """Full path of the rotated backup file."""
        return self._path + ".1"

    def is_enabled(self, config: dict | None) -> bool:
        """Return whether logging is enabled in the given store config."""
        if not config:
            return False
        return bool(
            config.get(const.CONF_CALC_LOG_ENABLED, const.CONF_DEFAULT_CALC_LOG_ENABLED)
        )

    async def async_log(self, record: dict[str, Any]) -> None:
        """Append a record. Never raises: audit logging is not worth a failure."""
        try:
            line = json.dumps(record, default=_json_default, sort_keys=False)
        except (TypeError, ValueError) as err:
            _LOGGER.warning("[calc_log] could not serialize record: %s", err)
            return
        try:
            await self._hass.async_add_executor_job(self._append, line)
        except OSError as err:
            _LOGGER.warning("[calc_log] could not write to %s: %s", self._path, err)

    def _append(self, line: str) -> None:
        """Write one line, rotating first if the file grew past the cap."""
        os.makedirs(self._dir, exist_ok=True)
        try:
            size = os.path.getsize(self._path)
        except OSError:
            size = 0
        if size >= const.CALC_LOG_MAX_BYTES:
            # Keep exactly one backup, so disk use stays bounded at 2x the cap.
            os.replace(self._path, self.backup_path)
            size = 0
        with open(self._path, "a", encoding="utf-8") as fptr:
            # A write interrupted by a crash leaves a line without its newline;
            # start a new one rather than appending onto it, so a single torn
            # line cannot swallow the record that follows it.
            if size and not self._ends_with_newline():
                fptr.write("\n")
            fptr.write(line + "\n")

    def _ends_with_newline(self) -> bool:
        """Whether the log file currently ends on a complete line."""
        try:
            with open(self._path, "rb") as fptr:
                fptr.seek(-1, os.SEEK_END)
                return fptr.read(1) == b"\n"
        except OSError:
            return True

    async def async_read_recent(self, limit: int) -> list[dict[str, Any]]:
        """Return the ``limit`` most recent records, oldest first."""
        try:
            return await self._hass.async_add_executor_job(self._read_recent, limit)
        except OSError as err:
            _LOGGER.warning("[calc_log] could not read %s: %s", self._path, err)
            return []

    def _read_recent(self, limit: int) -> list[dict[str, Any]]:
        """Read the tail of the log, falling back to the backup when short."""
        lines: list[str] = []
        for path in (self.backup_path, self._path):
            if not os.path.isfile(path):
                continue
            with open(path, encoding="utf-8") as fptr:
                lines.extend(fptr.readlines())
        records = []
        for line in lines[-limit:]:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except ValueError:
                # A torn last line (write interrupted) should not fail the read.
                continue
        return records


def _json_default(value: Any) -> Any:
    """Serialize the non-JSON types that show up in calculation data."""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, set | frozenset):
        return sorted(value)
    return str(value)


def timestamps() -> dict[str, str]:
    """Local and UTC timestamps identifying when a record was produced."""
    now = dt_util.now()
    return {
        "timestamp": now.isoformat(),
        "timestamp_utc": dt_util.as_utc(now).isoformat(),
    }


def redact_record(record: dict[str, Any]) -> dict[str, Any]:
    """Return a copy safe to attach to a diagnostics download.

    Coordinates are rounded to one decimal (~11 km, enough to sanity-check the
    latitude that drives the radiation term without pinpointing a home) and
    sensor entity ids are dropped -- they name the user's devices and are not
    needed to understand why a number came out the way it did.
    """
    redacted = json.loads(json.dumps(record, default=_json_default))
    module = redacted.get("module")
    if isinstance(module, dict):
        for key in ("latitude", "longitude"):
            if isinstance(module.get(key), int | float):
                module[key] = round(module[key], 1)
    fields = redacted.get("inputs", {}).get("fields")
    if isinstance(fields, dict):
        for field in fields.values():
            if isinstance(field, dict) and field.get("entity") is not None:
                field["entity"] = _REDACTED_PLACEHOLDER
    return redacted
