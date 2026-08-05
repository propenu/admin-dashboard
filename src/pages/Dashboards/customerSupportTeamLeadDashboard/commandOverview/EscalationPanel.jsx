import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  Inbox,
  Loader2,
  Mail,
  Send,
  UserRound,
} from "lucide-react";

const STAGES = [
  { id: "staff_action", label: "Staff action", desc: "Work on cases", icon: UserRound },
  { id: "team_lead_review", label: "TL review", desc: "Review & validate", icon: Eye },
  { id: "head_inbox", label: "Head inbox", desc: "Receives report", icon: Mail },
];

export default function EscalationPanel({
  reportPack,
  workflow,
  onSendReport,
  onItemClick,
  submitting,
}) {
  const [selected, setSelected] = useState(null);
  const items = reportPack?.items || [];
  const stage = workflow?.currentStage || "staff_action";
  const stageIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.id === stage),
  );
  const canSend = items.some((i) => i.available) || Boolean(reportPack?.reportTextReady);

  return (
    <section
      id="tl-head-report"
      className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
    >
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
          Escalate to Support Head
        </p>
        <h2 className="mt-0.5 text-sm font-black text-slate-950">Head Report Pack</h2>
        <p className="text-[11px] text-slate-500">
          Built from live unassigned, SLA, stuck & staff load signals
        </p>
      </div>

      <ul className="space-y-1.5">
        {items.map((item) => {
          const active = selected === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={!item.available}
                onClick={() => {
                  setSelected(item.id);
                  onItemClick?.(item);
                }}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-45 ${
                  active
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                }`}
              >
                <CheckCircle2
                  size={16}
                  className={item.available ? "text-emerald-600" : "text-slate-300"}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[12px] font-bold text-slate-900">{item.label}</p>
                    {item.available ? (
                      <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-[10px] text-slate-500">{item.description}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={!canSend || submitting}
        onClick={onSendReport}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-55"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        Send Report to Support Head
      </button>
      <p className="mt-1.5 text-center text-[10px] text-slate-400" aria-live="polite">
        {reportPack?.lastSubmittedAt
          ? `Last sent ${new Date(reportPack.lastSubmittedAt).toLocaleString("en-IN")}${
              reportPack.submittedBy ? ` · ${reportPack.submittedBy}` : ""
            }`
          : "Copies a ready operational summary for your parent head"}
      </p>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Report workflow
        </p>
        <ol className="grid grid-cols-3 gap-1.5">
          {STAGES.map((step, index) => {
            const Icon = step.icon;
            const done = index < stageIndex;
            const active = index === stageIndex;
            return (
              <li
                key={step.id}
                className={`rounded-xl border px-2 py-2 text-center ${
                  active
                    ? "border-emerald-300 bg-emerald-50"
                    : done
                      ? "border-emerald-100 bg-white"
                      : "border-slate-100 bg-slate-50"
                }`}
              >
                <span
                  className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full ${
                    active || done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? <Inbox size={13} /> : <Icon size={13} />}
                </span>
                <p className="text-[10px] font-bold text-slate-800">{step.label}</p>
                <p className="text-[9px] text-slate-500">{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
