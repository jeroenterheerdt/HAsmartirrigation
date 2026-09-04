"""Irrigation skip-condition checks and days-between tracking.

Extracted from __init__.py. Covers the pre-irrigation decision logic (skip on
precipitation forecast, the days-between-irrigation counter) and the
total-duration query used by the scheduler and websockets. The methods live on a
mixin the coordinator inherits; their bodies are unchanged and still use
``self`` to reach coordinator state (store, hass, weather client).
"""

import logging

from . import const

_LOGGER = logging.getLogger(__name__)


class SkipConditionsMixin:
    """Skip-condition checks and days-between tracking for the coordinator.

    Mixed into ``SmartIrrigationCoordinator``; methods use ``self`` to reach
    coordinator state (store, hass, weather client).
    """

    async def get_total_duration_all_enabled_zones(self):
        """How long watering every enabled zone takes, in seconds.

        This is what a start trigger works back from to finish at sunrise, so it
        has to be the wall-clock length of the run, not the amount of watering in
        it. Zones run one after another by default, which is their sum; run in
        parallel they all finish with the longest one, and summing then started
        the run hours too early (#552). Which of the two it is comes from the
        zone sequencing setting.

        Returns:
            int: The duration of the whole run for all enabled zones.

        """
        zones = await self.store.async_get_zones()
        durations = [
            zone.get(const.ZONE_DURATION, 0)
            for zone in zones
            if zone.get(const.ZONE_STATE)
            in (const.ZONE_STATE_AUTOMATIC, const.ZONE_STATE_MANUAL)
        ]
        if not durations:
            return 0
        config = await self.store.async_get_config()
        sequencing = config.get(
            const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
        )
        if sequencing == const.CONF_ZONE_SEQUENCING_PARALLEL:
            return max(durations)
        return sum(durations)

    async def async_evaluate_skip_conditions(self) -> dict:
        """Evaluate every skip condition and say which one vetoes watering.

        The runner needs one boolean, but a panel that only knows *that* a run
        was skipped cannot tell anyone *why*, which is what people actually ask
        (#794). So the checks report themselves, and the boolean falls out of
        them, which also means the two can never disagree: the explanation is
        produced by the code that makes the decision.

        Returns a dict with ``should_skip``, the ``reason`` id of the first
        check that vetoes, and ``checks``, one entry per condition carrying
        whether it is enabled, whether it could be evaluated at all, whether it
        skips, and the numbers behind that.
        """
        checks = [
            await self._evaluate_precipitation_forecast(),
            await self._evaluate_days_between_irrigation(),
        ]
        vetoing = next((check for check in checks if check["skip"]), None)
        return {
            "should_skip": vetoing is not None,
            "reason": vetoing["id"] if vetoing else None,
            "checks": checks,
        }

    async def _check_precipitation_forecast(self) -> bool:
        """Whether the forecast vetoes watering."""
        return (await self._evaluate_precipitation_forecast())["skip"]

    async def _check_days_between_irrigation(self) -> bool:
        """Whether too few days have passed since the last irrigation."""
        return (await self._evaluate_days_between_irrigation())["skip"]

    async def async_zones_sheltered_from_rain(self) -> set:
        """Zone ids the forecast cannot reach, because they are under glass.

        A rain forecast is a statement about the sky. It says nothing about a
        greenhouse, so pausing those zones over it waters nothing and dries out
        the plants that depend on us most.
        """
        sheltered = set()
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                continue
            mapping_id = zone.get(const.ZONE_MAPPING)
            if mapping_id is None:
                continue
            mapping = self.store.get_mapping(mapping_id)
            if mapping and mapping.get(const.MAPPING_GREENHOUSE):
                sheltered.add(zone.get(const.ZONE_ID))
        return sheltered

    async def _evaluate_precipitation_forecast(self) -> dict:
        """Report the forecast-precipitation guard.

        ``available`` is False when the forecast could not be read at all. The
        run then goes ahead, which is the behaviour this has always had, but a
        reader can tell "no rain is coming" apart from "we could not find out".
        """
        result = {
            "id": "precipitation",
            "enabled": False,
            "available": True,
            "skip": False,
            "forecast_mm": None,
            "threshold_mm": None,
        }
        config = await self.store.async_get_config()

        # Check if precipitation skip is enabled
        skip_on_precipitation = config.get(
            const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
            const.CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
        )
        if not skip_on_precipitation:
            return result
        result["enabled"] = True

        # Check if weather service is being used
        use_weather_service = config.get(
            const.CONF_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE
        )
        if not use_weather_service:
            _LOGGER.debug(
                "Weather service not enabled, cannot check precipitation forecast"
            )
            result["available"] = False
            return result

        # Get precipitation threshold
        threshold_mm = config.get(
            const.CONF_PRECIPITATION_THRESHOLD_MM,
            const.CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
        )
        result["threshold_mm"] = threshold_mm

        try:
            # Get weather service
            weather_service = config.get(
                const.CONF_WEATHER_SERVICE, const.CONF_DEFAULT_WEATHER_SERVICE
            )
            if weather_service is None:
                _LOGGER.debug("No weather service configured")
                result["available"] = False
                return result

            weather_client = self._WeatherServiceClient

            if weather_client is None:
                _LOGGER.debug("Weather client not available")
                result["available"] = False
                return result

            # Get forecast data including today (index 0). Without include_today
            # the list would start at tomorrow and today's forecast rain would
            # be missed entirely (#775).
            forecast_data = await self.hass.async_add_executor_job(
                weather_client.get_forecast_data, True
            )
            if not forecast_data:
                _LOGGER.debug("No forecast data available")
                result["available"] = False
                return result

            # Check precipitation for today and tomorrow
            total_precipitation = 0.0
            for day_data in forecast_data[:2]:  # today (index 0) + tomorrow
                if const.MAPPING_PRECIPITATION in day_data:
                    total_precipitation += day_data[const.MAPPING_PRECIPITATION]

            _LOGGER.debug(
                "Forecast precipitation: %.1f mm (threshold: %.1f mm)",
                total_precipitation,
                threshold_mm,
            )

            result["forecast_mm"] = total_precipitation
            if total_precipitation >= threshold_mm:
                _LOGGER.info(
                    "Skipping irrigation due to forecasted precipitation: %.1f mm (threshold: %.1f mm)",
                    total_precipitation,
                    threshold_mm,
                )
                result["skip"] = True

        except Exception as e:
            _LOGGER.warning("Error checking precipitation forecast: %s", e)
            result["available"] = False

        return result

    async def _evaluate_days_between_irrigation(self) -> dict:
        """Report the days-between-irrigation guard."""
        result = {
            "id": "days_between",
            "enabled": False,
            "available": True,
            "skip": False,
            "days_since": None,
            "days_required": None,
        }
        config = await self.store.async_get_config()

        # Get the configured minimum days between irrigation
        days_between = config.get(
            const.CONF_DAYS_BETWEEN_IRRIGATION,
            const.CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
        )

        # If days_between is 0, no restriction (always allow irrigation)
        if days_between <= 0:
            return result

        # Get days since last irrigation
        days_since_last = config.get(
            const.CONF_DAYS_SINCE_LAST_IRRIGATION,
            const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
        )
        result["enabled"] = True
        result["days_required"] = days_between
        result["days_since"] = days_since_last

        if days_since_last < days_between:
            _LOGGER.info(
                "Skipping irrigation: only %d days since last irrigation, need %d days minimum",
                days_since_last,
                days_between,
            )
            result["skip"] = True

        return result

    async def _increment_days_since_irrigation(self):
        """Increment the counter for days since last irrigation."""
        config = await self.store.async_get_config()
        current_days = config.get(
            const.CONF_DAYS_SINCE_LAST_IRRIGATION,
            const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
        )

        new_days = current_days + 1
        await self.store.async_update_config(
            {const.CONF_DAYS_SINCE_LAST_IRRIGATION: new_days}
        )

        _LOGGER.debug("Incremented days since last irrigation to %d", new_days)

    async def _reset_days_since_irrigation(self):
        """Reset the counter for days since last irrigation to 0."""
        await self.store.async_update_config({const.CONF_DAYS_SINCE_LAST_IRRIGATION: 0})

        _LOGGER.debug("Reset days since last irrigation to 0")
