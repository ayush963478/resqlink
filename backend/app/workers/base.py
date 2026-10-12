"""
Shared consumer loop: declares durable queues, acks only after successful
processing, and nacks (without requeue) to a dead-letter path on repeated
failure -- blueprint section 14/18 (idempotent workers, DLQ).
"""
import json
import logging

import pika
from tenacity import retry, stop_after_attempt, wait_fixed

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("resqlink.worker")


@retry(wait=wait_fixed(2), stop=stop_after_attempt(10))
def _connect() -> pika.BlockingConnection:
    return pika.BlockingConnection(pika.URLParameters(settings.RABBITMQ_URL))


def consume(queue_name: str, handler, prefetch: int = 10):
    connection = _connect()
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    channel.basic_qos(prefetch_count=prefetch)

    def _on_message(ch, method, properties, body):
        try:
            payload = json.loads(body)
            handler(payload)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("Failed to process message on %s, sending to DLQ path", queue_name)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=queue_name, on_message_callback=_on_message)
    logger.info("Worker listening on queue: %s", queue_name)
    channel.start_consuming()
