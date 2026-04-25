# Testing Policy

## Test Stack

| Tool | Purpose | Location |
|------|---------|----------|
| Vitest | Unit tests for server actions and utilities | `**/*.test.ts` |
| Storybook | Component visual testing and documentation | `**/*.stories.tsx` |
| Playwright | E2E integration tests | `e2e/**/*.spec.ts` |

## Test Requirements

### Server Actions (`app/actions/`)

- Every server action MUST have a corresponding `.test.ts` file
- Mock `db` from `@/db` — never hit a real database
- Test: success, validation failure, and error cases

### UI Components (`components/features/`)

- Every new/modified component MUST have a Storybook story
- Stories go alongside the component file
- Cover: default, loading, empty, error states

### E2E Tests (`e2e/`)

- Cover critical user flows
- Playwright Chromium only (`--project=chromium --workers=1`)

## Automatic Checks (Husky)

- **pre-commit**: `lint-staged` (Biome on staged files)
- **pre-push**: `vitest --changed` (related tests only)

## Manual Checks (Before PR)

```bash
npx vitest run
npx playwright test --project=chromium --workers=1
```

## Quality Gate

- ALL tests must pass before creating a PR
- Zero test failures required for merge

## Test Impact Check (MANDATORY)

コンポーネントや Server Action を **新規作成・編集** した場合、コミット前に以下の影響チェックを **必ず** 行うこと。

### チェックリスト

1. **ユニットテスト (`*.test.ts` / `*.test.tsx`)**
   - 対象ファイルに対応するテストが存在するか確認
   - Props / 引数の型変更がテストに反映されているか
   - 新しいロジック分岐にテストケースが追加されているか

2. **Storybook (`*.stories.tsx`)**
   - 対象コンポーネントの Story が存在するか確認
   - Props の追加・変更が Story の `args` に反映されているか
   - プレースホルダーテキスト等の変更が play function 内の `getByPlaceholderText` / `getByText` と整合しているか

3. **E2E テスト (`e2e/*.spec.ts`)**
   - 変更が E2E フローに影響するか確認（UI テキスト変更、フォーム構造変更、ページ遷移変更など）
   - セレクタ (`data-testid`, `aria-label`, `placeholder` 等) の変更が E2E テストと整合しているか

### 確認手順

```bash
# 1. 変更ファイルに関連するテストを検索
grep -r "変更したコンポーネント名" --include="*.test.*" --include="*.stories.*" --include="*.spec.*"

# 2. 全テスト実行で既存テストの破損を検知
npx vitest run

# 3. E2E に影響がある場合
npx playwright test --project=chromium --workers=1
```

> **注意**: テキスト変更（placeholder, ボタンラベル等）は Storybook の play function や E2E テストでハードコードされていることが多い。文言変更時は特に注意すること。
