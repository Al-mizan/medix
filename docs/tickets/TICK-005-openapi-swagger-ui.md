# [TICK-005] REST API Documentation: OpenAPI 3.0 & Swagger UI Integration

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.2 (Step 2), §4](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-004
- **Blocks**: TICK-006

---

## Objective
Implement Code-First OpenAPI 3.0 specification generation and mount interactive Swagger UI documentation directly on the Express server, making all REST API endpoints, request schemas, parameters, security schemes, and responses discoverable and testable at `/api-docs` and `/api/v1/openapi.json` without authentication barriers.

---

## Detailed Tasks
1. **Dependencies**:
   - Install `swagger-ui-express` and `@types/swagger-ui-express` in `backend/`.
2. **OpenAPI Specification Builder**:
   - Create `backend/src/app/docs/openapi.ts` (or `backend/src/app/docs/swagger.ts`):
     - Configure OpenAPI 3.0 metadata (title: Medix API, version: 1.0.0, servers: local `http://localhost:5000/api/v1`, prod URL).
     - Configure Security Schemes: `bearerAuth` (HTTP Bearer JWT).
     - Define reusable schemas for standard API envelopes (`APIResponse<T>`, `ErrorResponse`, `PaginationMeta`).
     - Map endpoints across all modules:
       - Auth (`/auth/login`, `/auth/refresh-token`, `/auth/change-password`, `/auth/forgot-password`, `/auth/reset-password`)
       - User (`/users/create-patient`, `/users/create-doctor`, `/users/create-admin`, `/users/my-profile`, `/users/update-my-profile`, `/users/change-profile-status`)
       - Doctor (`/doctors`, `/doctors/:id`, `/doctors/update-my-profile`, `/doctors/soft-delete/:id`)
       - Patient (`/patients`, `/patients/:id`, `/patients/my-profile`, `/patients/:id` DELETE)
       - Appointment (`/appointments`, `/appointments/my-appointments`, `/appointments/status/:id`, `/appointments/book-appointment`)
       - Schedule & DoctorSchedule (`/schedules`, `/schedules/my-schedules`, `/doctor-schedules`, `/doctor-schedules/my-schedules`)
       - Prescription (`/prescriptions`, `/prescriptions/my-prescriptions`, `/prescriptions/:id`)
       - Review (`/reviews`, `/reviews/my-reviews`, `/reviews/:id`)
       - Payment (`/payments/initiate-payment/:appointmentId`, `/payments/verify-payment`)
       - Specialty (`/specialties`, `/specialties/:id`)
       - Meta & RAG (`/meta`, `/rag/chat`, `/rag/upload-knowledge-doc`)
3. **Route Integration (`backend/src/app.ts`)**:
   - Mount Swagger UI at `GET /api-docs` using `swaggerUi.serve` and `swaggerUi.setup(openapiSpec)`.
   - Mount raw JSON endpoint at `GET /api/v1/openapi.json`.
   - Ensure both endpoints bypass `checkAuth` middleware so documentation is publicly accessible.
4. **Validation**:
   - Verify OpenAPI 3.0 specification syntax against Swagger parser.
   - Ensure `pnpm --filter backend-ph-healthcare build` and `npx tsc --noEmit` succeed.

---

## Verification
```bash
# Verify Express app routes include documentation endpoints
curl -I http://localhost:5000/api-docs/
curl http://localhost:5000/api/v1/openapi.json | jq .info
```
The raw JSON endpoint returns valid JSON with `openapi: "3.0.0"` and Swagger UI renders without errors.
