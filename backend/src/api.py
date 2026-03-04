from fastapi import APIRouter
from src.modules.test.router import router as test_router

api_router = APIRouter()
api_router.include_router(test_router)