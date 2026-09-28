from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Dojang, DojangSlugAlias
from app.schemas import DojangOut

router = APIRouter(tags=["dojangs"])


@router.get(
    "/dojangs/{slug}",
    response_model=DojangOut,
    summary="공개 도장 랜딩페이지 조회",
)
def get_dojang_by_slug(slug: str, db: Session = Depends(get_db)) -> DojangOut:
    key = slug.strip().lower()
    dojang = db.scalar(select(Dojang).where(Dojang.slug == key))
    if dojang is None:
        # 예전 주소로 들어오면 현재 도장을 돌려준다. 응답의 slug가 요청과 다르면
        # 프론트가 새 주소로 영구 이동(308)시킨다.
        dojang = db.scalar(
            select(Dojang)
            .join(DojangSlugAlias, DojangSlugAlias.dojang_id == Dojang.id)
            .where(DojangSlugAlias.slug == key)
        )
    if dojang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="체육관을 찾을 수 없습니다.",
        )
    return DojangOut.from_model(dojang)
