# 🔔 Notification Hub

REST API para enviar mensajes y notificaciones a múltiples plataformas de comunicación desde un único lugar.

Desarrollado por **Neumann Miguel Angel**

[![CI](https://github.com/guelan14/notification-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/guelan14/notification-hub/actions/workflows/ci.yml)

🌐 [Live Demo](https://notification-hub-vett.onrender.com) · 📄 [API Docs](https://notification-hub-vett.onrender.com/docs)

---

## Stack

| Categoría | Tecnología |
|-----------|------------|
| Runtime | Node.js 24 |
| Lenguaje | TypeScript |
| Framework | Express.js |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 |
| Autenticación | JWT + bcrypt |
| Validaciones | Zod |
| HTTP Client | Axios |
| Documentación | Swagger UI (OpenAPI 3.0) |
| Testing | Jest + ts-jest |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Render |

---

## Arquitectura

Arquitectura en capas con separación de responsabilidades:

```
src/
├── config/          # Prisma client, Swagger
├── controllers/     # Manejo de requests/responses
├── middlewares/     # JWT auth, control de roles
├── repositories/    # Acceso a base de datos
├── routes/          # Definición de endpoints y documentación OpenAPI
├── services/        # Lógica de negocio e integraciones externas
└── index.ts
```

```
Request → Route → Middleware → Controller → Service → Repository → DB
```

---

## Requisitos

- Node.js 24+
- pnpm
- Docker y Docker Compose

---

## Instalación

```bash
git clone https://github.com/guelan14/notification-hub.git
cd notification-hub

pnpm install
pnpm approve-builds

cp .env.example .env
# Completar variables en .env

docker compose up postgres -d
pnpm exec prisma migrate dev
pnpm seed

pnpm dev
```

Swagger UI disponible en `http://localhost:3000/docs`

---

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
DAILY_MESSAGE_LIMIT=100
DISCORD_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Endpoints

### Auth

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | — |
| POST | `/auth/login` | Login, devuelve JWT | — |

### Messages

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/messages` | Enviar mensaje a una o más plataformas | JWT |
| GET | `/messages` | Listar mensajes propios con filtros | JWT |
| GET | `/messages/metrics` | Métricas por usuario (solo admin) | JWT + Admin |

**Filtros disponibles en `GET /messages`:**

```
?status=SUCCESS|FAILED|PENDING
?platform=DISCORD|TELEGRAM
?from=2026-01-01&to=2026-12-31
```

---

## Testing

```bash
pnpm test
pnpm test:coverage
```

---

## Docker

```bash
# Desarrollo con hot reload
docker compose up postgres -d
pnpm dev

# Entorno completo
docker compose up
```

---

## CI/CD

GitHub Actions ejecuta automáticamente en cada push a `main` y `development`:

1. Genera el cliente Prisma
2. Corre los tests unitarios
3. Buildea la imagen Docker (solo si los tests pasan)

> ⚠️ El free tier de Render suspende la instancia tras 15 minutos de inactividad. El primer request puede demorar hasta 50 segundos.