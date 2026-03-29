# AssetLens

AssetLens is a modern personal finance management application designed to help you track your income, expenses, and subscriptions with ease. It leverages AI for receipt scanning and provides a comprehensive dashboard for financial insights.

## 🚀 Features

### Dashboard
- Monthly summary cards (income, expenses, balance)
- Monthly trend bar chart (income vs expenses)
- Category breakdown pie chart (expense distribution)
- Recent transaction history

### Transaction Management
- Manual entry for income and expenses
- **AI Receipt Scanning**: Upload receipt images to automatically extract store name, items, and amounts using Google Gemini 2.5 Flash
- **Bulk Entry**: Add multiple transactions at once from scanned receipt data
- Full transaction list with filtering, sorting, and pagination
- Edit and delete transactions

### Store Name Management
- Store/service name master registration
- Store selection with search and inline creation
- **Store Name Migration Tool**: Batch extract store names from existing transaction descriptions

### Subscription Management
- Track recurring payments (monthly/yearly)
- Create, edit, and delete subscriptions
- **Automatic Transaction Recording**: Cron-based auto-creation of transaction records on payment dates
- View upcoming payments with billing cycle info

### Data Management
- Export transaction data to CSV
- Import bulk data from CSV
- Account deletion with cascading data cleanup

### Authentication
- Email/Password authentication
- Passkey (WebAuthn) support
- Password reset via email OTP

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Vercel Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI**: [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) (receipt analysis)
- **Auth**: [Better Auth](https://better-auth.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [Storybook](https://storybook.js.org/)
- **Linting**: [Biome](https://biomejs.dev/)
- **CI**: [GitHub Actions](.github/workflows/ci.yml)

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL database (Local or Vercel Postgres)
- Google Cloud API Key (for Gemini)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shun2218-dev/asset-lens.git
   cd asset-lens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the required values.
   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description | Required |
   |----------|-------------|----------|
   | `DATABASE_URL` | PostgreSQL connection string | ✅ |
   | `BETTER_AUTH_SECRET` | Auth secret key | ✅ |
   | `BETTER_AUTH_URL` | App base URL (e.g. `http://localhost:3000`) | ✅ |
   | `GEMINI_API_KEY` | Google Gemini API key for receipt scanning | ✅ |
   | `CRON_SECRET` | Secret for cron job authentication | ✅ |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token (for avatar uploads) | Optional |

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

- **Unit & Storybook Tests**:
  ```bash
  npm test
  ```
- **E2E Tests**:
  ```bash
  npm run test:e2e
  ```
- **Storybook** (visual component development):
  ```bash
  npm run storybook
  ```

### CI
GitHub Actions automatically runs lint, unit/Storybook tests on all PRs, and E2E tests on PRs to `main`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## 📋 Development Workflow

This project follows a strict branching policy. See [`.agents/workflows/feature-development.md`](.agents/workflows/feature-development.md) for the full workflow.

Key rules:
- Never commit directly to `develop` or `main`
- All work must be done on dedicated branches (`feature/`, `fix/`, `docs/`, `chore/`)
- Every task starts with a GitHub Issue
- PRs must include `Closes #<issue-number>` for auto-close

## 📝 License

This project is licensed under the MIT License.
