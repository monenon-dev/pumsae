from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.dojangs import router as dojangs_router
from app.api.health import router as health_router
from app.api.trials import router as trials_router
from app.api.uploads import router as uploads_router
from app.api.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(dojangs_router)
api_router.include_router(dashboard_router)
api_router.include_router(uploads_router)
api_router.include_router(trials_router)
api_router.include_router(ws_router)
