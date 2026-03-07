"""
db.py — SQLite database connection helper.
"""

import os
import sqlite3
from contextlib import contextmanager


DB_PATH = os.path.join(os.path.dirname(__file__), "sqlite.db")


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def query_all(sql: str, params: tuple = ()) -> list[dict]:
    """Run a query and return all results as list of dicts."""
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def query_one(sql: str, params: tuple = ()) -> dict | None:
    """Run a query and return one result."""
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None
