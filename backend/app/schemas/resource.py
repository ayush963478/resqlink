import uuid
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.resource import ResourceStatus


class ResourceCreate(BaseModel):
    organization_id: uuid.UUID
    type: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=200)
    capacity: int = Field(default=1, ge=1)
    latitude: float | None = None
    longitude: float | None = None


class ResourceStatusUpdate(BaseModel):
    status: ResourceStatus


class ResourceOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    type: str
    name: str
    status: ResourceStatus
    capacity: int
    latitude: float | None
    longitude: float | None
    is_eligible: bool
    updated_at: datetime

    class Config:
        from_attributes = True
