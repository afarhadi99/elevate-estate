# Elevate Estate CRM

A premium real estate CRM platform — listing-centered, AI-enhanced, and built for modern brokerages.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Motion
- **Backend**: FastAPI · Pydantic v2 · SQLAlchemy 2.0 · Alembic · HTTPX
- **Database**: PostgreSQL + PostGIS
- **Storage**: S3-compatible object storage
- **Jobs**: Procrastinate (PostgreSQL-backed)
- **Monorepo**: pnpm + Turborepo

## Project Structure

```
elevate-estate/
  apps/
    web/          # Next.js App Router frontend
    api/          # FastAPI backend
  packages/
    ui/           # Shared shadcn/ui components
    config/       # Shared ESLint, TS config
  infra/
    docker/       # Docker Compose for local dev
  tests/
    e2e/          # Playwright end-to-end tests
```

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Local Development

```bash
# Install JS dependencies
pnpm install

# Start all services (Postgres, API, Web)
docker compose -f infra/docker/docker-compose.yml up -d

# Start Next.js dev server
pnpm dev --filter=web

# Start FastAPI dev server
cd apps/api && uvicorn app.main:app --reload
```

### Environment Setup

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

## Architecture

- Single-tenant deployment model, org-scoped schema (multi-tenant ready)
- Modular monolith backend — clean module boundaries without microservice overhead
- Custom database-backed auth with Argon2id password hashing
- Resource/action RBAC with customizable roles per organization
- Plugin architecture for external integrations (Zillow, MLS, Google Maps)
- Structured AI outputs with human approval for descriptions and image enhancement

## License

MIT
