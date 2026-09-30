"""개인정보 보관 기간이 지난 데이터를 지운다.

개인정보처리방침(app/privacy/page.tsx)에 적은 기간과 맞춰야 한다.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from starlette.concurrency import run_in_threadpool

from app.db.session import get_session_factory
from app.models import TrialRequest

logger = logging.getLogger(__name__)

TRIAL_RETENTION_DAYS = 365
_INTERVAL_SECONDS = 24 * 60 * 60


def purge_expired_trials() -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=TRIAL_RETENTION_DAYS)
    db = get_session_factory()()
    try:
        result = db.execute(delete(TrialRequest).where(TrialRequest.created_at < cutoff))
        db.commit()
        return result.rowcount or 0
    finally:
        db.close()


async def run_retention_loop() -> None:
    """서버가 켜져 있는 동안 하루에 한 번 돈다. 재시작하면 곧바로 한 번 돈다."""
    while True:
        try:
            removed = await run_in_threadpool(purge_expired_trials)
            if removed:
                logger.info("Retention: deleted %d trial request(s) older than %d days", removed, TRIAL_RETENTION_DAYS)
        except Exception:
            # DB가 잠깐 안 될 때 루프 전체가 죽지 않게 하고, 다음 날 다시 시도한다.
            logger.exception("Retention purge failed")
        await asyncio.sleep(_INTERVAL_SECONDS)
