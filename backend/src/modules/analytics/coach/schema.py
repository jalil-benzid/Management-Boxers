from pydantic import BaseModel
from typing import List, Optional


class CoachDashboardStats(BaseModel):
    total_boxers: int
    sessions_this_week: int
    attendance_rate: float
    avg_attendance: float


class TodaySessionItem(BaseModel):
    id: str
    name: str
    start_time: str
    end_time: str
    status: str  # completed | ongoing | upcoming


class TodaySessionsResponse(BaseModel):
    success: bool
    message: str
    data: List[TodaySessionItem]


class OngoingSession(BaseModel):
    session_id: str
    name: str
    start_time: str
    end_time: str
    exercises_count: int
    remaining_minutes: int
    present: int
    absent: int


class OngoingSessionResponse(BaseModel):
    success: bool
    message: str
    data: Optional[OngoingSession]

    