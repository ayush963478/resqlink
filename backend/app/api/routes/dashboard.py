from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.models.request import Request, RequestStatus
from app.models.resource import Resource, ResourceStatus
from app.models.reservation import Reservation

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.COORDINATOR, UserRole.ADMINISTRATOR)),
):
    """Operational analytics: counts by status, used by the coordinator/admin dashboards."""
    requests_by_status = dict(
        db.execute(select(Request.status, func.count()).group_by(Request.status)).all()
    )
    resources_by_status = dict(
        db.execute(select(Resource.status, func.count()).group_by(Resource.status)).all()
    )
    active_reservations = db.scalar(
        select(func.count()).select_from(Reservation).where(Reservation.status == "active")
    )
    open_requests = requests_by_status.get(RequestStatus.OPEN, 0)
    available_resources = resources_by_status.get(ResourceStatus.AVAILABLE, 0)

    return {
        "requests_by_status": {k.value if hasattr(k, "value") else k: v for k, v in requests_by_status.items()},
        "resources_by_status": {k.value if hasattr(k, "value") else k: v for k, v in resources_by_status.items()},
        "active_reservations": active_reservations or 0,
        "open_requests": open_requests,
        "available_resources": available_resources,
    }
