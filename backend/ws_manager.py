"""
Gerenciador de conexões WebSocket.

Uso nos routers:
    from ws_manager import manager
    await manager.broadcast_json({"evento": "lote_criado", "dados": {...}})

Conexão do cliente:
    ws://host/ws?token=<JWT>
"""

import json
import logging
from typing import Dict
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # usuario_id -> lista de conexões (mesmo usuário pode ter múltiplas abas)
        self._connections: Dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, usuario_id: str):
        await websocket.accept()
        self._connections.setdefault(usuario_id, []).append(websocket)
        total = sum(len(v) for v in self._connections.values())
        logger.info(f"WS conectado: usuario={usuario_id} | total_conexoes={total}")

    def disconnect(self, websocket: WebSocket, usuario_id: str):
        conns = self._connections.get(usuario_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(usuario_id, None)
        total = sum(len(v) for v in self._connections.values())
        logger.info(f"WS desconectado: usuario={usuario_id} | total_conexoes={total}")

    async def broadcast_json(self, payload: dict):
        """Envia para todos os clientes conectados."""
        message = json.dumps(payload, default=str)
        mortos: list[tuple[str, WebSocket]] = []

        for uid, conns in self._connections.items():
            for ws in conns:
                try:
                    await ws.send_text(message)
                except Exception:
                    mortos.append((uid, ws))

        # Limpa conexões quebradas
        for uid, ws in mortos:
            self.disconnect(ws, uid)

    async def send_to_user(self, usuario_id: str, payload: dict):
        """Envia apenas para um usuário específico."""
        message = json.dumps(payload, default=str)
        conns = self._connections.get(usuario_id, [])
        mortos = []
        for ws in conns:
            try:
                await ws.send_text(message)
            except Exception:
                mortos.append(ws)
        for ws in mortos:
            self.disconnect(ws, usuario_id)

    @property
    def total_conexoes(self) -> int:
        return sum(len(v) for v in self._connections.values())


# Singleton — importado pelos routers
manager = ConnectionManager()
