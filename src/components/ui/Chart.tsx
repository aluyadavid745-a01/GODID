import { formatNaira } from "../../utils/format";

export const Chart = ({ data }: { data: Array<{ label: string; value: number }> }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="min-w-0 border border-line bg-white p-4 sm:p-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="font-display text-lg font-semibold">Revenue Trend</h3>
        <span className="font-mono text-xs text-muted">NGN</span>
      </div>
      <div className="admin-scrollbar flex h-64 items-end gap-2 overflow-x-auto sm:gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-12 flex-1 flex-col items-center gap-3">
            <div className="group relative flex w-full items-end bg-bone">
              <div className="w-full bg-palm transition hover:bg-clay" style={{ height: `${Math.max(12, (item.value / max) * 220)}px` }} />
              <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 bg-ink px-2 py-1 font-mono text-xs text-white group-hover:block">{formatNaira(item.value)}</span>
            </div>
            <span className="text-xs font-semibold text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
