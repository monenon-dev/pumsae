from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_owner_user, get_staff_user
from app.db.session import get_db
from app.models import Dojang, PromoTemplate, User
from app.schemas import DojangOut, DojangPatch, TemplateCreate, TemplateOut, TemplateSaved

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_HEX = re.compile(r"^#[0-9a-fA-F]{6}$")


def _empty_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def _is_http_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


@router.get("/dojang", response_model=DojangOut)
def get_my_dojang(
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> DojangOut:
    dojang = db.get(Dojang, user.dojang_id)
    if dojang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="소속 체육관을 찾지 못했습니다.",
        )
    return DojangOut.from_model(dojang)


@router.patch("/dojang", response_model=DojangOut)
def update_my_dojang(
    body: DojangPatch,
    user: User = Depends(get_owner_user),
    db: Session = Depends(get_db),
) -> DojangOut:
    dojang = db.get(Dojang, user.dojang_id)
    if dojang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="소속 체육관을 찾지 못했습니다.",
        )

    if body.name is not None:
        dojang.name = body.name.strip()

    if body.description is not None:
        dojang.description = _empty_to_none(body.description)

    if body.logoUrl is not None:
        logo = _empty_to_none(body.logoUrl)
        if logo and not _is_http_url(logo):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="로고는 http(s) 이미지 주소여야 합니다.",
            )
        dojang.logo_url = logo

    if body.heroImageUrl is not None:
        hero = _empty_to_none(body.heroImageUrl)
        if hero and not _is_http_url(hero):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="대표 사진은 http(s) 이미지 주소여야 합니다.",
            )
        dojang.hero_image_url = hero

    if body.brandColor is not None:
        color = body.brandColor.strip()
        if not _HEX.match(color):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="브랜드 컬러는 #RRGGBB 형식이어야 합니다.",
            )
        dojang.brand_color = color.lower()

    if body.region is not None:
        dojang.region = _empty_to_none(body.region)
    if body.address is not None:
        dojang.address = _empty_to_none(body.address)
    if body.phone is not None:
        dojang.phone = _empty_to_none(body.phone)

    db.commit()
    db.refresh(dojang)
    return DojangOut.from_model(dojang)


@router.get("/templates", response_model=list[TemplateOut])
def list_templates(
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> list[TemplateOut]:
    rows = db.scalars(
        select(PromoTemplate)
        .where(PromoTemplate.dojang_id == user.dojang_id)
        .order_by(PromoTemplate.created_at.desc()),
    ).all()
    return [TemplateOut.from_model(row) for row in rows]


@router.post("/templates", response_model=TemplateSaved, status_code=status.HTTP_201_CREATED)
def create_template(
    body: TemplateCreate,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> TemplateSaved:
    title = str(body.content.get("title") or "").strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="제목과 템플릿 종류를 확인해 주세요.",
        )

    row = PromoTemplate(
        dojang_id=user.dojang_id,
        type=body.type,
        content=body.content,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return TemplateSaved(id=row.id)
