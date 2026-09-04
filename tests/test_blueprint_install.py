"""The bundled blueprints must reach the user without ever clobbering theirs."""

from pathlib import Path

import pytest

from custom_components.smart_irrigation.blueprint_install import (
    BUNDLED_BLUEPRINTS,
    install_bundled_blueprints,
)


def _bundled():
    return sorted(BUNDLED_BLUEPRINTS.glob("*/*.yaml"))


def test_we_actually_bundle_blueprints():
    """A silent regression here would ship an empty folder."""
    assert _bundled(), f"no blueprints found under {BUNDLED_BLUEPRINTS}"


def test_bundled_blueprints_live_in_a_known_domain():
    for source in _bundled():
        assert source.parent.name in ("automation", "script")


def test_every_bundled_blueprint_is_installed(tmp_path):
    installed = install_bundled_blueprints(str(tmp_path))

    assert installed == len(_bundled())
    for source in _bundled():
        target = (
            tmp_path
            / "blueprints"
            / source.parent.name
            / "smart_irrigation"
            / source.name
        )
        assert target.read_bytes() == source.read_bytes()


def test_a_blueprint_the_user_already_has_is_left_alone(tmp_path):
    source = _bundled()[0]
    target_dir = tmp_path / "blueprints" / source.parent.name / "smart_irrigation"
    target_dir.mkdir(parents=True)
    mine = target_dir / source.name
    mine.write_text("# I edited this one\n", encoding="utf-8")

    installed = install_bundled_blueprints(str(tmp_path))

    assert mine.read_text(encoding="utf-8") == "# I edited this one\n"
    assert installed == len(_bundled()) - 1


def test_running_twice_installs_nothing_the_second_time(tmp_path):
    assert install_bundled_blueprints(str(tmp_path)) == len(_bundled())
    assert install_bundled_blueprints(str(tmp_path)) == 0


def test_a_filesystem_error_never_raises(tmp_path, monkeypatch):
    def boom(*args, **kwargs):
        raise OSError("read-only file system")

    monkeypatch.setattr(
        "custom_components.smart_irrigation.blueprint_install.shutil.copyfile", boom
    )

    assert install_bundled_blueprints(str(tmp_path)) == 0


def test_a_missing_bundle_is_not_an_error(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.blueprint_install.BUNDLED_BLUEPRINTS",
        Path(tmp_path / "does-not-exist"),
    )

    assert install_bundled_blueprints(str(tmp_path)) == 0


@pytest.mark.parametrize("source", _bundled(), ids=lambda p: p.name)
def test_bundled_blueprint_declares_its_domain(source):
    """HA refuses a blueprint whose `blueprint:` block has no matching domain."""
    text = source.read_text(encoding="utf-8")
    assert f"domain: {source.parent.name}" in text
