"""
Consumes request.resolved events to keep lightweight response-time analytics.
Kept separate from raw logs per blueprint section 22 (business metrics
separate from logs).
"""
import logging

from app.core.config import get_settings
from app.workers.base import consume

logging.basicConfig(level=logging.INFO)
settings = get_settings()
logger = logging.getLogger("resqlink.analytics")


def handle_request_resolved(payload: dict) -> None:
    # Placeholder: in a full build this would update a metrics/aggregate table.
    logger.info("Request resolved: %s", payload)


if __name__ == "__main__":
    consume(settings.QUEUE_REQUEST_RESOLVED, handle_request_resolved)
