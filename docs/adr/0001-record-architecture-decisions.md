# ADR 0001: Monorepo Architecture and Core Technology Stack

## Status
Accepted

## Context
Medix is a healthcare management platform integrating patient scheduling, doctor workflows, electronic medical records, payment processing, and clinical RAG vector searches. We needed an engineering structure that supports rapid full-stack iteration, strict type sharing, and unified deployment pipelines.

## Decision
1. **Repository Structure**: Use a `pnpm` monorepo managing isolated packages (`backend`, `frontend`) and deployment scripts.
2. **Frontend Framework**: Next.js 16 (React 19) with Tailwind CSS v4 and shadcn/ui. Uses standalone build mode for containerization.
3. **Backend Service**: Express 5 on Node.js 22 with TypeScript 5, structured into modular feature domains (`auth`, `doctor`, `patient`, `appointment`, `payment`, `prescription`, `rag`).
4. **Database & ORM**: PostgreSQL with Prisma 7, utilizing Prisma's multi-file schema feature (`prisma/schema/*.prisma`) and `pgvector` for similarity embeddings.
5. **Caching & Ephemeral State**: Upstash Redis (Serverless) for distributed locking, rate-limiting, and short-term caching.
6. **Authentication**: BetterAuth integrated alongside custom JWT access/refresh token validation.

## Consequences
- **Positive**:
  - Full TypeScript type-safety across backend models and frontend API interactions.
  - Granular schema evolution with Prisma multi-file schemas.
  - Native vector similarity capabilities directly inside PostgreSQL without a separate vector database.
- **Tradeoffs**:
  - Requires `pgvector` extension support in target PostgreSQL environments.
  - Multi-file Prisma schemas require Prisma 7 preview flags and coordinated migration steps.
