import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from src.db.base import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)