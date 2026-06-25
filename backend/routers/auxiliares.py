from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from database import get_db
from models import Tipo, Marca, Unidade, Parceiro, PontoColeta, EntidadeBeneficiaria, Usuario
from security import get_usuario_atual, exigir_admin

router = APIRouter(tags=["Auxiliares"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class TipoSchema(BaseModel):
    nome: str
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


class MarcaSchema(BaseModel):
    nome: str

    class Config:
        from_attributes = True


class UnidadeSchema(BaseModel):
    nome: str

    class Config:
        from_attributes = True


class ParceiroSchema(BaseModel):
    nome: str
    tipo: Optional[str] = None
    contato: Optional[str] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


class PontoColetaSchema(BaseModel):
    id_parceiro: uuid.UUID
    nome: str
    local: Optional[str] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


class EntidadeSchema(BaseModel):
    nome: str
    contato: Optional[str] = None
    endereco: Optional[str] = None

    class Config:
        from_attributes = True


# ── Tipos ──────────────────────────────────────────────────────────────────────

@router.get("/tipos")
def listar_tipos(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    return db.query(Tipo).order_by(Tipo.nome).all()


@router.post("/tipos", status_code=201)
def criar_tipo(
    data: TipoSchema,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    tipo = Tipo(**data.model_dump())
    db.add(tipo)
    db.commit()
    db.refresh(tipo)
    return tipo


# ── Marcas ─────────────────────────────────────────────────────────────────────

@router.get("/marcas")
def listar_marcas(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    return db.query(Marca).order_by(Marca.nome).all()


@router.post("/marcas", status_code=201)
def criar_marca(
    data: MarcaSchema,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    marca = Marca(nome=data.nome)
    db.add(marca)
    db.commit()
    db.refresh(marca)
    return marca


# ── Unidades ───────────────────────────────────────────────────────────────────

@router.get("/unidades")
def listar_unidades(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    return db.query(Unidade).order_by(Unidade.nome).all()


@router.post("/unidades", status_code=201)
def criar_unidade(
    data: UnidadeSchema,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    unidade = Unidade(nome=data.nome)
    db.add(unidade)
    db.commit()
    db.refresh(unidade)
    return unidade


# ── Parceiros ──────────────────────────────────────────────────────────────────

@router.get("/parceiros")
def listar_parceiros(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    return db.query(Parceiro).order_by(Parceiro.nome).all()


@router.post("/parceiros", status_code=201)
def criar_parceiro(
    data: ParceiroSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    parceiro = Parceiro(**data.model_dump())
    db.add(parceiro)
    db.commit()
    db.refresh(parceiro)
    return parceiro


class ParceiroUpdateSchema(BaseModel):
    nome: str
    tipo: Optional[str] = None
    contato: Optional[str] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


@router.put("/parceiros/{id}")
def atualizar_parceiro(
    id: uuid.UUID,
    data: ParceiroUpdateSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    parceiro = db.query(Parceiro).filter(Parceiro.id == id).first()
    if not parceiro:
        raise HTTPException(404, "Parceiro não encontrado")
    for k, v in data.model_dump().items():
        setattr(parceiro, k, v)
    db.commit()
    db.refresh(parceiro)
    return parceiro


@router.delete("/parceiros/{id}")
def deletar_parceiro(
    id: uuid.UUID,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    parceiro = db.query(Parceiro).filter(Parceiro.id == id).first()
    if not parceiro:
        raise HTTPException(404, "Parceiro não encontrado")
    db.delete(parceiro)
    db.commit()
    return {"ok": True}


# ── Pontos de coleta ───────────────────────────────────────────────────────────

@router.get("/pontos-coleta")
def listar_pontos_coleta(
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return db.query(PontoColeta).all()


@router.post("/pontos-coleta", status_code=201)
def criar_ponto_coleta(
    data: PontoColetaSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    parceiro = db.query(Parceiro).filter(Parceiro.id == data.id_parceiro).first()
    if not parceiro:
        raise HTTPException(404, "Parceiro não encontrado")
    ponto = PontoColeta(**data.model_dump())
    db.add(ponto)
    db.commit()
    db.refresh(ponto)
    return ponto


# ── Entidades beneficiárias ────────────────────────────────────────────────────
# Estas rotas faltavam — necessárias para o funcionamento das distribuições.

@router.get("/entidades")
def listar_entidades(
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return db.query(EntidadeBeneficiaria).order_by(EntidadeBeneficiaria.nome).all()


@router.get("/entidades/{id}")
def buscar_entidade(
    id: uuid.UUID,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    e = db.query(EntidadeBeneficiaria).filter(EntidadeBeneficiaria.id == id).first()
    if not e:
        raise HTTPException(404, "Entidade não encontrada")
    return e


@router.post("/entidades", status_code=201)
def criar_entidade(
    data: EntidadeSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    entidade = EntidadeBeneficiaria(**data.model_dump())
    db.add(entidade)
    db.commit()
    db.refresh(entidade)
    return entidade


@router.put("/entidades/{id}")
def atualizar_entidade(
    id: uuid.UUID,
    data: EntidadeSchema,
    _: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    e = db.query(EntidadeBeneficiaria).filter(EntidadeBeneficiaria.id == id).first()
    if not e:
        raise HTTPException(404, "Entidade não encontrada")
    for k, v in data.model_dump().items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return e


@router.delete("/entidades/{id}")
def deletar_entidade(
    id: uuid.UUID,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    e = db.query(EntidadeBeneficiaria).filter(EntidadeBeneficiaria.id == id).first()
    if not e:
        raise HTTPException(404, "Entidade não encontrada")
    db.delete(e)
    db.commit()
    return {"ok": True}
