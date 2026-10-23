import asyncio
from email import policy
from email.parser import BytesParser

import pytest
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.newsletter import NewsletterSubscriptionRequest
from app.services import gmail
from app.services.newsletter import check_rate_limit


def test_gmail_disabled_is_controlled(monkeypatch):
    monkeypatch.setattr(settings, "GMAIL_ENABLED", False)
    result = asyncio.run(gmail.send_welcome_email(
        to="person@example.com", name="Persona", role="PADRE",
        code="P00001", activation_url="https://example.com/crear-contrasena#token=test"))
    assert result.status == "NO_CONFIGURADO"


def test_gmail_sends_mime_without_logging_secrets(monkeypatch):
    monkeypatch.setattr(settings, "GMAIL_ENABLED", True)
    monkeypatch.setattr(settings, "GMAIL_CLIENT_ID", "client")
    monkeypatch.setattr(settings, "GMAIL_CLIENT_SECRET", "secret")
    monkeypatch.setattr(settings, "GMAIL_REFRESH_TOKEN", "refresh")
    monkeypatch.setattr(settings, "GMAIL_SENDER_EMAIL", "sender@example.com")
    monkeypatch.setattr(gmail, "_cached_access_token", None)
    monkeypatch.setattr(gmail, "_cached_token_expires_at", 0.0)
    calls = []

    def fake_request(url, **kwargs):
        calls.append((url, kwargs))
        return {"access_token": "access", "expires_in": 3600} if "oauth2" in url else {"id": "sent"}

    monkeypatch.setattr(gmail, "_request_json", fake_request)
    result = asyncio.run(gmail.send_welcome_email(
        to="person@example.com", name="Persona", role="PADRE",
        code="P00001", activation_url="https://example.com/crear-contrasena#token=test"))
    assert result.status == "ENVIADO"
    body = calls[-1][1]["body"]
    raw = __import__("base64").urlsafe_b64decode(__import__("json").loads(body)["raw"])
    assert b"12345678" not in raw
    assert b"crear-contrasena" in raw
    assert b"secret" not in raw
    message = BytesParser(policy=policy.default).parsebytes(raw)
    assert message["To"] == "person@example.com"


def test_newsletter_requires_consent_and_valid_email():
    with pytest.raises(ValidationError):
        NewsletterSubscriptionRequest(email="invalid", consent=True)
    with pytest.raises(ValidationError):
        NewsletterSubscriptionRequest(email="person@example.com", consent=False)


def test_newsletter_rate_limit_is_bounded(monkeypatch):
    monkeypatch.setattr(settings, "NEWSLETTER_RATE_LIMIT", 2)
    monkeypatch.setattr(settings, "NEWSLETTER_RATE_WINDOW_SECONDS", 3600)
    from app.services import newsletter
    newsletter._ip_buckets.clear()
    assert check_rate_limit("127.0.0.1")
    assert check_rate_limit("127.0.0.1")
    assert not check_rate_limit("127.0.0.1")
