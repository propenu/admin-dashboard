import { ChevronRight, ListChecks } from "lucide-react";

export default function SaFollowUpPanel({ onOpen, allTracksHref }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <ListChecks size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900">Client Progress Queue</h3>
            <p className="text-[10px] text-slate-500">
              Open the workspace for user journey, roles, and inventory care lists
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen?.(allTracksHref || "/follow-up-tracking")}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Open Client Progress Queue <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
