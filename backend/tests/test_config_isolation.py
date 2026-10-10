import pytest
from app.core.config import Settings


def test_api_port_is_not_database_port(monkeypatch):
    monkeypatch.setenv("PORT", "8000")
    monkeypatch.setenv("port", "5432")
    # Windows env var names are case insensitive, so verify explicit dotenv aliases separately.
    config = Settings(_env_file=None, PORT=8000, port=5432)
    assert config.PORT == 8000
    assert config.port == 5432


@pytest.mark.parametrize("raw", ['["http://localhost:5173"]', 'http://localhost:5173'])
def test_cors_formats(monkeypatch, raw):
    monkeypatch.setenv("CORS_ORIGINS", raw)
    assert Settings(_env_file=None).CORS_ORIGINS == ["http://localhost:5173"]


def test_expiry_cannot_be_negative():
    with pytest.raises(ValueError):
        Settings(_env_file=None, SESSION_EXPIRE_HOURS=-1)


def test_duration_defaults_follow_environment():
    local = Settings(_env_file=None)
    production = Settings(_env_file=None, ENVIRONMENT="production",
                          DATABASE_URL="postgresql+asyncpg://user:pass@example.invalid/db",
                          CORS_ORIGINS=["https://app.example.invalid"])
    assert local.APPOINTMENT_DURATION_MINUTES == 40
    assert local.ZOOM_MEETING_DURATION_MINUTES == 40
    assert production.APPOINTMENT_DURATION_MINUTES == 45
    assert production.ZOOM_MEETING_DURATION_MINUTES == 45


def test_duration_settings_must_match():
    with pytest.raises(ValueError, match="deben coincidir"):
        Settings(_env_file=None, APPOINTMENT_DURATION_MINUTES=40,
                 ZOOM_MEETING_DURATION_MINUTES=45)
