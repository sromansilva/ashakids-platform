"""TLS verificable para PostgreSQL remoto; sin downgrade ni fallback inseguro."""
import ssl
from pathlib import Path

from sqlalchemy.engine import make_url

from app.core.config import BACKEND_DIR, Settings


def engine_options(database_url: str, config: Settings):
    url = make_url(database_url).set(drivername="postgresql+asyncpg")
    local = url.host in {"localhost", "127.0.0.1", "::1"}
    query = dict(url.query)
    # El contexto, no la URL, decide la política; evitar ssl=require de asyncpg.
    for key in ("ssl", "sslmode"):
        mode = query.pop(key, None)
        if mode is not None and mode not in {"verify-full", "require"}:
            raise ValueError("La URL no admite una política TLS insegura o ambigua.")
    if any(key in query for key in ("sslcert", "sslkey", "sslrootcert", "sslnegotiation")):
        raise ValueError("Configure la CA mediante DB_SSL_CA_FILE.")
    args = {"timeout": config.DB_CONNECT_TIMEOUT,
            "command_timeout": config.DB_COMMAND_TIMEOUT}
    if not local or config.is_production or config.DB_SSL_CA_FILE:
        context = ssl.create_default_context()
        if config.DB_SSL_CA_FILE:
            path = Path(config.DB_SSL_CA_FILE)
            if not path.is_absolute():
                path = BACKEND_DIR / path
            context.load_verify_locations(cafile=str(path))
            # Supabase Root 2021 carece de keyUsage. Python 3.13 activa STRICT
            # por defecto; tolerar ese formato legado conserva cadena, fechas,
            # CERT_REQUIRED y hostname. Solo para una CA elegida explícitamente.
            if config.DB_SSL_LEGACY_CA:
                context.verify_flags &= ~ssl.VERIFY_X509_STRICT
        args["ssl"] = context
    else:
        # Solo loopback de desarrollo; no habilita conexiones remotas sin verificar.
        args["ssl"] = False
    return url.set(query=query), {"connect_args": args, "pool_timeout": config.DB_POOL_TIMEOUT}
