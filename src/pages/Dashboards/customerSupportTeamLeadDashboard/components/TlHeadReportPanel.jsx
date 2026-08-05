import { useMemo, useState } from "react";
import { Send, Shield } from "lucide-react";
import { toast } from "sonner";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

/**
 * Pack pod blockers for Customer Support Head — clipboard report (no new API).
 */
export default function TlHeadReportPanel({
  summary = {},
  journey = {},
  byExecutive = [],
  rangeLabel,
  leadName,
}) {
  const [sentAt, setSentAt] = useState(null);

  const metrics = useMemo(() => {
    const top = [...(byExecutive || [])]
      .map((r) => ({
        ...r,
        open: Number(r.assigned || 0) + Number(r.inProgress || 0),
      }))
      .sort((a, b) => b.open - a.open)[0];

    return [
      {
        label: "Unassigned tickets",
        value: fmt(summary.unassignedCount),
        risk: Number(summary.unassignedCount || 0) > 0,
      },
      {
        label: "SLA risk",
        value: fmt(summary.overdueCount),
        risk: Number(summary.overdueCount || 0) > 0,
      },
      {
        label: "Stuck location",
        value: fmt(journey.stuckLocation),
        risk: Number(journey.stuckLocation || 0) > 0,
      },
      {
        label: "Stuck KYC",
        value: fmt(journey.stuckKyc),
        risk: Number(journey.stuckKyc || 0) > 0,
      },
      {
        label: "CCE process open",
        value: fmt(Number(journey.assigned || 0) + Number(journey.inProgress || 0)),
        risk: Number(journey.assigned || 0) + Number(journey.inProgress || 0) > 0,
      },
      {
        label: "Top loaded CCE",
        value: top?.open ? `${top.name}` : "None",
        sub: top?.open ? `${fmt(top.open)} open` : null,
        risk: Boolean(top?.open),
      },
    ];
  }, [byExecutive, journey, summary]);

  const buildReport = () =>
    [
      "Customer Support Team Lead → Support Head report",
      `From: ${leadName || "Team Lead"}`,
      `Period: ${rangeLabel || "selected period"}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      "— Tickets —",
      `Open: ${fmt(summary.openTickets)}`,
      `Unassigned: ${fmt(summary.unassignedCount)}`,
      `SLA risk: ${fmt(summary.overdueCount)}`,
      `Reply pending: ${fmt(summary.awaitingCount)}`,
      `Pod online: ${fmt(summary.teamOnline)}/${fmt(summary.teamSize)}`,
      "",
      "— Client Progress (CCE process) —",
      `Assigned: ${fmt(journey.assigned)}`,
      `In progress: ${fmt(journey.inProgress)}`,
      `Completed: ${fmt(journey.completed)}`,
      `Stuck location: ${fmt(journey.stuckLocation)}`,
      `Stuck KYC: ${fmt(journey.stuckKyc)}`,
      "",
      "— Staff load (open A+P) —",
      ...(byExecutive || []).map(
        (r) =>
          `${r.name}: A${fmt(r.assigned)} P${fmt(r.inProgress)} D${fmt(r.completed)}`,
      ),
    ].join("\n");

  const sendReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReport());
      setSentAt(new Date());
      toast.success("Head report copied — paste to Support Head");
    } catch {
      toast.error("Unable to copy report");
    }
  };

  return (
    <section
      id="tl-head-report"
      className="flex h-full min-h-[320px] max-h-[420px] flex-col overflow-hidden rounded-[14px] border border-emerald-200 bg-white shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
    >
      <header className="flex shrink-0 items-start gap-2 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-3 py-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-emerald-600 text-white">
          <Shield size={15} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[13px] font-black text-slate-900">Head report pack</h3>
          <p className="text-[10px] text-slate-500">
            Staff → Team Lead review → Support Head
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-2.5 [scrollbar-width:thin]">
        <div className="grid grid-cols-2 gap-1.5">
          {metrics.map((item) => (
            <div
              key={item.label}
              className={`rounded-[11px] border px-2.5 py-2 ${
                item.risk
                  ? "border-amber-200/80 bg-amber-50/40"
                  : "border-slate-100 bg-slate-50/70"
              }`}
            >
              <p className="truncate text-[10px] font-semibold text-slate-500">{item.label}</p>
              <p className="mt-0.5 truncate text-[15px] font-black tabular-nums text-slate-950">
                {item.value}
              </p>
              {item.sub ? (
                <p className="text-[9px] font-semibold text-slate-400">{item.sub}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-emerald-100 p-2.5">
        <button
          type="button"
          onClick={sendReport}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-emerald-600 px-3 py-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <Send size={13} />
          Send report to Support Head
        </button>
        <p className="mt-1 text-center text-[9px] font-medium text-slate-400">
          {sentAt
            ? `Copied ${sentAt.toLocaleTimeString("en-IN")}`
            : "Copies a ready summary for your parent head"}
        </p>
      </div>
    </section>
  );
}
