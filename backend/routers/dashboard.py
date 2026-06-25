from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Usuario
from security import get_usuario_atual

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/resumo")
def resumo(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    r = db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM alimentos) AS total_alimentos,
            (SELECT COUNT(*) FROM lotes WHERE esta_estragado = false AND quantidade > 0) AS total_lotes,
            (SELECT COUNT(*) FROM distribuicoes) AS total_distribuicoes,
            (SELECT COUNT(*) FROM lotes
             WHERE data_validade IS NOT NULL
               AND data_validade <= CURRENT_DATE + 30
               AND esta_estragado = false
               AND quantidade > 0) AS lotes_vencendo
    """)).mappings().one()
    return dict(r)


@router.get("/recebido-por-mes")
def recebido_por_mes(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', data_chegada), 'Mon/YY') AS mes,
            SUM(quantidade) AS quantidade
        FROM lotes
        WHERE esta_estragado = false
          AND data_chegada >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', data_chegada)
        ORDER BY DATE_TRUNC('month', data_chegada)
    """)).mappings().all()
    return [dict(r) for r in rows]


@router.get("/top-doadores")
def top_doadores(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            p.nome AS parceiro,
            SUM(l.quantidade) AS total
        FROM lotes l
        JOIN parceiros p ON p.id = l.id_parceiro
        WHERE l.esta_estragado = false
        GROUP BY p.nome
        ORDER BY total DESC
        LIMIT 10
    """)).mappings().all()
    return [dict(r) for r in rows]


@router.get("/por-entidade")
def por_entidade(_: Usuario = Depends(get_usuario_atual), db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            e.nome AS entidade,
            SUM(d.quantidade) AS total
        FROM distribuicoes d
        JOIN entidades_beneficiarias e ON e.id = d.id_entidade
        GROUP BY e.nome
        ORDER BY total DESC
        LIMIT 10
    """)).mappings().all()
    return [dict(r) for r in rows]
