"""Guardas para suites heredadas que usan un servidor HTTP externo."""
import os
from urllib.parse import urlsplit
from sqlalchemy.engine import make_url


def isolated_live_api() -> str:
    if os.getenv("ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS") != "1":
        raise RuntimeError("Suite HTTP heredada deshabilitada; requiere API y BD descartables explícitas.")
    database = os.getenv("ASHAKIDS_TEST_DATABASE_URL", "")
    configured = os.getenv("DATABASE_URL", "")
    try:
        parsed = make_url(database)
    except Exception:
        raise RuntimeError("Falta URL de PostgreSQL descartable válida.") from None
    if parsed.host not in {"127.0.0.1", "localhost"} or not (parsed.database or "").startswith("ashakids_test_"):
        raise RuntimeError("Las pruebas HTTP requieren PostgreSQL local ashakids_test_*.")
    if configured != database:
        raise RuntimeError("DATABASE_URL debe coincidir con ASHAKIDS_TEST_DATABASE_URL.")
    api = os.getenv("ASHAKIDS_TEST_API_URL", "").rstrip("/")
    try:
        url = urlsplit(api)
        valid = (url.scheme == "http" and url.hostname in {"localhost", "127.0.0.1"}
                 and url.port == 8001 and url.path == "/api/v1"
                 and not url.query and not url.fragment and not url.username)
    except ValueError:
        valid = False
    if not valid:
        raise RuntimeError("La API de pruebas debe declararse en loopback:8001/api/v1, separada del backend habitual.")
    return api
