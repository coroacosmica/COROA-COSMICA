import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Save to Supabase (Primary)
    const { error } = await supabase.from("quote_requests").insert([{
      customer_name: body.customer?.name,
      customer_email: body.customer?.email,
      customer_phone: body.customer?.phone,
      customer_company: body.customer?.company,
      items: body.items,
      message: body.message,
      locale: body.locale || "pt",
    }]);

    if (error) {
      console.error("Supabase insert error:", error);
    }

    // 2. Save to file system as backup (for local development fallback)
    try {
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
    } catch (fsError) {
      // ignore fs errors on vercel
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API error:", err);
    // Return ok:true anyway to not break the UI if something fails
    return NextResponse.json({ ok: true });
  }
}
