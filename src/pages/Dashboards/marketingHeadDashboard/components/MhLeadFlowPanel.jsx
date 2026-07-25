import { ArrowRight, Building2, Layers3, MapPinned, Radio } from "lucide-react";

const Column = ({ title, icon: Icon, items = [], empty }) => (
  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
      <Icon className="h-3.5 w-3.5 text-emerald-600" />
      {title}
    </div>
    {!items.length ? (
      <p className="py-4 text-center text-[10px] text-slate-400">{empty}</p>
    ) : (
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-2 rounded-lg border border-white bg-white px-2 py-1.5 shadow-sm"
          >
            <span className="truncate text-[11px] font-semibold text-slate-700">{item.label}</span>
            <span className="shrink-0 text-[11px] font-black tabular-nums text-emerald-700">
              {item.volume}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default function MhLeadFlowPanel({ leadFlow = {}, summary }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Lead flow</h3>
        <p className="text-[10px] text-slate-500">
          Channel → pipeline stage → property category → outcome · CTR{" "}
          {summary?.campaignCtr == null ? "N/A" : `${summary.campaignCtr}%`}
        </p>
      </header>

      <div className="flex flex-col gap-2 p-3 lg:flex-row lg:items-stretch">
        <Column
          title="Channels"
          icon={Radio}
          items={leadFlow.channels || []}
          empty="No sources"
        />
        <div className="hidden items-center justify-center lg:flex">
          <ArrowRight className="h-4 w-4 text-slate-300" />
        </div>
        <Column
          title="Pipeline"
          icon={Layers3}
          items={leadFlow.stages || []}
          empty="No stages"
        />
        <div className="hidden items-center justify-center lg:flex">
          <ArrowRight className="h-4 w-4 text-slate-300" />
        </div>
        <Column
          title="Categories"
          icon={Building2}
          items={leadFlow.categories || []}
          empty="No demand"
        />
        <div className="hidden items-center justify-center lg:flex">
          <ArrowRight className="h-4 w-4 text-slate-300" />
        </div>
        <Column
          title="Outcomes"
          icon={MapPinned}
          items={leadFlow.outcomes || []}
          empty="No conversions"
        />
      </div>
    </article>
  );
}
