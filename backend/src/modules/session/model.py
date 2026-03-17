import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    name = Column(String, nullable=False)
    session_date = Column(Date, nullable=False)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("schedules.id"), nullable=False)

    schedule = relationship("Schedule", backref="sessions")
    # exercises, attendances, reviews relationships will be added after those modules are created