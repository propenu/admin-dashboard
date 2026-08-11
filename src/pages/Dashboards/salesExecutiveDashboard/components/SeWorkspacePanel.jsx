import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";

export default function SeWorkspacePanel({
  item,
  workflowSteps = [],
  onOpenModule,
}) {
  if (!item) {
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
        <CircleDashed className="mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-bold text-slate-700">Select a work item</p>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Pick something from the queue to see status, next step, and jump into the right module.
        </p>
      </section>
    );
  }

  const nextHint =
    item.kind === "listing"
      ? item.status === "draft"
        ? "Finish listing details and submit for onboarding."
        : item.status === "pending"
          ? "Complete onboarding details until the listing goes live."
          : "Listing is live — watch views and related leads."
      : item.kind === "ticket"
        ? "Open Tickets and clear this blocker so go-live is not stuck."
        : "Open Lead Management to follow up this enquiry.";

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        <h2 className="mt-1 text-lg font-black text-slate-950">{item.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Current status
          </p>
          <p className="mt-1 text-sm font-bold capitalize text-slate-900">
            {item.kind} · {item.statusLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{nextHint}</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sales Executive workflow
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {workflowSteps.map((step) => (
              <div
                key={step.key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                  step.done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <CircleDashed className="h-4 w-4 shrink-0" />
                )}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={() => onOpenModule?.(item)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Open {item.kind === "listing" ? "Properties" : item.kind === "ticket" ? "Tickets" : "Leads"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
