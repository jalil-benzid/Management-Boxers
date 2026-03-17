from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.session.schema import SessionCreate, SessionUpdate, SessionResponseModel, SessionListResponseModel
from src.modules.session.controller import SessionController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/{schedule_id}/sessions", response_model=SessionResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def create_session(schedule_id: UUID, payload: SessionCreate, current_user: dict = Depends(get_current_user)):
    return await SessionController.create_session(schedule_id, payload, current_user)

@router.get("/{schedule_id}/sessions", response_model=SessionListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_all_sessions(schedule_id: UUID, current_user: dict = Depends(get_current_user)):
    return await SessionController.get_all_sessions(schedule_id, current_user)

@router.get("/sessions/{session_id}", response_model=SessionResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_session(session_id: UUID, current_user: dict = Depends(get_current_user)):
    return await SessionController.get_session_by_id(session_id, current_user)

@router.put("/sessions/{session_id}", response_model=SessionResponseModel, dependencies=[Depends(require_role("coach"))])
async def update_session(session_id: UUID, payload: SessionUpdate, current_user: dict = Depends(get_current_user)):
    return await SessionController.update_session(session_id, payload, current_user)

@router.delete("/sessions/{session_id}", response_model=SessionResponseModel, dependencies=[Depends(require_role("coach"))])
async def delete_session(session_id: UUID, current_user: dict = Depends(get_current_user)):
    return await SessionController.delete_session(session_id, current_user)