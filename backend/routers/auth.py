from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt

from database import get_db
from models import Usuario
from security import verificar_senha, hash_senha, get_usuario_atual, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["Autenticação"])


class LoginRequest(BaseModel):
    email: str
    senha: str


class AlterarSenhaRequest(BaseModel):
    senha_atual: str
    nova_senha: str


@router.post("/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email.lower().strip()).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    expira = datetime.now(timezone.utc) + timedelta(hours=8)
    token = jwt.encode({"id": str(usuario.id), "exp": expira}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "usuario": {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "email": usuario.email,
            "nivel": usuario.nivel
        }
    }


@router.get("/me")
def obter_usuario_atual_rota(usuario: Usuario = Depends(get_usuario_atual)):
    return {
        "id": str(usuario.id),
        "nome": usuario.nome,
        "email": usuario.email,
        "nivel": usuario.nivel
    }


@router.put("/alterar-senha")
def alterar_senha(
    dados: AlterarSenhaRequest,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    if not verificar_senha(dados.senha_atual, usuario.senha_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    if len(dados.nova_senha) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter pelo menos 6 caracteres")
    usuario.senha_hash = hash_senha(dados.nova_senha)
    db.commit()
    return {"ok": True}
