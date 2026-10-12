from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import require_roles, get_current_user
from app.models.organization import Organization
from app.models.user import UserRole, User
from app.schemas.organization import OrganizationCreate, OrganizationOut

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.ADMINISTRATOR, UserRole.PROVIDER)),
):
    org = Organization(name=payload.name, type=payload.type, address=payload.address)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.get("", response_model=list[OrganizationOut])
def list_organizations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Organization)).all()
