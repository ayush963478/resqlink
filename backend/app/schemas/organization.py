import uuid
from pydantic import BaseModel, Field

from app.models.organization import OrganizationStatus


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    type: str = Field(min_length=1, max_length=100)
    address: str | None = None


class OrganizationOut(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    address: str | None
    status: OrganizationStatus

    class Config:
        from_attributes = True
