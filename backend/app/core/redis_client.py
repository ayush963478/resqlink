"""
Redis is used ONLY for fast-changing live state, caching and rate limiting.
It is never the source of truth for allocation (PostgreSQL is) -- see
blueprint section 13.
"""
import redis

from app.core.config import get_settings

settings = get_settings()

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def set_resource_availability(resource_id: str, status: str) -> None:
    key = f"resource:{resource_id}:availability"
    redis_client.set(key, status, ex=settings.REDIS_AVAILABILITY_TTL_SECONDS)


def get_resource_availability(resource_id: str) -> str | None:
    return redis_client.get(f"resource:{resource_id}:availability")


def acquire_lock(name: str, ttl_seconds: int = 10) -> bool:
    """Short-lived lock used to avoid duplicate matching work on the same request."""
    return bool(redis_client.set(f"lock:{name}", "1", nx=True, ex=ttl_seconds))


def release_lock(name: str) -> None:
    redis_client.delete(f"lock:{name}")
