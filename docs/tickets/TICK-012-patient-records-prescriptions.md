# [TICK-012] Patient Prescriptions & Medical Reports

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-011
- **Blocks**: TICK-013

---

## Objective

Build the Patient Prescriptions list/detail page at `/dashboard/my-prescriptions` and the Medical Reports management page (upload, view, delete). Both have complete backend APIs already.

---

## Detailed Tasks

### 1. Patient Prescriptions Page (`/dashboard/my-prescriptions`)
- Create directory `src/app/(dashboardLayout)/dashboard/my-prescriptions/`.
- Create `page.tsx` and `_action.ts`.
- SSR prefetch prescriptions via `GET /api/v1/prescriptions/my-prescriptions` using TanStack Query.
- Build `PatientPrescriptionsList.tsx` component:
  - Card-based layout (not table) — each card shows:
    - Doctor name and designation
    - Appointment date
    - Prescription date and follow-up date
    - Instructions summary (truncated)
    - Medications list
    - **"Download PDF"** button linking to `pdfUrl` from the prescription record (Cloudinary-hosted PDF)
    - **"View Details"** dialog/sheet showing full prescription content
  - Pagination if many prescriptions.
- Apply Patient portal colors (Teal + Terracotta).

### 2. Medical Reports Management
- This functionality is accessed via the Patient Profile page or a section within `/dashboard/health-records`.
- Build `MedicalReportsSection.tsx` component:
  - List existing reports fetched from patient profile (`medicalReports` array).
  - Each report shows: report name, upload date, and "View" link (opens Cloudinary URL) and "Delete" button.
  - **Upload Form**: File input accepting PDF/image files, with report name text input.
  - Server action: Call `PATCH /api/v1/patients/update-my-profile` with multipart form data containing the report files.
  - Delete action: Call the appropriate delete endpoint.
- Add this section to the Health Records page (`/dashboard/health-records`) below the health data form.

### 3. Services
- Add `getMyPrescriptions()` → `GET /api/v1/prescriptions/my-prescriptions`.
- Reuse `updateMyProfile(payload)` for medical report uploads.

---

## Verification

- Navigate to `/dashboard/my-prescriptions` — prescriptions list loads.
- Click "Download PDF" — PDF opens in new tab from Cloudinary.
- Click "View Details" — full prescription content shown in dialog.
- Upload a medical report — appears in the reports list.
- Delete a report — removed from list.
- `pnpm build` succeeds.
