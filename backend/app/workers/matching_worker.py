"""
Consumes request.created events, runs the matching engine, and publishes
match.created for the notification worker to pick up.
"""
import logging

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.rabbitmq import publish_event
from app.core.redis_client import acquire_lock, release_lock
from app.models.request import Request, RequestStatus
from app.models.status_history import StatusHistory
from app.services.matching import find_candidates
from app.workers.base import consume

logging.basicConfig(level=logging.INFO)
settings = get_settings()


def handle_request_created(payload: dict) -> None:
    request_id = payload["request_id"]
    lock_name = f"matching:{request_id}"
    if not acquire_lock(lock_name, ttl_seconds=30):
        return  # another worker instance is already handling this request

    db = SessionLocal()
    try:
        request = db.get(Request, request_id)
        if request is None or request.status != RequestStatus.OPEN:
            return

        matches = find_candidates(db, request)
        if matches:
            old_status = request.status.value
            request.status = RequestStatus.MATCHED
            db.add(StatusHistory(entity_type="request", entity_id=request.id,
                                  old_status=old_status, new_status=request.status.value))
            db.commit()
            publish_event(settings.QUEUE_MATCH_CREATED, {
                "request_id": str(request.id), "match_count": len(matches)
            })
    finally:
        db.close()
        release_lock(lock_name)


if __name__ == "__main__":
    consume(settings.QUEUE_REQUEST_CREATED, handle_request_created)
