import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Hash, LayoutGrid, List, Mail, MapPin, Phone, RefreshCw, Search, ShieldCheck, UsersRound, X } from "lucide-react";
import { useUsers } from "./hook/useUserData";
import { getTeamDirectoryRoles } from "../../../features/accessControl/accessControlService";

const cleanRole = (value = "") => String(value).replace(/_/g, " ");
const TEAM_ROLE_LABELS = {
  team_lead: "Customer Support Team Leads",
  team_leads: "Customer Support Team Leads",
  customer_support_team_lead: "Customer Support Team Leads",
  customer_support_team_leads: "Customer Support Team Leads",
  customer_care: "Customer Care Executives",
  customer_care_executive: "Customer Care Executives",
  customer_care_executives: "Customer Care Executives",
  relationship_manager: "Relationship Managers",
  relationship_managers: "Relationship Managers",
};
const teamRoleLabel = (role) => TEAM_ROLE_LABELS[String(role?.name || "").toLowerCase()] || role?.label || cleanRole(role?.name);
const unique = (items) => [...new Set(items.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
const normalizeTeamRole = (value = "") => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const TEAM_ROLE_ALIASES = {
  customer_support_team_lead: "team_lead",
  team_leads: "team_lead",
  customer_support_team_leads: "team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  regional_managers: "regional_manager",
};
const TEAM_ROLE_HIERARCHY = [
  ["super_admin", 0], ["ceo", 1], ["founder", 1], ["operations_head", 1],
  ["business_development_head", 2], ["regional_manager", 3], ["business_development_manager", 4], ["sales_agent", 4], ["sales_executive", 4], ["sales_manager", 4],
  ["customer_support_head", 2], ["team_lead", 3], ["customer_care", 4], ["customer_care_executive", 4], ["relationship_manager", 4],
  ["marketing_head", 2], ["digital_marketing", 3], ["social_media", 3], ["content_team", 3], ["creative_team", 3],
  ["accounts", 2], ["accounts_finance", 2], ["legal_compliance", 2], ["hr_administration", 2],
  ["technical_support_head", 2], ["technical_support_team", 3],
];
const teamHierarchyRank = new Map(TEAM_ROLE_HIERARCHY.map(([name, depth], index) => [name, { depth, index }]));
const teamHierarchyParentByRole = new Map();
TEAM_ROLE_HIERARCHY.forEach(([name, depth], index) => {
  if (!depth) return;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (TEAM_ROLE_HIERARCHY[cursor][1] === depth - 1) {
      teamHierarchyParentByRole.set(name, TEAM_ROLE_HIERARCHY[cursor][0]);
      break;
    }
  }
});

export default function PropenuTeam() {
  const { data: users = [], isLoading, refetch, isFetching } = useUsers();
  const [roleOptions, setRoleOptions] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [filters, setFilters] = useState({ role: "", state: "", city: "", locality: "", pincode: "", status: "", fromDate: "", toDate: "", search: "" });

  useEffect(() => {
    getTeamDirectoryRoles()
      .then((result) => setRoleOptions(result.roles || []))
      .catch(() => setRoleOptions([]));
  }, []);

  const options = useMemo(() => {
    const byState = filters.state ? users.filter((user) => user.state === filters.state) : users;
    const byCity = filters.city ? byState.filter((user) => user.city === filters.city) : byState;
    const byLocality = filters.locality ? byCity.filter((user) => user.locality === filters.locality) : byCity;
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
      if (filters.role && user.roleName !== filters.role) return false;
      if (filters.state && user.state !== filters.state) return false;
      if (filters.city && user.city !== filters.city) return false;
      if (filters.locality && user.locality !== filters.locality) return false;
      if (filters.pincode && String(user.pincode) !== filters.pincode) return false;
      if (filters.status && user.accountStatus !== filters.status) return false;
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
  }, [filters, users]);

  const update = (key, value) => setFilters((current) => {
    const next = { ...current, [key]: value };
    if (key === "state") Object.assign(next, { city: "", locality: "", pincode: "" });
    if (key === "city") Object.assign(next, { locality: "", pincode: "" });
    if (key === "locality") next.pincode = "";
    return next;
  });

  const clear = () => setFilters({ role: "", state: "", city: "", locality: "", pincode: "", status: "", fromDate: "", toDate: "", search: "" });
  const activeCount = users.filter((user) => user.accountStatus === "active" && user.isActive !== false).length;

  const Select = ({ label, value, onChange, children }) => <label className="min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold capitalize outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{children}</select></label>;

  return <div className="mx-auto max-w-[1500px] pb-10 text-slate-900">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Operations</p><h1 className="mt-1 text-3xl font-black tracking-tight">Team directory</h1><p className="mt-1 text-sm text-slate-500">Select a role and location to find the right team member.</p></div>
      <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{roleOptions.length} roles</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{users.length} members</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{activeCount} active</span><button onClick={() => refetch()} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /></button></div>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9">
        <HierarchyRoleSelect roles={roleOptions} users={users} value={filters.role} onChange={(value) => update("role", value)} />
        <Select label="State" value={filters.state} onChange={(value) => update("state", value)}><option value="">All states</option>{options.states.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select label="City" value={filters.city} onChange={(value) => update("city", value)}><option value="">All cities</option>{options.cities.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select label="Locality" value={filters.locality} onChange={(value) => update("locality", value)}><option value="">All localities</option>{options.localities.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select label="Pincode" value={filters.pincode} onChange={(value) => update("pincode", value)}><option value="">All pincodes</option>{options.pincodes.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select label="Status" value={filters.status} onChange={(value) => update("status", value)}><option value="">All statuses</option><option value="active">Active</option><option value="location_pending">Location pending</option><option value="kyc_pending">KYC pending</option></Select>
        <label className="min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined from</span><input type="date" value={filters.fromDate} max={filters.toDate || undefined} onChange={(event) => update("fromDate", event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        <label className="min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined to</span><input type="date" value={filters.toDate} min={filters.fromDate || undefined} onChange={(event) => update("toDate", event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        <button onClick={clear} className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><X size={14} /> Clear</button>
      </div>
      <div className="relative mt-3"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Search name, email, phone, role or location" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
    </section>

    <section className="mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><UsersRound size={17} className="text-emerald-600" /><h2 className="text-sm font-bold capitalize">{filters.role ? roleOptions.find((role) => role.name === filters.role)?.label || cleanRole(filters.role) : "All team members"}</h2></div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">Showing {filtered.length} of {users.length}</span><div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"><button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "cards" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><LayoutGrid size={14} /> Cards</button><button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${viewMode === "table" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><List size={14} /> Table</button></div></div></div>
      {isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-sm text-slate-500">Loading team members...</div> : filtered.length ? viewMode === "cards" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((user) => {
        const location = [user.locality, user.city, user.state, user.pincode].filter(Boolean).join(", ");
        const initials = String(user.name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
        const active = user.accountStatus === "active" && user.isActive !== false;
        return <article key={user._id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-300" />
          <div className="flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700">{initials}</div><div className="min-w-0 flex-1"><h3 className="truncate text-base font-black text-slate-800">{user.name || "Unnamed user"}</h3><p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-wide text-emerald-600">{cleanRole(user.roleName)}</p></div><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-amber-400"}`} title={active ? "Active" : "Pending"} /></div>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs">
            <p className="flex items-center gap-2 text-slate-600"><Hash size={13} className="shrink-0 text-emerald-600" /><span className="font-mono font-bold">{user.userCode || String(user._id).slice(-10).toUpperCase()}</span></p>
            <p className="flex items-center gap-2 text-slate-600"><Mail size={13} className="shrink-0 text-emerald-600" /><span className="truncate">{user.email || "No email"}</span></p>
            <p className="flex items-center gap-2 text-slate-600"><Phone size={13} className="shrink-0 text-emerald-600" /><span>{user.phone || "No phone"}</span></p>
            <p className="flex items-start gap-2 text-slate-600"><MapPin size={13} className="mt-0.5 shrink-0 text-emerald-600" /><span className="line-clamp-2">{location || "Work location not provided"}</span></p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{String(user.accountStatus || "pending").replace(/_/g, " ")}</span><span className="text-[10px] text-slate-400">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"}</span></div>
        </article>;
      })}</div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Team member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Work location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((user) => {
        const location = [user.locality, user.city, user.state, user.pincode].filter(Boolean).join(", ");
        const initials = String(user.name || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
        const active = user.accountStatus === "active" && user.isActive !== false;
        return <tr key={user._id} className="transition hover:bg-emerald-50/40"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 font-black text-emerald-700">{initials}</div><div className="min-w-0"><p className="max-w-[190px] truncate font-bold text-slate-800">{user.name || "Unnamed user"}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{user.userCode || String(user._id).slice(-10).toUpperCase()}</p></div></div></td><td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold capitalize text-emerald-700">{cleanRole(user.roleName)}</span></td><td className="px-4 py-3 text-slate-600"><p className="max-w-[210px] truncate">{user.email || "No email"}</p><p className="mt-0.5 text-slate-400">{user.phone || "No phone"}</p></td><td className="max-w-[260px] px-4 py-3 text-slate-600"><span className="line-clamp-2">{location || "Work location not provided"}</span></td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold capitalize ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-400"}`} />{String(user.accountStatus || "pending").replace(/_/g, " ")}</span></td><td className="whitespace-nowrap px-4 py-3 text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"}</td></tr>;
      })}</tbody></table></div></div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center"><UsersRound className="mx-auto mb-3 text-slate-300" size={36} /><p className="font-bold text-slate-600">{filters.role ? `No members are assigned to ${roleOptions.find((role) => role.name === filters.role)?.label || cleanRole(filters.role)} yet.` : "No team members match these filters."}</p><p className="mt-1 text-xs text-slate-400">{filters.role ? "Create credentials for this role to add its first team member." : "Clear or change the filters to view more people."}</p></div>}
    </section>
  </div>;
}

function HierarchyRoleSelect({ roles, users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = roles.find((role) => role.name === value);
  const rolesById = new Map(roles.map((role) => [String(role._id), role]));
  const rolesByName = new Map(roles.map((role) => [normalizeTeamRole(role.name), role]));
  const depthFor = (role, visited = new Set()) => {
    const parentId = role?.effectiveParentRoleId || role?.parentRoleId?._id || role?.parentRoleId;
    if (!parentId || visited.has(String(parentId))) return 0;
    const parent = rolesById.get(String(parentId));
    if (!parent) return 0;
    visited.add(String(parentId));
    return 1 + depthFor(parent, visited);
  };
  const enriched = [...roles].map((role) => {
    const rawName = normalizeTeamRole(role.name);
    const nameKey = TEAM_ROLE_ALIASES[rawName] || rawName;
    const hierarchy = teamHierarchyRank.get(nameKey);
    const canonicalParentName = teamHierarchyParentByRole.get(nameKey) || null;
    const canonicalParentRole = canonicalParentName ? rolesByName.get(canonicalParentName) : null;
    return {
      ...role,
      hierarchyDepth: depthFor(role) || hierarchy?.depth || 0,
      hierarchyIndex: hierarchy?.index ?? 1000,
      hierarchyParentId: role?.effectiveParentRoleId || role?.parentRoleId?._id || role?.parentRoleId || canonicalParentRole?._id || null,
    };
  });
  const childrenByParent = new Map();
  enriched.forEach((role) => {
    const key = role.hierarchyParentId ? String(role.hierarchyParentId) : "__root__";
    const branch = childrenByParent.get(key) || [];
    branch.push(role);
    childrenByParent.set(key, branch);
  });
  const sortWithinLevel = (first, second) =>
    Number(second.isCurrentRole) - Number(first.isCurrentRole) ||
    first.hierarchyIndex - second.hierarchyIndex ||
    String(teamRoleLabel(first) || first.name).localeCompare(String(teamRoleLabel(second) || second.name));
  const ordered = [];
  const visited = new Set();
  const appendBranch = (parentId = "__root__") => {
    const branch = [...(childrenByParent.get(String(parentId)) || [])].sort(sortWithinLevel);
    branch.forEach((role) => {
      const roleId = String(role._id || role.name);
      if (visited.has(roleId)) return;
      visited.add(roleId);
      ordered.push(role);
      appendBranch(role._id);
    });
  };
  appendBranch("__root__");
  enriched.sort(sortWithinLevel).forEach((role) => {
    const roleId = String(role._id || role.name);
    if (visited.has(roleId)) return;
    visited.add(roleId);
    ordered.push(role);
    appendBranch(role._id);
  });
  const memberCount = (role) => users.filter((user) => String(user.roleId) === String(role._id) || user.roleName === role.name).length;

  return <div className="relative z-30 min-w-0 xl:col-span-1">
    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</span>
    <button type="button" onClick={() => setOpen((current) => !current)} className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left text-xs font-semibold outline-none transition ${open ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>
      <ShieldCheck size={15} className="shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1 truncate">{selected ? teamRoleLabel(selected) : "All roles"}</span>
      <ChevronDown size={15} className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-80 min-w-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Organisation hierarchy</div>
      <button type="button" onClick={() => { onChange(""); setOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${!value ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-slate-50"}`}><span className="min-w-0 flex-1">All roles</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{users.length}</span>{!value && <Check size={15} className="text-emerald-600" />}</button>
      {ordered.map((role) => <button key={role._id || role.name} type="button" onClick={() => { onChange(role.name); setOpen(false); }} style={{ paddingLeft: `${12 + role.hierarchyDepth * 20}px` }} className={`flex w-full items-center gap-2 rounded-lg py-2.5 pr-3 text-left text-sm transition ${value === role.name ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-slate-50"}`}><span className="text-slate-300">{role.hierarchyDepth ? "L" : ""}</span><span className="min-w-0 flex-1 truncate">{teamRoleLabel(role)}{role.isCurrentRole ? " (You)" : ""}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{memberCount(role)}</span>{value === role.name && <Check size={15} className="shrink-0 text-emerald-600" />}</button>)}
    </div>}
  </div>;
}
