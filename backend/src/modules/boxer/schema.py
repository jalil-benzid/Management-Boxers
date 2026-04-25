from pydantic import BaseModel, EmailStr, model_validator
from uuid import UUID
from typing import List, Optional


class BoxerResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    picture: Optional[str] = None
    coach_id: UUID
    
    # NEW FIELDS
    height: Optional[int] = None
    weight: Optional[float] = None
    age: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

    @model_validator(mode="after")
    def build_picture_url(self):
        if self.picture:
            self.picture = f"{self.picture}"
        return self
    

class BoxerResponseModel(BaseModel):
    success: bool
    message: str
    data: BoxerResponse | None

class BoxerListResponseModel(BaseModel):
    success: bool
    message: str
    data: List[BoxerResponse]

class BoxerUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    
    # NEW FIELDS
    height: int | None = None
    weight: float | None = None
    age: int | None = None