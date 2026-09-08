from __future__ import annotations

import uuid
from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.core.r2 import put_object
from app.models import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024


class UploadOut(BaseModel):
    url: str


def _content_type(upload: UploadFile) -> str:
    raw = (upload.content_type or "").split(";")[0].strip().lower()
    if raw == "image/jpg":
        raw = "image/jpeg"
    if raw not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="jpg, jpeg, png, webp 이미지만 올릴 수 있습니다.",
        )
    return raw


async def _read_limited(upload: UploadFile) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await upload.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="이미지는 10MB 이하만 올릴 수 있습니다.",
            )
        chunks.append(chunk)
    if total == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="빈 파일은 올릴 수 없습니다.",
        )
    return b"".join(chunks)


def _to_rgb(image: Image.Image) -> Image.Image:
    if image.mode == "P":
        image = image.convert("RGBA")
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])
        return background
    if image.mode != "RGB":
        return image.convert("RGB")
    return image


def _as_webp(data: bytes, content_type: str) -> bytes:
    try:
        image = Image.open(BytesIO(data))
        image.load()
    except UnidentifiedImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일을 읽지 못했습니다.",
        ) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일을 읽지 못했습니다.",
        ) from exc

    if content_type == "image/webp":
        return data

    buffer = BytesIO()
    _to_rgb(image).save(buffer, format="WEBP", quality=80)
    return buffer.getvalue()


@router.post("", response_model=UploadOut, summary="이미지 업로드")
async def upload_image(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
) -> UploadOut:
    content_type = _content_type(file)
    original = await _read_limited(file)
    body = _as_webp(original, content_type)
    key = f"{uuid.uuid4()}.webp"
    url = put_object(key, body, "image/webp")
    return UploadOut(url=url)
