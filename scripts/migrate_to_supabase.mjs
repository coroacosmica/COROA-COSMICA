import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import WebSocket from "ws";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

// Node 20 workaround for Supabase Realtime
globalThis.WebSocket = WebSocket;
const supabase = createClient(supabaseUrl, supabaseKey);


async function migrate() {
  const productsPath = path.resolve(process.cwd(), "src/data/products.json");
  if (!fs.existsSync(productsPath)) {
    console.error("products.json not found!");
    process.exit(1);
  }

  const rawData = fs.readFileSync(productsPath, "utf-8");
  const products = JSON.parse(rawData);

  console.log(`Found ${products.length} products. Migrating to Supabase...`);

  // Supabase has a limit on how many rows you can insert at once. We'll batch them.
  const BATCH_SIZE = 100;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE).map((p) => ({
      code: p.code,
      description: p.description,
      type: p.type,
      catalogue: p.catalogue,
      category: p.category,
      category_name: p.categoryName,
      names: p.names || null,
      image: p.image || null,
      featured: p.featured || false,
      tags: p.tags || [],
      includes: p.includes || [],
    }));

    const { error } = await supabase.from("products").upsert(batch, { onConflict: 'code' });

    if (error) {
      console.error(`Error inserting batch ${i} to ${i + BATCH_SIZE}:`, error.message);
    } else {
      console.log(`Successfully inserted products ${i} to ${i + batch.length}`);
    }
  }

  console.log("Migration complete! ✅");
}

migrate();
