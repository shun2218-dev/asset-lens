# AssetLens

AssetLens is a modern personal finance management application designed to help you track your income, expenses, and subscriptions with ease. It leverages AI for receipt scanning and provides a comprehensive dashboard for financial insights.

## 🚀 Features

- **Dashboard**: Get a clear overview of your financial health with monthly summaries and category breakdowns.
- **Transaction Tracking**:
  - Record income and expenses.
  - **AI Receipt Scanning**: Upload receipt images to automatically extract details (amount, date, merchant) using Google Gemini AI.
- **Subscription Management**:
  - Track recurring payments.
  - Visualize upcoming payments in a calendar view.
  - Automatic processing of recurring transactions via Cron jobs.
- **Data Management**:
  - Export data to CSV.
  - Import bulk data.
- **Secure Authentication**: Built with Better Auth for robust security (Email/Password, Passkeys).

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Google Gemini Pro Vision](https://deepmind.google/technologies/gemini/) (for receipt analysis)
- **Auth**: [Better Auth](https://better-auth.com/)
- **Testing**: [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/)

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
   *Note: You need to configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `GEMINI_API_KEY` etc.*

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

- **Unit/Integration Tests**:
  ```bash
  npm test
  ```
- **E2E Tests**:
  ```bash
  npm run test:e2e
  ```

## 📝 License

This project is licensed under the MIT License.
