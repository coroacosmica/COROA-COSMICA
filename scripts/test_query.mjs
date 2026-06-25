import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import WebSocket from "ws";
globalThis.WebSocket = WebSocket;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase.from("products").select("code, prices").limit(1);
  console.log("prices type:", typeof data[0].prices);
  console.log("prices value:", data[0].prices);
}

test();
