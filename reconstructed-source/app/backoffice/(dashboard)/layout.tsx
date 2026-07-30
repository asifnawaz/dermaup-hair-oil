import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminProviders } from "@/components/admin/providers";
import { Sidebar } from "@/components/admin/sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/backoffice/login");

  return (
    <AdminProviders>
      <div className="min-h-screen bg-muted/20">
        <Sidebar userName={session.name} />
        <main className="pt-20 lg:pl-64 lg:pt-0">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </AdminProviders>
  );
}
