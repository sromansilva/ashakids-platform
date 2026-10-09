"""Pruebas unitarias para la configuración y el sistema de seguridad/hashing."""

import unittest
from pathlib import Path
import sys

# Asegurar que el backend se encuentre en el path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.security import hash_password, verify_password


class TestConfig(unittest.TestCase):
    """Verifica que la configuración centralizada se cargue adecuadamente."""

    def test_settings_metadata(self):
        self.assertEqual(settings.PROJECT_NAME, "Ashakids API")
        self.assertEqual(settings.VERSION, "0.1.0")
        self.assertEqual(settings.API_V1_PREFIX, "/api/v1")

    def test_supabase_env_loaded(self):
        # Comprobar que las variables no están vacías sin imprimir secretos
        self.assertTrue(bool(settings.SUPABASE_URL), "SUPABASE_URL debe estar configurada en .env")
        self.assertTrue(settings.SUPABASE_URL.startswith("https://"), "SUPABASE_URL debe tener formato URL https")
        self.assertTrue(bool(settings.SUPABASE_KEY), "SUPABASE_KEY debe estar configurada en .env")
        self.assertGreater(len(settings.SUPABASE_KEY), 20, "SUPABASE_KEY debe ser un token válido")


class TestSecurityHashing(unittest.TestCase):
    """Verifica el funcionamiento del hashing Argon2id."""

    def test_hash_produces_argon2id(self):
        pwd = "12345"
        pwd_hash = hash_password(pwd)
        self.assertTrue(pwd_hash.startswith("$argon2id$v=19$"), "El hash debe utilizar el algoritmo Argon2id v19")

    def test_verify_password_success(self):
        pwd = "12345"
        pwd_hash = hash_password(pwd)
        self.assertTrue(verify_password(pwd, pwd_hash), "La contraseña correcta debe retornar True")

    def test_verify_password_incorrect(self):
        pwd = "12345"
        pwd_hash = hash_password(pwd)
        self.assertFalse(verify_password("incorrect_pass", pwd_hash), "La contraseña incorrecta debe retornar False")

    def test_verify_password_empty_or_malformed(self):
        self.assertFalse(verify_password("", "some_hash"))
        self.assertFalse(verify_password("12345", ""))
        self.assertFalse(verify_password("12345", "not_a_valid_argon2_hash"))

    def test_unique_salts_for_identical_passwords(self):
        # Dos contraseñas idénticas '12345' deben generar hashes distintos
        hash_1 = hash_password("12345")
        hash_2 = hash_password("12345")
        self.assertNotEqual(hash_1, hash_2, "Dos hashes de la misma contraseña deben diferir debido al salt aleatorio")
        # Ambos deben verificar satisfactoriamente
        self.assertTrue(verify_password("12345", hash_1))
        self.assertTrue(verify_password("12345", hash_2))


if __name__ == "__main__":
    unittest.main()
