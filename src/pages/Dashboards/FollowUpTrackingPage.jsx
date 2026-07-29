import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { getAllUsers, getUserDetails } from "../../features/user/userService";
import { getUserWorkingLocations } from "../../features/accessControl/accessControlService";
import {
  followUpTrackHref,
  inventoryPeriodHref,
  usersPeriodHref,
} from "./superAdminDashboard/superAdminDashboardData";
import {
  FOLLOW_UP_DATE_PRESETS,
  rangeFromPreset,
  todayIso,
} from "./shared/dashboardDateRange";
import FollowUpInventoryWorkspace from "./followUpTracking/FollowUpInventoryWorkspace";
import FollowUpWorkStatusSelect, {
  followUpWorkLabel,
  normalizeFollowUpWorkStatus,
} from "./followUpTracking/FollowUpWorkStatusSelect";
import {
  formatTerritoryLabel,
  isCustomerCareExecutiveRole,
  sanitizeWorkingLocations,
} from "../../utils/workingLocations";

const ONBOARDING = new Set(["location_pending", "kyc_pending", "pending", "incomplete"]);
const USER_PAGE_SIZE = 40;

const TRACK_META = {
  created_today: {
    label: "New signups today",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  created_period: {
    label: "New signups (date range)",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  login_today: {
    label: "Logged in today",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  active_success: {
    label: "Active accounts",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  stuck_location: {
    label: "Stuck at location step",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  stuck_kyc: {
    label: "Stuck at KYC step",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  kyc_rejected: {
    label: "KYC rejected",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  onboarding_all: {
    label: "All incomplete onboarding",
    group: "User journey",
    groupId: "user_journey",
    kind: "users",
  },
  owners: {
    label: "Owners / end users",
    group: "Roles",
    groupId: "roles",
    kind: "users",
    role: "user",
  },
  agents: {
    label: "Agents",
    group: "Roles",
    groupId: "roles",
    kind: "users",
    role: "agent",
  },
  builders: {
    label: "Builders",
    group: "Roles",
    groupId: "roles",
    kind: "users",
    role: "builder",
  },
  builder_staff: {
    label: "Builder staff",
    group: "Roles",
    groupId: "roles",
    kind: "users",
    role: "builder_staff",
  },
  property_pending: {
    label: "Awaiting approval",
    group: "Properties",
    groupId: "properties",
    kind: "inventory",
    entity: "property",
    path: "/properties",
    status: "pending",
  },
  property_active: {
    label: "Live / active",
    group: "Properties",
    groupId: "properties",
    kind: "inventory",
    entity: "property",
    path: "/properties",
    status: "active",
  },
  property_draft: {
    label: "Draft / incomplete",
    group: "Properties",
    groupId: "properties",
    kind: "inventory",
    entity: "property",
    path: "/properties",
    status: "draft",
  },
  property_rejected: {
    label: "Rejected",
    group: "Properties",
    groupId: "properties",
    kind: "inventory",
    entity: "property",
    path: "/properties",
    status: "rejected",
  },
  project_pending: {
    label: "Awaiting approval",
    group: "Projects",
    groupId: "projects",
    kind: "inventory",
    entity: "project",
    path: "/projects",
    status: "pending",
  },
  project_active: {
    label: "Live / active",
    group: "Projects",
    groupId: "projects",
    kind: "inventory",
    entity: "project",
    path: "/projects",
    status: "active",
  },
  project_draft: {
    label: "Draft / incomplete",
    group: "Projects",
    groupId: "projects",
    kind: "inventory",
    entity: "project",
    path: "/projects",
    status: "draft",
  },
};

const TRACK_GROUPS = [
  {
    id: "user_journey",
    label: "User journey",
    hint: "Signup, login & onboarding stages",
  },
  {
    id: "roles",
    label: "Roles",
    hint: "Owners, agents, builders",
  },
  {
    id: "properties",
    label: "Properties",
    hint: "Listing approval status",
  },
  {
    id: "projects",
    label: "Projects",
    hint: "Project approval status",
  },
];

const tracksForGroup = (groupId) =>
  Object.entries(TRACK_META)
    .filter(([, meta]) => meta.groupId === groupId)
    .map(([key, meta]) => ({ key, ...meta }));

const DEFAULT_TRACK_BY_GROUP = {
  user_journey: "onboarding_all",
  roles: "owners",
  properties: "property_pending",
  projects: "project_pending",
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

const normalizeRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const isFollowUpOversightRole = (roleName = "") => {
  const key = normalizeRole(roleName);
  return (
    key === "super_admin" ||
    key === "admin" ||
    key === "team_lead" ||
    key === "customer_support_team_lead" ||
    key === "team_leads" ||
    key.includes("team_lead") ||
    key.includes("support_head") ||
    key === "customer_support_head"
  );
};

const assigneeIdOf = (user) => {
  const raw = user?.followUpAssignedTo;
  return String(raw?._id || raw || "").trim();
};

const workStatusOf = (user, overrides = {}) => {
  const id = String(user?._id || user?.id || "");
  if (id && overrides[id]) return normalizeFollowUpWorkStatus(overrides[id]);
  return normalizeFollowUpWorkStatus(user?.followUpWorkStatus);
};

const journeyStage = (user) => {
  const status = String(user?.accountStatus || "").toLowerCase();
  if (status === "location_pending") return { key: "location", label: "Stuck at location", tone: "amber" };
  if (status === "kyc_pending") return { key: "kyc", label: "Stuck at KYC", tone: "amber" };
  if (status === "kyc_rejected") return { key: "rejected", label: "KYC rejected", tone: "rose" };
  if (status === "pending" || status === "incomplete") return { key: "pending", label: "Onboarding", tone: "violet" };
  if (status === "active") return { key: "active", label: "Active / success", tone: "emerald" };
  return { key: "other", label: status || "Unknown", tone: "slate" };
};

const stageTone = {
  amber: "bg-amber-100 text-amber-800",
  rose: "bg-rose-100 text-rose-800",
  violet: "bg-violet-100 text-violet-800",
  emerald: "bg-emerald-100 text-emerald-800",
  slate: "bg-slate-100 text-slate-700",
};

const unpackUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const inCreatedPeriod = (value, range) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return false;
  if (range.from && ms < new Date(`${range.from}T00:00:00`).getTime()) return false;
  if (range.to && ms > new Date(`${range.to}T23:59:59.999`).getTime()) return false;
  return true;
};

const matchesTrack = (user, trackKey, range) => {
  const status = String(user?.accountStatus || "").toLowerCase();
  const role = normalizeRole(user?.roleName || user?.role);
  const inPeriod = inCreatedPeriod(user?.createdAt, range);
  const loginInPeriod = inCreatedPeriod(user?.lastLoginAt, range);

  switch (trackKey) {
    case "created_today":
      return inPeriod;
    case "created_period":
      return inPeriod && ["user", "owner", "agent", "builder", "builder_staff"].includes(role);
    case "login_today":
      return (
        loginInPeriod && ["user", "owner", "agent", "builder", "builder_staff"].includes(role)
      );
    case "active_success":
      return status === "active" && inPeriod;
    case "stuck_location":
      return status === "location_pending" && inPeriod;
    case "stuck_kyc":
      return status === "kyc_pending" && inPeriod;
    case "kyc_rejected":
      return status === "kyc_rejected" && inPeriod;
    case "onboarding_all":
      return ONBOARDING.has(status) && inPeriod;
    case "owners":
      return inPeriod && ["user", "owner", "buyer", "tenant"].includes(role);
    case "agents":
      return inPeriod && role === "agent";
    case "builders":
      return inPeriod && role === "builder";
    case "builder_staff":
      return inPeriod && role === "builder_staff";
    default:
      return false;
  }
};

const userIdOf = (user) => String(user?._id || user?.id || user?.userId || "");

const inferPresetFromRange = (from, to) => {
  if (!from || !to) return "30d";
  for (const item of FOLLOW_UP_DATE_PRESETS) {
    if (item.key === "custom") continue;
    const resolved = rangeFromPreset(item.key);
    if (resolved.from === from && resolved.to === to) return item.key;
  }
  return "custom";
};

export default function FollowUpTrackingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [workStatusOverrides, setWorkStatusOverrides] = useState({});

  const track = searchParams.get("track") || "onboarding_all";
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";
  const urlPreset = searchParams.get("preset") || "";

  const preset =
    urlPreset ||
    (urlFrom && urlTo ? inferPresetFromRange(urlFrom, urlTo) : track === "created_today" ? "today" : "30d");

  const resolvedRange = useMemo(() => {
    if (preset === "custom" && urlFrom && urlTo) {
      return rangeFromPreset("custom", { from: urlFrom, to: urlTo });
    }
    if (urlFrom && urlTo && !urlPreset) {
      return { from: urlFrom, to: urlTo, label: `${urlFrom} → ${urlTo}` };
    }
    return rangeFromPreset(preset === "custom" ? "30d" : preset);
  }, [preset, urlFrom, urlTo, urlPreset]);

  const range = {
    from: resolvedRange.from || (track === "created_today" ? todayIso() : ""),
    to: resolvedRange.to || (track === "created_today" ? todayIso() : ""),
  };

  const [customFrom, setCustomFrom] = useState(() => range.from || todayIso());
  const [customTo, setCustomTo] = useState(() => range.to || todayIso());

  useEffect(() => {
    setCustomFrom(range.from || todayIso());
    setCustomTo(range.to || todayIso());
  }, [range.from, range.to]);

  const meta = TRACK_META[track] || TRACK_META.onboarding_all;

  const writeParams = (next = {}) => {
    const params = new URLSearchParams();
    const nextTrack = next.track ?? track;
    const nextPreset = next.preset ?? preset;
    const nextFrom = next.from ?? range.from;
    const nextTo = next.to ?? range.to;
    params.set("track", nextTrack);
    if (nextPreset) params.set("preset", nextPreset);
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    setSearchParams(params, { replace: true });
  };

  const selectPreset = (nextPreset) => {
    if (nextPreset === "custom") {
      const from = range.from || todayIso();
      const to = range.to || todayIso();
      setCustomFrom(from);
      setCustomTo(to);
      writeParams({ preset: "custom", from, to });
      return;
    }
    const resolved = rangeFromPreset(nextPreset);
    writeParams({ preset: nextPreset, from: resolved.from, to: resolved.to });
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) return;
    const from = customFrom <= customTo ? customFrom : customTo;
    const to = customFrom <= customTo ? customTo : customFrom;
    writeParams({ preset: "custom", from, to });
  };

  const usersQuery = useQuery({
    queryKey: ["follow-up-tracking", "users", range.from, range.to, track],
    enabled: meta.kind === "users",
    queryFn: async () => {
      const params = {};
      if (range.from) params.createdFrom = range.from;
      if (range.to) params.createdTo = range.to;
      const needsAll =
        track === "login_today" ||
        track === "stuck_location" ||
        track === "stuck_kyc" ||
        track === "kyc_rejected" ||
        track === "onboarding_all";
      const response = await getAllUsers(needsAll ? undefined : params);
      return unpackUsers(response?.data);
    },
    staleTime: 60_000,
  });

  const meQuery = useQuery({
    queryKey: ["follow-up-tracking", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const me = meQuery.data;
  const meId = String(me?._id || me?.id || "");
  const isCceViewer = isCustomerCareExecutiveRole(me?.roleName || me?.role);
  const isOversightViewer = isFollowUpOversightRole(me?.roleName || me?.role);

  /** Creator → exclusive CCE map (inventory must not share across same-territory CCEs). */
  const creatorAssigneeQuery = useQuery({
    queryKey: ["follow-up-tracking", "creator-assignees"],
    enabled: Boolean(isCceViewer && meId),
    queryFn: async () => {
      const response = await getAllUsers();
      const list = unpackUsers(response?.data);
      const map = {};
      list.forEach((u) => {
        const id = userIdOf(u);
        const owner = assigneeIdOf(u);
        if (id && owner) map[id] = owner;
      });
      return map;
    },
    staleTime: 60_000,
  });

  const creatorAssigneeById = creatorAssigneeQuery.data || {};

  const canEditWorkStatus = (user) => {
    if (!user) return false;
    if (isOversightViewer) return true;
    if (!isCceViewer || !meId) return false;
    return assigneeIdOf(user) === meId;
  };

  const handleWorkStatusUpdated = (userId, nextStatus) => {
    const id = String(userId || "");
    if (!id) return;
    setWorkStatusOverrides((prev) => ({ ...prev, [id]: nextStatus }));
    queryClient.setQueryData(
      ["follow-up-tracking", "users", range.from, range.to, track],
      (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((u) =>
          userIdOf(u) === id ? { ...u, followUpWorkStatus: nextStatus } : u,
        );
      },
    );
  };

  const territoriesQuery = useQuery({
    queryKey: ["follow-up-tracking", "territories", meId],
    enabled: Boolean(isCceViewer && meId),
    queryFn: async () => {
      const payload = await getUserWorkingLocations(meId);
      const data = payload?.data || payload || {};
      const list = sanitizeWorkingLocations(data.workingLocations);
      if (list.length) return list;
      return sanitizeWorkingLocations([
        {
          state: data.homeLocation?.state || me?.state || "",
          city: data.homeLocation?.city || me?.city || "",
          locality: data.homeLocation?.locality || me?.locality || "",
        },
      ]);
    },
    staleTime: 120_000,
  });

  const cceTerritories = territoriesQuery.data || [];
  const territoryScoped = isCceViewer && cceTerritories.length > 0;

  const rows = useMemo(() => {
    if (meta.kind !== "users") return [];
    let list = (usersQuery.data || []).filter((u) => matchesTrack(u, track, range));

    // CCE exclusivity: only cases assigned to this executive (one owner per user).
    // Territory is still used as a soft check when assignee is missing (legacy).
    if (territoryScoped) {
      list = list.filter((u) => {
        const raw = u.followUpAssignedTo;
        const assigneeId = String(raw?._id || raw || "").trim();
        if (assigneeId) return assigneeId === meId;
        return false;
      });
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) =>
      `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.roleName || ""} ${u.accountStatus || ""} ${u.state || ""} ${u.city || ""} ${u.locality || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [
    meta.kind,
    usersQuery.data,
    track,
    range.from,
    range.to,
    search,
    territoryScoped,
    meId,
  ]);

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
    setSearch("");
  }, [track, range.from, range.to]);

  const totalPages = Math.max(1, Math.ceil(rows.length / USER_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * USER_PAGE_SIZE, safePage * USER_PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    if (meta.kind !== "users") return;
    if (!pageRows.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !pageRows.some((u) => userIdOf(u) === selectedId)) {
      setSelectedId(userIdOf(pageRows[0]));
    }
  }, [meta.kind, pageRows, selectedId]);

  const selectedUser = useMemo(
    () => rows.find((u) => userIdOf(u) === selectedId) || null,
    [rows, selectedId],
  );

  const selectTrack = (nextTrack) => {
    writeParams({ track: nextTrack });
  };

  const openFullList = () => {
    if (meta.kind === "inventory") {
      navigate(inventoryPeriodHref(meta.path, range, { status: meta.status }));
      return;
    }
    if (track === "owners") {
      navigate(
        range.from && range.to
          ? `/owners?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
          : "/owners",
      );
      return;
    }
    if (track === "agents") {
      navigate(
        range.from && range.to
          ? `/all-agents?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
          : "/all-agents",
      );
      return;
    }
    if (track === "builders") {
      navigate(
        range.from && range.to
          ? `/builders?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
          : "/builders",
      );
      return;
    }
    if (track === "builder_staff") {
      navigate(
        range.from && range.to
          ? `/builder-staff?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
          : "/builder-staff",
      );
      return;
    }
    if (track === "stuck_location") navigate(usersPeriodHref(range, { status: "location_pending" }));
    else if (track === "stuck_kyc") navigate(usersPeriodHref(range, { status: "kyc_pending" }));
    else if (track === "kyc_rejected") navigate(usersPeriodHref(range, { status: "kyc_rejected" }));
    else if (track === "onboarding_all") navigate(usersPeriodHref(range, { filter: "onboarding" }));
    else if (track === "active_success") navigate(usersPeriodHref(range, { status: "active" }));
    else navigate(usersPeriodHref(range, {}));
  };

  const exportUsersExcel = () => {
    if (!rows.length) return;
    setExporting(true);
    try {
      const sheetRows = rows.map((user, index) => {
        const stage = journeyStage(user);
        return {
          SNo: index + 1,
          PeriodFrom: range.from || "",
          PeriodTo: range.to || "",
          Track: meta.label || "",
          Name: user.name || "",
          Role: user.roleName || user.role || "",
          State: user.state || "",
          City: user.city || "",
          Locality: user.locality || "",
          JourneyStage: stage.label,
          AccountStatus: user.accountStatus || "",
          KycStatus: user.kyc?.status || "",
          Phone: user.phone || "",
          Email: user.email || "",
          CreatedAt: user.createdAt ? new Date(user.createdAt).toLocaleString("en-IN") : "",
          LastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN") : "",
          UserId: userIdOf(user),
          FollowUpProcess: followUpWorkLabel(workStatusOf(user, workStatusOverrides)),
        };
      });
      const ws = XLSX.utils.json_to_sheet(sheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, (meta.label || "Users").slice(0, 28));
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const periodTag =
        range.from && range.to ? `${range.from}_to_${range.to}` : todayIso();
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }),
        `follow-up-${String(meta.label || "users")
          .toLowerCase()
          .replace(/\s+/g, "-")}-${periodTag}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  const selectedStage = selectedUser ? journeyStage(selectedUser) : null;
  const rangeLabel =
    resolvedRange.label ||
    (range.from && range.to ? `${range.from} → ${range.to}` : "All time");

  return (
    <div className="mx-auto max-w-[1480px] space-y-3 pb-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900">Client Progress Queue</h1>
            <p className="text-[11px] text-slate-500">
              Assigned cases for onboarding, KYC and inventory · {meta.group} · {meta.label}
              <span className="mx-1 text-slate-300">·</span>
              {rangeLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meta.kind === "users" ? (
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={13} className={usersQuery.isFetching ? "animate-spin" : ""} /> Refresh
            </button>
          ) : null}
          <button
            type="button"
            onClick={openFullList}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Open full list <ExternalLink size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
        <span className="inline-flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          Date range
        </span>
        {FOLLOW_UP_DATE_PRESETS.map((item) => {
          const active = preset === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => selectPreset(item.key)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
        {preset === "custom" ? (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 py-1">
            <CalendarRange className="h-3.5 w-3.5 text-emerald-600" />
            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              From
              <input
                type="date"
                value={customFrom || ""}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400"
              />
            </label>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              To
              <input
                type="date"
                value={customTo || ""}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400"
              />
            </label>
            <button
              type="button"
              onClick={applyCustomRange}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              <Search className="h-3 w-3" />
              Apply
            </button>
          </div>
        ) : null}
        <span className="ml-auto hidden text-[10px] text-slate-400 sm:inline">
          Filtered list + Excel use this period
        </span>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          Follow-up status
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
          <label className="min-w-0">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Category
            </span>
            <select
              value={meta.groupId || "user_journey"}
              onChange={(e) => {
                const groupId = e.target.value;
                const options = tracksForGroup(groupId);
                const keep =
                  options.some((item) => item.key === track) ? track : DEFAULT_TRACK_BY_GROUP[groupId];
                selectTrack(keep || options[0]?.key || "onboarding_all");
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {TRACK_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[10px] text-slate-400">
              {TRACK_GROUPS.find((g) => g.id === (meta.groupId || "user_journey"))?.hint || ""}
            </span>
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Status
            </span>
            <select
              value={track}
              onChange={(e) => selectTrack(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {tracksForGroup(meta.groupId || "user_journey").map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[10px] text-slate-400">
              Showing: <strong className="font-semibold text-slate-600">{meta.label}</strong>
            </span>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                writeParams({
                  track: "onboarding_all",
                  preset: "today",
                  from: todayIso(),
                  to: todayIso(),
                });
                setSearch("");
                setPage(1);
              }}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:w-auto"
            >
              <X size={13} />
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {territoryScoped ? (
        <div className="flex flex-wrap items-start gap-2 rounded-[14px] border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[11px] text-white shadow-sm">
          <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className="font-bold text-slate-100">
              Showing only cases assigned to you
            </p>
            <p className="mt-0.5 text-slate-300">
              Territories: {cceTerritories.map(formatTerritoryLabel).join(" · ")}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Each follow-up is owned by one executive. Same location as another CCE does not
              share the case (people + their properties/projects).
            </p>
          </div>
        </div>
      ) : null}

      {meta.kind === "inventory" ? (
        <FollowUpInventoryWorkspace
          meta={meta}
          range={range}
          territoryFilter={territoryScoped ? cceTerritories : null}
          exclusiveAssigneeId={territoryScoped ? meId : null}
          creatorAssigneeById={territoryScoped ? creatorAssigneeById : null}
          onRefreshUsers={() => {
            usersQuery.refetch();
            creatorAssigneeQuery.refetch();
          }}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
              <p className="text-xs font-bold text-slate-900">
                {rows.length.toLocaleString("en-IN")} people · journey stage for CCE follow-up
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="relative block w-full min-w-[200px] max-w-xs">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, phone, email…"
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-emerald-400"
                  />
                </label>
                <button
                  type="button"
                  disabled={!rows.length || exporting}
                  onClick={exportUsersExcel}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  Excel
                </button>
              </div>
            </header>

            {usersQuery.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : !rows.length ? (
              <p className="py-12 text-center text-xs text-slate-400">
                {territoryScoped
                  ? "No people in your territories for this track"
                  : "No people in this track"}
              </p>
            ) : (
              <>
                <div className="max-h-[min(62vh,640px)] overflow-auto">
                  <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 shadow-sm">
                      <tr>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">Name</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">Role</th>
                        <th className="min-w-[140px] whitespace-nowrap px-3 py-2.5 text-left font-bold">
                          Location
                        </th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">
                          Journey stage
                        </th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">KYC</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">Created</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-left font-bold">
                          Last login
                        </th>
                        <th className="min-w-[140px] whitespace-nowrap px-3 py-2.5 text-left font-bold">
                          Contact
                        </th>
                        <th className="sticky right-0 z-10 w-[132px] min-w-[132px] whitespace-nowrap bg-slate-50 px-3 py-2.5 text-left font-bold shadow-[-8px_0_10px_-8px_rgba(15,23,42,0.14)]">
                          Process
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((user) => {
                        const stage = journeyStage(user);
                        const id = userIdOf(user);
                        const active = id === selectedId;
                        const loc = [user.locality, user.city, user.state]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <tr
                            key={id}
                            onClick={() => setSelectedId(id)}
                            className={`cursor-pointer border-t border-slate-100 ${
                              active ? "bg-emerald-50/80" : "hover:bg-emerald-50/40"
                            }`}
                          >
                            <td className="align-middle px-3 py-2.5 font-semibold text-slate-900">
                              <span className="line-clamp-1">{user.name || "—"}</span>
                            </td>
                            <td className="align-middle whitespace-nowrap px-3 py-2.5 text-slate-600">
                              {user.roleName || user.role || "—"}
                            </td>
                            <td className="align-middle px-3 py-2.5 text-slate-600">
                              <span className="line-clamp-1" title={loc || undefined}>
                                {loc || "—"}
                              </span>
                            </td>
                            <td className="align-middle whitespace-nowrap px-3 py-2.5">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold leading-none ${
                                  stageTone[stage.tone]
                                }`}
                              >
                                {stage.label}
                              </span>
                            </td>
                            <td className="align-middle whitespace-nowrap px-3 py-2.5 text-slate-600">
                              {user.kyc?.status || "—"}
                            </td>
                            <td className="align-middle whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">
                              {toDay(user.createdAt) || "—"}
                            </td>
                            <td className="align-middle whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">
                              {toDay(user.lastLoginAt) || "—"}
                            </td>
                            <td className="align-middle px-3 py-2.5 text-slate-600">
                              <div className="leading-tight">
                                <div className="whitespace-nowrap">{user.phone || "—"}</div>
                                <div className="mt-0.5 truncate text-[10px] text-slate-400">
                                  {user.email || ""}
                                </div>
                              </div>
                            </td>
                            <td
                              className={`sticky right-0 w-[132px] min-w-[132px] align-middle px-3 py-2.5 shadow-[-8px_0_10px_-8px_rgba(15,23,42,0.1)] ${
                                active ? "bg-emerald-50" : "bg-white"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {canEditWorkStatus(user) ? (
                                <FollowUpWorkStatusSelect
                                  userId={id}
                                  value={workStatusOf(user, workStatusOverrides)}
                                  compact
                                  onUpdated={handleWorkStatusUpdated}
                                />
                              ) : (
                                <span className="inline-flex h-8 items-center whitespace-nowrap rounded-lg bg-slate-100 px-2.5 text-[10px] font-bold text-slate-600">
                                  {followUpWorkLabel(workStatusOf(user, workStatusOverrides))}
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
                    Showing {(safePage - 1) * USER_PAGE_SIZE + 1}–
                    {Math.min(safePage * USER_PAGE_SIZE, rows.length)} of{" "}
                    {rows.length.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                <p className="text-xs font-bold text-slate-900">Person details</p>
                <p className="text-[10px] text-slate-500">CCE follow-up snapshot</p>
              </div>
              {selectedUser ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-50"
                >
                  <X size={14} />
                </button>
              ) : null}
            </header>
            {!selectedUser ? (
              <p className="px-4 py-12 text-center text-xs text-slate-400">
                Select a person from the list to preview details.
              </p>
            ) : (
              <div className="space-y-3 p-3.5">
                <div className="flex items-start gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <UserRound size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.name || "—"}</p>
                    <p className="text-[11px] text-slate-500">
                      {selectedUser.roleName || selectedUser.role || "—"}
                    </p>
                  </div>
                </div>
                {selectedStage ? (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      stageTone[selectedStage.tone]
                    }`}
                  >
                    {selectedStage.label}
                  </span>
                ) : null}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    CCE process
                  </p>
                  {canEditWorkStatus(selectedUser) ? (
                    <FollowUpWorkStatusSelect
                      userId={userIdOf(selectedUser)}
                      value={workStatusOf(selectedUser, workStatusOverrides)}
                      onUpdated={handleWorkStatusUpdated}
                    />
                  ) : (
                    <p className="text-xs font-semibold text-slate-700">
                      {followUpWorkLabel(workStatusOf(selectedUser, workStatusOverrides))}
                    </p>
                  )}
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Auto-starts as Assigned. Mark In progress or Completed after you work the case.
                    Journey stage stays separate.
                  </p>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="inline-flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    {selectedUser.phone || "—"}
                  </p>
                  <p className="text-slate-500">{selectedUser.email || "—"}</p>
                  <p className="inline-flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      {[selectedUser.locality, selectedUser.city, selectedUser.state]
                        .filter(Boolean)
                        .join(", ") || "Location not set"}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">KYC · </span>
                    {selectedUser.kyc?.status || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Created · </span>
                    {toDay(selectedUser.createdAt) || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Last login · </span>
                    {toDay(selectedUser.lastLoginAt) || "—"}
                  </p>
                </div>
                {userIdOf(selectedUser) ? (
                  <Link
                    to={`/dashboard/users/${userIdOf(selectedUser)}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Open profile <ExternalLink size={13} />
                  </Link>
                ) : null}
                <Link
                  to={followUpTrackHref("onboarding_all", range)}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  All onboarding track
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
