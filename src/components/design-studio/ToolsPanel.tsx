"use client";

import { useDesignStudio } from "./DesignStudio";
import { fabric } from "fabric";

export default function ToolsPanel() {
  const { canvas } = useDesignStudio();

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Your Text Here", {
      left: 200,
      top: 200,
      fontFamily: "Arial",
      fontSize: 32,
      fill: "#000000",
      originX: "center",
      originY: "center",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 250,
      top: 250,
      width: 100,
      height: 100,
      fill: "#ff5722",
      originX: "center",
      originY: "center",
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 250,
      top: 250,
      radius: 50,
      fill: "#4caf50",
      originX: "center",
      originY: "center",
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const addLine = () => {
    if (!canvas) return;
    const line = new fabric.Line([50, 100, 200, 100], {
      left: 250,
      top: 250,
      stroke: "#2196f3",
      strokeWidth: 4,
      originX: "center",
      originY: "center",
    });
    canvas.add(line);
    canvas.setActiveObject(line);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (img) => {
      // Scale down if too big
      if (img.width && img.width > 300) {
        img.scaleToWidth(300);
      }
      img.set({
        left: 250,
        top: 250,
        originX: "center",
        originY: "center",
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      
      // Free object URL after rendering
      URL.revokeObjectURL(url);
    });
    e.target.value = ""; // reset
  };

  return (
    <div className="p-4 border-b border-neutral-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={addText} className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded hover:bg-neutral-50 hover:border-olive-500 transition-colors">
          <span className="text-xl font-serif">T</span>
          <span className="text-[10px] mt-1 font-medium">Text</span>
        </button>
        <label className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded hover:bg-neutral-50 hover:border-olive-500 transition-colors cursor-pointer">
          <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleLogoUpload} />
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <span className="text-[10px] mt-1 font-medium">Upload Logo</span>
        </label>
        <button onClick={addRect} className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded hover:bg-neutral-50 hover:border-olive-500 transition-colors">
          <div className="w-4 h-4 bg-neutral-800 border border-neutral-800"></div>
          <span className="text-[10px] mt-1 font-medium">Square</span>
        </button>
        <button onClick={addCircle} className="flex flex-col items-center justify-center p-3 border border-neutral-200 rounded hover:bg-neutral-50 hover:border-olive-500 transition-colors">
          <div className="w-4 h-4 rounded-full bg-neutral-800"></div>
          <span className="text-[10px] mt-1 font-medium">Circle</span>
        </button>
      </div>
    </div>
  );
}
