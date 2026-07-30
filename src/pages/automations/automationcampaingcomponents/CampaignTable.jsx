import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const campaignStatus = (c) => {
  const total = Number(c.total || 0);
  const waiting = Number(c.waiting || 0);
  const processing = Number(c.processing || 0) + Number(c.active || 0);
  const failed = Number(c.failed || 0);
  const completed = Number(c.completed || 0);

  if (waiting > 0 || processing > 0) {
    return { key: "running", label: "Running", className: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (total > 0 && failed === total) {
    return { key: "failed", label: "Failed", className: "bg-red-50 text-red-600 border-red-200" };
  }
  if (failed > 0 && completed > 0) {
    return { key: "partial", label: "Partial", className: "bg-orange-50 text-orange-700 border-orange-200" };
  }
  if (total > 0 && completed + failed >= total) {
    return { key: "done", label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  return { key: "idle", label: "Queued", className: "bg-slate-50 text-slate-600 border-slate-200" };
};

const MiniProgress = ({ completed = 0, failed = 0, total = 0 }) => {
  const successPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const failedPct = total > 0 ? Math.round((failed / total) * 100) : 0;
  return (
    <div className="min-w-[110px]">
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold">
        <span className="text-gray-400">Progress</span>
        <span className="text-[#27AE60]">
          {total > 0 ? `${Math.min(100, successPct + failedPct)}%` : "0%"}
        </span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-[#27AE60]" style={{ width: `${successPct}%` }} />
        <div className="h-full bg-red-400" style={{ width: `${failedPct}%` }} />
      </div>
    </div>
  );
};

export function CampaignTable({
  campaigns = [],
  page,
  pageSize,
  search,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onView,
}) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? campaigns.filter((c) =>
        String(c.campaignId || "")
          .toLowerCase()
          .includes(q),
      )
    : campaigns;

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const from = totalItems === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, totalItems);

  const go = (next) => onPageChange(Math.min(Math.max(1, next), totalPages));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            All campaigns
          </p>
          <p className="text-xs font-semibold text-gray-700">
            {totalItems.toLocaleString("en-IN")} campaign
            {totalItems === 1 ? "" : "s"}
            {q ? " matched" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search campaign ID…"
              className="h-8 w-44 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-2.5 text-xs font-medium text-gray-700 outline-none focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-[#27AE60]/15 sm:w-56"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-gray-500">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#27AE60]"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-50/90 text-[10px] uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-3 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Campaign ID</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold text-right">Total</th>
              <th className="px-3 py-2.5 font-semibold text-right">Done</th>
              <th className="px-3 py-2.5 font-semibold text-right">Failed</th>
              <th className="px-3 py-2.5 font-semibold text-right">Waiting</th>
              <th className="px-3 py-2.5 font-semibold">Progress</th>
              <th className="px-3 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-400">
                  No campaigns match your search.
                </td>
              </tr>
            ) : (
              pageRows.map((campaign, index) => {
                const status = campaignStatus(campaign);
                return (
                  <tr
                    key={campaign.campaignId}
                    className="hover:bg-[#27AE60]/[0.03] transition-colors"
                  >
                    <td className="px-3 py-2.5 tabular-nums text-gray-400">
                      {start + index + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-mono text-[11px] font-semibold text-gray-800">
                        {campaign.campaignId}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-gray-700">
                      {Number(campaign.total || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[#27AE60]">
                      {Number(campaign.completed || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-red-500">
                      {Number(campaign.failed || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-amber-500">
                      {Number(campaign.waiting || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2.5">
                      <MiniProgress
                        completed={campaign.completed}
                        failed={campaign.failed}
                        total={campaign.total}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onView(campaign)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#27AE60]/25 bg-[#27AE60]/5 px-2.5 py-1.5 text-[11px] font-bold text-[#27AE60] hover:bg-[#27AE60]/10"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5">
        <p className="text-[11px] text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {from}-{to}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {totalItems.toLocaleString("en-IN")}
          </span>
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => go(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="First page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => go(safePage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="min-w-[88px] px-2 text-center text-[11px] font-semibold text-gray-700">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => go(safePage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => go(totalPages)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
