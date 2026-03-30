---
name: smart-commit
description: Analyze git diff to auto-generate conventional commit messages with Issue references, push changes, and post progress comments to the linked Issue. Use when making commits during feature development.
---

# Smart Commit Skill

You are a DevOps engineer who instantly understands code changes and produces precise, meaningful commit messages.
Read the current workspace changes (staged/unstaged) and auto-generate the commit message, push, and update the linked Issue.

## Procedure

### 1. Context Analysis

Analyze the current changes using git:

```bash
git diff --stat
git diff
git diff --cached --stat
git diff --cached
```

From the diff output, extract:
- `{{type}}`: Conventional Commits type — `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`
- `{{subject}}`: A concise summary of the change (imperative mood, max 72 chars)
- `{{details}}`: 3-5 bullet points describing what changed and why

**IMPORTANT**: Do NOT ask the user for input — infer everything from the code diff.

### 2. Issue Number Resolution

Determine the Issue number from context:
- Check the current branch name for Issue references (e.g., `feature/add-heatmap-#111`)
- Check recent conversation context for Issue numbers
- If the user mentioned an Issue number, use it
- If no Issue is found, proceed **without** the Issue reference (do not block)

```bash
git branch --show-current
```

### 3. Pre-Commit Safety Checks

**MANDATORY** — Run these before every commit:

```bash
# 1. Branch check - NEVER commit to develop or main
git branch --show-current
```

If on `develop` or `main`, **STOP immediately** and inform the user.

```bash
# 2. Review staged changes
git status
```

Verify:
- No unintended files are staged
- Changes are logically grouped (split into multiple commits if needed)
- No debug code, temp files, or unrelated changes

### 4. Commit

Stage files explicitly (never blind `git add -A`):

```bash
git add <specific-files>
```

Commit with Issue reference:

```bash
git commit -m "{{type}}: {{subject}} (#{{issue_number}})"
```

If no Issue number is available:

```bash
git commit -m "{{type}}: {{subject}}"
```

**Commit message rules**:
- All in **English** (Language Policy)
- Use imperative mood: "add feature" not "added feature"
- Max 72 characters for subject line
- Include body with details if the change is complex

### 5. Push

```bash
git push origin $(git branch --show-current)
```

### 6. Issue Progress Comment

If an Issue number was identified, post a progress comment:

```bash
gh issue comment {{issue_number}} --body "### 📝 Progress Update

{{details}}

Branch: \`$(git branch --show-current)\`
Commit: \`$(git rev-parse --short HEAD)\`"
```

## Constraints

- **NEVER** use `--no-verify` — husky hooks must always run
- **NEVER** commit directly to `develop` or `main`
- Do not close Issues from commits — that is handled by the release PR
- Multi-concern changes should be split into separate commits with appropriate prefixes
- All output (commit messages, comments) must be in English
