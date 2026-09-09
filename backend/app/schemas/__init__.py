from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.models import Dojang, PromoTemplate, TrialRequest
from app.models.enums import DesiredClass, HeroLayout, PromoTemplateType, TrialRequestStatus, UserRole


class DojangOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    logoUrl: str | None
    heroImageUrl: str | None
    brandColor: str | None
    heroLayout: HeroLayout
    region: str | None
    address: str | None
    phone: str | None
    updatedAt: datetime | None

    @classmethod
    def from_model(cls, dojang: Dojang) -> DojangOut:
        return cls(
            id=dojang.id,
            name=dojang.name,
            slug=dojang.slug,
            description=dojang.description,
            logoUrl=dojang.logo_url,
            heroImageUrl=dojang.hero_image_url,
            brandColor=dojang.brand_color,
            heroLayout=dojang.hero_layout or HeroLayout.GRADIENT,
            region=dojang.region,
            address=dojang.address,
            phone=dojang.phone,
            updatedAt=dojang.updated_at,
        )


class DojangPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    logoUrl: str | None = None
    heroImageUrl: str | None = None
    brandColor: str | None = None
    heroLayout: HeroLayout | None = None
    region: str | None = None
    address: str | None = None
    phone: str | None = None


class TemplateCreate(BaseModel):
    type: PromoTemplateType
    content: dict[str, Any]
    thumbnailUrl: str | None = None


class TemplatePatch(BaseModel):
    type: PromoTemplateType | None = None
    content: dict[str, Any] | None = None
    thumbnailUrl: str | None = None


class TemplateOut(BaseModel):
    id: uuid.UUID
    type: PromoTemplateType
    typeLabel: str
    title: str
    thumbnailUrl: str | None
    createdAt: datetime

    @classmethod
    def from_model(cls, row: PromoTemplate) -> TemplateOut:
        content = row.content if isinstance(row.content, dict) else {}
        title = str(content.get("title") or "").strip() or "제목 없음"
        labels = {
            PromoTemplateType.AWARD: "대회 수상",
            PromoTemplateType.BELT_UP: "띠 승급",
            PromoTemplateType.RECRUIT: "신규 모집",
            PromoTemplateType.EVENT: "행사",
        }
        return cls(
            id=row.id,
            type=row.type,
            typeLabel=labels.get(row.type, row.type.value),
            title=title,
            thumbnailUrl=row.thumbnail_url,
            createdAt=row.created_at,
        )


class TemplateDetail(TemplateOut):
    content: dict[str, Any]

    @classmethod
    def from_model(cls, row: PromoTemplate) -> TemplateDetail:
        base = TemplateOut.from_model(row)
        content = row.content if isinstance(row.content, dict) else {}
        return cls(**base.model_dump(), content=content)


class TemplateSaved(BaseModel):
    id: uuid.UUID
    success: str = "카드뉴스를 저장했습니다."


class TrialRequestCreate(BaseModel):
    dojangId: uuid.UUID
    studentName: str = Field(min_length=1, max_length=80)
    parentName: str = Field(min_length=1, max_length=80)
    parentPhone: str = Field(min_length=7, max_length=30)
    desiredClass: DesiredClass | None = None
    memo: str | None = Field(default=None, max_length=500)

    @field_validator("studentName", "parentName", "parentPhone")
    @classmethod
    def strip_required(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("필수 항목을 입력해 주세요.")
        return trimmed

    @field_validator("memo")
    @classmethod
    def empty_memo_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        return trimmed or None


class TrialRequestOut(BaseModel):
    id: uuid.UUID
    dojangId: uuid.UUID
    studentName: str
    parentName: str
    parentPhone: str
    desiredClass: DesiredClass | None
    memo: str | None
    status: TrialRequestStatus
    createdAt: datetime

    @classmethod
    def from_model(cls, row: TrialRequest) -> TrialRequestOut:
        return cls(
            id=row.id,
            dojangId=row.dojang_id,
            studentName=row.student_name,
            parentName=row.parent_name,
            parentPhone=row.parent_phone,
            desiredClass=row.desired_class,
            memo=row.memo,
            status=row.status,
            createdAt=row.created_at,
        )


class TrialRequestPatch(BaseModel):
    status: Literal[TrialRequestStatus.CONFIRMED, TrialRequestStatus.DECLINED]


class MeOut(BaseModel):
    name: str
    email: str
    role: UserRole
    dojangName: str | None = None


class MePatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("이름을 입력해 주세요.")
        return trimmed


class PasswordChange(BaseModel):
    currentPassword: str = Field(min_length=1, max_length=72)
    newPassword: str = Field(min_length=6, max_length=72)

    @field_validator("newPassword")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("비밀번호는 6자 이상이어야 합니다.")
        return value


class PasswordChanged(BaseModel):
    success: str = "비밀번호가 변경됐어요."

