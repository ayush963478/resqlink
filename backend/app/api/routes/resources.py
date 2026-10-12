"""
Resource registration and status updates. Providers manage their own
organization's resources; status changes update PostgreSQL (durable) and
Redis (fast-changing live state) together, and are recorded in
status_history for audit (blueprint sections 10, 13).
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.core.redis_client import set_resource_availability
from app.api.deps import require_roles, get_current_user
from app.models.resource import Resource, ResourceStatus
from app.models.status_history import StatusHistory
from app.models.user import UserRole, User
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceStatusUpdate

router = APIRouter(prefix="/resources", tags=["resources"])


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.PROVIDER, UserRole.ADMINISTRATOR)),
):
    resource = Resource(**payload.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    set_resource_availability(str(resource.id), resource.status.value)
    return resource


@router.get("", response_model=list[ResourceOut])
def search_resources(
    type: str | None = None,
    status_filter: ResourceStatus | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(Resource).where(Resource.is_eligible.is_(True))
    if type:
        query = query.where(Resource.type == type)
    if status_filter:
        query = query.where(Resource.status == status_filter)
    return db.scalars(query).all()


@router.patch("/{resource_id}/status", response_model=ResourceOut)
def update_resource_status(
    resource_id: uuid.UUID,
    payload: ResourceStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.PROVIDER, UserRole.ADMINISTRATOR)),
):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    old_status = resource.status.value
    resource.status = payload.status
    db.add(StatusHistory(entity_type="resource", entity_id=resource.id,
                          old_status=old_status, new_status=payload.status.value))
    db.commit()
    db.refresh(resource)

    set_resource_availability(str(resource.id), resource.status.value)
    return resource
