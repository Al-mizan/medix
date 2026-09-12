# Medix - Digital Healthcare Platform Monorepo

Medix is a comprehensive full-stack digital healthcare platform connecting patients, doctors, and healthcare administrators.

---

## 🏛️ Architecture Overview

The codebase is structured as a **pnpm Monorepo** managing both backend and frontend applications alongside Docker and reverse-proxy deployment configurations:

```text
medix/
├── backend/                       # Node.js + Express + Prisma + PostgreSQL + Redis + RAG
│   ├── prisma/                    # Schema and migrations (including pgvector)
│   ├── src/                       # TypeScript backend source code
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
├── frontend/                      # Next.js 16 + React 19 + Tailwind v4 + Shadcn UI
│   ├── src/                       # App router, components, hooks, services
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
├── nginx/                         # Nginx reverse-proxy configuration
├── ci/                            # CI deployment environment input templates
├── script/                        # Secret injection and automation scripts
├── .github/workflows/cicd.yml     # Automated CI/CD pipeline (Test, Build, Deploy)
├── docker-compose.dev.yaml        # Local full-stack container environment
├── docker-compose.prod.yaml       # Production container orchestration
├── pnpm-workspace.yaml            # pnpm workspace definition
└── package.json                   # Root monorepo scripts
```

---

## 🚀 Quick Start (Local Development)

### Option 1: Using Docker Compose (Recommended)
Spins up PostgreSQL, Redis, backend, and frontend with hot-reloading in one command:
```bash
docker compose -f docker-compose.dev.yaml up
```
* **Frontend**: http://localhost:3000
* **Backend API**: http://localhost:5000
* **Database**: localhost:5432

### Option 2: Running Locally via pnpm
Install dependencies across all workspaces:
```bash
pnpm install
```

Run both or individual services:
```bash
# Start backend
pnpm dev:backend

# Start frontend
pnpm dev:frontend
```

Prisma Database management:
```bash
pnpm db:migrate
pnpm db:generate
pnpm db:studio
```

---

## 🚢 CI/CD & Deployment

Production deployment is managed via GitHub Actions ([`.github/workflows/cicd.yml`](.github/workflows/cicd.yml)):
1. **Quality Check**: Lints, validates, and builds both backend and frontend.
2. **Docker Hub**: Builds and tags container images (`ph-healthcare-server` and `ph-healthcare-client`).
3. **VPS CD**: SSHs into the VPS, pulls updated images, runs Prisma migrations, and restarts services with zero downtime.

---

## 🌿 Branching Strategy
* `main`: Production-ready release branch deployed to VPS.
* `development`: Active integration and feature development branch.
