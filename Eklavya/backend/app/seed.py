import os

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.models.user import User


def seed_default_users(db: Session) -> None:
    admin_email = os.getenv("ADMIN_EMAIL", "admin@eklavyaart.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_name = os.getenv("ADMIN_NAME", "School Admin")

    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        db.add(
            User(
                email=admin_email,
                name=admin_name,
                hashed_password=hash_password(admin_password),
                role="admin",
            )
        )
        db.commit()
