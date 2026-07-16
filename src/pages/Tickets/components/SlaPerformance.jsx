import DashboardCard from "./DashboardCard";
import { formatMinutes } from "../utils/ticketFormatters";

export default function SlaPerformance({ overview }) {
  const firstResponse = overview.sla.avgFirstResponseMinutes;
  const resolution = overview.sla.avgResolutionMinutes;

  return (
    <DashboardCard title="SLA Performance">
      <div className="mt-1 grid gap-3 md:grid-cols-2">
        <SlaItem
          title="Average First Response Time"
          minutes={firstResponse}
          value={formatMinutes(firstResponse)}
          targetMinutes={60}
          targetLabel="Target 1h"
          emptyText="No response data yet"
        />
        <SlaItem
          title="Average Resolution Time"
          minutes={resolution}
          value={formatMinutes(resolution)}
          targetMinutes={1440}
          targetLabel="Target 24h"
          emptyText="No resolved tickets yet"
        />
      </div>
    </DashboardCard>
  );
}

function SlaItem({ title, minutes, value, targetMinutes, targetLabel, emptyText }) {
  const hasData = Number(minutes) > 0;
  const percent = hasData
    ? Math.min(100, Math.round((Number(minutes) / targetMinutes) * 100))
    : 0;
  const isOverTarget = hasData && Number(minutes) > targetMinutes;
  const ringColor = isOverTarget ? "#f97316" : "#27AE60";
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex min-h-[150px] items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-white hover:shadow-[0_18px_36px_rgba(39,174,96,0.1)]">
      <div className="relative grid h-24 w-24 shrink-0 place-items-center">
        <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-[18px] font-black leading-none text-slate-950">
            {hasData ? `${percent}%` : "-"}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            SLA
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[13px] font-black leading-tight text-slate-900">{title}</p>
        <p className="mt-2 break-words text-[26px] font-black leading-none text-[#27AE60]">
          {value}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              isOverTarget
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-emerald-200 bg-emerald-50 text-[#219653]"
            }`}
          >
            {isOverTarget ? "Over target" : "Within target"}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {targetLabel}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-medium text-slate-500">
          {hasData ? "Lower time is better for SLA health." : emptyText}
        </p>
      </div>
    </div>
  );
}
