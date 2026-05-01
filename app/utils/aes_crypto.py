import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def derive_key(passphrase: str, salt: bytes, length: int = 32) -> bytes:
    """Derive a key from a passphrase using PBKDF2."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=length,
        salt=salt,
        iterations=200_000,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def encrypt_bytes(plain: bytes, passphrase: str) -> bytes:
    """Encrypt data with AES-GCM. Returns salt + nonce + ciphertext."""
    salt = os.urandom(16)   # random salt for key derivation
    key = derive_key(passphrase, salt)
    aesgcm = AESGCM(key)

    nonce = os.urandom(12)  # unique nonce per encryption
    ciphertext = aesgcm.encrypt(nonce, plain, None)

    return salt + nonce + ciphertext


def decrypt_bytes(package: bytes, passphrase: str) -> bytes:
    """Decrypt data previously encrypted with encrypt_bytes."""
    if len(package) < 44:  # 16 salt + 12 nonce + min 16 ciphertext/tag
        raise ValueError("Invalid encrypted package")

    salt = package[:16]
    nonce = package[16:28]
    ciphertext = package[28:]

    key = derive_key(passphrase, salt)
    aesgcm = AESGCM(key)

    return aesgcm.decrypt(nonce, ciphertext, None)