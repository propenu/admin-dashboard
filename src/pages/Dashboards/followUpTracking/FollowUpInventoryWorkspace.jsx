import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FolderKanban,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { fetchResidential } from "../../../services/ResidentialServices/ResidentialServices";
import { fetchCommercial } from "../../../services/CommercialServices/CommercialServices";
import { fetchAgricultural } from "../../../services/AgricuturalServices/AgricuturalServices";
import { fetchLand } from "../../../services/LandServices/LandServices";
import { getFeaturedProjectsByType } from "../../../features/property/propertyService";
import {
  anyTerritoryCovers,
  locationFromUserLike,
} from "../../../utils/workingLocations";
import {
  followUpWorkLabel,
  normalizeFollowUpWorkStatus,
} from "./FollowUpWorkStatusSelect";
import ListingFollowUpWorkStatusSelect from "./ListingFollowUpWorkStatusSelect";

const PAGE_SIZE = 40;
const SERVER_PAGE = 100;

const PROPERTY_FETCHERS = [
  { category: "residential", fetcher: fetchResidential },
  { category: "commercial", fetcher: fetchCommercial },
  { category: "agricultural", fetcher: fetchAgricultural },
  { category: "land", fetcher: fetchLand },
];

const STATUS_TONE = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-900",
  draft: "bg-blue-100 text-blue-800",
  rejected: "bg-rose-100 text-rose-800",
  inactive: "bg-violet-100 text-violet-800",
  expired: "bg-slate-100 text-slate-700",
};

const toDay = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatPrice = (price) => {
  if (typeof price !== "number" || Number.isNaN(price)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: price >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(price);
};

const formatWhen = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
};

const normalizeSearch = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const inCreatedRange = (value, from, to) => {
  if (!from && !to) return true;
  if (!value) return false;
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return false;
  if (from && createdAt < new Date(`${from}T00:00:00`)) return false;
  if (to && createdAt > new Date(`${to}T23:59:59.999`)) return false;
  return true;
};

const getPropertyStatus = (property) => {
  if (property?.status === "draft" && property?.rejectedReason) return "rejected";
  return String(property?.status || "draft").toLowerCase();
};

const getProjectStatus = (project) => {
  const raw = String(project?.status || "").toLowerCase();
  if (["draft", "onboarding", "incomplete"].includes(raw)) return "draft";
  if (raw === "inactive") return "draft";
  return raw || "draft";
};

const propertyTitle = (row) =>
  row?.buildingName ||
  row?.landName ||
  row?.title ||
  row?.projectName ||
  row?.name ||
  "Untitled";

const propertyLocation = (row) =>
  [row?.locality, row?.city, row?.state].filter(Boolean).join(", ") || "—";

const listingCompletionPercent = (row) => {
  const raw = row?.completion?.percent ?? row?.completion;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(100, Math.round(n));
};

const listingCompletionStep = (row) => {
  const step = Number(row?.completion?.step);
  return Number.isFinite(step) && step > 0 ? step : null;
};

const rowId = (row) => String(row?._id || row?.id || "");

const creatorIdOf = (row) => {
  const person = row?.createdBy;
  if (!person) return "";
  if (typeof person === "string") return person.trim();
  return String(person?._id || person?.id || "").trim();
};

/** Exclusive CCE for a listing = listing owner, else creator's follow-up owner. */
const listingOwnerIdOf = (row, creatorAssigneeById = null) => {
  const fromListing = String(
    row?.followUpAssignedTo?._id || row?.followUpAssignedTo || "",
  ).trim();
  if (fromListing) return fromListing;

  const fromCreator = String(
    row?.createdBy?.followUpAssignedTo?._id ||
      row?.createdBy?.followUpAssignedTo ||
      "",
  ).trim();
  if (fromCreator) return fromCreator;

  const creatorId = creatorIdOf(row);
  if (!creatorId || !creatorAssigneeById) return "";
  return String(creatorAssigneeById[creatorId] || "").trim();
};

const workStatusOfListing = (row, overrides = {}) => {
  const id = rowId(row);
  if (id && overrides[id]) return normalizeFollowUpWorkStatus(overrides[id]);
  return normalizeFollowUpWorkStatus(row?.followUpWorkStatus);
};

/** Listing / project creator only — never dashboard staff from postedBy. */
const getCreatedByPerson = (row) => {
  const person = row?.createdBy;
  if (person && (person.name || person.email || person.phone || person._id || person.id)) {
    return person;
  }
  return null;
};

const getCreatedByName = (row) => getCreatedByPerson(row)?.name || "—";

const getCreatedByRoleTag = (row) => {
  const person = getCreatedByPerson(row);
  const role = String(
    person?.roleName || person?.role || person?.roleId?.name || person?.roleId?.roleName || "",
  )
    .trim()
    .toLowerCase();
  if (!role) return "";
  if (role.includes("agent")) return "Agent";
  if (role === "user" || role === "owner") return "User";
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "builder") return "Builder";
  if (role === "builder_staff") return "Builder staff";
  return role.replace(/_/g, " ");
};

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function StatusBadge({ status }) {
  const key = String(status || "draft").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
        STATUS_TONE[key] || "bg-slate-100 text-slate-700"
      }`}
    >
      {key}
    </span>
  );
}

function DetailField({ label, children }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-xs text-slate-800">{children || "—"}</div>
    </div>
  );
}

function CompletionMeter({ percent, step = null, compact = false }) {
  if (percent == null) {
    return <span className="text-slate-400">—</span>;
  }
  const tone =
    percent >= 100
      ? "bg-emerald-500"
      : percent >= 70
        ? "bg-emerald-400"
        : percent >= 45
          ? "bg-amber-400"
          : "bg-slate-400";
  return (
    <div className={`flex items-center gap-1.5 ${compact ? "min-w-[88px]" : "min-w-[120px]"}`}>
      <span className="tabular-nums font-bold text-slate-800">{percent}%</span>
      <div
        className={`overflow-hidden rounded-full bg-slate-100 ${
          compact ? "h-1.5 w-12" : "h-2 w-20"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {step != null && !compact ? (
        <span className="whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
          Step {step}
        </span>
      ) : null}
    </div>
  );
}

export default function FollowUpInventoryWorkspace({
  meta,
  range = {},
  territoryFilter = null,
  exclusiveAssigneeId = null,
  creatorAssigneeById = null,
  onRefreshUsers,
}) {
  const isProject = meta?.entity === "project" || meta?.path === "/projects";
  const targetStatus = String(meta?.status || "pending").toLowerCase();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ loaded: 0, total: null });
  const [exporting, setExporting] = useState(false);
  const [workStatusOverrides, setWorkStatusOverrides] = useState({});
  const abortRef = useRef(null);
  const tableScrollRef = useRef(null);

  const canEditListingProcess = useCallback(
    (row) => {
      if (!exclusiveAssigneeId) return true;
      const ownerId = listingOwnerIdOf(row, creatorAssigneeById);
      return Boolean(ownerId && ownerId === String(exclusiveAssigneeId));
    },
    [exclusiveAssigneeId, creatorAssigneeById],
  );

  const handleListingWorkUpdated = useCallback((listingId, nextStatus) => {
    const id = String(listingId || "");
    if (!id) return;
    setWorkStatusOverrides((prev) => ({ ...prev, [id]: nextStatus }));
    setRows((prev) =>
      prev.map((row) =>
        rowId(row) === id ? { ...row, followUpWorkStatus: nextStatus } : row,
      ),
    );
  }, []);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setFetchingMore(true);
    setError("");
    setRows([]);
    setProgress({ loaded: 0, total: null });
    setSelectedId(null);
    setPage(1);

    try {
      if (isProject) {
        const bucket = [];
        let pageNo = 1;
        let totalHint = null;

        while (!controller.signal.aborted) {
          const res = await getFeaturedProjectsByType(null, pageNo, SERVER_PAGE, {
            search: debouncedSearch || undefined,
          });
          if (controller.signal.aborted) return;
          const items = (res?.data?.items || []).map((item) => ({
            ...item,
            _entity: "project",
            _category: "project",
          }));
          bucket.push(...items);
          totalHint = res?.data?.meta?.total ?? totalHint;
          setProgress({ loaded: bucket.length, total: totalHint });
          setRows([...bucket]);
          setLoading(false);

          const pages = Math.max(
            1,
            Math.ceil((totalHint ?? bucket.length) / (res?.data?.meta?.limit || SERVER_PAGE)),
          );
          if (pageNo >= pages || items.length === 0) break;
          pageNo += 1;
        }
        if (controller.signal.aborted) return;
        setRows([...bucket]);
        setProgress({ loaded: bucket.length, total: bucket.length });
        return;
      }

      const byCategory = Object.fromEntries(
        PROPERTY_FETCHERS.map(({ category }) => [category, []]),
      );
      const totalsByCategory = {};

      const publish = () => {
        const merged = PROPERTY_FETCHERS.flatMap(({ category }) => byCategory[category]);
        const totalHint = Object.values(totalsByCategory).reduce(
          (sum, n) => sum + (Number(n) || 0),
          0,
        );
        setProgress({ loaded: merged.length, total: totalHint || null });
        setRows(merged);
        setLoading(false);
      };

      await Promise.all(
        PROPERTY_FETCHERS.map(async ({ category, fetcher }) => {
          let pageNo = 1;
          while (!controller.signal.aborted) {
            const res = await fetcher({
              page: pageNo,
              limit: SERVER_PAGE,
              search: debouncedSearch,
            });
            if (controller.signal.aborted) return;
            const items = (res?.items || []).map((item) => ({
              ...item,
              _entity: "property",
              _category: category,
            }));
            byCategory[category] = byCategory[category].concat(items);
            const catTotal = res?.meta?.total ?? byCategory[category].length;
            if (pageNo === 1) totalsByCategory[category] = catTotal;
            publish();

            const pages = Math.max(
              1,
              Math.ceil(catTotal / (res?.meta?.limit || SERVER_PAGE)),
            );
            if (pageNo >= pages || items.length === 0) break;
            pageNo += 1;
          }
        }),
      );

      if (controller.signal.aborted) return;
      publish();
      const finalRows = PROPERTY_FETCHERS.flatMap(({ category }) => byCategory[category]);
      setProgress({ loaded: finalRows.length, total: finalRows.length });
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err?.message || "Failed to load inventory");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setFetchingMore(false);
      }
    }
  }, [debouncedSearch, isProject]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return rows
      .filter((row) => {
        const status = isProject ? getProjectStatus(row) : getPropertyStatus(row);
        if (targetStatus === "draft") {
          return status === "draft" || status === "inactive";
        }
        return status === targetStatus;
      })
      .filter((row) => inCreatedRange(row?.createdAt, range.from, range.to))
      .filter((row) => {
        // CCE exclusive: one owner per listing (creator's follow-up CCE).
        // Same territory as another CCE does NOT share the case.
        if (exclusiveAssigneeId) {
          const ownerId = listingOwnerIdOf(row, creatorAssigneeById);
          if (!ownerId || ownerId !== String(exclusiveAssigneeId)) return false;
        }
        if (!Array.isArray(territoryFilter) || !territoryFilter.length) return true;
        return anyTerritoryCovers(territoryFilter, locationFromUserLike(row));
      })
      .filter((row) => {
        if (isProject || categoryFilter === "all") return true;
        return row._category === categoryFilter;
      })
      .filter((row) => {
        if (!term) return true;
        return [
          propertyTitle(row),
          row?.propertyCode,
          row?.projectCode,
          row?.slug,
          row?.city,
          row?.state,
          row?.locality,
          row?.createdBy?.name,
          row?.createdBy?.email,
          row?.createdBy?.phone,
          row?.phone,
          row?.email,
          row?._category,
          row?.rejectedReason,
        ].some((v) => normalizeSearch(v).includes(term));
      })
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime(),
      );
  }, [
    rows,
    isProject,
    targetStatus,
    range.from,
    range.to,
    categoryFilter,
    search,
    territoryFilter,
    exclusiveAssigneeId,
    creatorAssigneeById,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
  }, [targetStatus, range.from, range.to, categoryFilter, debouncedSearch, isProject]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    if (!pageRows.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !pageRows.some((r) => rowId(r) === selectedId)) {
      setSelectedId(rowId(pageRows[0]));
    }
  }, [pageRows, selectedId]);

  const selected = useMemo(
    () => filtered.find((r) => rowId(r) === selectedId) || null,
    [filtered, selectedId],
  );

  const categoryCounts = useMemo(() => {
    if (isProject) return {};
    return filtered.reduce((acc, row) => {
      const key = row._category || "other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [filtered, isProject]);

  const exportExcel = async () => {
    if (!filtered.length) return;
    setExporting(true);
    try {
      const sheetRows = filtered.map((row, index) => {
        const status = isProject ? getProjectStatus(row) : getPropertyStatus(row);
        const creator = getCreatedByPerson(row);
        return {
          SNo: index + 1,
          PeriodFrom: range.from || "",
          PeriodTo: range.to || "",
          Track: meta?.label || "",
          Type: isProject ? "Project" : "Property",
          Category: row._category || "",
          Title: propertyTitle(row),
          Status: status,
          Completion: !isProject
            ? listingCompletionPercent(row) != null
              ? `${listingCompletionPercent(row)}%`
              : ""
            : "",
          CompletionStep: !isProject ? listingCompletionStep(row) || "" : "",
          Location: propertyLocation(row),
          City: row?.city || "",
          State: row?.state || "",
          Price: typeof row?.price === "number" ? row.price : row?.minPrice || "",
          ListingType: row?.listingType || "",
          CreatedBy: creator?.name || "",
          CreatedByRole: getCreatedByRoleTag(row),
          Phone: creator?.phone || "",
          Email: creator?.email || "",
          RejectedReason: row?.rejectedReason || row?.rejectionReason || "",
          CreatedAt: row?.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "",
          UpdatedAt: row?.updatedAt ? new Date(row.updatedAt).toLocaleString("en-IN") : "",
          Id: rowId(row),
          Slug: row?.slug || "",
          FollowUpProcess: followUpWorkLabel(
            workStatusOfListing(row, workStatusOverrides),
          ),
        };
      });

      const ws = XLSX.utils.json_to_sheet(sheetRows);
      ws["!cols"] = Object.keys(sheetRows[0] || {}).map((key) => ({
        wch: Math.min(40, Math.max(10, key.length + 4)),
      }));
      const wb = XLSX.utils.book_new();
      const sheetName = (meta?.label || "Inventory").slice(0, 28);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const stamp =
        range.from && range.to
          ? `${range.from}_to_${range.to}`
          : toDay(new Date()) || "export";
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }),
        `follow-up-${String(meta?.label || "inventory")
          .toLowerCase()
          .replace(/\s+/g, "-")}-${stamp}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  const openHref = selected
    ? isProject
      ? `/featured-project/${rowId(selected)}`
      : `/property/${selected._category}/${rowId(selected)}`
    : null;

  const reviewHref =
    selected && !isProject && getPropertyStatus(selected) === "pending"
      ? {
          residential: `/residential-property-verification/${rowId(selected)}`,
          commercial: `/commercial-property-verification/${rowId(selected)}`,
          agricultural: `/agricultural-property-verification/${rowId(selected)}`,
          land: `/land-property-verification/${rowId(selected)}`,
        }[selected._category]
      : null;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
        <header className="space-y-2.5 border-b border-slate-100 px-3.5 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                {isProject ? (
                  <FolderKanban size={15} className="text-emerald-600" />
                ) : (
                  <Building2 size={15} className="text-emerald-600" />
                )}
                <h2 className="text-sm font-bold text-slate-900">{meta?.label}</h2>
                <StatusBadge status={targetStatus} />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {filtered.length.toLocaleString("en-IN")} matching
                {progress.total != null
                  ? ` · loaded ${progress.loaded.toLocaleString("en-IN")}${
                      fetchingMore ? ` / ~${progress.total.toLocaleString("en-IN")}` : ""
                    }`
                  : ""}
                {range.from && range.to ? ` · ${range.from} → ${range.to}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  load();
                  onRefreshUsers?.();
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw
                  size={12}
                  className={loading || fetchingMore ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <button
                type="button"
                disabled={!filtered.length || exporting || loading}
                onClick={exportExcel}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Download Excel
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block min-w-[220px] flex-1">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isProject
                    ? "Search project, city, builder…"
                    : "Search title, city, poster, code…"
                }
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-emerald-400"
              />
            </label>
            {!isProject ? (
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "all", label: "All" },
                  { key: "residential", label: "Resi" },
                  { key: "commercial", label: "Comm" },
                  { key: "land", label: "Land" },
                  { key: "agricultural", label: "Agri" },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setCategoryFilter(chip.key)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                      categoryFilter === chip.key
                        ? "bg-slate-800 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {chip.label}
                    {chip.key !== "all" && categoryCounts[chip.key]
                      ? ` ${categoryCounts[chip.key]}`
                      : ""}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {(loading || fetchingMore) && (
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width:
                    progress.total && progress.total > 0
                      ? `${Math.min(100, Math.round((progress.loaded / progress.total) * 100))}%`
                      : loading
                        ? "35%"
                        : "85%",
                }}
              />
            </div>
          )}
        </header>

        {error ? (
          <p className="px-4 py-10 text-center text-xs text-rose-600">{error}</p>
        ) : loading && !rows.length ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !filtered.length ? (
          <p className="py-14 text-center text-xs text-slate-400">
            No {isProject ? "projects" : "properties"} in this track
            {fetchingMore ? " yet — still loading…" : ""}
          </p>
        ) : (
          <>
            <div ref={tableScrollRef} className="max-h-[min(62vh,640px)] overflow-auto">
              <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 shadow-sm">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">#</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Title</th>
                    {!isProject ? (
                      <th className="whitespace-nowrap px-3 py-2.5 font-bold">Category</th>
                    ) : null}
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Status</th>
                    {!isProject ? (
                      <th className="whitespace-nowrap px-3 py-2.5 font-bold">
                        Completion
                      </th>
                    ) : null}
                    <th className="min-w-[140px] whitespace-nowrap px-3 py-2.5 font-bold">
                      Location
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Created by</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Created</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-bold">Price</th>
                    <th className="sticky right-0 z-10 w-[132px] min-w-[132px] whitespace-nowrap bg-slate-50 px-3 py-2.5 font-bold shadow-[-8px_0_10px_-8px_rgba(15,23,42,0.14)]">
                      Process
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, index) => {
                    const id = rowId(row);
                    const active = id === selectedId;
                    const status = isProject
                      ? getProjectStatus(row)
                      : getPropertyStatus(row);
                    const creatorName = getCreatedByName(row);
                    const creatorRole = getCreatedByRoleTag(row);
                    return (
                      <tr
                        key={id || `${safePage}-${index}`}
                        onClick={() => setSelectedId(id)}
                        className={`cursor-pointer border-t border-slate-100 transition ${
                          active
                            ? "bg-emerald-50/80"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="align-middle px-3 py-2.5 tabular-nums text-slate-400">
                          {(safePage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="align-middle px-3 py-2.5">
                          <p className="max-w-[220px] truncate font-semibold text-slate-900">
                            {propertyTitle(row)}
                          </p>
                          {row?.rejectedReason ? (
                            <p className="max-w-[220px] truncate text-[10px] text-rose-600">
                              {row.rejectedReason}
                            </p>
                          ) : null}
                        </td>
                        {!isProject ? (
                          <td className="align-middle whitespace-nowrap px-3 py-2.5 capitalize text-slate-600">
                            {row._category}
                          </td>
                        ) : null}
                        <td className="align-middle whitespace-nowrap px-3 py-2.5">
                          <StatusBadge status={status} />
                        </td>
                        {!isProject ? (
                          <td className="align-middle whitespace-nowrap px-3 py-2.5">
                            <CompletionMeter
                              percent={listingCompletionPercent(row)}
                              compact
                            />
                          </td>
                        ) : null}
                        <td className="align-middle px-3 py-2.5">
                          <p className="max-w-[180px] truncate text-slate-600">
                            {propertyLocation(row)}
                          </p>
                        </td>
                        <td className="align-middle px-3 py-2.5">
                          <p className="max-w-[140px] truncate font-medium text-slate-700">
                            {creatorName}
                          </p>
                          {creatorRole ? (
                            <p className="text-[10px] text-slate-400">{creatorRole}</p>
                          ) : null}
                        </td>
                        <td className="align-middle whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">
                          {toDay(row.createdAt) || "—"}
                        </td>
                        <td className="align-middle whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">
                          {formatPrice(
                            typeof row?.price === "number"
                              ? row.price
                              : typeof row?.minPrice === "number"
                                ? row.minPrice
                                : null,
                          )}
                        </td>
                        <td
                          className={`sticky right-0 w-[132px] min-w-[132px] align-middle px-3 py-2.5 shadow-[-8px_0_10px_-8px_rgba(15,23,42,0.1)] ${
                            active ? "bg-emerald-50" : "bg-white"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canEditListingProcess(row) ? (
                            <ListingFollowUpWorkStatusSelect
                              row={row}
                              isProject={isProject}
                              value={workStatusOfListing(row, workStatusOverrides)}
                              compact
                              onUpdated={handleListingWorkUpdated}
                            />
                          ) : (
                            <span className="inline-flex h-8 items-center whitespace-nowrap rounded-lg bg-slate-100 px-2.5 text-[10px] font-bold text-slate-600">
                              {followUpWorkLabel(
                                workStatusOfListing(row, workStatusOverrides),
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length.toLocaleString("en-IN")}
                {fetchingMore ? " · loading more…" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    tableScrollRef.current?.scrollTo?.({ top: 0 });
                  }}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="px-2 text-[11px] font-semibold tabular-nums text-slate-600">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    tableScrollRef.current?.scrollTo?.({ top: 0 });
                  }}
                  className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </footer>
          </>
        )}
      </article>

      <aside className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm lg:sticky lg:top-3 lg:self-start">
        <header className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
          <div>
            <p className="text-xs font-bold text-slate-900">Record details</p>
            <p className="text-[10px] text-slate-500">Select a row to inspect</p>
          </div>
          {selected ? (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          ) : null}
        </header>

        {!selected ? (
          <div className="px-4 py-12 text-center text-xs text-slate-400">
            Click any row in the table to preview follow-up details here.
          </div>
        ) : (
          <div className="max-h-[min(70vh,720px)] space-y-3 overflow-auto p-3.5">
            <div>
              <p className="text-sm font-bold leading-snug text-slate-900">
                {propertyTitle(selected)}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  status={
                    isProject
                      ? getProjectStatus(selected)
                      : getPropertyStatus(selected)
                  }
                />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">
                  {selected._category}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                CCE process
              </p>
              {canEditListingProcess(selected) ? (
                <ListingFollowUpWorkStatusSelect
                  row={selected}
                  isProject={isProject}
                  value={workStatusOfListing(selected, workStatusOverrides)}
                  onUpdated={handleListingWorkUpdated}
                />
              ) : (
                <p className="text-xs font-semibold text-slate-700">
                  {followUpWorkLabel(
                    workStatusOfListing(selected, workStatusOverrides),
                  )}
                </p>
              )}
              <p className="mt-1.5 text-[10px] text-slate-400">
                Auto-starts as Assigned when posted. Mark In progress or Completed after
                you work this listing. Approval status stays separate.
              </p>
            </div>

            {!isProject ? (
              <div className="rounded-xl border border-slate-100 bg-white p-2.5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Property completion
                </p>
                <CompletionMeter
                  percent={listingCompletionPercent(selected)}
                  step={listingCompletionStep(selected)}
                />
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Listing wizard progress for this property (separate from CCE process).
                </p>
              </div>
            ) : null}

            <DetailField label="Location">
              <span className="inline-flex items-start gap-1">
                <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                {propertyLocation(selected)}
              </span>
            </DetailField>

            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Created">{formatWhen(selected.createdAt)}</DetailField>
              <DetailField label="Updated">{formatWhen(selected.updatedAt)}</DetailField>
              <DetailField label="Price">
                {formatPrice(
                  typeof selected?.price === "number"
                    ? selected.price
                    : typeof selected?.minPrice === "number"
                      ? selected.minPrice
                      : null,
                )}
              </DetailField>
              <DetailField label="Listing">
                {selected?.listingType || selected?.promotion?.type || "—"}
              </DetailField>
            </div>

            <DetailField label="Created by">
              <div className="flex items-start gap-2">
                <UserRound size={14} className="mt-0.5 text-slate-400" />
                <div>
                  <p className="font-semibold">{getCreatedByName(selected)}</p>
                  {getCreatedByRoleTag(selected) ? (
                    <p className="text-[10px] text-slate-500">
                      {getCreatedByRoleTag(selected)}
                    </p>
                  ) : null}
                </div>
              </div>
            </DetailField>

            <DetailField label="Contact">
              <div className="space-y-0.5">
                <p className="inline-flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" />
                  {getCreatedByPerson(selected)?.phone || "—"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {getCreatedByPerson(selected)?.email || ""}
                </p>
              </div>
            </DetailField>

            {(selected?.rejectedReason || selected?.rejectionReason) && (
              <DetailField label="Rejection reason">
                <p className="rounded-lg bg-rose-50 px-2.5 py-2 text-rose-800">
                  {selected.rejectedReason || selected.rejectionReason}
                </p>
              </DetailField>
            )}

            <DetailField label="IDs">
              <p className="break-all font-mono text-[10px] text-slate-500">
                {rowId(selected)}
              </p>
              {selected?.slug ? (
                <p className="mt-0.5 break-all text-[10px] text-slate-400">
                  {selected.slug}
                </p>
              ) : null}
            </DetailField>

            <div className="flex flex-col gap-1.5 pt-1">
              {openHref ? (
                <Link
                  to={openHref}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Open full record <ExternalLink size={13} />
                </Link>
              ) : null}
              {reviewHref ? (
                <Link
                  to={reviewHref}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  Review / approve
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
