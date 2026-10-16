import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Phone, Search, Trash2, User } from "lucide-react";
import { getUserInDetails } from "./userInDetails";
import {
  getDeletedLeads,
  purgeAllDeletedLeads,
  purgeDeletedLead,
} from "../../../../../features/property/propertyService";
import { normalizeProjectRole } from "../../../../../utils/projectAccessControl";
import { saInset, saSurface } from "../../../../Dashboards/superAdminDashboard/dashboardSurface";

const PAGE_SIZE = 12;

const pageNumbersFor = (current, total) => {
  const count = Math.max(0, Number(total) || 0);
  const active = Math.min(Math.max(1, Number(current) || 1), Math.max(count, 1));
  if (count <= 1) return count === 1 ? [1] : [];
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(active - 2, count - 4));
  const end = Math.min(count, start + 4);
  const pages = [];
  for (let number = start; number <= end; number += 1) pages.push(number);
  if (pages[0] !== 1) pages.unshift(1);
  if (pages[pages.length - 1] !== count) pages.push(count);
  return pages;
};

const formatWhen = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const personLine = (person) => {
  if (!person?.name && !person?.roleName) return "";
  const role = person.roleName ? person.roleName.replace(/_/g, " ") : "";
  return [person.name || "Unknown", role].filter(Boolean).join(" · ");
};

const useSuperAdmin = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: getUserInDetails,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const user = data?.user || data || null;
  const roleName = normalizeProjectRole(user?.roleName || user?.role);
  return { isSuperAdmin: roleName === "super_admin", isLoading };
};

function AccessDenied() {
  const { pathname } = useLocation();
  const title = pathname.includes("/properties/")
    ? "Deleted property leads"
    : "Deleted project leads";
  return (
    <div className="mx-auto grid min-h-[420px] w-full max-w-lg place-items-center px-4">
      <div className={`rounded-3xl p-8 text-center ${saSurface}`}>
        <h1 className="text-xl font-semibold text-[#0f3d2e]">{title}</h1>
        <p className="mt-2 text-sm text-[#5c7d6d]">
          Only Super Admin can open the deleted leads list.
        </p>
      </div>
    </div>
  );
}

function DeletedLeadRow({ item, onDelete, isDeleting }) {
  return (
    <tr className="border-b border-slate-50 transition-colors hover:bg-slate-50/70">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#27AE60]/10">
            <User className="h-3.5 w-3.5 text-[#27AE60]" />
          </div>
          <span className="truncate text-sm font-semibold text-slate-800">
            {item.name || "-"}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
          <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#27AE60]" />
          {item.phone || "-"}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-600">
        <span className="block truncate">{item.email || "-"}</span>
      </td>
      <td className="px-3 py-2.5 text-xs font-medium text-slate-700">
        <span className="block truncate">{item.projectTitle || "-"}</span>
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-600">
        <span className="block truncate">{personLine(item.deletedBy) || "Unknown"}</span>
        <span className="block text-[11px] text-slate-400">{formatWhen(item.deletedAt)}</span>
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-600">
        <span className="block truncate">{personLine(item.importedBy) || "-"}</span>
      </td>
      <td className="px-3 py-2.5">
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {item.deletionType === "bulk" ? "Delete all" : "One lead"}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={isDeleting}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="Permanently delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function DeletedLeadList() {
  const { pathname } = useLocation();
  const isProperty = pathname.includes("/properties/");
  const scope = isProperty ? "property" : "project";
  const title = isProperty ? "Deleted property leads" : "Deleted project leads";
  const listingLabel = isProperty ? "Property" : "Project";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [deletionType, setDeletionType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [purgeTarget, setPurgeTarget] = useState(null);
  const [purgeError, setPurgeError] = useState("");
  const searchTimer = useRef(0);

  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: ["deleted-leads", scope, debounced, deletionType, from, to, page],
    queryFn: () =>
      getDeletedLeads({
        q: debounced,
        deletionType: deletionType === "all" ? "" : deletionType,
        scope,
        from,
        to,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const payload = data?.data || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const total = Number(payload.meta?.total) || 0;
  const totalPages = Math.max(
    1,
    Number(payload.meta?.pages) || Math.ceil(total / PAGE_SIZE) || 1,
  );
  const safePage = Math.min(page, totalPages);
  const pageNumbers = pageNumbersFor(safePage, total > 0 ? totalPages : 0);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);
  const showSkeleton = isPending && items.length === 0;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const purgeOneMutation = useMutation({
    mutationFn: (id) => purgeDeletedLead(id),
    onSuccess: async () => {
      setPurgeError("");
      setPurgeTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["deleted-leads"] });
    },
    onError: (error) => {
      setPurgeError(error?.response?.data?.message || error?.message || "Could not delete this lead.");
    },
  });

  const purgeAllMutation = useMutation({
    mutationFn: () => purgeAllDeletedLeads(),
    onSuccess: async () => {
      setPurgeError("");
      setPurgeTarget(null);
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["deleted-leads"] });
    },
    onError: (error) => {
      setPurgeError(error?.response?.data?.message || error?.message || "Could not delete archived leads.");
    },
  });

  const isPurging = purgeOneMutation.isPending || purgeAllMutation.isPending;

  const onSearch = (value) => {
    setSearch(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebounced(value.trim());
      setPage(1);
    }, 300);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 px-1 pb-8 text-[#0f3d2e] sm:px-2">
      <div className="space-y-3 rounded-2xl bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">
            {title}
            <span className="ml-2 text-sm font-semibold tabular-nums text-[#5c7d6d]">
              ({total})
            </span>
            {isFetching && !showSkeleton ? (
              <span className="ml-2 text-xs font-medium text-emerald-600">Updating...</span>
            ) : null}
          </h1>
          <button
            type="button"
            onClick={() => {
              setPurgeError("");
              setPurgeTarget({ type: "all" });
            }}
            disabled={!total || isPurging}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Permanently delete all
          </button>
        </div>
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_140px_140px]">
          <label className={`flex items-center gap-2 rounded-xl px-3 py-2 ${saInset}`}>
            <Search className="h-4 w-4 text-[#5c7d6d]" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={`Search name, phone, ${listingLabel.toLowerCase()}, who deleted...`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#5c7d6d]"
            />
          </label>
          <select
            value={deletionType}
            onChange={(event) => {
              setDeletionType(event.target.value);
              setPage(1);
            }}
            className={`h-10 rounded-xl px-3 text-sm outline-none ${saInset}`}
          >
            <option value="all">All deletions</option>
            <option value="single">One lead</option>
            <option value="bulk">Delete all</option>
          </select>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className={`h-10 rounded-xl px-3 text-sm outline-none ${saInset}`}
            aria-label="Deleted from"
          />
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className={`h-10 rounded-xl px-3 text-sm outline-none ${saInset}`}
            aria-label="Deleted to"
          />
        </div>
      </div>

      {isError ? (
        <div className={`rounded-2xl p-6 text-sm text-red-700 ${saSurface}`}>
          Deleted leads could not be loaded. Refresh and try again.
        </div>
      ) : showSkeleton ? (
        <div className={`h-40 animate-pulse rounded-xl bg-emerald-50 ${saSurface}`} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
          No deleted leads match this search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[1080px] table-fixed text-left">
              <thead>
                <tr className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50">
                  <th className="w-[14%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</th>
                  <th className="w-[12%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</th>
                  <th className="w-[16%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="w-[14%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{listingLabel}</th>
                  <th className="w-[16%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Deleted by</th>
                  <th className="w-[14%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Uploaded by</th>
                  <th className="w-[8%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="w-[6%] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Delete</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <DeletedLeadRow
                    key={item._id}
                    item={item}
                    isDeleting={isPurging}
                    onDelete={(lead) => {
                      setPurgeError("");
                      setPurgeTarget({ type: "one", lead });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#5c7d6d]">
            Showing {rangeStart}-{rangeEnd} of {total}
          </p>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Deleted lead pages">
            {pageNumbers.map((number, index) => {
              const previous = pageNumbers[index - 1];
              const gap = previous && number - previous > 1;
              const active = number === safePage;
              return (
                <span key={number} className="flex items-center gap-1">
                  {gap ? (
                    <span className="px-1 text-xs font-bold text-[#5c7d6d]">...</span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Page ${number}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setPage(number)}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold ${
                      active
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-100 bg-white text-[#0f3d2e] hover:bg-emerald-50"
                    }`}
                  >
                    {number}
                  </button>
                </span>
              );
            })}
          </nav>
        </div>
      ) : null}
      {purgeError ? (
        <p className="text-sm font-semibold text-red-600">{purgeError}</p>
      ) : null}

      {purgeTarget ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {purgeTarget.type === "all"
                    ? "Permanently delete all archived leads?"
                    : "Permanently delete this lead?"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {purgeTarget.type === "all"
                    ? "This removes every saved deleted lead from the database. This cannot be undone."
                    : `This removes ${purgeTarget.lead?.name || "this lead"} from the database. This cannot be undone.`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPurgeTarget(null)}
                disabled={isPurging}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (purgeTarget.type === "all") {
                    purgeAllMutation.mutate();
                    return;
                  }
                  purgeOneMutation.mutate(purgeTarget.lead?._id);
                }}
                disabled={isPurging}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isPurging ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DeletedProjectLeadsPage() {
  const { isSuperAdmin, isLoading } = useSuperAdmin();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-1 pt-2">
        <div className={`h-28 animate-pulse rounded-2xl bg-emerald-50 ${saSurface}`} />
      </div>
    );
  }
  if (!isSuperAdmin) return <AccessDenied />;
  return <DeletedLeadList />;
}
