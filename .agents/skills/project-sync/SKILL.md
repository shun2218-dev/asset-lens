---
name: project-sync
description: Sync GitHub Project board status when Issues are created, closed, or change state. Invoke with "/project-sync".
---

# GitHub Project Sync

> **This skill handles the operational commands for project board management.**
> For milestone planning strategy, triage criteria, and relationship rules, see `/milestone` skill.

## Quick Reference IDs

| Resource | ID |
|----------|-----|
| Project ID | `PVT_kwHOBQUjOs4BTRBF` |
| Project Number | `1` |
| Owner | `shun2218-dev` |
| Status Field | `PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I` |
| Start Date Field | `PVTF_lAHOBQUjOs4BTRBFzhAjo8M` |
| Target Date Field | `PVTF_lAHOBQUjOs4BTRBFzhAjo8Q` |

### Status Options

| Status | Option ID |
|--------|-----------|
| Todo | `f75ad846` |
| In Progress | `47fc9ee4` |
| Done | `98236657` |

---

## New Issue Checklist (MANDATORY)

When creating ANY Issue, complete ALL of the following:

### Step 1: Add to Project Board
```bash
gh project item-add 1 --owner shun2218-dev --url "https://github.com/shun2218-dev/asset-lens/issues/<NUMBER>"
```

### Step 2: Assign Milestone
Refer to the milestone decision guide below, then:
```bash
gh issue edit <NUMBER> --milestone "<MILESTONE_TITLE>"
```

### Step 3: Set Relationships (if applicable)

Check if this Issue:
- **Depends on** an existing Issue → set as sub-issue
- **Will be depended on** by future Issues → note in Issue body

```bash
# Get node IDs
PARENT_ID=$(gh api graphql -f query='{ repository(owner:"shun2218-dev", name:"asset-lens") { issue(number:<PARENT_NUM>) { id } } }' --jq '.data.repository.issue.id')
CHILD_ID=$(gh api graphql -f query='{ repository(owner:"shun2218-dev", name:"asset-lens") { issue(number:<CHILD_NUM>) { id } } }' --jq '.data.repository.issue.id')

# Add sub-issue relationship
gh api graphql -f query="mutation { addSubIssue(input: { issueId: \"$PARENT_ID\", subIssueId: \"$CHILD_ID\" }) { issue { title } subIssue { title } } }"
```

### Step 4: Set Dates on Project Board

```bash
# Get item ID
ITEM_ID=$(gh project item-list 1 --owner shun2218-dev --format json --jq ".items[] | select(.content.number == <NUM>) | .id" --limit 60)

# Set start and target dates
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTF_lAHOBQUjOs4BTRBFzhAjo8M --date "<START_DATE>"
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTF_lAHOBQUjOs4BTRBFzhAjo8Q --date "<TARGET_DATE>"
```

---

## Status Updates

### Set "In Progress" (when starting work)
```bash
ITEM_ID=$(gh project item-list 1 --owner shun2218-dev --format json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data.get('items', []):
    if '<ISSUE_TITLE_SUBSTRING>' in item.get('title', ''):
        print(item['id'])
        break
")
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I --single-select-option-id 47fc9ee4
```

### Set "Done" (when closing an Issue)
```bash
gh project item-edit --project-id PVT_kwHOBQUjOs4BTRBF --id "$ITEM_ID" --field-id PVTSSF_lAHOBQUjOs4BTRBFzhAjo2I --single-select-option-id 98236657
```

### Bulk Sync (after a release)
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

---

## Milestone Decision Guide

| Milestone | Focus Area | Issue Types |
|-----------|-----------|-------------|
| `v2.21 — Mobile & Accessibility` | Mobile UX, a11y, Storybook | Responsive fixes, a11y bugs, Storybook |
| `v2.22 — UX Enhancements` | UI polish, SEO, public pages | Footer, SEO/OGP, design, UX |
| `v2.23 — Quality & Security` | Testing, security, CI/CD | E2E, rate limiting, CSP, Sentry |
| `v2.24 — Data & Analytics` | Analytics, data features | Charts, reports, CSV, insights |
| `v2.25 — Transaction UX` | Transaction workflow | Search, bulk, templates, split |
| `v3.0 — Platform Expansion` | Major features | i18n, multi-currency, social login |
| `v3.1 — Advanced Platform` | Advanced features | Voice, AI, shared expenses |
