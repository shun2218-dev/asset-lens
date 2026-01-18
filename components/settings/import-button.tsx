"use client";

import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importData } from "@/app/actions/import-data";
import { Button } from "@/components/ui/button";

export function ImportButton() {
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // CSVかどうか簡易チェック
    if (!file.name.endsWith(".csv")) {
      toast.error("CSVファイルを選択してください");
      return;
    }

    if (
      !confirm(
        `${file.name} をインポートしますか？\n(重複データは自動的にスキップされます)`,
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await importData(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `インポート完了: ${result.count}件成功 (重複スキップ: ${result.skipped}件)`,
        );
      }
    } catch {
      toast.error("予期せぬエラーが発生しました");
    } finally {
      setIsPending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // 入力をリセット
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        CSVインポート
      </Button>
    </>
  );
}
