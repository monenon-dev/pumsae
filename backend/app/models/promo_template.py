from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, false, func, text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import PromoTemplateType


class PromoTemplate(Base):
    __tablename__ = "promo_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    dojang_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dojangs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[PromoTemplateType] = mapped_column(
        Enum(PromoTemplateType, name="promo_template_type", native_enum=True),
        nullable=False,
    )
    content: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        server_default=text("'{}'::json"),
    )
    thumbnail_url: Mapped[str | None] = mapped_column(String)
    # 관장님이 고른 카드만 공개 홈페이지의 "우리 도장 소식"에 보인다.
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=false(),
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    dojang: Mapped["Dojang"] = relationship("Dojang", back_populates="promo_templates")
