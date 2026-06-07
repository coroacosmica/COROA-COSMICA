"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import ToolsPanel from "./ToolsPanel";
import StickersPanel from "./StickersPanel";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";
import AIPanel from "./AIPanel";

interface DesignContextType {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  product: Product;
  triggerReRender: () => void;
  saveDesignAndAddToCart: () => void;
}

export const DesignContext = createContext<DesignContextType | null>(null);

export default function DesignStudio({ product }: { product: Product }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [tick, setTick] = useState(0); // for forcing re-renders
  const { addItem } = useCart();
  const router = useRouter();
  
  const triggerReRender = () => setTick(t => t + 1);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    
    // Load Product Image as non-editable background
    fabric.Image.fromURL(product.image, (img) => {
      // Scale to fit 500x500
      const scale = Math.min(500 / (img.width || 500), 500 / (img.height || 500));
      img.set({
        originX: "center",
        originY: "center",
        left: 250,
        top: 250,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });
      initCanvas.add(img);
      img.sendToBack();
      triggerReRender();
    });

    initCanvas.on("selection:created", (e) => { setActiveObject(e.selected?.[0] || null); triggerReRender(); });
    initCanvas.on("selection:updated", (e) => { setActiveObject(e.selected?.[0] || null); triggerReRender(); });
    initCanvas.on("selection:cleared", () => { setActiveObject(null); triggerReRender(); });
    initCanvas.on("object:added", triggerReRender);
    initCanvas.on("object:removed", triggerReRender);
    initCanvas.on("object:modified", triggerReRender);

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, [product]);

  const saveDesignAndAddToCart = () => {
    if (!canvas) return;
    
    // Deselect everything so bounding boxes aren't in the PNG
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const pngDataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1, // keep 500x500
    });
    
    const stateJson = JSON.stringify(canvas.toJSON());
    
    const customItem = {
      code: `${product.code}-custom-${Date.now()}`,
      name: `${product.name || product.code} (Custom Design)`,
      image: product.image,
      quantity: 1,
      price: product.price || 0,
      customDesign: {
        pngDataUrl,
        stateJson
      }
    };
    
    addItem(customItem, 1);
    router.push("/catalogue?openCart=true");
  };

  return (
    <DesignContext.Provider value={{ canvas, activeObject, product, triggerReRender, saveDesignAndAddToCart }}>
      <div className="flex h-full w-full flex-col md:flex-row bg-neutral-100">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 shadow-sm z-10">
          <button onClick={() => router.back()} className="text-sm font-semibold">← Back</button>
          <span className="font-semibold text-sm truncate max-w-[150px]">{product.name || product.code}</span>
          <button onClick={saveDesignAndAddToCart} className="btn-primary text-xs py-1 px-3">Save</button>
        </div>

        {/* Left Sidebar: Tools & Stickers */}
        <div className="hidden md:flex w-72 flex-col bg-white border-r border-neutral-200 shadow-sm overflow-y-auto z-10">
          <div className="p-4 border-b border-neutral-200">
            <button onClick={() => router.back()} className="text-sm font-semibold text-neutral-600 hover:text-black">← Back to Product</button>
          </div>
          <AIPanel />
          <ToolsPanel />
          <StickersPanel />
        </div>

        {/* Center: Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
          <div className="bg-white shadow-xl shadow-black/10 overflow-hidden" style={{ width: 500, height: 500 }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Sidebar: Properties & Layers */}
        <div className="hidden md:flex w-72 flex-col bg-white border-l border-neutral-200 shadow-sm overflow-y-auto z-10">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <span className="font-semibold text-sm">Design Studio</span>
            <button onClick={saveDesignAndAddToCart} className="btn-primary text-xs py-1.5 px-3">Add to Cart</button>
          </div>
          <PropertiesPanel />
          <LayersPanel />
        </div>
        
        {/* Mobile Bottom Drawer placeholder (could implement real tabs if needed) */}
        <div className="md:hidden h-64 bg-white border-t border-neutral-200 overflow-y-auto flex flex-col relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
           <div className="flex p-2 gap-2 border-b">
              <span className="font-bold text-xs p-2">Scroll for options:</span>
           </div>
           <AIPanel />
           <ToolsPanel />
           <PropertiesPanel />
           <LayersPanel />
           <StickersPanel />
        </div>
      </div>
    </DesignContext.Provider>
  );
}

export function useDesignStudio() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesignStudio must be used inside DesignStudio");
  return ctx;
}
