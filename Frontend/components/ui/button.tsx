import type { Route } from "next";
import Link from "next/link";

type ButtonProps = {
  href: Route | `#${string}`;
  label: string;
  variant?: "primary" | "secondary";
};

export function Button({ href, label, variant = "primary" }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-white text-ink hover:bg-accent"
      : "border border-white/12 bg-white/[0.05] text-white hover:border-accent/40 hover:bg-white/[0.08]";

  const className = `inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold transition ${styles}`;

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
