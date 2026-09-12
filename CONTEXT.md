# Domain Context: Medix (Digital Healthcare Platform)

Medix is a full-stack digital healthcare management platform designed to connect patients, doctors, and healthcare administrators. It streamlines clinical schedules, doctor-patient consultations, electronic medical records, payment processing, and intelligent clinical knowledge retrieval.

---

## 1. Bounded Contexts

```
┌─────────────────────────────────────────────────────────────┐
│                       MEDIX PLATFORM                        │
├─────────────────┬─────────────────────┬─────────────────────┤
│  Auth & Identity│ Clinical Operations │ Patient Care & EHR  │
│  - BetterAuth   │ - Doctors           │ - Patients          │
│  - JWT Auth     │ - Specialties       │ - Medical Reports   │
│  - RBAC         │ - Schedules         │ - Health Metrics    │
│  - Google OAuth │ - Appointments      │ - Prescriptions     │
├─────────────────┴─────────────────────┼─────────────────────┤
│       Financial & Transactions        │   AI Assistant/RAG  │
│       - Stripe Webhooks               │   - pgvector        │
│       - Invoices                      │   - Document Chunks │
│       - Payment Status Lifecycle      │   - Groq / HuggingFace│
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Identity & Access Management (IAM)
- **Actors**:
  - **Super Admin**: System governance, administrative personnel provisioning.
  - **Admin**: Operational management, doctor onboarding, appointment auditing.
  - **Doctor**: Medical practitioner managing schedule slots, consultations, prescriptions, and patient reviews.
  - **Patient**: End-user booking appointments, tracking medical records, and paying invoices.
- **Authentication**: BetterAuth integration supplemented by JWT access & refresh tokens and Google OAuth.
- **Role-Based Access Control (RBAC)**: Managed at API gateway level via `checkAuth` middleware.

### 1.2 Clinical Operations
- **Specialty**: Medical fields/disciplines (e.g., Cardiology, Neurology) associated with Doctors.
- **Doctor Profile**: Professional metadata (experience, qualification, consultation fee, appointment limits).
- **Schedule**: Time slots (start time, end time) managed system-wide.
- **Doctor Schedule**: Mapping of specific doctors to availability slots with booking status (`isBooked`).
- **Appointment**: Scheduled clinical consultation between a Patient and a Doctor for a specific Doctor Schedule slot.
  - **Statuses**: `SCHEDULED`, `INPROGRESS`, `COMPLETED`, `CANCELED`.
  - **Auto-Cancellation**: Background cron task cancels appointments if unpaid within configured timeout.

### 1.3 Patient Electronic Health Record (EHR)
- **Patient Profile**: Demographics, contact info, emergency contacts.
- **Patient Health Data**: Longitudinal clinical data (blood group, allergies, chronic conditions, height/weight).
- **Medical Report**: Uploaded diagnostic results, lab documents, and imaging (hosted on Cloudinary).
- **Prescription**: Clinical orders authored by a Doctor for a specific Appointment containing medication instructions, dosages, and follow-ups.

### 1.4 Financial & Billing
- **Payment**: Payment intent linked to an Appointment processed through Stripe.
  - **Statuses**: `UNPAID`, `PAID`, `REFUNDED`, `FAILED`.
- **Invoicing**: Automated EJS-templated invoices generated and delivered to patients upon payment confirmation.

### 1.5 Retrieval-Augmented Generation (RAG)
- **Clinical Knowledge Base**: Medical guidelines and system documentation embedded via HuggingFace models (`sentence-transformers/all-MiniLM-L6-v2`) and stored in PostgreSQL with the `pgvector` extension.
- **Inference**: Powered by Groq LLM inference (`llama-3.3-70b-versatile`) answering medical and operational queries.

---

## 2. Ubiquitous Language Glossary

| Term | Definition |
| :--- | :--- |
| **DoctorSchedule** | An atomic time slot allocated to a specific doctor on a specific date, bookable by one patient. |
| **Appointment** | The legal and operational consultation agreement linking a patient, doctor, and schedule slot. |
| **Prescription** | Legal medical instruction issued by a licensed doctor following or during an appointment. |
| **Medical Report** | Diagnostic test document or medical history file attached to a patient's health record. |
| **pgvector** | PostgreSQL extension enabling fast similarity search over high-dimensional vector embeddings. |
| **BetterAuth** | Modular TypeScript authentication framework managing sessions, accounts, and social providers. |
| **Standalone Output** | Next.js build output mode that produces a self-contained Node.js server without external dependencies. |

---

## 3. Architecture & Tech Stack

- **Monorepo Engine**: `pnpm` workspace (`backend`, `frontend`, `nginx`, `ci`).
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix / shadcn/ui.
- **Backend**: Node.js 22, Express 5, TypeScript 5, Prisma 7 (multi-file schema).
- **Database**: Prisma Postgres / PostgreSQL 16 with `pgvector`.
- **Caching & Rate Limiting**: Upstash Redis (Serverless).
- **Object Storage**: Cloudinary.
- **Payments**: Stripe API & Webhooks.
- **Deployment**: Docker containers hosted on Render Free Tier.
