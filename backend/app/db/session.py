from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        if not settings.database_url:
            raise RuntimeError(
                "DATABASE_URL 이 없습니다. backend/.env 에 Neon 연결 문자열을 넣어 주세요.",
            )
        # pool_pre_ping은 요청마다 DB에 "살아 있나" 확인 쿼리를 한 번 더 보낸다.
        # 서버와 DB가 멀면 그 왕복만큼 모든 요청이 느려져서, 대신 오래된 연결을
        # 꺼낼 때 새로 맺도록 pool_recycle을 쓴다. Neon은 5분 동안 요청이 없으면
        # DB를 재우며 연결을 끊으므로, 그보다 짧은 4분이 지난 연결은 다시 연다.
        _engine = create_engine(
            settings.database_url,
            pool_recycle=240,
            connect_args={"sslmode": "require"},
        )
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()
