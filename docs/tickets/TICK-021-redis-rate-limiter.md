# [TICK-021] Redis-Backed Sliding-Window Rate Limiter Middleware

- **Status**: Done
- **Spec Reference**: [optimization_and_production_hardening_spec.md](../specs/optimization_and_production_hardening_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-020
- **Blocks**: TICK-024, TICK-032

---

## Objective

Implement a production-grade sliding-window rate limiting middleware in Express backed by Upstash Redis to protect authentication routes from brute force attacks and prevent API scraping/abuse.

---

## Detailed Tasks

### 1. Rate Limiting Middleware Implementation
- Create `backend/src/app/middleware/rateLimit.ts`:
  - Utilize `redisService` to implement sliding window or atomic token bucket.
  - Key format: `ratelimit:{tier}:{clientIp}` where `clientIp` extracts from `X-Forwarded-For` or `req.ip`.
  - Return HTTP 429 Too Many Requests when threshold exceeded.
  - Provide standard headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After`.

### 2. Tier Configuration
- **Auth Tier** (`/api/auth/*`, `/api/v1/auth/*`): 10 requests per 60 seconds per IP.
- **General API Tier** (`/api/v1/*`): 100 requests per 60 seconds per IP.
- **Exemptions**: Stripe webhook (`/webhook`) must bypass rate limiting.

### 3. Wire into Express Pipeline
- In `backend/src/app.ts`, register the rate limiter after cookie/body parsers and before routers.

---

## Verification

```bash
# Automated burst verification
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/sign-in; done
```
- [x] First 10 requests return 200 or 400/401.
- [x] 11th request returns 429 Too Many Requests.
- [x] `Retry-After` header indicates remaining window time in seconds.
- [x] Stripe webhook endpoint remains unaffected by rate limits.

