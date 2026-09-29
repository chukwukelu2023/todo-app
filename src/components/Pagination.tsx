import Link from "next/link";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Current query string params, used to keep filters when changing page. */
  params: Record<string, string>;
};

/** Page numbers to show: always first/last, plus a window around the current page. */
export function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (const p of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === "number" && p - prev > 1) result.push("…");
    result.push(p);
  }
  return result;
}

export function Pagination({ page, pageSize, total, totalPages, params }: Props) {
  const href = (p: number) => `/?${new URLSearchParams({ ...params, page: String(p) })}`;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const base = "rounded-md px-3 py-1.5 text-sm";
  const idle = `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
  const disabled = `${base} border border-slate-200 bg-white text-slate-300`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span>{" "}
        of <span className="font-medium">{total}</span>
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {page > 1 ? (
          <Link href={href(page - 1)} className={idle}>
            Prev
          </Link>
        ) : (
          <span className={disabled}>Prev</span>
        )}
        {pageWindow(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={p === page ? `${base} bg-blue-600 font-medium text-white` : idle}
            >
              {p}
            </Link>
          ),
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={idle}>
            Next
          </Link>
        ) : (
          <span className={disabled}>Next</span>
        )}
      </nav>
    </div>
  );
}
