import { ArrowUpRight } from "lucide-react";
import { saInset, saSurface, saSurfaceHover } from "../dashboardSurface";

export default function SaModuleGrid({ modules = [], onOpen }) {
  return (
    <article className={`overflow-hidden rounded-2xl ${saSurface}`}>
      <header className="border-b border-emerald-50 px-3.5 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Hub</p>
        <h3 className="text-xs font-semibold text-[#0f3d2e]">Operations hub</h3>
        <p className="text-[10px] text-[#5c7d6d]">
          Jump to listings, leads, users, payments and care desks
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {modules.map((mod) => (
          <button
            key={mod.href}
            type="button"
            onClick={() => onOpen?.(mod.href)}
            className={`group min-h-[4.5rem] rounded-2xl px-3 py-3 text-left active:scale-[0.98] active:border-[#27AE60] active:bg-[#f4fbf7] sm:min-h-0 sm:rounded-xl sm:py-2.5 ${saInset} ${saSurfaceHover}`}
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[12px] font-semibold text-[#0f3d2e] sm:text-[11px]">{mod.label}</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-300 group-active:text-emerald-600 sm:group-hover:text-emerald-600" />
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] text-[#5c7d6d] sm:truncate">{mod.hint}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
