import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export const DataTable = <T,>({ columns, rows, empty = "No records found." }: { columns: Column<T>[]; rows: T[]; empty?: string }) => (
  <div className="min-w-0">
    <div className="grid gap-3 md:hidden">
      {rows.length ? rows.map((row, index) => (
        <article key={index} className="grid gap-3 border border-line bg-white p-4 text-sm">
          {columns.map((column) => (
            <div key={column.key} className="grid min-w-0 gap-1 border-b border-line/70 pb-3 last:border-0 last:pb-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{column.header}</p>
              <div className="min-w-0 break-words text-ink">{column.render(row)}</div>
            </div>
          ))}
        </article>
      )) : <div className="border border-line bg-white px-4 py-10 text-center text-sm text-muted">{empty}</div>}
    </div>
    <div className="admin-scrollbar hidden overflow-x-auto border border-line bg-white md:block">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
      <thead className="bg-bone text-xs uppercase tracking-[0.12em] text-muted">
        <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-bold">{column.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row, index) => (
          <tr key={index} className="border-t border-line">
            {columns.map((column) => <td key={column.key} className="px-4 py-3 align-top">{column.render(row)}</td>)}
          </tr>
        )) : (
          <tr><td className="px-4 py-10 text-center text-muted" colSpan={columns.length}>{empty}</td></tr>
        )}
      </tbody>
      </table>
    </div>
  </div>
);
