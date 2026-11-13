import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, Search, Table2, X } from "lucide-react";
import { toast } from "sonner";
import { useDataLibraryTable } from "../hooks/useDataLibrary";
import { exportDataLibraryTable } from "../../../features/dataLibrary/dataLibraryService";

const LEAD_FIRST = [
  "platform",
  "full_name",
  "phone_number",
  "email",
  "what_is_your_current_area",
  "what_is_your_budget_for_a_villa",
];

export default function DataTableView({ item, view = "table", onClose, asPage = false }) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const tab = view === "document" ? "document" : "table";
  const pageSize = 12;

  const documentUrl = item.sourceType === "link" ? item.link : item.file?.url;
  const isPdf = item.docType === "pdf" || /\.pdf($|\?)/i.test(documentUrl || "");
  const isImage = item.docType === "image";

  const savedRows = Math.min(item.table?.rowCount || 2000, 2000);
  const { data, isLoading } = useDataLibraryTable(
    item._id,
    { page: 1, limit: savedRows },
    tab === "table",
  );
  const sourceColumns = data?.columns || [];
  const sourceRows = data?.rows || [];
  const columnOrder = useMemo(() => {
    const rank = (name) => {
      const key = String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[?_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const index = LEAD_FIRST.findIndex(
        (lead) => lead.replace(/_/g, " ") === key,
      );
      return index === -1 ? LEAD_FIRST.length : index;
    };
    return sourceColumns
      .map((_, index) => index)
      .sort((a, b) => rank(sourceColumns[a]) - rank(sourceColumns[b]) || a - b);
  }, [sourceColumns]);
  const columns = columnOrder.map((index) => sourceColumns[index]);
  const allRows = sourceRows.map((row) => columnOrder.map((index) => row[index]));

  const platformIndex = columns.findIndex((name) => String(name).trim().toLowerCase() === "platform");
  const platformOptions = useMemo(() => {
    if (platformIndex < 0) return [];
    return [...new Set(allRows.map((row) => String(row[platformIndex] || "").trim()).filter(Boolean))].sort();
  }, [allRows, platformIndex]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (platform && platformIndex >= 0 && String(row[platformIndex] || "").trim() !== platform) return false;
      if (!q) return true;
      return row.some((cell) => String(cell || "").toLowerCase().includes(q));
    });
  }, [allRows, search, platform, platformIndex]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDataLibraryTable(item._id, item.title);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={asPage ? "flex h-[calc(100vh-8rem)] min-h-[560px] flex-col bg-white" : "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6"}>
      <div className={asPage ? "flex min-h-0 flex-1 flex-col" : "flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"}>
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Table2 size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-gray-900">{item.title}</h2>
            <p className="text-xs text-gray-500">
              {data ? `${data.rowCount} rows · ${columns.length} columns` : "Loading table…"}
              {data?.truncated ? " · only the first 20,000 rows were saved" : ""}
            </p>
          </div>
          {tab === "table" && (
          <button
            onClick={handleExport}
            disabled={exporting || !data?.rowCount}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-60"
            style={{ background: "#27AE60" }}
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Download CSV
          </button>
          )}
          <button
            onClick={onClose}
            className={asPage ? "rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50" : "rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"}
          >
            {asPage ? "Back" : <X size={16} />}
          </button>
        </div>

        {tab === "table" && (
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-2"
        >
          <div className="relative w-full max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, campaign…"
              className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          {platformOptions.length > 1 && (
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
              aria-label="Platform"
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">Platform: All</option>
              {platformOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
          {(search || platform) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPlatform("");
                setPage(1);
              }}
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">{total} matching</span>
        </form>
        )}

        {tab === "document" ? (
          <div className="min-h-[60vh] flex-1 bg-gray-100">
            {!documentUrl ? (
              <p className="py-16 text-center text-sm text-gray-500">No file is saved for this item.</p>
            ) : isImage ? (
              <img src={documentUrl} alt={item.title} className="mx-auto max-h-[70vh] object-contain p-4" />
            ) : isPdf || item.sourceType === "link" ? (
              <iframe title={item.title} src={documentUrl} className="h-full min-h-[60vh] w-full border-0 bg-white" />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <p className="text-sm text-gray-600">This file opens in a new tab.</p>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ background: "#27AE60" }}
                  >
                    Open document
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="data-table-scroll flex-1 overflow-auto">
          <style>{`
            .data-table-scroll { scrollbar-color: #27AE60 #e8f8ef; scrollbar-width: thin; }
            .data-table-scroll::-webkit-scrollbar { height: 10px; width: 10px; }
            .data-table-scroll::-webkit-scrollbar-track { background: #e8f8ef; border-radius: 999px; }
            .data-table-scroll::-webkit-scrollbar-thumb { background: #27AE60; border-radius: 999px; }
          `}</style>
          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              {search || platform ? "No rows match this search." : "This document has no saved table."}
            </p>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-400">#</th>
                  {columns.map((col, i) => (
                    <th key={i} className="whitespace-nowrap border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-600">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r} className="odd:bg-white even:bg-gray-50/60">
                    <td className="border-b border-gray-100 px-3 py-1.5 text-gray-400">
                      {(safePage - 1) * pageSize + r + 1}
                    </td>
                    {columns.map((_, c) => (
                      <td key={c} className="max-w-64 truncate border-b border-gray-100 px-3 py-1.5 text-gray-800" title={row[c]}>
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        )}

        {tab === "table" && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2 text-xs text-gray-500">
            <span>
              Page {safePage} of {totalPages} · {total} rows
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
