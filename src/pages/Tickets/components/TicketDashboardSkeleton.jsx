export default function TicketDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-1 py-1">
      <div className="h-5 w-36 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-0.5 rounded-md border border-slate-200 bg-white p-0.5">
        <div className="grid gap-0.5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
        <div className="mt-0.5 grid gap-0.5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
        <div className="mt-0.5 h-14 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  );
}
