import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, X } from "lucide-react";
import { apiClient } from "../../api/apiClient";
import { useAccessLiveUpdates } from "../../features/property/accessLive";
import PendingAccessRequests from "../../components/access/PendingAccessRequests";

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const roleLabel = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function LeadContactVisibilityPanel({ setting, saving, onToggle, onClose }) {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState({ data: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveVersion, setLiveVersion] = useState(0);

  useAccessLiveUpdates((change) => {
    if (change?.area === "leadContacts") setLiveVersion((value) => value + 1);
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiClient
      .get("/api/properties/leads/admin/contact-visibility/history", { params: { page } })
      .then((response) => {
        if (!active) return;
        setHistory({
          data: Array.isArray(response.data?.data) ? response.data.data : [],
          pagination: response.data?.pagination || { page, pages: 1, total: 0 },
        });
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || err?.response?.data?.error || "Could not load history");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, setting?.updatedAt, liveVersion]);

  const isSuperAdmin = setting?.level === "super_admin";
  const locked = !isSuperAdmin && !setting?.canManage;
  const enabled = Boolean(setting?.enabled) && !locked;
  const { pages = 1, total = 0 } = history.pagination;
  const statusTitle = isSuperAdmin
    ? enabled
      ? "Heads see full contacts"
      : "Contacts masked for heads and staff"
    : enabled
      ? "My team sees full contacts"
      : "Contacts masked for my team";

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close contact visibility"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Lead contacts
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {isSuperAdmin ? "Contact access for heads" : "Contact access for my team"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isSuperAdmin
                ? "Turn this on to let all heads see full contacts. Each head can then share them with staff who report to them."
                : "Turn this on to let staff who report to you see full lead contacts. Staff under other heads stay masked."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <PendingAccessRequests areas={["leadContacts"]} />

        <div className="border-b border-slate-100 px-5 py-4">
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
              enabled ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  enabled ? "bg-[#27AE60] text-white" : "bg-rose-100 text-rose-700"
                }`}
              >
                {enabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{statusTitle}</p>
                <p className="text-[11px] text-slate-500">
                  {locked
                    ? "Super Admin has turned contact sharing off for heads"
                    : setting?.updatedBy?.name
                      ? `Last change by ${setting.updatedBy.name} · ${formatWhen(setting.updatedAt)}`
                      : "Not changed yet"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={saving || locked}
              onClick={() => onToggle(!enabled)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
                enabled ? "bg-[#27AE60]" : "bg-slate-300"
              }`}
            >
              {saving ? (
                <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
              ) : null}
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {isSuperAdmin ? "Change history (everyone)" : "My change history"}
          </p>
          <p className="text-[11px] text-slate-400">{total} changes</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`vis-skel-${index}`} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-rose-600">{error}</p>
          ) : history.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No changes yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.data.map((row) => (
                <li
                  key={String(row._id)}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {row.actor?.name || "Unknown"}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {[roleLabel(row.actor?.roleName), row.actor?.email].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {row.scope === "team" ? "Own team" : "All heads"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatWhen(row.at)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.enabled ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {row.enabled ? "Turned on" : "Turned off"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-[11px] text-slate-500">
            Page {page} of {Math.max(1, pages)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="grid h-8 w-8 place-items-center rounded-full border border-emerald-100 bg-white text-[#0f3d2e] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-emerald-100 bg-white text-[#0f3d2e] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
