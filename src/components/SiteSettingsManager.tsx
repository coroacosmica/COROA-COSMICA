"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SiteSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [contact, setContact] = useState({
    email: "",
    whatsapp_numbers: [] as { label: string; number: string }[],
  });

  const [social, setSocial] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  });

  const [heroSlides, setHeroSlides] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    if (!error && data) {
      data.forEach((row) => {
        if (row.key === "contact") setContact(row.value);
        if (row.key === "social") setSocial(row.value);
        if (row.key === "hero_slides") setHeroSlides(row.value);
      });
    }
    setLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value });

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      showSuccess(`Saved ${key} successfully!`);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
          {successMsg}
        </div>
      )}

      {/* ─── Contact Settings ─── */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-100">
        <h3 className="mb-4 text-lg font-bold text-olive-900">📧 Contact Info</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-600">Contact Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <h4 className="mt-6 mb-2 text-sm font-semibold text-neutral-600">WhatsApp Numbers</h4>
        {contact.whatsapp_numbers.map((w, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Label (e.g. Egypt)"
              value={w.label}
              onChange={(e) => {
                const newW = [...contact.whatsapp_numbers];
                newW[index].label = e.target.value;
                setContact({ ...contact, whatsapp_numbers: newW });
              }}
              className="w-1/3 rounded border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Number (e.g. +2010...)"
              value={w.number}
              onChange={(e) => {
                const newW = [...contact.whatsapp_numbers];
                newW[index].number = e.target.value;
                setContact({ ...contact, whatsapp_numbers: newW });
              }}
              className="w-2/3 rounded border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                const newW = [...contact.whatsapp_numbers];
                newW.splice(index, 1);
                setContact({ ...contact, whatsapp_numbers: newW });
              }}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setContact({ ...contact, whatsapp_numbers: [...contact.whatsapp_numbers, { label: "New", number: "" }] })}
          className="mt-2 text-sm text-olive-600 font-semibold hover:underline"
        >
          + Add WhatsApp Number
        </button>

        <div className="mt-4">
          <button
            onClick={() => handleSave("contact", contact)}
            disabled={saving}
            className="rounded bg-olive-600 px-6 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
          >
            Save Contact Info
          </button>
        </div>
      </div>

      {/* ─── Social Links ─── */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-100">
        <h3 className="mb-4 text-lg font-bold text-olive-900">🌐 Social Links</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.keys(social).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-semibold text-neutral-600 capitalize">{key}</label>
              <input
                type="url"
                value={(social as any)[key]}
                onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                placeholder={`https://${key}.com/...`}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => handleSave("social", social)}
            disabled={saving}
            className="rounded bg-olive-600 px-6 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
          >
            Save Social Links
          </button>
        </div>
      </div>

      {/* ─── Hero Slides ─── */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-neutral-100">
        <h3 className="mb-4 text-lg font-bold text-olive-900">🖼️ Homepage Hero Slider</h3>
        <p className="text-sm text-neutral-500 mb-4">
          By default, the homepage uses the latest featured products. If you define slides here, they will override the default behavior.
        </p>

        {heroSlides.map((slide, index) => (
          <div key={index} className="mb-4 rounded border border-neutral-200 p-4 bg-neutral-50 relative">
            <button
              onClick={() => {
                const newSlides = [...heroSlides];
                newSlides.splice(index, 1);
                setHeroSlides(newSlides);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
            >
              ✕ Remove
            </button>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-neutral-600">Title</label>
                <input
                  type="text"
                  value={slide.title || ""}
                  onChange={(e) => {
                    const newSlides = [...heroSlides];
                    newSlides[index].title = e.target.value;
                    setHeroSlides(newSlides);
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600">Subtitle</label>
                <input
                  type="text"
                  value={slide.subtitle || ""}
                  onChange={(e) => {
                    const newSlides = [...heroSlides];
                    newSlides[index].subtitle = e.target.value;
                    setHeroSlides(newSlides);
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600">Image URL</label>
                <input
                  type="text"
                  value={slide.image || ""}
                  onChange={(e) => {
                    const newSlides = [...heroSlides];
                    newSlides[index].image = e.target.value;
                    setHeroSlides(newSlides);
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600">Link (Href)</label>
                <input
                  type="text"
                  value={slide.href || ""}
                  onChange={(e) => {
                    const newSlides = [...heroSlides];
                    newSlides[index].href = e.target.value;
                    setHeroSlides(newSlides);
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm"
                  placeholder="/catalogue"
                />
              </div>
            </div>
            {slide.image && (
              <img src={slide.image} alt="Preview" className="mt-2 h-20 w-auto rounded border" />
            )}
          </div>
        ))}

        <button
          onClick={() => setHeroSlides([...heroSlides, { title: "New Slide", subtitle: "", image: "", href: "" }])}
          className="mt-2 text-sm text-olive-600 font-semibold hover:underline"
        >
          + Add Slide
        </button>

        <div className="mt-4">
          <button
            onClick={() => handleSave("hero_slides", heroSlides)}
            disabled={saving}
            className="rounded bg-olive-600 px-6 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
          >
            Save Hero Slider
          </button>
        </div>
      </div>
    </div>
  );
}
