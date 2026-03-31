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
git add CHANGELOG.md package.json README.md
git commit -m "chore: bump version to <VERSION>"
git push origin release/v<VERSION>
```

## 5. Create PR
```bash
gh pr create --base main --head release/v<VERSION> --title "Release v<VERSION>" --body "<release notes in English>"
```
PR description should include: New Features, Bug Fixes, Improvements, Test Results, Migration Notes.

> **⚠️ IMPORTANT**: Include `Closes #<number>` for **every Issue** resolved in this release. This is the only place where Issues get auto-closed (GitHub only auto-closes on merge to the default branch `main`).

## 6. After PR Merge — Tag & Release
```bash
git checkout main && git pull origin main
git tag v<VERSION>
git push origin v<VERSION>
gh release create v<VERSION> --title "v<VERSION>" --notes "<release notes>"
```

## 7. Sync develop & Clean Up

> **⚠️ CRITICAL**: Merge the `release/v<VERSION>` branch into `develop`.
> **NEVER** merge `main` → `develop`. The release branch contains CHANGELOG and version updates
> that must flow into `develop` — this is the purpose of this step.

```bash
git checkout develop
git merge release/v<VERSION> --no-ff -m "Merge branch 'release/v<VERSION>' into develop"
git push origin develop
git branch -d release/v<VERSION>
git push origin --delete release/v<VERSION>
```

## 8. Verify Issues Closed
After the release PR is merged, verify that all referenced Issues were auto-closed:
```bash
gh issue list --state open --json number,title
```
If any Issues that should be closed are still open, it means they were not referenced with `Closes #` in the release PR. Fix by manually closing:
```bash
gh issue close <NUMBER> --reason completed
```

## 9. Sync Project Board (MANDATORY — see `/project-sync` skill)
Update the GitHub Project board to reflect the release:

1. **Set closed Issues to "Done"**: Update all `In Progress` items whose Issues are now closed:
```bash
gh project item-list 1 --owner shun2218-dev --format json | python3 -c "
import json, sys, subprocess
data = json.load(sys.stdin)
for item in data.get('items', []):
    status = item.get('status', '')
    if status in ('In Progress', 'Todo'):
        item_id = item['id']
        title = item['title']
        result = subprocess.run(
            ['gh', 'issue', 'list', '--state', 'closed', '--search', title[:50], '--json', 'number'],
            capture_output=True, text=True
        )
        if result.stdout.strip() != '[]':
            subprocess.run([
                'gh', 'project', 'item-edit',
                '--project-id', 'PVT_kwHOBQUjOs4BTRBF',
                '--id', item_id,
                '--field-id', 'PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I',
                '--single-select-option-id', '98236657'
            ])
            print(f'Updated to Done: {title}')
"
```

2. **Add any new Issues created during the release** that are not yet in the project:
```bash
gh project item-add 1 --owner shun2218-dev --url "https://github.com/shun2218-dev/asset-lens/issues/<NUMBER>"
```
