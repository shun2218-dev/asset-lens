---
description: How to create a production release from develop to main
---

# Release Workflow

// turbo-all

> **📦 RELEASE CADENCE POLICY:**
> - **Immediate patch release**: User-facing bugs that break functionality or display (e.g. crashes, broken pages, data corruption). Always release as patch (x.y.Z) ASAP.
> - **Batched release**: Non-critical improvements (performance, refactoring, DX), new features, and bugs that don't visibly affect end-user operation. Release at a natural milestone or when enough changes accumulate.
> - **Minor releases (features)**: Batch related features into a single minor release (x.Y.0). Don't release per-feature unless standalone and high-impact.

## Prerequisites
- All features merged into `develop`
- All tests passing
- Lint errors resolved

## 1. Run All Tests
```bash
npx vitest run
```
```bash
npx playwright test --project=chromium --workers=1
```

## 2. Run Linter
```bash
npx biome check --write .
npx biome check . --diagnostic-level=error
```

## 3. Create Release Branch
Determine version bump (major.minor.patch):
- **major**: breaking changes
- **minor**: new features
- **patch**: bug fixes only

```bash
git checkout -b release/v<VERSION> develop
```

## 4. Update CHANGELOG & Docs (MANDATORY)
On the release branch:
- Move `[Unreleased]` entries in `CHANGELOG.md` to a new `[<VERSION>] - <DATE>` section
- Update `README.md` if features affect usage or setup
- Update `package.json` version field

```bash
git add -A && git commit -m "chore: bump version to <VERSION>"
git push origin release/v<VERSION>
```

## 5. Create PR
```bash
gh pr create --base main --head release/v<VERSION> --title "Release v<VERSION>" --body "<release notes in English>"
```
PR description should include: New Features, Bug Fixes, Improvements, Test Results, Migration Notes.

## 6. After PR Merge — Tag & Release
```bash
git checkout main && git pull origin main
git tag v<VERSION>
git push origin v<VERSION>
gh release create v<VERSION> --title "v<VERSION>" --notes "<release notes>"
```

## 7. Sync develop & Clean Up
```bash
git checkout develop
git merge release/v<VERSION> --no-ff -m "Merge branch 'release/v<VERSION>' into develop"
git push origin develop
git branch -d release/v<VERSION>
git push origin --delete release/v<VERSION>
```

## 8. Close Related Issues
```bash
gh issue close <NUMBER> --reason completed
```
Or reference `Closes #<NUMBER>` in the PR body for auto-close on merge.
