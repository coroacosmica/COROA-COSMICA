export const dynamic = 'force-dynamic';
import AdminDashboard from "@/components/AdminDashboard";
import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("admin.navbar");
  return (
    <div>
      <h1 className="mb-8 text-3xl font-light text-olive-950">
        {t("dashboard")}
      </h1>
      <AdminDashboard 
        initialQuotes={[]} 
        initialProducts={[]} 
      />
    </div>
  );
}
