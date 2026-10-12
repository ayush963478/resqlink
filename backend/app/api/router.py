from fastapi import APIRouter

from app.api.routes import auth, organizations, resources, requests, reservations, notifications, dashboard

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(organizations.router)
api_router.include_router(resources.router)
api_router.include_router(requests.router)
api_router.include_router(reservations.router)
api_router.include_router(notifications.router)
api_router.include_router(dashboard.router)
