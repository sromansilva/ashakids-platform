"""Módulo de seguridad criptográfica para la autenticación propia de ASHAKids.

Implementa hashing y verificación de contraseñas utilizando el algoritmo Argon2id.
"""

from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

# Configuración de PasswordHasher optimizada y segura con Argon2id (estándar OWASP)
_password_hasher = PasswordHasher(
    time_cost=3,        # 3 iteraciones
    memory_cost=65536,  # 64 MiB
    parallelism=4,      # 4 hilos en paralelo
    hash_len=32,        # 32 bytes de longitud del hash
    salt_len=16,        # 16 bytes de sal aleatoria
    type=Type.ID,       # Argon2id: resistencia a ataques de canal lateral y GPU
)


def hash_password(password: str) -> str:
    """Genera un hash seguro utilizando Argon2id.
    
    Cada invocación genera una sal criptográfica independiente, por lo que dos
    contraseñas idénticas producirán hashes distintos.
    
    Args:
        password: La contraseña en texto claro a hashear.
        
    Returns:
        str: El hash codificado en formato estándar Argon2id ($argon2id$v=19$...).
    """
    if not isinstance(password, str) or not password:
        raise ValueError("La contraseña debe ser una cadena de texto no vacía.")
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verifica si una contraseña en texto claro coincide con un hash Argon2id.
    
    Args:
        password: La contraseña en texto plano recibida.
        password_hash: El hash Argon2id almacenado en la base de datos.
        
    Returns:
        bool: True si la contraseña coincide con el hash, False en caso contrario.
    """
    if not password or not password_hash:
        return False
    try:
        return _password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
