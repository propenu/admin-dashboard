import DashboardCard from "./DashboardCard";

const dayParts = (day) => {
  if (!day) return { day: "", month: "" };
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { day, month: "" };
  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).slice(0, 3),
  };
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
        <div className="grid h-40 place-items-center text-[12px] font-semibold text-[#5c7d6d]">
          Loading daily counts...
        </div>
      ) : trends.length === 0 ? (
        <div className="grid h-40 place-items-center rounded-xl border border-dashed border-[#b7e4c7] bg-[#f7fbf8] text-[12px] font-semibold text-[#5c7d6d]">
          No tickets created in this date range
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end gap-1.5 overflow-x-auto px-0.5 pb-1 pt-1">
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
                  className={`flex min-w-[28px] flex-1 shrink-0 flex-col items-center gap-1 rounded-md px-0.5 py-0.5 transition ${
                    clickable ? "hover:bg-[#f7fbf8] focus:outline-none focus:ring-2 focus:ring-[#27AE60]/20" : "cursor-default"
                  }`}
                  title={`${row.day}: ${count} ticket${count === 1 ? "" : "s"}${
                    clickable ? " — open queue" : ""
                  }`}
                >
                  <span className="h-[14px] text-[10px] font-bold leading-[14px] tabular-nums text-[#5c7d6d]">
                    {count || ""}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center rounded-md bg-[#f7fbf8] px-0.5">
                    <div
                      className="w-full max-w-[22px] rounded-md bg-[#27AE60] transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="flex h-[22px] flex-col items-center whitespace-nowrap text-[9px] font-semibold leading-[11px] text-[#5c7d6d]">
                    <span>{dayParts(row.day).day}</span>
                    <span className="font-medium uppercase text-[#8aa598]">{dayParts(row.day).month}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-medium text-[#5c7d6d]">
            Daily create volume (live). Click a day bar to open that day&apos;s tickets.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
