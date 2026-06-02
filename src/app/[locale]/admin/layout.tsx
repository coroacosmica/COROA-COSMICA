import { cookies } from "next/headers";
import AdminLogin from "@/components/AdminLogin";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("admin_session");

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <AdminNavbar />
      <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
    </div>
  );
}
