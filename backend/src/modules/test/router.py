from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.modules.test import service, schema

router = APIRouter(prefix="/test", tags=["Test"])

@router.post("/", response_model=schema.TestResponse)
async def create_test(data: schema.TestCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_test_item(db, data.name)

@router.get("/", response_model=list[schema.TestResponse])
async def list_tests(db: AsyncSession = Depends(get_db)):
    return await service.get_all_test_items(db)