import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.core.rabbitmq import publish_event
from app.core.config import get_settings
from app.api.deps import get_current_user, require_roles
from app.models.request import Request, RequestStatus
from app.models.status_history import StatusHistory
from app.models.user import User, UserRole
from app.schemas.request import RequestCreate, RequestOut, MatchOut
from app.services.matching import find_candidates

router = APIRouter(prefix="/requests", tags=["requests"])
settings = get_settings()


@router.post("", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
def create_request(payload: RequestCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = Request(requester_id=user.id, **payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)

    db.add(StatusHistory(entity_type="request", entity_id=request.id, old_status=None, new_status=request.status.value))
    db.commit()

    # Hand off to the async matching worker instead of blocking the API response.
    publish_event(settings.QUEUE_REQUEST_CREATED, {"request_id": str(request.id)})
    return request


@router.get("", response_model=list[RequestOut])
def list_requests(mine: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(Request)
    if mine or user.role == UserRole.REQUESTER:
        query = query.where(Request.requester_id == user.id)
    query = query.order_by(Request.created_at.desc())
    return db.scalars(query).all()


@router.get("/{request_id}", response_model=RequestOut)
def get_request(request_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("/{request_id}/match", response_model=list[MatchOut])
def match_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.COORDINATOR, UserRole.ADMINISTRATOR, UserRole.REQUESTER)),
):
    """Synchronous match trigger (in production the worker also runs this on request.created)."""
    request = db.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    matches = find_candidates(db, request)
    if matches and request.status == RequestStatus.OPEN:
        old_status = request.status.value
        request.status = RequestStatus.MATCHED
        db.add(StatusHistory(entity_type="request", entity_id=request.id,
                              old_status=old_status, new_status=request.status.value))
        db.commit()
        publish_event(settings.QUEUE_MATCH_CREATED, {"request_id": str(request.id), "match_count": len(matches)})
    return matches
