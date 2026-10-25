# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Patients** (Primary focus): Individuals seeking clinical consultations, booking appointments with vetted specialists, managing personal electronic health records (EHR), tracking prescriptions, and completing payments.
- **Doctors / Clinicians**: Licensed healthcare practitioners managing availability schedule slots, reviewing patient histories, conducting consultations, authoring prescriptions, and tracking patient reviews.
- **Administrators & Super Admins**: Operational and clinical governance personnel managing doctor onboarding and verification, system-wide schedule auditing, specialties, user accounts, and platform metrics.

## Product Purpose

Medix connects patients, doctors, and healthcare administrators through a unified, high-availability digital healthcare management and telemedicine platform. It eliminates appointment scheduling friction, secures patient health records, automates payment processing and invoicing, and assists clinical knowledge retrieval through grounded AI. Success means patients effortlessly connect with qualified clinicians, consultations start on time without administrative barriers, and longitudinal medical records remain secure, transparent, and actionable.

## Positioning

An integrated end-to-end clinical operations and consultation ecosystem built for regional operating realities (Bangladeshi Taka / BDT currency support, flexible appointment lifecycle automation, and strict clinical access controls) augmented by grounded clinical AI knowledge retrieval (pgvector + Groq LLM inference), rather than a generic booking calendar or disconnected telehealth tool.

## Operating Context

- Web-first responsive application accessible across desktop and mobile devices.
- Clinical scheduling governed by atomic 30-minute consultation slots.
- Real-time payment processing via Stripe with automated invoice generation.
- Consultations progress through a deterministic lifecycle: `SCHEDULED` → `INPROGRESS` → `COMPLETED` (or `CANCELED` with slot release).
- Patient EHR, prescription records, and diagnostic reports require strict role-based access control (BetterAuth, JWT, RBAC).

## Capabilities and Constraints

- **Capabilities**:
  - Patient self-registration, authentication (BetterAuth, JWT, Google OAuth), and longitudinal health metrics management.
  - Doctor search and filtering by specialty, consultation fee, experience, and real-time slot availability.
  - Appointment scheduling with automated timeout cancellation for unpaid bookings.
  - Stripe payment intent integration with HMAC signature verification and automated invoicing.
  - Digital prescription generation and Cloudinary-backed diagnostic report uploads.
  - Clinical knowledge base RAG assistant grounded via pgvector document embeddings and Groq LLM inference.
  - Planned WebRTC peer-to-peer telemedicine consultation calling.
- **Constraints**:
  - Currency: Governed by `PAYMENT_CURRENCY` environment variable (default: `bdt`, Bangladeshi Taka).
  - Schedule granularity: Fixed 30-minute appointment slots.
  - Architecture: Next.js 16 App Router (React 19, Tailwind CSS v4, Radix UI) client with Node.js 22, Express 5, and Prisma 7 backend.
- **Terminology**:
  - `DoctorSchedule`: Atomic time slot allocated to a specific doctor for a specific date/time.
  - `Appointment`: Consultation agreement linking a patient, doctor, and schedule slot.
  - `Prescription`: Legal medical directive authored by a licensed doctor following or during an appointment.
  - `Medical Report`: Diagnostic test document or medical history file attached to patient health records.

## Brand Commitments

- **Name**: Medix (Digital Healthcare Platform).
- **Voice & Tone**: Clear, reassuring, clinical, dependable, and dignified. Free of casual slang or alarmist medical jargon.
- **Color Identity Tokens**: Clarity Teal (`--primary`), Vital Emerald (`--secondary`), Terracotta (`--accent`), and Assist Violet (`--ai`).

## Evidence on Hand

- Complete domain context and data models in `CONTEXT.md`, `README.md`, `docs/srs.md`, `docs/backend_design.md`, and `docs/frontend_architecture.md`.
- Working Next.js 16 frontend implementation with route groups (`(commonLayout)`, `(dashboardLayout)`), design system tokens in `frontend/src/app/globals.css`, and UI components under `frontend/src/components/`.
- Working backend API with Express 5, Prisma 7 schemas, and automated Vitest suites.
- Absence: No fabricated patient testimonials, false customer claims, or external compliance certifications (e.g., HIPAA is not formally claimed).

## Product Principles

1. **Patient-First Clarity**: Eliminate friction and cognitive load across doctor discovery, appointment booking, payments, and consultation entry.
2. **Clinical Trust & Data Dignity**: Treat medical records, prescriptions, and health data with uncompromising privacy, explicit status indicators, and deterministic access.
3. **Operational Determinism**: Never leave schedule availability, appointment states, or payment receipts ambiguous; reflect real-time operational truth immediately.
4. **Restrained, Grounded AI**: Clinical AI knowledge retrieval must be strictly grounded in verified documentation and guidelines; AI assists information discovery without replacing licensed medical judgment.

## Accessibility & Inclusion

- Compliance with WCAG 2.1 AA standards across color contrast, keyboard navigation, tap targets, and screen reader announcements.
- Resilient performance under variable network conditions and across diverse screen viewports.
