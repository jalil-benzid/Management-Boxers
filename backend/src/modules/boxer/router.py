from fastapi import APIRouter, Depends, File, UploadFile, Form
from uuid import UUID
from typing import Optional

from src.modules.boxer.schema import BoxerResponseModel, BoxerListResponseModel, BoxerUpdate
from src.modules.boxer.controller import BoxerController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/", response_model=BoxerResponseModel, status_code=201, dependencies=[Depends(require_role("coach"))])
async def create_boxer(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    picture: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    return await BoxerController.create_boxer(first_name, last_name, email, password, current_user, picture)

@router.get("/", response_model=BoxerListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_all_boxers(current_user: dict = Depends(get_current_user)):
    return await BoxerController.get_all_boxers(current_user)

@router.get("/{boxer_id}", response_model=BoxerResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_boxer(boxer_id: UUID, current_user: dict = Depends(get_current_user)):
    return await BoxerController.get_boxer_by_id(boxer_id, current_user)

@router.put("/{boxer_id}", response_model=BoxerResponseModel, dependencies=[Depends(require_role("coach"))])
async def update_boxer(
    boxer_id: UUID,
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    picture: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    payload = BoxerUpdate(first_name=first_name, last_name=last_name, email=email, password=password)
    return await BoxerController.update_boxer(boxer_id, payload, current_user, picture)

@router.delete("/{boxer_id}", response_model=BoxerResponseModel, dependencies=[Depends(require_role("coach"))])
async def delete_boxer(boxer_id: UUID, current_user: dict = Depends(get_current_user)):
    return await BoxerController.delete_boxer(boxer_id, current_user)