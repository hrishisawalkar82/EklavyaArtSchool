import os
import time
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://eklavya:eklavya123@localhost:5432/eklavya_db")

def create_engine_with_retry(database_url, max_retries=30, delay=2):
    """Create engine with retry logic to handle DB not being ready yet."""
    last_error = None
    for attempt in range(max_retries):
        try:
            engine = create_engine(database_url)
            # Test the connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            return engine
        except OperationalError as e:
            last_error = e
            print(f"Database not ready (attempt {attempt + 1}/{max_retries}), retrying in {delay}s...")
            time.sleep(delay)
    raise last_error

engine = create_engine_with_retry(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
