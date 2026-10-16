import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronLeft, ChevronRight, Home, Loader2, ShieldCheck, Users, X } from "lucide-react";
import {
  getDeletedAccessHistory,
  updateDeletedAccess,
} from "../../features/property/propertyService";
import { DELETED_ACCESS_KEY, useDeletedAccess } from "../../features/property/useDeletedAccess";
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

const GROUP_AREAS = {
  properties: [
    { key: "properties", label: "Deleted properties", detail: "Deleted properties page", Icon: Home },
    { key: "propertyLeads", label: "Deleted property leads", detail: "Deleted property leads page", Icon: Users },
  ],
  projects: [
    { key: "projects", label: "Deleted projects", detail: "Deleted projects page", Icon: Building2 },
    { key: "projectLeads", label: "Deleted project leads", detail: "Deleted project leads page", Icon: Users },
  ],
};

const AREA_LABELS = {
  properties: "Deleted properties",
  propertyLeads: "Deleted property leads",
  projects: "Deleted projects",
  projectLeads: "Deleted project leads",
};

function Switch({ on, busy, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy || disabled}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
        on ? "bg-[#27AE60]" : "bg-slate-300"
      }`}
    >
      {busy ? (
        <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
      ) : null}
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export default function DeletedAccessPanel({ group = "properties", onClose }) {
  const areas = GROUP_AREAS[group] || GROUP_AREAS.properties;
  const areaKeys = areas.map((area) => area.key);
  const queryClient = useQueryClient();
  const { access, level } = useDeletedAccess();
  const isSuperAdmin = level === "super_admin";
  const [page, setPage] = useState(1);
  const [saveError, setSaveError] = useState("");

  const mutation = useMutation({
    mutationFn: ({ area, enabled }) => updateDeletedAccess(area, enabled),
    onSuccess: (response) => {
      setSaveError("");
      queryClient.setQueryData(DELETED_ACCESS_KEY, response.data?.data || null);
      setPage(1);
    },
    onError: (err) => setSaveError(err?.response?.data?.error || "Could not save this change"),
  });

  const lastChangeStamp = JSON.stringify(access?.lastChanges || {});

  const historyQuery = useQuery({
    queryKey: ["deleted-access-history", group, page, lastChangeStamp],
    queryFn: async () => (await getDeletedAccessHistory(page, areaKeys)).data,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
  const history = {
    data: Array.isArray(historyQuery.data?.data) ? historyQuery.data.data : [],
    pagination: historyQuery.data?.pagination || { page, pages: 1, total: 0 },
  };
  const loading = historyQuery.isPending;
  const error = historyQuery.isError
    ? historyQuery.error?.response?.data?.error || "Could not load history"
    : "";

  const { pages = 1, total = 0 } = history.pagination;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close deleted access"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600">Deleted access</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {group === "projects" ? "Deleted project pages" : "Deleted property pages"}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">
              {isSuperAdmin ? "Access for all heads" : "Access for my team"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isSuperAdmin
                ? "Turn on to let all heads view deleted pages. Heads can then share view access with their own team. Only Super Admin can permanently delete."
                : "Turn on to let staff who report to you view these deleted pages. View only — no one except Super Admin can permanently delete."}
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

        <PendingAccessRequests areas={areaKeys} />

        <div className="space-y-2 border-b border-slate-100 px-5 py-4">
          {areas.map(({ key, label, detail, Icon }) => {
            const area = access?.[key] || {};
            const on = isSuperAdmin ? Boolean(area.headsEnabled) : Boolean(area.teamEnabled);
            const locked = !isSuperAdmin && !area.canManageTeam;
            const last = access?.lastChanges?.[key];
            const busy = mutation.isPending && mutation.variables?.area === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                  on ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      on ? "bg-[#27AE60] text-white" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{label}</p>
                    <p className="text-[11px] text-slate-500">{detail}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {locked
                        ? "Super Admin has turned this off for heads"
                        : last?.updatedBy?.name
                          ? `Last change by ${last.updatedBy.name} · ${formatWhen(last.updatedAt)}`
                          : "Not changed yet"}
                    </p>
                  </div>
                </div>
                <Switch
                  on={on && !locked}
                  busy={busy}
                  disabled={locked || mutation.isPending}
                  onChange={(enabled) => mutation.mutate({ area: key, enabled })}
                />
              </div>
            );
          })}
          {saveError ? <p className="text-xs font-semibold text-rose-600">{saveError}</p> : null}
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
                <div key={`access-skel-${index}`} className="h-14 animate-pulse rounded-xl bg-slate-100" />
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
                    <p className="truncate text-sm font-semibold text-slate-800">{row.actor?.name || "Unknown"}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {[roleLabel(row.actor?.roleName), row.actor?.email].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                      <ShieldCheck className="h-3 w-3 text-slate-400" />
                      {AREA_LABELS[row.area] || row.area}
                      {" · "}
                      {row.scope === "heads" ? "All heads" : "Own team"}
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
