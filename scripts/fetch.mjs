import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import WebSocket from "ws";
globalThis.WebSocket = WebSocket;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { count } = await supabase.from("products").select("*", { count: 'exact', head: true });
  console.log("Total products:", count);

  const { data: latest } = await supabase.from("products").select("code, created_at, price, prices").order("created_at", { ascending: false }).limit(5);
  console.log("Latest products:", JSON.stringify(latest, null, 2));
}

test();
