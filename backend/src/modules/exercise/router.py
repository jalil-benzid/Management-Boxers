from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.exercise.schema import ExerciseCreate, ExerciseUpdate, ExerciseResponseModel, ExerciseListResponseModel
from src.modules.exercise.controller import ExerciseController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/{session_id}/exercises", response_model=ExerciseResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def create_exercise(session_id: UUID, payload: ExerciseCreate, current_user: dict = Depends(get_current_user)):
    return await ExerciseController.create_exercise(session_id, payload, current_user)

@router.get("/{session_id}/exercises", response_model=ExerciseListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_all_exercises(session_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ExerciseController.get_all_exercises(session_id, current_user)

@router.get("/exercises/{exercise_id}", response_model=ExerciseResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_exercise(exercise_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ExerciseController.get_exercise_by_id(exercise_id, current_user)

@router.put("/exercises/{exercise_id}", response_model=ExerciseResponseModel, dependencies=[Depends(require_role("coach"))])
async def update_exercise(exercise_id: UUID, payload: ExerciseUpdate, current_user: dict = Depends(get_current_user)):
    return await ExerciseController.update_exercise(exercise_id, payload, current_user)

@router.delete("/exercises/{exercise_id}", response_model=ExerciseResponseModel, dependencies=[Depends(require_role("coach"))])
async def delete_exercise(exercise_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ExerciseController.delete_exercise(exercise_id, current_user)