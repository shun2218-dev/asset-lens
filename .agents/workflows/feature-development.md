---
description: How to implement a new feature from planning to merge
---

# Feature Development Workflow

> **⚠️ CRITICAL RULES:**
> - **NEVER commit directly to `develop` or `main`**. These branches accept merges only.
> - ALL work (features, fixes, docs, chores) MUST be done on a dedicated branch first.
> - Branch types: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`
> - Even single-file changes (docs, config) require a branch.
> - **NEVER manually close Issues**. Issues are closed automatically when the PR with `Closes #<number>` is merged.
> - **Language**: All Issues, PRs, commit messages, and CHANGELOG entries MUST be written in **English**. UI text and comments in code may be in Japanese.

## 1. Create Issue
// turbo
```bash
gh issue create --title "<Issue Title>" --body "<Description with acceptance criteria>"
```
Note the issue number (e.g. #17). **Every task must start with an Issue.**

## 2. Create Implementation Plan
- Research the codebase and create `implementation_plan.md` artifact
- Request user feedback before proceeding

## 3. Create Feature Branch
// turbo
```bash
git checkout develop
git checkout -b feature/<descriptive-name>
```
Branch naming: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`

## 4. Implement
- Create `task.md` artifact to track progress
- **Update Issue checkboxes** (`gh issue edit <number> --body ...`) as each task is completed
- Make atomic commits with conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for refactoring
  - `chore:` for tooling/config
  - `docs:` for documentation

## 5. Quality Checklist (MANDATORY)
Before creating a PR, ensure:
- [ ] Storybook stories for all new/modified UI components
- [ ] Unit tests for all new/modified server actions
- [ ] E2E tests for new user-facing features
- [ ] All tests pass (unit + E2E)

### Test Execution Strategy
Husky hooks handle fast feedback automatically:
- **pre-commit**: `lint-staged` (biome check/format on staged files only) — instant
- **pre-push**: `vitest --changed` (unit tests related to changed files only) — fast

**Before creating a PR**, run the full suite manually:
// turbo
```bash
npx vitest run
```
// turbo
```bash
npx playwright test --project=chromium --workers=1
```

## 6. Push Branch & Create PR
**Before creating a PR, verify:**
- All checkboxes in the linked Issue are checked ✅
- Quality checklist (Step 5) is satisfied

Push the branch and create a PR targeting `develop`.
**Include `Closes #<issue-number>` in the PR body** to auto-close the Issue on merge.

```bash
git push origin <branch-name>
gh pr create --base develop --head <branch-name> --title "<title>" --body "<description>

Closes #<issue-number>"
```

## 7. Merge PR
After review, merge the PR on GitHub (or via CLI):
```bash
gh pr merge <pr-number> --merge --delete-branch
```
This will:
- Merge the branch into `develop`
- Delete the remote branch
- Auto-close linked Issues

## 8. Clean Up Local Branch
// turbo
```bash
git checkout develop
git pull origin develop
git branch -d <branch-name>
```

## CI (Automated)
GitHub Actions runs automatically on every PR:
- **All PRs → develop/main**: Lint + Unit/Storybook tests
- **PRs → main only**: E2E tests (requires secrets)

CI must pass before merge. See `.github/workflows/ci.yml`.
