"""Script de utilidad para generar hashes Argon2id y seeds SQL para usuarios de prueba.

Genera los hashes utilizando la función centralizada app.core.security.hash_password()
para garantizar total compatibilidad con el sistema de autenticación de ASHAKids.

Usuarios de prueba definidos:
- Padre / Tutor: padre@ashakids.test
- Terapeuta: terapeuta@ashakids.test
- Administrador: admin@ashakids.test

Contraseña común de desarrollo: '12345'
(Cada usuario recibe un hash Argon2id diferente debido al salt criptográfico aleatorio).
"""

from pathlib import Path
import sys

# Asegurar que el directorio raíz de backend esté en sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.security import hash_password, verify_password

# Usuarios de prueba definidos para el entorno de desarrollo
TEST_USERS = [
    {
        "email": "padre@ashakids.test",
        "password": "12345",
        "role": "padre",
        "nombre": "Padre",
        "apellido": "Prueba",
    },
    {
        "email": "terapeuta@ashakids.test",
        "password": "12345",
        "role": "terapeuta",
        "nombre": "Terapeuta",
        "apellido": "Prueba",
    },
    {
        "email": "admin@ashakids.test",
        "password": "12345",
        "role": "admin",
        "nombre": "Administrador",
        "apellido": "Sistema",
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
            "nombre": user["nombre"],
            "apellido": user["apellido"],
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
    """Escribe las sentencias SQL preparadas para poblar la base de datos sin ejecutarla automáticamente."""
    lines = [
        "-- =====================================================================",
        "-- ASHAKids - Seed de Usuarios de Prueba (Entorno de Desarrollo)",
        "-- Hashes generados con algoritmo Argon2id (app.core.security.hash_password)",
        "-- Contrasena inicial de desarrollo: 12345",
        "-- =====================================================================",
        "",
        "BEGIN;",
        "",
        "-- Insercion de usuarios en tabla 'usuarios'",
    ]

    for r in records:
        email = r["email"]
        h = r["password_hash"]
        lines.append(
            f"INSERT INTO usuarios (email, password_hash, activo, creado_en) "
            f"VALUES ('{email}', '{h}', true, NOW()) "
            f"ON CONFLICT (email) DO UPDATE SET password_hash = '{h}';"
        )

    lines.extend([
        "",
        "-- Asignacion de roles en 'usuario_roles' (relacion usuarios - roles)",
        "-- Nota: Requiere que los roles correspondientes existan en la tabla 'roles'",
        "INSERT INTO usuario_roles (usuario_id, rol_id) ",
        "SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r ",
        "WHERE u.email = 'admin@ashakids.test' AND r.nombre IN ('admin', 'administrador') ",
        "ON CONFLICT DO NOTHING;",
        "",
        "INSERT INTO usuario_roles (usuario_id, rol_id) ",
        "SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r ",
        "WHERE u.email = 'terapeuta@ashakids.test' AND r.nombre IN ('terapeuta') ",
        "ON CONFLICT DO NOTHING;",
        "",
        "INSERT INTO usuario_roles (usuario_id, rol_id) ",
        "SELECT u.id, r.id FROM usuarios u CROSS JOIN roles r ",
        "WHERE u.email = 'padre@ashakids.test' AND r.nombre IN ('padre', 'tutor') ",
        "ON CONFLICT DO NOTHING;",
        "",
        "COMMIT;",
        "",
    ])

    target_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    generate_test_users_data(save_sql=True)
