"""
Endpoint WebSocket autenticado.

Conexão:
    ws://host/ws?token=<JWT>

O cliente deve reconectar automaticamente em caso de queda.
Heartbeat: o servidor envia {"evento": "ping"} a cada 30s e espera {"evento": "pong"}.

Eventos emitidos pelo servidor (broadcast):
    lote_criado          → novo lote registrado
    lote_estragado       → lote marcado como estragado
    lote_deletado        → lote removido
    distribuicao_criada  → nova saída registrada
    ping                 → heartbeat a cada 30s

Formato de todos os eventos:
    { "evento": "<nome>", "dados": { ... } }
"""

import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import JWTError, jwt

from security import SECRET_KEY, ALGORITHM
from database import SessionLocal
from models import Usuario
from ws_manager import manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)

HEARTBEAT_INTERVAL = 30  # segundos


def _autenticar_token(token: str) -> str | None:
    """
    Valida o JWT e retorna o usuario_id (str) ou None se inválido.
    Separado para facilitar testes.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("id")
        if not usuario_id:
            return None

        # Confirma que o usuário ainda existe no banco
        db = SessionLocal()
        try:
            usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
            return str(usuario.id) if usuario else None
        finally:
            db.close()
    except JWTError:
        return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Bearer token"),
):
    """
    WebSocket autenticado. Passe o token como query param:
        ws://host/ws?token=<seu_jwt>
    """
    usuario_id = _autenticar_token(token)

    if not usuario_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("WS recusado: token inválido ou usuário inexistente")
        return

    await manager.connect(websocket, usuario_id)

    # Confirma conexão para o cliente
    await websocket.send_json({"evento": "conectado", "dados": {"usuario_id": usuario_id}})

    async def heartbeat():
        """Envia ping periódico para manter a conexão viva."""
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL)
            try:
                await websocket.send_json({"evento": "ping"})
            except Exception:
                break

    heartbeat_task = asyncio.create_task(heartbeat())

    try:
        while True:
            # Aguarda mensagens do cliente (ex: pong, ou futuras ações)
            data = await websocket.receive_json()
            if data.get("evento") == "pong":
                pass  # heartbeat confirmado, nada a fazer
            # Aqui podem ser adicionados handlers para outros eventos do cliente
    except WebSocketDisconnect:
        logger.info(f"WS desconectado normalmente: usuario={usuario_id}")
    except Exception as e:
        logger.warning(f"WS erro inesperado: usuario={usuario_id} erro={e}")
    finally:
        heartbeat_task.cancel()
        manager.disconnect(websocket, usuario_id)
