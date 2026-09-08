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
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
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
