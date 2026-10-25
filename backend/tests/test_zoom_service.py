"""Pruebas aisladas del cliente Zoom; nunca contactan al proveedor real."""
import json
from datetime import datetime, timezone

import pytest

from app.core.config import settings
from app.modules.agenda.infrastructure import zoom


@pytest.mark.asyncio
async def test_zoom_disabled_keeps_manual_mode():
    value = settings.ZOOM_ENABLED
    settings.ZOOM_ENABLED = False
    try:
        assert await zoom.create_meeting(
            topic="prueba", start_time=datetime.now(timezone.utc)
        ) is None
    finally:
        settings.ZOOM_ENABLED = value


@pytest.mark.asyncio
async def test_zoom_creates_configured_lima_meeting_without_exposing_secret(monkeypatch):
    values = {
        "ZOOM_ENABLED": True,
        "ZOOM_ACCOUNT_ID": "account",
        "ZOOM_CLIENT_ID": "client",
        "ZOOM_CLIENT_SECRET": "secret",
        "ZOOM_HOST_USER_ID": "host@example.invalid",
        "ZOOM_API_BASE_URL": "https://api.zoom.test/v2",
    }
    for name, value in values.items():
        monkeypatch.setattr(settings, name, value)
    calls = []

    def fake_request(url, **kwargs):
        calls.append((url, kwargs))
        if url.startswith("https://zoom.us/oauth/token"):
            return {"access_token": "token"}
        return {"id": 12345678901, "join_url": "https://zoom.us/j/12345678901"}

    monkeypatch.setattr(zoom, "_request", fake_request)
    meeting = await zoom.create_meeting(
        topic="ASHAKids · terapia · cita 1",
        start_time=datetime(2026, 10, 10, 20, 0, tzinfo=timezone.utc),
    )

    assert meeting is not None
    assert meeting.meeting_id == "12345678901"
    assert meeting.join_url.startswith("https://zoom.us/")
    payload = json.loads(calls[1][1]["body"])
    assert payload["type"] == 2
    assert payload["duration"] == settings.ZOOM_MEETING_DURATION_MINUTES
    assert payload["timezone"] == "America/Lima"
    assert payload["settings"] == {"waiting_room": True, "join_before_host": False}
    assert "secret" not in repr(calls[1])
