from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging_setup import configure_logging

# uvicorn이 로깅을 설정한 뒤 앱을 불러오므로, 여기서 핸들러를 손본다.
configure_logging()

app = FastAPI(title="PUMSAE API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
