---
name: dependency-update
description: Review and batch-update Dependabot PRs. Triage each PR (merge, close, or manual fix), run all tests, and create a single batch PR. Invoke with "/deps".
---

# Dependency Update Skill

Periodic maintenance skill for managing Dependabot PRs and keeping dependencies current.

## When to Use

- When Dependabot PRs accumulate (typically weekly)
- When the user says "/deps"
- Before a release, to ensure dependencies are current

## Workflow

### 1. List Open Dependabot PRs

```bash
gh pr list --author "app/dependabot" --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title)"'
```

### 2. Check CI Status for Each PR

```bash
for n in <PR_NUMBERS>; do
  echo -n "#$n: "
  gh pr checks $n --json name,state --jq '[.[] | select(.name == "Unit & Storybook Tests" or .name == "Lint & Format")] | map("\(.name):\(.state)") | join(" ")'
done
```

### 3. Triage Each PR

Categorize into:
- **Merge**: CI passing, non-breaking (minor/patch)
- **Close**: CI failing, or major version bump requiring investigation
- **Manual Fix**: CI failing but update is important (e.g., security fix)

#### Decision Matrix

| CI Status | Version Bump | Action |
|-----------|-------------|--------|
| ✅ Pass | Patch/Minor | Merge directly |
| ✅ Pass | Major | Close — manual upgrade with testing |
| ❌ Fail | Any | Close — batch update manually |
| ❌ Fail | Security | Fix and merge (priority) |

### 4. Attempt Direct Merge (CI-passing PRs only)

```bash
gh pr merge <NUMBER> --merge --admin
```

**Known issues:**
- **Workflow file changes** (e.g., CI actions): `gh pr merge` may fail with "refusing to update workflow without `workflow` scope". Close and update manually.
- **Merge conflicts** (package-lock.json): Close and update manually in batch.

### 5. Batch Manual Update (for closed/conflicted PRs)

```bash
# Create branch from develop
git checkout develop && git pull origin develop
git checkout -b chore/batch-dependency-update

# Update CI actions in .github/workflows/ci.yml manually

# Install specific packages (NOT npm update — too aggressive)
npm install <package1>@<version> <package2>@<version> ...
```

> **⚠️ CRITICAL**: Do NOT use `npm update` or `npx npm-check-updates -u`.
> These update ALL transitive dependencies and frequently break Storybook tests.
> Always install specific packages individually.

### 6. Run ALL Tests Before Committing

```bash
# Unit + Storybook tests (MUST all pass)
npx vitest run

# Verify output shows:
# Test Files  <N> passed (<N>)  ← no failures
# Tests       <N> passed (<N>)  ← no failures
```

If Storybook tests fail with `__dirname is not defined` or similar ESM errors,
a Next.js-related package was updated that breaks the Storybook + Vitest integration.
Revert that specific package.

### 7. Lint Check

```bash
npx biome check . --diagnostic-level=error
```

### 8. Commit, Push, PR

```bash
git add -A
git commit -m "chore: batch dependency update

- <list updated packages with version changes>
- <list CI action updates>

All N tests passing (M files)"

git push origin chore/batch-dependency-update

gh pr create --base develop --head chore/batch-dependency-update \
  --title "chore: batch dependency update" \
  --body "<list changes, closed Dependabot PR numbers>" \
  --label "infra"
```

### 9. Wait for CI, Then Merge

Only merge after ALL CI checks pass:
- ✅ Lint & Format
- ✅ Unit & Storybook Tests
- ✅ Visual Regression (Chromatic)
- ✅ Vercel Preview

## Packages to NEVER Auto-Update (Major Version)

These require manual migration guides:
- `@vitejs/plugin-react` (Vite plugin — breaking changes between majors)
- `next` (Next.js — always follow migration guide)
- `@storybook/*` (Storybook — follow upgrade guide)
- `drizzle-orm` / `drizzle-kit` (check migration notes)

## Post-Update Checklist

- [ ] All unit tests pass
- [ ] All Storybook tests pass
- [ ] Lint passes
- [ ] CI checks pass on PR
- [ ] No visual regressions (Chromatic)
