# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.18.0] - 2026-03-30

### Added
- Category management UI in settings page (#43)
  - Create, edit, and delete custom categories
  - Category tab with system vs user category distinction
  - Delete protection for categories with linked transactions
  - Server actions for update and delete operations
  - 8 new unit tests for category CRUD actions

## [2.17.0] - 2026-03-30

### Added
- Keyboard shortcuts for power users (#45)
  - `⌘K` / `Ctrl+K` to open/close quick entry dialog
  - `G → D` navigate to dashboard, `G → T` to transactions, `G → S` to settings
  - `?` to open shortcut help modal
  - Reusable `useKeyboardShortcuts` and `useSequenceShortcuts` hooks
- `KeyboardShortcutProvider` in root layout for global shortcut registration
- Storybook story for `ShortcutHelpDialog`

### Performance
- Composite database indexes for frequently queried columns (#46)
  - `transaction(userId, date)` for monthly filtering
  - `transaction(userId, storeName)` for store ranking
  - `budget(userId, categoryId)` for budget lookups
  - `category(userId)` for per-user category queries

## [2.16.0] - 2026-03-30

### Performance
- Cross-request caching for categories, stores, and budgets with `unstable_cache` (#70)
- Centralized cache tag system with `updateTag`-based invalidation (#70)
- Lazy-load chart components (recharts ~200KB) via `next/dynamic` with Skeleton fallback (#74)
- Lazy-load BulkTransactionForm (deferred until bulk tab selected) (#74)
- Lazy-load QuickEntryDialog (ssr: false, deferred to client) (#74)

## [2.15.0] - 2026-03-30

### Added
- Dark mode support with `next-themes` integration (#29)
- Theme toggle in header: light, dark, and system options
- Sun/moon icon animation on theme switch
- Agent rules (always-on constraints): branching policy, coding conventions, UI design, testing policy
- Agent skills (auto-activated): database management, deployment workflow

## [2.14.0] - 2026-03-30

### Added
- Reusable `EmptyState` component with icon, title, description, and optional CTA (#67)
- Dashboard empty state when no income/expense data exists (#67)
- Transaction list empty state with Receipt icon and friendly message (#67)
- Budget progress empty state with settings link (#67)
- Optimistic UI for transaction deletion: instant removal with rollback on error (#71)
- `useDelayedConfirm` hook: 500ms safety delay on destructive confirm buttons (#72)
- Password strength indicator for sign-up and password change forms (#69)
- CSS micro-animations: fade-in-up entrance, staggered cards, progress bar fill (#66)
- Button hover scale (1.02x) and shadow lift effects (#66)
- Landing page entrance animations for hero and feature cards (#66)
- Confirmation dialog safety delay applied to transaction and account deletion (#72)

### Changed
- All forms use `onBlur` validation mode for real-time inline feedback (#69)
- Store ranking empty message improved to encouraging text (#67)

### Improved
- All animations respect `prefers-reduced-motion` media query (#66)

## [2.13.0] - 2026-03-30

### Added
- Error boundary pages: global-error, route-level error, custom 404 (#73)
- Page-specific loading skeletons for dashboard and transactions (#40)
- Skip-to-content link for keyboard navigation (#64)
- `<main>` landmark element in root layout (#64)
- `aria-label` on header navigation (#64)

### Fixed
- Improve muted-foreground contrast ratio for WCAG AA compliance (#62)
- Add visible focus rings for keyboard-only navigation (#63)
- Remove focus outline for mouse/touch users (#63)

## [2.12.2] - 2026-03-30

### Fixed
- Hero title awkward line break on landing page (#58)
- Auth form submit buttons using secondary variant instead of primary (#59)
- Header showing redundant login button on auth pages (#60)
- Forgot password link placed in wrong position on sign-in form (#61)

### Added
- Footer navigation links (利用規約, プライバシーポリシー, お問い合わせ) (#65)
- Storybook MCP addon for enhanced development tooling

### Changed
- Passkey login button changed to outline variant for clearer visual hierarchy (#59)

### Docs
- Updated Issue closing policy in release workflow

## [2.12.1] - 2026-03-29

### Fixed
- Dashboard crash when previous month summary data is unavailable (`previousSummary` undefined)
- CI Storybook tests failing due to missing Playwright browser installation

## [2.12.0] - 2026-03-29

### Added
- **Budget Management**: Hybrid model with overall monthly budget + optional per-category budgets
- **Budget Progress Widget**: Color-coded progress bars on dashboard (green/yellow/red)
- **Budget Settings**: New 予算 tab in settings for budget CRUD
- **Store Ranking Widget**: Top 5 stores by spending on dashboard
- **Recent Transactions Widget**: Compact 5-item list with "もっと見る" link
- **QuickEntryDialog**: "＋ 記録する" button in header for one-click transaction recording
- **MoM Comparison**: Month-over-month badges on dashboard summary cards
- Storybook stories for 9 previously uncovered components + 4 new widgets
- Unit tests for 5 previously uncovered + 2 budget server actions (190 total tests)
- GitHub Actions CI for automated testing on PRs
- CHANGELOG.md for tracking release history

### Changed
- **Dashboard restructured**: Analytics-focused (removed forms, added widgets)
- **Transaction page**: Now includes form (moved from dashboard) with 1/3 + 2/3 layout
- Optimized git hooks: pre-commit runs lint-staged only, pre-push runs related unit tests only
- Updated feature-development workflow with PR-based merge, Issue linking, and quality checklist

### Fixed
- Stabilized pagination E2E test with isolated test month

## [2.11.0] - 2026-03-29

### Added
- **Subscription Management**: Full CRUD with auto-record via cron jobs
- **Receipt Scanning**: Gemini 2.5 Flash integration for bulk transaction entry
- **Store Name Management**: Store master, StoreSelect component, and migration tool
- **Store Name Migration Tool**: Batch extract store names from transaction descriptions
- Auto-record cron sets `storeName` and fixed description ("サブスク") for subscriptions

### Changed
- Dashboard now shows store names in transaction list
- Transaction form includes store name selection

### Fixed
- Pagination E2E test stability improvements
- Pre-push hook restricted to chromium with workers=1

## [2.10.0] - 2026-03-15

### Added
- Dashboard with monthly summary, trend chart, and category pie chart
- Transaction CRUD with filtering, sorting, and pagination
- Category management (system defaults + user custom)
- CSV data export and import
- User profile management (name, avatar)
- Account deletion with cascading cleanup
- Email/Password and Passkey authentication
- Password reset via email OTP
- Storybook for UI component development
- E2E tests with Playwright
- Unit tests with Vitest
