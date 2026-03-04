from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import List

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: UUID
    email: EmailStr

    model_config = {
        "from_attributes": True,      # allows parsing SQLAlchemy objects
        "json_encoders": {UUID: str}, # serializes UUIDs to string
    }

class AdminResponseModel(BaseModel):
    success: bool
    message: str
    data: AdminResponse | None


class AdminListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[AdminResponse]