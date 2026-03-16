from fastapi import HTTPException, status
from uuid import UUID

from src.modules.coach.schema import (
    CoachCreate,
    CoachResponse,
    CoachResponseModel,
    CoachListResponseModel
)
from src.modules.coach.service import CoachService
from src.modules.coach.utils.logger import logger
from src.modules.coach.schema import CoachCreate, CoachUpdate, CoachResponse, CoachResponseModel, CoachListResponseModel


class CoachController:

    @staticmethod
    async def create_coach(coach_create: CoachCreate) -> CoachResponseModel:
        existing = await CoachService.get_coach_by_email(coach_create.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        new_coach = await CoachService.create_coach(
            coach_create.full_name,
            coach_create.email,
            coach_create.password
        )

        return CoachResponseModel(
            success=True,
            message="Coach created successfully",
            data=CoachResponse.model_validate(new_coach)
        )

    @staticmethod
    async def get_coach_by_id(coach_id: UUID, current_user: dict) -> CoachResponseModel:
        if current_user["role"] == "coach" and str(coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own profile"
            )

        coach = await CoachService.get_coach_by_id(coach_id)
        if not coach:
            logger.warning(f"[Controller] Coach not found: {coach_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        return CoachResponseModel(
            success=True,
            message="Coach fetched successfully",
            data=CoachResponse.model_validate(coach)
        )

    @staticmethod
    async def get_all_coaches() -> CoachListResponseModel:
        coaches = await CoachService.get_all_coaches()

        return CoachListResponseModel(
            success=True,
            message="Coaches fetched successfully",
            data=[CoachResponse.model_validate(c) for c in coaches]
        )

    @staticmethod
    async def update_coach(coach_id: UUID, payload: CoachUpdate, current_user: dict) -> CoachResponseModel:
        if current_user["role"] == "coach" and str(coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own profile"
            )

        updated_coach = await CoachService.update_coach(
            coach_id,
            payload.full_name,
            payload.email,
            payload.password
        )

        if not updated_coach:
            logger.warning(f"[Controller] Tried to update non-existing coach: {coach_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        logger.info(f"[Controller] Coach updated: {coach_id}")

        return CoachResponseModel(
            success=True,
            message="Coach updated successfully",
            data=CoachResponse.model_validate(updated_coach)
        )
    

    @staticmethod
    async def delete_coach(coach_id: UUID) -> CoachResponseModel:
        deleted = await CoachService.delete_coach(coach_id)

        if not deleted:
            logger.warning(f"[Controller] Tried to delete non-existing coach: {coach_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coach not found"
            )

        logger.info(f"[Controller] Coach deleted: {coach_id}")

        return CoachResponseModel(
            success=True,
            message="Coach deleted successfully",
            data=None
        )
