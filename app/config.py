import os
from pathlib import Path

class Settings:
    DATA_DIR = str(Path(__file__).resolve().parent.parent / "data")

    JWT_SECRET = "CHANGE_THIS_SECRET_IN_PROD"
    STEGO_KEY = 0x5A                 
    AES_KEY_BYTES = b"Sixteen byte key"  
    DEFAULT_PASSWORD = "ChangeMe123!"

    def generate_default_password(self) -> str:
        """Return a default password (replace with stronger logic in production)."""
        return self.DEFAULT_PASSWORD

settings = Settings()