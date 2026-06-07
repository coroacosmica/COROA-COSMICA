import { NextResponse } from "next/server";
import { updateCell, Region } from "@/lib/googleSheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { region, rowIndex, colLetter, value } = body;

    if (!region || !rowIndex || !colLetter || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = await updateCell(region as Region, rowIndex, colLetter, value);
    if (!success) {
      return NextResponse.json({ error: "Failed to update cell" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/admin/sheets/update:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
