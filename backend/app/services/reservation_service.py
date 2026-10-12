"""
Reservation creation is the critical section that must never double-allocate
a resource. We use a SELECT ... FOR UPDATE row lock on the resource inside a
transaction, then flip its status atomically (blueprint sections 11, 18).
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis_client import set_resource_availability
from app.models.resource import Resource, ResourceStatus
from app.models.request import Request, RequestStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.status_history import StatusHistory

settings = get_settings()


def create_reservation(db: Session, request_id: uuid.UUID, resource_id: uuid.UUID) -> Reservation:
    resource = db.scalar(select(Resource).where(Resource.id == resource_id).with_for_update())
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.status != ResourceStatus.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource is no longer available")

    request = db.get(Request, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    old_resource_status = resource.status.value
    resource.status = ResourceStatus.RESERVED
    db.add(StatusHistory(entity_type="resource", entity_id=resource.id,
                          old_status=old_resource_status, new_status=resource.status.value))

    old_request_status = request.status.value
    request.status = RequestStatus.RESERVED
    db.add(StatusHistory(entity_type="request", entity_id=request.id,
                          old_status=old_request_status, new_status=request.status.value))

    reservation = Reservation(
        request_id=request_id,
        resource_id=resource_id,
        status=ReservationStatus.ACTIVE,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.RESERVATION_HOLD_MINUTES),
    )
    db.add(reservation)

    db.commit()
    db.refresh(reservation)

    set_resource_availability(str(resource.id), resource.status.value)
    return reservation


def cancel_reservation(db: Session, reservation_id: uuid.UUID) -> Reservation:
    reservation = db.get(Reservation, reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.status != ReservationStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Only active reservations can be cancelled")

    reservation.status = ReservationStatus.CANCELLED

    resource = db.scalar(select(Resource).where(Resource.id == reservation.resource_id).with_for_update())
    if resource:
        old_status = resource.status.value
        resource.status = ResourceStatus.AVAILABLE
        db.add(StatusHistory(entity_type="resource", entity_id=resource.id,
                              old_status=old_status, new_status=resource.status.value))

    request = db.get(Request, reservation.request_id)
    if request:
        old_status = request.status.value
        request.status = RequestStatus.OPEN
        db.add(StatusHistory(entity_type="request", entity_id=request.id,
                              old_status=old_status, new_status=request.status.value))

    db.commit()
    db.refresh(reservation)

    if resource:
        set_resource_availability(str(resource.id), resource.status.value)
    return reservation
