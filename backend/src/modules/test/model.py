from sqlalchemy import Column, Integer, String
from src.db.base import Base

class TestItem(Base):
    __tablename__ = "test_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)