from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import List

class CoachCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class CoachResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

class CoachResponseModel(BaseModel):
    success: bool
    message: str
    data: CoachResponse | None

class CoachListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[CoachResponse]

class CoachUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None