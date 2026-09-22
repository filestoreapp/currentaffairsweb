import Sidebar from "@/components/admin/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page renders its own full-screen layout without the sidebar.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
