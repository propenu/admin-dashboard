import { ArrowUpRight } from "lucide-react";

export default function SaModuleGrid({ modules = [], onOpen }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
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
            className="group rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] font-bold text-slate-800">{mod.label}</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-500">{mod.hint}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
