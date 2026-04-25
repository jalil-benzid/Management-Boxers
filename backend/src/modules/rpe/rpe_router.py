from fastapi import APIRouter, Depends, Query
from uuid import UUID
from typing import Optional
from datetime import date

from src.modules.rpe.rpe_schema import (
    RPEEntryResponseModel,
    RPEEntryListResponseModel,
    RPEEntryCreate,
    RPEEntryUpdate,
    RPEStatsResponseModel
)
from src.modules.rpe.rpe_controller import RPEController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter(prefix="/rpe", tags=["RPE"])

@router.post("/", response_model=RPEEntryResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def create_rpe_entry(
    payload: RPEEntryCreate,
    current_user: dict = Depends(get_current_user)
):
    return await RPEController.create_entry(payload, current_user)

@router.get("/entries", response_model=RPEEntryListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_all_entries(current_user: dict = Depends(get_current_user)):
    return await RPEController.get_all_entries(current_user)

@router.get("/boxer/{boxer_id}", response_model=RPEEntryListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_boxer_entries(
    boxer_id: UUID,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    return await RPEController.get_boxer_entries(boxer_id, current_user, start_date, end_date)

@router.get("/entry/{entry_id}", response_model=RPEEntryResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_entry(entry_id: UUID, current_user: dict = Depends(get_current_user)):
    return await RPEController.get_entry(entry_id, current_user)

@router.put("/entry/{entry_id}", response_model=RPEEntryResponseModel, dependencies=[Depends(require_role("coach"))])
async def update_entry(
    entry_id: UUID,
    payload: RPEEntryUpdate,
    current_user: dict = Depends(get_current_user)
):
    return await RPEController.update_entry(entry_id, payload, current_user)

@router.delete("/entry/{entry_id}", response_model=RPEEntryResponseModel, dependencies=[Depends(require_role("coach"))])
async def delete_entry(entry_id: UUID, current_user: dict = Depends(get_current_user)):
    return await RPEController.delete_entry(entry_id, current_user)

@router.get("/stats/{boxer_id}", response_model=RPEStatsResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_boxer_stats(boxer_id: UUID, current_user: dict = Depends(get_current_user)):
    return await RPEController.get_boxer_stats(boxer_id, current_user)

    