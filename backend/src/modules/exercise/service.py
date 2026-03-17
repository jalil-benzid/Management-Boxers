from sqlalchemy.future import select
from uuid import UUID

from src.db.database import AsyncSessionLocal as async_session
from src.modules.exercise.model import Exercise
from src.modules.exercise.utils.logger import logger


class ExerciseService:

    @staticmethod
    async def create_exercise(name: str, session_id: UUID, description: str | None = None) -> Exercise:
        try:
            new_exercise = Exercise(name=name, description=description, session_id=session_id)

            async with async_session() as db:
                async with db.begin():
                    db.add(new_exercise)
                await db.refresh(new_exercise)

            logger.info(f"[Service] Exercise created: {new_exercise.id} for session: {session_id}")
            return new_exercise

        except Exception as e:
            logger.error(f"[Service] Failed to create exercise: {str(e)}")
            raise

    @staticmethod
    async def get_exercise_by_id(exercise_id: UUID) -> Exercise | None:
        try:
            async with async_session() as db:
                result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
                exercise = result.scalars().first()
                if exercise:
                    logger.debug(f"[Service] Found exercise by id: {exercise_id}")
                return exercise
        except Exception as e:
            logger.error(f"[Service] Error fetching exercise by id ({exercise_id}): {str(e)}")
            raise

    @staticmethod
    async def get_all_exercises_by_session(session_id: UUID) -> list[Exercise]:
        try:
            async with async_session() as db:
                result = await db.execute(select(Exercise).where(Exercise.session_id == session_id))
                exercises = result.scalars().all()
                logger.info(f"[Service] Fetched all exercises for session: {session_id} (count: {len(exercises)})")
                return exercises
        except Exception as e:
            logger.error(f"[Service] Error fetching exercises for session ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def update_exercise(exercise_id: UUID, name: str | None = None, description: str | None = None) -> Exercise | None:
        try:
            async with async_session() as db:
                result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
                exercise = result.scalars().first()
                if not exercise:
                    return None

                if name:
                    exercise.name = name
                if description:
                    exercise.description = description

                await db.commit()
                await db.refresh(exercise)
                logger.info(f"[Service] Updated exercise: {exercise_id}")
                return exercise
        except Exception as e:
            logger.error(f"[Service] Failed to update exercise ({exercise_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_exercise(exercise_id: UUID) -> bool:
        try:
            async with async_session() as db:
                async with db.begin():
                    result = await db.execute(select(Exercise).where(Exercise.id == exercise_id))
                    exercise = result.scalars().first()
                    if not exercise:
                        return False

                    await db.delete(exercise)

                logger.info(f"[Service] Deleted exercise: {exercise_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete exercise ({exercise_id}): {str(e)}")
            raise