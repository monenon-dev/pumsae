from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import HeroLayout


class Dojang(Base):
    __tablename__ = "dojangs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    region: Mapped[str | None] = mapped_column(String)
    address: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String)
    logo_url: Mapped[str | None] = mapped_column(String)
    hero_image_url: Mapped[str | None] = mapped_column(String)
    brand_color: Mapped[str | None] = mapped_column(String)
    hero_layout: Mapped[HeroLayout] = mapped_column(
        Enum(HeroLayout, name="hero_layout", native_enum=True),
        nullable=False,
        server_default="GRADIENT",
        default=HeroLayout.GRADIENT,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    users: Mapped[list["User"]] = relationship("User", back_populates="dojang")
    promo_templates: Mapped[list["PromoTemplate"]] = relationship(
        "PromoTemplate",
        back_populates="dojang",
        cascade="all, delete-orphan",
    )
    trial_requests: Mapped[list["TrialRequest"]] = relationship(
        "TrialRequest",
        back_populates="dojang",
        cascade="all, delete-orphan",
    )
