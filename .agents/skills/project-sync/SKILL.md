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

## Bulk Date Assignment (after milestone changes or new Issues)

Use this when multiple Issues are missing Start/Target dates on the project board.

### Strategy
- Dates are derived from the Milestone's period
- Items within the same Milestone are sequenced 4 days apart
- If an item's calculated end exceeds the Milestone due date, it's capped

### Milestone Periods

| Milestone | Start | End |
|-----------|-------|-----|
| v2.21 — Mobile & Accessibility | 2026-04-01 | 2026-04-29 |
| v2.22 — UX Enhancements | 2026-04-30 | 2026-05-14 |
| v2.23 — Quality & Security | 2026-05-15 | 2026-05-30 |
| v2.24 — Data & Analytics | 2026-06-01 | 2026-06-14 |
| v2.25 — Transaction UX | 2026-06-15 | 2026-06-29 |
| v3.0 — Platform Expansion | 2026-06-15 | 2026-06-29 |
| v3.1 — Advanced Platform | 2026-07-01 | 2026-08-30 |

### Bulk Assign Script
```bash
gh project item-list 1 --owner shun2218-dev --format json > /tmp/project_items.json
python3 << 'PYEOF'
import json, subprocess
from datetime import datetime, timedelta

with open('/tmp/project_items.json') as f:
    data = json.load(f)

milestone_dates = {
    'v2.21': ('2026-04-01', '2026-04-29'),
    'v2.22': ('2026-04-30', '2026-05-14'),
    'v2.23': ('2026-05-15', '2026-05-30'),
    'v2.24': ('2026-06-01', '2026-06-14'),
    'v2.25': ('2026-06-15', '2026-06-29'),
    'v3.0':  ('2026-06-15', '2026-06-29'),
    'v3.1':  ('2026-07-01', '2026-08-30'),
}

PROJECT_ID = 'PVT_kwHOBQUjOs4BTRBF'
START_FIELD = 'PVTF_lAHOBQUjOs4BTRBFzhAjo8M'
TARGET_FIELD = 'PVTF_lAHOBQUjOs4BTRBFzhAjo8Q'

# Get issue -> milestone mapping
res = subprocess.run(
    ['gh','issue','list','--state','open','--json','number,title,milestone','--limit','100'],
    capture_output=True, text=True
)
issues = json.loads(res.stdout)
issue_ms = {}
for iss in issues:
    ms = iss.get('milestone',{})
    if ms:
        mt = ms.get('title','')
        for k in milestone_dates:
            if k in mt:
                issue_ms[iss['title']] = k
                break

ms_counters = {}
for item in data.get('items', []):
    s = item.get('status','')
    t = item.get('title','')
    sd = item.get('startDate')
    item_id = item.get('id','')
    if s != 'Done' and not sd and item_id:
        ms_key = issue_ms.get(t)
        if ms_key:
            base_start, base_end = milestone_dates[ms_key]
            if ms_key not in ms_counters:
                ms_counters[ms_key] = 0
            idx = ms_counters[ms_key]
            ms_counters[ms_key] += 1
            start_dt = datetime.strptime(base_start, '%Y-%m-%d') + timedelta(days=idx*4)
            end_dt = start_dt + timedelta(days=3)
            ms_end = datetime.strptime(base_end, '%Y-%m-%d')
            if end_dt > ms_end: end_dt = ms_end
            if start_dt > ms_end: start_dt = ms_end - timedelta(days=3)
            start_str = start_dt.strftime('%Y-%m-%d')
            end_str = end_dt.strftime('%Y-%m-%d')
            subprocess.run(['gh','project','item-edit','--project-id',PROJECT_ID,'--id',item_id,'--field-id',START_FIELD,'--date',start_str], capture_output=True)
            subprocess.run(['gh','project','item-edit','--project-id',PROJECT_ID,'--id',item_id,'--field-id',TARGET_FIELD,'--date',end_str], capture_output=True)
            print(f'Set dates: {start_str} -> {end_str} | {t[:60]}')
print('Done!')
PYEOF
```

---

## PR Metadata (MANDATORY on every PR)

After creating a PR, apply the following:

### Add Labels
Choose from: `feature`, `bug`, `enhancement`, `refactor`, `testing`, `documentation`, `dx`, `ui/ux`, `performance`, `infra`, `seo`, `release`
```bash
gh pr edit <pr-number> --add-label "<label1>,<label2>"
```

### Assign Milestone (same as related Issue)
```bash
gh pr edit <pr-number> --milestone "<MILESTONE_TITLE>"
```

### Add to Project Board
```bash
gh project item-add 1 --owner shun2218-dev --url "https://github.com/shun2218-dev/asset-lens/pull/<pr-number>"
```

> ⚠️ **Do NOT skip any step.** All PRs must have: Labels ✅ Milestone ✅ Project ✅

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

