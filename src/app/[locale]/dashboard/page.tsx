import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import PriceDisplay from "@/components/PriceDisplay";

export const metadata = {
  title: "Dashboard | My Orders",
};

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: orders, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders", error);
  }

  return (
    <div className="mx-auto max-w-shop px-4 py-12 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-olive-900">My Orders</h1>
        <SignOutButton />
      </div>
      
      {!orders || orders.length === 0 ? (
        <div className="rounded-lg border border-olive-100 bg-white p-8 text-center text-neutral-500 shadow-sm">
          You haven&apos;t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-lg border border-olive-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-olive-100 bg-olive-50 p-4">
                <div>
                  <p className="text-sm text-neutral-500">Order #{order.id}</p>
                  <p className="text-sm font-medium text-olive-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <ul className="divide-y divide-olive-100">
                  {order.items?.map((item: { name: string; price: number; quantity: number; code: string; image: string }, index: number) => (
                    <li key={index} className="flex py-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-olive-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain object-center p-1"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-olive-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4"><PriceDisplay amount={item.price * item.quantity} /></p>
                          </div>
                          <p className="mt-1 text-sm text-neutral-500">{item.code}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-neutral-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
