import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine
from routers import alimentos, lotes, distribuicoes, auxiliares, auth, usuarios, websocket, dashboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

app = FastAPI(
    title="Banco de Alimentos API",
    version="2.0.0",
    description="API de gestão de estoque — Banco de Alimentos Canoas",
    redirect_slashes=False,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Em produção, defina ALLOWED_ORIGINS no .env (ex: https://app.bancoalimentos.org)
# Em desenvolvimento, aceita tudo.

_env = os.getenv("ENVIRONMENT", "production")
_origins_env = os.getenv("ALLOWED_ORIGINS", "")

if _env == "development":
    origins = ["*"]
else:
    origins = [o.strip() for o in _origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
#
# Prefixos definidos dentro de cada router (prefix=).
# Aqui só registramos — sem prefix adicional para não duplicar.

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(alimentos.router)
app.include_router(lotes.router)
app.include_router(distribuicoes.router)
app.include_router(auxiliares.router)
app.include_router(websocket.router)   # endpoint /ws
app.include_router(dashboard.router)


# ── Utilitários ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Status"])
def root():
    return {"status": "ok", "versao": "2.0.0"}


@app.get("/health", tags=["Status"])
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "conectado",
        "ws_conexoes": __import__("ws_manager").manager.total_conexoes,
    }
