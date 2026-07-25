import { Building2, Home, Layers } from "lucide-react";

export default function CtInventoryPanel({ summary }) {
  const projects = summary?.projectCounts || {};
  const properties = summary?.propertyCounts || {};

  const cards = [
    { label: "Active projects", value: projects.active || 0, icon: Building2 },
    { label: "Pending projects", value: projects.pending || 0, icon: Layers },
    { label: "Active listings", value: properties.active || 0, icon: Home },
    { label: "Total listings", value: properties.total || 0, icon: Home },
  ];

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Inventory to cover</h3>
        <p className="text-[10px] text-slate-500">
          Content should support live projects and listings
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2.5"
          >
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Icon className="h-3.5 w-3.5 text-emerald-600" />
              {label}
            </div>
            <p className="text-lg font-black tabular-nums text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-slate-100 px-3.5 py-3 text-[10px] text-slate-500">
        Tip: write locality guides and project explainers for high-inventory markets first.
      </div>
    </article>
  );
}
