from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from uuid import UUID

from src.db.database import AsyncSessionLocal as async_session
from src.modules.coach.model import Coach
from src.modules.coach.utils.logger import logger

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class CoachService:

    @staticmethod
    async def create_coach(full_name: str, email: str, password: str) -> Coach:
        try:
            hashed_password = pwd_context.hash(password)
            new_coach = Coach(full_name=full_name, email=email, password=hashed_password)

            async with async_session() as session:
                async with session.begin():
                    session.add(new_coach)
                await session.refresh(new_coach)

            logger.info(f"[Service] Coach created: {new_coach.email} (id: {new_coach.id})")
            return new_coach

        except Exception as e:
            logger.error(f"[Service] Failed to create coach ({email}): {str(e)}")
            raise

    @staticmethod
    async def get_coach_by_email(email: str) -> Coach | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Coach).where(Coach.email == email))
                coach = result.scalars().first()
                if coach:
                    logger.debug(f"[Service] Found coach by email: {email}")
                return coach
        except Exception as e:
            logger.error(f"[Service] Error fetching coach by email ({email}): {str(e)}")
            raise

    @staticmethod
    async def get_coach_by_id(coach_id: UUID) -> Coach | None:
        try:
            async with async_session() as session:
                result = await session.execute(select(Coach).where(Coach.id == coach_id))
                coach = result.scalars().first()
                if coach:
                    logger.debug(f"[Service] Found coach by id: {coach_id}")
                return coach
        except Exception as e:
            logger.error(f"[Service] Error fetching coach by id ({coach_id}): {str(e)}")
            raise

    @staticmethod
    async def get_all_coaches() -> list[Coach]:
        try:
            async with async_session() as session:
                result = await session.execute(select(Coach))
                coaches = result.scalars().all()
                logger.info(f"[Service] Fetched all coaches (count: {len(coaches)})")
                return coaches
        except Exception as e:
            logger.error(f"[Service] Error fetching all coaches: {str(e)}")
            raise

    @staticmethod
    async def update_coach(coach_id: UUID, full_name: str | None = None, email: str | None = None, password: str | None = None) -> Coach | None:
        try:
            async with async_session() as session:
                async with session.begin():
                    result = await session.execute(select(Coach).where(Coach.id == coach_id))
                    coach = result.scalars().first()
                    if not coach:
                        return None

                    if full_name:
                        coach.full_name = full_name
                    if email:
                        coach.email = email
                    if password:
                        coach.password = pwd_context.hash(password)

                await session.commit()
                await session.refresh(coach)
                logger.info(f"[Service] Updated coach: {coach_id}")
                return coach
        except Exception as e:
            logger.error(f"[Service] Failed to update coach ({coach_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_coach(coach_id: UUID) -> bool:
        try:
            async with async_session() as session:
                async with session.begin():
                    result = await session.execute(select(Coach).where(Coach.id == coach_id))
                    coach = result.scalars().first()
                    if not coach:
                        return False

                    await session.delete(coach)

                await session.commit()
                logger.info(f"[Service] Deleted coach: {coach_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete coach ({coach_id}): {str(e)}")
            raise