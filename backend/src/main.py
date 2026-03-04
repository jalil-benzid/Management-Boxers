from fastapi import FastAPI
from src.api import api_router
from src.db.database import engine
from src.db.base import Base

app = FastAPI(title="Management Boxers API")

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Alive"}