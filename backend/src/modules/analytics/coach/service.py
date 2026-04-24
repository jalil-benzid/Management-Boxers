from sqlalchemy import select, func, and_
from datetime import datetime, date, timedelta

from src.db.database import AsyncSessionLocal as async_session

from src.modules.boxer.model import Boxer
from src.modules.session.model import Session
from src.modules.attendance.model import Attendance
from src.modules.exercise.model import Exercise


class CoachAnalyticsService:

    # -------------------------
    # DASHBOARD STATS
    # -------------------------
    @staticmethod
    async def get_dashboard_stats():
        async with async_session() as session:

            total_boxers = (await session.execute(
                select(func.count(Boxer.id))
            )).scalar()

            now = datetime.utcnow()
            start_week = now - timedelta(days=now.weekday())

            sessions_week = (await session.execute(
                select(func.count(Session.id)).where(
                    Session.session_date >= start_week.date()
                )
            )).scalar()

            total_sessions = (await session.execute(
                select(func.count(Session.id))
            )).scalar()

            total_attendance = (await session.execute(
                select(func.count(Attendance.id))
            )).scalar()

            avg_attendance = total_attendance / total_sessions if total_sessions else 0

            attendance_rate = 0
            if total_boxers > 0 and total_sessions > 0:
                attendance_rate = (total_attendance / (total_boxers * total_sessions)) * 100

            return {
                "total_boxers": total_boxers,
                "sessions_this_week": sessions_week,
                "attendance_rate": round(attendance_rate, 2),
                "avg_attendance": round(avg_attendance, 2)
            }

    # -------------------------
    # TODAY SESSIONS
    # -------------------------
    @staticmethod
    async def get_today_sessions():
        async with async_session() as session:

            today = date.today()

            result = await session.execute(
                select(Session).where(Session.session_date == today)
            )

            sessions = result.scalars().all()

            now = datetime.utcnow().time()

            response = []

            for s in sessions:
                if now > s.end_time:
                    status = "completed"
                elif s.start_time <= now <= s.end_time:
                    status = "ongoing"
                else:
                    status = "upcoming"

                response.append({
                    "id": str(s.id),
                    "name": s.name,
                    "start_time": str(s.start_time),
                    "end_time": str(s.end_time),
                    "status": status
                })

            return response

    # -------------------------
    # ONGOING SESSION DETAILS
    # -------------------------
    @staticmethod
    async def get_ongoing_session():
        async with async_session() as session:

            now = datetime.utcnow()

            result = await session.execute(
                select(Session).where(
                    and_(
                        Session.session_date == now.date(),
                        Session.start_time <= now.time(),
                        Session.end_time >= now.time()
                    )
                )
            )

            session_obj = result.scalars().first()

            if not session_obj:
                return None

            # exercises count
            exercises_count = (await session.execute(
                select(func.count(Exercise.id)).where(
                    Exercise.session_id == session_obj.id
                )
            )).scalar()

            # attendance
            present = (await session.execute(
                select(func.count(Attendance.id)).where(
                    Attendance.session_id == session_obj.id
                )
            )).scalar()

            # total boxers
            total_boxers = (await session.execute(
                select(func.count(Boxer.id))
            )).scalar()

            # remaining time
            end_dt = datetime.combine(session_obj.session_date, session_obj.end_time)
            remaining = int((end_dt - now).total_seconds() / 60)

            return {
                "session_id": str(session_obj.id),
                "name": session_obj.name,
                "start_time": str(session_obj.start_time),
                "end_time": str(session_obj.end_time),
                "exercises_count": exercises_count,
                "remaining_minutes": max(0, remaining),
                "present": present,
                "absent": max(0, total_boxers - present)
            }
        
