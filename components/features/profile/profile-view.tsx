"use client";

import { UserCircle } from "lucide-react";
import { ProfileForm } from "@/components/features/settings/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileViewProps {
  session: {
    user: {
      name: string;
      email: string;
      image?: string | null;
    };
  };
}

export function ProfileView({ session }: ProfileViewProps) {
  return (
    <main className="container max-w-5xl px-4 py-10 space-y-8 mx-auto min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">プロフィール</h1>
        <p className="text-muted-foreground">基本情報の確認と変更</p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            基本情報
          </CardTitle>
          <CardDescription>アカウント情報を管理します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileForm initialData={session.user} />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <span className="font-medium text-muted-foreground">
              メールアドレス
            </span>
            <span className="md:col-span-2 font-medium">
              {session.user.email}
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
