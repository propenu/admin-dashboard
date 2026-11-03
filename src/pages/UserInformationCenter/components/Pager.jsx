import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

/** Page numbers with ellipses, e.g. 1 … 4 5 6 … 12. */
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  list.forEach((n, i) => {
    if (i && n - list[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

/** Shared numbered pagination: "1–12 of 40 invoices" plus Prev / page numbers / Next. */
export default function Pager({ page, pages, total, pageSize, onChange, loading = false, noun = "items", compact = false }) {
  const safePages = Math.max(1, Number(pages) || 1);
  const current = Math.min(Math.max(1, page), safePages);
  const from = total ? (current - 1) * pageSize + 1 : 0;
  const to = Math.min(current * pageSize, total || 0);
  const go = (next) => {
    if (next >= 1 && next <= safePages && next !== current && !loading) onChange(next);
  };

  const btn = "flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${compact ? "text-[10px]" : "text-[11px]"} text-slate-500`}>
      <span className="flex items-center gap-1.5">
        {loading ? <Loader2 size={11} className="animate-spin text-[#27AE60]" /> : null}
        {total ? (
          <>
            <b className="text-slate-700">{from}–{to}</b> of <b className="text-slate-700">{total}</b> {noun}
          </>
        ) : (
          `0 ${noun}`
        )}
      </span>
      {safePages > 1 ? (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => go(current - 1)} disabled={current <= 1 || loading} title="Previous page" className={`${btn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>
            <ChevronLeft size={12} />
          </button>
          {pageList(current, safePages).map((n) =>
            typeof n === "string" ? (
              <span key={n} className="px-0.5 text-slate-300">…</span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => go(n)}
                disabled={loading && n !== current}
                aria-current={n === current ? "page" : undefined}
                className={`${btn} ${
                  n === current
                    ? "bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(39,174,96,.25)]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#27AE60] hover:text-[#219653]"
                }`}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" onClick={() => go(current + 1)} disabled={current >= safePages || loading} title="Next page" className={`${btn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}>
            <ChevronRight size={12} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
