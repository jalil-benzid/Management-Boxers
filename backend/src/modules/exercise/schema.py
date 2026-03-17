from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ExerciseUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class ExerciseResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    session_id: UUID

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class ExerciseResponseModel(BaseModel):
    success: bool
    message: str
    data: ExerciseResponse | None

class ExerciseListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[ExerciseResponse]