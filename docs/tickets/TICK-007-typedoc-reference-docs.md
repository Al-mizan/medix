# [TICK-007] TypeScript API Reference: TypeDoc Setup & Generation

- **Status**: Ready
- **Spec Reference**: [testing_and_documentation_spec.md §2.2 (Step 4), §4](file:///mnt/workspace/Projects/hobby/digital-healthcare/docs/specs/testing_and_documentation_spec.md)
- **Estimated Size**: Context Window Sized (~1 session)
- **Depends On**: TICK-006
- **Blocks**: None (Final ticket in suite)

---

## Objective
Configure and generate searchable, static HTML TypeScript reference documentation using TypeDoc, targeting backend core services, shared utilities, QueryBuilder, error handlers, and authentication middleware. Output must be emitted directly to `docs/typedoc/`.

---

## Detailed Tasks
1. **Dependencies**:
   - Install `typedoc` as a devDependency in `backend/`.
2. **TypeDoc Configuration (`backend/typedoc.json`)**:
   - Configure entry points targeting:
     - `src/app/utils/QueryBuilder.ts`
     - `src/app/middleware/checkAuth.ts`
     - `src/app/middleware/validateRequest.ts`
     - `src/app/middleware/globalErrorHandler.ts`
     - `src/app/errorHelpers/AppError.ts`
     - `src/app/shared/catchAsync.ts`
     - `src/app/shared/sendResponse.ts`
     - `src/app/module/appointment/appointment.service.ts`
     - `src/app/interface/`
   - Set output directory: `"out": "../docs/typedoc"`.
   - Configure theme, cleanOutputDir, readme: `"none"` or link to `README.md`.
   - Ensure ESM module resolution and TypeScript configuration (`tsconfig.json`) are respected.
3. **Scripts**:
   - Add `"docs:typedoc": "typedoc --options typedoc.json"` to `backend/package.json`.
   - Add `"docs:typedoc": "pnpm --filter backend-ph-healthcare docs:typedoc"` to root `package.json`.
4. **Execution & Generation**:
   - Run `pnpm run docs:typedoc` to generate static HTML docs in `docs/typedoc/`.
   - Verify `docs/typedoc/index.html` loads and all documented modules, types, classes, and methods render cleanly.

---

## Verification
```bash
pnpm docs:typedoc
test -f docs/typedoc/index.html && echo "TypeDoc generated successfully"
```
The documentation renders without unhandled TypeScript compiler errors or broken symbols.
