from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.push import notify_dojang_staff
from app.core.ws import trial_request_manager
from app.db.session import get_db
from app.models import Dojang, TrialRequest
from app.models.enums import DesiredClass, TrialRequestStatus
from app.schemas import TrialRequestCreate, TrialRequestOut

router = APIRouter(tags=["trials"])

_CLASS_LABELS = {
    DesiredClass.KIDS: "유아부",
    DesiredClass.ELEMENTARY: "초등부",
    DesiredClass.MIDDLE_HIGH: "중고등부",
    DesiredClass.ADULT: "성인부",
}


@router.post(
    "/trial-requests",
    response_model=TrialRequestOut,
    status_code=status.HTTP_201_CREATED,
    summary="체험 수업 신청",
)
async def create_trial_request(
    body: TrialRequestCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
) -> TrialRequestOut:
    dojang = db.get(Dojang, body.dojangId)
    if dojang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="체육관을 찾을 수 없습니다.",
        )

    row = TrialRequest(
        dojang_id=dojang.id,
        student_name=body.studentName,
        parent_name=body.parentName,
        parent_phone=body.parentPhone,
        desired_class=body.desiredClass,
        memo=body.memo,
        status=TrialRequestStatus.PENDING,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    payload = TrialRequestOut.from_model(row)
    await trial_request_manager.broadcast(
        dojang.id,
        {"type": "trial.created", "trial": payload.model_dump(mode="json")},
    )
    # 앱이 꺼져 있어도 알 수 있게 푸시도 보낸다. 학부모 연락처는 알림에 넣지 않는다.
    label = _CLASS_LABELS.get(row.desired_class) if row.desired_class else None
    background.add_task(
        notify_dojang_staff,
        dojang.id,
        title="새 체험 신청",
        body=f"{row.student_name} 학생" + (f" · {label}" if label else ""),
        data={"type": "trial.created", "trialId": str(row.id)},
    )
    return payload
