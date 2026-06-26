"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Generate a simple anonymous session ID if not exists
    let sid = localStorage.getItem("coroa_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("coroa_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!pathname || !sessionId) return;

    // We don't track admin or api routes
    if (pathname.includes("/admin") || pathname.includes("/api")) return;

    // Track page view
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "page_view",
        path: pathname,
        session_id: sessionId
      }),
    }).catch(err => console.error("Tracking failed", err));

    // If it's a product page, track product view
    if (pathname.includes("/product/")) {
      const parts = pathname.split("/");
      const productCode = decodeURIComponent(parts[parts.length - 1]);
      if (productCode) {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "product_view",
            product_code: productCode,
            session_id: sessionId
          }),
        }).catch(err => console.error("Product tracking failed", err));
      }
    }
  }, [pathname, sessionId]);

  return null; // Silent component
}
