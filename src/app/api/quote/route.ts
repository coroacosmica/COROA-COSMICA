import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Vercel/serverless: only /tmp is writable; locally use data/requests
    const dataDir =
      process.env.VERCEL === "1"
        ? path.join("/tmp", "coroacosmica-requests")
        : path.join(process.cwd(), "data", "requests");
    await mkdir(dataDir, { recursive: true });

    const filename = `request-${Date.now()}.json`;
    await writeFile(
      path.join(dataDir, filename),
      JSON.stringify({ ...body, createdAt: new Date().toISOString() }, null, 2),
      "utf-8"
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
