"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/lib/products";

export default function CategoriesManager({
  categories,
  refreshData,
}: {
  categories: Category[];
  refreshData: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditing({
      slug: "",
      name_en: "",
      name_ar: "",
      name_pt: "",
      order_index: categories.length + 1,
    });
    setAdding(true);
  };

  const openEditModal = (cat: Category) => {
    setEditing({ ...cat });
    setAdding(false);
  };

  const saveCategory = async () => {
    if (!editing || !editing.slug || !editing.name_en) {
      alert("Slug and English name are required.");
      return;
    }
    
    // Slug validation: only lowercase letters, numbers, and dashes
    if (!/^[a-z0-9-]+$/.test(editing.slug)) {
      alert("Slug can only contain lowercase letters, numbers, and hyphens (e.g. 'my-category').");
      return;
    }

    setSaving(true);
    const payload = {
      slug: editing.slug.trim(),
      name_en: editing.name_en.trim(),
      name_ar: editing.name_ar?.trim() || editing.name_en.trim(),
      name_pt: editing.name_pt?.trim() || editing.name_en.trim(),
      order_index: editing.order_index || 0,
    };

    if (adding) {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) {
        alert("Error adding category: " + error.message);
      } else {
        setEditing(null);
        refreshData();
      }
    } else {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        alert("Error updating category: " + error.message);
      } else {
        setEditing(null);
        refreshData();
      }
    }
    setSaving(false);
  };

  const deleteCategory = async (id: number, slug: string) => {
    if (
      !confirm(
        `Are you sure you want to delete category '${slug}'? Make sure no products are using it first!`
      )
    )
      return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert("Error deleting category: " + error.message);
    } else {
      refreshData();
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-neutral-700">Manage Categories</h3>
        <button
          onClick={openAddModal}
          className="rounded bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700"
        >
          + Add Category
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-700">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Slug (ID)</th>
              <th className="px-4 py-3">English Name</th>
              <th className="px-4 py-3">Arabic Name</th>
              <th className="px-4 py-3">Portuguese Name</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No categories found. Add one or run the setup script.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{cat.order_index}</td>
                  <td className="px-4 py-3 text-olive-700 font-semibold">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.name_en}</td>
                  <td className="px-4 py-3">{cat.name_ar}</td>
                  <td className="px-4 py-3">{cat.name_pt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="rounded bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-700 hover:bg-olive-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id!, cat.slug!)}
                        className="rounded bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-olive-900">
                {adding ? "➕ Add Category" : `✏️ Edit Category`}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-2xl text-neutral-400 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Slug (Used in URL, e.g. vip-sets) *
                </label>
                <input
                  type="text"
                  value={editing.slug || ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  disabled={!adding}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100"
                  placeholder="vip-sets"
                />
                {!adding && (
                  <p className="mt-1 text-xs text-orange-500">
                    Slug cannot be changed after creation because products rely on it.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={editing.name_en || ""}
                  onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={editing.name_ar || ""}
                  onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Name (Portuguese)
                </label>
                <input
                  type="text"
                  value={editing.name_pt || ""}
                  onChange={(e) => setEditing({ ...editing, name_pt: e.target.value })}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editing.order_index || 0}
                  onChange={(e) =>
                    setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-4">
              <button
                onClick={() => setEditing(null)}
                className="rounded px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                disabled={saving}
                className="rounded bg-olive-600 px-6 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
