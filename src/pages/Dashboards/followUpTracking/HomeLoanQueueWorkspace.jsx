import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  listHomeLoanApplications,
  updateHomeLoanApplication,
} from "../../../features/property/propertyService";
import CompletionReasonDialog from "./CompletionReasonDialog";

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: "new", label: "Assigned" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow up" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const statusClass = {
  new: "bg-amber-50 text-amber-800 border-amber-200",
  contacted: "bg-sky-50 text-sky-800 border-sky-200",
  follow_up: "bg-violet-50 text-violet-800 border-violet-200",
  converted: "bg-emerald-50 text-emerald-800 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

const requestTitle = (form) => {
  if (form?.selectedOffer?.bankName) return form.selectedOffer.bankName;
  if (form?.calculator?.type) return `${String(form.calculator.type).toUpperCase()} calculator`;
  return "Home loan form";
};

const whenLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HomeLoanQueueWorkspace({ status = "new", showAssignee = true }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [pendingDone, setPendingDone] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedId("");
  }, [status, debounced]);

  const query = useQuery({
    queryKey: ["follow-up-tracking", "home-loans", status, debounced, page],
    queryFn: async () => {
      const response = await listHomeLoanApplications({
        status,
        q: debounced,
        page,
        limit: PAGE_SIZE,
      });
      return response?.data || response;
    },
    placeholderData: (previous) => previous,
    staleTime: 20_000,
  });

  const body = query.data || {};
  const rows = Array.isArray(body.data) ? body.data : [];
  const total = Number(body.meta?.total || 0);
  const pages = Math.max(1, Number(body.meta?.pages || 1));
  const selected = rows.find((row) => row.id === selectedId) || null;
  const firstLoad = query.isLoading && !query.data;

  const changeStatus = async (row, next, completionReason) => {
    if (!row?.id || next === row.status || savingId) return;
    const needsReason = next === "converted" || next === "closed";
    if (needsReason && !completionReason) {
      setPendingDone({ row, next });
      return;
    }
    setSavingId(row.id);
    try {
      await updateHomeLoanApplication(row.id, {
        status: next,
        ...(completionReason ? { completionReason } : {}),
      });
      toast.success(needsReason ? "Home loan completed with a reason" : "Home loan updated");
      setPendingDone(null);
      await queryClient.invalidateQueries({ queryKey: ["follow-up-tracking", "home-loans"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update this home loan");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
          <p className="text-xs font-bold text-slate-900">
            {total.toLocaleString("en-IN")} home loan {total === 1 ? "form" : "forms"} · assigned to customer support
          </p>
          <label className="relative block w-full max-w-[220px]">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or mobile"
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-emerald-400"
            />
          </label>
        </header>

        {firstLoad ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="space-y-2 py-12 text-center">
            <p className="text-sm font-semibold text-rose-600">Could not load home loans</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">No home loans in this status</p>
        ) : (
          <>
            <div className="max-h-[min(62vh,640px)] overflow-auto">
              <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Applicant</th>
                    <th className="px-3 py-2.5 font-bold">Application</th>
                    <th className="px-3 py-2.5 font-bold">Account</th>
                    {showAssignee ? <th className="px-3 py-2.5 font-bold">Assigned CST</th> : null}
                    <th className="px-3 py-2.5 font-bold">Submitted</th>
                    <th className="px-3 py-2.5 font-bold">Handle</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const active = row.id === selectedId;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        className={`cursor-pointer border-t border-slate-100 ${
                          active ? "bg-emerald-50/80" : "hover:bg-emerald-50/40"
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-900">{row.fullName}</p>
                          <p className="text-[10px] text-slate-500">{row.mobileNumber}</p>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">{requestTitle(row.form)}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-800">
                            {row.kind === "new" ? "New user" : "Existing user"}
                          </p>
                          <p className="text-[10px] text-slate-500">{row.user?.accountStep || "No account yet"}</p>
                        </td>
                        {showAssignee ? (
                          <td className="px-3 py-2.5 font-semibold capitalize text-slate-800">
                            {row.assignee?.name || "Assigning"}
                          </td>
                        ) : null}
                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{whenLabel(row.createdAt)}</td>
                        <td className="px-3 py-2.5" onClick={(event) => event.stopPropagation()}>
                          <select
                            value={row.status || "new"}
                            disabled={savingId === row.id}
                            onChange={(event) => changeStatus(row, event.target.value)}
                            className={`h-8 rounded-lg border px-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-200 ${
                              statusClass[row.status] || statusClass.new
                            }`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {savingId === row.id ? (
                            <Loader2 className="ml-1 inline h-3 w-3 animate-spin text-slate-400" />
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500">
                Page {page} of {pages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 disabled:opacity-40"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </footer>
          </>
        )}
      </article>

      <aside className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm lg:sticky lg:top-3 lg:self-start">
        <header className="border-b border-slate-100 px-3.5 py-2.5">
          <p className="text-xs font-bold text-slate-900">Home loan details</p>
          <p className="text-[10px] text-slate-500">Assigned customer support case</p>
        </header>
        {!selected ? (
          <p className="px-4 py-12 text-center text-xs text-slate-400">
            Select a row to see the form and who is handling it.
          </p>
        ) : (
          <dl className="space-y-2 px-3.5 py-3 text-xs">
            {[
              ["Applicant", selected.fullName],
              ["Mobile", selected.mobileNumber],
              ["Account", selected.kind === "new" ? "New user" : "Existing user"],
              ["Account step", selected.user?.accountStep || "No account yet"],
              ["Assigned to", selected.assignee?.name || "Assigning"],
              ["Application", requestTitle(selected.form)],
              ["Bank amount", selected.form?.selectedOffer?.loanAmount],
              ["Interest", selected.form?.selectedOffer?.interest],
              ["EMI", selected.form?.selectedOffer?.monthlyEmi || selected.form?.calculator?.emi],
              ["Completed because", selected.completionReason],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="text-right font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
          </dl>
        )}
      </aside>
      <CompletionReasonDialog
        open={Boolean(pendingDone)}
        saving={Boolean(savingId)}
        title={
          pendingDone?.next === "closed"
            ? "Why was this home loan closed?"
            : "How was this home loan completed?"
        }
        onCancel={() => {
          if (!savingId) setPendingDone(null);
        }}
        onConfirm={(reason) => {
          if (pendingDone?.row) changeStatus(pendingDone.row, pendingDone.next, reason);
        }}
      />
    </div>
  );
}
