# Medix — Software Requirements Specification (SRS)

> **Version**: 1.0  
> **Last Updated**: 2026-09-12  
> **Status**: Living Document  
> **Project**: Medix Digital Healthcare Platform

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the Medix digital healthcare platform backend. It serves as the authoritative reference for development, testing, and acceptance criteria.

### 1.2 Scope

Medix is a full-stack healthcare management platform that enables:
- Patient self-registration, appointment booking, health record management, and payment processing
- Doctor profile management, schedule management, consultation workflows, and prescription issuance
- Administrative operations including user management, analytics dashboards, and system configuration
- AI-powered clinical knowledge retrieval via Retrieval-Augmented Generation (RAG)

This SRS covers the **backend API** exclusively. Frontend requirements are out of scope.

### 1.3 Definitions & Acronyms

| Term | Definition |
|:---|:---|
| **RBAC** | Role-Based Access Control |
| **RAG** | Retrieval-Augmented Generation — AI technique grounding LLM responses in retrieved documents |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **DoctorSchedule** | An atomic time slot allocated to a specific doctor on a specific date, bookable by one patient |
| **Appointment** | The consultation agreement linking a patient, doctor, and schedule slot |
| **Prescription** | Medical instruction issued by a doctor following an appointment |
| **BetterAuth** | Modular TypeScript authentication framework managing sessions, accounts, and social providers |
| **OTP** | One-Time Password (6-digit code sent via email) |
| **BDT** | Bangladeshi Taka (currency) |

### 1.4 Actors

| Actor | Description |
|:---|:---|
| **Super Admin** | System governance, personnel provisioning, full platform control |
| **Admin** | Operational management, doctor onboarding, appointment auditing |
| **Doctor** | Medical practitioner managing schedules, consultations, prescriptions |
| **Patient** | End-user booking appointments, managing health records, making payments |
| **System** | Automated background tasks (cron jobs, webhooks) |

---

## 2. Overall Description

### 2.1 Product Perspective

Medix operates as a client-server system. The backend exposes a RESTful API consumed by a Next.js frontend. External integrations include Stripe (payments), Cloudinary (file storage), Google (OAuth), HuggingFace (embeddings), and Groq (LLM inference).

### 2.2 Operating Environment

- **Server**: Node.js 22 on Docker (Alpine Linux)
- **Database**: PostgreSQL 16 with `pgvector` extension
- **Cache**: Upstash Redis (serverless, TLS)
- **Hosting**: Render Free Tier (Docker Web Services)

### 2.3 Constraints

| Constraint | Detail |
|:---|:---|
| Currency | Governed by `PAYMENT_CURRENCY` environment variable (default: `bdt`, Bangladeshi Taka) |
| Schedule granularity | Fixed 30-minute appointment slots |
| File size | Governed by Cloudinary plan limits |
| Hosting | Render Free Tier imposes cold start delays and compute limits |
| Database | Prisma Postgres free tier has connection and storage limits |

### 2.4 Assumptions

- Each user has exactly one role (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, or `PATIENT`)
- Each user maps to exactly one role-specific profile (Admin, Doctor, or Patient)
- Doctors are created by Admins/Super Admins; patients self-register
- A single appointment occupies exactly one 30-minute schedule slot
- Each appointment can have at most one prescription, one review, and one payment

---

## 3. Functional Requirements

### 3.1 Authentication & Identity (FR-AUTH)

#### FR-AUTH-01: Patient Self-Registration
- **Input**: Name, email, password
- **Behavior**: Create BetterAuth user → create Patient record in transaction → issue JWT access + refresh tokens as HTTP-only cookies
- **Rollback**: If Patient creation fails, delete the BetterAuth user
- **Priority**: Must Have

#### FR-AUTH-02: User Login
- **Input**: Email, password
- **Behavior**: Authenticate via BetterAuth `signInEmail` → verify user is not `BLOCKED` or `DELETED` → issue JWT tokens → set cookies
- **Output**: User profile data with role
- **Priority**: Must Have

#### FR-AUTH-03: Token Refresh
- **Input**: `refreshToken` cookie, `better-auth.session_token` cookie
- **Behavior**: Validate refresh token → validate session → issue new JWT pair → extend session expiry
- **Priority**: Must Have

#### FR-AUTH-04: Password Change
- **Input**: Current password, new password
- **Behavior**: Verify current password via BetterAuth → update password → revoke all other sessions → issue new JWT tokens
- **Auth**: All authenticated roles
- **Priority**: Must Have

#### FR-AUTH-05: Logout
- **Behavior**: Sign out BetterAuth session → clear `accessToken`, `refreshToken`, and `better-auth.session_token` cookies
- **Priority**: Must Have

#### FR-AUTH-06: Email Verification via OTP
- **Input**: Email
- **Behavior**: Send 6-digit OTP via email (EJS `otp` template) → user submits OTP → mark `emailVerified: true`
- **Restriction**: Not available for Google OAuth users
- **Priority**: Must Have

#### FR-AUTH-07: Forgot Password / Reset Password
- **Input**: Email (forgot), OTP + new password (reset)
- **Behavior**: Send 6-digit OTP → validate OTP → update password via BetterAuth
- **Restriction**: Not available for Google OAuth users
- **Priority**: Must Have

#### FR-AUTH-08: Google OAuth Login
- **Behavior**: Redirect to Google consent screen (`select_account`, `offline`) → on callback, ensure Patient record exists → sign JWT tokens → redirect to frontend dashboard
- **Role mapping**: OAuth users are assigned `PATIENT` role
- **Priority**: Should Have

#### FR-AUTH-09: Get Current User Profile
- **Behavior**: Return full user profile with deep relation inclusions based on role:
  - Patient: appointments, reviews, prescriptions, medical reports, health data
  - Doctor: specialties, appointments, reviews, prescriptions
  - Admin: admin record
- **Auth**: All authenticated roles
- **Priority**: Must Have

---

### 3.2 User Management (FR-USER)

#### FR-USER-01: Create Doctor
- **Input**: Password, doctor profile data (name, email, contactNumber, address, registrationNumber, experience, gender, appointmentFee, qualification, currentWorkingPlace, designation), array of specialty IDs (min 1)
- **Behavior**: Validate all specialty IDs exist → verify email uniqueness → register via BetterAuth with `role: DOCTOR` and `needPasswordChange: true` → create Doctor + DoctorSpecialty records in transaction
- **Rollback**: Delete BetterAuth user if transaction fails
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-USER-02: Create Admin
- **Input**: Password, admin profile data (name, email, contactNumber, profilePhoto), role (`ADMIN` or `SUPER_ADMIN`)
- **Behavior**: Verify email uniqueness → enforce privilege escalation guard (only `SUPER_ADMIN` can create `SUPER_ADMIN` accounts; `ADMIN` can only create `ADMIN` accounts) → register via BetterAuth → create Admin record
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Priority**: Must Have

---

### 3.3 Admin Operations (FR-ADMIN)

#### FR-ADMIN-01: List All Admins
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Capabilities**: Full-text search (name, email, contactNumber), filtering, pagination, and sorting via QueryBuilder
- **Priority**: Must Have

#### FR-ADMIN-02: Get Admin by ID
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Output**: Single admin record with User data
- **Priority**: Must Have

#### FR-ADMIN-03: Update Admin
- **Input**: name, profilePhoto (URL), contactNumber (11–14 chars)
- **Auth**: `SUPER_ADMIN`
- **Priority**: Should Have

#### FR-ADMIN-04: Delete Admin (Soft)
- **Behavior**: Set `isDeleted: true` and `deletedAt` on Admin and User → delete active Sessions and Accounts → in transaction
- **Restriction**: Cannot delete self (verified via matching `userId`)
- **Auth**: `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-ADMIN-05: Change User Status
- **Input**: User ID, new status (`ACTIVE`, `BLOCKED`)
- **Business Rules**:
  - Super Admin can change status of anyone except self
  - Admin can change status of Doctors and Patients only (not other Admins or Super Admins)
  - Status `DELETED` is not allowed via this endpoint (use role-specific delete APIs)
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Priority**: Must Have

#### FR-ADMIN-06: Change User Role
- **Input**: User ID, new role
- **Business Rules**:
  - Only transitions between `ADMIN` and `SUPER_ADMIN` are permitted
  - Cannot change own role
  - Cannot change Doctor or Patient roles
- **Auth**: `SUPER_ADMIN`
- **Priority**: Should Have

---

### 3.4 Doctor Management (FR-DOCTOR)

#### FR-DOCTOR-01: List All Doctors (Public)
- **Auth**: None (public endpoint)
- **Capabilities**: Full-text search (name, email, qualification, designation, workplace, registration number, specialty title), filtering, pagination, sorting via QueryBuilder
- **Filter**: Excludes soft-deleted doctors
- **Priority**: Must Have

#### FR-DOCTOR-02: Get Doctor by ID (Public)
- **Auth**: None (public endpoint)
- **Output**: Doctor with User data and specialties
- **Priority**: Must Have

#### FR-DOCTOR-03: Update Doctor
- **Input**: Profile fields + array of `{ specialtyId, shouldDelete }` for managing specialty associations
- **Behavior**: Update doctor fields → upsert/delete DoctorSpecialty records
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-DOCTOR-04: Delete Doctor (Soft)
- **Behavior**: Soft-delete Doctor + User, delete Sessions and DoctorSpecialty records in transaction
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

---

### 3.5 Patient Management (FR-PATIENT)

#### FR-PATIENT-01: Get Own Profile
- **Auth**: `PATIENT`
- **Output**: Patient record with `user`, `patientHealthData`, and `medicalReports`
- **Priority**: Must Have

#### FR-PATIENT-02: Update Own Profile
- **Input**: Patient info (name, profilePhoto, contactNumber, address), health data (gender, DOB, blood group, allergies, diabetes, height, weight, smoking status, dietary preferences, pregnancy status, mental health, surgeries, anxiety, depression, marital status), medical reports (upload new or delete existing)
- **Behavior**:
  - Update Patient and sync name/image to User
  - Upsert PatientHealthData
  - Process medical reports: upload to Cloudinary or delete from DB + Cloudinary
- **File upload**: `profilePhoto` (max 1), `medicalReports` (max 5)
- **Auth**: `PATIENT`
- **Priority**: Must Have

#### FR-PATIENT-03: List All Patients (Admin)
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Capabilities**: Full-text search (name, email, contactNumber, address), filtering, pagination, sorting via QueryBuilder
- **Priority**: Must Have

#### FR-PATIENT-04: Get Patient by ID (Admin)
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Output**: Single patient record with User data, health data, medical reports, and booked appointments
- **Priority**: Must Have

#### FR-PATIENT-05: Delete Patient (Admin)
- **Behavior**: Soft-delete Patient and User (`isDeleted: true`, `deletedAt`), delete active Sessions in transaction
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

---

### 3.6 Specialty Management (FR-SPEC)

#### FR-SPEC-01: Create Specialty
- **Input**: Title, description (optional), icon file upload
- **Behavior**: Upload icon to Cloudinary → create Specialty record
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-SPEC-02: List All Specialties (Public)
- **Auth**: None
- **Capabilities**: Full-text search, filtering, pagination, and sorting via QueryBuilder
- **Priority**: Must Have

#### FR-SPEC-03: Update Specialty
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

#### FR-SPEC-04: Delete Specialty (Soft)
- **Behavior**: Sets `isDeleted: true` and `deletedAt` timestamps
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

---

### 3.7 Schedule Management (FR-SCHED)

#### FR-SCHED-01: Create Schedule Slots
- **Input**: startDate, endDate, startTime (HH:MM), endTime (HH:MM)
- **Behavior**: Generate 30-minute recurring slots between date and time ranges → convert to UTC → check for conflicts → bulk create unique slots
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-SCHED-02: List All Schedules
- **Auth**: `ADMIN`, `SUPER_ADMIN`, `DOCTOR`
- **Capabilities**: Pagination, filtering (startDateTime, endDateTime), dynamic relation inclusion via QueryBuilder
- **Priority**: Must Have

#### FR-SCHED-03: Get Schedule by ID
- **Auth**: `ADMIN`, `SUPER_ADMIN`, `DOCTOR`
- **Priority**: Should Have

#### FR-SCHED-04: Update Schedule
- **Input**: startDateTime, endDateTime
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

#### FR-SCHED-05: Delete Schedule
- **Preconditions**: Schedule must not be assigned to any doctor (`doctorSchedules`) or linked to any `appointments`
- **Behavior**: Verifies absence of doctor schedules and appointments → hard delete
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

---

### 3.8 Doctor Schedule Management (FR-DSCHED)

#### FR-DSCHED-01: Create Own Doctor Schedule
- **Input**: Array of schedule IDs
- **Behavior**: Associate logged-in doctor with multiple schedule slots via `createMany`
- **Auth**: `DOCTOR`
- **Priority**: Must Have

#### FR-DSCHED-02: Get Own Doctor Schedules
- **Auth**: `DOCTOR`
- **Capabilities**: QueryBuilder with search, filter, pagination, dynamic inclusion
- **Priority**: Must Have

#### FR-DSCHED-03: List All Doctor Schedules (Admin)
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

#### FR-DSCHED-04: Get Doctor Schedule by Composite Key
- **Input**: doctorId, scheduleId
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

#### FR-DSCHED-05: Update Own Doctor Schedule
- **Input**: Array of `{ scheduleId, shouldDelete }` entries
- **Behavior**: In transaction, remove non-booked schedules flagged for deletion, create new schedule associations
- **Auth**: `DOCTOR`
- **Priority**: Must Have

#### FR-DSCHED-06: Delete Own Doctor Schedule
- **Precondition**: Schedule slot must not be booked (`isBooked: false`)
- **Auth**: `DOCTOR`
- **Priority**: Must Have

---

### 3.9 Appointment Management (FR-APPT)

#### FR-APPT-01: Book Appointment (Immediate Payment)
- **Input**: doctorId (UUID), scheduleId (UUID)
- **Validation**: Enforced via `bookAppointmentZodSchema`
- **Behavior**:
  1. Validate doctor, schedule, and doctor-schedule slot exist and slot is not booked
  2. Generate UUIDv7 `videoCallingId` and `transactionId`
  3. In transaction: create Appointment (status: `SCHEDULED`, paymentStatus: `UNPAID`), create Payment record, set `doctorSchedules.isBooked = true`
  4. Create Stripe checkout session (amount = doctor's `appointmentFee` × 100, currency: BDT)
  5. Return Stripe session URL
- **Auth**: `PATIENT`
- **Priority**: Must Have

#### FR-APPT-02: Book Appointment (Pay Later)
- **Input**: doctorId (UUID), scheduleId (UUID)
- **Validation**: Enforced via `bookAppointmentZodSchema`
- **Behavior**: Same as FR-APPT-01 but without creating Stripe checkout session
- **Auth**: `PATIENT`
- **Priority**: Should Have

#### FR-APPT-03: Initiate Payment for Unpaid Appointment
- **Preconditions**: Patient owns the appointment, appointment is not already paid or canceled
- **Behavior**: Create Stripe checkout session for existing unpaid appointment
- **Auth**: `PATIENT`
- **Priority**: Must Have

#### FR-APPT-04: Get My Appointments
- **Behavior**: Return appointments filtered by logged-in user's role (patientId or doctorId), including doctor/patient info and schedule
- **Auth**: `PATIENT`, `DOCTOR`
- **Priority**: Must Have

#### FR-APPT-05: Get Single Appointment
- **Auth**: `PATIENT`, `DOCTOR` (must own the appointment)
- **Priority**: Must Have

#### FR-APPT-06: Get All Appointments (Admin)
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Capabilities**: Full-text search (patient/doctor name and email), filtering (status, paymentStatus, IDs), pagination, and sorting via QueryBuilder
- **Priority**: Must Have

#### FR-APPT-07: Change Appointment Status
- **Input**: Appointment ID, new status
- **Business Rules** (enforced via state machine):
  - Completed and Canceled appointments cannot be updated
  - Patient: can only set `CANCELED`, and only when appointment is currently in `SCHEDULED` status
  - Doctor: can only transition `SCHEDULED` → `INPROGRESS`, or `INPROGRESS` → `COMPLETED`
  - Admin/Super Admin: can transition to any valid `AppointmentStatus`
  - On cancellation (`CANCELED`), the associated doctor schedule slot is automatically freed (`doctorSchedules.isBooked = false`) in a database transaction
- **Auth**: `PATIENT`, `DOCTOR`, `ADMIN`, `SUPER_ADMIN`
- **Priority**: Must Have

#### FR-APPT-08: Auto-Cancel Unpaid Appointments (System)
- **Trigger**: Cron job every 25 minutes
- **Behavior**: Find appointments with `paymentStatus: UNPAID` created more than 30 minutes ago → cancel appointment → delete Payment record → set `doctorSchedules.isBooked = false`
- **Priority**: Must Have

---

### 3.10 Payment Processing (FR-PAY)

#### FR-PAY-01: Stripe Webhook Handler
- **Endpoint**: `POST /webhook` (root-level, raw body)
- **Idempotency**: Check `stripeEventId` to prevent duplicate processing
- **Events handled**:
  - `checkout.session.completed`:
    1. Update Appointment `paymentStatus: PAID`
    2. Generate invoice PDF (PDFKit)
    3. Upload PDF to Cloudinary
    4. Update Payment record (status: `PAID`, gateway data, invoice URL, Stripe event ID)
    5. Send payment confirmation email with PDF attachment (EJS `invoice` template)
  - `checkout.session.expired`: Update Payment status to `FAILED`
  - `payment_intent.payment_failed`: Update Payment status to `FAILED`
- **Priority**: Must Have

#### FR-PAY-02: Refund Processing (Planned)
- **Trigger**: Admin-initiated or automated refund via Stripe
- **Behavior**: Process Stripe `charge.refunded` webhook → update Payment status to `REFUNDED` → update Appointment paymentStatus to `REFUNDED`
- **Auth**: `ADMIN`, `SUPER_ADMIN`
- **Priority**: Should Have

---

### 3.11 Video Calling — WebRTC Consultation (FR-VIDEO)

#### FR-VIDEO-01: Signaling Server
- **Technology**: Socket.IO (or plain `ws`) mounted on the existing Express HTTP server
- **Behavior**: Create a room per `appointment.videoCallingId`. Relay SDP offers/answers and ICE candidates between the doctor's and patient's sockets. The server never touches media streams.
- **Priority**: Must Have

#### FR-VIDEO-02: Authentication & Room Authorization
- **Behavior**: On Socket.IO connection, verify the joining user's JWT/session. Derive room ID from the appointment's `videoCallingId`. Server-side verification ensures both the joining doctor and patient belong to the specific booked appointment before pairing them.
- **Preconditions**: Appointment must be in `INPROGRESS` status with `paymentStatus: PAID`
- **Priority**: Must Have

#### FR-VIDEO-03: NAT Traversal — STUN
- **Behavior**: Configure `RTCPeerConnection` with a public STUN server (`stun.l.google.com:19302`) for NAT discovery. This enables direct peer-to-peer media connections for the majority (~80-85%) of cases with zero server-side media cost.
- **Priority**: Must Have

#### FR-VIDEO-04: NAT Traversal — TURN Relay (Fallback)
- **Behavior**: Self-host a coturn TURN server on a free-tier VPS (Oracle Cloud / Fly.io) for the ~15-20% of connections that cannot establish direct P2P (mobile carrier NAT, hospital/clinic firewalls). The relay handles encrypted media forwarding.
- **Priority**: Must Have

#### FR-VIDEO-05: Client-Side Call UI (Frontend)
- **Technology**: Native `RTCPeerConnection` API or `simple-peer` wrapper
- **Behavior**: Capture local media via `getUserMedia` → create SDP offer/answer → exchange ICE candidates through Socket.IO channel → establish peer-to-peer media stream
- **Priority**: Must Have

#### FR-VIDEO-06: Compliance & Data Privacy
- **Requirement**: Verify data-privacy obligations for doctor-patient video in applicable jurisdictions:
  - Bangladesh's data protection rules
  - HIPAA-style requirements if serving US users
  - Other applicable frameworks based on user base geography
- **Note**: Self-hosting eliminates third-party vendor exposure to patient media, but legal review is required before production deployment
- **Priority**: Must Have

---

### 3.12 Prescription Management (FR-RX)

#### FR-RX-01: Create Prescription
- **Input**: appointmentId, instructions (min 1 char), followUpDate (optional)
- **Preconditions**: Doctor owns the appointment, appointment does not already have a prescription
- **Behavior**: In transaction: create Prescription → generate PDF (PDFKit) → upload to Cloudinary → update `pdfUrl` → email patient with PDF attachment (EJS `prescription` template)
- **Auth**: `DOCTOR`
- **Priority**: Must Have

#### FR-RX-02: Update Prescription
- **Precondition**: Doctor owns the prescription
- **Behavior**: Update fields → regenerate PDF → upload new PDF → delete old PDF from Cloudinary → email updated prescription
- **Auth**: `DOCTOR`
- **Priority**: Should Have

#### FR-RX-03: Delete Prescription
- **Precondition**: Doctor owns the prescription
- **Behavior**: Delete Cloudinary PDF → delete DB record
- **Auth**: `DOCTOR`
- **Priority**: Should Have

#### FR-RX-04: Get My Prescriptions
- **Auth**: `PATIENT`, `DOCTOR`
- **Behavior**: Filter by logged-in user's email (doctor or patient)
- **Priority**: Must Have

#### FR-RX-05: Get All Prescriptions (Admin)
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Capabilities**: Full-text search (instructions, patient/doctor name and email), filtering (patientId, doctorId, appointmentId), pagination, and sorting via QueryBuilder
- **Priority**: Should Have

---

### 3.13 Review System (FR-REV)

#### FR-REV-01: Submit Review
- **Input**: appointmentId, rating (1–5), comment (min 1 char)
- **Preconditions**: Appointment `paymentStatus: PAID`, patient owns appointment, appointment not already reviewed
- **Behavior**: In transaction: create Review → recalculate doctor's `averageRating` via aggregate `_avg`
- **Auth**: `PATIENT`
- **Priority**: Must Have

#### FR-REV-02: Update Review
- **Precondition**: Patient owns the review
- **Behavior**: Update rating/comment → recalculate doctor `averageRating` in transaction
- **Auth**: `PATIENT`
- **Priority**: Should Have

#### FR-REV-03: Delete Review
- **Precondition**: Patient owns the review
- **Behavior**: Delete review → recalculate doctor `averageRating` in transaction
- **Auth**: `PATIENT`
- **Priority**: Should Have

#### FR-REV-04: Get My Reviews
- **Auth**: `PATIENT`, `DOCTOR`
- **Priority**: Must Have

#### FR-REV-05: List All Reviews (Public)
- **Auth**: None
- **Capabilities**: Full-text search (comment, patient/doctor name), filtering (rating, doctorId, patientId, appointmentId), pagination, and sorting via QueryBuilder
- **Priority**: Should Have

---

### 3.14 Dashboard & Analytics (FR-STATS)

#### FR-STATS-01: Role-Based Dashboard Stats
- **Auth**: All authenticated roles
- **Output varies by role**:
  - **Super Admin**: Total appointments, doctors, patients, super-admins, admins, payments, users, total revenue, appointment status pie chart, monthly appointment bar chart
  - **Admin**: Same as Super Admin excluding super-admin count
  - **Doctor**: Review count, unique patient count, appointment count, doctor revenue, appointment status distribution
  - **Patient**: Appointment count, review count, appointment status distribution
- **Priority**: Must Have

---

### 3.15 RAG — AI Knowledge Assistant (FR-RAG)

#### FR-RAG-01: Query Knowledge Base
- **Input**: query (max 1200 chars), topK (1–20, default 5), minSimilarity (0–1, default 0.2), sourceTypes (optional filter)
- **Behavior**:
  1. Check Redis cache (key: `rag:query:{query}:{topK}:{minSim}:{sources}`, TTL: 30 min)
  2. If cache miss: embed query via HuggingFace → cosine similarity search via pgvector → compile context → generate answer via Groq LLM (temperature: 0.1)
  3. Return `{ answer, citations, retrieval: { totalMatches } }` → cache in Redis
- **Auth**: All authenticated roles
- **Priority**: Should Have

#### FR-RAG-02: Ingest Document
- **Input**: sourceType (`DOC_MARKDOWN`, `DOCTOR`, `SPECIALTY`), sourceId, sourceLabel, content (max 20000 chars), metadata, chunkSize (100–2000), chunkOverlap (0–500)
- **Behavior**: Normalize text → chunk with overlap → SHA-256 dedup keys → embed chunks → upsert into `document_embeddings` via raw SQL
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Priority**: Should Have

#### FR-RAG-03: Reindex Knowledge Base
- **Input**: includeDocs (bool), includeDb (bool), sourceTypes (filter)
- **Behavior**: Recursively index markdown files from configured directories + active Doctor records + Specialty records
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Priority**: Should Have

#### FR-RAG-04: Get RAG Stats
- **Output**: Document embedding count grouped by sourceType
- **Auth**: `SUPER_ADMIN`, `ADMIN`
- **Priority**: Nice to Have

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)

| ID | Requirement |
|:---|:---|
| NFR-PERF-01 | API response time < 500ms for standard CRUD operations under normal load |
| NFR-PERF-02 | RAG queries should resolve in < 2000ms (including embedding + vector search + LLM generation) |
| NFR-PERF-03 | Cached RAG queries should resolve in < 100ms |
| NFR-PERF-04 | Database queries must use pagination where result sets can exceed 100 records |

### 4.2 Security (NFR-SEC)

| ID | Requirement |
|:---|:---|
| NFR-SEC-01 | All authentication cookies must be HTTP-only and Secure |
| NFR-SEC-02 | JWT tokens must use separate secrets for access and refresh tokens |
| NFR-SEC-03 | CORS must restrict origins to known frontend and auth URLs |
| NFR-SEC-04 | Stripe webhooks must verify signatures using `STRIPE_WEBHOOK_SECRET` |
| NFR-SEC-05 | File uploads must be validated and cleaned up on error via `globalErrorHandler` |
| NFR-SEC-06 | All admin and doctor creation endpoints must enforce authentication |
| NFR-SEC-07 | Role changes must prevent privilege escalation (Admin cannot create Super Admin) |
| NFR-SEC-08 | Blocked and deleted users must be denied access on all authenticated endpoints |

### 4.3 Reliability (NFR-REL)

| ID | Requirement |
|:---|:---|
| NFR-REL-01 | Server must handle `SIGTERM`, `SIGINT`, uncaught exceptions, and unhandled rejections gracefully |
| NFR-REL-02 | Redis connection failures must not crash the application |
| NFR-REL-03 | Multi-step operations (user + profile creation) must use database transactions with rollback |
| NFR-REL-04 | Stripe webhook processing must be idempotent via `stripeEventId` uniqueness check |

### 4.4 Maintainability (NFR-MAINT)

| ID | Requirement |
|:---|:---|
| NFR-MAINT-01 | Each feature must follow the module convention: route, controller, service, validation, interface, constants |
| NFR-MAINT-02 | Business logic must reside in service layer only; controllers handle HTTP concerns |
| NFR-MAINT-03 | Error responses must follow a consistent JSON structure across all endpoints |
| NFR-MAINT-04 | Prisma schema must use multi-file organization grouped by domain |

### 4.5 Scalability (NFR-SCALE)

| ID | Requirement |
|:---|:---|
| NFR-SCALE-01 | Vector search must use HNSW index for sub-linear query performance |
| NFR-SCALE-02 | QueryBuilder must support pagination on all list endpoints |
| NFR-SCALE-03 | Background tasks (cron) must not block the main event loop |

### 4.6 Deployment (NFR-DEPLOY)

| ID | Requirement |
|:---|:---|
| NFR-DEPLOY-01 | Application must be containerizable via Docker multi-stage builds |
| NFR-DEPLOY-02 | Database migrations must be applied automatically in CI/CD pipeline |
| NFR-DEPLOY-03 | Environment configuration must be externalized via environment variables |
| NFR-DEPLOY-04 | Infrastructure must be declarable via `render.yaml` blueprint |

---

## 5. External Interface Requirements

### 5.1 API Interface

- **Protocol**: HTTP/HTTPS (REST), WebSocket (Socket.IO for video signaling — planned)
- **Base URL**: `/api/v1`
- **Auth endpoints**: `/api/auth/*` (BetterAuth) and `/api/v1/auth/*` (custom)
- **Webhook**: `POST /webhook` (root-level)
- **Signaling**: Socket.IO namespace for WebRTC video calling (planned)
- **Response format**: `{ success: boolean, message: string, data: T, meta?: { page, limit, total, totalPages } }`
- **Error format**: `{ success: false, message: string, errorMessages: [{ path, message }], stack?: string }`
- **Content types**: `application/json`, `multipart/form-data` (file uploads), `application/json` raw (webhook)

### 5.2 External Service Interfaces

| Service | Protocol | Purpose |
|:---|:---|:---|
| **Stripe API** | HTTPS | Create checkout sessions, process webhook events |
| **Cloudinary API** | HTTPS | Upload/delete images and PDFs |
| **Google OAuth 2.0** | HTTPS | Social authentication |
| **HuggingFace Inference API** | HTTPS | Generate 384-dimensional text embeddings |
| **Groq API** | HTTPS | LLM inference for RAG responses |
| **SMTP Server** | SMTP/TLS | Send transactional emails (OTP, invoices, prescriptions) |
| **Upstash Redis** | `rediss://` (TLS) | Caching and ephemeral state |

### 5.3 Database Interface

- **Engine**: PostgreSQL 16
- **Extensions**: `pgvector` (vector similarity search)
- **ORM**: Prisma 7 with `@prisma/adapter-pg` driver adapter
- **Schema**: 15 modular `.prisma` files under `prisma/schema/`
- **Migrations**: Managed via `prisma migrate dev` (development) and `prisma migrate deploy` (production)

---

## 6. Data Requirements

### 6.1 Data Retention

| Data Type | Retention Policy |
|:---|:---|
| User accounts | Soft-deleted (preserved with `isDeleted` flag) |
| Doctor / Admin profiles | Soft-deleted |
| Appointments | Retained indefinitely (canceled appointments preserved) |
| Payments | Retained indefinitely (required for financial audit) |
| Prescriptions | Retained indefinitely (legal medical records) |
| Medical Reports | Retained until patient explicitly deletes |
| RAG embeddings | Retained until admin reindex or manual deletion |
| Sessions | Deleted on logout or account deletion |
| Redis cache | TTL-based expiry (30 minutes for RAG queries) |

### 6.2 Data Validation

All write endpoints should validate input via Zod schemas in the `validateRequest` middleware. The validation layer:
- Parses multipart form data by extracting JSON from `req.body.data`
- Sanitizes `req.body` with the Zod-parsed output
- Returns structured validation errors via `globalErrorHandler`

---

## 7. Appendix

### 7.1 API Route Map

| Method | Route | Auth | Module |
|:---|:---|:---|:---|
| `POST` | `/api/v1/auth/register` | Public | Auth |
| `POST` | `/api/v1/auth/login` | Public | Auth |
| `GET` | `/api/v1/auth/me` | All roles | Auth |
| `POST` | `/api/v1/auth/refresh-token` | Public | Auth |
| `POST` | `/api/v1/auth/change-password` | All roles | Auth |
| `POST` | `/api/v1/auth/logout` | All roles | Auth |
| `POST` | `/api/v1/auth/verify-email` | Public | Auth |
| `POST` | `/api/v1/auth/forget-password` | Public | Auth |
| `POST` | `/api/v1/auth/reset-password` | Public | Auth |
| `GET` | `/api/v1/auth/login/google` | Public | Auth |
| `GET` | `/api/v1/auth/google/success` | Public | Auth |
| `POST` | `/api/v1/users/create-doctor` | Admin, Super Admin | User |
| `POST` | `/api/v1/users/create-admin` | Super Admin, Admin | User |
| `GET` | `/api/v1/admins` | Admin, Super Admin | Admin |
| `GET` | `/api/v1/admins/:id` | Admin, Super Admin | Admin |
| `PATCH` | `/api/v1/admins/:id` | Super Admin | Admin |
| `DELETE` | `/api/v1/admins/:id` | Super Admin | Admin |
| `PATCH` | `/api/v1/admins/change-user-status` | Super Admin, Admin | Admin |
| `PATCH` | `/api/v1/admins/change-user-role` | Super Admin | Admin |
| `GET` | `/api/v1/doctors` | Public | Doctor |
| `GET` | `/api/v1/doctors/:id` | Public | Doctor |
| `PATCH` | `/api/v1/doctors/:id` | Admin, Super Admin | Doctor |
| `DELETE` | `/api/v1/doctors/:id` | Admin, Super Admin | Doctor |
| `GET` | `/api/v1/patients/my-profile` | Patient | Patient |
| `PATCH` | `/api/v1/patients/update-my-profile` | Patient | Patient |
| `GET` | `/api/v1/patients` | Admin, Super Admin | Patient |
| `GET` | `/api/v1/patients/:id` | Admin, Super Admin | Patient |
| `DELETE` | `/api/v1/patients/:id` | Admin, Super Admin | Patient |
| `POST` | `/api/v1/specialties` | Admin, Super Admin | Specialty |
| `GET` | `/api/v1/specialties` | Public | Specialty |
| `PATCH` | `/api/v1/specialties/:id` | Admin, Super Admin | Specialty |
| `DELETE` | `/api/v1/specialties/:id` | Admin, Super Admin | Specialty |
| `POST` | `/api/v1/schedules` | Admin, Super Admin | Schedule |
| `GET` | `/api/v1/schedules` | Admin, Super Admin, Doctor | Schedule |
| `GET` | `/api/v1/schedules/:id` | Admin, Super Admin, Doctor | Schedule |
| `PATCH` | `/api/v1/schedules/:id` | Admin, Super Admin | Schedule |
| `DELETE` | `/api/v1/schedules/:id` | Admin, Super Admin | Schedule |
| `POST` | `/api/v1/doctor-schedules/create-my-doctor-schedule` | Doctor | DoctorSchedule |
| `GET` | `/api/v1/doctor-schedules/my-doctor-schedules` | Doctor | DoctorSchedule |
| `GET` | `/api/v1/doctor-schedules` | Admin, Super Admin | DoctorSchedule |
| `GET` | `/api/v1/doctor-schedules/:doctorId/schedule/:scheduleId` | Admin, Super Admin | DoctorSchedule |
| `PATCH` | `/api/v1/doctor-schedules/update-my-doctor-schedule` | Doctor | DoctorSchedule |
| `DELETE` | `/api/v1/doctor-schedules/delete-my-doctor-schedule/:id` | Doctor | DoctorSchedule |
| `POST` | `/api/v1/appointments/book-appointment` | Patient | Appointment |
| `POST` | `/api/v1/appointments/book-appointment-with-pay-later` | Patient | Appointment |
| `POST` | `/api/v1/appointments/initiate-payment/:id` | Patient | Appointment |
| `GET` | `/api/v1/appointments/my-appointments` | Patient, Doctor | Appointment |
| `GET` | `/api/v1/appointments/my-single-appointment/:id` | Patient, Doctor | Appointment |
| `GET` | `/api/v1/appointments/all-appointments` | Admin, Super Admin | Appointment |
| `PATCH` | `/api/v1/appointments/change-appointment-status/:id` | All roles | Appointment |
| `POST` | `/api/v1/prescriptions` | Doctor | Prescription |
| `GET` | `/api/v1/prescriptions` | Super Admin, Admin | Prescription |
| `GET` | `/api/v1/prescriptions/my-prescriptions` | Patient, Doctor | Prescription |
| `PATCH` | `/api/v1/prescriptions/:id` | Doctor | Prescription |
| `DELETE` | `/api/v1/prescriptions/:id` | Doctor | Prescription |
| `POST` | `/api/v1/reviews` | Patient | Review |
| `GET` | `/api/v1/reviews` | Public | Review |
| `GET` | `/api/v1/reviews/my-reviews` | Patient, Doctor | Review |
| `PATCH` | `/api/v1/reviews/:id` | Patient | Review |
| `DELETE` | `/api/v1/reviews/:id` | Patient | Review |
| `GET` | `/api/v1/stats` | All roles | Stats |
| `POST` | `/api/v1/rag/query` | All roles | RAG |
| `POST` | `/api/v1/rag/ingest` | Super Admin, Admin | RAG |
| `POST` | `/api/v1/rag/reindex` | Super Admin, Admin | RAG |
| `GET` | `/api/v1/rag/stats` | Super Admin, Admin | RAG |
| `POST` | `/webhook` | Stripe signature | Payment |

### 7.2 Traceability Matrix

| SRS Requirement | Design Section | Schema File | Module |
|:---|:---|:---|:---|
| FR-AUTH-01..09 | §6.1, §7.3 Auth | `auth.prisma` | `auth/` |
| FR-USER-01..02 | §7.3 User | `doctor.prisma`, `admin.prisma` | `user/` |
| FR-ADMIN-01..06 | §7.3 Admin | `admin.prisma` | `admin/` |
| FR-DOCTOR-01..04 | §7.3 Doctor | `doctor.prisma`, `specialty.prisma` | `doctor/` |
| FR-PATIENT-01 | §7.3 Patient | `patient.prisma`, `patientHealthData.prisma`, `medicalReport.prisma` | `patient/` |
| FR-SPEC-01..04 | §7.3 Specialty | `specialty.prisma` | `specialty/` |
| FR-SCHED-01..05 | §7.3 Schedule | `schedule.prisma` | `schedule/` |
| FR-DSCHED-01..06 | §7.3 DoctorSchedule | `schedule.prisma` | `doctorSchedule/` |
| FR-APPT-01..08 | §7.3 Appointment | `appointment.prisma` | `appointment/` |
| FR-PAY-01 | §7.3 Payment | `payment.prisma` | `payment/` |
| FR-RX-01..05 | §7.3 Prescription | `prescription.prisma` | `prescription/` |
| FR-REV-01..05 | §7.3 Review | `review.prisma` | `review/` |
| FR-STATS-01 | §7.3 Stats | All schemas | `stats/` |
| FR-RAG-01..04 | §7.3 RAG | `rag.prisma` | `rag/` |
