---
name: deployment-workflow
description: Vercel deployment monitoring, GitHub PR/Issue automation, and CI/CD troubleshooting. Use when deploying, checking build logs, managing PRs, or resolving deployment errors.
---

# Deployment Workflow Skill

## Vercel Deployment

### MCP Tools

- `mcp_vercel-mcp_deploy_to_vercel` — Trigger deployment
- `mcp_vercel-mcp_list_deployments` — List recent deployments
- `mcp_vercel-mcp_get_deployment` — Get deployment details
- `mcp_vercel-mcp_get_deployment_build_logs` — Read build logs for debugging
- `mcp_vercel-mcp_get_runtime_logs` — Check runtime errors in production
- `mcp_vercel-mcp_search_vercel_documentation` — Search Vercel docs

### Debugging Failed Deployments

1. Get deployment ID: `mcp_vercel-mcp_list_deployments`
2. Read build logs: `mcp_vercel-mcp_get_deployment_build_logs`
3. Identify error and fix in codebase
4. Push fix and redeploy

### Environment

- Team/Org ID: Check `.vercel/project.json` or use `mcp_vercel-mcp_list_teams`
- Project ID: Check `.vercel/project.json` or use `mcp_vercel-mcp_list_projects`

## GitHub Automation

### MCP Tools

- `mcp_github-mcp-server_create_issue` — Create issues
- `mcp_github-mcp-server_create_pull_request` — Create PRs
- `mcp_github-mcp-server_merge_pull_request` — Merge PRs
- `mcp_github-mcp-server_get_pull_request_files` — Review PR changes
- `mcp_github-mcp-server_list_issues` — List open issues

### PR Workflow

1. Feature PRs target `develop` with `Relates to #<issue>`
2. Release PRs target `main` with `Closes #<issue>` for each resolved issue
3. Always use `--merge --delete-branch` when merging

### Issue Management

- Every task starts with a GitHub Issue
- Use `gh issue close` only after merge to `main` (via release PR)
- Owner/Repo: `shun2218-dev/asset-lens`
