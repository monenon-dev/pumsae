from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.core.slug import build_dojang_slug
from app.db.session import get_db
from app.models import Dojang, User
from app.models.enums import UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterBody(BaseModel):
    dojangName: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=80)
    email: str
    password: str = Field(max_length=72)

    @field_validator("dojangName", "name", "email")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.lower()
        if not EMAIL_RE.match(email):
            raise ValueError("올바른 이메일 주소를 입력해 주세요.")
        return email

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("비밀번호는 6자 이상이어야 합니다.")
        return value


class LoginBody(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str
    role: UserRole
    dojangId: uuid.UUID | None = None

    @classmethod
    def from_user(cls, user: User) -> UserOut:
        return cls(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            dojangId=user.dojang_id,
        )


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: UserOut


def _refresh_max_age() -> int:
    return settings.refresh_token_ttl_days * 24 * 60 * 60


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=_refresh_max_age(),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE,
        path="/auth",
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        accessToken=create_access_token(str(user.id)),
        expiresIn=settings.access_token_ttl_minutes * 60,
        user=UserOut.from_user(user),
    )


def _issue_auth(response: Response, user: User) -> TokenResponse:
    payload = _token_response(user)
    _set_refresh_cookie(response, create_refresh_token(str(user.id)))
    return payload


def _conflict_detail(exc: IntegrityError) -> str:
    orig = str(getattr(exc, "orig", exc)).lower()
    if "email" in orig or "users_email" in orig:
        return "이미 가입된 이메일입니다."
    return "체육관 주소를 만들지 못했습니다. 다시 시도해 주세요."


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    body: RegisterBody,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    existing = db.scalar(select(User.id).where(User.email == body.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 가입된 이메일입니다.",
        )

    password_hash = hash_password(body.password)

    for attempt in range(8):
        dojang = Dojang(name=body.dojangName, slug=build_dojang_slug(body.dojangName, attempt))
        user = User(
            email=body.email,
            password_hash=password_hash,
            name=body.name,
            role=UserRole.OWNER,
        )
        db.add(dojang)
        try:
            db.flush()
            user.dojang_id = dojang.id
            db.add(user)
            db.commit()
            db.refresh(user)
            return _issue_auth(response, user)
        except IntegrityError as exc:
            db.rollback()
            if attempt == 7:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=_conflict_detail(exc),
                ) from exc

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="체육관 주소를 만들지 못했습니다. 다시 시도해 주세요.",
    )


@router.post("/login", response_model=TokenResponse)
def login(
    body: LoginBody,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    return _issue_auth(response, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="리프레시 토큰이 없습니다.",
        )

    try:
        payload = decode_refresh_token(token)
        user_id = uuid.UUID(str(payload["sub"]))
    except (TokenError, ValueError) as exc:
        _clear_refresh_cookie(response)
        kind = getattr(exc, "kind", "invalid")
        message = (
            "리프레시 토큰이 만료되었습니다. 다시 로그인해 주세요."
            if kind == "expired"
            else "유효하지 않은 리프레시 토큰입니다."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
        ) from exc

    user = db.get(User, user_id)
    if user is None:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다.",
        )

    return _issue_auth(response, user)


@router.post("/logout")
def logout(response: Response) -> dict[str, bool]:
    _clear_refresh_cookie(response)
    return {"ok": True}
