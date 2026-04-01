---
description: How to implement a new feature from planning to merge
---

# Feature Development Workflow

> **⚠️ CRITICAL RULES:**
> - **NEVER commit directly to `develop` or `main`**. These branches accept merges only.
> - ALL work (features, fixes, docs, chores) MUST be done on a dedicated branch first.
> - Branch types: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`
> - Even single-file changes (docs, config, biome auto-fix, package install) require a branch.
> - **Issue closing**: Feature PRs (→ `develop`) should reference Issues (e.g. `Relates to #<number>`) for traceability. **Release PRs (`release/vX.Y.Z` → `main`)** must include `Closes #<number>` for all Issues resolved in that release — GitHub auto-closes Issues only on merge to the default branch (`main`).
> - **Language**: All Issues, PRs, commit messages, and CHANGELOG entries MUST be written in **English**. UI text may be in Japanese. Code comments must be in English.
> - **Code comments**: Write only comments a human developer would write. No AI-style verbose explanations, no issue/ticket numbers in code comments (e.g. `/* #63: ... */`), no narrating what the code obviously does.

> **🛑 BEFORE EVERY `git add` / `git commit`:**
> 1. Run `git branch --show-current` to confirm you are NOT on `develop` or `main`
> 2. If you are on `develop` or `main`, STOP and create a branch first (`git checkout -b <type>/<name>`)
> 3. No exceptions — even for "trivial" changes (formatting, config, package installs)
> 4. **NEVER use `--no-verify`** — husky hooks enforce lint/format and must always run

## 1. Create Issue & Project Setup
// turbo
```bash
gh issue create --title "<Issue Title>" --body "<Description with acceptance criteria>"
```
Note the issue number (e.g. #17). **Every task must start with an Issue.**

### MANDATORY: Post-Creation Checklist (see `/project-sync` and `/milestone` skills)

After creating an Issue, complete ALL of the following before proceeding:

**1a. Add to Project Board**
// turbo
```bash
gh project item-add 1 --owner shun2218-dev --url "https://github.com/shun2218-dev/asset-lens/issues/<NUMBER>"
```

**1b. Assign Milestone** (see `/project-sync` milestone decision guide)
// turbo
```bash
gh issue edit <NUMBER> --milestone "<MILESTONE_TITLE>"
```

**1c. Set Relationships** (see `/milestone` skill Step 5)
Evaluate dependencies: Does this Issue depend on or block other Issues?
- If YES → set parent/sub-issue relationship using GraphQL API
- If NO → skip

**1d. Set Project Dates** (Start Date + Target Date)
```bash
ITEM_ID=$(gh project item-list 1 --owner shun2218-dev --format json --jq ".items[] | select(.content.number == <NUM>) | .id" --limit 60)
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTF_lAHOBQUjOs4BTRBFzhAjo8M --date "<START_DATE>"
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTF_lAHOBQUjOs4BTRBFzhAjo8Q --date "<TARGET_DATE>"
```

> ⚠️ **Do NOT skip any step.** All Issues must have: Project Board ✅ Milestone ✅ Relationships ✅ Dates ✅

## 2. Create Implementation Plan
- Research the codebase and create `implementation_plan.md` artifact
- Request user feedback before proceeding

## 3. Create Feature Branch & Update Status
// turbo
```bash
git checkout develop
git checkout -b feature/<descriptive-name>
```
Branch naming: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`

### Update Project Status to "In Progress" (see `/project-sync` skill)


## 4. Implement
- Create `task.md` artifact to track progress
- **Update Issue checkboxes** (`gh issue edit <number> --body ...`) as each task is completed
- Make atomic commits with conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for refactoring
  - `chore:` for tooling/config
  - `docs:` for documentation
  - `style:` for formatting (no logic change)
  - `test:` for adding/updating tests
  - `perf:` for performance improvements

> **🧪 MANDATORY: Tests for every change**
> - Every new or modified **server action** MUST have a corresponding `.test.ts` file
> - Every new or modified **utility/lib function** MUST have unit tests
> - Every new or modified **UI component** should have Storybook stories
> - Test files must be created/updated **in the same commit or before** the PR
> - Run new tests immediately after writing them to confirm they pass
> - **NEVER skip tests** — untested code will not be merged

## 5. Quality Checklist (MANDATORY)
Before creating a PR, ensure:
- [ ] Unit tests for all new/modified server actions and utilities
- [ ] Storybook stories for all new/modified UI components
- [ ] E2E tests for new user-facing features
- [ ] All tests pass (unit + E2E + lint)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No lint errors (`npx biome check`)

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
**Include `Relates to #<issue-number>` in the PR body** for traceability (do NOT use `Closes` here — it won't work on non-default branches).

> ⚠️ `Closes #` only auto-closes Issues on merge to `main`. All `Closes #` references should be consolidated in the **release PR** (see release workflow).

```bash
git push origin <branch-name>
gh pr create --base develop --head <branch-name> --title "<title>" --body "<description>

Relates to #<issue-number>"
```

## 7. Self-Review (MANDATORY — see `/pr` skill)

After PR creation and CI passing, perform a **senior engineer self-review** against the diff.

> ⚠️ **This step is NOT optional.** Every PR must have a posted self-review comment before merge.

1. **Analyze the diff**:
```bash
git diff develop
```

2. **Post review as PR comment** covering:
   - ⚠️ Must Fix — security flaws, missing error handling, broken logic
   - 💡 Suggestions — performance, naming, patterns
   - 📝 Design rationale — explain non-obvious decisions
   - Scalability considerations and follow-up suggestions

```bash
gh pr comment <PR-number> --body "<review content>"
```

3. **Fix any Must Fix items**, then re-run tests and push:
```bash
git add <fixed-files>
git commit -m "fix: address self-review findings"
git push origin <branch-name>
```

> Refer to the full `/pr` skill (`.agents/skills/pr-review/SKILL.md`) for review criteria, formatting guide, and decision framework.

## 8. Merge PR
After self-review is complete and CI passes, merge the PR:
```bash
gh pr merge <pr-number> --merge --delete-branch
```
This will:
- Merge the branch into `develop`
- Delete the remote branch

> ℹ️ Issues are NOT auto-closed here — they are closed via `Closes #` in the **release PR** (merge to `main`).

## 9. Clean Up Local Branch
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
