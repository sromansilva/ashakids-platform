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
