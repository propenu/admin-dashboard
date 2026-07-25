import { AlertTriangle, CheckCircle2, Lightbulb, Siren } from "lucide-react";

const severityUi = {
  high: {
    icon: Siren,
    wrap: "border-rose-200 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-600",
  },
  medium: {
    icon: AlertTriangle,
    wrap: "border-amber-200 bg-amber-50/70",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  low: {
    icon: AlertTriangle,
    wrap: "border-slate-200 bg-slate-50",
    iconWrap: "bg-slate-100 text-slate-600",
  },
  opportunity: {
    icon: CheckCircle2,
    wrap: "border-emerald-200 bg-emerald-50/70",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
};

export default function CtAlertsPanel({ alerts = [] }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Alerts & next actions</h3>
        <p className="text-[10px] text-slate-500">Editorial risks and content opportunities</p>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {!alerts.length ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Lightbulb className="h-8 w-8 text-emerald-400" />
            <p className="text-xs font-semibold text-slate-600">Pipeline looks healthy</p>
            <p className="text-[10px] text-slate-400">Keep the weekly publish cadence.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const ui = severityUi[alert.severity] || severityUi.low;
            const Icon = ui.icon;
            return (
              <div key={alert.id} className={`rounded-xl border p-2.5 ${ui.wrap}`}>
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${ui.iconWrap}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-900">{alert.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{alert.impact}</p>
                    <p className="mt-1 text-[10px] font-semibold text-emerald-700">→ {alert.action}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
