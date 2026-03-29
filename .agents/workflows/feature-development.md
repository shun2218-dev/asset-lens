---
description: How to implement a new feature from planning to merge
---

# Feature Development Workflow

> **⚠️ CRITICAL BRANCH POLICY:**
> - **NEVER commit directly to `develop` or `main`**. These branches accept merges only.
> - ALL work (features, fixes, docs, chores) MUST be done on a dedicated branch first.
> - Branch types: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`
> - Even single-file changes (docs, config) require a branch.

## 1. Create Issue
// turbo
```bash
gh issue create --title "<Issue Title>" --body "<Description with acceptance criteria>" --label "enhancement"
```
Note the issue number (e.g. #17).

## 2. Create Implementation Plan
- Research the codebase and create `implementation_plan.md` artifact
- Request user feedback before proceeding

## 3. Create Feature Branch
// turbo
```bash
git checkout develop
git checkout -b feature/<descriptive-name>
```
Branch naming: `feature/`, `fix/`, `refactor/`, `docs/`

## 4. Implement
- Create `task.md` artifact to track progress
- **Never commit directly to `develop` or `main`**
- Make atomic commits with conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for refactoring
  - `chore:` for tooling/config
  - `docs:` for documentation

## 5. Test
// turbo
```bash
npx vitest run
```
// turbo
```bash
npx playwright test --project=chromium --workers=1
```

## 6. Lint & Format
// turbo
```bash
npx biome check --write .
npx biome check . --diagnostic-level=error
```

## 7. Commit & Merge to develop
```bash
git add -A && git commit -m "<conventional commit message>"
git checkout develop
git merge feature/<name> --no-ff -m "Merge branch 'feature/<name>' into develop"
```

## 8. Clean Up Branch
// turbo
```bash
git branch -d feature/<name>
```

## 9. Close Issue (if releasing now)
Issue will be closed during the release workflow. 
To reference in commit: include `Closes #<number>` in commit message.

## CI (Automated)
GitHub Actions runs automatically on every PR:
- **All PRs → develop/main**: Lint + Unit/Storybook tests
- **PRs → main only**: E2E tests (requires secrets)

CI must pass before merge. See `.github/workflows/ci.yml`.
