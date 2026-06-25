
# Banco de Alimentos Canoas

Sistema de gestão de estoque e distribuição de alimentos.

## Como subir em desenvolvimento

```bash
cp .env.example .env
# edite .env e coloque sua SECRET_KEY:
# python -c "import secrets; print(secrets.token_hex(32))"

docker compose -f docker-compose.dev.yml up --build
```

Serviços disponíveis:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs

## Estrutura

```
backend/   → FastAPI + SQLAlchemy + PostgreSQL
frontend/  → React 19 + TypeScript + Vite + Tailwind
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável          | Descrição                                      |
|-------------------|------------------------------------------------|
| `SECRET_KEY`      | Chave secreta JWT (gere com `secrets.token_hex(32)`) |
| `ADMIN_EMAIL`     | E-mail do usuário administrador inicial        |
| `ADMIN_PASSWORD`  | Senha do administrador inicial                 |
| `DATABASE_URL`    | URL de conexão com o PostgreSQL                |
| `ENVIRONMENT`     | `development` libera CORS para todas as origens |

## Autenticação

Login via `POST /auth/login` com `{ email, senha }`. Retorna `access_token` (JWT válido por 8 horas).

Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

O WebSocket em `/ws?token=<token>` exige o mesmo JWT como query param.
