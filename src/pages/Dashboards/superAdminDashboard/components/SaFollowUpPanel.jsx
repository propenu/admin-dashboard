import { ChevronRight, ListChecks } from "lucide-react";

export default function SaFollowUpPanel({ onOpen, allTracksHref }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <ListChecks size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Queue</p>
            <h3 className="text-xs font-semibold text-[#0f3d2e]">Client Progress Queue</h3>
            <p className="text-[10px] text-[#5c7d6d]">
              Open the workspace for user journey, roles, and inventory care lists
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen?.(allTracksHref || "/follow-up-tracking")}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#27AE60] px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(18,161,80,0.24)] hover:bg-[#1e8f4d]"
        >
          Open Client Progress Queue <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
