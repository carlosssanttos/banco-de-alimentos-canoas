"""
Script standalone para criar o primeiro usuário administrador.
Execute fora do servidor FastAPI.

Uso:
    python backend/create_admin.py
"""
from typing import Any
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

# Adicionar o diretório backend ao path
sys.path.insert(0, os.path.dirname(__file__))

from models import Base, Usuario
from security import hash_senha

# Configurar banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Erro: DATABASE_URL não configurada nas variáveis de ambiente")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def criar_admin():
    """Cria um novo usuário administrador."""
    print("=== CRIAR PRIMEIRO USUÁRIO ADMIN ===\n")

    nome = os.getenv("ADMIN_NOME", "").strip() or input("Nome: ").strip()
    if not nome:
        print("Erro: Nome não pode estar vazio")
        return False

    sobrenome = os.getenv("ADMIN_SOBRENOME", "").strip() or input("Sobrenome: ").strip()
    if not sobrenome:
        print("Erro: Sobrenome não pode estar vazio")
        return False

    email = os.getenv("ADMIN_EMAIL", "").strip().lower() or input("E-mail: ").strip().lower()
    if not email or "@" not in email:
        print("Erro: E-mail inválido")
        return False

    senha = os.getenv("ADMIN_PASSWORD", "").strip() or input("Senha: ").strip()
    if not senha or len(senha) < 6:
        print("Erro: Senha deve ter pelo menos 6 caracteres")
        return False
    
    # Criar sessão
    db = SessionLocal()
    
    try:
        # Verificar se já existe usuário com esse email
        # Mudamos a tipagem para Any para o VS Code não chiar com o SQLAlchemy
        usuario_existente: Any = db.query(Usuario).filter(Usuario.email == email).first()
        
        if usuario_existente:
            if usuario_existente.nivel != "admin":
                usuario_existente.nivel = "admin"
                usuario_existente.senha_hash = hash_senha(senha)
                db.commit()
                db.refresh(usuario_existente)
            print(f"Usuário '{email}' já existe; garantindo nível admin.")
            return True
        
        # Criar novo admin
        novo_admin = Usuario(
            id=uuid.uuid4(),
            nome=nome,
            sobrenome=sobrenome,
            email=email,
            senha_hash=hash_senha(senha),
            nivel="admin",
            criado_em=datetime.utcnow()
        )
        
        db.add(novo_admin)
        db.commit()
        db.refresh(novo_admin)
        
        print("\n✓ Usuário admin criado com sucesso!")
        print(f"  ID: {novo_admin.id}")
        print(f"  Nome: {novo_admin.nome} {novo_admin.sobrenome}")
        print(f"  E-mail: {novo_admin.email}")
        print(f"  Nível: {novo_admin.nivel}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"Erro ao criar admin: {str(e)}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if criar_admin():
        sys.exit(0)
    else:
        sys.exit(1)
