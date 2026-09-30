from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_staff_user
from app.db.session import get_db
from app.models import DeviceToken, User

router = APIRouter(prefix="/dashboard/devices", tags=["devices"])


class DeviceIn(BaseModel):
    token: str = Field(min_length=1, max_length=4096)
    platform: Literal["android", "ios"]


class DeviceTokenIn(BaseModel):
    token: str = Field(min_length=1, max_length=4096)


@router.put("", status_code=status.HTTP_204_NO_CONTENT, summary="푸시 알림 받을 폰 등록")
def register_device(
    body: DeviceIn,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> None:
    row = db.scalar(select(DeviceToken).where(DeviceToken.token == body.token))
    if row is None:
        db.add(DeviceToken(user_id=user.id, token=body.token, platform=body.platform))
    else:
        # 같은 폰에서 다른 계정으로 로그인했으면 알림 받을 사람을 바꾼다.
        row.user_id = user.id
        row.platform = body.platform
    db.commit()


@router.post(
    "/unregister",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="로그아웃할 때 푸시 알림 해제",
)
def unregister_device(
    body: DeviceTokenIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db.execute(
        delete(DeviceToken).where(
            DeviceToken.token == body.token,
            DeviceToken.user_id == user.id,
        )
    )
    db.commit()
