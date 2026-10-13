"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/dashboard/auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/dashboard/workflow");

  return (
    <main className="relative flex h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 dashboard-grid" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_45%_at_50%_-12%,rgba(20,126,88,0.10),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-accent/[0.045] blur-[130px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.48)_100%)]" />
      <div className="dashboard-noise pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex h-full w-full min-w-0">
        <DashboardSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <section
          className={`min-w-0 flex-1 ${isStudio ? "overflow-hidden" : "overflow-y-auto p-5 sm:p-7 lg:p-8"}`}
        >
          {children}
        </section>
      </div>
    </main>
  );
}
