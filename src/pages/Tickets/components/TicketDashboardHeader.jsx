import { ChevronDown, Plus, RefreshCw } from "lucide-react";

export default function TicketDashboardHeader({ refetch, isFetching }) {
  return (
    <header className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-lg font-medium tracking-tight text-slate-900">
          Ticket Dashboard
        </h1>
        <p className="text-[12px] font-normal text-slate-600">
          Overview of tickets and performance
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-[12px] font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New Ticket
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
