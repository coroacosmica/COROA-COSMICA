export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";
import { getTranslations } from "next-intl/server";

export default async function AdminPage() {
  const t = await getTranslations("admin");

  // Fetch all quotes
  const { data: quotes, error: quotesError } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-light text-olive-950">
        Dashboard
      </h1>
      <AdminDashboard 
        initialQuotes={quotes || []} 
        initialProducts={products || []} 
      />
    </div>
  );
}
