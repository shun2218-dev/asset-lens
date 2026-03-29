---
name: database-management
description: Drizzle ORM schema changes, migration generation, and Neon database branch operations. Use when modifying database tables, columns, indexes, or managing database branches.
---

# Database Management Skill

## Schema Definition

- Schema file: `db/schema.ts`
- ORM: Drizzle ORM with PostgreSQL dialect
- Database: Neon Serverless Postgres
- Connection: `db/index.ts` using `@neondatabase/serverless`

## Schema Change Workflow

1. **Edit schema** in `db/schema.ts`
2. **Generate migration**:
   ```bash
   npx drizzle-kit generate
   ```
3. **Review** the generated SQL in `drizzle/` directory
4. **Apply migration**:
   ```bash
   npx drizzle-kit migrate
   ```
5. **Verify** with Drizzle Studio:
   ```bash
   npx drizzle-kit studio
   ```

## Neon MCP Operations

Use the `neon-mcp` MCP server for database operations:

- `mcp_neon-mcp_list_projects` — Find project ID
- `mcp_neon-mcp_create_branch` — Create a test branch before risky migrations
- `mcp_neon-mcp_run_sql` — Execute SQL directly
- `mcp_neon-mcp_describe_table_schema` — Inspect table structure
- `mcp_neon-mcp_compare_database_schema` — Diff branches before merging

## Safety Rules

- Always create a Neon branch before destructive schema changes (DROP TABLE, DROP COLUMN)
- Test migrations on a branch before applying to main
- Never run raw SQL DELETE/DROP on the main branch without confirmation
- Config: `drizzle.config.ts` reads `POSTGRES_URL` from `.env.local`
