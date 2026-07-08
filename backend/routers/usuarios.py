from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from database import get_db, safe_commit
from models import Usuario
from security import hash_senha, get_usuario_atual, exigir_admin

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

NIVEIS_VALIDOS = {"admin", "operador"}


# ── Schemas ────────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nome: str
    sobrenome: str
    email: str
    senha: str
    nivel: str = "operador"

    class Config:
        from_attributes = True


class UsuarioOut(BaseModel):
    id: uuid.UUID
    nome: str
    sobrenome: str
    email: str
    nivel: str

    class Config:
        from_attributes = True


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("", response_model=List[UsuarioOut])
def listar_usuarios(
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    return db.query(Usuario).order_by(Usuario.nome).all()


@router.post("", response_model=UsuarioOut, status_code=201)
def criar_usuario(
    usuario_data: UsuarioCreate,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    if usuario_data.nivel not in NIVEIS_VALIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nível inválido. Valores aceitos: {', '.join(NIVEIS_VALIDOS)}",
        )

    if db.query(Usuario).filter(
        Usuario.email == usuario_data.email.lower().strip()
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já registrado",
        )

    if len(usuario_data.senha) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha deve ter pelo menos 6 caracteres",
        )

    novo = Usuario(
        nome=usuario_data.nome.strip(),
        sobrenome=usuario_data.sobrenome.strip(),
        email=usuario_data.email.lower().strip(),
        senha_hash=hash_senha(usuario_data.senha),
        nivel=usuario_data.nivel,
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


class UsuarioUpdate(BaseModel):
    nome: str
    sobrenome: str
    email: str
    nivel: str = "operador"
    senha: Optional[str] = None

    class Config:
        from_attributes = True


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar_usuario(
    usuario_id: uuid.UUID,
    usuario_data: UsuarioUpdate,
    _: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if usuario_data.nivel not in NIVEIS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Nível inválido. Valores aceitos: {', '.join(NIVEIS_VALIDOS)}")

    existing = db.query(Usuario).filter(
        Usuario.email == usuario_data.email.lower().strip(),
        Usuario.id != usuario_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já registrado")

    usuario.nome = usuario_data.nome.strip()
    usuario.sobrenome = usuario_data.sobrenome.strip()
    usuario.email = usuario_data.email.lower().strip()
    usuario.nivel = usuario_data.nivel
    if usuario_data.senha and len(usuario_data.senha) >= 6:
        usuario.senha_hash = hash_senha(usuario_data.senha)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}")
def deletar_usuario(
    usuario_id: uuid.UUID,
    admin: Usuario = Depends(exigir_admin),
    db: Session = Depends(get_db),
):
    if usuario_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode deletar sua própria conta",
        )

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    db.delete(usuario)
    safe_commit(db)
    return {"mensagem": "Usuário deletado com sucesso"}
