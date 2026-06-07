import { NextResponse } from "next/server";
import { getOrders, Region } from "@/lib/googleSheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region;

  if (!region) {
    return NextResponse.json({ error: "Missing region" }, { status: 400 });
  }

  const orders = await getOrders(region);
  return NextResponse.json({ orders });
}
