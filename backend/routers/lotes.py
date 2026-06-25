from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid

from database import get_db
from models import Lote, Usuario
from security import get_usuario_atual, exigir_admin
from ws_manager import manager

router = APIRouter(prefix="/lotes", tags=["Lotes"])


# ── Schema ─────────────────────────────────────────────────────────────────────

class LoteSchema(BaseModel):
    id_alimento: uuid.UUID
    id_parceiro: Optional[uuid.UUID] = None
    id_ponto_coleta: Optional[uuid.UUID] = None
    quantidade: float
    data_chegada: date
    data_validade: Optional[date] = None
    foi_comprado: bool = False
    preco: Optional[float] = None
    esta_estragado: bool = False

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
def listar(
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return db.query(Lote).order_by(Lote.criado_em.desc()).all()


@router.get("/vencendo")
def vencendo_em_breve(
    dias: int = 30,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    resultado = db.execute(
        text("""
            SELECT
                l.id,
                a.nome AS alimento,
                l.quantidade,
                l.data_validade,
                l.data_validade - CURRENT_DATE AS dias_restantes
            FROM lotes l
            JOIN alimentos a ON a.id = l.id_alimento
            WHERE l.data_validade IS NOT NULL
              AND l.data_validade <= CURRENT_DATE + :dias
              AND l.esta_estragado = false
              AND l.quantidade > 0
            ORDER BY l.data_validade ASC
        """),
        {"dias": dias},
    )
    return [dict(r._mapping) for r in resultado]


@router.post("", status_code=201)
async def criar(
    data: LoteSchema,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    lote = Lote(**data.model_dump())
    db.add(lote)
    db.commit()
    db.refresh(lote)

    await manager.broadcast_json({
        "evento": "lote_criado",
        "dados": {
            "id": str(lote.id),
            "id_alimento": str(lote.id_alimento),
            "quantidade": float(lote.quantidade),
            "data_chegada": str(lote.data_chegada),
            "data_validade": str(lote.data_validade) if lote.data_validade else None,
            "criado_por": f"{usuario.nome} {usuario.sobrenome}",
        },
    })

    return lote


@router.put("/{id}")
def atualizar(
    id: uuid.UUID,
    data: LoteSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    lote = db.query(Lote).filter(Lote.id == id).first()
    if not lote:
        raise HTTPException(404, "Lote não encontrado")
    for k, v in data.model_dump().items():
        setattr(lote, k, v)
    db.commit()
    db.refresh(lote)
    return lote


@router.patch("/{id}/estragado")
async def marcar_estragado(
    id: uuid.UUID,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    lote = db.query(Lote).filter(Lote.id == id).first()
    if not lote:
        raise HTTPException(404, "Lote não encontrado")

    lote.esta_estragado = True
    db.commit()
    db.refresh(lote)

    await manager.broadcast_json({
        "evento": "lote_estragado",
        "dados": {
            "id": str(lote.id),
            "id_alimento": str(lote.id_alimento),
            "registrado_por": f"{usuario.nome} {usuario.sobrenome}",
        },
    })

    return lote


@router.delete("/{id}")
async def deletar(
    id: uuid.UUID,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    lote = db.query(Lote).filter(Lote.id == id).first()
    if not lote:
        raise HTTPException(404, "Lote não encontrado")
    db.delete(lote)
    db.commit()

    await manager.broadcast_json({
        "evento": "lote_deletado",
        "dados": {"id": str(id)},
    })

    return {"ok": True}
