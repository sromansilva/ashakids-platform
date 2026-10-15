import pytest
from scripts.testing_database import disposable_database_urls

RUNTIME = "postgresql+asyncpg://runtime@127.0.0.1:6544/ashakids_test_guard"
ADMIN = "postgresql+asyncpg://postgres@127.0.0.1:6544/ashakids_test_guard"


def test_separate_cleanup_identity_same_database(monkeypatch):
    monkeypatch.setenv("ASHAKIDS_TEST_DATABASE_URL", RUNTIME)
    monkeypatch.setenv("ASHAKIDS_TEST_ADMIN_DATABASE_URL", ADMIN)
    assert disposable_database_urls() == (RUNTIME, ADMIN)


def test_cleanup_defaults_to_runtime(monkeypatch):
    monkeypatch.setenv("ASHAKIDS_TEST_DATABASE_URL", RUNTIME)
    monkeypatch.delenv("ASHAKIDS_TEST_ADMIN_DATABASE_URL", raising=False)
    assert disposable_database_urls() == (RUNTIME, RUNTIME)


@pytest.mark.parametrize("target", [
    "postgresql://postgres@remote.invalid/ashakids_test_guard",
    "postgresql://postgres@127.0.0.1:6544/postgres",
    "postgresql://postgres@127.0.0.1:6545/ashakids_test_guard",
    "postgresql://postgres@127.0.0.1:6544/ashakids_test_other",
    "postgresql://postgres@127.0.0.1:6544/ashakids_test_guard?host=remote.invalid",
])
def test_cleanup_cannot_escape_target(monkeypatch, target):
    monkeypatch.setenv("ASHAKIDS_TEST_DATABASE_URL", RUNTIME)
    monkeypatch.setenv("ASHAKIDS_TEST_ADMIN_DATABASE_URL", target)
    with pytest.raises(RuntimeError):
        disposable_database_urls()
