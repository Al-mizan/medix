# Medix — Full-Stack Digital Healthcare Platform Monorepo

Medix is a high-availability, full-stack digital healthcare management and telemedicine platform. It bridges patients, doctors, and healthcare administrators with end-to-end appointment scheduling, Stripe payments, automated invoicing, real-time doctor availability, role-based dashboards, and planned WebRTC peer-to-peer telemedicine consultations.

---

## 🏛️ Monorepo Architecture

The repository is organized as a high-performance **pnpm monorepo**:

```text
digital-healthcare/
├── backend/                       # Node.js 22 + Express 5 + Prisma 7 + PostgreSQL + Redis
│   ├── prisma/                    # Modular schemas (schema/*.prisma) & SQL migrations
│   ├── src/                       # Layered Modular Monolith (Routes, Controllers, Services)
│   ├── tests/                     # Vitest + Supertest integration test suite
│   ├── Dockerfile.dev             # Local container runtime
│   ├── Dockerfile.prod            # Multi-stage production container
│   └── typedoc.json               # TypeScript API reference generator configuration
├── frontend/                      # Next.js 16 + React 19 + Tailwind v4 + Shadcn UI
│   ├── src/                       # App Router, Layouts, TanStack Query/Form/Table
│   ├── tests/                     # Vitest + React Testing Library + jsdom suite
│   ├── Dockerfile.dev             # Frontend dev container
│   └── Dockerfile.prod            # Standalone Next.js production container
├── docs/                          # Comprehensive Platform Engineering Documentation
│   ├── srs.md                     # Software Requirements Specification (IEEE 830-aligned)
│   ├── backend_design.md          # Complete Backend Technical Architecture & Data Model
│   ├── frontend_architecture.md   # Next.js 16 App Router & Telemedicine Client Architecture
│   ├── specs/                     # Engineering specifications
│   ├── tickets/                   # Tracer-bullet execution tickets (TICK-001 - TICK-007)
│   ├── typedoc/                   # Generated TypeScript API reference HTML docs
│   └── adr/                       # Architectural Decision Records
├── nginx/                         # Production reverse-proxy configuration
├── ci/                            # Environment variable injection templates
├── docker-compose.dev.yaml        # Local full-stack orchestration (Postgres, Redis, Apps)
├── docker-compose.prod.yaml       # Production compose definition
├── pnpm-workspace.yaml            # pnpm workspace definition
└── package.json                   # Root workspace lifecycle scripts
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 10.33.0`
- **Docker & Docker Compose**: (Required for local PostgreSQL & Redis)

### Option 1: Full-Stack Docker Compose (Recommended)
Spins up PostgreSQL, Redis, backend, and frontend with hot reloading:
```bash
docker compose -f docker-compose.dev.yaml up
```
- **Frontend Client**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI 3.0 Spec**: [http://localhost:5000/api/v1/openapi.json](http://localhost:5000/api/v1/openapi.json)
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

### Option 2: Native pnpm Setup
1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Configuration**:
   - Backend: Copy `backend/.env.example` (or configure required variables) in `backend/.env`.
   - Frontend: Configure `frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1`.

3. **Database Migration & Generation**:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Launch Development Servers**:
   ```bash
   # Run both backend and frontend concurrently
   pnpm dev:backend   # Express on port 5000
   pnpm dev:frontend  # Next.js on port 3000
   ```

---

## 🧪 Automated Testing Suite

The platform enforces deterministic, sub-second test execution across both tiers using **Vitest**:

```bash
# Run tests across entire monorepo (backend + frontend)
pnpm test

# Run backend tests only (Vitest + Supertest + Prisma Mocks)
pnpm test:backend

# Run frontend tests only (Vitest + React Testing Library + jsdom)
pnpm test:frontend

# Run tests in watch mode
pnpm --filter backend-ph-healthcare test:watch
pnpm --filter frontend-ph-healthcare test:watch
```

---

## 🛠️ Monorepo Command Reference

| Command | Action |
| :--- | :--- |
| `pnpm dev:backend` | Launch Express backend in tsx watch mode |
| `pnpm dev:frontend` | Launch Next.js 16 frontend development server |
| `pnpm test` | Execute full-stack automated test suite |
| `pnpm test:backend` | Execute backend Vitest + Supertest tests |
| `pnpm test:frontend` | Execute frontend Vitest + RTL tests |
| `pnpm typecheck` | Run TypeScript type checks across all workspaces |
| `pnpm lint` | Run ESLint across all workspaces |
| `pnpm build` | Compile backend (`tsc`) and frontend (`next build`) |
| `pnpm db:migrate` | Apply Prisma database migrations |
| `pnpm db:generate` | Regenerate Prisma client from modular schemas |
| `pnpm db:studio` | Launch Prisma Studio GUI browser |
| `pnpm docs:typedoc` | Generate static HTML TypeDoc documentation into `docs/typedoc/` |

---

## 📚 Documentation Index

| Resource | Description | Path / URL |
| :--- | :--- | :--- |
| **Interactive API Docs** | OpenAPI 3.0 interactive Swagger UI | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) |
| **Raw OpenAPI Spec** | Machine-readable OpenAPI 3.0 JSON specification | [http://localhost:5000/api/v1/openapi.json](http://localhost:5000/api/v1/openapi.json) |
| **SRS Document** | IEEE 830-aligned Software Requirements Specification | [`docs/srs.md`](docs/srs.md) |
| **Backend Technical Design** | Layered modular architecture, QueryBuilder & data model | [`docs/backend_design.md`](docs/backend_design.md) |
| **Frontend Architecture** | Next.js 16 App Router, TanStack Query, WebRTC calling | [`docs/frontend_architecture.md`](docs/frontend_architecture.md) |
| **TypeScript API Reference** | TypeDoc-generated HTML code documentation | [`docs/typedoc/index.html`](docs/typedoc/index.html) |
| **Architecture Decisions** | Context, options, and consequences for key decisions | [`docs/adr/`](docs/adr/) |

---

## 🚢 CI/CD & Production Deployment

Continuous Integration and Deployment is orchestrated via GitHub Actions ([`.github/workflows/cicd.yml`](.github/workflows/cicd.yml)):
1. **Lint & Typecheck**: ESLint and `tsc --noEmit` verification.
2. **Automated Testing Gate**: `pnpm test:backend` and `pnpm test:frontend` must pass before any build starts.
3. **Containerization**: Multi-stage Docker images built and pushed to Docker Hub (`medix-backend`, `medix-frontend`).
4. **Zero-Downtime Deployment**: Triggers deployment webhooks to Render / hosting infrastructure.

---

## 🔒 Security & Compliance

- **Authentication**: BetterAuth session cookies coupled with stateless, role-based JWT bearer tokens.
- **Authorization**: Granular RBAC (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`) enforced at middleware seams.
- **Data Integrity**: Enforced state machines for appointment lifecycles and transactions freeing schedule slots on cancellation.
- **Payment Compliance**: Stripe Checkout with HMAC signature verification on webhook events.
