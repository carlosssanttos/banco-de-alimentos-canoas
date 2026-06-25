from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Date,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
import uuid


class Tipo(Base):
    __tablename__ = "tipos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)


class Marca(Base):
    __tablename__ = "marcas"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)


class Unidade(Base):
    __tablename__ = "unidades"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(50), nullable=False)


class Permissao(Base):
    __tablename__ = "permissoes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(100), nullable=False)
    sobrenome = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False)
    nivel = Column(String(20), nullable=False, default="operador")
    criado_em = Column(DateTime, server_default=func.now())


class Parceiro(Base):
    __tablename__ = "parceiros"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(150), nullable=False)
    tipo = Column(String(100))
    contato = Column(String(150))
    descricao = Column(Text)


class PontoColeta(Base):
    __tablename__ = "pontos_coleta"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_parceiro = Column(UUID(as_uuid=True), ForeignKey("parceiros.id"), nullable=False)
    nome = Column(String(150), nullable=False)
    local = Column(String(255))
    descricao = Column(Text)


class Alimento(Base):
    __tablename__ = "alimentos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(150), nullable=False)
    id_tipo = Column(UUID(as_uuid=True), ForeignKey("tipos.id"))
    id_marca = Column(UUID(as_uuid=True), ForeignKey("marcas.id"))
    id_unidade = Column(UUID(as_uuid=True), ForeignKey("unidades.id"))
    descricao = Column(Text)


class Lote(Base):
    __tablename__ = "lotes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_alimento = Column(UUID(as_uuid=True), ForeignKey("alimentos.id"), nullable=False)
    id_parceiro = Column(UUID(as_uuid=True), ForeignKey("parceiros.id"))
    id_ponto_coleta = Column(UUID(as_uuid=True), ForeignKey("pontos_coleta.id"))
    quantidade = Column(Numeric(10, 3), nullable=False)
    data_chegada = Column(Date, nullable=False)
    data_validade = Column(Date)
    foi_comprado = Column(Boolean, default=False)
    preco = Column(Numeric(10, 2))
    esta_estragado = Column(Boolean, default=False)
    criado_em = Column(DateTime, server_default=func.now())


class EntidadeBeneficiaria(Base):
    __tablename__ = "entidades_beneficiarias"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String(150), nullable=False)
    contato = Column(String(150))
    endereco = Column(Text)


class Distribuicao(Base):
    __tablename__ = "distribuicoes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_lote = Column(UUID(as_uuid=True), ForeignKey("lotes.id"), nullable=False)
    id_entidade = Column(
        UUID(as_uuid=True), ForeignKey("entidades_beneficiarias.id"), nullable=False
    )
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    quantidade = Column(Numeric(10, 3), nullable=False)
    data = Column(Date, nullable=False)
    criado_em = Column(DateTime, server_default=func.now())
