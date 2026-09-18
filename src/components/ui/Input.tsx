import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

export const Input = ({ label, hint, className = "", ...props }: InputProps) => (
  <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
    {label ? <span>{label}</span> : null}
    <input className={`focus-ring min-w-0 border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted ${className}`} {...props} />
    {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
  </label>
);
