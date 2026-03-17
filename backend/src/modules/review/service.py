from sqlalchemy.future import select
from uuid import UUID

from src.db.database import AsyncSessionLocal as async_session
from src.modules.review.model import Review, DifficultyLevel
from src.modules.review.utils.logger import logger


class ReviewService:

    @staticmethod
    async def create_review(session_id: UUID, boxer_id: UUID, difficulty: DifficultyLevel, comment: str | None = None) -> Review:
        try:
            new_review = Review(
                session_id=session_id,
                boxer_id=boxer_id,
                difficulty=difficulty,
                comment=comment
            )

            async with async_session() as db:
                async with db.begin():
                    db.add(new_review)
                await db.refresh(new_review)

            logger.info(f"[Service] Review created for session: {session_id} by boxer: {boxer_id}")
            return new_review

        except Exception as e:
            logger.error(f"[Service] Failed to create review: {str(e)}")
            raise

    @staticmethod
    async def get_review_by_id(review_id: UUID) -> Review | None:
        try:
            async with async_session() as db:
                result = await db.execute(select(Review).where(Review.id == review_id))
                review = result.scalars().first()
                return review
        except Exception as e:
            logger.error(f"[Service] Error fetching review by id ({review_id}): {str(e)}")
            raise

    @staticmethod
    async def get_reviews_by_session(session_id: UUID) -> list[Review]:
        try:
            async with async_session() as db:
                result = await db.execute(select(Review).where(Review.session_id == session_id))
                reviews = result.scalars().all()
                logger.info(f"[Service] Fetched reviews for session: {session_id} (count: {len(reviews)})")
                return reviews
        except Exception as e:
            logger.error(f"[Service] Error fetching reviews for session ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def get_review_by_boxer_and_session(boxer_id: UUID, session_id: UUID) -> Review | None:
        try:
            async with async_session() as db:
                result = await db.execute(
                    select(Review).where(
                        Review.boxer_id == boxer_id,
                        Review.session_id == session_id
                    )
                )
                return result.scalars().first()
        except Exception as e:
            logger.error(f"[Service] Error fetching review for boxer ({boxer_id}) session ({session_id}): {str(e)}")
            raise

    @staticmethod
    async def delete_review(review_id: UUID) -> bool:
        try:
            async with async_session() as db:
                async with db.begin():
                    result = await db.execute(select(Review).where(Review.id == review_id))
                    review = result.scalars().first()
                    if not review:
                        return False
                    await db.delete(review)

                logger.info(f"[Service] Deleted review: {review_id}")
                return True
        except Exception as e:
            logger.error(f"[Service] Failed to delete review ({review_id}): {str(e)}")
            raise