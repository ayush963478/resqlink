import uuid
from datetime import datetime
from pydantic import BaseModel

from app.models.reservation import ReservationStatus


class ReservationCreate(BaseModel):
    request_id: uuid.UUID
    resource_id: uuid.UUID


class ReservationOut(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    resource_id: uuid.UUID
    status: ReservationStatus
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
