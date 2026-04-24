from fastapi import APIRouter, Depends
from src.middlewares.authorization import require_role

from src.modules.analytics.coach.controller import CoachAnalyticsController

router = APIRouter()


@router.get("/dashboard", dependencies=[Depends(require_role("coach"))])
async def dashboard():
    return await CoachAnalyticsController.dashboard()


@router.get("/today-sessions", dependencies=[Depends(require_role("coach"))])
async def today_sessions():
    return await CoachAnalyticsController.today_sessions()


@router.get("/ongoing-session", dependencies=[Depends(require_role("coach"))])
async def ongoing_session():
    return await CoachAnalyticsController.ongoing_session()

