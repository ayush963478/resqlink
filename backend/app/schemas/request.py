import uuid
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.request import UrgencyLevel, RequestStatus


class RequestCreate(BaseModel):
    type: str = Field(min_length=1, max_length=100)
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    required_capacity: int = Field(default=1, ge=1)
    latitude: float | None = None
    longitude: float | None = None
    location_text: str | None = None
    notes: str | None = None


class RequestOut(BaseModel):
    id: uuid.UUID
    requester_id: uuid.UUID
    type: str
    urgency: UrgencyLevel
    required_capacity: int
    latitude: float | None
    longitude: float | None
    location_text: str | None
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True


class MatchOut(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    resource_id: uuid.UUID
    score: float
    reason: str | None
    status: str

    class Config:
        from_attributes = True
