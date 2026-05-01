import sqlite3
import os
import json
from passlib.hash import bcrypt
from app.config import settings

DB_FILE = os.path.join(settings.DATA_DIR, "icrop.db")

def init_db():
    """Create database and tables if they don't exist."""
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            uid TEXT,
            address TEXT,
            password_hash TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            path TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            row_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def create_user(name, email, phone, uid, address, password):
    """Insert or update a user record with hashed password."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    pwd_hash = bcrypt.hash(password)
    cur.execute(
        "INSERT OR REPLACE INTO users (name,email,phone,uid,address,password_hash) VALUES (?,?,?,?,?,?)",
        (name, email, phone, uid, address, pwd_hash)
    )
    conn.commit()
    conn.close()

def get_user_by_email(email):
    """Fetch user details by email."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT name,email,phone,uid,address,password_hash FROM users WHERE email=?", (email,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "name": row[0],
        "email": row[1],
        "phone": row[2],
        "uid": row[3],
        "address": row[4],
        "password_hash": row[5]
    }

def verify_password(plain, hashed):
    """Check if plain password matches the stored hash."""
    try:
        return bcrypt.verify(plain, hashed)
    except Exception:
        return False

def store_user_image(email, path):
    """Save path of user image linked to email."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT INTO user_images (email,path) VALUES (?,?)", (email, path))
    conn.commit()
    conn.close()

def store_dataset(rowdict):
    """Save dataset row as JSON string."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT INTO datasets (row_json) VALUES (?)", (json.dumps(rowdict),))
    conn.commit()
    conn.close()

def get_latest_dataset(limit=10):
    """Return latest dataset rows as Python dicts."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT row_json, created_at FROM datasets ORDER BY id DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return [json.loads(r[0]) for r in rows]