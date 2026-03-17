import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint, Enum
from src.db.base import Base
import enum

class DifficultyLevel(str, enum.Enum):
    very_easy = "very_easy"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    extremely_hard = "extremely_hard"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    comment = Column(String, nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    boxer_id = Column(UUID(as_uuid=True), ForeignKey("boxers.id"), nullable=False)

    session = relationship("Session", backref="reviews")
    boxer = relationship("Boxer", backref="reviews")

    __table_args__ = (
        UniqueConstraint("session_id", "boxer_id", name="unique_session_boxer_review"),
    )