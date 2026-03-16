from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel, EmailStr, model_validator
from uuid import UUID
from typing import List, Optional
from src.core.config import settings

class BoxerResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    picture: Optional[str] = None
    coach_id: UUID

    model_config = {
        "from_attributes": True,
        "json_encoders": {UUID: str},
    }

    @model_validator(mode="after")
    def build_picture_url(self):
        if self.picture:
            self.picture = f"{settings.BASE_IMG_URL}/{self.picture}"
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