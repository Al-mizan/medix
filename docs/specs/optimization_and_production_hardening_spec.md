# Specification: Medix Optimization & Production Hardening

- **Status**: Approved / Ready for Implementation
- **Author**: Lead Architect (Synthesis from to-spec & implementation plan)
- **Date**: 2026-09-28
- **Related Documents**: [CONTEXT.md](../../CONTEXT.md), [srs.md](../srs.md), [backend_design.md](../backend_design.md), [frontend_architecture.md](../frontend_architecture.md), [frontend_completion_spec.md](frontend_completion_spec.md)
- **Tickets**: [TICK-020](../tickets/TICK-020-prefactor-security-headers-cors.md) through [TICK-032](../tickets/TICK-032-automated-testing-lighthouse-ci.md)

---

## 1. Problem Statement

Medix is a full-stack digital healthcare management platform (Next.js 16 App Router, Express 5, Prisma 7, PostgreSQL + pgvector, Upstash Redis, BetterAuth + JWT, Stripe) built for patient consultations, doctor scheduling, electronic health records, and AI clinical knowledge retrieval.

While functional features are in place and previous UX issues have been resolved, the application requires production hardening across six pillars before deployment as a public showcase:
1. **Security**: Hardcoded localhost CORS in all environments, absent rate limiting on auth and API endpoints, and missing HTTP security response headers.
2. **Performance & Scalability**: Redis is underutilized (restricted to RAG query caching), missing API payload compression (gzip/brotli), unanalyzed database queries, potential N+1 relation queries, and un-debounced doctor search inputs.
3. **SEO & Discoverability**: Doctor profiles are missing from `sitemap.ts`, public pages lack canonical link tags, structured data (JSON-LD) is missing, and AI crawler documentation (`llms.txt`) is absent.
4. **UI/UX Resilience**: Missing skeleton screens for data-heavy views, unoptimized client bundle chunks for non-critical dashboard dependencies (e.g., Recharts), and missing mobile viewport validation.
5. **Trust & Governance**: Cookie consent validation and audit of privacy/terms disclosures.
6. **Automated Verification**: Vitest test coverage is currently minimal (1 backend test, 0 frontend tests) and Lighthouse CI is not integrated into GitHub Actions.

---

## 2. Proposed Solution & Architecture

The hardening strategy executes Option B: a structured, 6-phase foundation organized into 13 vertical tracer-bullet tickets (TICK-020 through TICK-032). Each ticket is sized for a single agent context session with explicit blocking dependencies.

```
                    [TICK-020: Security Headers & CORS & DevTools]
                                     |
               +---------------------+---------------------+
               |                                           |
    [TICK-021: Rate Limiter]                   [TICK-022: Compression & Uploads]
               |                                           |
    [TICK-024: Redis Caching]                  [TICK-023: EXPLAIN & Query Tuning]
               |                                           |
    [TICK-026: Doctor Search]                  [TICK-025: Universal Pagination]
               |                                           |
    [TICK-027: Dynamic Imports]                [TICK-028: Sitemap & Canonicals]
               |                                           |
    [TICK-030: Skeletons & Forms]              [TICK-029: JSON-LD, Favicons, llms.txt]
               |                                           |
               +---------------------+---------------------+
                                     |
                    [TICK-031: Legal, Analytics & Trust]
                                     |
                    [TICK-032: Integration Tests & CI]
```

### 2.1 Scope & Architectural Seams

| Pillar | Seam / Interface | Implementation Target |
|:---|:---|:---|
| **Security** | Express HTTP pipeline & Next.js config | `app.ts` CORS origin whitelist, `next.config.ts` security headers (`X-Frame-Options`, `CSP`, `HSTS`), `rateLimit.ts` sliding-window middleware. |
| **Performance** | Service layer caching & Express middleware | `compression` middleware in Express, `withCache` helper in `redisService` wrapping `DoctorService` and `SpecialtyService`, `useDebouncedSearch` hook in consultation UI. |
| **Database** | Prisma query builder & PostgreSQL indexes | `QueryBuilder.ts` pagination enforcement, `Appointment(status, createdAt)` composite index, EXPLAIN ANALYZE query verification. |
| **SEO** | App Router metadata & route handlers | `sitemap.ts` dynamic doctor route generator, `alternates.canonical` across all public pages, reusable `<JsonLd />` component emitting Schema.org schemas (`MedicalOrganization`, `Physician`, `MedicalClinic`). |
| **UI/UX** | Client components & dynamic boundary | `next/dynamic` boundaries for `recharts` and `socket.io-client`, Tailwind/shadcn Skeleton states for consultation and dashboard tables. |
| **Trust** | Cookie consent & legal routes | Verification of `CookieConsentBanner.tsx` blocking `GoogleAnalytics.tsx` until consent confirmation. |
| **Testing** | Vitest test suites & GitHub Actions | Backend integration tests (`supertest` + `vitest`), frontend RTL component tests, `.github/workflows/lighthouse.yml`. |

---

## 3. Test Strategy & Verification Seams

1. **HTTP Security Seam**: Verified via `curl -I` and automated tests asserting headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`).
2. **Rate Limiting Seam**: Verified via automated loop firing 15 requests within 10s against `/api/v1/auth/login`, asserting HTTP 429 Too Many Requests with `Retry-After` header.
3. **Database Performance Seam**: Verified by running PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` on filtered doctor search and appointment cancellation queries to ensure Index Scan rather than Sequential Scan.
4. **Caching Seam**: Verified by querying `GET /api/v1/doctors` twice in succession; latency of second query must be < 15ms and verify Redis key existence with appropriate TTL.
5. **SEO & Structured Data Seam**: Validated against Google Rich Results Validator format and schema markup parser for valid JSON-LD tags.
6. **Frontend Bundle Seam**: Verified via Next.js standalone build analysis ensuring initial client chunk size is below budget and code splitting isolates dynamic modules.

---

## 4. Acceptance Criteria Checklist

- [ ] **SEC-01**: In production (`NODE_ENV=production`), CORS denies unlisted origins and strips `localhost:3000` / `localhost:5000`.
- [ ] **SEC-02**: Redis-backed sliding-window rate limiting is active on `/api/v1/auth/*` (10 req/min) and general endpoints (100 req/min).
- [ ] **SEC-03**: Next.js responses emit `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and restrictive `Permissions-Policy`.
- [ ] **SEC-04**: Production browser source maps are disabled in `next.config.ts`.
- [ ] **SEC-05**: Multer configuration rejects disallowed MIME types and files larger than 25MB.
- [ ] **PERF-01**: API responses for JSON payloads > 1KB return gzip/brotli encoded when requested.
- [ ] **PERF-02**: Core read endpoints (`/doctors`, `/specialties`, `/schedules`) serve from Redis on cache hit with automatic invalidation on mutations.
- [ ] **PERF-03**: Doctor search input is debounced by 300ms, syncing query parameters to the URL without full-page reloads.
- [ ] **PERF-04**: Heavy dashboard dependencies (`recharts`, `socket.io-client`) load asynchronously via `next/dynamic`.
- [ ] **SEO-01**: `sitemap.xml` dynamically indexes all active verified doctor consultation URLs (`/consultation/doctor/[id]`).
- [ ] **SEO-02**: All public routes have declared `alternates.canonical` tags matching their canonical URL.
- [ ] **SEO-03**: Valid JSON-LD structured data renders on the homepage (`MedicalOrganization`) and doctor profile (`Physician`).
- [ ] **SEO-04**: `public/llms.txt` is served for AI crawlers describing Medix architecture and capabilities.
- [ ] **UI-01**: Skeleton loading placeholders appear during data fetching on `/consultation` and `/dashboard` views.
- [ ] **UI-02**: Inline field validation errors appear on authentication and appointment booking forms.
- [ ] **CI-01**: Vitest test suites cover auth flows, appointment CRUD, and consultation components.
- [ ] **CI-02**: Lighthouse CI runs in GitHub Actions with performance, accessibility, and SEO budgets.
