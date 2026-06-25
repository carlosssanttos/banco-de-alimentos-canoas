import os
from fastapi import Depends, HTTPException, Header
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models import Usuario
from database import get_db

# ── Configurações ──────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "Variável de ambiente SECRET_KEY não definida. "
        "Gere uma chave segura com: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Utilitários ────────────────────────────────────────────────────────────────
def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)

# ── Dependencies ───────────────────────────────────────────────────────────────
def get_usuario_atual(authorization: str = Header(None), db: Session = Depends(get_db)) -> Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou mal formatado")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Pega o 'id' do payload gerado no login simples
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("id")
        if not usuario_id:
            raise ValueError()
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
    return usuario

def exigir_admin(usuario: Usuario = Depends(get_usuario_atual)) -> Usuario:
    if usuario.nivel != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a administradores",
        )
    return usuario