from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models import Dojang, PromoTemplate
from app.models.enums import PromoTemplateType


class DojangOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    logoUrl: str | None
    heroImageUrl: str | None
    brandColor: str | None
    region: str | None
    address: str | None
    phone: str | None

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
            region=dojang.region,
            address=dojang.address,
            phone=dojang.phone,
        )


class DojangPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    logoUrl: str | None = None
    heroImageUrl: str | None = None
    brandColor: str | None = None
    region: str | None = None
    address: str | None = None
    phone: str | None = None


class TemplateCreate(BaseModel):
    type: PromoTemplateType
    content: dict[str, Any]


class TemplateOut(BaseModel):
    id: uuid.UUID
    type: PromoTemplateType
    typeLabel: str
    title: str
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
            createdAt=row.created_at,
        )


class TemplateSaved(BaseModel):
    id: uuid.UUID
    success: str = "카드뉴스를 저장했습니다."
