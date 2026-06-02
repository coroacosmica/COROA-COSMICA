"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard({ initialQuotes, initialProducts }: { initialQuotes: any[], initialProducts: any[] }) {
  const [activeTab, setActiveTab] = useState<"quotes" | "products">("quotes");
  const [quotes, setQuotes] = useState(initialQuotes);
  const [products, setProducts] = useState(initialProducts);

  const deleteQuote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (!error) {
      setQuotes(quotes.filter((q) => q.id !== id));
    }
  };

  const updateQuoteStatus = async (id: number, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (!error) {
      setQuotes(quotes.map((q) => (q.id === id ? { ...q, status } : q)));
    }
  };

  const toggleProductStock = async (product: any) => {
    // We can use a tag for 'out-of-stock' or add an 'is_active' boolean if we updated the schema.
    // Let's assume we use 'is_active' or just toggle visibility.
    // For now, let's just log. To do this properly, we'd need an update form.
    alert("Full product editing coming soon!");
  };

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab("quotes")}
          className={`pb-2 text-lg font-medium ${
            activeTab === "quotes" ? "border-b-2 border-olive-600 text-olive-900" : "text-neutral-500"
          }`}
        >
          Quote Requests ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2 text-lg font-medium ${
            activeTab === "products" ? "border-b-2 border-olive-600 text-olive-900" : "text-neutral-500"
          }`}
        >
          Products ({products.length})
        </button>
      </div>

      {/* Quotes Tab */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <p className="text-neutral-500">No requests yet.</p>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="card bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-olive-900">
                      {quote.customer_name || "Unknown Customer"}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {quote.customer_email} | {quote.customer_phone} | {quote.customer_company}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {new Date(quote.created_at).toLocaleString()} | Locale: {quote.locale}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                      className="input-field py-1 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="btn-secondary py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="rounded bg-neutral-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-neutral-700">Message / Notes:</h4>
                  <p className="text-sm text-neutral-800">{quote.message || "No notes."}</p>
                </div>

                {quote.items && quote.items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-neutral-700">Cart Items:</h4>
                    <ul className="list-inside list-disc text-sm text-neutral-800">
                      {quote.items.map((item: any, i: number) => (
                        <li key={i}>
                          {item.name} (Code: {item.code}) - Qty: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-olive-900">Manage Products</h2>
            <button className="btn-primary" onClick={() => alert("Add Product UI coming soon!")}>
              + Add Product
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-700">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 50).map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-6 py-4 font-medium text-neutral-900">{product.code}</td>
                    <td className="px-6 py-4">{product.description.substring(0, 50)}...</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{product.type}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleProductStock(product)} className="font-medium text-olive-600 hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length > 50 && (
              <div className="p-4 text-center text-xs text-neutral-500">
                Showing first 50 products. Pagination coming soon.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
