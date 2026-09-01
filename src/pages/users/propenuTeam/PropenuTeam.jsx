import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Check,
  ChevronDown,
  Hash,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MapPinned,
  Network,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ActivityFilterSelect from "../../Activity/components/ActivityFilterSelect";
import { useUsers } from "./hook/useUserData";
import {
  deleteAccessUser,
  getTeamDirectoryRoles,
  updateAccessUserStatus,
} from "../../../features/accessControl/accessControlService";
import { getUserDetails } from "../../../features/user/userService";
import {
  orderRolesByHierarchy,
  getExactRoleMatch,
  userMatchesExactRole,
  countUsersInExactRole,
  canonicalTeamRole,
} from "../../../utils/roleHierarchy";
import {
  canManageUserLifecycle,
  canUseLifecycleActions,
  normalizeLifecycleRole,
} from "../../../utils/userLifecycleAccess";
import CceTerritoryManagerModal from "../../Dashboards/customerSupportTeamLeadDashboard/components/CceTerritoryManagerModal";
import SafeUserDeleteModal from "../users/components/SafeUserDeleteModal";
import StaffProfileEditModal from "./components/StaffProfileEditModal";
import TeamMemberActionsMenu from "./components/TeamMemberActionsMenu";
import TeamMemberDetailModal from "./components/TeamMemberDetailModal";
import TeamDatePicker from "./components/TeamDatePicker";
import { isTerritoryRole } from "../../../utils/workingLocations";
import {
  filterUsersInReportingTree,
  shouldScopeTeamToReports,
} from "../../../utils/reportingTree";

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const cleanRole = (value = "") => String(value).replace(/_/g, " ");
/** Section / filter titles (plural bands). */
const TEAM_ROLE_LABELS = {
  ceo: "CEO",
  operations_head: "Operations Head",
  operation_head: "Operations Head",
  business_development_head: "Business Development Head",
  regional_manager: "Regional Managers",
  business_development_manager: "Business Development Manager",
  sales_manager: "Sales Manager",
  sales_agent: "Sales Executives",
  sales_executive: "Sales Executives",
  customer_support_team_lead: "Customer Support Team Leads",
  customer_support_team_leads: "Customer Support Team Leads",
  team_lead: "Customer Support Team Leads",
  team_leads: "Customer Support Team Leads",
  customer_support_head: "Customer Support Head",
  customer_care: "Customer Care Executives",
  customer_care_executive: "Customer Care Executives",
  customer_care_executives: "Customer Care Executives",
  relationship_manager: "Relationship Managers",
  relationship_managers: "Relationship Managers",
  accounts: "Accounts",
  legal_compliance: "Legal",
  hr_administration: "HR",
  marketing_head: "Marketing Head",
  digital_marketing: "Digital Marketing",
  social_media: "Social Media",
  content_team: "Content Team",
  creative_team: "Creative Team",
  performance_marketing: "Performance Marketing",
  technical_support_head: "Technical Support Head",
  technical_support_team: "Technical Support Team",
};
/** Single-person card/table role name (singular — matches DB role label). */
const PERSON_ROLE_LABELS = {
  customer_support_team_lead: "Customer Support Team Lead",
  customer_support_team_leads: "Customer Support Team Lead",
  team_lead: "Customer Support Team Lead",
  team_leads: "Customer Support Team Lead",
  customer_care: "Customer Care Executive",
  customer_care_executive: "Customer Care Executive",
  customer_care_executives: "Customer Care Executive",
  relationship_manager: "Relationship Manager",
  relationship_managers: "Relationship Manager",
  sales_agent: "Sales Executive",
  sales_executive: "Sales Executive",
  regional_manager: "Regional Manager",
};
const teamRoleLabel = (role) =>
  TEAM_ROLE_LABELS[canonicalTeamRole(role?.name)] ||
  TEAM_ROLE_LABELS[String(role?.name || "").toLowerCase()] ||
  role?.label ||
  cleanRole(role?.name);
/** Always show the real role title on a person (never raw slug like "team lead"). */
const personRoleLabel = (roleName, roleOptions = []) => {
  if (
    roleName == null ||
    roleName === "" ||
    String(roleName).toLowerCase() === "null" ||
    String(roleName).toLowerCase() === "undefined"
  ) {
    return "";
  }
  const key = canonicalTeamRole(roleName);
  const raw = String(roleName || "").toLowerCase();
  // Prefer canonical singular labels so table badges stay consistent
  // (DB labels like "Customer Care" can be short/legacy duplicates).
  if (PERSON_ROLE_LABELS[key] || PERSON_ROLE_LABELS[raw]) {
    return PERSON_ROLE_LABELS[key] || PERSON_ROLE_LABELS[raw];
  }
  const fromOptions = roleOptions.find(
    (role) =>
      canonicalTeamRole(role?.name) === key ||
      String(role?.name || "").toLowerCase() === String(roleName || "").toLowerCase(),
  );
  if (fromOptions?.label) return fromOptions.label;
  return TEAM_ROLE_LABELS[key] || cleanRole(roleName);
};
/** Title-case person names for table/cards (e.g. pawan → Pawan). */
const displayPersonName = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text
    .split(/\s+/)
    .map((part) =>
      part
        .split(/([-'.])/g)
        .map((chunk) =>
          /[-'.]/.test(chunk)
            ? chunk
            : chunk
              ? chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase()
              : "",
        )
        .join(""),
    )
    .join(" ");
};
const unique = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const raw = String(item || "").trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (map.has(key)) return;
    const label = raw
      .toLowerCase()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
    map.set(key, label);
  });
  return [...map.values()].sort((a, b) => String(a).localeCompare(String(b)));
};

const sameLoc = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() ===
  String(b || "")
    .trim()
    .toLowerCase();

export default function PropenuTeam() {
  const [searchParams] = useSearchParams();
  const listParams = useMemo(() => {
    const createdFrom =
      searchParams.get("createdFrom") || searchParams.get("from") || "";
    const createdTo =
      searchParams.get("createdTo") || searchParams.get("to") || "";
    const date = searchParams.get("date") || "";
    const joined = searchParams.get("joined");
    const day =
      date ||
      (joined === "today" ? todayIso() : "") ||
      (createdFrom && createdTo && createdFrom === createdTo ? createdFrom : "");
    const params = { scope: "team_directory" };
    if (day) {
      params.createdFrom = day;
      params.createdTo = day;
    } else {
      if (createdFrom) params.createdFrom = createdFrom;
      if (createdTo) params.createdTo = createdTo;
    }
    return params;
  }, [searchParams]);
  const { data: rawUsers = [], isLoading, refetch, isFetching } = useUsers(listParams);
  const [roleOptions, setRoleOptions] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [filters, setFilters] = useState({ role: "", state: "", city: "", locality: "", pincode: "", status: "", fromDate: "", toDate: "", search: "" });
  const [territoryMember, setTerritoryMember] = useState(null);
  const [viewerId, setViewerId] = useState("");
  const [viewerRole, setViewerRole] = useState("");
  const [viewerReady, setViewerReady] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [previewUser, setPreviewUser] = useState(null);

  const canUseLifecycle = canUseLifecycleActions(viewerRole);
  const canEditStaffProfiles =
    normalizeLifecycleRole(viewerRole) === "super_admin" ||
    normalizeLifecycleRole(viewerRole) === "admin";

  const canManageMember = useCallback(
    (user) =>
      canManageUserLifecycle({
        actorRole: viewerRole,
        targetRole: user?.roleName || user?.role || "",
        isSelf: Boolean(viewerId && String(user?._id || user?.id) === String(viewerId)),
      }),
    [viewerId, viewerRole],
  );

  const users = useMemo(() => {
    const list = Array.isArray(rawUsers) ? rawUsers : [];
    if (!viewerReady) return [];
    if (!shouldScopeTeamToReports(viewerRole) || !viewerId) return list;
    return filterUsersInReportingTree(list, viewerId);
  }, [rawUsers, viewerId, viewerReady, viewerRole]);

  const openTerritoryManager = (user) => {
    const id = String(user._id || user.id);
    setTerritoryMember({
      id,
      name: user.name || "Executive",
      email: user.email || "",
      role: personRoleLabel(user.roleName, roleOptions),
      roleKey: user.roleName,
      readOnly: Boolean(viewerId && id && viewerId === id),
    });
  };

  const changeUserActive = useCallback(
    async (user, isActive) => {
      if (!canUseLifecycle || !user?._id || !canManageMember(user)) return;
      setStatusBusyId(String(user._id));
      try {
        const result = await updateAccessUserStatus(user._id, isActive);
        toast.success(
          result?.message || (isActive ? "User activated" : "User deactivated"),
        );
        await refetch();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Unable to update user status",
        );
      } finally {
        setStatusBusyId("");
      }
    },
    [canManageMember, canUseLifecycle, refetch],
  );

  const confirmDeleteUser = useCallback(async () => {
    if (!canUseLifecycle || !deleteTarget?._id || !canManageMember(deleteTarget)) {
      return;
    }
    setDeleteLoading(true);
    try {
      const result = await deleteAccessUser(
        deleteTarget._id,
        normalizeLifecycleRole(viewerRole) === "business_development_head"
          ? "Deleted by Business Development Head from Team directory"
          : "Deleted by Super Admin from Team directory",
      );
      toast.success(result?.message || "User permanently deleted");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "User deletion failed");
    } finally {
      setDeleteLoading(false);
    }
  }, [canManageMember, canUseLifecycle, deleteTarget, refetch, viewerRole]);

  useEffect(() => {
    getTeamDirectoryRoles()
      .then((result) => setRoleOptions(result.roles || []))
      .catch(() => setRoleOptions([]));
    getUserDetails()
      .then((res) => {
        const user = res?.data?.user || res?.data || res?.user || null;
        setViewerId(String(user?._id || user?.id || "").trim());
        setViewerRole(String(user?.roleName || ""));
      })
      .catch(() => {
        setViewerId("");
        setViewerRole("");
      })
      .finally(() => setViewerReady(true));
  }, []);

  useEffect(() => {
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";
    const locality = searchParams.get("locality") || "";
    const pincode = searchParams.get("pincode") || "";
    const joined = searchParams.get("joined");
    const date = searchParams.get("date") || "";
    const from =
      searchParams.get("createdFrom") || searchParams.get("from") || "";
    const to = searchParams.get("createdTo") || searchParams.get("to") || "";
    const day = date || (joined === "today" ? todayIso() : "") || (from && to && from === to ? from : "");
    setFilters((current) => ({
      ...current,
      role,
      status,
      state,
      city,
      locality,
      pincode,
      fromDate: day || from || "",
      toDate: day || to || "",
    }));
  }, [searchParams]);
  const selectedRoleMatch = useMemo(
    () => (filters.role ? getExactRoleMatch(filters.role, roleOptions) : null),
    [filters.role, roleOptions],
  );

  const options = useMemo(() => {
    const byState = filters.state
      ? users.filter((user) => sameLoc(user.state, filters.state))
      : users;
    const byCity = filters.city
      ? byState.filter((user) => sameLoc(user.city, filters.city))
      : byState;
    const byLocality = filters.locality
      ? byCity.filter((user) => sameLoc(user.locality, filters.locality))
      : byCity;
    return {
      states: unique(users.map((user) => user.state)),
      cities: unique(byState.map((user) => user.city)),
      localities: unique(byCity.map((user) => user.locality)),
      pincodes: unique(byLocality.map((user) => user.pincode)),
    };
  }, [filters.city, filters.locality, filters.state, users]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return users.filter((user) => {
      if (selectedRoleMatch && !userMatchesExactRole(user, selectedRoleMatch)) return false;
      if (filters.state && !sameLoc(user.state, filters.state)) return false;
      if (filters.city && !sameLoc(user.city, filters.city)) return false;
      if (filters.locality && !sameLoc(user.locality, filters.locality)) return false;
      if (filters.pincode && String(user.pincode) !== filters.pincode) return false;
      if (filters.status === "deactivated") {
        if (user.isActive !== false) return false;
      } else if (filters.status === "active") {
        if (user.accountStatus !== "active" || user.isActive === false) return false;
      } else if (filters.status && user.accountStatus !== filters.status) {
        return false;
      }
      if (filters.fromDate || filters.toDate) {
        if (!user.createdAt) return false;
        const joinedAt = new Date(user.createdAt);
        if (Number.isNaN(joinedAt.getTime())) return false;
        if (filters.fromDate && joinedAt < new Date(`${filters.fromDate}T00:00:00`)) return false;
        if (filters.toDate && joinedAt > new Date(`${filters.toDate}T23:59:59.999`)) return false;
      }
      if (!query) return true;
      return `${user.name} ${user.email} ${user.phone} ${user.roleName} ${user.locality} ${user.city} ${user.state} ${user.pincode}`.toLowerCase().includes(query);
    });
  }, [filters, selectedRoleMatch, users]);

  const update = (key, value) => setFilters((current) => {
    const next = { ...current, [key]: value };
    if (key === "state") Object.assign(next, { city: "", locality: "", pincode: "" });
    if (key === "city") Object.assign(next, { locality: "", pincode: "" });
    if (key === "locality") next.pincode = "";
    return next;
  });

  const clear = () => setFilters({ role: "", state: "", city: "", locality: "", pincode: "", status: "", fromDate: "", toDate: "", search: "" });
  const activeCount = users.filter((user) => user.accountStatus === "active" && user.isActive !== false).length;
  const joinedTodayCount = users.filter((user) => {
    if (!user.createdAt) return false;
    const joinedAt = new Date(user.createdAt);
    if (Number.isNaN(joinedAt.getTime())) return false;
    return (
      joinedAt.getFullYear() === new Date().getFullYear() &&
      joinedAt.getMonth() === new Date().getMonth() &&
      joinedAt.getDate() === new Date().getDate()
    );
  }).length;

  const applyQuickFilter = (type) => {
    if (type === "active") {
      setFilters((current) => ({
        ...current,
        status: current.status === "active" ? "" : "active",
        fromDate: "",
        toDate: "",
      }));
      return;
    }
    if (type === "joinedToday") {
      const day = todayIso();
      setFilters((current) => ({
        ...current,
        status: "",
        fromDate: current.fromDate === day && current.toDate === day ? "" : day,
        toDate: current.fromDate === day && current.toDate === day ? "" : day,
      }));
    }
  };

  const stateOptions = useMemo(
    () => [
      { value: "", label: "All states" },
      ...options.states.map((item) => ({ value: item, label: item })),
    ],
    [options.states],
  );
  const cityOptions = useMemo(
    () => [
      { value: "", label: "All cities" },
      ...options.cities.map((item) => ({ value: item, label: item })),
    ],
    [options.cities],
  );
  const localityOptions = useMemo(
    () => [
      { value: "", label: "All localities" },
      ...options.localities.map((item) => ({ value: item, label: item })),
    ],
    [options.localities],
  );
  const pincodeOptions = useMemo(
    () => [
      { value: "", label: "All pincodes" },
      ...options.pincodes.map((item) => ({ value: item, label: item })),
    ],
    [options.pincodes],
  );
  const statusOptions = useMemo(
    () => [
      { value: "", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "deactivated", label: "Deactivated" },
      { value: "location_pending", label: "Location pending" },
      { value: "kyc_pending", label: "KYC pending" },
    ],
    [],
  );

  return <div className="mx-auto max-w-[1500px] pb-10 text-slate-900">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Operations</p><h1 className="mt-1 text-3xl font-black tracking-tight">Team directory</h1></div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{roleOptions.length} roles</span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{users.length} members</span>
        <button type="button" onClick={() => applyQuickFilter("active")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filters.status === "active" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{activeCount} active</button>
        <button type="button" onClick={() => applyQuickFilter("joinedToday")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filters.fromDate === todayIso() && filters.toDate === todayIso() ? "bg-emerald-600 text-white" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}>{joinedTodayCount} joined today</button>
        <button onClick={() => refetch()} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /></button>
      </div>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9">
        <HierarchyRoleSelect roles={roleOptions} users={users} value={filters.role} onChange={(value) => update("role", value)} />
        <ActivityFilterSelect
          showLabel
          searchable
          label="State"
          value={filters.state}
          onChange={(value) => update("state", value)}
          options={stateOptions}
          icon={MapPin}
        />
        <ActivityFilterSelect
          showLabel
          searchable
          label="City"
          value={filters.city}
          onChange={(value) => update("city", value)}
          options={cityOptions}
          icon={Building2}
        />
        <ActivityFilterSelect
          showLabel
          searchable
          label="Locality"
          value={filters.locality}
          onChange={(value) => update("locality", value)}
          options={localityOptions}
          icon={MapPinned}
        />
        <ActivityFilterSelect
          showLabel
          searchable
          label="Pincode"
          value={filters.pincode}
          onChange={(value) => update("pincode", value)}
          options={pincodeOptions}
          icon={Hash}
        />
        <ActivityFilterSelect
          showLabel
          searchable
          label="Status"
          value={filters.status}
          onChange={(value) => update("status", value)}
          options={statusOptions}
          icon={ShieldCheck}
        />
        <TeamDatePicker
          label="Joined from"
          value={filters.fromDate}
          max={filters.toDate || undefined}
          onChange={(value) => update("fromDate", value)}
        />
        <TeamDatePicker
          label="Joined to"
          value={filters.toDate}
          min={filters.fromDate || undefined}
          onChange={(value) => update("toDate", value)}
        />
        <button
          onClick={clear}
          className="mt-auto flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#d9ebe0] bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-[#12A150]/40 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
        >
          <X size={14} /> Clear
        </button>
      </div>
      <div className="relative mt-3">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search name, email, phone, role or location"
          className="h-11 w-full rounded-xl border border-[#d9ebe0] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#12A150] focus:ring-4 focus:ring-[#12A150]/15"
        />
      </div>
    </section>

    <section className="mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><UsersRound size={17} className="text-emerald-600" /><h2 className="text-sm font-bold capitalize">{filters.role ? teamRoleLabel(roleOptions.find((role) => role.name === filters.role) || { name: filters.role }) : "All team members"}</h2></div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">Showing {filtered.length} of {users.length}</span><div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "cards" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><LayoutGrid size={14} /> Cards</button><button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "table" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><List size={14} /> Table</button></div></div></div>
      {isLoading || !viewerReady ? <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-sm text-slate-500">Loading team members...</div> : filtered.length ? viewMode === "cards" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((user) => {
        const location = [user.locality, user.city, user.state, user.pincode].filter(Boolean).join(", ");
        const initials = String(user.name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
        const active = user.accountStatus === "active" && user.isActive !== false;
        return <article key={user._id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer" onClick={() => setPreviewUser(user)}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-300" />
          <div className="flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700">{initials}</div><div className="min-w-0 flex-1"><h3 className="truncate text-base font-black text-slate-800">{displayPersonName(user.name) || "Unnamed user"}</h3><p className="mt-0.5 truncate text-[11px] font-bold tracking-wide text-emerald-600">{personRoleLabel(user.roleName, roleOptions)}</p></div><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${user.isActive === false ? "bg-slate-400" : active ? "bg-emerald-500" : "bg-amber-400"}`} title={user.isActive === false ? "Deactivated" : active ? "Active" : "Pending"} /></div>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs">
            <p className="flex items-center gap-2 text-slate-600"><Hash size={13} className="shrink-0 text-emerald-600" /><span className="font-mono font-bold">{user.userCode || String(user._id).slice(-10).toUpperCase()}</span></p>
            <p className="flex items-center gap-2 text-slate-600"><Mail size={13} className="shrink-0 text-emerald-600" /><span className="truncate">{user.email || "No email"}</span></p>
            <p className="flex items-center gap-2 text-slate-600"><Phone size={13} className="shrink-0 text-emerald-600" /><span>{user.phone || "No phone"}</span></p>
            <p className="flex items-start gap-2 text-slate-600"><Network size={13} className="mt-0.5 shrink-0 text-emerald-600" /><span className="min-w-0 truncate">{user.reportsTo?.name ? <>Reports to <span className="font-semibold text-slate-800">{displayPersonName(user.reportsTo.name)}</span>{(user.reportsTo.roleLabel || user.reportsTo.roleName) ? <span className="text-slate-500"> · {personRoleLabel(user.reportsTo.roleName, roleOptions) || user.reportsTo.roleLabel}</span> : null}</> : "No person reporting line"}</span></p>
            <p className="flex items-start gap-2 text-slate-600"><MapPin size={13} className="mt-0.5 shrink-0 text-emerald-600" /><span className="line-clamp-2">{location || "Work location not provided"}</span></p>
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${user.isActive === false ? "bg-slate-100 text-slate-600" : active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{user.isActive === false ? "Deactivated" : String(user.accountStatus || "pending").replace(/_/g, " ")}</span>
              <span className="text-[10px] text-slate-400">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"}</span>
            </div>
            {isTerritoryRole(user.roleName) ||
            canEditStaffProfiles ||
            canManageMember(user) ? (
              <div className="flex justify-end pt-0.5">
                <TeamMemberActionsMenu
                  busy={statusBusyId === String(user._id)}
                  showAlign={isTerritoryRole(user.roleName)}
                  showEdit={canEditStaffProfiles && String(user._id) !== String(viewerId)}
                  showLifecycle={canManageMember(user)}
                  isActive={user.isActive !== false}
                  onAlign={() => openTerritoryManager(user)}
                  onEdit={() => setEditUser(user)}
                  onActivate={() => changeUserActive(user, true)}
                  onDeactivate={() => changeUserActive(user, false)}
                  onDelete={() => setDeleteTarget(user)}
                />
              </div>
            ) : null}
          </div>
        </article>;
      })}</div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[880px] table-fixed border-collapse text-left text-[12px]">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
              <col className="w-[8%]" />
              <col className="w-[56px]" />
            </colgroup>
            <thead className="sticky top-0 z-[1] bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
              <tr>
                <th className="px-3 py-3 text-left">Team member</th>
                <th className="px-3 py-3 text-left">Role</th>
                <th className="px-3 py-3 text-left">Reports to</th>
                <th className="px-3 py-3 text-left">Contact</th>
                <th className="px-3 py-3 text-left">Work location</th>
                <th className="px-3 py-3 text-left">Joined</th>
                <th className="sticky right-0 z-[2] bg-slate-50 px-2 py-3 text-center shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.12)]">
                  ···
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const location = [user.locality, user.city, user.state, user.pincode].filter(Boolean).join(", ");
                const memberName = displayPersonName(user.name) || "Unnamed user";
                const roleLabel = personRoleLabel(user.roleName, roleOptions) || "—";
                const managerId = user.reportsTo?._id || user.managerId;
                const managerFromList = managerId
                  ? users.find((item) => String(item._id) === String(managerId))
                  : null;
                const reportsToName = displayPersonName(
                  user.reportsTo?.name || managerFromList?.name || "",
                );
                const reportsToRole =
                  personRoleLabel(
                    user.reportsTo?.roleName || managerFromList?.roleName,
                    roleOptions,
                  ) ||
                  user.reportsTo?.roleLabel ||
                  "";
                const reportsToTitle = [reportsToName, reportsToRole].filter(Boolean).join(" · ");
                const openPreview = () => setPreviewUser(user);
                return (
                  <tr
                    key={user._id}
                    className="group cursor-pointer align-middle transition hover:bg-emerald-50/50"
                    onClick={openPreview}
                  >
                    <td className="px-3 py-2.5">
                      <p className="truncate font-bold leading-5 text-slate-800" title={memberName}>
                        {memberName}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      {roleLabel !== "—" ? (
                        <span
                          className="inline-block max-w-full truncate rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold leading-4 text-emerald-800"
                          title={roleLabel}
                        >
                          {roleLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {reportsToName ? (
                        <div title={reportsToTitle}>
                          <p className="truncate font-semibold leading-5 text-slate-800">{reportsToName}</p>
                          {reportsToRole ? (
                            <p className="mt-0.5 truncate text-[10px] font-medium leading-4 text-emerald-700">{reportsToRole}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      <p className="truncate leading-5" title={user.email || "No email"}>
                        {user.email || "No email"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] leading-4 text-slate-400" title={user.phone || "No phone"}>
                        {user.phone || "No phone"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {location ? (
                        <p className="truncate leading-5 text-slate-700" title={location}>{location}</p>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td
                      className="sticky right-0 z-[1] bg-white px-2 py-2.5 text-center shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.08)] group-hover:bg-emerald-50/80"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="inline-flex justify-center">
                        <TeamMemberActionsMenu
                          compact
                          busy={statusBusyId === String(user._id)}
                          showAlign={isTerritoryRole(user.roleName)}
                          showEdit={canEditStaffProfiles && String(user._id) !== String(viewerId)}
                          showLifecycle={canManageMember(user)}
                          isActive={user.isActive !== false}
                          onAlign={() => openTerritoryManager(user)}
                          onEdit={() => setEditUser(user)}
                          onActivate={() => changeUserActive(user, true)}
                          onDeactivate={() => changeUserActive(user, false)}
                          onDelete={() => setDeleteTarget(user)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center"><UsersRound className="mx-auto mb-3 text-slate-300" size={36} /><p className="font-bold text-slate-600">{filters.role ? `No members are assigned to ${teamRoleLabel(roleOptions.find((role) => role.name === filters.role) || { name: filters.role })} yet.` : "No team members match these filters."}</p><p className="mt-1 text-xs text-slate-400">{filters.role ? "Create credentials for this role to add its first team member." : "Clear or change the filters to view more people."}</p></div>}
    </section>

    <CceTerritoryManagerModal
      open={Boolean(territoryMember)}
      member={territoryMember}
      readOnly={Boolean(territoryMember?.readOnly)}
      onClose={() => setTerritoryMember(null)}
      onSaved={() => refetch()}
    />
    <SafeUserDeleteModal
      open={Boolean(deleteTarget)}
      user={deleteTarget}
      loading={deleteLoading}
      onClose={() => !deleteLoading && setDeleteTarget(null)}
      onConfirm={confirmDeleteUser}
    />
    {previewUser ? (() => {
      const managerId = previewUser.reportsTo?._id || previewUser.managerId;
      const managerFromList = managerId
        ? users.find((item) => String(item._id) === String(managerId))
        : null;
      const reportsToName = displayPersonName(
        previewUser.reportsTo?.name || managerFromList?.name || "",
      );
      const reportsToRole =
        personRoleLabel(
          previewUser.reportsTo?.roleName || managerFromList?.roleName,
          roleOptions,
        ) ||
        previewUser.reportsTo?.roleLabel ||
        "";
      return (
        <TeamMemberDetailModal
          user={previewUser}
          roleLabel={personRoleLabel(previewUser.roleName, roleOptions)}
          reportsToName={reportsToName}
          reportsToRole={reportsToRole}
          onClose={() => setPreviewUser(null)}
        />
      );
    })() : null}
    {editUser ? (
      <StaffProfileEditModal
        user={editUser}
        roleLabel={personRoleLabel(editUser.roleName, roleOptions)}
        onClose={() => setEditUser(null)}
        onSaved={() => {
          setEditUser(null);
          refetch();
        }}
      />
    ) : null}
  </div>;
}

function HierarchyRoleSelect({ roles, users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const ordered = useMemo(() => orderRolesByHierarchy(roles), [roles]);
  const selected =
    ordered.find((role) => role.name === value) ||
    ordered.find((role) => canonicalTeamRole(role.name) === canonicalTeamRole(value)) ||
    ordered.find((role) => (role.aliasRoleNames || []).includes(value));
  const selectedMatch = value ? canonicalTeamRole(value) : "";
  const memberCount = (role) => countUsersInExactRole(users, role.name, roles);
  const minDepth = ordered.reduce(
    (min, role) => Math.min(min, Number(role.hierarchyDepth) || 0),
    Number.POSITIVE_INFINITY,
  );
  const baseDepth = Number.isFinite(minDepth) ? minDepth : 0;

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((role) => {
      const label = String(teamRoleLabel(role) || "").toLowerCase();
      const name = String(role.name || "").toLowerCase();
      return label.includes(q) || name.includes(q);
    });
  }, [ordered, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30 min-w-0 xl:col-span-1">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Role
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white py-2 pl-3 pr-2.5 text-left text-[13px] font-semibold text-[#101820] transition duration-200 outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
          open
            ? "border-[#12A150] shadow-md shadow-emerald-600/15"
            : "border-[#d9ebe0] hover:border-[#12A150]/50 hover:shadow-sm"
        }`}
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition duration-200 ${
            open || value
              ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/30"
              : "bg-[#EAF8F0] text-[#12A150]"
          }`}
        >
          <ShieldCheck size={14} strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1 truncate">
          {selected ? teamRoleLabel(selected) : "All roles"}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180 text-[#12A150]" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[320px] overflow-hidden rounded-xl border border-[#d9ebe0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] motion-safe:animate-[tlFadeUp_180ms_ease-out]">
          <div className="border-b border-[#e8f2ec] bg-[#F6FBF8] p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#12A150]"
                strokeWidth={2.25}
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                placeholder="Search roles…"
                className="h-9 w-full rounded-lg border border-[#d9ebe0] bg-white py-1.5 pl-8 pr-2.5 text-[12px] font-semibold text-[#101820] outline-none placeholder:text-slate-400 focus:border-[#12A150] focus:ring-2 focus:ring-[#12A150]/15"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Roles under your hierarchy
            </div>
            {!query.trim() ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition duration-150 ${
                  !value
                    ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/25"
                    : "text-slate-700 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
                }`}
              >
                <span className="min-w-0 flex-1">All roles</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    !value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {users.length}
                </span>
                {!value ? <Check size={15} className="text-white" /> : null}
              </button>
            ) : null}
            {filteredRoles.length ? (
              filteredRoles.map((role) => {
                const active =
                  value === role.name || selectedMatch === canonicalTeamRole(role.name);
                const canon = canonicalTeamRole(role.name);
                const indent = Math.max(
                  0,
                  (Number(role.hierarchyDepth) || 0) - baseDepth,
                );
                const isBranchRoot = [
                  "business_development_head",
                  "customer_support_head",
                  "marketing_head",
                  "accounts",
                  "legal_compliance",
                  "hr_administration",
                  "technical_support_head",
                ].includes(canon);
                return (
                  <button
                    key={role._id || role.name}
                    type="button"
                    onClick={() => {
                      onChange(role.name);
                      setOpen(false);
                    }}
                    style={{ paddingLeft: `${12 + indent * 18}px` }}
                    className={`flex w-full items-center gap-2 rounded-lg py-2.5 pr-3 text-left text-sm font-semibold transition duration-150 ${
                      active
                        ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/25"
                        : "text-slate-700 hover:bg-[#EAF8F0] hover:text-[#0B7A3A]"
                    }`}
                  >
                    <span
                      className={`w-3 shrink-0 ${active ? "text-white/50" : "text-slate-300"}`}
                    >
                      {indent && !query.trim() ? "└" : ""}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate ${isBranchRoot ? "font-bold" : ""}`}
                    >
                      {teamRoleLabel(role)}
                      {role.isCurrentRole ? " (You)" : ""}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {memberCount(role)}
                    </span>
                    {active ? <Check size={15} className="shrink-0 text-white" /> : null}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
                No matching roles
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
