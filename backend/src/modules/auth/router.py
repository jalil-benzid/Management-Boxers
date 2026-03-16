from fastapi import APIRouter
from src.modules.auth.schema import LoginRequest, AuthResponseModel
from src.modules.auth.controller import AuthController

router = APIRouter()

@router.post("/admin/login", response_model=AuthResponseModel)
async def admin_login(payload: LoginRequest):
    return await AuthController.login(payload)

@router.post("/coach/login", response_model=AuthResponseModel)
async def coach_login(payload: LoginRequest):
    return await AuthController.login_coach(payload)

@router.post("/boxer/login", response_model=AuthResponseModel)
async def boxer_login(payload: LoginRequest):
    return await AuthController.login_boxer(payload)