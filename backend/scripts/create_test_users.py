"""Script de utilidad para generar hashes Argon2id y seeds SQL para usuarios de prueba.

Genera los hashes utilizando la función centralizada app.core.security.hash_password()
para garantizar total compatibilidad con el sistema de autenticación de ASHAKids.

Esquema de Base de Datos verificado (Fuente de Verdad):
- USUARIOS: id_usuario, nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion
- ROLES: id_rol, nombre_rol, descripcion, fecha_creacion (PADRE, TERAPEUTA, ADMIN)
- ADMINISTRADORES: id_administrador, id_usuario, fecha_creacion
- USUARIO_ROLES: id_usuario_rol, id_usuario, id_rol, asignado_por, fecha_asignacion, activo
  (asignado_por es FK -> ADMINISTRADORES.id_administrador)

Usuarios de prueba definidos:
- Padre / Tutor: padre@ashakids.test (contraseña: 12345)
- Terapeuta: terapeuta@ashakids.test (contraseña: 12345)
- Administrador: admin@ashakids.test (contraseña: 12345)
"""

from pathlib import Path
import sys

# Asegurar que el directorio raíz de backend esté en sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.security import hash_password, verify_password

# Usuarios de prueba adaptados al esquema real (VARCHAR(6))
TEST_USERS = [
    {
        "email": "admin@ashakids.test",
        "password": "12345",
        "role": "ADMIN",
        "nombres": "Administrador",
        "apellidos": "Sistema",
        "codigo_usuario": "a00001",
    },
    {
        "email": "terapeuta@ashakids.test",
        "password": "12345",
        "role": "TERAPEUTA",
        "nombres": "Terapeuta",
        "apellidos": "Especialista",
        "codigo_usuario": "t00001",
    },
    {
        "email": "padre@ashakids.test",
        "password": "12345",
        "role": "PADRE",
        "nombres": "Padre",
        "apellidos": "Familia",
        "codigo_usuario": "p00001",
    },
]


def generate_test_users_data(save_sql: bool = True) -> list[dict]:
    """Genera los registros con hashes Argon2id verificados y opcionalmente escribe seed_test_users.sql.
    
    No modifica la base de datos de manera automática sin instrucción explícita.
    """
    records = []
    print("=" * 65)
    print(" ASHAKids - Generacion de Usuarios de Prueba (Argon2id)")
    print("=" * 65)

    for user in TEST_USERS:
        pwd = user["password"]
        pwd_hash = hash_password(pwd)

        # Validación inmediata del hash generado
        is_valid = verify_password(pwd, pwd_hash)
        if not is_valid:
            raise RuntimeError(f"Error critico: El hash generado para {user['email']} no paso la verificacion.")

        # Verificar que es formato Argon2id
        assert pwd_hash.startswith("$argon2id$"), "El algoritmo no es Argon2id"

        records.append({
            "email": user["email"],
            "password_hash": pwd_hash,
            "role": user["role"],
            "nombres": user["nombres"],
            "apellidos": user["apellidos"],
            "codigo_usuario": user["codigo_usuario"],
            "verified": is_valid,
        })

        print(f"[OK] Usuario: {user['email']:<26} | Rol: {user['role']:<12} | Hash Argon2id verificado")

    # Comprobar que los hashes sean distintos a pesar de tener la misma contraseña
    hashes = [r["password_hash"] for r in records]
    assert len(set(hashes)) == len(hashes), "Los hashes deben ser unicos gracias al salt aleatorio."
    print("\n[OK] Verificacion de salts: Los 3 hashes son unicos e independientes.")

    if save_sql:
        sql_path = BACKEND_DIR / "scripts" / "seed_test_users.sql"
        generate_sql_seed_file(records, sql_path)
        print(f"[OK] Archivo de seed SQL generado: {sql_path.name}")

    print("=" * 65)
    return records


def generate_sql_seed_file(records: list[dict], target_path: Path):
    """Escribe las sentencias SQL preparadas para poblar la base de datos según el esquema oficial."""
    lines = [
        "-- =====================================================================",
        "-- ASHAKids - Seed de Usuarios de Prueba (Entorno de Desarrollo)",
        "-- Adaptado al esquema oficial de base de datos de ASHAKids",
        "-- Hashes generados con algoritmo Argon2id (app.core.security.hash_password)",
        "-- Contrasena inicial de desarrollo: 12345",
        "-- =====================================================================",
        "",
        "BEGIN;",
        "",
        "-- 1. Asegurar roles base en tabla 'roles'",
        "INSERT INTO roles (nombre_rol, descripcion, fecha_creacion)",
        "VALUES ",
        "    ('ADMIN', 'Administrador del sistema con control total', NOW()),",
        "    ('TERAPEUTA', 'Profesional especialista clinico', NOW()),",
        "    ('PADRE', 'Tutor o padre de familia a cargo del nino', NOW())",
        "ON CONFLICT (nombre_rol) DO UPDATE SET descripcion = EXCLUDED.descripcion;",
        "",
        "-- 2. Insercion de usuarios en tabla 'usuarios' (columnas exactas del esquema)",
    ]

    for r in records:
        email = r["email"]
        h = r["password_hash"]
        nombres = r["nombres"]
        apellidos = r["apellidos"]
        codigo = r["codigo_usuario"]
        lines.append(
            f"INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion) "
            f"VALUES ('{nombres}', '{apellidos}', '{codigo}', '{email}', '{h}', true, NOW()) "
            f"ON CONFLICT (email) DO UPDATE SET password_hash = '{h}', activo = true;"
        )

    lines.extend([
        "",
        "-- 3. Registro en 'administradores' para admin@ashakids.test",
        "INSERT INTO administradores (id_usuario, fecha_creacion)",
        "SELECT u.id_usuario, NOW()",
        "FROM usuarios u",
        "WHERE u.email = 'admin@ashakids.test'",
        "  AND NOT EXISTS (",
        "    SELECT 1 FROM administradores a WHERE a.id_usuario = u.id_usuario",
        "  );",
        "",
        "-- 4. Asignacion de roles en 'usuario_roles'",
        "-- Nota: asignado_por es FK -> administradores.id_administrador",
        "",
        "-- Rol ADMIN para admin@ashakids.test (auto-asignado por el id_administrador creado)",
        "INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)",
        "SELECT ",
        "    u.id_usuario,",
        "    r.id_rol,",
        "    a.id_administrador,",
        "    NOW(),",
        "    true",
        "FROM usuarios u",
        "CROSS JOIN roles r",
        "CROSS JOIN administradores a",
        "JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario",
        "WHERE u.email = 'admin@ashakids.test'",
        "  AND r.nombre_rol = 'ADMIN'",
        "  AND u_admin.email = 'admin@ashakids.test'",
        "ON CONFLICT DO NOTHING;",
        "",
        "-- Rol TERAPEUTA para terapeuta@ashakids.test (asignado por administrador)",
        "INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)",
        "SELECT ",
        "    u.id_usuario,",
        "    r.id_rol,",
        "    a.id_administrador,",
        "    NOW(),",
        "    true",
        "FROM usuarios u",
        "CROSS JOIN roles r",
        "CROSS JOIN administradores a",
        "JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario",
        "WHERE u.email = 'terapeuta@ashakids.test'",
        "  AND r.nombre_rol = 'TERAPEUTA'",
        "  AND u_admin.email = 'admin@ashakids.test'",
        "ON CONFLICT DO NOTHING;",
        "",
        "-- Rol PADRE para padre@ashakids.test (asignado por administrador)",
        "INSERT INTO usuario_roles (id_usuario, id_rol, asignado_por, fecha_asignacion, activo)",
        "SELECT ",
        "    u.id_usuario,",
        "    r.id_rol,",
        "    a.id_administrador,",
        "    NOW(),",
        "    true",
        "FROM usuarios u",
        "CROSS JOIN roles r",
        "CROSS JOIN administradores a",
        "JOIN usuarios u_admin ON a.id_usuario = u_admin.id_usuario",
        "WHERE u.email = 'padre@ashakids.test'",
        "  AND r.nombre_rol = 'PADRE'",
        "  AND u_admin.email = 'admin@ashakids.test'",
        "ON CONFLICT DO NOTHING;",
        "",
        "COMMIT;",
        "",
    ])

    target_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    generate_test_users_data(save_sql=True)
