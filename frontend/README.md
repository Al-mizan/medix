# Medix — Next.js 16 Healthcare Web Client

The frontend client for the Medix Digital Healthcare Platform is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Shadcn UI primitives**. It provides dedicated, role-tailored dashboards and workflows for **Patients**, **Doctors**, and **Administrators**.

---

## 🏛️ Architecture & Principles

- **Next.js 16 App Router**: Leverages React Server Components (RSC) for initial page loads and SEO, keeping client boundaries (`'use client'`) confined to interactive UI leaves.
- **Server & Client State Separation**:
  - **Server State**: Managed and cached via **TanStack Query v5** (`@tanstack/react-query`) with automatic background revalidation and cache keys.
  - **Form State**: Managed via **TanStack Form** (`@tanstack/react-form`) with **Zod** schema validation.
- **Role-Based Routing & Session Sync**:
  - `src/proxy.ts` inspects cookies on incoming requests, verifies JWT access tokens, and enforces RBAC redirects (`/admin/*`, `/doctor/*`, `/dashboard/*`).
- **WebRTC Peer-to-Peer Telemedicine**:
  - Real-time video/audio consultations using browser-native `RTCPeerConnection`.
  - Signaling handled over Express WebSocket channels; NAT traversal powered by Google STUN and self-hosted Coturn TURN relays.

---

## 📁 Directory Structure

```text
frontend/src/
├── app/                              # Next.js App Router root
│   ├── (commonLayout)/               # Public routes (Landing, Doctors, Login, Register)
│   ├── (dashboardLayout)/            # Protected role-based workspaces
│   │   ├── admin/                    # Administrator metrics, user management, specialties
│   │   ├── doctor/                   # Doctor schedule manager, appointments, patient reviews
│   │   └── dashboard/                # Patient portal (Appointments, Prescriptions, Payments)
│   ├── api/                          # Next.js route handlers
│   └── layout.tsx                    # Root application layout with theme & query providers
├── components/
│   ├── ui/                           # Reusable design primitives (Button, Badge, Card, Modal, etc.)
│   ├── shared/                       # Cross-cutting UI widgets (DataTables, Navbar, Footer)
│   └── modules/                      # Feature-specific components (Auth, Appointment, Consultation)
├── hooks/                            # Custom React hooks (useServerManagedDataTable, useMobile)
├── lib/                              # Axios instance, auth utilities, JWT decoding, token refresh
├── providers/                        # QueryClientProvider, ThemeProvider
├── services/                         # Type-safe API communication clients
├── types/                            # Domain TypeScript definitions
└── zod/                              # Client-side form validation schemas
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 10.33.0`

### Setup & Run
From the monorepo root:
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:frontend

# Or directly from the frontend directory:
cd frontend
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Frontend UI testing uses **Vitest**, **React Testing Library**, and **jsdom**:

```bash
# Run all frontend tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Coverage Focus
- Design system primitives (`Button`, `Badge`, `Card`) verify DOM rendering, data attributes, accessibility roles, and click event handlers.
- Form components verify validation states, error messages, and submission callbacks.
- Custom hooks verify state transitions and query invalidations.

---

## ⚙️ Environment Variables

Configure these keys in `frontend/.env.local`:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Client + Server | Canonical URL to backend Express API (`http://localhost:5000/api/v1`) |
| `JWT_ACCESS_SECRET` | Server only | Secret used by `src/proxy.ts` to verify JWT cookies on the server |

---

## 🛠️ Build & Production Deployment

```bash
# Generate production bundle
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

In containerized environments, `frontend/Dockerfile.prod` produces an optimized standalone Next.js image using Node 22 Alpine.
