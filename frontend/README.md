# Healthcare — Frontend

Web client for the Healthcare platform: role-based dashboards and flows for **patients**, **doctors**, and **admins** (including super admin, normalized to admin routing in the app). It talks to a separate backend via HTTP using a configurable API base URL.

## Prerequisites

- [Bun](https://bun.sh/) (package scripts run the Next.js CLI with `bun --bun`)

## Quick start

```bash
git clone <repository-url>
cd frontend-healthcare
bun install
```

Create a local env file (see [Environment variables](#environment-variables)), then:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Define these in `.env.local` (not committed). Example:

```bash
# Public: backend origin used by the browser and HTTP client (include protocol, no trailing slash unless your API expects it)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Server-side: secret used to verify access JWTs from cookies (must match what the API uses to sign tokens)
JWT_ACCESS_SECRET=your-access-token-signing-secret
```

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Client + server | Base URL for API requests (`src/lib/axios/httpClient.ts`, auth services, login). Required at runtime where used. |
| `JWT_ACCESS_SECRET` | Server | Verifies `accessToken` cookies in `src/proxy.ts`. |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the development server |
| `bun run build` | Production build |
| `bun run start` | Run the production server (after `build`) |
| `bun run lint` | Run ESLint |

## Project structure

| Path | Role |
|------|------|
| `src/app/` | Next.js App Router: layouts, pages, loading and error UI, server actions (e.g. `src/app/_actions/`) |
| `src/app/(commonLayout)/` | Public-style routes (marketing, auth pages, etc.) |
| `src/app/(dashboardLayout)/` | Authenticated shell: `admin/dashboard`, `doctor/dashboard`, patient `dashboard` routes, plus `(commonProtectedLayout)` (e.g. profile, change password) |
| `src/components/ui/` | Reusable UI primitives (Radix-oriented, Tailwind) |
| `src/components/shared/` | Cross-feature pieces (tables, forms, charts) |
| `src/components/modules/` | Feature modules (Auth, Admin, Doctor, Patient, Consultation, Dashboard chrome) |
| `src/services/` | API-facing modules (auth, appointments, doctors, schedules, dashboard) |
| `src/lib/` | Axios client, auth/JWT/cookie helpers, navigation config, utilities |
| `src/hooks/` | Client hooks (data tables, layout helpers) |
| `src/providers/` | React providers (e.g. TanStack Query) |
| `src/types/` | Shared TypeScript types |
| `src/zod/` | Validation schemas |
| `src/proxy.ts` | Request-level auth: JWT verification from cookies, role-based redirects, optional proactive refresh; exports a `matcher` compatible with Next.js middleware conventions |

## Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router), **React** 19, **TypeScript**
- **Styling:** Tailwind CSS 4
- **Data & forms:** TanStack Query, TanStack Form, TanStack Table
- **HTTP & validation:** Axios, Zod
- **UI:** Radix primitives, Lucide icons, Sonner toasts, Recharts, Vaul drawer, etc.

This repo’s Next.js version may differ from older docs. Contributors should follow **`AGENTS.md`** (and `CLAUDE.md`) for project-specific guidance, including checking in-repo Next.js docs when APIs behave unexpectedly.

## Authentication and routing

- Access and refresh tokens are stored in **cookies**. The app verifies the access token and derives the user **role** to enforce **admin**, **doctor**, and **patient** areas.
- **Email verification** and **forced password change** flows redirect to `/verify-email` and `/reset-password` when required.
- Central logic: `src/proxy.ts` (with `src/lib/authUtils.ts`, `src/lib/jwtUtils.ts`, `src/lib/tokenUtils.ts`, and `src/services/auth.services.ts`).

## Build and deployment

```bash
bun run build
bun run start
```

For hosted deployments, set the same environment variables in your host’s dashboard or secrets store. For a typical Vercel-style setup, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
