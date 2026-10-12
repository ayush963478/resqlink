"""
Deterministic, explainable matching engine (blueprint section 12).
No machine learning in V1: candidates are scored using simple, tunable
weighted factors so the UI can always explain *why* a match was made.
"""
import math

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resource import Resource, ResourceStatus
from app.models.request import Request, UrgencyLevel
from app.models.match import Match

# Configurable weights -- tune without changing matching logic.
WEIGHTS = {
    "distance": 0.4,
    "urgency": 0.3,
    "capacity_fit": 0.3,
}

URGENCY_SCORE = {
    UrgencyLevel.LOW: 0.25,
    UrgencyLevel.MEDIUM: 0.5,
    UrgencyLevel.HIGH: 0.75,
    UrgencyLevel.CRITICAL: 1.0,
}


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def find_candidates(db: Session, request: Request, limit: int = 5) -> list[Match]:
    """
    Hard requirements: same resource type, AVAILABLE status, eligible
    provider, sufficient capacity. Soft factors (distance, urgency,
    capacity fit) produce a 0-1 explainable score.
    """
    query = select(Resource).where(
        Resource.type == request.type,
        Resource.status == ResourceStatus.AVAILABLE,
        Resource.is_eligible.is_(True),
        Resource.capacity >= request.required_capacity,
    )
    candidates = db.scalars(query).all()

    scored = []
    for resource in candidates:
        reasons = []

        if (request.latitude is not None and request.longitude is not None and
                resource.latitude is not None and resource.longitude is not None):
            distance_km = _haversine_km(request.latitude, request.longitude, resource.latitude, resource.longitude)
            distance_score = max(0.0, 1.0 - min(distance_km, 50) / 50)
            reasons.append(f"{distance_km:.1f} km away")
        else:
            distance_score = 0.5
            reasons.append("location unknown")

        urgency_score = URGENCY_SCORE.get(request.urgency, 0.5)
        reasons.append(f"urgency={request.urgency.value}")

        capacity_fit = min(request.required_capacity / resource.capacity, 1.0) if resource.capacity else 0
        reasons.append(f"capacity {resource.capacity} for required {request.required_capacity}")

        total = (
            WEIGHTS["distance"] * distance_score
            + WEIGHTS["urgency"] * urgency_score
            + WEIGHTS["capacity_fit"] * capacity_fit
        )
        scored.append((resource, total, "; ".join(reasons)))

    scored.sort(key=lambda x: x[1], reverse=True)

    matches = []
    for resource, score, reason in scored[:limit]:
        match = Match(request_id=request.id, resource_id=resource.id, score=round(score, 4), reason=reason)
        db.add(match)
        matches.append(match)

    if matches:
        db.commit()
        for m in matches:
            db.refresh(m)

    return matches
