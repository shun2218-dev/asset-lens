"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "ログインしてください" };
  }

  const name = formData.get("name") as string;
  const imageFile = formData.get("image") as File | null;

  const parsed = profileSchema.safeParse({ name, image: imageFile });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  let imageUrl: string | undefined;

  try {
    if (imageFile && imageFile.size > 0) {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      imageUrl = blob.url;
    }

    await db
      .update(user)
      .set({
        name: parsed.data.name,
        ...(imageUrl ? { image: imageUrl } : {}),
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "プロフィールの更新に失敗しました" };
  }
}
