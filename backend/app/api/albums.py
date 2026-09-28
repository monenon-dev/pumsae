from __future__ import annotations

import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dojangs import _find_dojang
from app.api.uploads import _content_type, _read_limited, open_image, resized_webp
from app.core.deps import get_staff_user
from app.core.r2 import delete_public_urls, put_object
from app.db.session import get_db
from app.models import AlbumPhoto, PhotoAlbum, User

router = APIRouter(tags=["albums"])

FULL_MAX_SIDE = 2048
THUMB_MAX_SIDE = 480
MAX_PHOTOS_PER_ALBUM = 300


class AlbumIn(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    takenOn: date | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("앨범 이름을 입력해 주세요.")
        return value


class AlbumPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=1000)
    takenOn: date | None = None
    isPublic: bool | None = None


class PhotoOut(BaseModel):
    id: uuid.UUID
    url: str
    thumbUrl: str
    width: int
    height: int

    @classmethod
    def from_model(cls, row: AlbumPhoto) -> PhotoOut:
        return cls(
            id=row.id,
            url=row.url,
            thumbUrl=row.thumb_url,
            width=row.width,
            height=row.height,
        )


class AlbumSummary(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    takenOn: date | None
    isPublic: bool
    photoCount: int
    coverUrl: str | None
    createdAt: datetime


class AlbumDetail(AlbumSummary):
    photos: list[PhotoOut]


def _summary(album: PhotoAlbum, count: int, cover: str | None) -> AlbumSummary:
    return AlbumSummary(
        id=album.id,
        title=album.title,
        description=album.description,
        takenOn=album.taken_on,
        isPublic=bool(album.is_public),
        photoCount=count,
        coverUrl=cover,
        createdAt=album.created_at,
    )


def _detail(album: PhotoAlbum) -> AlbumDetail:
    photos = [PhotoOut.from_model(photo) for photo in album.photos]
    return AlbumDetail(
        **_summary(album, len(photos), photos[0].thumbUrl if photos else None).model_dump(),
        photos=photos,
    )


def _summaries(db: Session, albums: list[PhotoAlbum]) -> list[AlbumSummary]:
    if not albums:
        return []
    ids = [album.id for album in albums]
    counts = dict(
        db.execute(
            select(AlbumPhoto.album_id, func.count())
            .where(AlbumPhoto.album_id.in_(ids))
            .group_by(AlbumPhoto.album_id)
        ).all()
    )
    # 표지 = 순서가 가장 앞선 사진.
    first = (
        select(AlbumPhoto.album_id, func.min(AlbumPhoto.sort_order).label("first"))
        .where(AlbumPhoto.album_id.in_(ids))
        .group_by(AlbumPhoto.album_id)
        .subquery()
    )
    covers: dict[uuid.UUID, str] = {}
    for album_id, thumb in db.execute(
        select(AlbumPhoto.album_id, AlbumPhoto.thumb_url).join(
            first,
            (AlbumPhoto.album_id == first.c.album_id) & (AlbumPhoto.sort_order == first.c.first),
        )
    ).all():
        covers.setdefault(album_id, thumb)
    return [_summary(album, counts.get(album.id, 0), covers.get(album.id)) for album in albums]


def _ordered_albums(query):
    # 찍은 날이 최근인 앨범부터, 날짜가 없으면 만든 순서로.
    return query.order_by(
        PhotoAlbum.taken_on.desc().nulls_last(),
        PhotoAlbum.created_at.desc(),
    )


def _owned_album(db: Session, user: User, album_id: uuid.UUID) -> PhotoAlbum:
    album = db.get(PhotoAlbum, album_id)
    if album is None or album.dojang_id != user.dojang_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="앨범을 찾을 수 없습니다.",
        )
    return album


@router.get("/dashboard/albums", response_model=list[AlbumSummary], summary="내 사진첩 앨범 목록")
def list_albums(
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> list[AlbumSummary]:
    albums = db.scalars(
        _ordered_albums(select(PhotoAlbum).where(PhotoAlbum.dojang_id == user.dojang_id))
    ).all()
    return _summaries(db, list(albums))


@router.post(
    "/dashboard/albums",
    response_model=AlbumDetail,
    status_code=status.HTTP_201_CREATED,
    summary="앨범 만들기(비공개로 시작)",
)
def create_album(
    body: AlbumIn,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> AlbumDetail:
    album = PhotoAlbum(
        dojang_id=user.dojang_id,
        title=body.title,
        description=(body.description or "").strip() or None,
        taken_on=body.takenOn,
        is_public=False,
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    return _detail(album)


@router.get("/dashboard/albums/{album_id}", response_model=AlbumDetail, summary="앨범 보기")
def get_album(
    album_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> AlbumDetail:
    return _detail(_owned_album(db, user, album_id))


@router.patch("/dashboard/albums/{album_id}", response_model=AlbumDetail, summary="앨범 수정·공개 설정")
def update_album(
    album_id: uuid.UUID,
    body: AlbumPatch,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> AlbumDetail:
    album = _owned_album(db, user, album_id)
    updates = body.model_dump(exclude_unset=True)
    if updates.get("title") is not None:
        title = updates["title"].strip()
        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="앨범 이름을 입력해 주세요.",
            )
        album.title = title
    if "description" in updates:
        album.description = (updates["description"] or "").strip() or None
    if "takenOn" in updates:
        album.taken_on = updates["takenOn"]
    if updates.get("isPublic") is not None:
        album.is_public = bool(updates["isPublic"])
    db.commit()
    db.refresh(album)
    return _detail(album)


@router.delete(
    "/dashboard/albums/{album_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="앨범 삭제(사진 포함)",
)
def delete_album(
    album_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> Response:
    album = _owned_album(db, user, album_id)
    files = [url for photo in album.photos for url in (photo.url, photo.thumb_url)]
    db.delete(album)
    db.commit()
    delete_public_urls(files)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/dashboard/albums/{album_id}/photos",
    response_model=PhotoOut,
    status_code=status.HTTP_201_CREATED,
    summary="앨범에 사진 한 장 올리기",
)
async def upload_photo(
    album_id: uuid.UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> PhotoOut:
    album = _owned_album(db, user, album_id)
    count = db.scalar(select(func.count()).where(AlbumPhoto.album_id == album.id)) or 0
    if count >= MAX_PHOTOS_PER_ALBUM:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"앨범 하나에는 사진을 {MAX_PHOTOS_PER_ALBUM}장까지 올릴 수 있어요.",
        )

    _content_type(file)
    image = open_image(await _read_limited(file))
    full, width, height = resized_webp(image, FULL_MAX_SIDE)
    thumb, _, _ = resized_webp(image, THUMB_MAX_SIDE, quality=72)

    key = f"albums/{album.dojang_id}/{album.id}/{uuid.uuid4()}"
    url = put_object(f"{key}.webp", full, "image/webp")
    thumb_url = put_object(f"{key}-thumb.webp", thumb, "image/webp")

    last = db.scalar(select(func.max(AlbumPhoto.sort_order)).where(AlbumPhoto.album_id == album.id))
    photo = AlbumPhoto(
        album_id=album.id,
        url=url,
        thumb_url=thumb_url,
        width=width,
        height=height,
        sort_order=(last if last is not None else -1) + 1,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return PhotoOut.from_model(photo)


@router.delete(
    "/dashboard/albums/{album_id}/photos/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="앨범에서 사진 빼기",
)
def delete_photo(
    album_id: uuid.UUID,
    photo_id: uuid.UUID,
    user: User = Depends(get_staff_user),
    db: Session = Depends(get_db),
) -> Response:
    album = _owned_album(db, user, album_id)
    photo = db.get(AlbumPhoto, photo_id)
    if photo is None or photo.album_id != album.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사진을 찾을 수 없습니다.",
        )
    files = [photo.url, photo.thumb_url]
    db.delete(photo)
    db.commit()
    delete_public_urls(files)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/dojangs/{slug}/albums",
    response_model=list[AlbumSummary],
    summary="공개 홈페이지 사진첩(공개 앨범만)",
)
def list_public_albums(slug: str, db: Session = Depends(get_db)) -> list[AlbumSummary]:
    dojang = _find_dojang(db, slug)
    albums = db.scalars(
        _ordered_albums(
            select(PhotoAlbum).where(
                PhotoAlbum.dojang_id == dojang.id,
                PhotoAlbum.is_public.is_(True),
            )
        )
    ).all()
    # 사진이 없는 앨범은 홈페이지에 빈 칸으로 보이므로 뺀다.
    return [album for album in _summaries(db, list(albums)) if album.photoCount > 0]


@router.get(
    "/dojangs/{slug}/albums/{album_id}",
    response_model=AlbumDetail,
    summary="공개 앨범 사진 보기",
)
def get_public_album(slug: str, album_id: uuid.UUID, db: Session = Depends(get_db)) -> AlbumDetail:
    dojang = _find_dojang(db, slug)
    album = db.get(PhotoAlbum, album_id)
    if album is None or album.dojang_id != dojang.id or not album.is_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="앨범을 찾을 수 없습니다.",
        )
    return _detail(album)
