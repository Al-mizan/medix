# Agent Workflow Guide: Matt Pocock Engineering Skills Suite

This guide defines the engineering protocols, issue tracker integration, and triage lifecycle for autonomous AI agents and engineers working in this repository.

---

## 1. Issue Tracker Configuration

- **Primary Tracker**: GitHub Issues (`Al-mizan/medix`) accessed via GitHub CLI (`gh issue`).
- **Local Fallback**: Tickets can be drafted in `.scratch/tickets/` as markdown files if offline.

### Common CLI Operations for Agents
```bash
# List issues needing evaluation
gh issue list --label "needs-triage"

# List issues ready for autonomous execution
gh issue list --label "ready-for-agent"

# View details of a specific issue
gh issue view <issue-number>

# Update state of an issue
gh issue edit <issue-number> --remove-label "needs-triage" --add-label "ready-for-agent"
```

---

## 2. Triage State Machine

Every task, issue, or bug follows this state lifecycle:

```
                  ┌──────────────┐
                  │ needs-triage │
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 ┌────────────┐   ┌──────────────┐   ┌─────────┐
 │ needs-info │   │ ready-for-   │   │ wontfix │
 └────────────┘   │ agent        │   └─────────┘
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │ ready-for-   │ (if architectural / sensitive)
                  │ human        │
                  └──────────────┘
```

- **`needs-triage`**: Newly reported bug or feature request awaiting scope and reproduction steps.
- **`needs-info`**: Missing logs, reproductive steps, or design clarity from author.
- **`ready-for-agent`**: Fully specified with acceptance criteria, scoped to fit in a single agent context window.
- **`ready-for-human`**: High-risk or credentials/infrastructure actions requiring human execution.
- **`wontfix`**: Rejected or out of scope.

---

## 3. Skill Flow: Idea to Production

1. **`/grill-with-docs`** / **`/grill-me`**: Interrogate ideas against `CONTEXT.md` and `docs/adr/`.
2. **`/to-spec`**: Produce formal technical specification and PRD.
3. **`/to-tickets`**: Decompose the spec into vertical "tracer-bullet" tickets:
   - Each ticket slices through db -> API -> UI -> tests.
   - Declares explicit blocking dependencies (`Blocked by #X`).
4. **`/implement`**: Autonomous ticket implementation:
   - Drives implementation via `/tdd` (test-first: red-green-refactor).
   - Validates standards and spec with `/code-review`.
