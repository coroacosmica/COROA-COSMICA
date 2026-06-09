export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/AdminDashboard";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/en/admin"); // Re-routes to the client layout which handles the login screen
  }

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
