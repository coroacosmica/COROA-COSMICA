export const dynamic = 'force-dynamic';
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-light text-olive-950">
        Dashboard
      </h1>
      <AdminDashboard 
        initialQuotes={[]} 
        initialProducts={[]} 
      />
    </div>
  );
}
