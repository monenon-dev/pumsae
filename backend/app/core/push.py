"""FCM 푸시 알림.

FIREBASE_CREDENTIALS_JSON이 없으면 아무것도 보내지 않는다(로컬 개발 등).
보내기는 응답을 돌려준 뒤 BackgroundTasks에서 돌아서, FCM이 느리거나
실패해도 체험 신청 자체는 영향을 받지 않는다.
"""

from __future__ import annotations

import json
import logging
import uuid

import firebase_admin
from firebase_admin import credentials, messaging
from sqlalchemy import delete, select

from app.core.config import settings
from app.db.session import get_session_factory
from app.models import DeviceToken, User

logger = logging.getLogger(__name__)

# FCM이 "이 토큰은 더 이상 쓸 수 없다"고 알려주는 오류. 앱을 지웠거나
# 토큰이 바뀐 경우라서, 받으면 DB에서 지운다.
_DEAD_TOKEN_ERRORS = (messaging.UnregisteredError, messaging.SenderIdMismatchError)

_app: firebase_admin.App | None = None
_disabled_logged = False


def _firebase_app() -> firebase_admin.App | None:
    global _app, _disabled_logged
    if _app is not None:
        return _app
    raw = settings.firebase_credentials_json
    if not raw:
        if not _disabled_logged:
            logger.info("FIREBASE_CREDENTIALS_JSON is not set; push notifications are off")
            _disabled_logged = True
        return None
    _app = firebase_admin.initialize_app(credentials.Certificate(json.loads(raw)))
    return _app


def notify_dojang_staff(
    dojang_id: uuid.UUID,
    *,
    title: str,
    body: str,
    data: dict[str, str],
) -> None:
    """도장 직원 모두의 폰으로 알림을 보낸다. BackgroundTasks에서 부른다."""
    app = _firebase_app()
    if app is None:
        return

    db = get_session_factory()()
    try:
        tokens = list(
            db.scalars(
                select(DeviceToken.token)
                .join(User, User.id == DeviceToken.user_id)
                .where(User.dojang_id == dojang_id)
            )
        )
        if not tokens:
            return

        message = messaging.MulticastMessage(
            tokens=tokens,
            notification=messaging.Notification(title=title, body=body),
            data=data,
            android=messaging.AndroidConfig(priority="high"),
        )
        try:
            result = messaging.send_each_for_multicast(message, app=app)
        except Exception:
            logger.exception("FCM send failed")
            return

        dead = [
            token
            for token, response in zip(tokens, result.responses)
            if not response.success and isinstance(response.exception, _DEAD_TOKEN_ERRORS)
        ]
        if dead:
            db.execute(delete(DeviceToken).where(DeviceToken.token.in_(dead)))
            db.commit()
        if result.failure_count:
            logger.warning(
                "FCM: %d of %d failed (%d dead tokens removed)",
                result.failure_count,
                len(tokens),
                len(dead),
            )
    finally:
        db.close()
