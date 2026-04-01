import { format } from "date-fns";
import type { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description:
    "月次収支推移、カテゴリ別支出、予算進捗を一目で確認。家計の全体像を把握できるダッシュボード。",
};

interface DashboardPageProps {
  searchParams: { month?: string };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const currentMonth = params.month || format(new Date(), "yyyy-MM");

  return (
    <main className="container mx-auto p-4 max-w-6xl space-y-6 pb-24 md:pb-6">
      <DashboardContent currentMonth={currentMonth} />
    </main>
  );
}
