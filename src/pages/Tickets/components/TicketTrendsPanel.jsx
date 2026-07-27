import DashboardCard from "./DashboardCard";

const formatDay = (day) => {
  if (!day) return "";
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export default function TicketTrendsPanel({
  trends = [],
  rangeLabel = "Selected period",
  isLoading = false,
  onDayClick,
}) {
  const max = Math.max(...trends.map((row) => Number(row.count) || 0), 1);
  const total = trends.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

  return (
    <DashboardCard
      title="Tickets by day"
      subtitle={`${rangeLabel} · ${total.toLocaleString("en-IN")} created`}
    >
      {isLoading ? (
        <div className="grid h-40 place-items-center text-[12px] font-semibold text-slate-400">
          Loading daily counts...
        </div>
      ) : trends.length === 0 ? (
        <div className="grid h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-400">
          No tickets created in this date range
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex h-40 items-end gap-1.5 overflow-x-auto pb-1">
            {trends.map((row) => {
              const count = Number(row.count) || 0;
              const height = Math.max(8, Math.round((count / max) * 100));
              const clickable = Boolean(onDayClick) && count > 0;
              return (
                <button
                  key={row.day}
                  type="button"
                  disabled={!clickable}
                  onClick={() =>
                    onDayClick?.({
                      createdFrom: `${row.day}T00:00:00.000`,
                      createdTo: `${row.day}T23:59:59.999`,
                    })
                  }
                  className={`flex min-w-[28px] flex-1 flex-col items-center gap-1 rounded-md px-0.5 transition ${
                    clickable ? "hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200" : "cursor-default"
                  }`}
                  title={`${row.day}: ${count} ticket${count === 1 ? "" : "s"}${
                    clickable ? " — open queue" : ""
                  }`}
                >
                  <span className="text-[10px] font-bold tabular-nums text-slate-500">
                    {count || ""}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center rounded-md bg-slate-50 px-0.5">
                    <div
                      className="w-full max-w-[22px] rounded-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {formatDay(row.day)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Daily create volume (live). Click a day bar to open that day&apos;s tickets.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
