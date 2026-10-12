"""
Consumes match.created and reservation.created events and creates in-app
notifications for the relevant users.
"""
import logging

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.match import Match
from app.models.reservation import Reservation
from app.models.request import Request
from app.models.resource import Resource
from app.models.notification import Notification
from app.workers.base import consume

logging.basicConfig(level=logging.INFO)
settings = get_settings()


def handle_match_created(payload: dict) -> None:
    db = SessionLocal()
    try:
        request = db.get(Request, payload["request_id"])
        if not request:
            return
        db.add(Notification(
            user_id=request.requester_id,
            type="match_created",
            message=f"We found {payload.get('match_count', 0)} candidate resource(s) for your request.",
        ))
        db.commit()
    finally:
        db.close()


def handle_reservation_created(payload: dict) -> None:
    db = SessionLocal()
    try:
        reservation = db.get(Reservation, payload["reservation_id"])
        if not reservation:
            return
        request = db.get(Request, reservation.request_id)
        resource = db.get(Resource, reservation.resource_id)
        if request:
            db.add(Notification(
                user_id=request.requester_id,
                type="reservation_created",
                message=f"A resource ({resource.name if resource else 'resource'}) has been reserved for your request.",
            ))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    # In production run one process per queue (or a multiplexed consumer); kept simple for the MVP demo.
    consume(settings.QUEUE_MATCH_CREATED, handle_match_created)
