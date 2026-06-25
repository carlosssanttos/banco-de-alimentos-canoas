from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import date
import uuid

from database import get_db
from models import Distribuicao, Lote, Usuario
from security import get_usuario_atual
from ws_manager import manager

router = APIRouter(prefix="/distribuicoes", tags=["Distribuições"])


# ── Schema ─────────────────────────────────────────────────────────────────────

class DistribuicaoSchema(BaseModel):
    """
    id_usuario removido do body — é extraído automaticamente do JWT.
    O frontend não precisa mais enviar esse campo.
    """
    id_lote: uuid.UUID
    id_entidade: uuid.UUID
    quantidade: float
    data: date

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
def listar(
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return db.query(Distribuicao).order_by(Distribuicao.criado_em.desc()).all()


@router.get("/resumo-mensal")
def resumo_mensal(
    ano: int,
    mes: int,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    resultado = db.execute(
        text("""
            SELECT
                a.nome AS alimento,
                SUM(d.quantidade) AS total_distribuido,
                COUNT(d.id) AS num_distribuicoes
            FROM distribuicoes d
            JOIN lotes l ON l.id = d.id_lote
            JOIN alimentos a ON a.id = l.id_alimento
            WHERE EXTRACT(YEAR FROM d.data) = :ano
              AND EXTRACT(MONTH FROM d.data) = :mes
            GROUP BY a.nome
            ORDER BY total_distribuido DESC
        """),
        {"ano": ano, "mes": mes},
    )
    return [dict(r._mapping) for r in resultado]


@router.post("", status_code=201)
async def criar(
    data: DistribuicaoSchema,
    usuario: Usuario = Depends(get_usuario_atual),   # id_usuario vem do token
    db: Session = Depends(get_db),
):
    # Valida lote
    lote = db.query(Lote).filter(Lote.id == data.id_lote).first()
    if not lote:
        raise HTTPException(404, "Lote não encontrado")
    if lote.esta_estragado:
        raise HTTPException(400, "Lote marcado como estragado, não pode ser distribuído")
    if lote.quantidade < data.quantidade:
        raise HTTPException(
            400,
            f"Quantidade insuficiente no lote (disponível: {float(lote.quantidade):.3f})",
        )

    # Cria distribuição — id_usuario do token, não do body
    dist = Distribuicao(
        id_lote=data.id_lote,
        id_entidade=data.id_entidade,
        id_usuario=usuario.id,
        quantidade=data.quantidade,
        data=data.data,
    )
    lote.quantidade -= data.quantidade
    db.add(dist)
    db.commit()
    db.refresh(dist)

    await manager.broadcast_json({
        "evento": "distribuicao_criada",
        "dados": {
            "id": str(dist.id),
            "id_lote": str(dist.id_lote),
            "id_entidade": str(dist.id_entidade),
            "quantidade": float(dist.quantidade),
            "data": str(dist.data),
            "registrado_por": f"{usuario.nome} {usuario.sobrenome}",
            "estoque_restante_lote": float(lote.quantidade),
        },
    })

    return dist
