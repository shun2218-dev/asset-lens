# Autonomy Policy

## Task Prioritization

- **Do NOT ask the user for task order confirmation.** Decide the execution order autonomously based on dependency, complexity, and impact.
- Prioritize: quick wins and blockers first, then features by dependency order.
- If a decision has no significant user-facing trade-off, proceed without asking.

## Decision Making

- For implementation details (naming, file structure, library choice), make the call and proceed.
- Only ask when there is a **genuine trade-off** that the user needs to weigh in on (e.g., breaking changes, UX decisions, cost implications).
- If unsure, state your rationale briefly and proceed — the user will correct if needed.
