import { NextRequest, NextResponse } from "next/server";
import { addOrder, Region } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, orderNumber, customerName, poNumber, amount, currency, expectedDate } = body;

    if (!region || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = await addOrder(region as Region, {
      orderNumber,
      customerName: customerName || "",
      poNumber: poNumber || "",
      amount: amount || 0,
      currency: currency || "",
      expectedDate: expectedDate || "",
    });

    if (!success) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
