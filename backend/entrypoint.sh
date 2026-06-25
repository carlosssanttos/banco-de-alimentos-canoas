#!/bin/sh
set -eu

if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "[bootstrap] Criando/validando usuário administrador..."
  python create_admin.py
else
  echo "[bootstrap] Variáveis ADMIN_EMAIL/ADMIN_PASSWORD não definidas; pulando criação automática de admin."
fi

exec gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --access-logfile -
