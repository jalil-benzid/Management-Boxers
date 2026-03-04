from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.modules.test.model import TestItem

async def create_test_item(db: AsyncSession, name: str):
    item = TestItem(name=name)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

async def get_all_test_items(db: AsyncSession):
    result = await db.execute(select(TestItem))
    return result.scalars().all()