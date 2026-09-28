from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Dojang, DojangSlugAlias, PromoTemplate
from app.schemas import DojangOut, PublicNewsItem

router = APIRouter(tags=["dojangs"])

PUBLIC_NEWS_LIMIT = 12


def _find_dojang(db: Session, slug: str) -> Dojang:
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
    return dojang


@router.get(
    "/dojangs/{slug}",
    response_model=DojangOut,
    summary="공개 도장 랜딩페이지 조회",
)
def get_dojang_by_slug(slug: str, db: Session = Depends(get_db)) -> DojangOut:
    return DojangOut.from_model(_find_dojang(db, slug))


@router.get(
    "/dojangs/{slug}/news",
    response_model=list[PublicNewsItem],
    summary="공개 홈페이지에 보여줄 카드뉴스(관장님이 공개로 고른 것만)",
)
def get_dojang_news(slug: str, db: Session = Depends(get_db)) -> list[PublicNewsItem]:
    dojang = _find_dojang(db, slug)
    rows = db.scalars(
        select(PromoTemplate)
        .where(PromoTemplate.dojang_id == dojang.id, PromoTemplate.is_public.is_(True))
        .order_by(PromoTemplate.created_at.desc())
        .limit(PUBLIC_NEWS_LIMIT)
    ).all()
    return [PublicNewsItem.from_model(row) for row in rows]
