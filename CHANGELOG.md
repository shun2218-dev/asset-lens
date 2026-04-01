# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.24.0] - 2026-04-01

### Added
- Dynamic sitemap for public pages (`app/sitemap.ts`) (#175)
- Dynamic OG image using Next.js ImageResponse API with Edge Runtime (#175)
- Page-level metadata for landing, login, and profile pages (#175)
- Granular dashboard Suspense boundaries: overview, charts, widgets stream independently (#189)
- Section-specific skeleton components for each dashboard boundary
- `TransactionQueryInput` type for typed query objects

### Changed
- `getTransaction` migrated to `createSafeAction` with input object pattern (#188)
- 4 positional parameters replaced with single `TransactionQueryInput` object
- Dashboard architecture split from monolithic `DashboardContent` into 3 async server components
- Auth handling moved from manual session check to `createSafeAction` wrapper

### Improved
- Time to First Byte for dashboard summary cards (no longer blocked by chart/widget data)
- React request-level deduplication for shared `getSummaryWithComparison` calls

## [2.23.0] - 2026-04-01

### Added
- Landing page redesign: gradient hero, dashboard preview mockup, 3-step how-it-works section, social proof, bottom CTA (#68)
- E2E tests for landing page: hero, features, social proof, how-it-works sections
- Suspense streaming for dashboard and transaction pages with centralized skeleton components (#127)
- Mobile viewport testing: Playwright projects for Pixel 5 and iPhone 13

### Changed
- Analysis actions (`getSummary`, `getSummaryWithComparison`, `getStoreRanking`) migrated to `createSafeAction` pattern (#142)
- Feature cards expanded from 3 to 6 with per-feature color accents
- Self-review skill strengthened: suggestions must be implemented, tracked as Issues, or rejected with rationale

### Fixed
- WCAG 2.5.5 touch target compliance: all interactive elements now meet 44px minimum on mobile (#124)
- Header login button, avatar, form inputs, tabs, auth buttons, bottom nav links all increased to minimum 44px
- Input and TabsList use responsive `h-11 md:h-9` for mobile-first sizing

## [2.22.0] - 2026-04-01

### Added
- Create `/terms` (Terms of Service), `/privacy` (Privacy Policy), `/contact` (Contact) pages (#174)
- E2E tests for footer pages: response status, heading, content sections, navigation

### Changed
- Project board: set Start Date and Target Date for all 21 open items
- Unified project management workflow with `/project-sync` skill

## [2.21.0] - 2026-03-31

### Fixed
- Add `DialogDescription` to all `DialogContent` components — fixes console warning (#173)
- `quick-entry-dialog`, `bottom-nav`, `shortcut-help-dialog` now have proper aria descriptions

### Changed
- ShortcutHelpDialog Storybook: add `Open` story variant showing dialog content visible (#172)
- Add comprehensive component docs with shortcut table and trigger instructions
- `project-sync` skill for automated Project board + Milestone management

## [2.20.1] - 2026-03-31

### Added
- Chromatic visual regression testing integrated with CI (#122)
- `chromatic` npm script for local visual testing
- CI job: `Visual Regression (Chromatic)` with TurboSnap and auto-accept on main
- `@dotenvx/dotenvx` for encrypted env management in CI
- `.env.ci` with encrypted secrets — single `DOTENV_PRIVATE_KEY_CI` replaces 7 individual GitHub Secrets

### Changed
- E2E CI job uses `dotenvx run -f .env.ci --` for env injection
- Playwright config migrated from `dotenv` to `@dotenvx/dotenvx`
- E2E tests marked `continue-on-error: true` until auth fixture CI setup (#171)

## [2.20.0] - 2026-03-31

### Added
- Strict Storybook a11y enforcement: test mode upgraded from `todo` to `error` (#121)
- Playwright E2E accessibility tests with `@axe-core/playwright` for 5 key pages (#121)
- Storybook interaction tests with `play` functions for 8 component stories (16 new tests) (#123)
- Component-level documentation descriptions for all 40 Storybook stories (#125)
- Vitest coverage reporting with `@vitest/coverage-v8` and CI integration (#107)
- `test:coverage` npm script for coverage report generation (#107)
- E2E tests for budget CRUD operations and quick entry dialog (#44)
- Coverage report upload as CI artifact (#107)

### Changed
- Button-based pagination (replaces shadcn Pagination) for a11y compliance (#121)
- Tab trigger colors: red-500→red-700, blue-500→blue-700 for WCAG AA contrast (#121)
- EmptyState heading: h3→h2 for correct heading hierarchy (#121)
- SettingsView headings: h3→h2, h4→h3 for correct heading hierarchy (#121)
- Destructive color variable darkened (lightness 0.577→0.535) for contrast (#121)
- Text colors upgraded: emerald-600→700, red-500→600, green-500→700 (#121)

### Fixed
- button-name a11y violations: added aria-labels to 12 icon-only buttons (#121)
- color-contrast violations across transaction forms and status text (#121)
- heading-order violations in EmptyState and SettingsView (#121)
- empty-table-header violation in transaction list (#121)
- list violation from div inside ul in pagination (#121)

## [2.19.0] - 2026-03-30

### Added
- Mobile bottom navigation bar with 4 nav items + center FAB for quick transaction entry (#106)
- Comprehensive SEO metadata: title templates, Open Graph, Twitter cards, keywords (#112)
- Page-specific metadata for Dashboard, Transaction, and Settings pages (#112)
- PWA manifest (`manifest.json`) with app identity and theme color (#112)
- `robots.txt` to allow public pages and block authenticated routes (#112)
- GitHub PR template with standardized sections and checklists (#110)

### Changed
- Dashboard summary cards stack vertically on mobile (`grid-cols-1 sm:grid-cols-3`) (#106)
- Settings tabs horizontally scrollable on narrow screens (#106)
- Footer hidden on mobile (replaced by bottom navigation) (#106)
- Font sizes scale down on small screens for better readability (#106)
- lint-staged now auto-runs related unit tests via `vitest related --run` (#110)

### Fixed
- Removed unused imports (`Session`, `Tag`) from settings-view (#106)

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
