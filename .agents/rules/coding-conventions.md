# Coding Conventions

## TypeScript

- **Strict mode enabled** (`strict: true` in tsconfig)
- Always use explicit types for function parameters and return values
- Prefer `type` over `interface` for object shapes (project convention)
- Use `@/` path alias for all imports (configured in tsconfig)
- Never use `any` — use `unknown` and narrow with type guards
- Use `import type { ... }` for type-only imports

## Next.js (App Router)

### Server vs Client Components

- **Default to Server Components** — only add `"use client"` when needed
- Use `"use client"` only for: event handlers, hooks (useState, useEffect, etc.), browser APIs
- Server Actions go in `app/actions/<domain>/<action>.ts`
- Data fetching belongs in Server Components, not Client Components

### File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route page (Server Component) |
| `loading.tsx` | Suspense loading UI |
| `error.tsx` | Error boundary (`"use client"`) |
| `layout.tsx` | Shared layout |

### Route Groups

- `(main)` for authenticated routes
- `(auth)` for login/signup routes

## Biome

- Biome is the **sole** linter/formatter (no ESLint/Prettier)
- Config: `biome.json` at project root
- Auto-fix: `npx biome check --write .`
- Verify: `npx biome check . --diagnostic-level=error`
- Import organization is handled by Biome — do not manually sort

## Code Style

- Prefer named exports over default exports (except for pages)
- One component per file
- File naming: kebab-case (`my-component.tsx`), PascalCase for components (`MyComponent`)
- No AI-style verbose comments — only comment non-obvious logic

## Language

- Issues, PRs, commits, CHANGELOG: **English**
- UI text: **Japanese**
- Code comments: **English** (brief, human-style)
