from fastapi import HTTPException, status, UploadFile
from uuid import UUID

from src.modules.boxer.schema import (
    BoxerResponse,
    BoxerResponseModel,
    BoxerListResponseModel,
    BoxerUpdate
)
from src.modules.boxer.service import BoxerService
from src.modules.boxer.utils.logger import logger


class BoxerController:

    @staticmethod
    async def create_boxer(first_name: str, last_name: str, email: str, password: str, current_user: dict, picture: UploadFile | None = None) -> BoxerResponseModel:
        existing = await BoxerService.get_boxer_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        coach_id = UUID(current_user["id"])

        new_boxer = await BoxerService.create_boxer(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            coach_id=coach_id,
            picture=picture
        )

        return BoxerResponseModel(
            success=True,
            message="Boxer created successfully",
            data=BoxerResponse.model_validate(new_boxer)
        )

    @staticmethod
    async def get_boxer_by_id(boxer_id: UUID, current_user: dict) -> BoxerResponseModel:
        boxer = await BoxerService.get_boxer_by_id(boxer_id)

        if not boxer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Boxer not found"
            )

        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this boxer"
            )

        return BoxerResponseModel(
            success=True,
            message="Boxer fetched successfully",
            data=BoxerResponse.model_validate(boxer)
        )

    @staticmethod
    async def get_all_boxers(current_user: dict) -> BoxerListResponseModel:
        coach_id = UUID(current_user["id"])
        boxers = await BoxerService.get_all_boxers_by_coach(coach_id)

        return BoxerListResponseModel(
            success=True,
            message="Boxers fetched successfully",
            data=[BoxerResponse.model_validate(b) for b in boxers]
        )

    @staticmethod
    async def update_boxer(boxer_id: UUID, payload: BoxerUpdate, current_user: dict, picture: UploadFile | None = None) -> BoxerResponseModel:
        boxer = await BoxerService.get_boxer_by_id(boxer_id)

        if not boxer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Boxer not found"
            )

        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this boxer"
            )

        updated_boxer = await BoxerService.update_boxer(
            boxer_id,
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            password=payload.password,
            picture=picture
        )

        logger.info(f"[Controller] Boxer updated: {boxer_id}")

        return BoxerResponseModel(
            success=True,
            message="Boxer updated successfully",
            data=BoxerResponse.model_validate(updated_boxer)
        )

    @staticmethod
    async def delete_boxer(boxer_id: UUID, current_user: dict) -> BoxerResponseModel:
        boxer = await BoxerService.get_boxer_by_id(boxer_id)

        if not boxer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Boxer not found"
            )

        if str(boxer.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this boxer"
            )

        await BoxerService.delete_boxer(boxer_id)

        logger.info(f"[Controller] Boxer deleted: {boxer_id}")

        return BoxerResponseModel(
            success=True,
            message="Boxer deleted successfully",
            data=None
        )