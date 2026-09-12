# [TICK-006] Frontend Architecture Documentation & TSDoc Standardization

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.2 (Step 3), §4](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-005
- **Blocks**: TICK-007

---

## Objective
Author an in-depth Next.js frontend architecture document (`docs/frontend_architecture.md`) detailing component boundaries, TanStack Query cache patterns, auth synchronization, and WebRTC peer-to-peer telemedicine. Enrich deep codebase modules across backend and frontend with standard TSDoc docstrings for automated API reference parsing.

---

## Detailed Tasks
1. **Frontend Architecture Document (`docs/frontend_architecture.md`)**:
   - **App Router Directory Structure**:
     - Explain route groups (`(public)`, `(dashboard)`, etc.), layout hierarchies, and parallel/intercepting routes.
   - **Server Components vs Client Components**:
     - Clear rules for RSC vs `'use client'` boundaries (data-fetching at server boundaries, interactive state in client leaves).
   - **State & Data Caching (TanStack Query v5)**:
     - Query key factory patterns, mutation invalidation rules, optimistic updates.
   - **Authentication & Session Synchronization**:
     - Token storage (cookies/storage), HTTP header injection, token refresh flow, route guards.
   - **WebRTC Peer-to-Peer Telemedicine Architecture**:
     - Step-by-step signaling flow: room creation via appointment ID, SDP offer/answer exchange, ICE candidate trickle via WebSocket.
     - STUN (Google free STUN) and self-hosted TURN (Coturn on VPS) relay fallback.
     - Audio/video media stream lifecycle, device permissions, and connection state management.
   - **Form Validation & UI Component System**:
     - React Hook Form + Zod schema validation, Tailwind v4 design tokens, accessible components.
2. **TSDoc Annotations across Deep Modules**:
   - Backend shared engine:
     - Annotate `QueryBuilder.ts` (all builder methods: `search`, `filter`, `paginate`, `sort`, `dynamicInclude`, `execute`).
     - Annotate `checkAuth.ts`, `validateRequest.ts`, `catchAsync.ts`, `sendResponse.ts`, `AppError.ts`.
     - Annotate `AppointmentService.ts` state transition methods.
   - Frontend core utilities & custom hooks:
     - Annotate API client fetcher, auth helper functions, WebRTC hooks.

---

## Verification
- Review `docs/frontend_architecture.md` against SRS and architecture specifications.
- Verify that all TSDoc tags (`@param`, `@returns`, `@throws`, `@example`, `@remarks`) conform to TSDoc standard.
