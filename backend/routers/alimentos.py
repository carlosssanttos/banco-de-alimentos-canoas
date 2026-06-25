from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from database import get_db
from models import Alimento, Usuario
from security import get_usuario_atual, exigir_admin

router = APIRouter(prefix="/alimentos", tags=["Alimentos"])


# ── Schema ─────────────────────────────────────────────────────────────────────

class AlimentoSchema(BaseModel):
    nome: str
    id_tipo: Optional[uuid.UUID] = None
    id_marca: Optional[uuid.UUID] = None
    id_unidade: Optional[uuid.UUID] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
def listar(
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return db.query(Alimento).order_by(Alimento.nome).all()


@router.get("/{id}")
def buscar(
    id: uuid.UUID,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    return a


@router.post("", status_code=201)
def criar(
    data: AlimentoSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    alimento = Alimento(**data.model_dump())
    db.add(alimento)
    db.commit()
    db.refresh(alimento)
    return alimento


@router.put("/{id}")
def atualizar(
    id: uuid.UUID,
    data: AlimentoSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    for k, v in data.model_dump().items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a


@router.delete("/{id}")
def deletar(
    id: uuid.UUID,
    _: Usuario = Depends(exigir_admin),   # só admin pode deletar alimento
    db: Session = Depends(get_db),
):
    a = db.query(Alimento).filter(Alimento.id == id).first()
    if not a:
        raise HTTPException(404, "Alimento não encontrado")
    db.delete(a)
    db.commit()
    return {"ok": True}
