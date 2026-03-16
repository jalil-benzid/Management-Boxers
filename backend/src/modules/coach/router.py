from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.coach.schema import CoachCreate, CoachResponseModel, CoachListResponseModel
from src.modules.coach.controller import CoachController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user
from src.modules.coach.schema import CoachCreate, CoachUpdate, CoachResponseModel, CoachListResponseModel


router = APIRouter()

@router.post("/", response_model=CoachResponseModel, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_coach(coach: CoachCreate):
    return await CoachController.create_coach(coach)

@router.get("/", response_model=CoachListResponseModel, dependencies=[Depends(require_role("admin"))])
async def get_all_coaches():
    return await CoachController.get_all_coaches()

@router.get("/{coach_id}", response_model=CoachResponseModel)
async def get_coach(coach_id: UUID, current_user: dict = Depends(get_current_user)):
    return await CoachController.get_coach_by_id(coach_id, current_user)

@router.put("/{coach_id}", response_model=CoachResponseModel)
async def update_coach(coach_id: UUID, payload: CoachUpdate, current_user: dict = Depends(get_current_user)):
    return await CoachController.update_coach(coach_id, payload, current_user)

@router.delete("/{coach_id}", response_model=CoachResponseModel, dependencies=[Depends(require_role("admin"))])
async def delete_coach(coach_id: UUID):
    return await CoachController.delete_coach(coach_id)

