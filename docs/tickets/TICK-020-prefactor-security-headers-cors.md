# [TICK-020] Prefactor: DevTools Dependency, Next.js Security Headers & CORS

- **Status**: Completed
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: None
- **Blocks**: TICK-021, TICK-022, TICK-027

---

## Objective

Eliminate dev-only dependencies from the production bundle, configure HTTP security response headers in Next.js, restrict CORS origins in Express based on `NODE_ENV`, and disable production browser source maps.

---

## Detailed Tasks

### 1. Frontend Dependency Hygiene
- In `frontend/package.json`, move `@tanstack/react-devtools` and `@tanstack/react-form-devtools` from `dependencies` to `devDependencies`.

### 2. Next.js Security Headers & Build Settings
- In `frontend/next.config.ts`, add the `headers()` async configuration:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-DNS-Prefetch-Control: on`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`
- Configure `productionBrowserSourceMaps: false` in `frontend/next.config.ts`.

### 3. Backend Environment-Aware CORS
- In `backend/src/app.ts`, update CORS middleware:
  - In production (`NODE_ENV === "production"`), whitelist only `envVars.FRONTEND_URL` and `envVars.BETTER_AUTH_URL`.
  - In development, permit `http://localhost:3000` and `http://localhost:5000`.

### 4. Logging Sanitization Audit
- Audit `backend/src/app/middleware/globalErrorHandler.ts` and `checkAuth.ts` to ensure raw JWT tokens, user passwords, and authorization headers are never logged to `stdout`.

---

## Verification

```bash
# Verify headers on frontend build
curl -I http://localhost:3000/
# Verify CORS behavior on backend
curl -I -H "Origin: http://evil.com" http://localhost:5000/api/v1/doctors
```
- [x] Security headers appear in Next.js response.
- [x] Unauthorized origins receive CORS rejection in production mode.
- [x] DevTools packages are strictly in `devDependencies`.
- [x] `next build` runs without emitting browser source maps.
