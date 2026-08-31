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
    <main className="relative flex h-screen overflow-hidden bg-[#071010]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-accent/15 blur-[110px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/8 blur-[100px]" />
      </div>
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
