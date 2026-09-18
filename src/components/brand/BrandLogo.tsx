import { Link } from "react-router-dom";
import logo from "../../assets/dd.png";

type BrandLogoSize = "sm" | "md" | "lg";

const imageSizes: Record<BrandLogoSize, string> = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

const textSizes: Record<BrandLogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export const BrandLogo = ({ to, size = "md", stacked = false, invert = false, label = "GODID" }: { to?: string; size?: BrandLogoSize; stacked?: boolean; invert?: boolean; label?: string }) => {
  const content = (
    <span className={`inline-flex ${stacked ? "flex-col items-start gap-2" : "items-center gap-3"}`}>
      <span className={`${imageSizes[size]} grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white/85 p-1.5 shadow-soft ring-1 ${invert ? "ring-white/15" : "ring-line/80"}`}>
        <img src={logo} alt="" className="h-full w-full object-contain" />
      </span>
      <span className={`font-display font-bold tracking-tight ${textSizes[size]} ${invert ? "text-white" : "text-ink"}`}>{label}</span>
    </span>
  );

  if (to) return <Link to={to} aria-label="GODID home" className="focus-ring inline-flex">{content}</Link>;
  return <span aria-label={label} className="inline-flex">{content}</span>;
};
