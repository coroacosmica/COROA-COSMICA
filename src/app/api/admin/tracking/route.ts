import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  const supabase = await createClient();

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;

  const { data: { user } } = token 
    ? await supabase.auth.getUser(token) 
    : await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let query = supabase
      .from("quote_requests")
      .select("id, tracking_data")
      .not("tracking_data", "is", null)
      .order("created_at", { ascending: false });

    if (region) {
      query = query.eq("tracking_data->>region", region);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform back to an array format similar to old Google Sheets for the UI
    const orders = data.map((q: any) => ({
      id: q.id,
      ...q.tracking_data
    }));

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Failed to fetch tracking orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tracking data" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    if (!id || !field || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;

    const { data: { user } } = token 
      ? await supabase.auth.getUser(token) 
      : await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First fetch the current tracking_data
    const { data: quote, error: fetchError } = await supabase
      .from("quote_requests")
      .select("tracking_data")
      .eq("id", id)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: "Quote request not found" }, { status: 404 });
    }

    // Update the specific field
    const updatedTrackingData = {
      ...quote.tracking_data,
      [field]: value
    };

    const { error: updateError } = await supabase
      .from("quote_requests")
      .update({ tracking_data: updatedTrackingData })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, tracking_data: updatedTrackingData });
  } catch (error: any) {
    console.error("Failed to patch order tracking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
