import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.base import Base
from datetime import datetime


class RPEEntry(Base):
    __tablename__ = "rpe_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    
    # Core RPE: 1-10 scale (Borg CR-10 or standard 1-10)
    session_rpe = Column(Integer, nullable=False)  # How hard was the session? 1-10
    fatigue = Column(Integer, nullable=True)       # General fatigue 1-10
    sleep_quality = Column(Integer, nullable=True) # Sleep last night 1-10
    soreness = Column(Integer, nullable=True)      # Muscle soreness 1-10
    stress = Column(Integer, nullable=True)        # Mental stress 1-10
    
    # Optional notes
    notes = Column(Text, nullable=True)
    
    # Date of the entry (usually the training day)
    entry_date = Column(Date, nullable=False)
    
    # Foreign keys
    boxer_id = Column(UUID(as_uuid=True), ForeignKey("boxers.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=True)  # Optional link to session
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    boxer = relationship("Boxer", backref="rpe_entries")
    session = relationship("Session", backref="rpe_entries")

    