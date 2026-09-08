from __future__ import annotations

import asyncio
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import TokenError, decode_access_token
from app.core.ws import trial_request_manager
from app.db.session import get_session_factory
from app.models import User

router = APIRouter(tags=["websocket"])


async def _access_token(websocket: WebSocket, query_token: str | None) -> str | None:
    if query_token and query_token.strip():
        return query_token.strip()
    try:
        message = await asyncio.wait_for(websocket.receive_json(), timeout=10)
    except Exception:
        return None
    if not isinstance(message, dict):
        return None
    raw = message.get("token")
    if isinstance(raw, str) and raw.strip():
        return raw.strip()
    return None


@router.websocket("/ws/dashboard/trial-requests")
async def trial_requests_socket(
    websocket: WebSocket,
    token: str | None = Query(default=None),
) -> None:
    await websocket.accept()
    access = await _access_token(websocket, token)
    if not access:
        await websocket.close(code=1008)
        return

    try:
        payload = decode_access_token(access)
        user_id = uuid.UUID(str(payload["sub"]))
    except (TokenError, ValueError):
        await websocket.close(code=1008)
        return

    db = get_session_factory()()
    try:
        user = db.get(User, user_id)
        dojang_id = user.dojang_id if user is not None else None
    finally:
        db.close()

    if dojang_id is None:
        await websocket.close(code=1008)
        return

    trial_request_manager.connect(dojang_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        trial_request_manager.disconnect(dojang_id, websocket)
