from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional, TYPE_CHECKING
from datetime import date, time

if TYPE_CHECKING:
    from src.modules.exercise.schema import ExerciseResponse

class SessionCreate(BaseModel):
    name: str
    session_date: date
    start_time: time
    end_time: time

class SessionUpdate(BaseModel):
    name: str | None = None
    session_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None

class SessionResponse(BaseModel):
    id: UUID
    name: str
    session_date: date
    start_time: time
    end_time: time
    schedule_id: UUID
    exercises: List['ExerciseResponse'] = []  # String forward reference

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


# IMPORTANT: Rebuild the model after ExerciseResponse is imported
# This goes at the BOTTOM of the file, after the class definitions
def _rebuild_models():
    from src.modules.exercise.schema import ExerciseResponse
    SessionListResponseModel.model_rebuild()
    SessionResponse.model_rebuild()

_rebuild_models()
