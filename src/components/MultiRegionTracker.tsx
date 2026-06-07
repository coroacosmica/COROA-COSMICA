"use client";

import { useState, useEffect } from "react";
import { Region } from "@/lib/googleSheets";

interface OrderData {
  rowIndex: number;
  orderNumber: string;
  connect: string;
  review: string;
  confirm: string;
  poNumber: string;
  design: string;
  purchaseMaterial: string;
  manufacture: string;
  handover: string;
  finalInvoice: string;
  expectedDate: string;
  amount: string;
  currency: string;
}

const REGIONS: { id: Region; label: string; flag: string; currency: string }[] = [
  { id: "egypt", label: "Egypt", flag: "🇪🇬", currency: "EGP" },
  { id: "europe", label: "Europe", flag: "🇪🇺", currency: "EUR" },
  { id: "usa", label: "USA", flag: "🇺🇸", currency: "USD" },
  { id: "saudi", label: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
];

const STEPS = [
  { key: "connect", label: "Connect", colLetter: "B" },
  { key: "review", label: "Review", colLetter: "C" },
  { key: "confirm", label: "Confirm", colLetter: "D" },
  { key: "design", label: "Design", colLetter: "F" },
  { key: "purchaseMaterial", label: "Material", colLetter: "G" },
  { key: "manufacture", label: "Manufacture", colLetter: "H" },
  { key: "handover", label: "Handover", colLetter: "I" },
  { key: "finalInvoice", label: "Invoice", colLetter: "J" },
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
  const [syncingCell, setSyncingCell] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<OrderData>>({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const results: Record<Region, OrderData[]> = { egypt: [], europe: [], usa: [], saudi: [] };
      for (const reg of REGIONS) {
        const res = await fetch(`/api/admin/sheets?region=${reg.id}`);
        const data = await res.json();
        results[reg.id] = data.orders || [];
      }
      setAllOrders(results);
      setOrders(results[activeRegion]);
      setLastSynced(new Date());
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOrders(allOrders[activeRegion] || []);
  }, [activeRegion, allOrders]);

  const toggleStep = async (order: OrderData, stepKey: string, colLetter: string) => {
    const currentVal = (order as any)[stepKey];
    const newVal = currentVal === "Done" ? "" : "Done";
    const cellId = `${order.rowIndex}-${stepKey}`;

    // Optimistic UI
    setOrders(orders.map((o) => (o.rowIndex === order.rowIndex ? { ...o, [stepKey]: newVal } : o)));
    setAllOrders((prev) => ({
      ...prev,
      [activeRegion]: prev[activeRegion].map((o) => (o.rowIndex === order.rowIndex ? { ...o, [stepKey]: newVal } : o)),
    }));

    setSyncingCell(cellId);
    try {
      await fetch("/api/admin/sheets/update", {
        method: "POST",
        body: JSON.stringify({
          region: activeRegion,
          rowIndex: order.rowIndex,
          colLetter,
          value: newVal,
        }),
      });
    } catch (e) {
      console.error("Update failed", e);
      // Revert on failure
      setOrders(orders.map((o) => (o.rowIndex === order.rowIndex ? { ...o, [stepKey]: currentVal } : o)));
    } finally {
      setSyncingCell(null);
    }
  };

  const handleAddSubmit = async () => {
    try {
      await fetch("/api/admin/sheets/new", {
        method: "POST",
        body: JSON.stringify({
          region: activeRegion,
          order: {
            ...newOrder,
            currency: REGIONS.find((r) => r.id === activeRegion)?.currency,
          },
        }),
      });
      setIsAdding(false);
      setNewOrder({});
      fetchOrders();
    } catch (e) {
      console.error("Failed to add order", e);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("Are you sure you want to delete this order row from the Google Sheet?")) return;
    try {
      await fetch("/api/admin/sheets/delete", {
        method: "DELETE",
        body: JSON.stringify({ region: activeRegion, rowIndex }),
      });
      fetchOrders();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  // Stats
  const totalOrders = Object.values(allOrders).flat().length;
  const inProgress = Object.values(allOrders).flat().filter(
    (o) => STEPS.some((s) => (o as any)[s.key] !== "Done")
  ).length;
  const completed = totalOrders - inProgress;
  const regionTotalRev = orders.reduce((acc, o) => acc + (parseFloat(o.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-neutral-100">
          <p className="text-2xl font-bold text-olive-900">{totalOrders}</p>
          <p className="text-xs font-semibold uppercase text-neutral-500">Total Orders</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-neutral-100">
          <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          <p className="text-xs font-semibold uppercase text-neutral-500">In Progress</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-neutral-100">
          <p className="text-2xl font-bold text-green-600">{completed}</p>
          <p className="text-xs font-semibold uppercase text-neutral-500">Completed</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-neutral-100 flex flex-col justify-center">
          <p className="text-xs text-neutral-400">Last synced</p>
          <p className="text-sm font-medium text-neutral-700">
            {lastSynced ? lastSynced.toLocaleTimeString() : "..."}
          </p>
          <button onClick={fetchOrders} className="mt-1 text-xs text-olive-600 hover:underline text-left">
            Refresh Now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 pb-2">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRegion(r.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeRegion === r.id
                ? "border-b-2 border-olive-600 text-olive-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {r.flag} {r.label} ({allOrders[r.id].length})
          </button>
        ))}
      </div>

      {/* Region Toolbar */}
      <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-200">
        <div>
          <span className="text-sm text-neutral-500">Revenue in {REGIONS.find((r) => r.id === activeRegion)?.currency}: </span>
          <span className="text-lg font-bold text-olive-800">{regionTotalRev.toLocaleString()}</span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700"
        >
          + Add New Order
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-neutral-200">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading sheets data...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No orders found in this region sheet.</div>
        ) : (
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-100 text-neutral-700 uppercase border-b border-neutral-200">
              <tr>
                <th className="px-3 py-3">Order No.</th>
                <th className="px-3 py-3">PO No.</th>
                {STEPS.map((s) => (
                  <th key={s.key} className="px-3 py-3 text-center">{s.label}</th>
                ))}
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">Due Date</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => {
                const doneCount = STEPS.filter((s) => (o as any)[s.key] === "Done").length;
                return (
                  <tr key={o.rowIndex} className="hover:bg-neutral-50">
                    <td className="px-3 py-3 font-semibold">{o.orderNumber || "—"}</td>
                    <td className="px-3 py-3 text-neutral-500">{o.poNumber || "—"}</td>
                    {STEPS.map((s) => {
                      const isDone = (o as any)[s.key] === "Done";
                      const isSyncing = syncingCell === `${o.rowIndex}-${s.key}`;
                      return (
                        <td key={s.key} className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleStep(o, s.key, s.colLetter)}
                            disabled={isSyncing}
                            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors mx-auto ${
                              isSyncing ? "opacity-50 cursor-wait" : ""
                            } ${isDone ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-300 hover:bg-neutral-200"}`}
                          >
                            {isDone ? "✓" : "○"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right text-neutral-600">{doneCount}/{STEPS.length}</span>
                        <div className="h-2 w-16 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-olive-500 transition-all"
                            style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{o.expectedDate || "—"}</td>
                    <td className="px-3 py-3 font-medium">
                      {o.amount} {o.currency}
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => handleDelete(o.rowIndex)} className="text-red-500 hover:text-red-700">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold">Add Order ({REGIONS.find((r) => r.id === activeRegion)?.label})</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">Order Number</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm"
                  onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">PO Number</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm"
                  onChange={(e) => setNewOrder({ ...newOrder, poNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-full rounded border px-3 py-2 text-sm"
                    onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                  />
                  <span className="flex items-center bg-neutral-100 px-3 rounded text-sm font-semibold text-neutral-600">
                    {REGIONS.find((r) => r.id === activeRegion)?.currency}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold">Expected Date</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2 text-sm"
                  onChange={(e) => setNewOrder({ ...newOrder, expectedDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleAddSubmit} className="rounded bg-olive-600 px-4 py-2 text-sm text-white">Save to Sheet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
