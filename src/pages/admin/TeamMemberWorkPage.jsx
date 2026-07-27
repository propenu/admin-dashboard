/**
 * Compact same-page member work — no navigate-away for role work modules.
 * Fixed-height scroll containers + View all on this page.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Filter,
  Home,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getTickets } from "../../features/ticket/ticket_system";
import {
  getUserById,
  getUserFeaturedProjects,
  getUserPayments,
  getUserProperties,
} from "../../features/user/userDetailService";
import { canonicalTeamRole } from "../../utils/roleHierarchy";
import { getRoleWorkProfile } from "../../utils/roleWorkProfiles";

const PROPERTY_CATEGORIES = ["residential", "commercial", "land", "agricultural"];
const PROJECT_TYPES = ["", "featured", "prime", "normal", "sponsored"];

const TAB_META = {
  overview: { label: "Role job", icon: Briefcase },
  tickets: { label: "Tickets", icon: Ticket },
  projects: { label: "Projects", icon: Building2 },
  properties: { label: "Properties", icon: Home },
  payments: { label: "Payments", icon: CreditCard },
};

const DATE_PRESETS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "custom", label: "Custom" },
];

const ACTIVE_STATUSES = new Set([
  "active",
  "live",
  "open",
  "in_progress",
  "under_review",
  "awaiting_user_response",
  "pending",
  "draft",
  "published",
  "paid",
  "approved",
  "verified",
  "available",
  "featured",
  "prime",
  "normal",
  "sponsored",
  "incomplete",
  "onboarding",
]);
const CLOSED_STATUSES = new Set([
  "resolved",
  "closed",
  "cancelled",
  "rejected",
  "failed",
  "sold",
  "rented",
  "expired",
]);

const toIsoDay = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const startOfDay = (iso) => (iso ? new Date(`${iso}T00:00:00`) : null);
const endOfDay = (iso) => (iso ? new Date(`${iso}T23:59:59.999`) : null);

const resolveDateRange = (preset, fromDate, toDate) => {
  const now = new Date();
  if (preset === "today") {
    const day = toIsoDay(now);
    return { from: startOfDay(day), to: endOfDay(day), fromIso: day, toIso: day };
  }
  if (preset === "7d" || preset === "30d") {
    const days = preset === "7d" ? 6 : 29;
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    return {
      from: startOfDay(toIsoDay(from)),
      to: endOfDay(toIsoDay(now)),
      fromIso: toIsoDay(from),
      toIso: toIsoDay(now),
    };
  }
  if (preset === "custom") {
    return { from: startOfDay(fromDate), to: endOfDay(toDate), fromIso: fromDate || "", toIso: toDate || "" };
  }
  return { from: null, to: null, fromIso: "", toIso: "" };
};

const itemStatus = (item) =>
  String(
    item?.status ||
      item?.listingStatus ||
      item?.promotionStatus ||
      item?.paymentStatus ||
      item?.verificationStatus ||
      "",
  ).toLowerCase();

const isActiveItem = (item) => {
  const status = itemStatus(item);
  if (!status) return true;
  if (CLOSED_STATUSES.has(status)) return false;
  if (ACTIVE_STATUSES.has(status)) return true;
  return !["resolved", "closed", "cancelled", "failed", "rejected", "expired"].some((s) =>
    status.includes(s),
  );
};

const itemDate = (item) => {
  const raw =
    item?.updatedAt ||
    item?.createdAt ||
    item?.postedAt ||
    item?.paymentDate ||
    item?.paidAt ||
    item?.date ||
    item?.created_at ||
    null;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const inDateRange = (item, range) => {
  if (!range.from && !range.to) return true;
  const date = itemDate(item);
  if (!date) return true;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
};

const sortByNewest = (items) =>
  [...items].sort((a, b) => {
    const da = itemDate(a)?.getTime() || 0;
    const db = itemDate(b)?.getTime() || 0;
    return db - da;
  });

const statusTone = (status = "") => {
  const value = String(status).toLowerCase();
  if (["active", "live", "open", "resolved", "closed", "verified", "paid"].some((s) => value.includes(s)))
    return "bg-emerald-50 text-emerald-700";
  if (["pending", "draft", "in_progress", "onboarding", "awaiting"].some((s) => value.includes(s)))
    return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const fmtDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const pickItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const titleOf = (item) =>
  item?.title ||
  item?.projectName ||
  item?.name ||
  item?.propertyTitle ||
  item?.ticketNumber ||
  item?.code ||
  item?.planName ||
  "Untitled";

const applyListFilters = (items, { range, activeOnly, status, search }) => {
  const q = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (!inDateRange(item, range)) return false;
    if (activeOnly && !isActiveItem(item)) return false;
    if (status === "active" && !isActiveItem(item)) return false;
    if (status === "closed" && isActiveItem(item)) return false;
    if (q) {
      const hay = `${titleOf(item)} ${itemStatus(item)} ${item?.city || ""} ${item?.locality || ""} ${item?.ticketNumber || ""} ${item?._category || ""} ${item?._projectType || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return sortByNewest(filtered);
};

/** Map sidebar/module paths → same-page tab (never leave this page for work data). */
const moduleToTab = (module) => {
  const path = String(module?.path || "").toLowerCase();
  const label = String(module?.label || "").toLowerCase();
  if (path.includes("ticket") || label.includes("ticket")) return "tickets";
  if (path.includes("payment") || path.includes("subscription") || path.includes("account") || label.includes("payment"))
    return "payments";
  if (path.includes("project") || label.includes("project")) return "projects";
  if (path.includes("propert") || path.includes("progress") || label.includes("propert") || label.includes("onboard"))
    return "properties";
  return "overview";
};

export default function TeamMemberWorkPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingWork, setLoadingWork] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const [datePreset, setDatePreset] = useState(searchParams.get("range") || "all");
  const [fromDate, setFromDate] = useState(searchParams.get("from") || "");
  const [toDate, setToDate] = useState(searchParams.get("to") || "");
  const [activeOnly, setActiveOnly] = useState(searchParams.get("active") === "1");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const roleFromQuery = searchParams.get("role") || "";
  const roleLabelFromQuery = searchParams.get("roleLabel") || "";
  const roleName = roleFromQuery || user?.roleName || user?.role?.name || "";
  const profile = getRoleWorkProfile(roleName || user?.roleName);
  const roleKey = canonicalTeamRole(roleName || user?.roleName);
  const displayRoleTitle =
    roleLabelFromQuery ||
    profile.title ||
    String(roleName || user?.roleName || "Role")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const panels = profile.panels || ["overview", "tickets"];
  const tab = panels.includes(searchParams.get("tab")) ? searchParams.get("tab") : "overview";

  const dateRange = useMemo(
    () => resolveDateRange(datePreset, fromDate, toDate),
    [datePreset, fromDate, toDate],
  );

  const syncUrl = useCallback(
    (patch = {}) => {
      const params = new URLSearchParams(searchParams);
      const next = {
        tab,
        role: roleFromQuery || roleName,
        roleLabel: roleLabelFromQuery || displayRoleTitle,
        range: datePreset,
        from: fromDate,
        to: toDate,
        active: activeOnly ? "1" : "",
        status: statusFilter === "all" ? "" : statusFilter,
        q: search,
        ...patch,
      };
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (next.range !== "custom") {
        params.delete("from");
        params.delete("to");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, tab, roleName, roleFromQuery, roleLabelFromQuery, displayRoleTitle, datePreset, fromDate, toDate, activeOnly, statusFilter, search, setSearchParams],
  );

  const setTab = (next) => {
    setViewAll(false);
    syncUrl({ tab: next });
  };

  const loadProfile = async () => {
    const res = await getUserById(userId);
    const data = res.data?.data || res.data;
    const found = Array.isArray(data)
      ? data.find((item) => String(item._id) === String(userId))
      : data;
    setUser(found || null);
    return found;
  };

  const loadWork = async (memberRole) => {
    setLoadingWork(true);
    try {
      const workProfile = getRoleWorkProfile(memberRole);
      const need = new Set(workProfile.panels || []);
      // Load full work set once; date / status filters apply client-side so
      // All / Today / 7d / 30d stay accurate and consistent with the stats.
      const ticketParams = {
        assignedOrRequested: userId,
        page: 1,
        limit: 200,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const tasks = [];
      if (need.has("tickets") || need.has("overview")) {
        tasks.push(
          getTickets(ticketParams)
            .then((res) => setTickets(pickItems(res?.data || res)))
            .catch(() => setTickets([])),
        );
      } else setTickets([]);

      if (need.has("projects") || need.has("overview")) {
        tasks.push(
          Promise.all(
            PROJECT_TYPES.map((type) =>
              getUserFeaturedProjects(userId, type, 1, 200)
                .then((res) =>
                  pickItems(res.data).map((item) => ({
                    ...item,
                    _projectType: type || item.type || "project",
                  })),
                )
                .catch(() => []),
            ),
          ).then((batches) => {
            const map = new Map();
            batches.flat().forEach((item) => {
              const id = String(item._id || "");
              if (!id || map.has(id)) return;
              map.set(id, item);
            });
            setProjects([...map.values()]);
          }),
        );
      } else setProjects([]);

      if (need.has("properties") || need.has("overview")) {
        tasks.push(
          Promise.all(
            PROPERTY_CATEGORIES.map((category) =>
              getUserProperties(userId, category, 1, 200)
                .then((res) =>
                  pickItems(res.data).map((item) => ({ ...item, _category: category })),
                )
                .catch(() => []),
            ),
          ).then((batches) => {
            const map = new Map();
            batches.flat().forEach((item) => {
              const id = String(item._id || "");
              if (!id || map.has(id)) return;
              map.set(id, item);
            });
            setProperties([...map.values()]);
          }),
        );
      } else setProperties([]);

      if (need.has("payments")) {
        tasks.push(
          Promise.all([
            getUserPayments(userId, "paid").catch(() => ({ data: [] })),
            getUserPayments(userId, "failed").catch(() => ({ data: [] })),
          ]).then(([paid, failed]) => {
            setPayments([
              ...pickItems(paid.data || paid).map((item) => ({ ...item, status: item.status || "paid" })),
              ...pickItems(failed.data || failed).map((item) => ({ ...item, status: item.status || "failed" })),
            ]);
          }),
        );
      } else setPayments([]);

      await Promise.all(tasks);
    } catch (error) {
      toast.error(error?.message || "Unable to load work data");
    } finally {
      setLoadingWork(false);
    }
  };

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const member = await loadProfile();
      const memberRole = member?.roleName || member?.role?.name || searchParams.get("role") || "";
      await loadWork(memberRole);
    } catch {
      toast.error("Unable to load team member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Date / status / search filter client-side only — do not re-fetch on every change.
  useEffect(() => {
    syncUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datePreset, fromDate, toDate, activeOnly, statusFilter, search, tab]);

  const filterOpts = useMemo(
    () => ({ range: dateRange, activeOnly, status: statusFilter, search }),
    [dateRange, activeOnly, statusFilter, search],
  );

  const filteredTickets = useMemo(() => applyListFilters(tickets, filterOpts), [tickets, filterOpts]);
  const filteredProjects = useMemo(() => applyListFilters(projects, filterOpts), [projects, filterOpts]);
  const filteredProperties = useMemo(() => applyListFilters(properties, filterOpts), [properties, filterOpts]);
  const filteredPayments = useMemo(() => applyListFilters(payments, filterOpts), [payments, filterOpts]);
  const openTickets = filteredTickets.filter(isActiveItem);

  const location = [user?.locality, user?.city, user?.state, user?.pincode].filter(Boolean).join(", ");
  const accountActive = user?.accountStatus === "active" && user?.isActive !== false;
  const scrollMax = viewAll ? "max-h-[70vh]" : "max-h-72";

  const openProject = (project) => navigate(`/post-property/${project._id}`);
  const openProperty = (property) => navigate(`/edit-property/${property._id}`);
  const openTicket = (ticket) =>
    navigate("/tickets", { state: { focusTicketId: ticket._id, ticketNumber: ticket.ticketNumber } });

  if (loading && !user) {
    return <div className="grid min-h-[40vh] place-items-center text-xs font-semibold text-slate-500">Loading…</div>;
  }
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="font-bold text-slate-800">Member not found</p>
        <button type="button" onClick={() => navigate("/dashboard/team-management")} className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
          Back
        </button>
      </div>
    );
  }

  const listForTab =
    tab === "tickets"
      ? filteredTickets
      : tab === "projects"
        ? filteredProjects
        : tab === "properties"
          ? filteredProperties
          : tab === "payments"
            ? filteredPayments
            : [];

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-6xl space-y-3">
        {/* Compact top bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/dashboard/team-management${roleFromQuery || roleName ? `?role=${encodeURIComponent(roleFromQuery || roleName)}` : ""}`,
              )
            }
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600"
          >
            <ArrowLeft size={12} /> Roles
          </button>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600"
          >
            <RefreshCw size={12} className={loadingWork ? "animate-spin" : ""} /> Refresh
          </button>
          {/* Selected role name from Team Management */}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black text-white">
            {displayRoleTitle}
          </span>
        </div>

        {/* Compact person + stats */}
        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span>Team Management</span>
            <span className="text-slate-300">›</span>
            <span className="text-emerald-700">{displayRoleTitle}</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800">{user.name || "Member"}</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Role · {displayRoleTitle}
              </p>
              <h1 className="truncate text-lg font-black text-slate-900">{user.name || "Unnamed"}</h1>
              <p className="text-[11px] text-slate-500">{profile.primaryJob}</p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                  {displayRoleTitle}
                </span>
                <span className={`rounded-full px-2 py-0.5 font-bold capitalize ${accountActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {String(user.accountStatus || "pending").replace(/_/g, " ")}
                </span>
                {user.email ? <span className="inline-flex items-center gap-1"><Mail size={10} />{user.email}</span> : null}
                {user.phone ? <span className="inline-flex items-center gap-1"><Phone size={10} />{user.phone}</span> : null}
                <span className="inline-flex items-center gap-1"><MapPin size={10} className="text-emerald-600" />{location || "No location"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(panels.includes("tickets") || panels.includes("overview")) && (
                <MiniStat label="Active tickets" value={openTickets.length} sub={`${filteredTickets.length}/${tickets.length}`} />
              )}
              {panels.includes("projects") && (
                <MiniStat label="Projects" value={filteredProjects.length} sub={`of ${projects.length}`} />
              )}
              {panels.includes("properties") && (
                <MiniStat label="Properties" value={filteredProperties.length} sub={`of ${properties.length}`} />
              )}
              {panels.includes("payments") && (
                <MiniStat label="Payments" value={filteredPayments.length} sub={`of ${payments.length}`} />
              )}
            </div>
          </div>
        </section>

        {/* Compact filters */}
        <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={12} className="text-emerald-600" />
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setDatePreset(preset.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                  datePreset === preset.key ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
            <label className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
              Active only
            </label>
            <div className="relative min-w-[140px] flex-1">
              <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-md border border-slate-200 py-1 pl-7 pr-2 text-[10px] font-semibold"
              />
            </div>
            <button type="button" onClick={() => { setDatePreset("all"); setFromDate(""); setToDate(""); setActiveOnly(false); setStatusFilter("all"); setSearch(""); }} className="text-[10px] font-bold text-slate-400 hover:text-emerald-700">
              <X size={12} />
            </button>
          </div>
          {datePreset === "custom" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1 text-[10px]" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1 text-[10px]" />
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-slate-400">
            Time filter:{" "}
            <span className="font-bold text-slate-600">
              {datePreset === "all"
                ? "All time"
                : datePreset === "custom"
                  ? `${fromDate || "…"} → ${toDate || "…"}`
                  : DATE_PRESETS.find((p) => p.key === datePreset)?.label}
            </span>
            {" · "}
            Projects {filteredProjects.length}/{projects.length}
            {" · "}
            Properties {filteredProperties.length}/{properties.length}
            {" · "}
            Tickets {filteredTickets.length}/{tickets.length}
            {activeOnly ? " · Active only" : ""}
          </p>
        </section>

        {/* Same-page work switcher (replaces navigate links) */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
            {panels.map((key) => {
              const meta = TAB_META[key];
              if (!meta) return null;
              const Icon = meta.icon;
              const on = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold ${
                    on ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-emerald-50"
                  }`}
                >
                  <Icon size={12} /> {meta.label}
                </button>
              );
            })}
          </div>

          {/* Role module chips → switch panel on THIS page */}
          <div className="flex flex-wrap gap-1 border-b border-slate-50 px-2 py-1.5">
            <span className="self-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Their work</span>
            {(profile.modules || []).map((module) => {
              const target = moduleToTab(module);
              if (!panels.includes(target) && target !== "overview") return null;
              const on = tab === target;
              return (
                <button
                  key={`${module.path}-${module.label}`}
                  type="button"
                  onClick={() => setTab(panels.includes(target) ? target : "overview")}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    on ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {module.label}
                </button>
              );
            })}
            {(profile.actions || []).map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => setTab(action.tab)}
                className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Fixed-height scroll data container */}
          <div className={`overflow-y-auto p-2 ${scrollMax}`}>
            {loadingWork ? (
              <p className="py-8 text-center text-xs text-slate-400">Loading work…</p>
            ) : tab === "overview" ? (
              <div className="grid gap-2 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2">
                  <p className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Job steps
                  </p>
                  <ol className="space-y-1">
                    {(profile.steps || []).map((step, index) => (
                      <li key={step} className="flex gap-2 rounded-md bg-white px-2 py-1.5 text-[11px] text-slate-700">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-600 text-[9px] font-black text-white">{index + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="space-y-2">
                  {panels.includes("tickets") && (
                    <InlineList
                      title={`Tickets (${openTickets.length} active)`}
                      empty="No tickets"
                      onViewAll={() => setTab("tickets")}
                      items={openTickets.slice(0, viewAll ? 50 : 6)}
                      render={(t) => (
                        <WorkRow
                          title={titleOf(t)}
                          meta={`${t.status || "—"} · ${fmtDate(t.updatedAt || t.createdAt)}`}
                          badge={t.priority || t.status}
                          onOpen={() => openTicket(t)}
                        />
                      )}
                    />
                  )}
                  {panels.includes("projects") && (
                    <InlineList
                      title={`Projects (${filteredProjects.length})`}
                      empty="No projects"
                      onViewAll={() => setTab("projects")}
                      items={filteredProjects.slice(0, viewAll ? 50 : 6)}
                      render={(p) => (
                        <WorkRow
                          title={titleOf(p)}
                          meta={`${p._projectType || p.type || "project"} · ${fmtDate(p.createdAt)}`}
                          badge={p.promotionStatus || p.status}
                          onOpen={() => openProject(p)}
                        />
                      )}
                    />
                  )}
                  {panels.includes("properties") && (
                    <InlineList
                      title={`Properties (${filteredProperties.length})`}
                      empty="No properties"
                      onViewAll={() => setTab("properties")}
                      items={filteredProperties.slice(0, viewAll ? 50 : 6)}
                      render={(p) => (
                        <WorkRow
                          title={titleOf(p)}
                          meta={`${p._category || "property"} · ${fmtDate(p.createdAt)}`}
                          badge={p.status || p.listingStatus}
                          onOpen={() => openProperty(p)}
                        />
                      )}
                    />
                  )}
                  {panels.includes("payments") && (
                    <InlineList
                      title={`Payments (${filteredPayments.length})`}
                      empty="No payments"
                      onViewAll={() => setTab("payments")}
                      items={filteredPayments.slice(0, viewAll ? 50 : 6)}
                      render={(p) => (
                        <WorkRow
                          title={titleOf(p)}
                          meta={`₹${Number(p.amount || 0).toLocaleString("en-IN")} · ${fmtDate(p.createdAt || p.paymentDate)}`}
                          badge={p.status}
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            ) : listForTab.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <UserRound className="mx-auto mb-1 text-slate-300" size={28} />
                No {TAB_META[tab]?.label?.toLowerCase() || "data"} in these filters
              </div>
            ) : (
              <div className="space-y-1">
                {listForTab.map((item) => {
                  if (tab === "tickets") {
                    return (
                      <WorkRow
                        key={item._id}
                        title={titleOf(item)}
                        meta={`${item.ticketNumber || item._id} · ${fmtDate(item.updatedAt || item.createdAt)}`}
                        badge={item.status}
                        onOpen={() => openTicket(item)}
                      />
                    );
                  }
                  if (tab === "projects") {
                    return (
                      <WorkRow
                        key={item._id}
                        title={titleOf(item)}
                        meta={`${item._projectType || item.type || "project"} · ${[item.city, item.state].filter(Boolean).join(", ") || "—"} · ${fmtDate(item.createdAt)}`}
                        badge={item.promotionStatus || item.status}
                        onOpen={() => openProject(item)}
                      />
                    );
                  }
                  if (tab === "properties") {
                    return (
                      <WorkRow
                        key={item._id}
                        title={titleOf(item)}
                        meta={`${item._category || "property"} · ${[item.city, item.state].filter(Boolean).join(", ") || "—"} · ${fmtDate(item.createdAt)}`}
                        badge={item.status || item.listingStatus}
                        onOpen={() => openProperty(item)}
                      />
                    );
                  }
                  return (
                    <WorkRow
                      key={item._id}
                      title={titleOf(item)}
                      meta={`₹${Number(item.amount || 0).toLocaleString("en-IN")} · ${fmtDate(item.createdAt || item.paymentDate)}`}
                      badge={item.status}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5">
            <p className="text-[10px] text-slate-400">
              {tab === "overview"
                ? "Preview on this page"
                : `${listForTab.length} item(s) · scroll inside box`}
            </p>
            <button
              type="button"
              onClick={() => setViewAll((v) => !v)}
              className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100"
            >
              {viewAll ? "Show less" : "View all · expand"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-right">
      <p className="text-[9px] font-bold uppercase text-slate-400">{label}</p>
      <p className="text-base font-black text-slate-800">{value}</p>
      {sub ? <p className="text-[9px] font-semibold text-slate-400">{sub}</p> : null}
    </div>
  );
}

function Badge({ value }) {
  if (!value) return null;
  return (
    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize ${statusTone(value)}`}>
      {String(value).replace(/_/g, " ")}
    </span>
  );
}

function WorkRow({ title, meta, badge, onOpen }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2 py-1.5 hover:border-emerald-200">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-slate-800">{title}</p>
        <p className="truncate text-[10px] text-slate-400">{meta}</p>
      </div>
      <Badge value={badge} />
      {onOpen ? (
        <button type="button" onClick={onOpen} className="shrink-0 text-emerald-600" title="Open detail">
          <ExternalLink size={12} />
        </button>
      ) : null}
    </div>
  );
}

function InlineList({ title, empty, items, render, onViewAll }) {
  return (
    <div className="rounded-lg border border-slate-100 p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <button type="button" onClick={onViewAll} className="text-[9px] font-bold text-emerald-700 hover:underline">
          View all
        </button>
      </div>
      {items.length ? <div className="space-y-1">{items.map((item) => <div key={item._id}>{render(item)}</div>)}</div> : (
        <p className="py-3 text-center text-[10px] text-slate-400">{empty}</p>
      )}
    </div>
  );
}
