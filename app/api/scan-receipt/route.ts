import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { parseReceipt } from "@/lib/analysis/reciept-parser";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. 認証
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. iOSからはJSON { image: "base64..." } が送られてくる
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 },
      );
    }

    // 3. 共通処理を呼び出す (iOSからの画像は通常jpegかpng)
    const result = await parseReceipt(image, "image/jpeg");

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
