from src.modules.analytics.coach.service import CoachAnalyticsService
from src.modules.analytics.coach.schema import (
    CoachDashboardStats,
    TodaySessionsResponse,
    OngoingSessionResponse
)


class CoachAnalyticsController:

    @staticmethod
    async def dashboard():
        data = await CoachAnalyticsService.get_dashboard_stats()
        return {
            "success": True,
            "message": "Coach dashboard stats fetched",
            "data": data
        }

    @staticmethod
    async def today_sessions():
        data = await CoachAnalyticsService.get_today_sessions()

        return TodaySessionsResponse(
            success=True,
            message="Today sessions fetched",
            data=data
        )

    @staticmethod
    async def ongoing_session():
        data = await CoachAnalyticsService.get_ongoing_session()

        return OngoingSessionResponse(
            success=True,
            message="Ongoing session fetched",
            data=data
        )


