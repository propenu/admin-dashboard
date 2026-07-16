import { Building2, Tags } from "lucide-react";
import { ticketSurface, ticketSurfaceHover } from "../ticketUi";

export default function TicketConfigPanel({
  categories = [],
  departments = [],
  isLoading,
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
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
    <section className={`overflow-hidden ${ticketSurface}`}>
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white p-4">
        <h2 className="flex items-center gap-2 text-[16px] font-black text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#27AE60] shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          {title}
        </h2>
        <p className="mt-2 text-[12px] font-medium leading-5 text-slate-500">{description}</p>
      </div>

      <div className="grid gap-2 p-3">
        {isLoading ? (
          <p className="rounded-xl bg-slate-50 p-4 text-[12px] font-semibold text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-[12px] font-semibold text-slate-500">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 ${ticketSurfaceHover}`}>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 truncate text-[12px] font-medium text-slate-500">{item.subtitle || "-"}</p>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold capitalize text-[#219653]">
                {String(item.meta).replace(/_/g, " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
