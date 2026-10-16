import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Search, Trash2 } from "lucide-react";
import {
  getDeletedProperties,
  purgeDeletedProperty,
} from "../../features/property/propertyService";
import { useDeletedAccess } from "../../features/property/useDeletedAccess";
import { saInset, saSurface, saSurfaceHover } from "../Dashboards/superAdminDashboard/dashboardSurface";

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

const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `\u20B9${crore >= 10 ? Math.round(crore) : crore.toFixed(2).replace(/\.00$/, "")}Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `\u20B9${lakh >= 10 ? Math.round(lakh) : lakh.toFixed(2).replace(/\.00$/, "")}L`;
  }
  return `\u20B9${amount.toLocaleString("en-IN")}`;
};

function AccessDenied() {
  return (
    <div className="mx-auto grid min-h-[420px] w-full max-w-lg place-items-center px-4">
      <div className={`rounded-3xl p-8 text-center ${saSurface}`}>
        <h1 className="text-xl font-semibold text-[#0f3d2e]">Deleted properties</h1>
        <p className="mt-2 text-sm text-[#5c7d6d]">
          You do not have access to deleted properties. Ask your head or Super Admin to turn it on.
        </p>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className={`animate-pulse overflow-hidden rounded-2xl ${saSurface}`}>
      <div className="h-36 bg-emerald-50" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 rounded bg-emerald-50" />
        <div className="h-3 w-1/2 rounded bg-emerald-50" />
        <div className="h-3 w-1/3 rounded bg-emerald-50" />
      </div>
    </div>
  );
}

function DeletedPropertyCard({ item, onOpen, onPurge, purging }) {
  const who = item?.deletedBy?.name || "Unknown";
  const role = item?.deletedBy?.roleName || "";
  const deactivated = item?.deactivatedBy?.name || "";
  return (
    <div className={`relative overflow-hidden rounded-2xl text-left ${saSurface} ${saSurfaceHover}`}>
      <button
        type="button"
        onClick={() => item.propertyId && item.category && onOpen(item)}
        className="block w-full text-left"
      >
        <div className="h-36 bg-emerald-50">
          {item.heroImage ? (
            <img src={item.heroImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-emerald-300">
              <Trash2 className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            {item.category || "Property"}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold text-[#0f3d2e]">
            {item.title || "Untitled property"}
          </h3>
          <p className="flex items-center gap-1 text-[11px] text-[#5c7d6d]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[item.locality, item.city, item.state].filter(Boolean).join(", ") || "Location not set"}
            </span>
          </p>
          <p className="text-xs font-medium text-[#0f3d2e]">
            {formatPrice(item.price) || "Price not set"}
          </p>
          {deactivated ? (
            <p className="text-[11px] text-amber-800">Deactivated by {deactivated}</p>
          ) : null}
          <p className="text-[11px] text-[#5c7d6d]">
            Deleted by {who}
            {role ? ` \u00B7 ${role}` : ""}
          </p>
          <p className="text-[11px] text-[#5c7d6d]">{formatWhen(item.deletedAt)}</p>
        </div>
      </button>
      {onPurge ? (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => onPurge(item)}
            disabled={purging}
            className="w-full rounded-full bg-red-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {purging ? "Removing..." : "Permanently remove this property"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DeletedPropertyList({ canPurge }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purgeError, setPurgeError] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const searchTimer = useRef(0);

  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: ["deleted-properties", debounced, category, from, to, page],
    queryFn: () =>
      getDeletedProperties({
        q: debounced,
        category: category === "all" ? "" : category,
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

  const purgeMutation = useMutation({
    mutationFn: (id) => purgeDeletedProperty(id),
    onSuccess: async () => {
      setPurgeError("");
      await queryClient.invalidateQueries({ queryKey: ["deleted-properties"] });
    },
    onError: (error) => {
      setPurgeError(error?.response?.data?.error || error?.message || "Could not delete this property.");
    },
  });

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
            Deleted properties
            <span className="ml-2 text-sm font-semibold tabular-nums text-[#5c7d6d]">
              ({total})
            </span>
            {isFetching && !showSkeleton ? (
              <span className="ml-2 text-xs font-medium text-emerald-600">Updating...</span>
            ) : null}
            {!canPurge ? (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-slate-500">
                View only
              </span>
            ) : null}
          </h1>
        </div>
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_140px_140px]">
          <label className={`flex items-center gap-2 rounded-xl px-3 py-2 ${saInset}`}>
            <Search className="h-4 w-4 text-[#5c7d6d]" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search title, city, who deleted..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#5c7d6d]"
            />
          </label>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className={`h-10 rounded-xl px-3 text-sm outline-none ${saInset}`}
          >
            <option value="all">All categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="agricultural">Agricultural</option>
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
          Deleted properties could not be loaded. Refresh and try again.
        </div>
      ) : showSkeleton ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center text-sm text-[#5c7d6d] ${saSurface}`}>
          No permanently deleted properties match this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <DeletedPropertyCard
              key={item._id}
              item={item}
              onOpen={(property) =>
                navigate(`/property/${property.category}/${property.propertyId}`)
              }
              purging={purgeMutation.isPending && purgeMutation.variables === item._id}
              onPurge={
                canPurge
                  ? (property) => {
                      setPurgeError("");
                      purgeMutation.mutate(property._id);
                    }
                  : null
              }
            />
          ))}
        </div>
      )}

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#5c7d6d]">
            Showing {rangeStart}-{rangeEnd} of {total}
          </p>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Deleted property pages">
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
    </div>
  );
}

export default function DeletedPropertiesPage() {
  const { properties, canPurge, isLoading } = useDeletedAccess();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-1 pt-2">
        <div className={`h-28 animate-pulse rounded-2xl bg-emerald-50 ${saSurface}`} />
      </div>
    );
  }
  if (!properties.view) return <AccessDenied />;
  return <DeletedPropertyList canPurge={canPurge} />;
}
