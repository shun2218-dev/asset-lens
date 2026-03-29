# Testing Policy

## Test Stack

| Tool | Purpose | Location |
|------|---------|----------|
| Vitest | Unit tests for server actions and utilities | `**/*.test.ts` |
| Storybook | Component visual testing and documentation | `**/*.stories.tsx` |
| Playwright | E2E integration tests | `e2e/**/*.spec.ts` |

## Test Requirements

### Server Actions (`app/actions/`)

- Every server action MUST have a corresponding `.test.ts` file
- Mock `db` from `@/db` — never hit a real database
- Test: success, validation failure, and error cases

### UI Components (`components/features/`)

- Every new/modified component MUST have a Storybook story
- Stories go alongside the component file
- Cover: default, loading, empty, error states

### E2E Tests (`e2e/`)

- Cover critical user flows
- Playwright Chromium only (`--project=chromium --workers=1`)

## Automatic Checks (Husky)

- **pre-commit**: `lint-staged` (Biome on staged files)
- **pre-push**: `vitest --changed` (related tests only)

## Manual Checks (Before PR)

```bash
npx vitest run
npx playwright test --project=chromium --workers=1
```

## Quality Gate

- ALL tests must pass before creating a PR
- Zero test failures required for merge
