"use client";

import { useDesignStudio } from "./DesignStudio";
import { fabric } from "fabric";
import { useEffect, useState } from "react";

const PRESET_COLORS = ["#000000", "#FFFFFF", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0", "#FFEB3B", "#795548", "#607D8B", "#E91E63"];
const FONTS = ["Arial", "Georgia", "Impact", "Verdana", "Courier New"];

export default function PropertiesPanel() {
  const { canvas, activeObject, triggerReRender } = useDesignStudio();
  const [opacity, setOpacity] = useState(1);
  const [fill, setFill] = useState("#000000");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Arial");

  // Sync state from active object when selection changes
  useEffect(() => {
    if (!activeObject) return;
    setOpacity(activeObject.opacity ?? 1);
    
    // For SVG groups (stickers), we might need to tint differently, but for basic shapes fill is fine.
    const currentFill = activeObject.get("fill");
    if (typeof currentFill === "string") {
      setFill(currentFill);
    }
    
    if (activeObject.type === "i-text" || activeObject.type === "text") {
      const txtObj = activeObject as fabric.IText;
      setText(txtObj.text || "");
      setFontSize(txtObj.fontSize || 32);
      setFontFamily(txtObj.fontFamily || "Arial");
    }
  }, [activeObject]);

  const updateProp = (key: string, value: any) => {
    if (!activeObject || !canvas) return;
    activeObject.set(key, value);
    canvas.renderAll();
    triggerReRender();
  };

  if (!activeObject) {
    return (
      <div className="p-4 border-b border-neutral-200 text-center py-8">
        <p className="text-sm text-neutral-400">Select an object on the canvas to edit its properties.</p>
      </div>
    );
  }

  const isText = activeObject.type === "i-text" || activeObject.type === "text";

  return (
    <div className="p-4 border-b border-neutral-200 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Properties</h3>
        <button 
          onClick={() => {
            canvas?.remove(activeObject);
            canvas?.discardActiveObject();
            canvas?.renderAll();
            triggerReRender();
          }}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>

      {/* Color Picker */}
      {activeObject.type !== "image" && (
        <div>
          <label className="text-xs font-medium text-neutral-600 mb-1 block">Color</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {PRESET_COLORS.map(c => (
              <button 
                key={c} 
                onClick={() => { setFill(c); updateProp("fill", c); }}
                className={`w-6 h-6 rounded-full border ${fill === c ? 'border-2 border-black scale-110' : 'border-black/10'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input 
              type="color" 
              value={fill}
              onChange={(e) => { setFill(e.target.value); updateProp("fill", e.target.value); }}
              className="w-8 h-8 rounded cursor-pointer p-0 border-0"
            />
            <input 
              type="text" 
              value={fill}
              onChange={(e) => { setFill(e.target.value); updateProp("fill", e.target.value); }}
              className="text-xs border border-neutral-200 rounded px-2 py-1 uppercase w-20"
            />
          </div>
        </div>
      )}

      {/* Opacity */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium text-neutral-600">Opacity</label>
          <span className="text-xs text-neutral-500">{Math.round(opacity * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="1" 
          step="0.05"
          value={opacity}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setOpacity(val);
            updateProp("opacity", val);
          }}
          className="w-full accent-olive-600"
        />
      </div>

      {/* Text Settings */}
      {isText && (
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Text Content</label>
            <input 
              type="text" 
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                updateProp("text", e.target.value);
              }}
              className="text-sm border border-neutral-200 rounded px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600 mb-1 block">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                updateProp("fontFamily", e.target.value);
              }}
              className="text-sm border border-neutral-200 rounded px-2 py-1.5 w-full"
            >
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-neutral-600">Font Size</label>
              <span className="text-xs text-neutral-500">{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="120" 
              value={fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFontSize(val);
                updateProp("fontSize", val);
              }}
              className="w-full accent-olive-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
