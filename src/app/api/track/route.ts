import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, path, product_code, session_id } = body;

    if (!session_id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    if (type === "page_view" && path) {
      const { error } = await supabase.from("page_views").insert([{
        path,
        session_id
      }]);
      if (error) console.error("Error inserting page view:", error);
    } else if (type === "product_view" && product_code) {
      const { error } = await supabase.from("product_views").insert([{
        product_code,
        session_id
      }]);
      if (error) console.error("Error inserting product view:", error);
    } else {
      return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
