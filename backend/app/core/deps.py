from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import TokenError, decode_access_token
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(creds.credentials)
        user_id = uuid.UUID(str(payload["sub"]))
    except (TokenError, ValueError) as exc:
        kind = getattr(exc, "kind", "invalid")
        message = (
            "액세스 토큰이 만료되었습니다."
            if kind == "expired"
            else "유효하지 않은 액세스 토큰입니다."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_staff_user(user: User = Depends(get_current_user)) -> User:
    if user.dojang_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="소속 체육관이 없습니다.",
        )
    return user


def get_owner_user(user: User = Depends(get_staff_user)) -> User:
    if user.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관장만 수정할 수 있습니다.",
        )
    return user
