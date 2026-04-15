from fastapi import FastAPI
from src.api import api_router
from src.db.database import engine
from src.db.base import Base
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.core.rate_limiter import init_rate_limiter


import os



app = FastAPI(title="Management Boxers API")


app.add_middleware(
    CORSMiddleware,
    allow_origins = os.getenv("ALLOWED_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization","Content-Type","Accept"]
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    await init_rate_limiter()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Alive"}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

