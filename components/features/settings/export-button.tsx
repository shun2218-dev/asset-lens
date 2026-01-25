"use client";

import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportData } from "@/app/actions/data/export";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  const [isPending, setIsPending] = useState(false);

  const handleExport = async () => {
    setIsPending(true);
    try {
      const csvData = await exportData();

      // ダウンロード処理
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `asset-lens_data_${format(new Date(), "yyyy-MM-dd")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("データをエクスポートしました");
    } catch (error) {
      toast.error("エクスポートに失敗しました");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button variant="default" onClick={handleExport} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      CSVエクスポート
    </Button>
  );
}
