'use client'
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-accent border-ink hover:border-accent",
  secondary: "bg-white text-ink hover:bg-bone border-line",
  ghost: "bg-transparent text-ink hover:bg-white/70 border-transparent",
  danger: "bg-red-700 text-white hover:bg-red-800 border-red-700",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  to?: string;
  href?: string;
  children: ReactNode;
}

export const Button = ({ variant = "primary", to, href, className = "", children, ...props }: ButtonProps) => {
  const classes = `focus-ring inline-flex min-h-11 min-w-0 items-center justify-center gap-2 border px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.08em] transition sm:tracking-[0.12em] ${styles[variant]} ${className}`;
  if (to) return <Link href={to} className={classes}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={classes}>{children}</a>;
  return <button className={classes} {...props}>{children}</button>;
};
