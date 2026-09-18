import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ label: string; value: string }>;
}

export const Select = ({ label, options, className = "", ...props }: SelectProps) => (
  <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
    {label ? <span>{label}</span> : null}
    <select className={`focus-ring min-w-0 border border-line bg-white px-4 py-3 text-sm text-ink ${className}`} {...props}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);
