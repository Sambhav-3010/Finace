import Link from "next/link";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#071010] pb-12">
      <div className="shell py-6">
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Finace Platform</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Compliance Workspace</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white"
            >
              Back to Site
            </Link>
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink">
              New Workflow Scan
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <DashboardSidebar />
          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}
