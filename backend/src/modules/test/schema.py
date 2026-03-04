from pydantic import BaseModel

class TestCreate(BaseModel):
    name: str

class TestResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True