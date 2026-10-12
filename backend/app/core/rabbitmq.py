"""
Thin RabbitMQ helper used by the API to publish events and by workers to
consume them. Queues are declared durable; messages are published
persistent so they survive a broker restart (blueprint section 14/18).
"""
import json
import logging
from contextlib import contextmanager

import pika
from tenacity import retry, stop_after_attempt, wait_fixed

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("resqlink.rabbitmq")

ALL_QUEUES = [
    settings.QUEUE_REQUEST_CREATED,
    settings.QUEUE_MATCH_CREATED,
    settings.QUEUE_RESERVATION_CREATED,
    settings.QUEUE_RESERVATION_EXPIRED,
    settings.QUEUE_REQUEST_RESOLVED,
]


@retry(wait=wait_fixed(2), stop=stop_after_attempt(5))
def _connect() -> pika.BlockingConnection:
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)


@contextmanager
def get_channel():
    connection = _connect()
    channel = connection.channel()
    try:
        for queue in ALL_QUEUES:
            channel.queue_declare(queue=queue, durable=True)
        yield channel
    finally:
        connection.close()


def publish_event(queue: str, payload: dict) -> None:
    """Publish a JSON event to a durable queue as a persistent message."""
    try:
        with get_channel() as channel:
            channel.basic_publish(
                exchange="",
                routing_key=queue,
                body=json.dumps(payload, default=str),
                properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"),
            )
        logger.info("Published event to %s: %s", queue, payload)
    except Exception:  # pragma: no cover - broker may be unavailable in dev
        logger.exception("Failed to publish event to %s", queue)
