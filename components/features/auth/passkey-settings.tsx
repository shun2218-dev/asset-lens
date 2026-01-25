"use client";

import type { Passkey } from "@better-auth/passkey";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { passkey } from "@/lib/auth/client";

export function PasskeySettings() {
  const { addPasskey, deletePasskey, isLoading } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // 一覧を取得する関数
  const fetchPasskeys = useCallback(async () => {
    try {
      const { data, error } = await passkey.listUserPasskeys();
      if (error) {
        console.error(error);
        return;
      }
      setPasskeys((data as Passkey[]) || []);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  // 追加処理
  const handleAddPasskey = async () => {
    const parser = new UAParser();
    const result = parser.getResult();
    const browser = result.browser.name;
    const os = result.os.name;
    const device = result.device.model;

    let deviceName = "Unknown Device";
    if (browser && os) deviceName = `${browser} on ${os}`;
    else if (os) deviceName = os;
    if (device) deviceName += ` (${device})`;

    // useAuthのaddPasskeyを呼び出し、成功したら一覧を再取得
    await addPasskey({ passkeyName: deviceName });
    await fetchPasskeys();
  };

  // 削除処理
  const handleDeletePasskey = async (id: string) => {
    if (!confirm("このPasskeyを削除してもよろしいですか？")) return;

    await deletePasskey({ passkeyId: id });
    // 削除成功したらリストから除外（再取得より高速にUI反映するため）
    setPasskeys((prev) => prev.filter((pk) => pk.id !== id));

    toast.info("アプリからの削除が完了しました", {
      description:
        "端末やブラウザの設定に残っているキーは、必要に応じて手動で削除してください。",
      duration: 6000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Passkey設定
            </CardTitle>
            <CardDescription>
              パスワードの代わりに生体認証などでログインできるようにします。
            </CardDescription>
          </div>
          <Button onClick={handleAddPasskey} disabled={isLoading} size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            現在のデバイスを追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            登録されているPasskeyはありません。
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passkeys.map((pk) => (
                <TableRow key={pk.id}>
                  <TableCell className="font-medium">
                    {pk.name || "名称未設定"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(pk.createdAt), "yyyy/MM/dd", {
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePasskey(pk.id)}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
