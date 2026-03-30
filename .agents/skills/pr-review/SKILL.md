---
name: pr-architect
description: Create a PR from Git change history, perform senior engineer self-review, fix findings, and merge autonomously. Use when creating PRs or when the user says "/pr".
---

# PR Architect & Reviewer Skill

You are a **Senior Software Engineer** with excellent documentation skills and uncompromising code quality standards.
When the user requests PR creation, follow these steps to autonomously create a PR, self-review, fix issues, and merge.

**This is a fully autonomous flow** — no human approval is required between steps.

## Procedure

### 1. Context Collection

Analyze changes using git commands:

```bash
git log --oneline develop..HEAD
git diff develop --stat
git diff develop
```

If a related Issue exists, fetch it:

```bash
gh issue view <issue-number>
```

### 2. Pre-Flight Quality Checks

Before creating the PR, verify the quality gate (per `testing-policy.md`):

- Run `npx vitest run` — all unit tests must pass
- Run `npx tsc --noEmit` — TypeScript must compile cleanly
- Confirm Storybook stories exist for new/modified UI components
- Confirm E2E tests pass for user-facing features (if applicable)

If any check fails, **fix the issues first**, then re-run checks before proceeding.

### 3. PR Draft Creation

Use `resources/pr_template.md` as the base format to draft the PR title and body.

**Title format**: `<type>: <concise description> (#<issue-number>)`
- Example: `feat: add spending heatmap calendar widget (#111)`

**Key rules**:
- All content MUST be in **English** (per project Language Policy)
- Include `Relates to #<issue-number>` in the body (NOT `Closes` — that belongs in the release PR)
- Be specific about what changed and why
- List focus areas for reviewers

### 4. PR Creation

Create the PR (no user confirmation needed):

```bash
git push origin <branch-name>
gh pr create --base develop --head <branch-name> --title "<title>" --body "<body>"
```

**IMPORTANT**: Capture the **PR number** from the command output (e.g., `https://github.com/.../pull/42` → PR #42).

### 5. Automated Self-Review

After creating the PR, perform a self-review against the diff:

- **Diff source**: Use `git diff develop` to analyze all changes
- **Review criteria**: Follow `resources/senior_review_guide.md` strictly
- **Tone**: Strict but constructive senior engineer perspective
- **Action**: Post the review as a comment on the PR:

```bash
gh pr comment <PR-number> --body "<review content>"
```

### 6. Fix Review Findings

After completing the self-review, **act on the findings**:

- **⚠️ Must Fix items**: Implement the fix immediately. Commit, push, and update the PR.
- **💡 Suggestions**: Evaluate each one. If the improvement is low-risk and clearly beneficial, implement it. If it requires significant refactoring or is out of scope, note it as a follow-up and skip.
- **📝 Questions**: Answer them yourself based on the codebase context. Document the rationale in a follow-up comment if needed.
- **👍 Praise items**: No action needed.

After fixes, re-run quality checks:

```bash
npx vitest run
npx tsc --noEmit
```

If fixes were made, commit and push:

```bash
git add <fixed-files>
git commit -m "fix: address self-review findings"
git push origin <branch-name>
```

### 7. Merge PR

Once all Must Fix items are resolved and quality checks pass, merge the PR:

```bash
gh pr merge <PR-number> --merge --delete-branch
```

Then clean up locally:

```bash
git checkout develop
git pull origin develop
git branch -d <branch-name>
```

## Decision Framework for Review Findings

| Severity | Action | Example |
|----------|--------|---------|
| ⚠️ Must Fix | Always fix before merge | Security flaw, missing error handling, broken logic |
| 💡 Suggestion | Fix if low-risk, skip if out of scope | Performance optimization, naming improvement |
| 📝 Question | Self-answer and document | Design rationale, magic number explanation |
| 👍 Praise | No action | Good pattern recognition |

## Constraints

- Review comments must NOT be shallow "LGTM" — include specific code improvement points and risk analysis.
- Even if no issues are found, mention:
  - **Design intent confirmation**: "This approach was chosen because..."
  - **Scalability considerations**: "If data volume increases, consider..."
  - **Follow-up suggestions**: "In future iterations, we could..."
- Follow `examples/review_comment.md` for formatting and depth.
- **NEVER** use `--no-verify` during fix commits — husky hooks must always run.
- All commits during the fix phase follow the same conventions as normal development.
