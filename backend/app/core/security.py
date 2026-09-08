from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

from app.core.config import settings

ALGORITHM = "HS256"
TokenType = Literal["access", "refresh"]


class TokenError(Exception):
    def __init__(self, kind: Literal["expired", "invalid"]) -> None:
        self.kind = kind
        super().__init__(kind)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False


def _encode(subject: str, token_type: TokenType, ttl: timedelta, secret: str) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _encode(
        user_id,
        "access",
        timedelta(minutes=settings.access_token_ttl_minutes),
        settings.jwt_secret,
    )


def create_refresh_token(user_id: str) -> str:
    return _encode(
        user_id,
        "refresh",
        timedelta(days=settings.refresh_token_ttl_days),
        settings.jwt_refresh_secret,
    )


def decode_token(token: str, *, secret: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    except ExpiredSignatureError as exc:
        raise TokenError("expired") from exc
    except JWTError as exc:
        raise TokenError("invalid") from exc

    if payload.get("type") != expected_type or not payload.get("sub"):
        raise TokenError("invalid")

    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    return decode_token(token, secret=settings.jwt_secret, expected_type="access")


def decode_refresh_token(token: str) -> dict[str, Any]:
    return decode_token(
        token,
        secret=settings.jwt_refresh_secret,
        expected_type="refresh",
    )
