import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import WebSocket from "ws";
globalThis.WebSocket = WebSocket;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("Fetching first product...");
  const { data, error } = await supabase.from("products").select("*").limit(1);
  if (error) {
    console.error("SELECT ERR:", error);
    return;
  }
  if (!data || data.length === 0) {
    console.log("No products found");
    return;
  }
  
  const product = data[0];
  console.log("Testing update on:", product.id);
  const { error: updateErr, data: resData } = await supabase.from("products").update({ price: 15.5 }).eq("id", product.id).select().single();
  
  if (updateErr) {
    console.error("UPDATE ERR:", updateErr);
  } else {
    console.log("UPDATE SUCCESS:", resData);
  }
}

test();
