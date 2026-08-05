import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Network,
  Shield,
} from "lucide-react";

const STAGES = [
  { id: "tl_review", label: "TL review", desc: "Pods validate work", icon: Eye },
  { id: "head_action", label: "Head action", desc: "You decide next step", icon: Shield },
  { id: "ops_inbox", label: "Ops inbox", desc: "Escalate upward", icon: Network },
];

export default function HeadLeadershipPanel({
  leadershipPack,
  workflow,
  onSendOpsReport,
  onItemClick,
  submitting,
}) {
  const [selected, setSelected] = useState(null);
  const items = leadershipPack?.items || [];
  const stage = workflow?.currentStage || "tl_review";
  const stageIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.id === stage),
  );
  const canSend =
    items.some((i) => i.available) || Boolean(leadershipPack?.reportTextReady);

  return (
    <section
      id="csh-ops-report"
      className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
    >
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">
          Leadership focus
        </p>
        <h2 className="mt-0.5 text-sm font-black text-slate-950">Head action pack</h2>
        <p className="text-[11px] text-slate-500">
          Department blockers from Team Lead pods · download a visual PDF for Operations
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
                    ) : (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                        OK
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-slate-500">{item.description}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Workflow
        </p>
        <ol className="space-y-2">
          {STAGES.map((s, index) => {
            const Icon = s.icon;
            const done = index < stageIndex;
            const current = index === stageIndex;
            return (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg ${
                    current
                      ? "bg-emerald-600 text-white"
                      : done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-slate-400 ring-1 ring-slate-200"
                  }`}
                >
                  <Icon size={13} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-bold ${
                      current ? "text-emerald-800" : "text-slate-700"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <button
        type="button"
        disabled={!canSend || submitting}
        onClick={onSendOpsReport}
        className="mt-auto inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        Download Ops PDF
      </button>
      {leadershipPack?.lastSubmittedAt ? (
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Last PDF {new Date(leadershipPack.lastSubmittedAt).toLocaleString("en-IN")}
        </p>
      ) : null}
    </section>
  );
}
