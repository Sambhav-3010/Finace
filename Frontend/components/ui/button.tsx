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
      ? "bg-accent text-[#07120d] shadow-sm shadow-accent/10 hover:bg-accent/90 active:translate-y-px"
      : "border border-white/10 bg-white/[0.035] text-white/85 hover:border-accent/30 hover:bg-white/[0.065] active:translate-y-px";

  const className = `inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles}`;

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
