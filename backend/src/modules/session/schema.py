from pydantic import BaseModel
from uuid import UUID
from typing import List
from datetime import date

class SessionCreate(BaseModel):
    name: str
    session_date: date

class SessionUpdate(BaseModel):
    name: str | None = None
    session_date: date | None = None

class SessionResponse(BaseModel):
    id: UUID
    name: str
    session_date: date
    schedule_id: UUID

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class SessionResponseModel(BaseModel):
    success: bool
    message: str
    data: SessionResponse | None

class SessionListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[SessionResponse]