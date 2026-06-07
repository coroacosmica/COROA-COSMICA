"use client";

import { useDesignStudio } from "./DesignStudio";
import { fabric } from "fabric";

export default function LayersPanel() {
  const { canvas, activeObject, triggerReRender } = useDesignStudio();

  if (!canvas) return null;

  // Filter out the background image (index 0 usually if we added it and sent to back)
  const allObjects = canvas.getObjects();
  // The product image has selectable: false, evented: false
  const userLayers = allObjects.filter(obj => obj.selectable !== false);

  const handleSelect = (obj: fabric.Object) => {
    canvas.setActiveObject(obj);
    canvas.renderAll();
    triggerReRender();
  };

  const getLayerName = (obj: fabric.Object) => {
    if (obj.type === "i-text" || obj.type === "text") return (obj as fabric.IText).text?.substring(0, 15) || "Text";
    if (obj.type === "rect") return "Square";
    if (obj.type === "circle") return "Circle";
    if (obj.type === "line") return "Line";
    if (obj.type === "image") return "Uploaded Logo";
    if (obj.type === "group") return "Sticker";
    return obj.type;
  };

  return (
    <div className="p-4 flex-1 flex flex-col min-h-0 bg-neutral-50/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Layers Stack</h3>
        {userLayers.length > 0 && (
          <button 
            onClick={() => {
              userLayers.forEach(obj => canvas.remove(obj));
              canvas.discardActiveObject();
              triggerReRender();
            }}
            className="text-[10px] text-red-600 hover:underline uppercase tracking-wider font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {userLayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-neutral-300 rounded bg-neutral-50">
          <p className="text-xs text-neutral-400">No layers added</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto space-y-1 pr-1">
          {/* Render in reverse order so top layer is at the top of the list */}
          {[...userLayers].reverse().map((obj, idx) => {
            const isActive = activeObject === obj;
            const absoluteIdx = allObjects.indexOf(obj);
            
            return (
              <li 
                key={absoluteIdx}
                className={`flex items-center justify-between p-2 rounded border text-sm cursor-pointer transition-colors ${isActive ? 'bg-olive-100 border-olive-300 shadow-sm' : 'bg-white border-neutral-200 hover:border-olive-200 hover:bg-neutral-50'}`}
                onClick={() => handleSelect(obj)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1 rounded">#{userLayers.length - idx}</span>
                  <span className="truncate text-xs font-medium text-neutral-700">{getLayerName(obj)}</span>
                </div>
                {isActive && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      canvas.remove(obj);
                      canvas.discardActiveObject();
                      triggerReRender();
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete Layer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
