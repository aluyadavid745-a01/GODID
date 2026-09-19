'use client'
import Link from "next/link";
import adminLogo from "../../assets/admin-logo.jpeg";
import storefrontLogo from "../../assets/storefront-logo.jpeg";

type BrandLogoSize = "sm" | "md" | "lg";

const adminSizes: Record<BrandLogoSize, string> = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

const storefrontSizes: Record<BrandLogoSize, string> = {
  sm: "h-12 w-40",
  md: "h-14 w-44",
  lg: "h-20 w-56",
};

export const BrandLogo = ({ to, size = "md", variant = "storefront", navLogoUrl }: { to?: string; size?: BrandLogoSize; variant?: "admin" | "storefront"; navLogoUrl?: string }) => {
  const isAdmin = variant === "admin";
  const content = isAdmin ? (
    <span className="inline-flex items-center gap-2.5">
      <img src={adminLogo.src ?? adminLogo} alt="" className={`${adminSizes[size]} shrink-0 rounded-md object-cover`} />
      <span className="max-w-32 font-display text-xs font-bold uppercase leading-tight tracking-[0.08em] text-ink sm:text-sm">God in Every Design</span>
    </span>
  ) : (
    <img src={navLogoUrl || (storefrontLogo.src ?? storefrontLogo)} alt="GODID — God in Every Design" className={`${storefrontSizes[size]} block shrink-0 rounded-sm object-cover object-center`} />
  );

  if (to) return <Link href={to} aria-label="GODID home" className="focus-ring inline-flex">{content}</Link>;
  return <span aria-label={isAdmin ? "GODID — God in Every Design" : undefined} className="inline-flex">{content}</span>;
};
