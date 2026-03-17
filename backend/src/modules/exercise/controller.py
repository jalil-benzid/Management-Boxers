from fastapi import HTTPException, status
from uuid import UUID

from src.modules.exercise.schema import (
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseResponse,
    ExerciseResponseModel,
    ExerciseListResponseModel
)
from src.modules.exercise.service import ExerciseService
from src.modules.session.service import SessionService
from src.modules.schedule.service import ScheduleService
from src.modules.exercise.utils.logger import logger


class ExerciseController:

    @staticmethod
    async def _verify_coach_owns_session(session_id: UUID, current_user: dict):
        session = await SessionService.get_session_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        schedule = await ScheduleService.get_schedule_by_id(session.schedule_id)
        if str(schedule.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )
        return session

    @staticmethod
    async def create_exercise(session_id: UUID, payload: ExerciseCreate, current_user: dict) -> ExerciseResponseModel:
        await ExerciseController._verify_coach_owns_session(session_id, current_user)

        new_exercise = await ExerciseService.create_exercise(
            name=payload.name,
            description=payload.description,
            session_id=session_id
        )

        return ExerciseResponseModel(
            success=True,
            message="Exercise created successfully",
            data=ExerciseResponse.model_validate(new_exercise)
        )

    @staticmethod
    async def get_exercise_by_id(exercise_id: UUID, current_user: dict) -> ExerciseResponseModel:
        exercise = await ExerciseService.get_exercise_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        await ExerciseController._verify_coach_owns_session(exercise.session_id, current_user)

        return ExerciseResponseModel(
            success=True,
            message="Exercise fetched successfully",
            data=ExerciseResponse.model_validate(exercise)
        )

    @staticmethod
    async def get_all_exercises(session_id: UUID, current_user: dict) -> ExerciseListResponseModel:
        await ExerciseController._verify_coach_owns_session(session_id, current_user)

        exercises = await ExerciseService.get_all_exercises_by_session(session_id)

        return ExerciseListResponseModel(
            success=True,
            message="Exercises fetched successfully",
            data=[ExerciseResponse.model_validate(e) for e in exercises]
        )

    @staticmethod
    async def update_exercise(exercise_id: UUID, payload: ExerciseUpdate, current_user: dict) -> ExerciseResponseModel:
        exercise = await ExerciseService.get_exercise_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        await ExerciseController._verify_coach_owns_session(exercise.session_id, current_user)

        updated_exercise = await ExerciseService.update_exercise(
            exercise_id,
            name=payload.name,
            description=payload.description
        )

        logger.info(f"[Controller] Exercise updated: {exercise_id}")

        return ExerciseResponseModel(
            success=True,
            message="Exercise updated successfully",
            data=ExerciseResponse.model_validate(updated_exercise)
        )

    @staticmethod
    async def delete_exercise(exercise_id: UUID, current_user: dict) -> ExerciseResponseModel:
        exercise = await ExerciseService.get_exercise_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        await ExerciseController._verify_coach_owns_session(exercise.session_id, current_user)

        await ExerciseService.delete_exercise(exercise_id)

        logger.info(f"[Controller] Exercise deleted: {exercise_id}")

        return ExerciseResponseModel(
            success=True,
            message="Exercise deleted successfully",
            data=None
        )