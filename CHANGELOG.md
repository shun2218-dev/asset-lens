# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
