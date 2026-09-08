from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.ws import trial_request_manager
from app.db.session import get_db
from app.models import Dojang, TrialRequest
from app.models.enums import TrialRequestStatus
from app.schemas import TrialRequestCreate, TrialRequestOut

router = APIRouter(tags=["trials"])


@router.post(
    "/trial-requests",
    response_model=TrialRequestOut,
    status_code=status.HTTP_201_CREATED,
    summary="체험 수업 신청",
)
async def create_trial_request(
    body: TrialRequestCreate,
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
    return payload
