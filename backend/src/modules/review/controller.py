from fastapi import HTTPException, status
from uuid import UUID

from src.modules.review.schema import (
    ReviewCreate,
    ReviewResponse,
    ReviewResponseModel,
    ReviewListResponseModel
)
from src.modules.review.service import ReviewService
from src.modules.attendance.service import AttendanceService
from src.modules.session.service import SessionService
from src.modules.schedule.service import ScheduleService
from src.modules.review.utils.logger import logger


class ReviewController:

    @staticmethod
    async def create_review(session_id: UUID, payload: ReviewCreate, current_user: dict) -> ReviewResponseModel:
        boxer_id = UUID(current_user["id"])

        # boxer must have attended the session
        attendances = await AttendanceService.get_attendance_by_session(session_id)
        boxer_ids = [str(a.boxer_id) for a in attendances]
        if str(boxer_id) not in boxer_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only review sessions you attended"
            )

        # boxer can only review once per session
        existing = await ReviewService.get_review_by_boxer_and_session(boxer_id, session_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this session"
            )

        new_review = await ReviewService.create_review(
            session_id=session_id,
            boxer_id=boxer_id,
            difficulty=payload.difficulty,
            comment=payload.comment
        )

        return ReviewResponseModel(
            success=True,
            message="Review submitted successfully",
            data=ReviewResponse.model_validate(new_review)
        )

    @staticmethod
    async def get_reviews_by_session(session_id: UUID, current_user: dict) -> ReviewListResponseModel:
        # coach must own the session
        session = await SessionService.get_session_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        schedule = await ScheduleService.get_schedule_by_id(session.schedule_id)
        if str(schedule.coach_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this session"
            )

        reviews = await ReviewService.get_reviews_by_session(session_id)

        return ReviewListResponseModel(
            success=True,
            message="Reviews fetched successfully",
            data=[ReviewResponse.model_validate(r) for r in reviews]
        )

    @staticmethod
    async def delete_review(review_id: UUID, current_user: dict) -> ReviewResponseModel:
        review = await ReviewService.get_review_by_id(review_id)
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )

        # only the boxer who created it can delete it
        if str(review.boxer_id) != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own reviews"
            )

        await ReviewService.delete_review(review_id)

        logger.info(f"[Controller] Review deleted: {review_id}")

        return ReviewResponseModel(
            success=True,
            message="Review deleted successfully",
            data=None
        )