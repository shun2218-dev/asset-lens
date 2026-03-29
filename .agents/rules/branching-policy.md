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

Before EVERY `git add` or `git commit`, run:

```bash
git branch --show-current
```

If the output is `develop` or `main`, **STOP immediately** and create a branch first.

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
