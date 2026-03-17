from sqlalchemy.future import select
from uuid import UUID
from datetime import date

from src.db.database import AsyncSessionLocal as async_session
from src.modules.session.model import Session
from src.modules.session.utils.logger import logger


class SessionService:

    @staticmethod
    async def create_session(name: str, session_date: date, schedule_id: UUID) -> Session:
        try:
            new_session = Session(name=name, session_date=session_date, schedule_id=schedule_id)

            async with async_session() as session:
                async with session.begin():
                    session.add(new_session)
                await session.refresh(new_session)

            logger.info(f"[Service] Session created: {new_session.id} for schedule: {schedule_id}")
            return new_session

        except Exception as e:
            logger.error(f"[Service] Failed to create session: {str(e)}")
            raise

    @staticmethod
    async def get_session_by_id(session_id: UUID) -> Session | None:
        try:
            async with async_session() as db:
                result = await db.execute(select(Session).where(Session.id == session_id))
                session = result.scalars().first()
                if session:
                    logger.debug(f"[Service] Found session by id: {session_id}")
                return session
        except Exception as e:
            logger.error(f"[Service] Error fetching session by id ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def get_all_sessions_by_schedule(schedule_id: UUID) -> list[Session]:
        try:
            async with async_session() as db:
                result = await db.execute(select(Session).where(Session.schedule_id == schedule_id))
                sessions = result.scalars().all()
                logger.info(f"[Service] Fetched all sessions for schedule: {schedule_id} (count: {len(sessions)})")
                return sessions
        except Exception as e:
            logger.error(f"[Service] Error fetching sessions for schedule ({schedule_id}): {str(e)}")
            raise

    @staticmethod
    async def update_session(session_id: UUID, name: str | None = None, session_date: date | None = None) -> Session | None:
        try:
            async with async_session() as db:
                result = await db.execute(select(Session).where(Session.id == session_id))
                session = result.scalars().first()
                if not session:
                    return None

                if name:
                    session.name = name
                if session_date:
                    session.session_date = session_date

                await db.commit()
                await db.refresh(session)
                logger.info(f"[Service] Updated session: {session_id}")
                return session
        except Exception as e:
            logger.error(f"[Service] Failed to update session ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_session(session_id: UUID) -> bool:
        try:
            async with async_session() as db:
                async with db.begin():
                    result = await db.execute(select(Session).where(Session.id == session_id))
                    session = result.scalars().first()
                    if not session:
                        return False

                    await db.delete(session)

                logger.info(f"[Service] Deleted session: {session_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete session ({session_id}): {str(e)}")
            raise