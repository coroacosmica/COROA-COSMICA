"use client";

import { useState, useEffect, useMemo } from "react";

type Region = "egypt" | "europe" | "usa" | "saudi";

interface OrderData {
  id: number;
  orderNumber: string;
  poNumber: string;
  expectedDate: string;
  amount: string;
  currency: string;
  customerName: string;
  phone: string;
  email: string;
  locationAndCompany: string;
  contactMethod: string;
  itemsString: string;
  brandingMessage: string;
  region: Region;
  stepConnect: string;
  stepReview: string;
  stepConfirm: string;
  stepDesign: string;
  stepMaterial: string;
  stepManufacture: string;
  stepHandover: string;
  stepInvoice: string;
}

const REGIONS: { id: Region; label: string; flag: string; currency: string }[] = [
  { id: "egypt", label: "Egypt", flag: "🇪🇬", currency: "EGP" },
  { id: "europe", label: "Europe", flag: "🇪🇺", currency: "EUR" },
  { id: "usa", label: "USA", flag: "🇺🇸", currency: "USD" },
  { id: "saudi", label: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
];

const STEPS = [
  { key: "stepConnect", label: "Connect" },
  { key: "stepReview", label: "Review" },
  { key: "stepConfirm", label: "Confirm" },
  { key: "stepDesign", label: "Design" },
  { key: "stepMaterial", label: "Material" },
  { key: "stepManufacture", label: "Manufacture" },
  { key: "stepHandover", label: "Handover" },
  { key: "stepInvoice", label: "Invoice" },
];

export default function MultiRegionTracker() {
  const [activeRegion, setActiveRegion] = useState<Region>("egypt");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [allOrders, setAllOrders] = useState<Record<Region, OrderData[]>>({
    egypt: [],
    europe: [],
    usa: [],
    saudi: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncingCell, setSyncingCell] = useState<{ id: number; field: string } | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results: Record<Region, OrderData[]> = { egypt: [], europe: [], usa: [], saudi: [] };
      const res = await fetch(`/api/admin/tracking`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Group by region
      (data.orders || []).forEach((order: OrderData) => {
        if (order.region && results[order.region]) {
          results[order.region].push(order);
        }
      });

      setAllOrders(results);
      setOrders(results[activeRegion]);
      setLastSynced(new Date());
    } catch (e: any) {
      console.error("Failed to fetch tracking orders", e);
      setErrorMsg(e.message || "Failed to load order tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOrders(allOrders[activeRegion]);
  }, [activeRegion, allOrders]);

  const handleCellChange = async (id: number, field: keyof OrderData, value: string) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
    setSyncingCell({ id, field });

    try {
      const res = await fetch("/api/admin/tracking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (e) {
      console.error("Failed to sync cell", e);
      // Revert on error
      setOrders(previousOrders);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSyncingCell(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    return orders.filter((o) => 
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 border-b border-neutral-200">
          {REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setActiveRegion(reg.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeRegion === reg.id
                  ? "border-b-2 border-olive-600 text-olive-800"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {reg.flag} {reg.label} ({allOrders[reg.id]?.length || 0})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search Order No. or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
          />
          <div className="text-xs text-neutral-500">
            {loading ? "Syncing..." : lastSynced ? `Synced: ${lastSynced.toLocaleTimeString()}` : ""}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded bg-red-50 p-4 border border-red-200">
          <h3 className="text-sm font-bold text-red-800">Connection Error</h3>
          <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{errorMsg}</p>
          <button onClick={fetchOrders} className="mt-2 text-xs bg-red-100 px-3 py-1 rounded text-red-800 hover:bg-red-200">
            Try Again
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-max w-full text-left text-xs text-neutral-600">
          <thead className="bg-olive-800 text-white sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-semibold">Order Number</th>
              {STEPS.map((s) => (
                <th key={s.key} className="px-3 py-2 font-semibold">{s.label}</th>
              ))}
              <th className="px-3 py-2 font-semibold">PO Number</th>
              <th className="px-3 py-2 font-semibold">Expected Date</th>
              <th className="px-3 py-2 font-semibold text-right">Total Amount</th>
              <th className="px-3 py-2 font-semibold text-center">Cur</th>
              <th className="px-3 py-2 font-semibold">Customer Name</th>
              <th className="px-3 py-2 font-semibold">Phone</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Location / Company</th>
              <th className="px-3 py-2 font-semibold">Contact Method</th>
              <th className="px-3 py-2 font-semibold">Items & Prices</th>
              <th className="px-3 py-2 font-semibold">Branding & Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={21} className="p-8 text-center text-sm text-neutral-400">
                  {searchQuery ? "No orders match your search." : "No orders found in this region."}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{order.orderNumber}</td>
                  
                  {STEPS.map((step) => {
                    const isSyncing = syncingCell?.id === order.id && syncingCell?.field === step.key;
                    const val = (order as any)[step.key] || "";
                    
                    return (
                      <td key={step.key} className="px-1 py-1 min-w-[100px]">
                        <div className="relative flex items-center">
                          <select
                            value={val}
                            onChange={(e) => handleCellChange(order.id, step.key as keyof OrderData, e.target.value)}
                            className={`w-full appearance-none rounded border px-2 py-1 text-xs outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500 ${
                              val === "Done" ? "bg-green-50 border-green-200 text-green-700" :
                              val === "Working" ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                              val === "Issue" ? "bg-red-50 border-red-200 text-red-700" :
                              "bg-transparent border-transparent hover:border-neutral-300"
                            } ${isSyncing ? "opacity-50" : ""}`}
                          >
                            <option value="">-</option>
                            <option value="Done">Done</option>
                            <option value="Working">Working</option>
                            <option value="Issue">Issue</option>
                          </select>
                        </div>
                      </td>
                    );
                  })}

                  <td className="px-1 py-1 min-w-[120px]">
                    <input
                      type="text"
                      value={order.poNumber}
                      onChange={(e) => handleCellChange(order.id, "poNumber", e.target.value)}
                      placeholder="PO-"
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 hover:border-neutral-300 focus:border-olive-500 focus:bg-white focus:ring-1 focus:ring-olive-500"
                    />
                  </td>
                  
                  <td className="px-1 py-1 min-w-[130px]">
                    <input
                      type="date"
                      value={order.expectedDate}
                      onChange={(e) => handleCellChange(order.id, "expectedDate", e.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 hover:border-neutral-300 focus:border-olive-500 focus:bg-white focus:ring-1 focus:ring-olive-500"
                    />
                  </td>
                  
                  <td className="px-3 py-2 text-right font-medium whitespace-nowrap">{order.amount}</td>
                  <td className="px-3 py-2 text-center text-neutral-500">{order.currency}</td>
                  
                  <td className="px-3 py-2 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{order.phone}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-blue-600">{order.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{order.locationAndCompany}</td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">{order.contactMethod}</td>
                  <td className="px-3 py-2 min-w-[300px] text-[11px] leading-relaxed">{order.itemsString}</td>
                  <td className="px-3 py-2 min-w-[200px] text-[11px] whitespace-pre-wrap">{order.brandingMessage}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
