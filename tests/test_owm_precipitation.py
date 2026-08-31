"""OpenWeatherMap precipitation is read from the nested One Call keys (#788).

One Call reports the last hour of rain as ``{"rain": {"1h": 3.16}}``, but the
client looked up a flat ``"rain.1h"`` key that the payload never contains. The
lookup silently missed every time, so measured precipitation from OWM was
always 0 and the water balance never saw any rain.
"""

from custom_components.smart_irrigation.weathermodules.OWMClient import (
    current_precipitation,
)


def test_rain_of_the_last_hour_is_read():
    assert current_precipitation({"temp": 17.8, "rain": {"1h": 3.16}}) == 3.16


def test_snow_of_the_last_hour_is_read():
    assert current_precipitation({"snow": {"1h": 1.5}}) == 1.5


def test_rain_and_snow_add_up():
    assert current_precipitation({"rain": {"1h": 2.0}, "snow": {"1h": 0.5}}) == 2.5


def test_a_dry_hour_reports_nothing():
    # OWM leaves the keys out entirely when nothing is falling.
    assert current_precipitation({"temp": 21.0, "humidity": 40}) == 0.0


def test_other_accumulation_periods_are_ignored():
    # Some responses carry "3h" instead; it is not the interval we sample.
    assert current_precipitation({"rain": {"3h": 9.0}}) == 0.0


def test_a_plain_number_is_accepted():
    # The daily entries use this shape; tolerating it costs nothing.
    assert current_precipitation({"rain": 4.2}) == 4.2


def test_a_malformed_value_does_not_raise():
    assert current_precipitation({"rain": {"1h": None}, "snow": "heavy"}) == 0.0
