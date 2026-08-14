import { ArrowUpRight } from "lucide-react";

export default function SaModuleGrid({ modules = [], onOpen }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[14px]">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Operations hub</h3>
        <p className="text-[10px] text-slate-500">
          Jump to listings, leads, users, payments and care desks
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {modules.map((mod) => (
          <button
            key={mod.href}
            type="button"
            onClick={() => onOpen?.(mod.href)}
            className="group min-h-[4.5rem] rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-3 text-left transition active:scale-[0.98] active:border-emerald-300 active:bg-emerald-50 sm:min-h-0 sm:rounded-xl sm:py-2.5 sm:hover:border-emerald-300 sm:hover:bg-emerald-50"
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[12px] font-bold text-slate-800 sm:text-[11px]">{mod.label}</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-active:text-emerald-600 sm:group-hover:text-emerald-600" />
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] text-slate-500 sm:truncate">{mod.hint}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
