# Specification: Full-Stack Automated Testing & Comprehensive Documentation

- **Status**: Approved / Ready for Implementation
- **Author**: Lead Architect
- **Date**: 2026-09-12
- **Related Documents**: [backend_design.md](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/backend_design.md), [srs.md](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/srs.md), [CONTEXT.md](file:///mnt/workspace/Projects/hobby/digital-healthcare/CONTEXT.md)

---

## 1. Problem Statement

1. **Absence of Automated Testing**:
   - `backend/package.json` specifies `"test": "echo \"Error: no test specified\" && exit 1"`.
   - `frontend/package.json` has no test runner or testing libraries installed.
   - `.github/workflows/cicd.yml` lints and builds, but does not execute automated tests before deploying to the VPS.
   - Critical backend domain logic (appointment state machine, QueryBuilder engine, privilege escalation guards) lacks automated regression protection.

2. **Gaps in Developer and API Documentation**:
   - **REST API Docs**: No interactive OpenAPI / Swagger UI interface exists. Developers and frontend integrators must manually inspect route and controller source code to discover parameters, headers, and response formats.
   - **TypeScript API Reference**: Deep shared utilities (`QueryBuilder`, `checkAuth`, `validateRequest`, `AppError`) lack formal TypeDoc reference generation.
   - **Next.js Architecture**: Next.js 16 App Router conventions, server/client component boundaries, TanStack Query caching, and WebRTC video calling flows are undocumented.
   - **READMEs**: The root and package READMEs are out of date with current scripts, testing workflows, and API endpoints.

---

## 2. Proposed Solution

### 2.1 Testing Architecture

- **Backend**:
  - Framework: **Vitest** (native ESM compatibility with `"type": "module"`).
  - HTTP Integration: **Supertest** for testing Express app endpoints.
  - Testing Boundary: **Approach A (Mock-heavy unit testing)** with mocked Prisma Client. Runs deterministically in sub-second times without Docker or database dependencies.
- **Frontend**:
  - Framework: **Vitest** + **React Testing Library** + **@testing-library/jest-dom**.
  - Environment: **jsdom**.
- **Monorepo & CI/CD**:
  - Root `package.json` script: `"test": "pnpm --recursive run test"`.
  - Wired into `.github/workflows/cicd.yml` directly after `typecheck` and before `build`.

### 2.2 Documentation Suite & Pipeline

Execution Order: **0. Testing → 1. README → 2. OpenAPI → 3. Architecture Docs → 4. TypeDoc**

1. **Step 1: READMEs**:
   - Monorepo `README.md`: System overview, quick start, test execution, documentation index, deployment instructions.
   - `backend/README.md`: API architecture, module catalog, environment variables, Swagger UI URL, testing guide.
   - `frontend/README.md`: Next.js 16 App Router overview, component architecture, state management, UI testing.
2. **Step 2: REST API Documentation (OpenAPI + Swagger UI)**:
   - Framework: **Option A (Code-First / Zod-driven)** utilizing native Zod 4 `toJSONSchema` and structured metadata.
   - Endpoints:
     - `GET /api-docs`: Interactive Swagger UI (publicly accessible).
     - `GET /api/v1/openapi.json`: Complete OpenAPI 3.0 JSON specification.
3. **Step 3: Architecture Docs (Next.js + TSDoc)**:
   - `docs/frontend_architecture.md`: App Router structure, Server vs Client components, TanStack Query state & cache invalidation, form handling, BetterAuth session token sync, WebRTC P2P calling client.
   - TSDoc annotations on deep modules in `backend/src` and `frontend/src`.
4. **Step 4: TypeDoc (TypeScript API Reference)**:
   - Output Directory: `docs/typedoc/`.
   - Scope: Backend services, QueryBuilder engine, middleware, interfaces, error utilities.
   - Script: `pnpm run docs:typedoc`.

---

## 3. Test Strategy & Seams

| Layer | Seam / Interface | Verification Focus | Tooling |
|:---|:---|:---|:---|
| **Query Engine** | `QueryBuilder.ts` | Search, filtering (range/string/set), pagination, sorting, dynamic include | Vitest Unit |
| **Domain Logic** | `AppointmentService.changeAppointmentStatus` | State machine transition enforcement (Doctor, Patient, Admin) & slot freeing | Vitest + Mocked Prisma |
| **HTTP Routing** | `app.ts` Express entry | 404 handler, error response format, health check, auth guards | Supertest |
| **UI Components** | React component render | DOM rendering, user interactions, accessibility attributes | RTL + jsdom |
| **Pipeline** | GitHub Actions | Automated pass/fail gate on pull request and push | CI Workflow |

---

## 4. Acceptance Criteria

- [ ] **AC-TEST-01**: `pnpm --filter backend-ph-healthcare test` passes with 0 failures.
- [ ] **AC-TEST-02**: `pnpm --filter frontend-ph-healthcare test` passes with 0 failures.
- [ ] **AC-TEST-03**: `pnpm test` runs tests across both workspaces and exits with code 0.
- [ ] **AC-TEST-04**: `.github/workflows/cicd.yml` executes `pnpm test`.
- [ ] **AC-DOC-01**: Root `README.md`, `backend/README.md`, and `frontend/README.md` are updated and accurate.
- [ ] **AC-DOC-02**: `GET /api-docs` renders interactive Swagger UI; `GET /api/v1/openapi.json` returns valid OpenAPI 3.0 specification.
- [ ] **AC-DOC-03**: `docs/frontend_architecture.md` is published; TSDoc annotations added to deep modules.
- [ ] **AC-DOC-04**: `pnpm run docs:typedoc` generates static HTML documentation into `docs/typedoc/`.
