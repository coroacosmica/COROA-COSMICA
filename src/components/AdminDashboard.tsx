"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface EditingProduct {
  id: number;
  code: string;
  description: string;
  type: string;
  category: string;
  category_name: string;
  image: string;
  featured: boolean;
  names: { pt: string; en: string; ar: string } | null;
  includes: string[];
  tags: string[];
  catalogue: string;
  is_active?: boolean;
  price: number;
}

const CATEGORIES = [
  "vip-sets",
  "cork-eco",
  "notebooks-premium",
  "notebooks-usb",
  "tech-gifts",
  "business-gifts",
  "corporate-sets",
  "promotional",
  "pens-writing",
  "accessories",
  "seasonal",
  "general",
];

export default function AdminDashboard({
  initialQuotes,
  initialProducts,
}: {
  initialQuotes: any[];
  initialProducts: any[];
}) {
  const [activeTab, setActiveTab] = useState<"quotes" | "products">("quotes");
  const [quotes, setQuotes] = useState(initialQuotes);
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ─── Quote Actions ─────────────────────────────────────────
  const deleteQuote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (!error) {
      setQuotes(quotes.filter((q) => q.id !== id));
      showSuccess("Quote deleted!");
    }
  };

  const updateQuoteStatus = async (id: number, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (!error) {
      setQuotes(quotes.map((q) => (q.id === id ? { ...q, status } : q)));
    }
  };

  // ─── Product Actions ───────────────────────────────────────
  const openEditModal = (product: any) => {
    setEditing({
      id: product.id,
      code: product.code || "",
      description: product.description || "",
      type: product.type || "product",
      category: product.category || "general",
      category_name: product.category_name || "",
      image: product.image || "",
      featured: product.featured || false,
      names: product.names || { pt: "", en: "", ar: "" },
      includes: product.includes || [],
      tags: product.tags || [],
      catalogue: product.catalogue || "",
      is_active: product.is_active !== false,
      price: product.price ?? 0,
    });
    setAdding(false);
  };

  const openAddModal = () => {
    setEditing({
      id: 0,
      code: "",
      description: "",
      type: "product",
      category: "general",
      category_name: "",
      image: "",
      featured: false,
      names: { pt: "", en: "", ar: "" },
      includes: [],
      tags: [],
      catalogue: "",
      is_active: true,
      price: 0,
    });
    setAdding(true);
  };

  const saveProduct = async () => {
    if (!editing) return;
    setSaving(true);

    const payload = {
      code: editing.code.trim(),
      description: editing.description.trim(),
      type: editing.type,
      category: editing.category,
      category_name: editing.category_name,
      image: editing.image.trim() || null,
      featured: editing.featured,
      names: editing.names,
      includes: editing.includes.filter((i) => i.trim() !== ""),
      tags: editing.tags.filter((t) => t.trim() !== ""),
      catalogue: editing.catalogue,
      price: editing.price,
    };

    if (adding) {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
      if (error) {
        alert("Error adding product: " + error.message);
      } else {
        setProducts([data, ...products]);
        setEditing(null);
        showSuccess("Product added successfully! ✅");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      if (error) {
        alert("Error updating product: " + error.message);
      } else {
        setProducts(products.map((p) => (p.id === editing.id ? data : p)));
        setEditing(null);
        showSuccess("Product updated successfully! ✅");
      }
    }
    setSaving(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to DELETE this product? This cannot be undone!")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      showSuccess("Product deleted!");
    }
  };

  const toggleFeatured = async (product: any) => {
    const newVal = !product.featured;
    const { error } = await supabase
      .from("products")
      .update({ featured: newVal })
      .eq("id", product.id);
    if (!error) {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, featured: newVal } : p)));
    }
  };

  // ─── Image Upload ─────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setEditing({ ...editing, image: data.url });
        showSuccess("Image uploaded! ✅");
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ─── Filtered Products ────────────────────────────────────
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // ─── Status Badge ─────────────────────────────────────────
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return (
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] || "bg-neutral-100 text-neutral-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-olive-900">{products.length}</p>
          <p className="text-sm text-neutral-500">Total Products</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-700">{quotes.filter((q) => q.status === "new").length}</p>
          <p className="text-sm text-neutral-500">New Requests</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-700">{quotes.filter((q) => q.status === "contacted").length}</p>
          <p className="text-sm text-neutral-500">Contacted</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-700">{quotes.filter((q) => q.status === "completed").length}</p>
          <p className="text-sm text-neutral-500">Completed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab("quotes")}
          className={`pb-2 text-lg font-medium ${
            activeTab === "quotes" ? "border-b-2 border-olive-600 text-olive-900" : "text-neutral-500"
          }`}
        >
          📋 Quote Requests ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-2 text-lg font-medium ${
            activeTab === "products" ? "border-b-2 border-olive-600 text-olive-900" : "text-neutral-500"
          }`}
        >
          📦 Products ({products.length})
        </button>
      </div>

      {/* ═══════════ QUOTES TAB ═══════════ */}
      {activeTab === "quotes" && (
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <p className="text-neutral-500">No requests yet.</p>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-olive-900">
                        {quote.customer_name || "Unknown Customer"}
                      </h3>
                      {statusBadge(quote.status)}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      📧 {quote.customer_email || "—"} &nbsp;|&nbsp; 📱 {quote.customer_phone || "—"} &nbsp;|&nbsp; 🏢 {quote.customer_company || "—"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      🕐 {new Date(quote.created_at).toLocaleString()} &nbsp;|&nbsp; 🌐 {quote.locale}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                      className="rounded border border-neutral-300 px-2 py-1 text-sm"
                    >
                      <option value="new">🆕 New</option>
                      <option value="contacted">📞 Contacted</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {quote.message && (
                  <div className="rounded bg-neutral-50 p-4">
                    <h4 className="mb-1 text-xs font-semibold text-neutral-500">MESSAGE</h4>
                    <p className="text-sm text-neutral-800">{quote.message}</p>
                  </div>
                )}

                {quote.items && quote.items.length > 0 && (
                  <div className="mt-3">
                    <h4 className="mb-1 text-xs font-semibold text-neutral-500">CART ITEMS</h4>
                    <div className="flex flex-wrap gap-2">
                      {quote.items.map((item: any, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-800"
                        >
                          {item.name || item.code} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════ PRODUCTS TAB ═══════════ */}
      {activeTab === "products" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded border border-neutral-300 px-4 py-2 text-sm"
            />
            <button
              onClick={openAddModal}
              className="rounded bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700"
            >
              + Add Product
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-700">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name (EN)</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{product.code}</td>
                    <td className="max-w-[200px] truncate px-4 py-3">
                      {product.names?.en || product.description?.substring(0, 40) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-olive-100 px-2 py-0.5 text-xs font-medium text-olive-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.type}</td>
                    <td className="px-4 py-3 font-semibold text-olive-700">${product.price ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className="text-lg"
                        title={product.featured ? "Remove from featured" : "Mark as featured"}
                      >
                        {product.featured ? "⭐" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-700 hover:bg-olive-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ EDIT / ADD MODAL ═══════════ */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-olive-900">
                {adding ? "➕ Add New Product" : `✏️ Edit: ${editing.code}`}
              </h2>
              <button onClick={() => setEditing(null)} className="text-2xl text-neutral-400 hover:text-neutral-800">
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Code */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Product Code *</label>
                <input
                  type="text"
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="e.g. CC-VIP-001"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="e.g. 19.99"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Type</label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option value="product">Product</option>
                  <option value="set">Set</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Product Image</label>
                <div className="flex flex-col gap-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label
                      className={`cursor-pointer rounded border-2 border-dashed px-4 py-3 text-center text-sm transition-colors ${
                        uploading
                          ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                          : "border-olive-300 bg-olive-50 text-olive-700 hover:border-olive-500 hover:bg-olive-100"
                      }`}
                    >
                      {uploading ? "⏳ Uploading..." : "📁 Choose Image File"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-neutral-400">Max 5MB — JPG, PNG, WebP, GIF</span>
                  </div>

                  {/* Preview */}
                  {editing.image && (
                    <div className="flex items-center gap-3">
                      <img
                        src={editing.image}
                        alt="Preview"
                        className="h-20 w-20 rounded-lg border border-neutral-200 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="flex-1">
                        <p className="truncate text-xs text-neutral-500">{editing.image}</p>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, image: "" })}
                          className="mt-1 text-xs text-red-500 hover:text-red-700"
                        >
                          ✕ Remove Image
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Or enter URL manually */}
                  <div>
                    <p className="mb-1 text-xs text-neutral-400">Or paste an image URL:</p>
                    <input
                      type="text"
                      value={editing.image}
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                      className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              {/* Names */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Name (English)</label>
                <input
                  type="text"
                  value={editing.names?.en || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, names: { ...(editing.names || { pt: "", en: "", ar: "" }), en: e.target.value } })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Name (Português)</label>
                <input
                  type="text"
                  value={editing.names?.pt || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, names: { ...(editing.names || { pt: "", en: "", ar: "" }), pt: e.target.value } })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Name (العربية)</label>
                <input
                  type="text"
                  value={editing.names?.ar || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, names: { ...(editing.names || { pt: "", en: "", ar: "" }), ar: e.target.value } })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Catalogue */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Catalogue</label>
                <input
                  type="text"
                  value={editing.catalogue}
                  onChange={(e) => setEditing({ ...editing, catalogue: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editing.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()) })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="e.g. vip, featured, cork"
                />
              </div>

              {/* Includes */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Includes (for sets — one item per line)
                </label>
                <textarea
                  value={editing.includes?.join("\n") || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, includes: e.target.value.split("\n") })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder={"Notebook\nPen\nUSB Flash Drive"}
                />
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="featured" className="text-sm text-neutral-700">
                  ⭐ Featured Product (shows on homepage)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={saving || !editing.code.trim() || !editing.description.trim()}
                className="rounded bg-olive-600 px-5 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : adding ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
