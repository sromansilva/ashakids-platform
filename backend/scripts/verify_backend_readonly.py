"""B01/B02: TLS y metadatos reales sin filas, sesiones ni escrituras persistentes.

Uso: python -m scripts.verify_backend_readonly --output ruta.json
Configura DB_SSL_CA_FILE fuera de Git. Nunca imprime URL, usuarios o errores SQL.
"""
import argparse
import asyncio
import json
import ssl
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.database_transport import engine_options
from app.core.database import Base
from app.models import auth, auditoria, clinica, mensajeria, perfiles
from scripts.inspect_schema_compatibility import COLUMNS, TABLES, CONSTRAINTS, INDEXES, model_differences


async def verify():
    results = {"captured_utc": datetime.now(timezone.utc).isoformat(),
               "environment": settings.ENVIRONMENT, "mode": "READ ONLY", "target": "backend/.env",
               "tls": {}, "models": []}
    url, options = engine_options(settings.effective_database_url, settings)
    context = options["connect_args"]["ssl"]
    if not isinstance(context, ssl.SSLContext):
        raise ValueError("La auditoría real exige contexto TLS verificable.")
    results["tls"].update({"verify_mode": context.verify_mode.name,
                           "check_hostname": context.check_hostname,
                           "legacy_ca_explicit": settings.DB_SSL_LEGACY_CA,
                           "strict_x509": bool(context.verify_flags & ssl.VERIFY_X509_STRICT)})
    engine = create_async_engine(url, **options)
    try:
        async with engine.connect() as db:
            await db.execute(text("SET TRANSACTION READ ONLY"))
            await db.execute(text("SET LOCAL statement_timeout='15000ms'"))
            results["transaction_read_only"] = await db.scalar(text("SHOW transaction_read_only"))
            raw = await db.get_raw_connection()
            # Introspección del transporte: no exportar peer/certificado ni identidad del proyecto.
            tls = raw.driver_connection._transport.get_extra_info("ssl_object")
            results["tls"].update({"valid_connection": True, "version": tls.version(), "cipher": tls.cipher()[0]})
            results["server_version"] = await db.scalar(text("SHOW server_version"))
            role = (await db.execute(text("SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolinherit "
                                           "FROM pg_roles WHERE rolname=current_user"))).mappings().one()
            results["runtime_privileges"] = dict(role)
            for key, sql in (("tables", TABLES), ("columns", COLUMNS), ("constraints", CONSTRAINTS), ("indexes", INDEXES)):
                results[key] = [dict(row) for row in (await db.execute(text(sql))).mappings()]
            results["policy_count"] = await db.scalar(text("SELECT count(*) FROM pg_policies WHERE schemaname='public'"))
            results["sequences"] = [dict(row) for row in (await db.execute(text(
                "SELECT c.relname AS table_name, a.attname AS column_name, "
                "pg_get_serial_sequence('public.' || quote_ident(c.relname),a.attname) AS sequence_name "
                "FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "
                "JOIN pg_attribute a ON a.attrelid=c.oid "
                "WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped "
                "AND pg_get_serial_sequence('public.' || quote_ident(c.relname),a.attname) IS NOT NULL "
                "ORDER BY c.relname,a.attname"))).mappings()]
            results["model_differences"] = model_differences(results["columns"])
            for table in Base.metadata.sorted_tables:
                await db.execute(select(table).limit(0))
                results["models"].append({"table": table.name, "select_limit_zero": "OK"})
    except Exception as exc:
        results["connection_error"] = type(exc).__name__
    finally:
        await engine.dispose()
    # La segunda conexión tiene una trust store vacía: debe rechazar el certificado.
    invalid = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    negative = dict(options)
    negative["connect_args"] = {**options["connect_args"], "ssl": invalid}
    engine = create_async_engine(url, **negative)
    try:
        async with engine.connect():
            results["tls"]["invalid_trust_rejected"] = False
    except ssl.SSLCertVerificationError:
        results["tls"]["invalid_trust_rejected"] = True
    except Exception as exc:
        results["tls"]["negative_error"] = type(exc).__name__
    finally:
        await engine.dispose()
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = asyncio.run(verify())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    print(json.dumps({"tls": result["tls"], "connection_error": result.get("connection_error"),
                      "models": len(result["models"]), "privileges": result.get("runtime_privileges")}))
    raise SystemExit(0 if result["tls"].get("valid_connection") and result["tls"].get("invalid_trust_rejected") else 1)
