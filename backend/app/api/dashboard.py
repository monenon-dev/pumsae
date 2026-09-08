from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_owner_user, get_staff_user
from app.core.export import screenshot_promo_png
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models import Dojang, PromoTemplate, TrialRequest, User
from app.promo.render import render_promo_html
from app.schemas import (
    DojangOut,
    DojangPatch,
    MeOut,
    MePatch,
    PasswordChange,
    PasswordChanged,
    TemplateCreate,
    TemplateDetail,
    TemplateOut,
    TemplatePatch,
    TemplateSaved,
    TrialRequestOut,
    TrialRequestPatch,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_HEX = re.compile(r"^#[0-9a-fA-F]{6}$")


def _empty_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def _is_http_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def _optional_http_url(value: str | None, message: str) -> str | None:
    url = _empty_to_none(value)
    if url and not _is_http_url(url):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return url


def _template_title(content: dict) -> str:
    title = str(content.get("title") or "").strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="제목과 템플릿 종류를 확인해 주세요.",
        )
    return title


def _owned_template(
    db: Session,
    user: User,
    template_id: uuid.UUID,
) -> PromoTemplate:
    row = db.get(PromoTemplate, template_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="템플릿을 찾을 수 없습니다.",
        )
    if row.dojang_id != user.dojang_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="다른 체육관의 템플릿입니다.",
        )
    return row


def _owned_trial(
    db: Session,
    user: User,
    trial_id: uuid.UUID,
) -> TrialRequest:
    row = db.get(TrialRequest, trial_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="신청을 찾을 수 없습니다.",
        )
    if row.dojang_id != user.dojang_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="다른 체육관의 신청입니다.",
        )
    return row


@router.get("/me", response_model=MeOut, summary="내 계정 조회")
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeOut:
    dojang = db.get(Dojang, user.dojang_id) if user.dojang_id else None
    return MeOut(
        name=user.name,
        email=user.email,
        role=user.role,
        dojangName=dojang.name if dojang else None,
    )


@router.patch("/me", response_model=MeOut, summary="내 이름 수정")
def update_me(
    body: MePatch,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeOut:
    if body.name is not None:
        user.name = body.name
        db.commit()
        db.refresh(user)
    dojang = db.get(Dojang, user.dojang_id) if user.dojang_id else None
    return MeOut(
        name=user.name,
        email=user.email,
        role=user.role,
        dojangName=dojang.name if dojang else None,
    )


@router.post("/me/password", response_model=PasswordChanged, summary="비밀번호 변경")
def change_my_password(
    body: PasswordChange,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PasswordChanged:
    if not verify_password(body.currentPassword, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="현재 비밀번호가 올바르지 않습니다.",
        )
    user.password_hash = hash_password(body.newPassword)
    db.commit()
    return PasswordChanged()


@router.get("/dojang", response_model=DojangOut, summary="내 도장 조회")
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


@router.patch("/dojang", response_model=DojangOut, summary="내 도장 수정 (OWNER)")
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

    updates = body.model_dump(exclude_unset=True)

    if "name" in updates:
        name = (updates["name"] or "").strip()
        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="도장 이름을 입력해 주세요.",
            )
        dojang.name = name

    if "description" in updates:
        dojang.description = _empty_to_none(updates["description"])

    if "logoUrl" in updates:
        logo = _empty_to_none(updates["logoUrl"])
        if logo and not _is_http_url(logo):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="로고는 http(s) 이미지 주소여야 합니다.",
            )
        dojang.logo_url = logo

    if "heroImageUrl" in updates:
        hero = _empty_to_none(updates["heroImageUrl"])
        if hero and not _is_http_url(hero):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="대표 사진은 http(s) 이미지 주소여야 합니다.",
            )
        dojang.hero_image_url = hero

    if "brandColor" in updates:
        color = (updates["brandColor"] or "").strip()
        if not _HEX.match(color):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="브랜드 컬러는 #RRGGBB 형식이어야 합니다.",
            )
        dojang.brand_color = color.lower()

    if "region" in updates:
        dojang.region = _empty_to_none(updates["region"])
    if "address" in updates:
        dojang.address = _empty_to_none(updates["address"])
    if "phone" in updates:
        dojang.phone = _empty_to_none(updates["phone"])

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


@router.get("/templates/{template_id}", response_model=TemplateDetail)
def get_template(
    template_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> TemplateDetail:
    return TemplateDetail.from_model(_owned_template(db, user, template_id))


@router.post("/templates", response_model=TemplateSaved, status_code=status.HTTP_201_CREATED)
def create_template(
    body: TemplateCreate,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> TemplateSaved:
    _template_title(body.content)
    thumbnail = _optional_http_url(
        body.thumbnailUrl or str(body.content.get("imageUrl") or "") or None,
        "썸네일은 http(s) 주소여야 합니다.",
    )
    row = PromoTemplate(
        dojang_id=user.dojang_id,
        type=body.type,
        content=body.content,
        thumbnail_url=thumbnail,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return TemplateSaved(id=row.id)


@router.patch("/templates/{template_id}", response_model=TemplateSaved)
def update_template(
    template_id: uuid.UUID,
    body: TemplatePatch,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> TemplateSaved:
    row = _owned_template(db, user, template_id)
    updates = body.model_dump(exclude_unset=True)

    if "content" in updates and updates["content"] is not None:
        _template_title(updates["content"])
        row.content = updates["content"]
        if "thumbnailUrl" not in updates:
            image_url = str(updates["content"].get("imageUrl") or "").strip()
            if image_url:
                row.thumbnail_url = _optional_http_url(
                    image_url,
                    "썸네일은 http(s) 주소여야 합니다.",
                )

    if "type" in updates and updates["type"] is not None:
        row.type = updates["type"]

    if "thumbnailUrl" in updates:
        row.thumbnail_url = _optional_http_url(
            updates["thumbnailUrl"],
            "썸네일은 http(s) 주소여야 합니다.",
        )

    db.commit()
    db.refresh(row)
    return TemplateSaved(id=row.id, success="카드뉴스를 저장했습니다.")


@router.get(
    "/templates/{template_id}/export",
    summary="고화질 PNG 내보내기",
    responses={200: {"content": {"image/png": {}}}},
)
async def export_template(
    template_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> Response:
    row = _owned_template(db, user, template_id)
    kind = getattr(row.type, "value", row.type)
    payload = dict(row.content) if isinstance(row.content, dict) else {}
    template_key = str(row.id)
    html = render_promo_html(payload, str(kind))
    png = await screenshot_promo_png(html)
    filename = f"pumsae-{str(kind).lower()}-{template_key[:8]}.png"
    return Response(
        content=png,
        media_type="image/png",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.get(
    "/trial-requests",
    response_model=list[TrialRequestOut],
    summary="체험 신청 목록",
)
def list_trial_requests(
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> list[TrialRequestOut]:
    rows = db.scalars(
        select(TrialRequest)
        .where(TrialRequest.dojang_id == user.dojang_id)
        .order_by(TrialRequest.created_at.desc()),
    ).all()
    return [TrialRequestOut.from_model(row) for row in rows]


@router.patch(
    "/trial-requests/{trial_id}",
    response_model=TrialRequestOut,
    summary="체험 신청 상태 변경",
)
def patch_trial_request(
    trial_id: uuid.UUID,
    body: TrialRequestPatch,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> TrialRequestOut:
    row = _owned_trial(db, user, trial_id)
    row.status = body.status
    db.commit()
    db.refresh(row)
    return TrialRequestOut.from_model(row)

