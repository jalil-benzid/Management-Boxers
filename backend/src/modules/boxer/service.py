from sqlalchemy.future import select
from passlib.context import CryptContext
from uuid import UUID

from src.db.database import AsyncSessionLocal as async_session
from src.modules.boxer.model import Boxer
from src.modules.boxer.utils.file_handler import save_picture, delete_picture
from src.modules.boxer.utils.logger import logger
from fastapi import UploadFile

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class BoxerService:

    @staticmethod
    async def create_boxer(
        first_name: str, 
        last_name: str, 
        email: str, 
        password: str, 
        coach_id: UUID, 
        picture: UploadFile | None = None,
        height: int | None = None,
        weight: float | None = None,
        age: int | None = None
    ) -> Boxer:
        try:
            hashed_password = pwd_context.hash(password)
            picture_path = await save_picture(picture) if picture else None

            new_boxer = Boxer(
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=hashed_password,
                coach_id=coach_id,
                picture=picture_path,
                height=height,
                weight=weight,
                age=age
            )

            async with async_session() as session:
                async with session.begin():
                    session.add(new_boxer)
                await session.refresh(new_boxer)

            logger.info(f"[Service] Boxer created: {new_boxer.email} (id: {new_boxer.id})")
            return new_boxer

        except Exception as e:
            logger.error(f"[Service] Failed to create boxer ({email}): {str(e)}")
            raise

    @staticmethod
    async def get_boxer_by_email(email: str) -> Boxer | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Boxer).where(Boxer.email == email))
                boxer = result.scalars().first()
                return boxer
        except Exception as e:
            logger.error(f"[Service] Error fetching boxer by email ({email}): {str(e)}")
            raise

    @staticmethod
    async def get_boxer_by_id(boxer_id: UUID) -> Boxer | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Boxer).where(Boxer.id == boxer_id))
                boxer = result.scalars().first()
                if boxer:
                    logger.debug(f"[Service] Found boxer by id: {boxer_id}")
                return boxer
        except Exception as e:
            logger.error(f"[Service] Error fetching boxer by id ({boxer_id}): {str(e)}")
            raise

    @staticmethod
    async def get_all_boxers_by_coach(coach_id: UUID) -> list[Boxer]:
        try:
            async with async_session() as session:
                result = await session.execute(select(Boxer).where(Boxer.coach_id == coach_id))
                boxers = result.scalars().all()
                logger.info(f"[Service] Fetched all boxers for coach: {coach_id} (count: {len(boxers)})")
                return boxers
        except Exception as e:
            logger.error(f"[Service] Error fetching boxers for coach ({coach_id}): {str(e)}")
            raise

    @staticmethod
    async def update_boxer(
        boxer_id: UUID, 
        first_name: str | None = None, 
        last_name: str | None = None, 
        email: str | None = None, 
        password: str | None = None, 
        picture: UploadFile | None = None,
        height: int | None = None,
        weight: float | None = None,
        age: int | None = None
    ) -> Boxer | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Boxer).where(Boxer.id == boxer_id))
                boxer = result.scalars().first()
                if not boxer:
                    return None

                if first_name is not None:
                    boxer.first_name = first_name
                if last_name is not None:
                    boxer.last_name = last_name
                if email is not None:
                    boxer.email = email
                if password:
                    boxer.password = pwd_context.hash(password)
                if picture:
                    if boxer.picture:
                        delete_picture(boxer.picture)
                    boxer.picture = await save_picture(picture)
                
                # NEW FIELDS
                if height is not None:
                    boxer.height = height
                if weight is not None:
                    boxer.weight = weight
                if age is not None:
                    boxer.age = age

                await session.commit()
                await session.refresh(boxer)
                logger.info(f"[Service] Updated boxer: {boxer_id}")
                return boxer
        except Exception as e:
            logger.error(f"[Service] Failed to update boxer ({boxer_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_boxer(boxer_id: UUID) -> bool:
        try:
            async with async_session() as session:
                async with session.begin():
                    result = await session.execute(select(Boxer).where(Boxer.id == boxer_id))
                    boxer = result.scalars().first()
                    if not boxer:
                        return False

                    if boxer.picture:
                        delete_picture(boxer.picture)

                    await session.delete(boxer)

                logger.info(f"[Service] Deleted boxer: {boxer_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete boxer ({boxer_id}): {str(e)}")
            raise

        