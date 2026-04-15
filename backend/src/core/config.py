from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    DEBUG: bool = False

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    BASE_IMG_URL: str

    # 👇 NEW: CORS origins handled properly
    ALLOWED_ORIGINS: List[str] = Field(default_factory=list)

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"  # prevents crashes from unknown env vars


settings = Settings()
