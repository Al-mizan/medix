# [TICK-015] Admin Tier 1: Core CRUD Tables (Specialties, Patients, Admins)

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-009
- **Blocks**: TICK-016

---

## Objective

Build the 3 core admin CRUD management pages that follow the same established pattern as the existing Doctors Management page (TanStack Table + CRUD modals + server actions). Fix the Express route shadowing bug in the admin module.

---

## Bug Fix (folded in)

**Route Shadowing in `admin.route.ts`**: In `backend/src/app/module/admin/admin.route.ts`, `router.patch("/:id")` is mounted before `router.patch("/change-user-status")` and `router.patch("/change-user-role")`. Express intercepts the specialized routes with `req.params.id = "change-user-status"`. Fix by moving `/:id` AFTER the specialized routes.

---

## Detailed Tasks

### 1. Specialties Management (`/admin/dashboard/specialties-management`)
- Replace stub in `specialties-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/specialties` using TanStack Query.
- Build `SpecialtiesTable.tsx` using DataTable with `useServerManagedDataTable`:
  - Columns: Icon (image), Title, Description, Doctor count, Actions.
  - **Create**: `CreateSpecialtyModal.tsx` — title, description, icon upload (Cloudinary multipart). TanStack Form + Zod.
  - **Edit**: `EditSpecialtyModal.tsx` — pre-populated form.
  - **Delete**: Confirmation dialog → `DELETE /api/v1/specialties/:id` (soft delete).
  - Search by title, pagination.
- Services: `createSpecialty(payload)`, `updateSpecialty(id, payload)`, `deleteSpecialty(id)`.

### 2. Patients Management (`/admin/dashboard/patients-management`)
- Replace stub in `patients-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/patients` using TanStack Query.
- Build `PatientsTable.tsx` using DataTable:
  - Columns: Avatar, Name, Email, Contact, Address, Status badge, Actions.
  - **View**: `ViewPatientDialog.tsx` — full patient details including health data and medical reports.
  - **Delete**: Confirmation dialog → `DELETE /api/v1/patients/:id` (soft delete).
  - Search by name/email, filter by status, pagination.
  - Note: Admins can view and delete patients, but patient profiles are self-managed (no admin edit).
- Services: `getAllPatients(query)`, `getPatientById(id)`, `deletePatient(id)`.

### 3. Admins Management (`/admin/dashboard/admins-management`)
- Replace stub in `admins-management/page.tsx`. Create `_action.ts`.
- SSR prefetch via `GET /api/v1/admins` using TanStack Query.
- Build `AdminsTable.tsx` using DataTable:
  - Columns: Avatar, Name, Email, Contact, Role, Status badge, Actions.
  - **Create** (Super Admin only): `CreateAdminModal.tsx` — name, email, password, contact number, role selector. TanStack Form + Zod.
    - Call `POST /api/v1/users/create-admin`.
  - **Edit**: `EditAdminModal.tsx` — update admin profile.
  - **Delete**: Confirmation dialog → `DELETE /api/v1/admins/:id` (with hierarchy guard: admin cannot delete super admin).
  - **Change User Status**: Button/dropdown to toggle ACTIVE/BLOCKED via `PATCH /api/v1/admins/change-user-status`.
  - **Change User Role** (Super Admin only): Dropdown to change role via `PATCH /api/v1/admins/change-user-role`.
  - Search by name/email, filter by role/status, pagination.
- Services: `getAllAdmins(query)`, `getAdminById(id)`, `createAdmin(payload)`, `updateAdmin(id, payload)`, `deleteAdmin(id)`, `changeUserStatus(payload)`, `changeUserRole(payload)`.

### 4. Backend Route Fix
- In `backend/src/app/module/admin/admin.route.ts`, reorder routes:
  ```typescript
  // Specialized routes FIRST
  router.patch("/change-user-status", ...);
  router.patch("/change-user-role", ...);
  // Parameterized route LAST
  router.patch("/:id", ...);
  ```

---

## Verification

- Admin can CRUD specialties with icon upload.
- Admin can view patients and soft-delete them.
- Super Admin can create new admins and change roles.
- `PATCH /api/v1/admins/change-user-status` and `/change-user-role` resolve correctly (not shadowed by `/:id`).
- All tables have search, filtering, and pagination.
- `pnpm build` succeeds.
