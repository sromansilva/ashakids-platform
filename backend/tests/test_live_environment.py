import pytest
from tests.live_environment import isolated_live_api


def configure(monkeypatch):
    monkeypatch.setenv("ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS", "1")
    monkeypatch.setenv("ASHAKIDS_TEST_DATABASE_URL", "postgresql+asyncpg://postgres@127.0.0.1/ashakids_test_guard")
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://postgres@127.0.0.1/ashakids_test_guard")
    monkeypatch.setenv("ASHAKIDS_TEST_API_URL", "http://127.0.0.1:8001/api/v1")


def test_live_tests_disabled_by_default(monkeypatch):
    monkeypatch.delenv("ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS", raising=False)
    with pytest.raises(RuntimeError, match="deshabilitada"):
        isolated_live_api()


@pytest.mark.parametrize("name,value", [
    ("ASHAKIDS_TEST_API_URL", "http://localhost:8000/api/v1"),
    ("ASHAKIDS_TEST_API_URL", "https://remote.invalid:8001/api/v1"),
    ("ASHAKIDS_TEST_DATABASE_URL", "postgresql://postgres@remote.invalid/ashakids_test_guard"),
    ("ASHAKIDS_TEST_DATABASE_URL", "postgresql://postgres@localhost/postgres"),
    ("DATABASE_URL", "postgresql://postgres@remote.invalid/postgres"),
])
def test_live_guard_rejects_unsafe_targets(monkeypatch, name, value):
    configure(monkeypatch)
    monkeypatch.setenv(name, value)
    with pytest.raises(RuntimeError):
        isolated_live_api()


def test_explicit_isolated_environment_allowed(monkeypatch):
    configure(monkeypatch)
    assert isolated_live_api() == "http://127.0.0.1:8001/api/v1"
