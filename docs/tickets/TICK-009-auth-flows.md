# [TICK-009] Authentication Flow Completion & Logout Fix

- **Status**: Ready
- **Spec Reference**: [frontend_completion_spec.md](../specs/frontend_completion_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-010, TICK-011, TICK-014, TICK-015, TICK-018

---

## Objective

Build the 4 remaining auth page stubs (`/register`, `/verify-email`, `/forgot-password`, `/reset-password`) as functional forms using TanStack Form + Zod. Fix the non-functional logout button in `UserDropdown.tsx`.

---

## Bug Fix (folded in)

**Non-functional logout**: In `src/components/modules/Dashboard/UserDropdown.tsx` line 67, `onClick={() => {}}` must be replaced with a proper logout flow that:
1. Calls `POST /api/v1/auth/logout` via a server action.
2. Deletes `accessToken`, `refreshToken`, and `better-auth.session_token` cookies.
3. Redirects to `/login`.

---

## Detailed Tasks

### 1. Patient Registration (`/register`)
- Replace stub in `src/app/(commonLayout)/(authRouteGroup)/register/page.tsx`.
- Build `RegisterForm.tsx` component using TanStack Form + Zod schema.
- Fields: name, email, password, confirm password, contact number.
- Server action: Call `POST /api/v1/auth/register`.
- On success: Redirect to `/verify-email?email={email}` for OTP verification.

### 2. Email Verification (`/verify-email`)
- Replace stub in `verify-email/page.tsx`.
- Build `VerifyEmailForm.tsx` with 6-digit OTP input field (use `input-otp` package already installed).
- Read `email` from query params.
- Server action: Call `POST /api/v1/auth/verify-email` with `{ email, otp }`.
- Include "Resend OTP" button with countdown timer.
- On success: Redirect to `/login` with success toast.

### 3. Forgot Password (`/forgot-password`)
- Replace stub in `forgot-password/page.tsx`.
- Build `ForgotPasswordForm.tsx` with email input.
- Server action: Call `POST /api/v1/auth/forget-password`.
- On success: Redirect to `/reset-password?email={email}`.

### 4. Reset Password (`/reset-password`)
- Replace stub in `reset-password/page.tsx`.
- Build `ResetPasswordForm.tsx` with OTP input + new password + confirm password.
- Server action: Call `POST /api/v1/auth/reset-password` with `{ email, otp, newPassword }`.
- On success: Redirect to `/login` with success toast.

### 5. Logout Fix
- Create `logoutAction` server action in a shared actions file.
- Wire it into `UserDropdown.tsx` logout menu item.
- Clear all auth cookies and redirect to `/login`.

---

## Verification

- Full registration flow: `/register` → `/verify-email` (OTP) → `/login`.
- Forgot password flow: `/forgot-password` → `/reset-password` (OTP) → `/login`.
- Logout: Click logout in dashboard → cookies cleared → redirected to `/login`.
- `pnpm build` succeeds.
