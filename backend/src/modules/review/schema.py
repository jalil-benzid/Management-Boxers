from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from src.modules.review.model import DifficultyLevel

class ReviewCreate(BaseModel):
    difficulty: DifficultyLevel
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: UUID
    difficulty: DifficultyLevel
    comment: Optional[str] = None
    session_id: UUID
    boxer_id: UUID

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class ReviewResponseModel(BaseModel):
    success: bool
    message: str
    data: ReviewResponse | None

class ReviewListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[ReviewResponse]