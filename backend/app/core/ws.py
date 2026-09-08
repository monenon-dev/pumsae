from __future__ import annotations

import uuid

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.rooms: dict[uuid.UUID, list[WebSocket]] = {}

    def connect(self, dojang_id: uuid.UUID, websocket: WebSocket) -> None:
        room = self.rooms.setdefault(dojang_id, [])
        if websocket not in room:
            room.append(websocket)

    def disconnect(self, dojang_id: uuid.UUID, websocket: WebSocket) -> None:
        room = self.rooms.get(dojang_id)
        if not room:
            return
        if websocket in room:
            room.remove(websocket)
        if not room:
            self.rooms.pop(dojang_id, None)

    async def broadcast(self, dojang_id: uuid.UUID, payload: dict) -> None:
        room = list(self.rooms.get(dojang_id, []))
        stale: list[WebSocket] = []
        for websocket in room:
            try:
                await websocket.send_json(payload)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(dojang_id, websocket)


trial_request_manager = ConnectionManager()
