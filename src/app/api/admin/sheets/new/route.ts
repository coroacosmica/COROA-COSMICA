import { NextResponse } from "next/server";
import { addOrder, Region } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { region, order } = body;

    if (!region || !order) {
      return NextResponse.json({ error: "Missing region or order data" }, { status: 400 });
    }

    const success = await addOrder(region as Region, order);
    if (!success) {
      return NextResponse.json({ error: "Failed to add order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/admin/sheets/new:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
