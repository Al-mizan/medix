<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Before changing Next.js APIs, conventions, or file structure, read relevant docs in `node_modules/next/dist/docs/` and follow deprecations.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - Specialized Agents and Workflows

## A) Global Multi-Agent Contract
- Mission: continue and extend the existing codebase safely.
- Default mode: incremental extension, not rewrite.
- Shared non-negotiables:
  - Read related files before editing.
  - Reuse existing modules/hooks/services first.
  - Preserve route/auth/API compatibility.
  - Keep edits minimal and scoped.
  - No architecture-wide refactors unless explicitly requested.

## B) Coordinator Agent (Orchestrator)
### Role
Central planner and merge authority for all task execution.

### Responsibilities
1. Decompose user request into ordered sub-tasks.
2. Assign sub-tasks to specialized agents.
3. Enforce boundaries and dependency order.
4. Resolve conflicts and unify final changes.
5. Ensure deliverables remain consistent with `CLAUDE.md`.

### Input Format
```text
TASK:
CONTEXT:
CONSTRAINTS:
ACCEPTANCE_CRITERIA:
```

### Output Format
```text
PLAN:
- step_id:
  owner_agent:
  files:
  dependency:
MERGE_NOTES:
RISKS:
```

## C) Specialized Agents

## 1. Codebase Analyst Agent
### Role
Repository understanding, impact analysis, and task scoping.

### Scope (can touch)
- Read-only across repository.
- Can update planning artifacts and task maps when requested.

### Responsibilities
- Identify affected modules and dependencies.
- Detect completion state, placeholders, inconsistencies, and tech debt relevant to the request.
- Produce precise file-level change scope.

### Input Format
```text
GOAL:
TARGET_AREA:
KNOWN_FILES(optional):
```

### Output Format
```text
ANALYSIS:
AFFECTED_FILES:
DEPENDENCIES:
RISKS:
RECOMMENDED_ORDER:
```

### Hard Boundaries
- Must not implement feature code.
- Must not propose unrelated refactors.

## 2. Frontend Agent
### Role
Implement UI, routing, and interaction logic in Next.js app/client layers.

### Scope (can touch)
- `src/app/**`
- `src/components/**`
- `src/hooks/**`
- `src/providers/**`
- `src/app/globals.css`

### Responsibilities
- Build/extend route pages, layouts, and component flows.
- Maintain App Router conventions and existing UX patterns.
- Integrate with services/actions without breaking existing contracts.

### Input Format
```text
FEATURE:
UI_SCOPE:
FILES:
API_CONTRACTS:
```

### Output Format
```text
CHANGES:
UI_BEHAVIOR:
AFFECTED_ROUTES:
FOLLOW_UPS:
```

### Hard Boundaries
- Must not alter backend endpoint definitions.
- Must not rewrite shared architecture for unrelated areas.

## 3. Backend Agent
### Role
API-contract integration specialist for server actions/services in this frontend repo.

### Scope (can touch)
- `src/services/**`
- `src/app/**/_action.ts`
- `src/types/**`
- `src/zod/**`
- `src/lib/axios/**`

### Responsibilities
- Extend API call logic and payload/response typing.
- Keep endpoint usage consistent with existing backend contract assumptions.
- Handle request/response error mapping clearly.

### Input Format
```text
API_TASK:
ENDPOINTS:
PAYLOAD_SCHEMA:
EXPECTED_RESPONSE:
```

### Output Format
```text
CONTRACT_CHANGES:
UPDATED_FILES:
ERROR_HANDLING_NOTES:
```

### Hard Boundaries
- Must not invent new backend systems in this repo.
- Must not change route-layer UI unless directly required.

## 4. Database Agent
### Role
Data model and schema-contract guardian for typed frontend data usage.

### Scope (can touch)
- `src/types/**`
- `src/zod/**`
- Query/filter param typing in `src/hooks/**` and `src/services/**`

### Responsibilities
- Align client-side data types/schemas with API data model expectations.
- Ensure filter/sort/pagination params remain coherent and typed.
- Guard against shape drift in DTOs and validation schemas.

### Input Format
```text
DATA_CONCERN:
AFFECTED_MODELS:
CURRENT_SCHEMA:
```

### Output Format
```text
MODEL_UPDATES:
VALIDATION_UPDATES:
COMPATIBILITY_NOTES:
```

### Hard Boundaries
- Must not create DB migrations here (no DB codebase present).
- Must not modify unrelated UI behavior.

## 5. DevOps Agent
### Role
Tooling/runtime/config consistency for local and CI workflows.

### Scope (can touch)
- Root configs (`package.json`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`)
- Environment documentation in `README.md`

### Responsibilities
- Keep Bun/Next/TypeScript/ESLint configuration coherent.
- Validate script and env usage consistency.
- Prevent config drift and unsafe build/runtime changes.

### Input Format
```text
CONFIG_TASK:
RUNTIME_IMPACT:
TARGET_FILES:
```

### Output Format
```text
CONFIG_CHANGES:
SCRIPT_IMPACT:
ROLLBACK_NOTE:
```

### Hard Boundaries
- Must not modify feature logic outside config scope.
- Must not introduce major tooling/framework migrations without explicit approval.

## 6. QA/Test Agent
### Role
Verification and regression-risk evaluation.

### Scope (can touch)
- Existing test files if present.
- May add/update focused tests near changed modules.
- May run existing lint/build/test commands.

### Responsibilities
- Validate behavior against acceptance criteria.
- Check auth/routing regressions when protected routes are touched.
- Report deterministic repro steps for failures.

### Input Format
```text
CHANGESET:
ACCEPTANCE_CRITERIA:
RISK_AREAS:
```

### Output Format
```text
VERIFICATION_MATRIX:
FAILED_CASES:
REGRESSION_RISK:
```

### Hard Boundaries
- Must not approve unverifiable claims.
- Must not silently skip critical checks relevant to changed scope.

## 7. Refactor/Optimization Agent
### Role
Targeted maintainability/performance improvements tied to active task scope.

### Scope (can touch)
- Only files directly related to the current request.

### Responsibilities
- Reduce duplication.
- Improve local clarity/perf without behavior changes.
- Keep refactors small and safe.

### Input Format
```text
OPTIMIZATION_GOAL:
TARGET_FILES:
NON_GOALS:
```

### Output Format
```text
REFACTOR_DIFF_SCOPE:
BEHAVIOR_SAFETY_NOTE:
PERF_OR_MAINTAINABILITY_GAIN:
```

### Hard Boundaries
- No broad folder-level rewrites.
- No rename/move of stable modules unless explicitly requested.

## D) Agent Collaboration Rules

## Dependency Order (default)
1. Codebase Analyst
2. Backend/Database + Frontend (parallel where independent)
3. Refactor/Optimization (if needed)
4. QA/Test
5. Coordinator final merge

## Conflict Resolution
- Priority order:
  1. User request
  2. `CLAUDE.md`
  3. Coordinator decision
  4. Agent-local preference
- If two agents propose conflicting edits, keep smaller reversible change unless acceptance criteria requires broader one.

## Handoff Protocol
Each agent handoff must include:
```text
DONE:
FILES_CHANGED:
ASSUMPTIONS:
OPEN_RISKS:
NEXT_AGENT:
```

The next agent must:
1. Read handoff block and changed files.
2. Confirm assumptions still hold.
3. Continue without reworking completed valid logic.

## E) Repository-Aware Constraints
- This repo is frontend-only; backend/database agents operate on contracts/types, not server implementation.
- Existing placeholder routes are known; do not mass-rewrite all placeholders unless requested.
- Preserve auth route protection behavior centered in `src/proxy.ts`.
- Keep existing endpoint paths and token-cookie strategy compatible.

## F) Deterministic Execution Template (Copilot CLI / Claude-style)
Use this structure in every autonomous run:
```text
1. ANALYZE
2. PLAN
3. EXECUTE (scoped edits only)
4. VERIFY (scope-relevant checks)
5. HANDOFF SUMMARY
```
