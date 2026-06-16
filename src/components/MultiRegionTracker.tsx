"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/admin/tracking?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
          "Cache-Control": "no-cache"
        }
      });
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
    const previousAllOrders = { ...allOrders };

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
    
    setAllOrders((prev) => {
      const newAll = { ...prev };
      if (newAll[activeRegion]) {
        newAll[activeRegion] = newAll[activeRegion].map((o) => 
          o.id === id ? { ...o, [field]: value } : o
        );
      }
      return newAll;
    });

    setSyncingCell({ id, field });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/admin/tracking", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        body: JSON.stringify({ id, field, value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (e) {
      console.error("Failed to sync cell", e);
      // Revert on error
      setOrders(previousOrders);
      setAllOrders(previousAllOrders);
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

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((acc, order) => acc + (parseFloat(order.amount) || 0), 0);
  }, [filteredOrders]);

  const currentCurrency = REGIONS.find(r => r.id === activeRegion)?.currency || "";

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;
    
    const headers = [
      "Order Number", "Connect", "Review", "Confirm", "Design", "Material", "Manufacture", "Handover", "Invoice",
      "PO Number", "Expected Date", "Total Amount", "Currency", "Customer Name", "Phone", "Email", "Location / Company", "Contact Method", "Items & Prices", "Branding & Notes"
    ];

    const cleanForCSV = (str: string) => {
      if (!str) return "";
      let cleaned = str.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, "[Attached Image]");
      return cleaned.replace(/"/g, '""');
    };

    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(o => [
        `"${o.orderNumber || ""}"`,
        `"${o.stepConnect || ""}"`,
        `"${o.stepReview || ""}"`,
        `"${o.stepConfirm || ""}"`,
        `"${o.stepDesign || ""}"`,
        `"${o.stepMaterial || ""}"`,
        `"${o.stepManufacture || ""}"`,
        `"${o.stepHandover || ""}"`,
        `"${o.stepInvoice || ""}"`,
        `"${o.poNumber || ""}"`,
        `"${o.expectedDate || ""}"`,
        `"${o.amount || ""}"`,
        `"${o.currency || ""}"`,
        `"${cleanForCSV(o.customerName)}"`,
        `"${o.phone || ""}"`,
        `"${o.email || ""}"`,
        `"${cleanForCSV(o.locationAndCompany)}"`,
        `"${o.contactMethod || ""}"`,
        `"${cleanForCSV(o.itemsString)}"`,
        `"${cleanForCSV(o.brandingMessage)}"`
      ].join(","))
    ].join("\n");

    // Add UTF-8 BOM (\uFEFF) so Excel reads special characters and Arabic properly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Order_Tracking_${activeRegion}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBrandingMessage = (msg: string) => {
    if (!msg) return null;
    const fileIndex = msg.indexOf("File: data:image/");
    if (fileIndex !== -1) {
      const textPart = msg.substring(0, fileIndex);
      const filePart = msg.substring(fileIndex + 6); // Skip "File: "
      return (
        <div>
          <span className="whitespace-pre-wrap">{textPart}</span>
          <div className="mt-2">
            <a href={filePart} download="Attached_Logo" className="inline-flex items-center gap-1 rounded bg-olive-100 px-3 py-1.5 text-xs font-medium text-olive-800 hover:bg-olive-200 shadow-sm transition-colors">
              ⬇️ Download Design
            </a>
          </div>
        </div>
      );
    }
    return <span className="whitespace-pre-wrap">{msg}</span>;
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      {/* Top Controls: Region Tabs + Search/Export */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2 lg:border-none lg:pb-0">
          {REGIONS.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setActiveRegion(reg.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeRegion === reg.id
                  ? "border-b-2 border-olive-600 text-olive-800 lg:border-b-0 lg:rounded lg:bg-olive-50 lg:text-olive-900"
                  : "text-neutral-500 hover:text-neutral-700 lg:hover:bg-neutral-50"
              }`}
            >
              {reg.flag} {reg.label} ({allOrders[reg.id]?.length || 0})
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col text-right pr-4 border-r border-neutral-200">
            <span className="text-xs text-neutral-500">Total Revenue ({currentCurrency})</span>
            <span className="text-lg font-bold text-olive-800">
              {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <input
            type="text"
            placeholder="Search Order No. or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full lg:w-64 rounded border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
          />
          
          <button 
            onClick={exportToCSV}
            className="rounded bg-neutral-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-900 transition-colors shadow-sm whitespace-nowrap"
          >
            📥 Export Excel
          </button>

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

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-max w-full text-left text-xs text-neutral-600">
          <thead className="bg-olive-800 text-white sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-semibold">Order Number</th>
              <th className="px-3 py-2 font-semibold min-w-[150px]">Tracking Progress</th>
              <th className="px-3 py-2 font-semibold">PO Number</th>
              <th className="px-3 py-2 font-semibold">Expected Date</th>
              <th className="px-3 py-2 font-semibold text-right">Total Amount</th>
              <th className="px-3 py-2 font-semibold text-center">Cur</th>
              <th className="px-3 py-2 font-semibold">Customer Details</th>
              <th className="px-3 py-2 font-semibold">Items & Prices</th>
              <th className="px-3 py-2 font-semibold">Branding & Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-neutral-400">
                  {searchQuery ? "No orders match your search." : "No orders found in this region."}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors align-top">
                  <td className="px-3 py-4 font-bold text-olive-900 whitespace-nowrap">{order.orderNumber}</td>
                  
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2 border-l-2 border-neutral-100 pl-2">
                      {STEPS.map((step) => {
                        const isSyncing = syncingCell?.id === order.id && syncingCell?.field === step.key;
                        const val = (order as any)[step.key] || "";
                        
                        return (
                          <div key={step.key} className={`flex items-center justify-between gap-2 text-[11px] ${isSyncing ? "opacity-50" : ""}`}>
                            <span className="font-medium text-neutral-600 w-16">{step.label}</span>
                            <div className="flex gap-1 bg-neutral-100 rounded-full p-0.5 shadow-inner">
                              <button 
                                onClick={() => handleCellChange(order.id, step.key as keyof OrderData, "Done")}
                                className={`h-5 w-5 flex items-center justify-center rounded-full transition-colors ${val === "Done" ? "bg-green-500 text-white shadow-sm" : "text-neutral-400 hover:text-green-600 hover:bg-green-50"}`}
                                title="Done"
                              >
                                ✔
                              </button>
                              <button 
                                onClick={() => handleCellChange(order.id, step.key as keyof OrderData, "Working")}
                                className={`h-5 w-5 flex items-center justify-center rounded-full transition-colors ${val === "Working" ? "bg-yellow-500 text-white shadow-sm" : "text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50"}`}
                                title="Working"
                              >
                                ⏳
                              </button>
                              <button 
                                onClick={() => handleCellChange(order.id, step.key as keyof OrderData, "")}
                                className={`h-5 w-5 flex items-center justify-center rounded-full transition-colors ${!val || val === "" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-400 hover:text-neutral-700 hover:bg-white"}`}
                                title="Pending"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-2 py-4 min-w-[120px]">
                    <input
                      type="text"
                      value={order.poNumber}
                      onChange={(e) => handleCellChange(order.id, "poNumber", e.target.value)}
                      placeholder="PO-"
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 hover:border-neutral-300 focus:border-olive-500 focus:bg-white focus:ring-1 focus:ring-olive-500"
                    />
                  </td>
                  
                  <td className="px-2 py-4 min-w-[130px]">
                    <input
                      type="date"
                      value={order.expectedDate}
                      onChange={(e) => handleCellChange(order.id, "expectedDate", e.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 hover:border-neutral-300 focus:border-olive-500 focus:bg-white focus:ring-1 focus:ring-olive-500 text-[11px]"
                    />
                  </td>
                  
                  <td className="px-3 py-4 text-right font-bold text-olive-800 whitespace-nowrap">{order.amount}</td>
                  <td className="px-3 py-4 text-center text-neutral-500">{order.currency}</td>
                  
                  <td className="px-3 py-4 text-[11px] leading-relaxed">
                    <p className="font-semibold text-neutral-800 mb-1">{order.customerName}</p>
                    <p className="text-neutral-600">📱 {order.phone}</p>
                    <p className="text-blue-600">📧 {order.email}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {order.locationAndCompany ? order.locationAndCompany.split('|').map((part: string, idx: number) => (
                        <p key={idx} className="text-neutral-600">
                          {part.includes('Location:') ? '📍 ' : part.includes('Company:') ? '🏢 ' : '🌍 '}
                          {part.trim()}
                        </p>
                      )) : (
                        <p className="text-neutral-600">📍 —</p>
                      )}
                    </div>
                    <p className="text-neutral-500 mt-1 italic">Contact via: <span className="capitalize">{order.contactMethod}</span></p>
                  </td>

                  <td className="px-3 py-4 min-w-[300px] text-[11px]">
                    <div className="flex flex-col gap-2 border-l-2 border-olive-200 pl-3">
                      {order.itemsString ? order.itemsString.split(" | ").map((itemStr, idx) => (
                        <div key={idx} className="font-medium text-neutral-700">
                          {itemStr}
                        </div>
                      )) : null}
                    </div>
                  </td>

                  <td className="px-3 py-4 min-w-[250px] text-[11px]">
                    {renderBrandingMessage(order.brandingMessage)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-4 lg:hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-400 border border-neutral-200 rounded-lg">
            {searchQuery ? "No orders match your search." : "No orders found in this region."}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="border border-neutral-200 rounded-lg bg-white p-4 shadow-sm flex flex-col gap-4">
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="font-bold text-olive-900 text-base">{order.orderNumber}</h4>
                  <p className="text-xs text-neutral-600 font-medium mt-1">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-olive-800 text-sm">{order.amount} <span className="text-xs text-neutral-500">{order.currency}</span></p>
                  <p className="text-xs text-neutral-500 mt-1">{order.expectedDate || "No date set"}</p>
                </div>
              </div>

              {/* Tracking Progress Grid */}
              <div className="bg-neutral-50 rounded-lg p-3">
                <h5 className="text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Tracking Progress</h5>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  {STEPS.map((step) => {
                    const isSyncing = syncingCell?.id === order.id && syncingCell?.field === step.key;
                    const val = (order as any)[step.key] || "";
                    
                    return (
                      <div key={step.key} className={`flex items-center justify-between gap-1 text-[10px] ${isSyncing ? "opacity-50" : ""}`}>
                        <span className="font-medium text-neutral-600">{step.label}</span>
                        <div className="flex gap-1 bg-white rounded-full p-0.5 shadow-sm border border-neutral-200">
                          <button 
                            onClick={() => handleCellChange(order.id, step.key as keyof OrderData, "Done")}
                            className={`h-5 w-5 flex items-center justify-center rounded-full transition-colors ${val === "Done" ? "bg-green-500 text-white" : "text-neutral-400"}`}
                          >
                            ✔
                          </button>
                          <button 
                            onClick={() => handleCellChange(order.id, step.key as keyof OrderData, "Working")}
                            className={`h-5 w-5 flex items-center justify-center rounded-full transition-colors ${val === "Working" ? "bg-yellow-500 text-white" : "text-neutral-400"}`}
                          >
                            ⏳
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div>
                <h5 className="text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Items</h5>
                <div className="flex flex-col gap-1 pl-2 border-l-2 border-olive-200 text-xs">
                  {order.itemsString ? order.itemsString.split(" | ").map((itemStr, idx) => (
                    <div key={idx} className="font-medium text-neutral-700">
                      {itemStr}
                    </div>
                  )) : <div className="text-neutral-400 italic">No items</div>}
                </div>
              </div>

              {/* Customer Details & Inputs */}
              <div className="grid grid-cols-2 gap-3 text-[10px] pt-3 border-t border-neutral-100">
                <div className="flex flex-col gap-1">
                  <p className="text-neutral-600">📱 {order.phone}</p>
                  <p className="text-neutral-600 truncate" title={order.email}>📧 {order.email}</p>
                  {order.locationAndCompany ? order.locationAndCompany.split('|').map((part: string, idx: number) => (
                    <p key={idx} className="text-neutral-600">
                      {part.includes('Location:') ? '📍 ' : part.includes('Company:') ? '🏢 ' : '🌍 '}
                      {part.trim()}
                    </p>
                  )) : (
                    <p className="text-neutral-600">📍 —</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={order.poNumber}
                    onChange={(e) => handleCellChange(order.id, "poNumber", e.target.value)}
                    placeholder="PO Number"
                    className="w-full rounded border border-neutral-200 bg-white px-2 py-1 focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                  />
                  <input
                    type="date"
                    value={order.expectedDate}
                    onChange={(e) => handleCellChange(order.id, "expectedDate", e.target.value)}
                    className="w-full rounded border border-neutral-200 bg-white px-2 py-1 focus:border-olive-500 focus:ring-1 focus:ring-olive-500"
                  />
                </div>
              </div>

              {/* Branding */}
              {order.brandingMessage && (
                <div className="pt-2">
                  {renderBrandingMessage(order.brandingMessage)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
