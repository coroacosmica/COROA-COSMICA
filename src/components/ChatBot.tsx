"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { generateMockup } from "@/lib/logoMockup";

// ─── Types ─────────────────────────────────────────────────────────
interface ProductMsg {
  code: string;
  description: string;
  names: { pt?: string; en?: string; ar?: string } | null;
  image: string | null;
  price: number | null;
  prices: Record<string, number> | null;
  category: string;
  type: string;
  includes: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  products?: ProductMsg[];
  mockupUrl?: string;
  timestamp: Date;
}

// ─── Component ─────────────────────────────────────────────────────
export default function ChatBot() {
  const locale = useLocale();
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductMsg | null>(null);
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: "Hello! 👋 I'm your **Coroa Cósmica** assistant. I can help you:\n\n🎁 Find the perfect gifts\n🎨 Preview your logo on products\n🛒 Add items to your cart\n\nWhat are you looking for today?",
          timestamp: new Date(),
        },
      ]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages.length]);

  // ─── Send message ────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: data.reply,
        products: data.products?.length > 0 ? data.products : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          text: "Sorry, I couldn't process that. Please try again! 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, locale]);

  // ─── Handle logo upload ──────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);

    setMessages((prev) => [
      ...prev,
      {
        id: `u-logo-${Date.now()}`,
        role: "user",
        text: `📎 Uploaded logo: ${file.name}`,
        timestamp: new Date(),
      },
      {
        id: `b-logo-${Date.now()}`,
        role: "bot",
        text: "Logo received! ✅ Now click the **🎨 Preview** button on any product below to see your logo on it. If you don't see products yet, just tell me what you're looking for!",
        timestamp: new Date(),
      },
    ]);
  };

  // ─── Generate mockup ────────────────────────────────────────────
  const handleMockup = async (product: ProductMsg) => {
    if (!logoFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-nolog-${Date.now()}`,
          role: "bot",
          text: "Please upload your logo first using the 📎 button! 🎨",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setGeneratingMockup(true);
    setSelectedProduct(product);

    try {
      const productImageUrl = product.image || `/images/products/${product.code}.png`;
      const mockupUrl = await generateMockup(productImageUrl, logoFile);

      const productName =
        product.names?.en || product.names?.pt || product.description?.substring(0, 40) || product.code;

      setMessages((prev) => [
        ...prev,
        {
          id: `b-mock-${Date.now()}`,
          role: "bot",
          text: `Here's how your logo looks on **${productName}**! 🎨`,
          mockupUrl,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Mockup error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-mockerr-${Date.now()}`,
          role: "bot",
          text: "Sorry, I couldn't generate the mockup. The product image might not be available. Try another product! 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setGeneratingMockup(false);
      setSelectedProduct(null);
    }
  };

  // ─── Add to cart ─────────────────────────────────────────────────
  const handleAddToCart = (product: ProductMsg) => {
    const name =
      product.names?.en || product.names?.pt || product.description?.substring(0, 40) || product.code;
    const imageSrc = product.image || `/images/products/${product.code}.png`;

    addItem({
      code: product.code,
      name,
      image: imageSrc,
      price: product.price ?? 0,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `b-cart-${Date.now()}`,
        role: "bot",
        text: `✅ **${name}** added to your cart! Keep browsing or open the cart to checkout.`,
        timestamp: new Date(),
      },
    ]);
  };

  // ─── Render markdown-lite (bold only) ────────────────────────────
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  // ─── Product card ────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: ProductMsg }) => {
    const name =
      product.names?.en || product.names?.pt || product.description?.substring(0, 40) || product.code;
    const imageSrc = product.image || `/images/products/${product.code}.png`;
    const isGenerating = generatingMockup && selectedProduct?.code === product.code;

    return (
      <div className="flex gap-2 rounded-lg border border-olive-200 bg-white p-2 shadow-sm">
        <div className="relative h-16 w-16 shrink-0 rounded bg-neutral-50">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain p-1"
            sizes="64px"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-neutral-900">{name}</p>
          <p className="text-[10px] text-neutral-500">{product.code}</p>
          {product.price != null && product.price > 0 && (
            <p className="text-xs font-bold text-olive-700">${product.price}</p>
          )}
          <div className="mt-1 flex gap-1">
            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="rounded bg-olive-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-olive-700 transition-colors"
            >
              🛒 Add
            </button>
            {logoFile && (
              <button
                type="button"
                onClick={() => handleMockup(product)}
                disabled={isGenerating}
                className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? "⏳..." : "🎨 Preview"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ═══ FAB Button ═══ */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen
            ? "bg-neutral-700 text-white bottom-6 end-6 max-lg:bottom-20"
            : "bg-olive-600 text-white bottom-6 end-6 max-lg:bottom-20"
        }`}
        style={{ marginBottom: isOpen ? 0 : 0 }}
        aria-label={isOpen ? "Close chat" : "Open assistant"}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}

        {/* Notification pulse */}
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
          </span>
        )}
      </button>

      {/* ═══ Chat Window ═══ */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        } bottom-[5.5rem] end-6 max-lg:bottom-[6.5rem] w-[380px] max-w-[calc(100vw-2rem)] max-sm:end-0 max-sm:bottom-0 max-sm:w-full max-sm:h-full max-sm:max-w-full`}
      >
        <div className="flex h-[520px] max-sm:h-full flex-col overflow-hidden rounded-2xl max-sm:rounded-none border border-olive-200 bg-white shadow-2xl">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-olive-700 to-olive-600 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
              🌟
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Coroa Assistant</h3>
              <p className="text-[10px] text-white/70">Product recommendations & logo preview</p>
            </div>
            {logoFile && (
              <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-[9px] font-semibold">
                Logo ✓
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors max-sm:block hidden"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-neutral-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-olive-600 text-white rounded-br-md"
                      : "bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map((p) => (
                        <ProductCard key={p.code} product={p} />
                      ))}
                    </div>
                  )}

                  {/* Mockup preview */}
                  {msg.mockupUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.mockupUrl}
                        alt="Logo mockup preview"
                        className="w-full rounded-lg border border-olive-200 shadow-sm"
                      />
                    </div>
                  )}

                  <p className={`mt-1 text-[9px] ${msg.role === "user" ? "text-white/50" : "text-neutral-400"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-neutral-100">
                  <span className="h-2 w-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className="border-t border-neutral-200 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              {/* File upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  logoFile
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
                title={logoFile ? `Logo: ${logoFile.name}` : "Upload your logo"}
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about products..."
                className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-olive-400 focus:ring-1 focus:ring-olive-200 transition-colors"
              />

              {/* Send button */}
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-600 text-white hover:bg-olive-700 disabled:opacity-40 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
