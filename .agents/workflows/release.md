---
description: How to create a production release from develop to main
---

# Release Workflow

// turbo-all

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

## 3. Update Documentation
Update relevant docs before releasing:
- `README.md` — if features affect usage or setup
- API docs, migration notes, new env vars, etc.
Commit docs changes to `develop`.

## 4. Push develop
```bash
git push origin develop
```

## 5. Create Release Branch
Determine version bump (major.minor.patch):
- **major**: breaking changes
- **minor**: new features
- **patch**: bug fixes only

```bash
git checkout -b release/v<VERSION> develop
```

## 6. Bump Version
Edit `package.json` version field, then:
```bash
git add -A && git commit -m "chore: bump version to <VERSION>"
git push origin release/v<VERSION>
```

## 7. Create PR
```bash
gh pr create --base main --head release/v<VERSION> --title "Release v<VERSION>" --body "<release notes in English>"
```
PR description should include: New Features, Bug Fixes, Improvements, Test Results, Migration Notes.

## 8. After PR Merge — Tag & Release
```bash
git checkout main && git pull origin main
git tag v<VERSION>
git push origin v<VERSION>
gh release create v<VERSION> --title "v<VERSION>" --notes "<release notes>"
```

## 9. Sync develop & Clean Up
```bash
git checkout develop
git merge release/v<VERSION> --no-ff -m "Merge branch 'release/v<VERSION>' into develop"
git push origin develop
git branch -d release/v<VERSION>
git push origin --delete release/v<VERSION>
```

## 10. Close Related Issues
```bash
gh issue close <NUMBER> --reason completed
```
Or reference `Closes #<NUMBER>` in the PR body for auto-close on merge.
