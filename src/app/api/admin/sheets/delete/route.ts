import { NextResponse } from "next/server";
import { deleteOrder, Region } from "@/lib/googleSheets";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { region, rowIndex } = body;

    if (!region || !rowIndex) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = await deleteOrder(region as Region, rowIndex);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/admin/sheets/delete:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
