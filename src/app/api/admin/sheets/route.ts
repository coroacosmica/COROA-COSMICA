import { NextRequest, NextResponse } from "next/server";
import { getOrders, getAllOrders, updateCell, Region } from "@/lib/googleSheets";

// Define the steps and their corresponding columns
const STEP_COLUMNS: Record<string, string> = {
  connect: "B",
  review: "C",
  confirm: "D",
  design: "F",
  purchaseMaterial: "G",
  manufacture: "H",
  handover: "I",
  finalInvoice: "J",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;

  try {
    if (region) {
      const orders = await getOrders(region);
      return NextResponse.json({ orders });
    } else {
      const orders = await getAllOrders();
      return NextResponse.json({ orders });
    }
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, rowIndex, step, value } = body;

    if (!region || !rowIndex || !step || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const colLetter = STEP_COLUMNS[step];
    if (!colLetter) {
      return NextResponse.json({ error: "Invalid step name" }, { status: 400 });
    }

    const success = await updateCell(region as Region, rowIndex, colLetter, value);
    if (!success) {
      return NextResponse.json({ error: "Failed to update cell" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to patch order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
