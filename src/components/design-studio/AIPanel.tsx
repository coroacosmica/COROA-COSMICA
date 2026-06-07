"use client";

import { useState } from "react";
import { useDesignStudio } from "./DesignStudio";
import { fabric } from "fabric";

export default function AIPanel() {
  const { canvas, triggerReRender } = useDesignStudio();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const SUGGESTIONS = [
    "Minimalist red circle with bold white 'COROA' text",
    "Luxury dark mode badge with gold borders",
    "Corporate blue squares arranged neatly",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateDesign = async () => {
    if (!canvas) return;
    if (mode === "text" && !prompt.trim()) {
      setError("Please describe your design first.");
      return;
    }
    if (mode === "image" && !imageBase64) {
      setError("Please upload a reference image.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt, imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate design");

      const layers = data.layers;
      if (!Array.isArray(layers)) throw new Error("Invalid format returned by AI");

      layers.forEach((layer: any) => {
        let obj: fabric.Object | null = null;
        const options = {
          left: layer.left ?? 250,
          top: layer.top ?? 250,
          fill: layer.fill ?? "#000",
          originX: "center",
          originY: "center",
        };

        switch (layer.type) {
          case "text":
            obj = new fabric.IText(layer.text || "Text", {
              ...options,
              fontSize: layer.fontSize ?? 32,
              fontFamily: layer.fontFamily ?? "Arial",
            });
            break;
          case "rect":
            obj = new fabric.Rect({
              ...options,
              width: layer.width ?? 100,
              height: layer.height ?? 100,
            });
            break;
          case "circle":
            obj = new fabric.Circle({
              ...options,
              radius: layer.radius ?? 50,
            });
            break;
          case "line":
            obj = new fabric.Line([layer.x1 ?? 0, layer.y1 ?? 0, layer.x2 ?? 100, layer.y2 ?? 100], {
              ...options,
              stroke: layer.stroke ?? "#000",
              strokeWidth: layer.strokeWidth ?? 2,
            });
            break;
        }

        if (obj) {
          canvas.add(obj);
        }
      });

      canvas.renderAll();
      triggerReRender();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 border-b border-neutral-200 bg-olive-50/50">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-olive-700 mb-3 flex items-center gap-1">
        <svg className="w-4 h-4 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Assistant
      </h3>

      <div className="flex gap-2 mb-4 bg-white p-1 rounded border border-neutral-200">
        <button
          className={`flex-1 text-xs py-1.5 font-medium rounded ${mode === "text" ? "bg-olive-100 text-olive-800" : "text-neutral-500 hover:bg-neutral-50"}`}
          onClick={() => { setMode("text"); setError(""); }}
        >
          Text
        </button>
        <button
          className={`flex-1 text-xs py-1.5 font-medium rounded ${mode === "image" ? "bg-olive-100 text-olive-800" : "text-neutral-500 hover:bg-neutral-50"}`}
          onClick={() => { setMode("image"); setError(""); }}
        >
          Image
        </button>
      </div>

      {mode === "text" ? (
        <div className="space-y-3">
          <textarea
            placeholder="Describe your design layout... (e.g. A corporate badge with gold text)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 text-sm border border-neutral-200 rounded p-2 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 outline-none resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => setPrompt(s)}
                className="text-[10px] bg-white border border-neutral-200 px-2 py-1 rounded-full text-neutral-600 hover:border-olive-400 text-left line-clamp-1"
                title={s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-300 rounded bg-white hover:bg-neutral-50 hover:border-olive-400 cursor-pointer transition-colors overflow-hidden relative">
            {imageBase64 ? (
              <img src={imageBase64} alt="Reference" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            ) : (
              <>
                <svg className="w-6 h-6 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs text-neutral-500">Upload Reference PNG/JPG</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {imageBase64 && (
            <textarea
              placeholder="Additional instructions (optional)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-12 text-sm border border-neutral-200 rounded p-2 focus:border-olive-500 outline-none resize-none"
            />
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={generateDesign}
        disabled={isGenerating}
        className="w-full mt-4 btn-primary py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Generating...
          </>
        ) : (
          mode === "text" ? "Generate Design" : "Analyze & Apply"
        )}
      </button>
    </div>
  );
}
