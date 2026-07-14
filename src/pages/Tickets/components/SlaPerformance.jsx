import DashboardCard from "./DashboardCard";
import { formatMinutes } from "../utils/ticketFormatters";

export default function SlaPerformance({ overview }) {
  const firstResponse = overview.sla.avgFirstResponseMinutes;
  const resolution = overview.sla.avgResolutionMinutes;

  return (
    <DashboardCard title="SLA Performance">
      <div className="mt-1 grid gap-1 md:grid-cols-2">
        <SlaItem
          title="Average First Response Time"
          value={formatMinutes(firstResponse)}
          emptyText="No response data yet"
        />
        <SlaItem
          title="Average Resolution Time"
          value={formatMinutes(resolution)}
          emptyText="No resolved tickets yet"
          className="border-t border-slate-200 pt-1 md:border-l md:border-t-0 md:pl-1.5 md:pt-0"
        />
      </div>
    </DashboardCard>
  );
}

function SlaItem({ title, value, emptyText, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[9px] font-medium text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs font-medium leading-none text-slate-900">
        {value}
      </p>
      <p className="text-[8px] font-normal text-slate-500">{emptyText}</p>
    </div>
  );
}
