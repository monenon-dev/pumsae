from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Dojang
from app.schemas import DojangOut

router = APIRouter(tags=["dojangs"])


@router.get(
    "/dojangs/{slug}",
    response_model=DojangOut,
    summary="공개 도장 랜딩페이지 조회",
)
def get_dojang_by_slug(slug: str, db: Session = Depends(get_db)) -> DojangOut:
    dojang = db.scalar(select(Dojang).where(Dojang.slug == slug.strip()))
    if dojang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="체육관을 찾을 수 없습니다.",
        )
    return DojangOut.from_model(dojang)
