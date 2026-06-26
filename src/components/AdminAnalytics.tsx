"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function AdminAnalytics() {
  const t = useTranslations("admin");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("week");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load analytics data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Filters */}
      <div className="flex gap-2 border-b border-neutral-200 pb-4">
        {(["today", "week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              period === p
                ? "bg-olive-600 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <p className="text-sm text-neutral-500 font-medium">Total Page Views</p>
          <h3 className="text-3xl font-bold text-olive-900 mt-1">{data.totalPageViews}</h3>
        </div>
        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <p className="text-sm text-neutral-500 font-medium">Unique Visitors</p>
          <h3 className="text-3xl font-bold text-olive-900 mt-1">{data.totalVisits}</h3>
        </div>
        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <p className="text-sm text-neutral-500 font-medium">Products Sold</p>
          <h3 className="text-3xl font-bold text-olive-900 mt-1">
            {data.topPurchased.reduce((acc: number, item: any) => acc + item.sales, 0)}
          </h3>
        </div>
        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <p className="text-sm text-neutral-500 font-medium">Conversion Rate</p>
          <h3 className="text-3xl font-bold text-olive-900 mt-1">
            {data.totalVisits > 0 
              ? ((data.topPurchased.reduce((acc: number, i: any) => acc + i.sales, 0) / data.totalVisits) * 100).toFixed(1) 
              : 0}%
          </h3>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl h-[400px]">
          <h3 className="font-bold text-lg text-olive-900 mb-4">Traffic Overview</h3>
          {data.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">No traffic data for this period</div>
          )}
        </div>

        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg text-olive-900 mb-4">Top Pages Visited</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {data.topPages.map((page: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="truncate text-sm text-neutral-700 max-w-[150px]" title={page.path}>
                    {page.path === "/" ? "Home" : page.path.replace("/", "")}
                  </span>
                </div>
                <span className="font-semibold text-olive-700 text-sm">{page.views}</span>
              </div>
            ))}
            {data.topPages.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No page views</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <h3 className="font-bold text-lg text-olive-900 mb-4">Top Viewed Products</h3>
          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis type="category" dataKey="code" axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="views" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex h-[300px] items-center justify-center text-neutral-400">No product views</div>
          )}
        </div>

        <div className="card p-5 bg-white border border-neutral-100 shadow-sm rounded-xl">
          <h3 className="font-bold text-lg text-olive-900 mb-4">Top Purchased Products</h3>
          <div className="space-y-4">
            {data.topPurchased.map((product: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-olive-50 flex items-center justify-center text-olive-700 font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{product.code}</p>
                    <p className="text-xs text-neutral-500">Product Code</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-olive-700">{product.sales}</p>
                  <p className="text-xs text-neutral-500">units sold</p>
                </div>
              </div>
            ))}
            {data.topPurchased.length === 0 && (
              <div className="flex h-[200px] items-center justify-center text-neutral-400">No sales data for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
