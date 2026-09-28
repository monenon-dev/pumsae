from __future__ import annotations

import re
import uuid
from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dojangs import _find_dojang
from app.core.deps import get_staff_user
from app.db.session import get_db
from app.models import DojangEvent, User

router = APIRouter(tags=["events"])

EventCategory = Literal["CLASS", "EVENT", "CLOSED", "NOTICE"]
_TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
# 한 번에 불러올 수 있는 최대 기간(달력 한 화면은 6주 = 42일).
MAX_RANGE_DAYS = 62


def _clean_time(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None
    value = value.strip()
    if not _TIME.match(value):
        raise ValueError("시간은 HH:MM 형식이어야 합니다.")
    return value


class EventIn(BaseModel):
    date: date
    title: str = Field(min_length=1, max_length=80)
    startTime: str | None = None
    endTime: str | None = None
    memo: str | None = Field(default=None, max_length=1000)
    category: EventCategory = "CLASS"
    isPublic: bool = True

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("일정 제목을 입력해 주세요.")
        return value

    @field_validator("startTime", "endTime")
    @classmethod
    def check_time(cls, value: str | None) -> str | None:
        return _clean_time(value)


class EventOut(BaseModel):
    id: uuid.UUID
    date: date
    title: str
    startTime: str | None
    endTime: str | None
    memo: str | None
    category: EventCategory
    isPublic: bool
    createdAt: datetime

    @classmethod
    def from_model(cls, row: DojangEvent) -> EventOut:
        return cls(
            id=row.id,
            date=row.event_date,
            title=row.title,
            startTime=row.start_time,
            endTime=row.end_time,
            memo=row.memo,
            category=row.category,  # type: ignore[arg-type]
            isPublic=bool(row.is_public),
            createdAt=row.created_at,
        )


class PublicEventOut(BaseModel):
    """학부모에게 보여주는 일정. 공개로 둔 것만, 내부 필드 없이."""

    id: uuid.UUID
    date: date
    title: str
    startTime: str | None
    endTime: str | None
    memo: str | None
    category: EventCategory

    @classmethod
    def from_model(cls, row: DojangEvent) -> PublicEventOut:
        return cls(
            id=row.id,
            date=row.event_date,
            title=row.title,
            startTime=row.start_time,
            endTime=row.end_time,
            memo=row.memo,
            category=row.category,  # type: ignore[arg-type]
        )


def _check_range(start: date, end: date) -> None:
    if end < start or (end - start).days > MAX_RANGE_DAYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"조회 기간은 {MAX_RANGE_DAYS}일 이내여야 합니다.",
        )


def _check_times(body: EventIn) -> None:
    if body.startTime and body.endTime and body.endTime < body.startTime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="끝나는 시간이 시작 시간보다 빠릅니다.",
        )


def _ordered(query):
    # 하루 종일 일정(시간 없음)을 먼저, 그다음 시작 시간 순.
    return query.order_by(
        DojangEvent.event_date,
        DojangEvent.start_time.is_not(None),
        DojangEvent.start_time,
        DojangEvent.created_at,
    )


def _owned_event(db: Session, user: User, event_id: uuid.UUID) -> DojangEvent:
    row = db.get(DojangEvent, event_id)
    if row is None or row.dojang_id != user.dojang_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다.",
        )
    return row


def _apply(row: DojangEvent, body: EventIn) -> None:
    row.event_date = body.date
    row.title = body.title
    row.start_time = body.startTime
    row.end_time = body.endTime
    row.memo = (body.memo or "").strip() or None
    row.category = body.category
    row.is_public = body.isPublic


@router.get("/dashboard/events", response_model=list[EventOut], summary="내 도장 일정 조회")
def list_events(
    start: date = Query(alias="from"),
    end: date = Query(alias="to"),
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> list[EventOut]:
    _check_range(start, end)
    rows = db.scalars(
        _ordered(
            select(DojangEvent).where(
                DojangEvent.dojang_id == user.dojang_id,
                DojangEvent.event_date >= start,
                DojangEvent.event_date <= end,
            )
        )
    ).all()
    return [EventOut.from_model(row) for row in rows]


@router.post(
    "/dashboard/events",
    response_model=EventOut,
    status_code=status.HTTP_201_CREATED,
    summary="일정 추가",
)
def create_event(
    body: EventIn,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> EventOut:
    _check_times(body)
    row = DojangEvent(dojang_id=user.dojang_id)
    _apply(row, body)
    db.add(row)
    db.commit()
    db.refresh(row)
    return EventOut.from_model(row)


@router.put("/dashboard/events/{event_id}", response_model=EventOut, summary="일정 수정")
def update_event(
    event_id: uuid.UUID,
    body: EventIn,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> EventOut:
    _check_times(body)
    row = _owned_event(db, user, event_id)
    _apply(row, body)
    db.commit()
    db.refresh(row)
    return EventOut.from_model(row)


@router.delete(
    "/dashboard/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="일정 삭제",
)
def delete_event(
    event_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> Response:
    db.delete(_owned_event(db, user, event_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


class PublicEventsOut(BaseModel):
    events: list[PublicEventOut]
    # 공개 일정이 하나라도 있는지. 없으면 홈페이지에서 캘린더 섹션을 숨긴다.
    hasAny: bool


@router.get(
    "/dojangs/{slug}/events",
    response_model=PublicEventsOut,
    summary="공개 홈페이지 일정(학부모 공개로 둔 것만)",
)
def list_public_events(
    slug: str,
    start: date = Query(alias="from"),
    end: date = Query(alias="to"),
    db: Session = Depends(get_db),
) -> PublicEventsOut:
    _check_range(start, end)
    dojang = _find_dojang(db, slug)
    public = (DojangEvent.dojang_id == dojang.id, DojangEvent.is_public.is_(True))
    rows = db.scalars(
        _ordered(
            select(DojangEvent).where(
                *public,
                DojangEvent.event_date >= start,
                DojangEvent.event_date <= end,
            )
        )
    ).all()
    has_any = bool(rows) or db.scalar(select(DojangEvent.id).where(*public).limit(1)) is not None
    return PublicEventsOut(
        events=[PublicEventOut.from_model(row) for row in rows],
        hasAny=has_any,
    )
