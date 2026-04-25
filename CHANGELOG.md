# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.32.0] - 2026-04-26

### Added

- **Spending Forecast Widget** — Project end-of-month spending based on daily rate with color-coded status (on_track / warning / over_budget). Compares against budget or 3-month historical average. (#136)
- **Annual Report Page** — `/report` page with year navigation, annual summary cards (income, expense, balance), monthly breakdown table, category ranking, savings rate, and year-over-year comparison. (#32)
- **Recurring Pattern Detection** — Automatically detect transactions that repeat monthly (same store, category, amount ±10%, 3+ months) and display as dashboard widget suggesting subscription registration. (#30)
- **Transaction Tags** — `tag` and `transaction_tag` tables with CRUD server actions for custom tagging (e.g., "vacation", "business trip"). Many-to-many relation with transactions. Migration `0017_breezy_gauntlet.sql`. (#37)
- **DB Schema Validation Tests** — 267+ tests comparing `schema.ts` against migration snapshots to catch drift. Validates table/column existence, notNull, primaryKey, and index counts for all tables. (#160)

### Infrastructure

- Test count: 434 → 743 (+309 tests)
- New migration: `0017_breezy_gauntlet.sql` (tag + transaction_tag tables)

## [2.31.0] - 2026-04-26

### Added
- Dashboard empty state fallback: auto-navigate to latest month with data when current month is empty (#217)
- CSV/PDF export for monthly financial reports with download dialog (#129)
- Budget threshold alerts: banner warnings and toast notifications when spending exceeds limits (#148)
- Transaction bulk actions: multi-select with bulk delete and category change (#47)
- Category icon and color customization schema with default icon/color assignments (#143)
- Store management CRUD: edit and delete stores from settings page
- Transaction search enhancement: category name search with match highlighting (#134)
- Financial calendar view: monthly grid with daily income/expense totals and day-click filtering (#153)
- `getMonthlyDailySummary` server action for daily transaction aggregation
- `FinancialCalendar` component with month navigation and selected-date state
- `TransactionList` forwardRef + `useImperativeHandle` for programmatic date filtering
- `HighlightMatch` component for search keyword highlighting
- Mandatory test impact analysis rule for development workflow
- Unit tests: `getMonthlyDailySummary` (5 tests), `search-highlight` (7 tests)
- Storybook stories: `StoreManager`, `TransactionItem.WithSearchHighlight`, `FallbackBanner`

### Fixed
- Settings page mobile overflow on data management and subscription tabs
- E2E transaction search selectors updated for new placeholder text
- WCAG color contrast: green-700, red-700, blue-700 for small text elements
- Dependabot updates: react-hook-form, dotenv, biome, lint-staged

### Changed
- Search input placeholder updated to include category support
- `minisearch` client-side dependency removed in favor of server-side search
- Test count increased from 426 to 434

## [2.30.0] - 2026-04-25

### Added
- Dashboard analysis widgets: expense heatmap, category trends chart, budget ring (#245)
- Onboarding tour for first-time users with step-by-step dashboard walkthrough (#49)
- Replay tour button in settings page for revisiting the onboarding experience
- Splash screen with AssetLens branding on initial app load
- View Transition API integration for smooth theme switching animations
- PWA manifest with app icons for home screen installation (#245)
- Pull-to-refresh gesture support for mobile dashboard
- Swipe navigation between monthly dashboard views
- Storybook stories for all new widgets: BudgetRing, ExpenseHeatmap, CategoryTrends, OnboardingTour

### Fixed
- Stabilized all 170 E2E tests across 5 browsers (chromium, firefox, webkit, Mobile Chrome, Mobile Safari)
- Replace `clear()+fill()` with `click()+fill()` for number inputs to fix React Hook Form onChange on mobile
- Add `toBeEnabled()` polling before all form submit clicks to prevent async validation race conditions
- Replace all `waitForTimeout()` with polling assertions for search debounce synchronization
- Add Enter key fallback for Radix Tabs on webkit/Mobile Safari where click-only focuses without selecting
- Use `evaluate` click for account deletion on webkit to bypass scroll+click geometry issues
- Scope DB verification queries by `userId` to prevent cross-test data contamination
- Set Playwright trace to `retain-on-failure` for faster execution while preserving debug capability

## [2.29.0] - 2026-04-03

### Added
- Contact inquiry management dashboard with admin-only access (#241)
- `contact_inquiry` database table for persistent storage of contact form submissions
- Admin guard using `ADMIN_EMAILS` environment variable for access control
- Server actions: paginated inquiry list, detail view, status update with admin notes
- Admin UI: filterable table, status badges (new/in_progress/resolved/closed), detail sidebar
- Navigation: admin link in user dropdown menu
- Dual-write contact form: DB insert (primary) + email notification (non-fatal fallback)

### Fixed
- Stabilized all 31 E2E tests after dashboard/transaction UI restructuring (#240)
- Transaction tests: updated navigation from `/dashboard` to `/transaction`
- Budget tests: full rewrite for new BudgetSettings component
- Landing page tests: fixed strict mode violations with `.first()` selectors
- Accessibility tests: disabled Radix UI `aria-valid-attr-value` false positive
- Search tests: added `networkidle` + explicit `waitFor` for serial execution reliability
- Quick Entry test: switched from `Meta+n` shortcut to header button click

## [2.28.0] - 2026-04-02

### Added
- Transaction search with server-side partial matching (ILIKE) and 300ms debounce (#234)
- Search query synchronization with URL `?q=` parameter for persistence and shareability
- Transaction duplicate detection: same amount + 24h window + Levenshtein distance ≤ 2 (#147)
- Duplicate merge (keep left/right) and dismiss functionality with `dismissed_duplicate` table
- Transaction templates with CRUD operations and quick-add from saved templates (#132)
- Auto-suggest categories and store names in transaction form (#109)
- E2E tests for transaction search (5 tests: basic search, date+search combo, empty state, URL persistence, store name search)

### Changed
- Proxy convention: migrated from middleware.ts to proxy.ts (#227)

### Fixed
- Transaction search + date filter combination now works correctly — `router.replace` was replaced with `window.history.replaceState` to prevent server component re-render from overwriting client-side filtered data (#234)
- Initial page load with `?q=` parameter now correctly filters server-rendered transaction list

### Security
- Honeypot trap: malicious vulnerability scanner requests (WordPress, phpMyAdmin, .env, .php, etc.) are redirected to YouTube Rickroll 🎣
- 3-layer detection: exact paths, path prefixes (wildcard), and file extensions (.php, .asp, .aspx, .jsp, .cgi)
- 71 unit tests covering all patterns with false positive safety verified for all legitimate app paths

## [2.27.0] - 2026-04-02

### Added
- Structured JSON logging with pino and per-request correlation IDs (#158)
- AsyncLocalStorage-based context propagation for Server Actions (#158)
- Sentry error tracking and performance monitoring integration (#133)
- Rate limiting for Server Actions via @upstash/ratelimit (#130)
- Rate limit tiers: write (30/min), read (60/min), ai (10/min), contact (5/min)
- 9 new unit tests (logger, rate-limit)

### Changed
- Server Action errors now reported to Sentry with action name and duration context
- All Server Actions automatically log execution time, errors, and correlation ID
- Sentry environment variables use `ASSET_LENS_` prefix for Vercel integration
- E2E auth fixture updated for CI compatibility (#171)

### Fixed
- reCAPTCHA v3 badge hidden on all pages with required Google attribution text added
- Removed deprecated Sentry options (disableLogger, automaticVercelMonitors)

### Security
- Redis-backed sliding window rate limiting on all Server Actions
- Fail-open behavior when Redis is unreachable (graceful degradation)
- IP-based rate limiting for unauthenticated contact form
- CSP updated for Sentry ingest endpoint

## [2.26.0] - 2026-04-01

### Added
- Contact form with Resend email integration and Zod validation (#216)
- Google reCAPTCHA v3 bot protection for contact form (#215)
- Geo-blocking middleware with country whitelist via `ALLOWED_COUNTRIES` env (#214)
- Savings rate trend line overlay on income/expense chart (#139)
- Textarea UI component (shadcn pattern)
- reCAPTCHA v3 global type declarations
- Dashboard empty state improvement issue tracked (#217)

### Changed
- FAQ: fixed incorrect Chinese character (开→開), updated CSV export status
- FAQ: added new entries (pricing, data storage)
- CSP: added Google reCAPTCHA domains to script-src, connect-src, frame-src
- Feature development workflow: mandatory test rules for all changes

### Security
- Contact form: server-side XSS sanitization on all user inputs
- reCAPTCHA v3 score-based bot filtering (threshold: 0.5)
- Geo-blocking: public pages open, authenticated routes restricted by country

## [2.25.0] - 2026-04-01

### Added
- Dependabot configuration for automated npm and GitHub Actions dependency updates (#151)
- Content Security Policy and security headers via `next.config.ts` (#149)
- Custom Drizzle query `PerformanceLogger` with slow query detection (>500ms) (#146)

### Security
- Strict CSP: allowlist for Vercel, Google Fonts, blob storage
- HTTP Strict Transport Security (HSTS) with 2-year max-age
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- Permissions-Policy: camera, microphone, geolocation disabled

### Changed
- Confirmed existing `unstable_cache` + `updateTag` implementation covers API response caching (#144)
- Dependabot groups: next-ecosystem, ui-components, testing, linting, drizzle

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
