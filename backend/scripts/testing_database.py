"""Guardas de fixtures: runtime local y propietario local solo para reiniciar datos."""
import os
from sqlalchemy.engine import make_url


def disposable_database_urls():
    runtime = os.environ.get("ASHAKIDS_TEST_DATABASE_URL", "")
    admin = os.environ.get("ASHAKIDS_TEST_ADMIN_DATABASE_URL") or runtime
    parsed = []
    for value in (runtime, admin):
        try:
            url = make_url(value)
        except Exception:
            raise RuntimeError("URL de pruebas inválida.") from None
        if (url.get_backend_name() != "postgresql"
                or url.host not in {"localhost", "127.0.0.1"}
                or not (url.database or "").startswith("ashakids_test_")
                or url.query):
            raise RuntimeError("Solo se permite PostgreSQL local ashakids_test_* sin redirecciones.")
        parsed.append(url)
    if (parsed[0].host, parsed[0].port, parsed[0].database) != (parsed[1].host, parsed[1].port, parsed[1].database):
        raise RuntimeError("Runtime y limpieza deben apuntar a la misma BD local descartable.")
    return runtime, admin
