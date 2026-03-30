"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/schema";
import { createSafeAction } from "@/lib/actions/safe-action";
import { profileSchema } from "@/lib/validators";

export const updateProfile = createSafeAction<FormData, void>(
  async (formData, userId) => {
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    const parsed = profileSchema.safeParse({ name, image: imageFile });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }

    let imageUrl: string | undefined;

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
      .where(eq(user.id, userId));

    revalidatePath("/settings");
  },
  { errorMessage: "Failed to update profile" },
);
