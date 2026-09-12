# Medix API — Backend Architecture & Reference

The backend for Medix is an enterprise-grade, high-availability RESTful healthcare API built with **Node.js 22**, **Express 5**, **TypeScript**, and **Prisma 7**.

---

## 🏛️ Architecture Pattern

```text
HTTP Request ──► Route ──► Middleware (checkAuth, validateRequest) ──► Controller ──► Service ──► Prisma ORM ──► PostgreSQL / Redis
```

The system follows a **3-tier Layered Modular Monolith** pattern:
1. **Route Layer**: Registers path patterns, attaches auth guards (`checkAuth`), request validation (`validateRequest(zodSchema)`), and maps HTTP verbs.
2. **Controller Layer**: Parses HTTP parameters, calls appropriate services via `catchAsync`, and sends standardized JSON responses using `sendResponse<T>`.
3. **Service Layer**: Pure domain logic, state machines, database transactions, payment gateway integrations, and data querying with `QueryBuilder`.
4. **Data Access**: Prisma ORM with PostgreSQL adapter, optimized queries, and soft-deletion filters.

---

## 🚀 Key Modules & Endpoints

| Module | Base Path | Key Capabilities |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Login, refresh token, change password, forgot/reset password |
| **User** | `/api/v1/users` | Patient registration, guarded Doctor & Admin creation, profile status management |
| **Doctor** | `/api/v1/doctors` | Public doctor directory search, doctor profile details, profile updates, soft deletion |
| **Patient** | `/api/v1/patients` | Dedicated patient endpoints (`/my-profile`, `/:id`, soft delete) |
| **Appointment** | `/api/v1/appointments` | Appointment booking, state machine status transition enforcement, schedule slot freeing |
| **Schedule** | `/api/v1/schedules` | Global schedule time slot generation and deletion guards |
| **Doctor Schedule** | `/api/v1/doctor-schedules`| Doctor calendar slot booking, doctor personal schedule management |
| **Payment** | `/api/v1/payments` | Stripe Checkout session creation, webhook processing (`/webhook`), configurable currency |
| **Prescription** | `/api/v1/prescriptions`| PDF prescription generation, patient prescription archive |
| **Review** | `/api/v1/reviews` | Verified patient feedback, doctor rating aggregation |
| **Specialty** | `/api/v1/specialties` | Medical specialty taxonomy with soft delete |
| **Meta** | `/api/v1/meta` | Role-based dashboard analytics and metrics |
| **RAG** | `/api/v1/rag` | Medical document retrieval and conversational AI assistance |

---

## 📖 Interactive API Documentation

Medix provides Code-First OpenAPI 3.0 documentation:
- **Interactive Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Raw OpenAPI 3.0 Specification**: [http://localhost:5000/api/v1/openapi.json](http://localhost:5000/api/v1/openapi.json)

Both documentation endpoints are publicly accessible without authentication barriers.

---

## 🧪 Automated Testing

Backend testing runs on **Vitest** and **Supertest** with mock-heavy isolation for Prisma and external services:

```bash
# Run unit and integration tests
pnpm test

# Run tests in continuous watch mode
pnpm test:watch

# Run tests with code coverage report
pnpm test:coverage
```

### Test Strategy
- **QueryBuilder Engine**: Validates search across single and multi-level relations, range filtering (`lt`, `gt`, `gte`, `lte`), set matching (`in`), pagination, and sorting.
- **Appointment State Machine**: Verifies role-based status transitions:
  - Patients can only cancel (`CANCELED`) their own `SCHEDULED` appointments.
  - Doctors can only advance `SCHEDULED` → `INPROGRESS` and `INPROGRESS` → `COMPLETED`.
  - Terminal statuses (`COMPLETED`, `CANCELED`) cannot be transitioned.
  - Cancellation triggers database transaction releasing doctor schedule slot (`isBooked: false`).
- **HTTP Routing**: Verifies entry point, health checks, and global 404 handlers.

---

## ⚙️ Environment Variables

Configure these keys in `backend/.env`:

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | Server HTTP listen port (default `5000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis server connection URI |
| `BETTER_AUTH_SECRET` | Yes | 32+ character secret for BetterAuth session encryption |
| `BETTER_AUTH_URL` | Yes | Canonical base URL for BetterAuth (`http://localhost:5000`) |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign short-lived JWT access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | Secret used to sign long-lived JWT refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN` | Yes | Expiry duration (e.g. `1d`, `15m`) |
| `REFRESH_TOKEN_EXPIRES_IN` | Yes | Expiry duration (e.g. `7d`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint signing secret |
| `PAYMENT_CURRENCY` | No | Currency for Stripe checkout (default: `bdt`, e.g. `usd`, `eur`) |
| `EMAIL_SENDER_SMTP_*` | Yes | SMTP configuration (Host, Port, User, Pass, From) |
| `CLOUDINARY_*` | Yes | Cloudinary cloud name, API key, and secret for medical asset uploads |
| `FRONTEND_URL` | Yes | Frontend origin for CORS whitelist |
| `SUPER_ADMIN_EMAIL` | Yes | Initial super administrator seed account |
| `SUPER_ADMIN_PASSWORD` | Yes | Initial super administrator seed password |

---

## 🗄️ Database & Schema Management

Prisma schemas are modularized under `prisma/schema/`:
- `auth.prisma`: BetterAuth models (User, Session, Account, Verification)
- `admin.prisma`, `doctor.prisma`, `patient.prisma`: User domain extensions
- `schedule.prisma`, `appointment.prisma`: Scheduling engine
- `payment.prisma`: Stripe transaction tracking
- `prescription.prisma`, `review.prisma`, `specialty.prisma`: Clinical records

### Commands
```bash
pnpm generate        # Generate Prisma Client
pnpm migrate         # Run Prisma migrations in development
pnpm migrate:deploy  # Apply pending migrations in production
pnpm studio          # Launch Prisma Studio web visualizer
```

---

## 📚 TypeScript API Reference (TypeDoc)

Generate complete static HTML TypeScript reference documentation:
```bash
pnpm run docs:typedoc
```
The output is emitted to `docs/typedoc/index.html`.