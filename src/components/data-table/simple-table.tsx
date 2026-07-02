import type { ReactNode } from "react";

export interface SimpleColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface SimpleTableProps<T> {
  columns: SimpleColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyState: ReactNode;
}

export function SimpleTable<T>({
  columns,
  rows,
  getRowKey,
  emptyState,
}: SimpleTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border p-10 text-center text-sm text-muted-foreground">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-2 text-left font-medium text-muted-foreground ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-0 hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
