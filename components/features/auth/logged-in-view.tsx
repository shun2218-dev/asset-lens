"use client";

import {
  CheckCircle2,
  Fingerprint,
  Loader2,
  LogOut,
  Wallet,
} from "lucide-react";
import { UAParser } from "ua-parser-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authClient, client } from "@/lib/auth/client";

interface LoggedInViewProps {
  session: typeof client.$Infer.Session;
}

export function LoggedInView({ session }: LoggedInViewProps) {
  const { logout, addPasskey, isLoading } = useAuth();

  const handleAddPasskey = async () => {
    const parser = new UAParser();
    const result = parser.getResult();

    const browser = result.browser.name;
    const os = result.os.name;
    const device = result.device.model;

    let deviceName = "Unknown Device";

    if (browser && os) {
      deviceName = `${browser} on ${os}`;
    } else if (os) {
      deviceName = os;
    }

    if (device) {
      deviceName += ` (${device})`;
    }

    await addPasskey({ passkeyName: deviceName });
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">AssetLens</CardTitle>
        <CardDescription>
          ようこそ、
          <span className="font-medium text-foreground">
            {session.user.name}
          </span>{" "}
          さん
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 border">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">ログイン済み</p>
            <p className="text-xs text-muted-foreground">
              現在のアカウントで家計簿データを管理できます。
            </p>
          </div>
        </div>

        <Button
          onClick={handleAddPasskey}
          disabled={isLoading}
          className="w-full h-12 text-base"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Fingerprint className="mr-2 h-5 w-5" />
          )}
          このデバイスをPasskeyに追加
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">
          ボタンを押すと、お使いのデバイス（
          {new UAParser().getOS().name}など）が生体認証キーとして登録されます。
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full text-muted-foreground hover:text-destructive"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ログアウト
        </Button>
      </CardFooter>
    </Card>
  );
}
