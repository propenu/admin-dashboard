import { ExternalLink, Ticket, Users, X } from "lucide-react";
import MetricSparkline from "../../customerSupportTeamLeadDashboard/commandOverview/MetricSparkline";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

export default function TlPodDetailDrawer({
  pod,
  open,
  onClose,
  onOpenClientProgress,
  onOpenTickets,
  onOpenDirectory,
}) {
  if (!open || !pod) return null;

  const initials = String(pod.name || "T")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const stats = [
    { label: "Assigned", value: pod.assigned, tone: "text-emerald-800 bg-emerald-50" },
    { label: "In progress", value: pod.inProgress, tone: "text-emerald-900 bg-emerald-100" },
    { label: "Done", value: pod.completed, tone: "text-white bg-emerald-700" },
    { label: "Open tickets", value: pod.openTickets, tone: "text-slate-800 bg-slate-100" },
    { label: "Stuck / SLA", value: pod.stuckCases, tone: "text-orange-700 bg-orange-50" },
    { label: "CCEs", value: pod.cceCount, tone: "text-slate-700 bg-slate-50" },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-slate-950/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tl-pod-title"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl motion-safe:animate-[tlFadeUp_280ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Team Lead pod
            </p>
            <h2 id="tl-pod-title" className="truncate text-base font-black text-slate-950">
              {pod.name}
            </h2>
            <p className="truncate text-[11px] text-slate-500">
              {pod.isOnline ? "Online" : "Offline"}
              {pod.email ? ` · ${pod.email}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-xl px-2.5 py-2 ${s.tone}`}>
                <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                  {s.label}
                </p>
                <p className="mt-0.5 text-lg font-black tabular-nums">{fmt(s.value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-700">Week trend (resolved)</p>
              <MetricSparkline points={pod.trend} />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Cases = Client Progress owned by CCEs in this pod. Tickets = desk load for the
              Team Lead and their executives.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Open their work
            </p>
            <button
              type="button"
              onClick={() => onOpenClientProgress?.(pod)}
              className="flex w-full items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left text-[12px] font-bold text-emerald-800 hover:bg-emerald-100"
            >
              <Users size={15} className="shrink-0" />
              <span className="min-w-0 flex-1">
                Client Progress Queue
                <span className="mt-0.5 block text-[10px] font-semibold text-emerald-700/80">
                  Department cases for this period
                </span>
              </span>
              <ExternalLink size={14} className="shrink-0 opacity-60" />
            </button>
            <button
              type="button"
              onClick={() => onOpenTickets?.(pod)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[12px] font-bold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <Ticket size={15} className="shrink-0 text-slate-500" />
              <span className="min-w-0 flex-1">
                Ticket desk
                <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                  Jump to open tickets
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onOpenDirectory?.(pod)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[12px] font-bold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <Users size={15} className="shrink-0 text-slate-500" />
              <span className="min-w-0 flex-1">
                Team Directory
                <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                  View Team Leads & CCEs
                </span>
              </span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
