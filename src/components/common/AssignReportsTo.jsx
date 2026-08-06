import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Network,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  assignReportsTo,
  getEligibleReportsTo,
  getUserSearch,
} from "../../features/user/userService";
import { getAssignableRoles } from "../../features/accessControl/accessControlService";
import {
  cleanRoleLabel,
  formatHierarchyHint,
  getRolesBelowActor,
  isRoleBelowActor,
} from "../../utils/reportsToHierarchy";
import LocationFilterBar, { applyLocationFilters } from "./LocationFilterBar";

const MEMBER_ROLES = [
  { value: "sales_agent", label: "Sales Executive", group: "Sales & BD" },
  { value: "sales_manager", label: "Sales Manager", group: "Sales & BD" },
  { value: "regional_manager", label: "Regional Manager", group: "Sales & BD" },
  { value: "business_development_manager", label: "BD Manager", group: "Sales & BD" },
  { value: "relationship_manager", label: "Relationship Manager", group: "Support / Sales" },
  { value: "customer_support_team_lead", label: "Customer Support Team Lead", group: "Customer Support" },
  { value: "customer_care_executive", label: "Customer Care Executive", group: "Customer Support" },
  { value: "customer_care", label: "Customer Care (legacy)", group: "Customer Support" },
  { value: "digital_marketing", label: "Digital Marketing", group: "Marketing" },
  { value: "social_media", label: "Social Media", group: "Marketing" },
  { value: "content_team", label: "Content Team", group: "Marketing" },
  { value: "creative_team", label: "Creative Team", group: "Marketing" },
  { value: "performance_marketing", label: "Performance Marketing", group: "Marketing" },
  { value: "technical_support_team", label: "Tech Support Team", group: "Technical" },
  { value: "accounts", label: "Accounts", group: "Back office" },
  { value: "accounts_finance", label: "Accounts & Finance", group: "Back office" },
];

const RM_MEMBER_ROLES = ["sales_manager", "sales_agent", "relationship_manager"];

const filterMemberRolesBelowActor = (roles, currentUserRole, assignableNames) => {
  const actor = String(currentUserRole || "").toLowerCase();
  let list = [...roles];

  if (actor === "regional_manager") {
    list = list.filter((role) => RM_MEMBER_ROLES.includes(role.value));
  }

  if (assignableNames?.size) {
    list = list.filter(
      (role) =>
        assignableNames.has(role.value) ||
        (role.value === "sales_agent" && assignableNames.has("sales_executive")) ||
        (role.value === "customer_care" && assignableNames.has("customer_care_executive")),
    );
  } else if (actor && actor !== "super_admin" && actor !== "admin") {
    list = list.filter((role) => isRoleBelowActor(actor, role.value));
  }

  if (actor && actor !== "super_admin" && actor !== "admin") {
    const below = getRolesBelowActor(actor) || [];
    list = list.filter((role) => {
      if (role.value === actor) return false;
      if (!below.length) return isRoleBelowActor(actor, role.value);
      return (
        below.includes(role.value) ||
        (role.value === "sales_agent" && below.includes("sales_executive")) ||
        (role.value === "customer_care" && below.includes("customer_care_executive"))
      );
    });
  }

  return list;
};

export default function AssignReportsTo({ onClose, currentUserRole, currentUser }) {
  const isRm = currentUserRole === "regional_manager";
  const regionalState = isRm ? currentUser?.state || "" : "";
  const [assignableNames, setAssignableNames] = useState(null);
  const roleOptions = useMemo(
    () => filterMemberRolesBelowActor(MEMBER_ROLES, currentUserRole, assignableNames),
    [currentUserRole, assignableNames],
  );

  const [memberRole, setMemberRole] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [managerOptions, setManagerOptions] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [query, setQuery] = useState("");
  const [managerQuery, setManagerQuery] = useState("");
  const [locFilters, setLocFilters] = useState({
    state: regionalState || "",
    city: "",
    locality: "",
    pincode: "",
  });
  const [managerLocFilters, setManagerLocFilters] = useState({
    state: regionalState || "",
    city: "",
    locality: "",
    pincode: "",
  });
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAssignableRoles()
      .then((result) => {
        if (cancelled) return;
        setAssignableNames(
          new Set((result.roles || []).map((role) => String(role.name || "").toLowerCase()).filter(Boolean)),
        );
      })
      .catch(() => {
        if (!cancelled) setAssignableNames(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!roleOptions.length) {
      setMemberRole("");
      return;
    }
    if (!roleOptions.some((role) => role.value === memberRole)) {
      setMemberRole(roleOptions[0].value);
    }
  }, [roleOptions, memberRole]);

  useEffect(() => {
    if (!memberRole) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    setLoadingMembers(true);
    setSelectedMember(null);
    setQuery("");
    setLocFilters({ state: regionalState || "", city: "", locality: "", pincode: "" });
    getUserSearch(memberRole)
      .then((response) => {
        if (cancelled) return;
        const users = response?.data?.results || response?.data?.users || [];
        const list = Array.isArray(users) ? users : [];
        const scoped = regionalState
          ? list.filter((user) => !user.state || user.state === regionalState)
          : list;
        setMembers(scoped);
      })
      .catch((err) => {
        if (cancelled) return;
        setMembers([]);
        toast.error(err?.response?.data?.message || "Unable to load team members");
      })
      .finally(() => {
        if (!cancelled) setLoadingMembers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberRole, regionalState]);

  useEffect(() => {
    if (!selectedMember) {
      setManagerOptions([]);
      setHierarchy(null);
      setSelectedManagerId("");
      return;
    }
    const targetRole = selectedMember.role?.name || selectedMember.roleName || memberRole;
    let cancelled = false;
    setLoadingManagers(true);
    getEligibleReportsTo({
      targetRole,
      forUserId: selectedMember._id,
      state: regionalState || undefined,
    })
      .then((response) => {
        if (cancelled) return;
        const data = response.data || response;
        setManagerOptions(Array.isArray(data.users) ? data.users : []);
        setHierarchy(data);
        setSelectedManagerId("");
        setManagerQuery("");
        setManagerLocFilters({ state: regionalState || "", city: "", locality: "", pincode: "" });
      })
      .catch(() => {
        if (!cancelled) {
          setManagerOptions([]);
          setHierarchy(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingManagers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedMember, memberRole, regionalState]);

  const filteredMembers = useMemo(() => {
    const byLocation = applyLocationFilters(members, locFilters);
    const q = query.trim().toLowerCase();
    if (!q) return byLocation;
    return byLocation.filter((user) =>
      `${user.name} ${user.email} ${user.phone} ${user.city} ${user.state} ${user.locality} ${user.pincode}`
        .toLowerCase()
        .includes(q),
    );
  }, [members, query, locFilters]);

  const filteredManagers = useMemo(() => {
    const byLocation = applyLocationFilters(managerOptions, managerLocFilters);
    const q = managerQuery.trim().toLowerCase();
    if (!q) return byLocation;
    return byLocation.filter((user) =>
      `${user.name} ${user.email} ${user.phone} ${user.city} ${user.state} ${user.locality} ${user.pincode} ${user.roleName}`
        .toLowerCase()
        .includes(q),
    );
  }, [managerOptions, managerLocFilters, managerQuery]);

  const hierarchyHint = formatHierarchyHint(hierarchy);
  const canSubmit = selectedMember && selectedManagerId && !submitting;
  const selectedManager = managerOptions.find((user) => String(user._id) === String(selectedManagerId));

  const handleAssign = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await assignReportsTo({
        userId: selectedMember._id,
        reportsToUserId: selectedManagerId,
      });
      setSuccess(true);
      toast.success("Reports-to assigned");
      setTimeout(() => onClose?.(), 1400);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      onClick={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <section className="flex h-full w-full max-w-[720px] flex-col bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-[slideIn_0.28s_ease]">
        <style>{`@keyframes slideIn{from{transform:translateX(24px);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>

        <header className="border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Operations</p>
              <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">Assign reports to</h2>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Pick a person, then choose who they work under.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {success ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Reporting line updated</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                <strong>{selectedMember?.name}</strong> now reports to{" "}
                <strong>{selectedManager?.name || "selected manager"}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Team member role
                </label>
                <select
                  value={memberRole}
                  onChange={(event) => setMemberRole(event.target.value)}
                  disabled={!roleOptions.length}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                >
                  {!roleOptions.length && <option value="">No roles below you</option>}
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.group} · {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Only roles below you in the hierarchy are listed — not peers or higher roles.
                </p>
              </div>

              <LocationFilterBar
                users={members}
                filters={locFilters}
                setFilters={setLocFilters}
                lockedState={regionalState}
              />

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Find team member
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search name, email, phone…"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-bold text-slate-600">
                    {cleanRoleLabel(memberRole)} · {filteredMembers.length} shown
                  </p>
                  {loadingMembers && <Loader2 size={13} className="animate-spin text-emerald-600" />}
                </div>
                <div className="max-h-[240px] overflow-y-auto">
                  {loadingMembers ? (
                    <p className="p-6 text-center text-sm text-slate-500">Loading members…</p>
                  ) : filteredMembers.length ? (
                    filteredMembers.map((user) => {
                      const active = selectedMember?._id === user._id;
                      const location = [user.locality, user.city, user.state, user.pincode]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => setSelectedMember(user)}
                          className={`flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 ${
                            active ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {String(user.name || "U").charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{user.name}</span>
                            <span className="block truncate text-[11px] text-slate-500">{user.email}</span>
                            {location && (
                              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                <MapPin size={10} /> {location}
                              </span>
                            )}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {cleanRoleLabel(user.role?.name || user.roleName || memberRole)}
                          </span>
                          {active ? (
                            <Check size={16} className="shrink-0 text-emerald-600" />
                          ) : (
                            <ChevronRight size={14} className="shrink-0 text-slate-300" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <UserRound className="mx-auto text-slate-300" size={28} />
                      <p className="mt-2 text-sm font-semibold text-slate-600">No members match these filters</p>
                      <p className="mt-1 text-xs text-slate-400">Clear location filters or change the role.</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedMember && hierarchy && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-600">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Network size={14} className="text-emerald-600" />
                    {selectedMember.name}
                  </div>
                  <p>
                    <span className="font-semibold">Can report to:</span> {hierarchyHint.reportsToText}
                  </p>
                </div>
              )}

              {selectedMember && (
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Reports to (person)
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Filter managers by location, then pick from the list below.
                    </p>
                  </div>

                  <LocationFilterBar
                    users={managerOptions}
                    filters={managerLocFilters}
                    setFilters={setManagerLocFilters}
                    lockedState={regionalState}
                  />

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                      value={managerQuery}
                      onChange={(event) => setManagerQuery(event.target.value)}
                      placeholder="Search manager by name, email, city…"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-600">
                        Eligible managers · {filteredManagers.length} shown
                      </p>
                      {loadingManagers && <Loader2 size={13} className="animate-spin text-emerald-600" />}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto">
                      {loadingManagers ? (
                        <p className="p-6 text-center text-sm text-slate-500">Loading managers…</p>
                      ) : filteredManagers.length ? (
                        filteredManagers.map((user) => {
                          const active = String(selectedManagerId) === String(user._id);
                          const location = [user.locality, user.city, user.state, user.pincode]
                            .filter(Boolean)
                            .join(", ");
                          return (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => setSelectedManagerId(user._id)}
                              className={`flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 ${
                                active ? "bg-emerald-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                {String(user.name || "M").charAt(0).toUpperCase()}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-slate-800">{user.name}</span>
                                <span className="block truncate text-[11px] text-slate-500">
                                  {cleanRoleLabel(user.roleName)}
                                  {user.email ? ` · ${user.email}` : ""}
                                </span>
                                {location && (
                                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                    <MapPin size={10} /> {location}
                                  </span>
                                )}
                              </span>
                              {active ? (
                                <Check size={16} className="shrink-0 text-emerald-600" />
                              ) : (
                                <ChevronRight size={14} className="shrink-0 text-slate-300" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-sm font-semibold text-slate-600">
                            {managerOptions.length
                              ? "No managers match these location filters"
                              : "No eligible managers found"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {managerOptions.length
                              ? "Clear location filters to see more people."
                              : "Create the parent-role user first."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!success && (
          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={15} /> Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleAssign}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  Assign reports-to <Check size={15} />
                </>
              )}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}
