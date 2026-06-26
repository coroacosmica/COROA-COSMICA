import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week"; // today, week, month, year

  const supabase = await createClient();

  try {
    let startDate = new Date();
    if (period === "today") startDate.setHours(0, 0, 0, 0);
    else if (period === "week") startDate.setDate(startDate.getDate() - 7);
    else if (period === "month") startDate.setMonth(startDate.getMonth() - 1);
    else if (period === "year") startDate.setFullYear(startDate.getFullYear() - 1);

    const isoStart = startDate.toISOString();

    // Fetch page views
    const { data: pageViews } = await supabase
      .from("page_views")
      .select("path, session_id, created_at")
      .gte("created_at", isoStart);

    // Fetch product views
    const { data: productViews } = await supabase
      .from("product_views")
      .select("product_code, session_id, created_at")
      .gte("created_at", isoStart);

    // Fetch quote requests (sales)
    const { data: quotes } = await supabase
      .from("quote_requests")
      .select("items, created_at")
      .gte("created_at", isoStart);

    const pv = pageViews || [];
    const prv = productViews || [];
    const qs = quotes || [];

    // 1. Total Visits (Unique sessions)
    const uniqueSessions = new Set(pv.map(v => v.session_id)).size;

    // 2. Top Pages
    const pageCounts: Record<string, number> = {};
    pv.forEach(v => {
      pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 3. Top Products Viewed
    const productCounts: Record<string, number> = {};
    prv.forEach(v => {
      productCounts[v.product_code] = (productCounts[v.product_code] || 0) + 1;
    });
    const topProducts = Object.entries(productCounts)
      .map(([code, views]) => ({ code, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 4. Top Purchased Products
    const purchaseCounts: Record<string, number> = {};
    qs.forEach(q => {
      if (Array.isArray(q.items)) {
        q.items.forEach((item: any) => {
          if (item.code && item.code !== 'LOGO' && item.code !== 'DESIGN') {
            purchaseCounts[item.code] = (purchaseCounts[item.code] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    const topPurchased = Object.entries(purchaseCounts)
      .map(([code, sales]) => ({ code, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // 5. Chart Data (Group by Day if > today, else by Hour)
    const chartDataMap: Record<string, number> = {};
    pv.forEach(v => {
      const dateObj = new Date(v.created_at);
      let key = "";
      if (period === "today") {
        key = dateObj.getHours() + ":00";
      } else if (period === "year") {
        key = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
      } else {
        key = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      }
      chartDataMap[key] = (chartDataMap[key] || 0) + 1;
    });

    const chartData = Object.entries(chartDataMap)
      .map(([name, visits]) => ({ name, visits }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      totalVisits: uniqueSessions,
      totalPageViews: pv.length,
      topPages,
      topProducts,
      topPurchased,
      chartData
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
