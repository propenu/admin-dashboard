import { Send, Ticket, UserRoundSearch } from "lucide-react";

const ICONS = {
  "ticket-desk": Ticket,
  "staff-analysis": UserRoundSearch,
  "head-report": Send,
};

export default function TlRoleActionNav({
  actions = [],
  onTabChange,
  onNavigate,
  onAnchor,
}) {
  if (!actions.length) return null;

  return (
    <section className="rounded-[14px] border border-emerald-100/90 bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick jumps on this page
        </p>
        <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
          Sidebar for pages · header for Overview / Directory
        </p>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = ICONS[action.id] || Ticket;
          return (
            <button
              key={action.id}
              type="button"
              title={action.hint || action.label}
              onClick={() => {
                if (action.kind === "tab") onTabChange?.(action.tab);
                else if (action.kind === "href") onNavigate?.(action.href);
                else if (action.kind === "anchor") onAnchor?.(action.anchor);
              }}
              className="flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-left text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Icon size={13} className="shrink-0 text-emerald-600" />
              <span className="truncate text-[11px] font-bold leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
