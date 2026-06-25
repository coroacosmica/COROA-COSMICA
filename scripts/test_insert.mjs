import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import WebSocket from "ws";
globalThis.WebSocket = WebSocket;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase.from("products").insert([{
    code: "TEST_DELETE_ME",
    description: "test",
    type: "product",
    category: "notebooks",
    is_active: false
  }]);
  if (error) {
    console.error("INSERT ERR:", error.message);
  } else {
    console.log("INSERT SUCCESS");
    await supabase.from("products").delete().eq("code", "TEST_DELETE_ME");
  }
}

test();
