# Medix Backend — Architecture & Design Document

> **Version**: 1.0  
> **Last Updated**: 2026-09-12  
> **Status**: Living Document

---

## 1. Purpose

This document captures the backend architecture, design decisions, data model, module structure, and infrastructure of the Medix digital healthcare platform. It serves as the canonical reference for contributors, reviewers, and AI agents working on the system.

---

## 2. System Overview

Medix is a healthcare management platform connecting four actor types — **Super Admin**, **Admin**, **Doctor**, and **Patient** — through appointment booking, electronic health records, prescription management, payment processing, and AI-powered clinical knowledge retrieval.

The backend is a RESTful API built on **Express 5** running on **Node.js 22**, written in **TypeScript 5**, with **Prisma 7** as the ORM over **PostgreSQL 16**.

### 2.1 High-Level Request Flow

```
Client → Nginx → Express App
                    ├─ POST /webhook (raw body) → Stripe Webhook Handler
                    ├─ /api/auth/* → BetterAuth Handler (sessions, OAuth)
                    └─ /api/v1/* → Route → checkAuth → validateRequest → Controller → Service → Prisma → PostgreSQL
```

### 2.2 Bounded Contexts

```
┌──────────────────────────────────────────────────────────────────┐
│                         MEDIX PLATFORM                           │
├──────────────────┬──────────────────────┬────────────────────────┤
│  Auth & Identity │  Clinical Operations │  Patient Care & EHR    │
│  - BetterAuth    │  - Doctors           │  - Patients            │
│  - JWT Auth      │  - Specialties       │  - Medical Reports     │
│  - RBAC          │  - Schedules         │  - Health Metrics      │
│  - Google OAuth  │  - Appointments      │  - Prescriptions       │
├──────────────────┴──────────────────────┼────────────────────────┤
│       Financial & Transactions          │    AI Assistant / RAG  │
│       - Stripe Webhooks                 │    - pgvector          │
│       - Invoice Generation (PDFKit)     │    - Document Chunks   │
│       - Payment Status Lifecycle        │    - Groq / HuggingFace│
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology |
|:---|:---|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| Language | TypeScript 5.9 |
| ORM | Prisma 7 (multi-file schema, PostgreSQL adapter via `@prisma/adapter-pg`) |
| Database | PostgreSQL 16 + `pgvector` extension |
| Cache | Upstash Redis (serverless, TLS) |
| Authentication | BetterAuth + custom JWT (access + refresh tokens) |
| Social Auth | Google OAuth 2.0 |
| Payments | Stripe API & Webhooks |
| Object Storage | Cloudinary (images, PDFs) |
| File Upload | Multer + `multer-storage-cloudinary` |
| Email | Nodemailer (SMTP) + EJS templates |
| PDF Generation | PDFKit (invoices, prescriptions) |
| AI/RAG | HuggingFace `all-MiniLM-L6-v2` embeddings (384d) + Groq `llama-3.3-70b-versatile` |
| Validation | Zod 4 |
| Task Scheduling | `node-cron` |
| Video Signaling | Socket.IO (planned) on Express |
| Video Transport | WebRTC (native `RTCPeerConnection`), STUN (Google public), coturn (self-hosted TURN) |
| Package Manager | pnpm 10 |
| Deployment | Docker (multi-stage Alpine), Render Free Tier |

---

## 4. Layered Architecture

Each feature is organized as a **module** following a strict layered pattern:

```
Route  →  Middleware  →  Controller  →  Service  →  Prisma ORM  →  PostgreSQL
```

### 4.1 Layer Responsibilities

| Layer | Responsibility | May Call |
|:---|:---|:---|
| **Route** | HTTP method + path mapping, middleware chaining | Middleware, Controller |
| **Middleware** | Auth guard (`checkAuth`), input validation (`validateRequest`), file upload (`multer`) | — |
| **Controller** | Parse request, invoke service, format response via `sendResponse` | Service |
| **Service** | Business logic, transaction orchestration, external API calls | Prisma, external services |
| **Prisma ORM** | Query building, migrations, type-safe DB access | PostgreSQL |

> **Rule**: Controllers never call Prisma directly. Services never set HTTP status codes.

### 4.2 Shared Infrastructure

| Module | Purpose |
|:---|:---|
| `catchAsync` | Wraps async route handlers, forwards rejections to `next(error)` |
| `sendResponse` | Standardized JSON response: `{ success, message, data, meta }` |
| `AppError` | Custom error class with `statusCode` for controlled error responses |
| `globalErrorHandler` | Normalizes Prisma, Zod, and generic errors into `TErrorResponse`; cleans up uploaded files on failure |
| `QueryBuilder` | Generic Prisma query builder with chained `.search()`, `.filter()`, `.paginate()`, `.sort()`, `.fields()`, `.include()`, `.execute()` |

---

## 5. Data Model

The Prisma schema is split across 15 files in `prisma/schema/`. The generator outputs to `src/generated/prisma` and enables the `vector` PostgreSQL extension.

### 5.1 Entity-Relationship Overview

```
User (1)──(1) Patient ──(1?) PatientHealthData
  │                  ├──(*)  MedicalReport
  │                  ├──(*)  Appointment ──(1?) Prescription
  │                  │           │         ├──(1?) Review
  │                  │           │         └──(1?) Payment
  │                  │           ├── Doctor
  │                  │           └── Schedule
  │                  └──(*)  Review
  │
  ├──(1) Doctor ──(*) DoctorSpecialty ──(*) Specialty
  │           ├──(*) DoctorSchedules ──(*) Schedule
  │           ├──(*) Appointment
  │           ├──(*) Prescription
  │           └──(*) Review
  │
  ├──(1) Admin
  ├──(*) Session
  └──(*) Account

Standalone:
  Verification (email OTP tokens)
  DocumentEmbedding (RAG vector store)
```

### 5.2 Enums

| Enum | Values |
|:---|:---|
| `Role` | `SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT` |
| `UserStatus` | `ACTIVE`, `BLOCKED`, `DELETED` |
| `Gender` | `MALE`, `FEMALE`, `OTHER` |
| `BloodGroup` | `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE` |
| `AppointmentStatus` | `SCHEDULED`, `INPROGRESS`, `COMPLETED`, `CANCELED` |
| `PaymentStatus` | `PAID`, `UNPAID`, `REFUNDED`, `FAILED` |

### 5.3 Key Models

| Model | Table | PK Strategy | Soft Delete | Notes |
|:---|:---|:---|:---|:---|
| `User` | `user` | BetterAuth string ID | `isDeleted` + `deletedAt` | Central identity, owns role-specific profile |
| `Doctor` | `doctor` | `uuid(7)` | `isDeleted` + `deletedAt` | `registrationNumber` unique, `averageRating` computed |
| `Patient` | `patient` | `uuid(7)` | `isDeleted` + `deletedAt` | Linked to health data, reports, appointments |
| `Admin` | `admins` | `uuid(7)` | `isDeleted` + `deletedAt` | Linked to User |
| `Specialty` | `specialties` | `uuid(7)` | `isDeleted` + `deletedAt` (schema-only) | Many-to-many with Doctor via `DoctorSpecialty` |
| `Schedule` | `schedules` | `uuid(7)` | No | 30-min time slots |
| `DoctorSchedules` | `doctor_schedules` | Composite `[doctorId, scheduleId]` | No | `isBooked` flag |
| `Appointment` | `appointments` | `uuid(7)` | No | `videoCallingId` (UUID), links patient + doctor + schedule |
| `Payment` | `payments` | `uuid(7)` | No | `transactionId` (UUID), `stripeEventId` unique for idempotency |
| `Prescription` | `prescriptions` | `uuid(7)` | No | 1:1 with Appointment, PDF stored on Cloudinary |
| `Review` | `reviews` | `uuid(7)` | No | 1:1 with Appointment, recalculates doctor `averageRating` |
| `PatientHealthData` | `patient_health_data` | `uuid(7)` | No | 1:1 with Patient |
| `MedicalReport` | `medical_reports` | `uuid(7)` | No | File link to Cloudinary |
| `DocumentEmbedding` | `document_embeddings` | `uuid(7)` | `isDeleted` + `deletedAt` | 384d vector via `pgvector`, SHA-256 `chunkKey` |

### 5.4 Key Relationships

- **User ↔ Role Profile**: One-to-one between `User` and exactly one of `Patient`, `Doctor`, or `Admin`. Cascade delete from User to profile.
- **Doctor ↔ Specialty**: Many-to-many through `DoctorSpecialty` join table with unique constraint `[doctorId, specialtyId]`.
- **Doctor ↔ Schedule**: Many-to-many through `DoctorSchedules` with composite primary key and `isBooked` booking flag.
- **Appointment**: Links `Patient`, `Doctor`, and `Schedule`. Has optional one-to-one `Prescription`, `Review`, and `Payment`.
- **Cascade Deletes**: User deletion cascades to Session, Account, and role-specific profile.

---

## 6. Authentication & Authorization

### 6.1 Dual Auth Strategy

The system uses **two parallel authentication mechanisms**:

1. **BetterAuth Sessions**: Cookie-based (`better-auth.session_token`), managed by BetterAuth with Prisma adapter. Handles signup, login, OAuth, email verification, password reset via OTP.
2. **Custom JWT Tokens**: `accessToken` and `refreshToken` signed with separate secrets, stored as HTTP-only secure cookies. Used by `checkAuth` middleware for API authorization.

Both are validated on every authenticated request. If the BetterAuth session is nearing expiry (<20% remaining), the middleware appends `X-Session-Refresh: true` header.

### 6.2 Role-Based Access Control (RBAC)

Authorization is enforced at the route level via `checkAuth(...roles: Role[])`:

```typescript
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), Controller.method);
```

### 6.3 Social Authentication

Google OAuth 2.0 is configured through BetterAuth's social provider plugin. OAuth users are mapped to the `PATIENT` role. After successful OAuth callback, the system ensures a `Patient` record exists, signs JWT tokens, and redirects to the frontend dashboard.

> **Restriction**: Google OAuth users cannot use email OTP workflows (verification, forgot password).

### 6.4 Super Admin Seeding

On server startup, `seedSuperAdmin()` checks if the configured Super Admin email exists. If not, it creates the user via BetterAuth signup and creates a corresponding `Admin` record.

---

## 7. Module Inventory

### 7.1 Route Registry

All API routes mount under `/api/v1` via the central `IndexRoutes` router:

| Prefix | Module | Auth Required |
|:---|:---|:---|
| `/auth` | Auth | Mixed (public + authenticated) |
| `/users` | User | Mixed |
| `/admins` | Admin | `ADMIN`, `SUPER_ADMIN` |
| `/doctors` | Doctor | Mixed |
| `/patients` | Patient | `PATIENT` |
| `/specialties` | Specialty | Mixed |
| `/schedules` | Schedule | `ADMIN`, `SUPER_ADMIN`, `DOCTOR` |
| `/doctor-schedules` | DoctorSchedule | `DOCTOR`, `ADMIN`, `SUPER_ADMIN` |
| `/appointments` | Appointment | Mixed |
| `/prescriptions` | Prescription | `DOCTOR`, `ADMIN`, `SUPER_ADMIN` |
| `/reviews` | Review | Mixed |
| `/stats` | Stats | All authenticated roles |
| `/payments` | Payment | — (webhook only, mounted at root) |
| `/rag` | RAG | All authenticated roles (admin for write ops) |

### 7.2 Module File Convention

Each module follows this structure:

```
module/
└── {moduleName}/
    ├── {moduleName}.route.ts        # Route definitions
    ├── {moduleName}.controller.ts   # Request/response handling
    ├── {moduleName}.service.ts      # Business logic
    ├── {moduleName}.validation.ts   # Zod schemas
    ├── {moduleName}.interface.ts    # TypeScript types
    └── {moduleName}.constant.ts     # Constants (optional)
```

### 7.3 Module Summary

#### Auth
- Patient self-registration (email/password + BetterAuth signup + Patient record creation)
- Login with JWT issuance
- Token refresh
- Password change (revokes other sessions)
- Logout (clears all auth cookies)
- Email verification and password reset via 6-digit OTP
- Google OAuth flow with redirect

#### User
- Doctor creation (BetterAuth signup + Doctor + DoctorSpecialty records in transaction)
- Admin creation (BetterAuth signup + Admin record)

#### Admin
- CRUD for admin records (soft delete)
- Change user status (`ACTIVE` / `BLOCKED` / `DELETED`)
- Change user role (between `ADMIN` and `SUPER_ADMIN` only)

#### Doctor
- List all doctors (public, with `QueryBuilder` — search, filter, paginate, sort)
- Get doctor by ID (public)
- Update doctor profile and specialty associations
- Soft-delete doctor (cascades to sessions, specialty links)

#### Patient
- Get own profile (`GET /patients/my-profile`, includes health data & medical reports)
- Update own profile (`PATCH /patients/update-my-profile`, patient info, health data, medical reports with Cloudinary upload/delete)
- List all patients (`GET /patients`, admin/super admin, with `QueryBuilder` — search, filter, paginate, sort)
- Get patient by ID (`GET /patients/:id`, admin/super admin)
- Soft-delete patient (`DELETE /patients/:id`, admin/super admin, cascades to user and sessions)

#### Specialty
- CRUD for medical specialties with icon upload to Cloudinary

#### Schedule
- Generate 30-minute recurring time slots between date/time ranges
- CRUD with `QueryBuilder` support

#### DoctorSchedule
- Doctors self-assign schedule slots
- Bulk update (add/remove unbooked slots in transaction)
- Delete only if slot is not booked

#### Appointment
- Book appointment (creates Appointment + Payment, marks slot booked, creates Stripe checkout)
- Book with pay-later option
- Initiate payment for unpaid appointments
- View own appointments (role-filtered)
- Change appointment status
- Background cron: cancel unpaid appointments older than 30 minutes (every 25 minutes)

#### Payment
- Stripe webhook handler (`checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`)
- On successful payment: update status, generate PDF invoice (PDFKit), upload to Cloudinary, email invoice to patient

#### Prescription
- Doctor creates prescription for owned appointment (generates PDF, uploads to Cloudinary, emails patient)
- Update prescription (regenerates PDF, replaces old)
- Delete prescription (removes PDF from Cloudinary)
- View own prescriptions (role-filtered)

#### Review
- Patient reviews a paid appointment (rating 1–5 + comment)
- Updates doctor's `averageRating` via aggregate in transaction
- Update/delete own review (recalculates average)

#### Stats
- Role-based dashboard analytics:
  - **Super Admin / Admin**: Total counts (appointments, doctors, patients, admins, users, payments), total revenue, appointment status pie chart, monthly appointment bar chart
  - **Doctor**: Review count, unique patient count, appointments, revenue, status distribution
  - **Patient**: Appointment count, review count, status distribution

#### RAG (Retrieval-Augmented Generation)
- **Query**: Embed question → pgvector cosine similarity search → LLM synthesis (Groq) with Redis caching (30 min TTL)
- **Ingest**: Chunk text → SHA-256 dedup → embed via HuggingFace → store in `document_embeddings`
- **Reindex**: Bulk index markdown docs, doctor profiles, and specialties
- **Stats**: Embedding count grouped by source type
- Class-based architecture: `RagService`, `EmbeddingService`, `IndexingService`, `LlmService`

---

## 8. Middleware Pipeline

Request processing follows this order:

```
1. Stripe Webhook (raw body, before parsers)
2. CORS
3. BetterAuth handler (/api/auth/*)
4. Body parsers (urlencoded, JSON, cookies)
5. Route-level middleware:
   a. checkAuth(roles...)     — session + JWT validation, RBAC
   b. multer upload           — file handling (where needed)
   c. validateRequest(schema) — Zod validation (parses multipart JSON from req.body.data)
6. Controller
7. globalErrorHandler         — normalizes errors, cleans up uploaded files
8. notFound                   — 404 for unmatched routes
```

---

## 9. Error Handling Strategy

All errors pass through `globalErrorHandler` which produces a consistent response shape:

```json
{
  "success": false,
  "message": "Error description",
  "errorMessages": [{ "path": "field", "message": "details" }],
  "stack": "..." // only in development
}
```

### 9.1 Error Normalization

| Error Source | Handling |
|:---|:---|
| `AppError` | Custom status code, message passthrough |
| `ZodError` | Parsed into field-level error sources, HTTP 400 |
| Prisma `P2002` | Unique constraint → 409 Conflict |
| Prisma `P2025` / `P2001` | Record not found → 404 |
| Prisma `P1000` / `P6002` | Auth failure → 401 |
| Prisma timeout | 504 Gateway Timeout |
| Generic `Error` | 500 with message |

### 9.2 File Cleanup on Error

`globalErrorHandler` calls `deleteUploadedFilesFromGlobalErrorHandler(req)` to remove any Cloudinary uploads that occurred before the error, preventing orphaned files.

---

## 10. Caching Strategy

- **Technology**: Upstash Redis (serverless, TLS)
- **Wrapper**: `RedisService` class with `get`, `set`, `update`, `delete`, `isAvailable` methods
- **Current Usage**: RAG query caching with 30-minute TTL (`rag:query:{normalized_query}:{topK}:{minSim}:{sourceTypes}`)
- **Graceful Degradation**: Redis connection failures are caught and logged; the app continues without caching

---

## 11. Background Tasks

| Task | Trigger | Frequency | Logic |
|:---|:---|:---|:---|
| Cancel unpaid appointments | `node-cron` | Every 25 minutes | Finds `SCHEDULED` + `UNPAID` appointments older than 30 min, cancels them, deletes payment records, frees doctor schedule slots |

---

## 12. Email & PDF Generation

### 12.1 Email Templates (EJS)

| Template | Trigger | Content |
|:---|:---|:---|
| `otp` | Email verification, password reset | 6-digit OTP code |
| `invoice` | Successful payment | Invoice ID, patient/doctor info, amount (BDT), transaction ID |
| `prescription` | Prescription created/updated | Patient details, doctor info, instructions, follow-up date, PDF link |
| `googleRedirect` | Google OAuth | Auto-redirect page for social sign-in |

### 12.2 PDF Generation (PDFKit)

- **Invoice PDF**: Generated on successful Stripe payment, uploaded to Cloudinary, URL stored in `Payment.invoiceUrl`
- **Prescription PDF**: Generated when doctor creates/updates prescription, uploaded to Cloudinary, URL stored in `Prescription.pdfUrl`

---

## 13. External Service Integrations

| Service | Purpose | Configuration |
|:---|:---|:---|
| **Stripe** | Payment processing | Checkout sessions in BDT, webhook for payment events, idempotent via `stripeEventId` |
| **Cloudinary** | File storage | Images (`ph-healthcare/images/`), PDFs (`ph-healthcare/pdfs/`), invoices (`ph-healthcare/invoices/`) |
| **Google OAuth** | Social authentication | Via BetterAuth social provider plugin |
| **HuggingFace** | Embedding generation | `all-MiniLM-L6-v2`, 384-dimensional vectors |
| **Groq** | LLM inference | `llama-3.3-70b-versatile`, temperature 0.1 |
| **SMTP** | Email delivery | Configurable host/port/credentials via Nodemailer |

---

## 14. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Render Free Tier                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │  Nginx   │──→│ Backend  │──→│ Prisma Postgres  │ │
│  │ (reverse │   │ (Docker) │   │ (PostgreSQL 16   │ │
│  │  proxy)  │   │          │   │  + pgvector)     │ │
│  └──────────┘   └──────────┘   └──────────────────┘ │
│                      │                              │
│                      ├──→ Upstash Redis (TLS)       │
│                      ├──→ Cloudinary                │
│                      ├──→ Stripe                    │
│                      ├──→ HuggingFace API           │
│                      └──→ Groq API                  │
└─────────────────────────────────────────────────────┘
```

- **Docker**: Multi-stage Node 22 Alpine build (compile TS → copy dist + EJS templates)
- **CI/CD**: GitHub Actions (lint, build, push to Docker Hub, SSH deploy to VPS, run Prisma migrations)
- **Infrastructure as Code**: `render.yaml` blueprint

---

## 15. QueryBuilder Engine

The `QueryBuilder` is a generic, chainable Prisma query engine supporting:

| Method | Capability |
|:---|:---|
| `.search()` | Full-text search across direct fields and 1–2 level nested relations |
| `.filter()` | Range filters (`lt`, `gt`, `gte`, `lte`), string filters (`contains`, `startsWith`), set filters (`in`, `notIn`), dot-notation for nested relations |
| `.paginate()` | Page-based pagination (`page`, `limit`, computes `skip`/`take`) |
| `.sort()` | Sort by field or nested relation, `asc`/`desc` |
| `.fields()` | Column selection |
| `.include()` / `.dynamicInclude()` | Relation joins |
| `.where()` | Deep-merge custom Prisma conditions |
| `.execute()` | Runs `count` + `findMany` in parallel, returns `{ data, meta }` |

**Currently adopted in**: All list endpoints across Doctor, DoctorSchedule, Schedule, Admin, Appointment, Prescription, Review, Specialty, and Patient modules.

---

## 16. Known Design Gaps & Technical Debt

| # | Category | Issue | Impact | Status |
|:---|:---|:---|:---|:---|
| ~~1~~ | ~~Security~~ | ~~`POST /users/create-doctor` has no `checkAuth` middleware~~ | ~~Anyone can create doctor accounts~~ | ✅ Fixed |
| ~~2~~ | ~~Security~~ | ~~`POST /users/create-admin` allows `ADMIN` to create `SUPER_ADMIN`~~ | ~~Privilege escalation~~ | ✅ Fixed |
| ~~3~~ | ~~Security~~ | ~~`POST /specialties` has `checkAuth` commented out~~ | ~~Public specialty creation~~ | ✅ Fixed |
| ~~4~~ | ~~Security~~ | ~~`POST /users/create-admin` missing `validateRequest`~~ | ~~Unvalidated admin creation input~~ | ✅ Fixed |
| ~~5~~ | ~~Consistency~~ | ~~Specialty uses hard delete despite having `isDeleted`/`deletedAt` fields~~ | ~~Schema-code mismatch~~ | ✅ Fixed |
| ~~6~~ | ~~Consistency~~ | ~~Schedule uses hard delete without checking bookings~~ | ~~Orphaned data or cascade risk~~ | ✅ Fixed (association guard added) |
| 7 | Validation | Empty validation files for DoctorSchedule, Payment | No input validation on schedule assignment/payments | Open (Appointment fixed) |
| ~~8~~ | ~~Pagination~~ | ~~Admin, Appointment, Prescription, Review, Specialty lack QueryBuilder~~ | ~~Unbounded result sets~~ | ✅ Fixed |
| ~~9~~ | ~~Access~~ | ~~`GET /doctors/:id` restricted to Admin/SuperAdmin~~ | ~~Patients cannot view individual doctor profiles~~ | ✅ Fixed |
| ~~10~~ | ~~Naming~~ | ~~Mixed `.route.ts` / `.routes.ts` file naming~~ | ~~Inconsistent convention~~ | ✅ Fixed |
| ~~11~~ | ~~Logic~~ | ~~Admin `deleteAdmin` self-check compares `Admin.id` against `User.id`~~ | ~~Mismatched entity comparison~~ | ✅ Fixed |
| ~~12~~ | ~~Logic~~ | ~~`changeAppointmentStatus` does not enforce status transition rules~~ | ~~Any valid status can be set~~ | ✅ Fixed |
| ~~13~~ | ~~Currency~~ | ~~BDT hardcoded in Stripe sessions~~ | ~~No multi-currency support~~ | ✅ Fixed (configurable via `PAYMENT_CURRENCY`) |

---

## 17. Planned: Video Calling (WebRTC)

The overall design includes a "Video Calling Session" between doctor and patient upon appointment completion. The `Appointment` model already has a `videoCallingId` (UUIDv7) field reserved for this purpose.

### 17.1 Architecture

```
Patient Browser                    Express Server                     Doctor Browser
     │                                  │                                   │
     ├── getUserMedia() ───────────────►│                                   │
     │                                  │◄──────────────── getUserMedia() ──┤
     │                                  │                                   │
     ├── Socket.IO connect ────────────►│◄──────────── Socket.IO connect ───┤
     │          (join room: appointmentId)           (join room: appointmentId)
     │                                  │                                   │
     │   ┌──────────────────────────────┤                                   │
     │   │ Auth: verify both users      │                                   │
     │   │ belong to this appointment   │                                   │
     │   └──────────────────────────────┤                                   │
     │                                  │                                   │
     ├── SDP Offer ────────────────────►│── relay SDP Offer ───────────────►│
     │                                  │                                   │
     │◄─────────────── relay SDP Answer─│◄──────────────── SDP Answer ──────┤
     │                                  │                                   │
     ├── ICE Candidates ───────────────►│── relay ICE ─────────────────────►│
     │◄─────────────── relay ICE ───────│◄──────────────── ICE Candidates ──┤
     │                                  │                                   │
     │◄════════════ Direct P2P Media (STUN success) ═══════════════════════►│
     │                                  │                                   │
     │◄═══════ Relayed Media via TURN (fallback ~15-20%)═══════════════════►│
```

### 17.2 Components

| Component | Technology | Hosting |
|:---|:---|:---|
| Signaling Server | Socket.IO (or plain `ws`) on Express | Same server |
| NAT Discovery | STUN (`stun.l.google.com:19302`) | Google public STUN |
| Relay Fallback | coturn (self-hosted TURN) | Oracle Cloud free tier or Fly.io |
| Client SDK | Native `RTCPeerConnection` API or `simple-peer` | Browser |

### 17.3 Design Decisions

1. **Signaling via Socket.IO**: Wire into the existing Express HTTP server. Create a room per `appointment.videoCallingId`. Relay only SDP offers/answers and ICE candidates — the server never touches media.
2. **STUN for NAT Discovery**: Point `RTCPeerConnection` at public STUN (`stun.l.google.com:19302`). This establishes direct peer-to-peer connections for the majority of cases with zero media server cost.
3. **Self-hosted TURN Relay**: ~15-20% of connections (mobile carrier NAT, hospital/clinic firewalls) need a relay. Self-host coturn on a free-tier VPS (Oracle Cloud / Fly.io) to keep the stack free and fully under control.
4. **Auth Integration**: Room ID derived from `appointment.videoCallingId`. Server-side verification ensures both the joining doctor and patient belong to the specific booked appointment before the signaling server pairs them.
5. **Client Implementation**: Use the native `RTCPeerConnection` API directly (or `simple-peer` to reduce boilerplate). Capture local media with `getUserMedia`, create offer/answer, exchange ICE candidates through Socket.IO.

### 17.4 Compliance Considerations

Doctor-patient video carries data-privacy obligations depending on jurisdiction:
- Bangladesh's data protection rules
- HIPAA-style requirements if serving US users
- Other applicable frameworks based on user base geography

Self-hosting reduces exposure since no vendor touches patient media, but does not eliminate the need to verify requirements for the actual jurisdiction and user base. Legal review is required before production deployment.

