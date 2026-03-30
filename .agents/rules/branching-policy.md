# Branching Policy

## Protected Branches

`develop` and `main` are **merge-only** branches. Direct commits are **strictly prohibited**.

## Mandatory Branch Workflow

ALL changes — regardless of size or type — MUST follow this flow:

1. Create a dedicated branch from `develop` (`feature/`, `fix/`, `refactor/`, `docs/`, `chore/`)
2. Commit changes on that branch
3. Push and create a PR targeting `develop`
4. Merge via PR (with `--delete-branch`)

**No exceptions**: formatting fixes, biome auto-fixes, config changes, package installs, single-line edits — everything requires a branch.

## Pre-Commit Guard

Before EVERY `git add` or `git commit`, run **both** of these checks:

### 1. Branch Check

```bash
git branch --show-current
```

If the output is `develop` or `main`, **STOP immediately** and create a branch first.

### 2. Staging Review (Mandatory)

Before committing, **always** run:

```bash
git status
```

Then verify **all** of the following:

- **No unintended files**: Are there files that should NOT be in this commit? (e.g., unrelated changes, debug code, temp files)
- **Correct granularity**: Should these changes be split into multiple commits? Each commit should have a single, clear purpose.
- **No `git add -A` without review**: Never blindly `git add -A`. Always review `git status` output first and stage files explicitly.

If changes span multiple concerns (e.g., feature code + workflow rule update + lint fix), split them into separate commits with appropriate prefixes.

## Commit Conventions

- `feat:` new features
- `fix:` bug fixes
- `refactor:` code restructuring
- `chore:` tooling, config, dependencies
- `docs:` documentation
- `style:` formatting (no logic change)

## Flags

- **NEVER** use `--no-verify` — husky hooks must always run
- **NEVER** force-push to `develop` or `main`

## Release Flow (Mandatory)

ALL production releases MUST follow this exact flow. No shortcuts or alternative paths are permitted.

### Merge Direction Rules

| Step | Source | Target | Method |
|------|--------|--------|--------|
| Feature development | `feature/*` | `develop` | PR merge |
| Release preparation | `develop` | `release/vX.Y.Z` | branch creation |
| Production release | `release/vX.Y.Z` | `main` | PR merge |
| Sync back to develop | `release/vX.Y.Z` | `develop` | `--no-ff` merge |

### PROHIBITED Merge Directions

- ❌ `main` → `develop` — **NEVER merge main into develop**
- ❌ `feature/*` → `main` — features must go through develop first
- ❌ `develop` → `main` directly — must use a release branch

### Post-Release Sync

After the release PR is merged into `main`:

1. Tag the release on `main`
2. **Merge `release/vX.Y.Z` into `develop`** (NOT `main` into `develop`)
3. Delete the `release/vX.Y.Z` branch (local and remote)

The release branch contains CHANGELOG updates and version bumps that must flow into `develop`.
