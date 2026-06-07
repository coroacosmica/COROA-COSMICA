"use client";

import { useState } from "react";
import { useDesignStudio } from "./DesignStudio";
import { fabric } from "fabric";

const STICKER_PACKS = {
  business: ["star.svg", "target.svg", "gem.svg"],
  nature: ["leaf.svg", "sun.svg", "moon.svg"],
  fun: ["heart.svg", "crown.svg", "music.svg"],
  shapes: ["square.svg", "circle.svg", "diamond.svg"],
};

export default function StickersPanel() {
  const { canvas } = useDesignStudio();
  const [activeTab, setActiveTab] = useState<keyof typeof STICKER_PACKS>("business");

  const addSticker = (pack: string, name: string) => {
    if (!canvas) return;
    const url = `/stickers/${pack}/${name}`;
    
    fabric.loadSVGFromURL(url, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({
        left: 250,
        top: 250,
        originX: "center",
        originY: "center",
      });
      // default scale
      obj.scaleToWidth(80);
      
      canvas.add(obj);
      canvas.setActiveObject(obj);
    });
  };

  return (
    <div className="p-4 flex-1 flex flex-col min-h-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Stickers</h3>
      
      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-4 pb-1 overflow-x-auto shrink-0 scrollbar-hide">
        {(Object.keys(STICKER_PACKS) as Array<keyof typeof STICKER_PACKS>).map((pack) => (
          <button
            key={pack}
            onClick={() => setActiveTab(pack)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === pack ? "bg-olive-50 text-olive-800 border-b-2 border-olive-600" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {pack.charAt(0).toUpperCase() + pack.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 pb-4">
        {STICKER_PACKS[activeTab].map((name) => (
          <button
            key={name}
            onClick={() => addSticker(activeTab, name)}
            className="aspect-square bg-neutral-50 border border-neutral-100 rounded flex items-center justify-center p-2 hover:border-olive-400 hover:bg-olive-50 transition-colors"
            title={name.replace(".svg", "")}
          >
            <img src={`/stickers/${activeTab}/${name}`} alt={name} className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
