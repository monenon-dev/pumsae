import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _csv_env(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _normalize_database_url(url: str | None) -> str | None:
    # 설치된 드라이버는 psycopg2뿐이다. postgres:// 나 postgresql+psycopg://
    # (psycopg3) 형식으로 들어와도 psycopg2로 맞춰 ModuleNotFoundError를 막는다.
    if not url:
        return None
    for prefix in ("postgres://", "postgresql://", "postgresql+psycopg://"):
        if url.startswith(prefix):
            return "postgresql+psycopg2://" + url[len(prefix):]
    return url


class Settings:
    database_url: str | None
    jwt_secret: str
    jwt_refresh_secret: str
    access_token_ttl_minutes: int
    refresh_token_ttl_days: int
    cookie_secure: bool
    r2_account_id: str | None
    r2_access_key_id: str | None
    r2_secret_access_key: str | None
    r2_bucket_name: str | None
    r2_public_url: str | None
    cors_origins: list[str]

    def __init__(self) -> None:
        self.database_url = _normalize_database_url(os.getenv("DATABASE_URL"))
        self.jwt_secret = os.getenv("JWT_SECRET", "change-me")
        self.jwt_refresh_secret = os.getenv("JWT_REFRESH_SECRET", "change-me-too")
        self.access_token_ttl_minutes = int(os.getenv("JWT_ACCESS_TTL_MINUTES", "15"))
        self.refresh_token_ttl_days = int(os.getenv("JWT_REFRESH_TTL_DAYS", "14"))
        self.cookie_secure = os.getenv("COOKIE_SECURE", "false").lower() in {
            "1",
            "true",
            "yes",
        }
        self.r2_account_id = os.getenv("R2_ACCOUNT_ID") or None
        self.r2_access_key_id = os.getenv("R2_ACCESS_KEY_ID") or None
        self.r2_secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY") or None
        self.r2_bucket_name = os.getenv("R2_BUCKET_NAME") or None
        self.r2_public_url = (
            os.getenv("R2_PUBLIC_URL") or os.getenv("R2_PUBLIC_BASE_URL") or ""
        ).rstrip("/") or None
        self.cors_origins = _csv_env(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )


settings = Settings()
