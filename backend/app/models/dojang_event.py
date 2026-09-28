from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, func, true
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DojangEvent(Base):
    """캘린더 일정 한 건. 날짜별로 하나씩 등록한다(반복 일정 없음)."""

    __tablename__ = "dojang_events"

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
    event_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    # "HH:MM". 비어 있으면 하루 종일 일정.
    start_time: Mapped[str | None] = mapped_column(String(5))
    end_time: Mapped[str | None] = mapped_column(String(5))
    title: Mapped[str] = mapped_column(String, nullable=False)
    memo: Mapped[str | None] = mapped_column(String)
    # CLASS | EVENT | CLOSED | NOTICE
    category: Mapped[str] = mapped_column(String(16), nullable=False, default="CLASS")
    # 켜져 있으면 학부모가 공개 홈페이지에서 볼 수 있다.
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=true(),
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
