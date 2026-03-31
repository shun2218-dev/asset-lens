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

## Integration Points

This skill MUST be invoked at these points in the workflow:

### Feature Development Workflow (`/feature-development`)
1. **Step 1 (Create Issue)**: Add issue to project with `Todo` status
2. **Step 3 (Create Feature Branch)**: Set status to `In Progress`

### Release Workflow (`/release`)
1. **Step 8 (Verify Issues Closed)**: Bulk update all closed Issues to `Done` status in the project

### Issue Creation (any context)
- Always add newly created Issues to the project
- Set initial status to `Todo`
