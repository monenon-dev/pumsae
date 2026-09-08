from __future__ import annotations

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from app.core.config import settings


def _require_r2() -> tuple[str, str, str, str, str]:
    account_id = settings.r2_account_id
    access_key = settings.r2_access_key_id
    secret_key = settings.r2_secret_access_key
    bucket = settings.r2_bucket_name
    public_base = settings.r2_public_url
    if not account_id or not access_key or not secret_key or not bucket or not public_base:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="이미지 저장소가 아직 설정되지 않았습니다.",
        )
    return account_id, access_key, secret_key, bucket, public_base


def r2_client():
    account_id, access_key, secret_key, bucket, public_base = _require_r2()
    client = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
    return client, bucket, public_base


def put_object(key: str, body: bytes, content_type: str) -> str:
    client, bucket, public_base = r2_client()
    try:
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="이미지를 저장하지 못했습니다.",
        ) from exc
    return f"{public_base}/{key}"
