from fastapi import APIRouter
from src.modules.admin.schema import AdminCreate, AdminResponse,AdminResponseModel
from src.modules.admin.controller import AdminController

router = APIRouter()

@router.post("/admins", response_model=AdminResponseModel, status_code=201)
async def create_admin(admin: AdminCreate):
    return await AdminController.create_admin(admin)