/**
 * Team Management — hierarchy role work center.
 * Left: roles under you. Right: plain-language job + work modules + people (location filtered).
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import LocationFilterBar from "../../components/common/LocationFilterBar";
import { getTeamDirectoryRoles } from "../../features/accessControl/accessControlService";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import { useUsers } from "../users/propenuTeam/hook/useUserData";
import {
  canonicalTeamRole,
  countUsersInExactRole,
  getExactRoleMatch,
  orderRolesByHierarchy,
  userMatchesExactRole,
} from "../../utils/roleHierarchy";
import { getRoleWorkProfile, ROLE_WORK_BRANCH } from "../../utils/roleWorkProfiles";

const ROLE_LABELS = {
  ceo: "CEO",
  operations_head: "Operations Head",
  business_development_head: "Business Development Head",
  regional_manager: "Regional Managers",
  business_development_manager: "Business Development Manager",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executives",
  sales_agent: "Sales Executives",
  customer_support_head: "Customer Support Head",
  customer_support_team_lead: "Customer Support Team Leads",
  team_lead: "Customer Support Team Leads",
  customer_care_executive: "Customer Care Executives",
  relationship_manager: "Relationship Managers",
  marketing_head: "Marketing Head",
  digital_marketing: "Digital Marketing",
  social_media: "Social Media",
  content_team: "Content Team",
  creative_team: "Creative Team",
  performance_marketing: "Performance Marketing",
  accounts: "Accounts",
  legal_compliance: "Legal",
  hr_administration: "HR",
  technical_support_head: "Technical Support Head",
  technical_support_team: "Technical Support Team",
};

const labelFor = (role) =>
  ROLE_LABELS[canonicalTeamRole(role?.name)] ||
  role?.label ||
  String(role?.name || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const EMPTY_LOC = { state: "", city: "", locality: "", pincode: "" };

export default function TeamManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: users = [], isLoading, refetch, isFetching } = useUsers({ scope: "team_directory" });

  const [roles, setRoles] = useState([]);
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState("");
  const [locationFilters, setLocationFilters] = useState(EMPTY_LOC);
  const [selectedRoleName, setSelectedRoleName] = useState(searchParams.get("role") || "");

  const [workPanel, setWorkPanel] = useState("day"); // day | people | tickets | projects | properties
  const [viewAllPeople, setViewAllPeople] = useState(false);

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => {
        setMe(user);
        if (canonicalTeamRole(user?.roleName) === "regional_manager" && user?.state) {
          setLocationFilters((current) => ({ ...current, state: user.state }));
        }
      })
      .catch(() => setMe(null));
    getTeamDirectoryRoles()
      .then((result) => setRoles(result.roles || []))
      .catch(() => {
        setRoles([]);
        toast.error("Unable to load hierarchy roles");
      });
  }, []);

  useEffect(() => {
    const role = searchParams.get("role") || "";
    setSelectedRoleName(role);
    setWorkPanel("day");
    setViewAllPeople(false);
  }, [searchParams]);

  const orderedRoles = useMemo(() => orderRolesByHierarchy(roles), [roles]);

  const minDepth = useMemo(
    () =>
      orderedRoles.reduce(
        (min, role) => Math.min(min, Number(role.hierarchyDepth) || 0),
        Number.POSITIVE_INFINITY,
      ),
    [orderedRoles],
  );
  const baseDepth = Number.isFinite(minDepth) ? minDepth : 0;

  const locationUsers = useMemo(() => {
    return users.filter((user) => {
      if (locationFilters.state && user.state !== locationFilters.state) return false;
      if (locationFilters.city && user.city !== locationFilters.city) return false;
      if (locationFilters.locality && user.locality !== locationFilters.locality) return false;
      if (locationFilters.pincode && String(user.pincode) !== locationFilters.pincode) return false;
      return true;
    });
  }, [users, locationFilters]);

  const selectedRole =
    orderedRoles.find((role) => role.name === selectedRoleName) ||
    orderedRoles.find((role) => canonicalTeamRole(role.name) === canonicalTeamRole(selectedRoleName)) ||
    null;

  const selectedMatch = useMemo(
    () => (selectedRoleName ? getExactRoleMatch(selectedRoleName, roles) : null),
    [selectedRoleName, roles],
  );

  const profile = getRoleWorkProfile(selectedRole?.name || selectedRoleName);

  const people = useMemo(() => {
    if (!selectedMatch) return [];
    const query = search.trim().toLowerCase();
    return locationUsers.filter((user) => {
      if (!userMatchesExactRole(user, selectedMatch)) return false;
      if (!query) return true;
      return `${user.name} ${user.email} ${user.phone} ${user.city} ${user.state} ${user.locality}`
        .toLowerCase()
        .includes(query);
    });
  }, [locationUsers, selectedMatch, search]);

  const activePeople = people.filter(
    (user) => user.accountStatus === "active" && user.isActive !== false,
  ).length;

  const selectRole = (roleName) => {
    setSelectedRoleName(roleName);
    setWorkPanel("day");
    setViewAllPeople(false);
    const next = new URLSearchParams(searchParams);
    if (roleName) next.set("role", roleName);
    else next.delete("role");
    setSearchParams(next, { replace: true });
  };

  const openMemberWork = (user, focusTab = "overview") => {
    const role = selectedRole?.name || selectedRoleName || user.roleName || "";
    const roleLabel = labelFor(selectedRole || { name: role }) || profile.title || "";
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (roleLabel) params.set("roleLabel", roleLabel);
    if (focusTab && focusTab !== "overview") params.set("tab", focusTab);
    const qs = params.toString();
    navigate(`/dashboard/team-management/member/${user._id}${qs ? `?${qs}` : ""}`);
  };

  /** Stay on this page — switch work panel (no navigate to /projects etc.) */
  const selectWorkPanel = (module) => {
    const path = String(module?.path || "").toLowerCase();
    const label = String(module?.label || "").toLowerCase();
    if (path.includes("ticket") || label.includes("ticket")) setWorkPanel("tickets");
    else if (path.includes("project") || label.includes("project")) setWorkPanel("projects");
    else if (path.includes("propert") || path.includes("progress") || label.includes("propert") || label.includes("onboard"))
      setWorkPanel("properties");
    else if (path.includes("lead") || label.includes("lead")) setWorkPanel("people");
    else if (path.includes("team") || path.includes("propenu") || label.includes("directory") || label.includes("team"))
      setWorkPanel("people");
    else setWorkPanel("day");
  };

  const visiblePeople = viewAllPeople ? people : people.slice(0, 8);
  const peopleScroll = viewAllPeople ? "max-h-[70vh]" : "max-h-64";

  let lastBranch = "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Operations · Team Management
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Role work center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Select a role. See what they do and their people — <strong>work stays on this page</strong> (scroll + View all).
              {me?.roleName ? (
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  Logged in as {labelFor({ name: me.roleName })}
                  {me.state ? ` · ${[me.locality, me.city, me.state].filter(Boolean).join(", ")}` : ""}
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh team data
          </button>
        </header>

        {/* Location */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <MapPin size={14} className="text-emerald-600" />
            Filter people by work location
          </div>
          <LocationFilterBar
            users={users}
            filters={locationFilters}
            setFilters={setLocationFilters}
            lockedState={canonicalTeamRole(me?.roleName) === "regional_manager" ? me?.state || "" : ""}
          />
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(260px,320px)_1fr]">
          {/* Left: hierarchy roles */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Roles under your hierarchy
              </p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Click a role to see its job and people
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {isLoading && !orderedRoles.length ? (
                <p className="px-3 py-8 text-center text-sm text-slate-400">Loading roles…</p>
              ) : !orderedRoles.length ? (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  No child roles under your position.
                </p>
              ) : (
                orderedRoles.map((role) => {
                  const canon = canonicalTeamRole(role.name);
                  const depth = Math.max(0, (Number(role.hierarchyDepth) || 0) - baseDepth);
                  const branch = depth === 0 ? ROLE_WORK_BRANCH[canon] || "" : "";
                  const showBranch = branch && branch !== lastBranch;
                  if (showBranch) lastBranch = branch;
                  const active =
                    selectedRoleName === role.name ||
                    canonicalTeamRole(selectedRoleName) === canon;
                  const count = countUsersInExactRole(locationUsers, role.name, roles);
                  return (
                    <div key={role._id || role.name}>
                      {showBranch ? (
                        <div className="sticky top-0 z-10 mt-1 bg-emerald-50/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          {branch}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => selectRole(role.name)}
                        style={{ paddingLeft: `${10 + depth * 14}px` }}
                        className={`mb-0.5 flex w-full items-center gap-2 rounded-xl py-2.5 pr-3 text-left text-sm transition ${
                          active
                            ? "bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/20"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`w-3 shrink-0 ${active ? "text-emerald-100" : "text-slate-300"}`}>
                          {depth ? "└" : ""}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{labelFor(role)}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right: work + people */}
          <main className="min-w-0 space-y-5">
            {!selectedRoleName || !selectedRole ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <ShieldCheck className="mx-auto text-emerald-500" size={40} />
                <h2 className="mt-4 text-xl font-black text-slate-800">Pick a role on the left</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Example: choose <strong>Sales Executives</strong> to see posting & onboarding work,
                  or <strong>Customer Care Executives</strong> to see ticket work — filtered by
                  location.
                </p>
              </div>
            ) : (
              <>
                {/* What this role does */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          What this role works on
                        </p>
                        <h2 className="mt-1 text-xl font-black text-slate-900">{profile.title}</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          {profile.summary}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Primary job</p>
                        <p className="mt-0.5 max-w-[220px] text-xs font-bold text-emerald-800">
                          {profile.primaryJob}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        <CheckCircle2 size={12} className="text-emerald-600" /> How this role works
                      </p>
                      <ol className="max-h-36 space-y-1 overflow-y-auto pr-1">
                        {(profile.steps || []).map((step, index) => (
                          <li key={step} className="flex gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-600 text-[9px] font-black text-white">{index + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        <Briefcase size={12} className="text-emerald-600" /> Their work (same page)
                      </p>
                      <div className="grid max-h-36 gap-1 overflow-y-auto pr-1">
                        {(profile.modules || []).map((module) => (
                          <button
                            key={`${module.path}-${module.label}`}
                            type="button"
                            onClick={() => selectWorkPanel(module)}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-left hover:border-emerald-400 hover:bg-emerald-50"
                          >
                            <Activity size={13} className="shrink-0 text-emerald-600" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[11px] font-bold text-slate-800">{module.label}</span>
                              <span className="block text-[10px] text-slate-500">{module.hint}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/access-control/credentials/new", { state: { roleName: selectedRole.name } })}
                        className="mt-2 rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white"
                      >
                        Create credentials
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 p-2">
                    {[
                      { key: "day", label: "Role job" },
                      { key: "people", label: `People (${people.length})` },
                      { key: "tickets", label: "Tickets" },
                      { key: "projects", label: "Projects" },
                      { key: "properties", label: "Properties" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setWorkPanel(item.key)}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                          workPanel === item.key ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <label className="relative ml-auto hidden sm:block">
                      <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-36 rounded-md border border-slate-200 py-1 pl-7 pr-2 text-[10px] font-semibold" />
                    </label>
                  </div>
                  <div className={`overflow-y-auto p-2 ${peopleScroll}`}>
                    {workPanel === "day" ? (
                      <div className="space-y-2 p-1 text-[11px] text-slate-600">
                        <p>{profile.summary}</p>
                        <p className="text-[10px] text-slate-400">Use tabs above — work stays on this page. Open People for members, or Tickets / Projects / Properties for work.</p>
                      </div>
                    ) : visiblePeople.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">No people for this filter.</p>
                    ) : (
                      <div className="space-y-1">
                        {workPanel !== "people" && (
                          <p className="mb-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                            Open a person to load their {workPanel} on the detail page (same work flow).
                          </p>
                        )}
                        {visiblePeople.map((user) => {
                          const loc = [user.locality, user.city, user.state].filter(Boolean).join(", ");
                          const active = user.accountStatus === "active" && user.isActive !== false;
                          const focus = ["tickets", "projects", "properties"].includes(workPanel) ? workPanel : "overview";
                          const roleTitle = profile.title || labelFor(selectedRole);
                          return (
                            <div key={user._id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 hover:bg-emerald-50/40">
                              <button type="button" onClick={() => openMemberWork(user, focus)} className="min-w-0 flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="truncate text-[11px] font-bold text-slate-900">{user.name || "Unnamed"}</span>
                                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {roleTitle}
                                  </span>
                                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                    {String(user.accountStatus || "pending").replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p className="truncate text-[10px] text-slate-400">{user.email || "—"}{loc ? ` · ${loc}` : ""}</p>
                              </button>
                              <button type="button" onClick={() => openMemberWork(user, focus)} className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-800">
                                {workPanel === "people" ? "Work" : workPanel} <ChevronRight size={10} className="inline" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5">
                    <p className="text-[10px] text-slate-400">{people.length} people · {activePeople} active</p>
                    <button type="button" onClick={() => setViewAllPeople((v) => !v)} className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      {viewAllPeople ? "Show less" : "View all · expand"}
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
