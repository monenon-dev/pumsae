from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import DesiredClass, TrialRequestStatus


class TrialRequest(Base):
    __tablename__ = "trial_requests"

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
    student_name: Mapped[str] = mapped_column(String, nullable=False)
    parent_name: Mapped[str] = mapped_column(String, nullable=False)
    parent_phone: Mapped[str] = mapped_column(String, nullable=False)
    desired_class: Mapped[DesiredClass | None] = mapped_column(
        Enum(DesiredClass, name="desired_class", native_enum=True),
        nullable=True,
    )
    memo: Mapped[str | None] = mapped_column(String)
    status: Mapped[TrialRequestStatus] = mapped_column(
        Enum(TrialRequestStatus, name="trial_request_status", native_enum=True),
        nullable=False,
        server_default="PENDING",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    dojang: Mapped["Dojang"] = relationship("Dojang", back_populates="trial_requests")
