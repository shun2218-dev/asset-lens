"use client";

import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { getExportData } from "@/app/actions/export/get-export-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadFile, generateCsv } from "@/lib/export/csv";

interface ExportDropdownProps {
  currentMonth: string;
}

export function ExportDropdown({ currentMonth }: ExportDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const [exportType, setExportType] = useState<"csv" | "pdf" | null>(null);

  const handleExportCsv = useCallback(() => {
    setExportType("csv");
    startTransition(async () => {
      const result = await getExportData(currentMonth);
      if (!result.success) return;

      const csv = generateCsv(result.data);
      downloadFile(
        csv,
        `asset-lens-${currentMonth}.csv`,
        "text/csv;charset=utf-8",
      );
      setExportType(null);
    });
  }, [currentMonth]);

  const handleExportPdf = useCallback(() => {
    setExportType("pdf");
    startTransition(async () => {
      const result = await getExportData(currentMonth);
      if (!result.success) return;

      const { generatePdf } = await import("@/lib/export/pdf");
      const blob = await generatePdf(result.data);
      downloadFile(
        blob,
        `asset-lens-report-${currentMonth}.pdf`,
        "application/pdf",
      );
      setExportType(null);
    });
  }, [currentMonth]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          id="export-button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          {isPending
            ? exportType === "csv"
              ? "CSV..."
              : "PDF..."
            : "エクスポート"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleExportCsv}
          disabled={isPending}
          id="export-csv"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV でダウンロード
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPdf}
          disabled={isPending}
          id="export-pdf"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF レポート
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
