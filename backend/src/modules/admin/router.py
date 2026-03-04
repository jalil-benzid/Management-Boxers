from fastapi import APIRouter
from src.modules.admin.schema import AdminCreate, AdminResponseModel,AdminListResponseModel
from src.modules.admin.controller import AdminController
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=AdminResponseModel, status_code=201)
async def create_admin(admin: AdminCreate):
    return await AdminController.create_admin(admin)

@router.get("/{admin_id}", response_model=AdminResponseModel)
async def get_admin(admin_id: UUID):
    return await AdminController.get_admin_by_id(admin_id)

@router.get("/", response_model=AdminListResponseModel)
async def get_all_admins():
    return await AdminController.get_all_admins()

@router.put("/{admin_id}", response_model=AdminResponseModel)
async def update_admin(admin_id: UUID, email: str | None = None, password: str | None = None):
    return await AdminController.update_admin(admin_id, email, password)

@router.delete("/{admin_id}", response_model=AdminResponseModel)
async def delete_admin(admin_id: UUID):
    return await AdminController.delete_admin(admin_id)