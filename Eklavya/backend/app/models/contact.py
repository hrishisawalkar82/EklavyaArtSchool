from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.db import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
