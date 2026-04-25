import type { Metadata } from "next";
import { AnnualReportView } from "@/components/features/report/annual-report-view";

export const metadata: Metadata = {
  title: "年次レポート",
  description:
    "年間の収支サマリー、月別内訳、カテゴリ別支出ランキング。1年間の家計を振り返る年次レポート。",
};

export default function ReportPage() {
  return (
    <main className="container mx-auto p-4 max-w-6xl space-y-6 pb-24 md:pb-6">
      <AnnualReportView />
    </main>
  );
}
