from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func, text
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    dojang: Mapped["Dojang"] = relationship("Dojang", back_populates="promo_templates")
