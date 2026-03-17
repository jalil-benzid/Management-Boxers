from fastapi import APIRouter, Depends
from uuid import UUID

from src.modules.review.schema import ReviewCreate, ReviewResponseModel, ReviewListResponseModel
from src.modules.review.controller import ReviewController
from src.middlewares.authorization import require_role
from src.middlewares.authentication import get_current_user

router = APIRouter()

@router.post("/{session_id}/reviews", response_model=ReviewResponseModel, status_code=201, dependencies=[Depends(require_role("boxer"))])
async def create_review(session_id: UUID, payload: ReviewCreate, current_user: dict = Depends(get_current_user)):
    return await ReviewController.create_review(session_id, payload, current_user)

@router.get("/{session_id}/reviews", response_model=ReviewListResponseModel, dependencies=[Depends(require_role("coach"))])
async def get_reviews(session_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ReviewController.get_reviews_by_session(session_id, current_user)

@router.delete("/reviews/{review_id}", response_model=ReviewResponseModel, dependencies=[Depends(require_role("boxer"))])
async def delete_review(review_id: UUID, current_user: dict = Depends(get_current_user)):
    return await ReviewController.delete_review(review_id, current_user)