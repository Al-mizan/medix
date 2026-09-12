# PH Healthcare API

RESTful backend service for PH Healthcare — a healthcare management platform. Handles authentication, users, doctors, patients, schedules, appointments, prescriptions, reviews, payments, and admin analytics.

## Architecture

```text
Request → Route → Controller → Service → Prisma ORM → PostgreSQL
```

Each feature is organized as a module with its own route, controller, and service files. Controllers handle HTTP concerns (request parsing, response formatting), services contain business logic, and Prisma manages all database operations.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** Prisma (with PostgreSQL adapter)
- **Database:** PostgreSQL
- **Auth:** Better Auth + JWT
- **Payment:** Stripe
- **Storage:** Cloudinary
- **Email:** Nodemailer + EJS templates
- **Package Manager:** pnpm

## Key Features

- Authentication with Better Auth and OAuth support
- Role-based access control (`SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`)
- Doctor and patient profile management
- Schedule and doctor-schedule management
- Appointment booking and lifecycle management
- Stripe checkout and webhook-based payment processing
- Invoice PDF generation and email delivery
- Prescription and review system
- Stats dashboard endpoint based on user role
- Global error handling with consistent response format

## Project Structure

```text
src/
├── server.ts                       # Entry point
├── app.ts                          # Express app setup, middleware, routes
├── app/
│   ├── config/                     # Env, stripe, cloudinary, multer config
│   ├── lib/                        # Better Auth + Prisma instances
│   ├── middleware/                 # Auth guard, validation, error handling
│   ├── module/
│   │   ├── admin/
│   │   ├── appointment/
│   │   ├── auth/
│   │   ├── doctor/
│   │   ├── doctorSchedule/
│   │   ├── patient/
│   │   ├── payment/
│   │   ├── prescription/
│   │   ├── review/
│   │   ├── schedule/
│   │   ├── specialty/
│   │   ├── stats/
│   │   └── user/
│   ├── routes/                     # Main route registry
│   ├── shared/                     # Shared helpers (catchAsync, sendResponse)
│   ├── templates/                  # Email templates (invoice, otp, etc.)
│   └── utils/                      # Utility modules
prisma/
├── schema/                         # Modular Prisma schema files
└── migrations/                     # Migration history
```

## API Routes

| Route | Description |
|------|-------------|
| `GET /` | Health check |
| `/api/auth/*` | Authentication (Better Auth) |
| `/api/v1/auth` | Auth-related APIs |
| `/api/v1/users` | User operations |
| `/api/v1/patients` | Patient operations |
| `/api/v1/doctors` | Doctor operations |
| `/api/v1/admins` | Admin operations |
| `/api/v1/schedules` | Schedule management |
| `/api/v1/doctor-schedules` | Doctor schedule operations |
| `/api/v1/appointments` | Appointment management |
| `/api/v1/prescriptions` | Prescription operations |
| `/api/v1/reviews` | Review system |
| `/api/v1/stats` | Dashboard stats by role |
| `/api/v1/specialties` | Medical specialties |
| `/api/v1/payments` | Payment APIs |
| `POST /webhook` | Stripe webhook endpoint |

## Database

Prisma schema is modularized across multiple files in `prisma/schema/`:

- `auth.prisma` — User, Session, Account, Verification
- `admin.prisma` — Admin domain models
- `doctor.prisma` — Doctor models
- `patient.prisma` — Patient models
- `schedule.prisma` — Scheduling models
- `appointment.prisma` — Appointments
- `payment.prisma` — Payments and payment data
- `prescription.prisma` — Prescriptions
- `review.prisma` — Reviews
- `specialty.prisma` — Specialties
- `medicalReport.prisma` — Medical reports
- `patientHealthData.prisma` — Patient health data
- `enums.prisma` — Shared enums

### Prisma Commands

```bash
# Generate Prisma client
pnpm run generate

# Create and apply migrations
pnpm run migrate

# Push schema without migration
pnpm run push

# Open Prisma Studio (visual database browser)
pnpm run studio
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
# (create .env manually using the required keys below)

# Generate Prisma client
pnpm run generate

# Run migrations
pnpm run migrate

# Start development server
pnpm run dev
```

## Environment Variables

| Variable | Description |
|---------|-------------|
| `NODE_ENV` | Environment (`development` / `production`) |
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiry |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry |
| `BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN` | Better Auth session token expiry |
| `BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE` | Better Auth session update age |
| `EMAIL_SENDER_SMTP_USER` | SMTP username |
| `EMAIL_SENDER_SMTP_PASS` | SMTP password |
| `EMAIL_SENDER_SMTP_HOST` | SMTP host |
| `EMAIL_SENDER_SMTP_PORT` | SMTP port |
| `EMAIL_SENDER_SMTP_FROM` | Sender email identity |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL |
| `FRONTEND_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SUPER_ADMIN_EMAIL` | Seed super admin email |
| `SUPER_ADMIN_PASSWORD` | Seed super admin password |

## Scripts

```bash
pnpm run dev            # Run development server (watch mode)
pnpm run build          # Build TypeScript to dist/
pnpm run start          # Run production server
pnpm run typecheck      # Type checking
pnpm run lint           # Lint codebase
pnpm run generate       # Prisma generate
pnpm run migrate        # Prisma migrate dev
pnpm run push           # Prisma db push
pnpm run pull           # Prisma db pull
pnpm run studio         # Prisma Studio
pnpm run stripe:webhook # Forward Stripe webhook locally
```

## Error Handling

All errors pass through a global error handler that returns consistent JSON responses. Validation errors, auth failures, and unexpected exceptions are all caught and formatted uniformly.

## Deployment

For production deployment:

1. Set all required environment variables
2. Run `pnpm install --frozen-lockfile`
3. Run `pnpm run generate`
4. Run `pnpm run build`
5. Run migrations in deploy pipeline
6. Start with `pnpm run start`

If using Stripe webhooks in production, configure webhook endpoint to `POST /webhook` and set `STRIPE_WEBHOOK_SECRET` correctly.

## License

This project is licensed under the terms of the `LICENSE` file.