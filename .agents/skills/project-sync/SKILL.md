---
name: project-sync
description: Sync GitHub Project board status when Issues are created, closed, or change state. Invoke with "/project-sync".
---

# GitHub Project Sync

Keeps the **AssetLens Roadmap** project board in sync with Issue lifecycle events.

## Project Details

| Field | Value |
|-------|-------|
| Project Title | AssetLens Roadmap |
| Project Number | `1` |
| Owner | `shun2218-dev` |
| Project ID | `PVT_kwHOBQUjOs4BTRBF` |

### Status Field

| Status | Option ID | When to use |
|--------|-----------|-------------|
| Todo | `f75ad846` | Issue created, not yet started |
| In Progress | `47fc9ee4` | Work actively in progress |
| Done | `98236657` | Issue closed/completed |

### Field IDs

| Field | ID |
|-------|-----|
| Status | `PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I` |

---

## Operations

### 1. Add Issue to Project

Run when creating a new Issue:

```bash
gh project item-add 1 --owner shun2218-dev --url "https://github.com/shun2218-dev/asset-lens/issues/<NUMBER>"
```

### 2. Set Status to "In Progress"

Run when starting work on an Issue (e.g., creating a feature branch):

```bash
# First, find the item ID
ITEM_ID=$(gh project item-list 1 --owner shun2218-dev --format json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data.get('items', []):
    if '<ISSUE_TITLE_SUBSTRING>' in item.get('title', ''):
        print(item['id'])
        break
")

# Then update status
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I --single-select-option-id 47fc9ee4
```

### 3. Set Status to "Done"

Run when closing an Issue:

```bash
ITEM_ID=$(gh project item-list 1 --owner shun2218-dev --format json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data.get('items', []):
    if '<ISSUE_TITLE_SUBSTRING>' in item.get('title', ''):
        print(item['id'])
        break
")

gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I --single-select-option-id 98236657
```

### 4. Bulk Update Closed Issues to "Done"

Useful after a release to catch any missed status updates:

```bash
gh project item-list 1 --owner shun2218-dev --format json | python3 -c "
import json, sys, subprocess
data = json.load(sys.stdin)
for item in data.get('items', []):
    status = item.get('status', '')
    if status == 'In Progress':
        item_id = item['id']
        title = item['title']
        # Check if the corresponding issue is closed
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

---

## Milestone Assignment

Every Issue MUST be assigned to a milestone when created. Use the following guide:

### Active Milestones

| Milestone | Focus Area | Issue Types |
|-----------|-----------|-------------|
| `v2.21 — Mobile & Accessibility` | Mobile UX, a11y, Storybook docs | Responsive fixes, accessibility bugs, Storybook improvements |
| `v2.22 — UX Enhancements` | UI polish, SEO, public pages | Footer pages, SEO/OGP, UI design, user-facing enhancements |
| `v2.23 — Quality & Security` | Testing, security, CI/CD | E2E fixes, rate limiting, CSP headers, error tracking |
| `v2.24 — Data & Analytics` | Analytics, data features | Charts, reports, CSV export, spending insights |
| `v2.25 — Transaction UX` | Transaction workflow | Search, bulk actions, templates, split expenses |
| `v3.0 — Platform Expansion` | Major features | i18n, multi-currency, social login, PWA |
| `v3.1 — Advanced Platform` | Advanced features | Voice input, AI insights, shared expenses |

### Assign Milestone

```bash
gh issue edit <NUMBER> --milestone "<MILESTONE_TITLE>"
```

### Decision Guide

1. **Bug fix** → assign to the milestone whose focus area matches the bug's domain
2. **New feature** → assign based on feature category (see table above)
3. **Chore/refactor** → `v2.23 — Quality & Security` (testing/CI) or the milestone matching the affected area
4. **Documentation** → `v2.21 — Mobile & Accessibility` (Storybook) or `v2.22 — UX Enhancements` (user-facing docs)

---

## Integration Points

This skill MUST be invoked at these points in the workflow:

### Feature Development Workflow (`/feature-development`)
1. **Step 1 (Create Issue)**: Add issue to project with `Todo` status AND assign milestone
2. **Step 3 (Create Feature Branch)**: Set status to `In Progress`

### Release Workflow (`/release`)
1. **Step 8 (Verify Issues Closed)**: Bulk update all closed Issues to `Done` status in the project

### Issue Creation (any context)
- Always add newly created Issues to the project
- Always assign a milestone based on the decision guide
- Set initial status to `Todo`

