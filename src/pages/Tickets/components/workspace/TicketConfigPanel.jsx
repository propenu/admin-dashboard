import { Building2, Tags } from "lucide-react";

export default function TicketConfigPanel({
  categories = [],
  departments = [],
  isLoading,
}) {
  return (
    <div className="grid gap-1 lg:grid-cols-2">
      <ConfigCard
        title="Departments"
        icon={Building2}
        description="Teams used for routing, SLA ownership, and assignment."
        isLoading={isLoading}
        emptyText="No departments configured yet."
        items={departments.map((item) => ({
          id: item._id || item.slug,
          title: item.name,
          subtitle: item.email || item.description || item.slug,
          meta: `${item.members?.length || 0} members`,
        }))}
      />
      <ConfigCard
        title="Categories"
        icon={Tags}
        description="Issue types used by admin, customer care, users, builders, and agents."
        isLoading={isLoading}
        emptyText="No categories configured yet."
        items={categories.map((item) => ({
          id: item._id || item.slug,
          title: item.name,
          subtitle: item.department || item.description || item.slug,
          meta: item.defaultPriority || "medium",
        }))}
      />
    </div>
  );
}

function ConfigCard({ title, icon: Icon, description, items, isLoading, emptyText }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-1.5">
        <h2 className="flex items-center gap-1 text-[12px] font-medium text-slate-950">
          <Icon className="h-3.5 w-3.5 text-emerald-600" />
          {title}
        </h2>
        <p className="mt-0.5 text-[10px] text-slate-500">{description}</p>
      </div>

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <p className="p-2 text-[11px] text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-2 text-[11px] text-slate-500">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-1.5 p-1.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-slate-900">{item.title}</p>
                <p className="truncate text-[10px] text-slate-500">{item.subtitle || "-"}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium capitalize text-slate-600">
                {String(item.meta).replace(/_/g, " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
