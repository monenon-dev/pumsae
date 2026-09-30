import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging_setup import configure_logging
from app.core.retention import run_retention_loop

# uvicorn이 로깅을 설정한 뒤 앱을 불러오므로, 여기서 핸들러를 손본다.
configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # 보관 기간이 지난 체험 신청을 하루 한 번 지운다(개인정보처리방침).
    task = asyncio.create_task(run_retention_loop())
    yield
    task.cancel()


app = FastAPI(title="PUMSAE API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
