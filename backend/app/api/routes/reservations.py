import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rabbitmq import publish_event
from app.core.config import get_settings
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.reservation import ReservationCreate, ReservationOut
from app.services.reservation_service import create_reservation, cancel_reservation

router = APIRouter(prefix="/reservations", tags=["reservations"])
settings = get_settings()


@router.post("", response_model=ReservationOut, status_code=201)
def reserve(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.PROVIDER, UserRole.COORDINATOR, UserRole.ADMINISTRATOR)),
):
    reservation = create_reservation(db, payload.request_id, payload.resource_id)
    publish_event(settings.QUEUE_RESERVATION_CREATED, {"reservation_id": str(reservation.id)})
    return reservation


@router.post("/{reservation_id}/cancel", response_model=ReservationOut)
def cancel(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.PROVIDER, UserRole.COORDINATOR, UserRole.ADMINISTRATOR)),
):
    return cancel_reservation(db, reservation_id)
