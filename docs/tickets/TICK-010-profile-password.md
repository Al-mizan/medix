# [TICK-010] Profile Management & Change Password

- **Status**: Completed
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-009
- **Blocks**: None

---

## Objective

Build the My Profile page (`/my-profile`) with view/edit functionality and avatar upload, and the Change Password page (`/change-password`). Fix the broken `change-password` relative link in `navItems.ts`.

---

## Bug Fix (folded in)

**Broken change-password link**: In `src/lib/navItems.ts` line 34, `href: "change-password"` lacks a leading slash. On `/admin/dashboard`, this resolves to `/admin/change-password` (404). Fix to `href: "/change-password"`.

---

## Detailed Tasks

### 1. My Profile Page (`/my-profile`)
- Replace stub in `src/app/(dashboardLayout)/(commonProtectedLayout)/my-profile/page.tsx`.
- **View Mode**: Display user info (name, email, role, contact number, address, profile photo) fetched via `GET /api/v1/auth/me` using TanStack Query.
- **Edit Mode**: Toggle to edit form using TanStack Form + Zod:
  - For Patients: name, contact number, address, profile photo upload (via Cloudinary multipart).
  - For Doctors: name, contact number (read-only fields for qualification, experience, etc.).
  - For Admins: name, contact number.
- Server action: Call `PATCH /api/v1/patients/update-my-profile` (for patients) or appropriate endpoint.
- Profile photo upload: Use the existing multer/Cloudinary pattern via multipart form data.

### 2. Change Password Page (`/change-password`)
- Replace stub in `change-password/page.tsx`.
- Build `ChangePasswordForm.tsx` with current password, new password, confirm new password.
- Server action: Call `POST /api/v1/auth/change-password`.
- On success: Show success toast.

### 3. NavItems Fix
- Fix `href: "change-password"` → `href: "/change-password"` in `src/lib/navItems.ts`.

---

## Verification

- Navigate to `/my-profile` — displays current user data.
- Edit profile — changes persist after page reload.
- Upload avatar — image appears on profile and in sidebar.
- Navigate to `/change-password` from any dashboard — form loads (not 404).
- Change password — old password rejected on next login, new password works.
- `pnpm build` succeeds.
