import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, History, Layers, Loader2, Pencil, PlusCircle, RefreshCw, Trash2, X,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import { FIXED_PLAN_PRESETS } from "../../features/builderPlans/fixedPlans";
import { useLivePermissions } from "../../utils/useLivePermissions";
import { useDeletedAccess } from "../../features/property/useDeletedAccess";
import BrandSelect from "./BrandSelect";

const PAGE_SIZE = 20;

const ACTIONS = {
  created: { label: "Created", icon: PlusCircle, tone: "bg-emerald-100 text-emerald-700" },
  updated: { label: "Edited", icon: Pencil, tone: "bg-sky-100 text-sky-700" },
  deleted: { label: "Deleted", icon: Trash2, tone: "bg-rose-100 text-rose-700" },
};

const PLAN_FILTER_OPTIONS = [
  { value: "", label: "All plans", hint: "Every subscription plan", icon: Layers, tone: "bg-emerald-100 text-emerald-700" },
  ...FIXED_PLAN_PRESETS.map((preset) => ({
    value: preset.code, label: preset.title, hint: preset.code, icon: preset.icons[0], tone: preset.iconWrap,
  })),
];

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "All actions", hint: "Created, edited and deleted", icon: History, tone: "bg-slate-100 text-slate-600" },
  { value: "created", label: "Created", hint: "New plans", icon: PlusCircle, tone: ACTIONS.created.tone },
  { value: "updated", label: "Edited", hint: "Price, discount or duration changes", icon: Pencil, tone: ACTIONS.updated.tone },
  { value: "deleted", label: "Deleted", hint: "Plans removed permanently", icon: Trash2, tone: ACTIONS.deleted.tone },
];

const AREA_ACTIONS = {
  editedSubscriptions: ["created", "updated"],
  deletedSubscriptions: ["deleted"],
};

const MONEY_FIELDS = new Set(["price", "discount", "finalPrice"]);
const PLACEMENTS = { prime: "Prime", featured: "Top Selling", none: "None" };
const LOCATION_RULES = { all_india: "All India", team_picks: "Team chooses", fixed: "Selected cities", project_city: "Project's own city (old)" };
const START_MODES = { auto: "As soon as payment is done", team: "When our team starts it" };

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(Number(value || 0));

function formatValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (MONEY_FIELDS.has(field)) return money(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field === "mainPlacement") return PLACEMENTS[value] || value;
  if (field === "locationRule") return LOCATION_RULES[value] || value;
  if (field === "startMode") return START_MODES[value] || value;
  return String(value);
}

const dateTime = (value) => new Date(value).toLocaleString("en-IN", {
  day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
});

const changeFor = (entry, field) => (entry.changes || []).find((change) => change.field === field);

/** Price shown in the table: new price for create/edit, last price for delete. */
function priceCell(entry) {
  const final = changeFor(entry, "finalPrice") || changeFor(entry, "price");
  if (!final) return { main: "—" };
  if (entry.action === "created") return { main: money(final.to) };
  if (entry.action === "deleted") return { main: money(final.from), note: "at deletion" };
  return { main: money(final.to), old: money(final.from) };
}

function pageNumbers(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ["gap", n] : [n]));
}

function ConfirmDeleteEntry({ entry, deleting, onCancel, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 z-[10001] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && !deleting && onCancel()}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animation: "historyPop .18s ease-out" }}>
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle size={18} /></span>
          <div>
            <p className="text-[14px] font-semibold text-slate-900">Delete this history entry?</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              The “{(ACTIONS[entry.action] || ACTIONS.updated).label}” record for <b>{entry.planTitle || entry.planCode}</b> from {dateTime(entry.createdAt)} will be removed from the database permanently.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" disabled={deleting} onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">Keep</button>
          <button type="button" disabled={deleting} onClick={onConfirm} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ConfirmDeleteAll({ total, scope, deleting, onCancel, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 z-[10001] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && !deleting && onCancel()}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ animation: "historyPop .18s ease-out" }}>
        <div className="flex items-start gap-3 bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-4 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15"><AlertTriangle size={18} /></span>
          <div>
            <p className="text-[14px] font-semibold">Delete {total} history {total === 1 ? "entry" : "entries"}?</p>
            <p className="text-[10px] text-rose-50">This removes them from the database permanently.</p>
          </div>
        </div>
        <div className="space-y-2 px-5 py-4 text-[11px] leading-5 text-slate-600">
          <p>Deleting: <b className="text-slate-800">{scope}</b></p>
          <p>The plans themselves are not changed. Only their history records are removed, and this can't be undone.</p>
        </div>
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" disabled={deleting} onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">Keep history</button>
          <button type="button" disabled={deleting} onClick={onConfirm} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-[11px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? "Deleting…" : `Delete all ${total}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function EntryDrawer({ entry, canDelete, onClose, onDelete }) {
  const actionMeta = ACTIONS[entry.action] || ACTIONS.updated;
  const Icon = actionMeta.icon;
  const preset = FIXED_PLAN_PRESETS.find((p) => p.code === entry.planCode);
  const PlanIcon = preset?.icons[0] || Layers;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end bg-slate-950/35 backdrop-blur-[2px]" style={{ animation: "historyFade .18s ease-out" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="flex h-dvh w-[min(100vw,480px)] flex-col bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl" style={{ animation: "historySlide .24s cubic-bezier(.2,.8,.2,1)" }}>
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:rounded-tl-3xl">
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${actionMeta.tone}`}><Icon size={18} /></span>
            <div>
              <p className="text-[10px] uppercase tracking-[.16em] text-[#27AE60]">History entry</p>
              <h2 className="text-[15px] font-semibold text-slate-900">Plan {actionMeta.label.toLowerCase()}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2.5">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${preset?.iconWrap || "bg-emerald-100 text-emerald-700"}`}><PlanIcon size={16} /></span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-slate-900">{entry.planTitle || preset?.title || entry.planCode}</p>
                <p className="font-mono text-[10px] text-slate-500">{entry.planCode}</p>
              </div>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${actionMeta.tone}`}>{actionMeta.label}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px]">
              <div><dt className="text-[9px] uppercase tracking-wider text-slate-400">When</dt><dd className="mt-0.5 font-medium text-slate-800">{dateTime(entry.createdAt)}</dd></div>
              <div><dt className="text-[9px] uppercase tracking-wider text-slate-400">Fields</dt><dd className="mt-0.5 font-medium text-slate-800">{entry.changes?.length || 0}</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Done by</p>
            <p className="mt-1 text-[13px] font-semibold text-slate-900">{entry.actor?.name || entry.actor?.email || "Unknown"}</p>
            {entry.actor?.email ? <p className="text-[11px] text-slate-500">{entry.actor.email}</p> : null}
            {entry.actor?.role ? <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium capitalize text-[#219653]">{entry.actor.role.replace(/_/g, " ")}</span> : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <p className="border-b border-slate-100 px-4 py-2.5 text-[9px] uppercase tracking-wider text-slate-400">
              {entry.action === "created" ? "Values set" : entry.action === "deleted" ? "Values at deletion" : "What changed"}
            </p>
            {entry.changes?.length ? entry.changes.map((change) => (
              <div key={change.field} className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-2 text-[11px] last:border-b-0">
                <span className="text-slate-500">{change.label || change.field}</span>
                <span className="flex flex-wrap items-center justify-end gap-1.5 text-right">
                  {entry.action === "updated" && (
                    <>
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 line-through decoration-rose-300">{formatValue(change.field, change.from)}</span>
                      <ArrowRight size={11} className="text-slate-300" />
                    </>
                  )}
                  <span className={`rounded px-1.5 py-0.5 font-medium ${entry.action === "deleted" ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-[#219653]"}`}>
                    {formatValue(change.field, entry.action === "deleted" ? change.from : change.to)}
                  </span>
                </span>
              </div>
            )) : (
              <p className="px-4 py-4 text-[11px] text-slate-400">No field details were saved for this entry.</p>
            )}
          </section>
        </div>

        {canDelete && (
          <footer className="border-t border-slate-200 bg-white px-5 py-3">
            <button type="button" onClick={() => onDelete(entry)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-100">
              <Trash2 size={13} /> Delete this entry permanently
            </button>
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  );
}

export default function BuilderPlanHistory() {
  const [params, setParams] = useSearchParams();
  const { loading: permsLoading, planAccess } = useLivePermissions();
  const historyAccess = useDeletedAccess();
  const userLoading = permsLoading || historyAccess.isLoading;
  const code = (params.get("code") || "").toUpperCase();
  const action = params.get("action") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [openEntry, setOpenEntry] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const requestRef = useRef(0);

  const allowedActions = Object.entries(AREA_ACTIONS)
    .filter(([area]) => historyAccess[area]?.view)
    .flatMap(([, actions]) => actions);
  const actionBlocked = Boolean(action) && !allowedActions.includes(action);
  const canView = allowedActions.length > 0 && !actionBlocked;
  const canDelete = Boolean(planAccess.canDeleteHistory);
  const actionOptions = ACTION_FILTER_OPTIONS.filter((option) => !option.value || allowedActions.includes(option.value));

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setFetching(true);
    setError("");
    try {
      const data = await builderPlanService.history({ code, action, page, limit: PAGE_SIZE });
      if (requestId !== requestRef.current) return;
      setItems(data.items || []);
      setMeta(data.meta || { total: 0, pages: 1 });
      setLoaded(true);
    } catch (e) {
      if (requestId !== requestRef.current) return;
      setError(e.response?.data?.message || "Could not load the history");
    } finally {
      if (requestId === requestRef.current) setFetching(false);
    }
  }, [code, action, page]);

  useEffect(() => {
    if (!userLoading && canView) load();
  }, [userLoading, canView, load]);

  const update = (next) => {
    const merged = { code, action, page: 1, ...next };
    setParams(Object.fromEntries(
      Object.entries(merged).filter(([key, value]) => value && !(key === "page" && value === 1)).map(([key, value]) => [key, String(value)]),
    ), { replace: true });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await builderPlanService.removeHistoryEntry(pendingDelete._id);
      toast.success("History entry deleted");
      setPendingDelete(null);
      setOpenEntry(null);
      if (items.length === 1 && page > 1) update({ page: page - 1 });
      else await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not delete the entry");
    } finally {
      setDeleting(false);
    }
  };

  const deleteAll = async () => {
    setDeleting(true);
    try {
      const result = await builderPlanService.removeHistory({ code, action });
      toast.success(`${result.deleted ?? 0} history ${result.deleted === 1 ? "entry" : "entries"} deleted`);
      setConfirmAll(false);
      setOpenEntry(null);
      if (page > 1) update({ page: 1 });
      else await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not delete the history");
    } finally {
      setDeleting(false);
    }
  };

  const deleteScope = [
    PLAN_FILTER_OPTIONS.find((option) => option.value === code)?.label || "All plans",
    ACTION_FILTER_OPTIONS.find((option) => option.value === action)?.label || "All actions",
  ].join(" · ");

  const rangeStart = meta.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, meta.total);
  const preset = FIXED_PLAN_PRESETS.find((entry) => entry.code === code);

  if (!userLoading && !canView) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div>
          <History size={28} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            {action === "deleted" ? "Deleted subscriptions history" : actionBlocked ? "Edited subscriptions history" : "Subscription history"} is not enabled for you
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            Please ask {historyAccess.level === "head" ? "Super Admin" : "your head"} to enable it, or raise a ticket for hierarchy access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <style>{"@keyframes historyIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}@keyframes historyFade{from{opacity:0}to{opacity:1}}@keyframes historySlide{from{transform:translateX(100%)}to{transform:none}}@keyframes historyPop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}@keyframes historyBar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}"}</style>
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <History size={20} className="text-[#27AE60]" />
              {preset ? `${preset.title} · change history` : "Plan change history"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={fetching}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-60"
          >
            <RefreshCw size={13} className={fetching ? "animate-spin" : ""} /> Refresh
          </button>
          {canDelete && meta.total > 0 && (
            <button
              type="button"
              onClick={() => setConfirmAll(true)}
              disabled={fetching}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
            >
              <Trash2 size={13} /> Delete all ({meta.total})
            </button>
          )}
          </div>
        </div>

        <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Plan</p>
            <BrandSelect title="Plan" value={code} onChange={(next) => update({ code: next })} options={PLAN_FILTER_OPTIONS} />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Action</p>
            <BrandSelect title="Action" value={action} onChange={(next) => update({ action: next })} options={actionOptions} />
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-[11px] text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={load} className="rounded-lg bg-white px-3 py-1 font-medium text-rose-600 shadow-sm hover:bg-rose-100">Try again</button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`absolute inset-x-0 top-0 h-0.5 overflow-hidden transition-opacity ${fetching && loaded ? "opacity-100" : "opacity-0"}`}>
            <div className="h-full w-1/3 bg-[#27AE60]" style={{ animation: "historyBar 1s ease-in-out infinite" }} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400">
                <tr>
                  {["Date & time", "Action", "Plan", "Done by", "Changes", "Price", ""].map((heading, index) => (
                    <th key={heading || index} className={`px-4 py-3 font-medium ${index === 6 ? "w-12" : ""}`}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 transition-opacity duration-200 ${fetching && loaded ? "opacity-60" : "opacity-100"}`}>
                {!loaded ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 7 }).map((__, cell) => (
                        <td key={cell} className="px-4 py-4"><div className="h-3 animate-pulse rounded bg-slate-100" style={{ width: cell === 6 ? 16 : `${50 + ((index + cell) % 4) * 12}%` }} /></td>
                      ))}
                    </tr>
                  ))
                ) : !items.length ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <History size={26} className="mx-auto text-slate-300" />
                      <p className="mt-2 text-[12px] text-slate-500">No history yet</p>
                      <p className="text-[10px] text-slate-400">Changes appear here after a plan is created, edited or deleted.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((entry, index) => {
                    const actionMeta = ACTIONS[entry.action] || ACTIONS.updated;
                    const Icon = actionMeta.icon;
                    const entryPreset = FIXED_PLAN_PRESETS.find((p) => p.code === entry.planCode);
                    const price = priceCell(entry);
                    const labels = (entry.changes || []).map((change) => change.label || change.field);
                    return (
                      <tr
                        key={entry._id}
                        onClick={() => setOpenEntry(entry)}
                        className="cursor-pointer align-middle transition hover:bg-emerald-50/50"
                        style={{ animation: `historyIn .2s ease-out ${Math.min(index, 10) * 15}ms both` }}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-600">{dateTime(entry.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${actionMeta.tone}`}>
                            <Icon size={11} /> {actionMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-semibold text-slate-800">{entry.planTitle || entryPreset?.title || entry.planCode}</p>
                          <p className="font-mono text-[9px] text-slate-400">{entry.planCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[11px] font-medium text-slate-700">{entry.actor?.name || entry.actor?.email || "Unknown"}</p>
                          {entry.actor?.role ? <p className="text-[9px] capitalize text-slate-400">{entry.actor.role.replace(/_/g, " ")}</p> : null}
                        </td>
                        <td className="max-w-[240px] px-4 py-3 text-[11px] text-slate-500">
                          {entry.action === "updated"
                            ? <span className="line-clamp-2">{labels.join(", ") || "—"}</span>
                            : entry.action === "created" ? "Plan created" : "Plan removed"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className={`text-[12px] font-semibold ${entry.action === "deleted" ? "text-slate-500" : "text-slate-800"}`}>{price.main}</p>
                          {price.old ? <p className="text-[9px] text-slate-400 line-through">{price.old}</p> : null}
                          {price.note ? <p className="text-[9px] text-slate-400">{price.note}</p> : null}
                        </td>
                        <td className="px-2 py-3 text-right">
                          {canDelete && (
                            <button
                              type="button"
                              title="Delete entry"
                              onClick={(e) => { e.stopPropagation(); setPendingDelete(entry); }}
                              className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {loaded && meta.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
              <p className="text-[11px] text-slate-500">
                Showing <b className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</b> of <b className="font-semibold text-slate-700">{meta.total}</b>
                {meta.pages > 1 ? <span className="text-slate-400"> · Page {page} of {meta.pages}</span> : null}
              </p>
              {meta.pages > 1 && <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1 || fetching}
                  onClick={() => update({ page: page - 1 })}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNumbers(page, meta.pages).map((n, i) => n === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-[11px] text-slate-400">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    disabled={fetching}
                    onClick={() => update({ page: n })}
                    className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-medium transition ${n === page ? "bg-[#27AE60] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-[#219653]"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= meta.pages || fetching}
                  onClick={() => update({ page: page + 1 })}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>}
            </div>
          )}
        </div>
      </div>

      {openEntry && (
        <EntryDrawer entry={openEntry} canDelete={canDelete} onClose={() => setOpenEntry(null)} onDelete={setPendingDelete} />
      )}
      {confirmAll && (
        <ConfirmDeleteAll total={meta.total} scope={deleteScope} deleting={deleting} onCancel={() => setConfirmAll(false)} onConfirm={deleteAll} />
      )}
      {pendingDelete && (
        <ConfirmDeleteEntry entry={pendingDelete} deleting={deleting} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}
