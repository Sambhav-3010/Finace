import type { Route } from "next";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" as Route },
  { label: "Solutions", href: "/#capabilities" as Route },
  { label: "Regulations", href: "/dashboard/regulations" as Route },
  { label: "Workflow", href: "/dashboard" as Route },
  { label: "Company", href: "/#capabilities" as Route },
];

export function Navbar() {
  return (
    <div className="shell pt-6">
      <div className="glass flex items-center justify-between rounded-full px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-white/90 uppercase">
          Finace
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/65 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="#" className="hidden text-sm text-white/60 sm:inline-flex">
            RBI + FATF synced
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Open Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
