import type { ReactNode } from "react";

export const StatCard = ({ label, value, icon, tone = "light" }: { label: string; value: ReactNode; icon?: ReactNode; tone?: "light" | "dark" }) => (
  <article className={`min-w-0 border p-4 sm:p-5 ${tone === "dark" ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}>
    <div className="mb-6 flex items-start justify-between gap-4">
      <p className={`min-w-0 text-[11px] font-bold uppercase tracking-[0.1em] sm:text-xs sm:tracking-[0.14em] ${tone === "dark" ? "text-white/60" : "text-muted"}`}>{label}</p>
      {icon}
    </div>
    <div className="break-words font-display text-xl font-semibold sm:text-2xl">{value}</div>
  </article>
);
