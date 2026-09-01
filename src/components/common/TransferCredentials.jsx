import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Network,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getEligibleReportsTo,
  getUserSearch,
  transferCredentials,
} from "../../features/user/userService";
import { getAssignableRoles } from "../../features/accessControl/accessControlService";
import {
  cleanRoleLabel,
  formatHierarchyHint,
  getRolesBelowActor,
  isRoleBelowActor,
} from "../../utils/reportsToHierarchy";
import LocationFilterBar, { applyLocationFilters } from "./LocationFilterBar";
import HierarchyRoleFilterSelect from "./HierarchyRoleFilterSelect";

const ROLES = [
  { label: "Super Admin", value: "super_admin", group: "Platform" },
  { label: "Admin", value: "admin", group: "Platform" },
  { label: "CEO", value: "ceo", group: "Leadership" },
  { label: "Founder", value: "founder", group: "Leadership" },
  { label: "Operations Head", value: "operations_head", group: "Operations" },
  { label: "BD Head", value: "business_development_head", group: "Sales & BD" },
  { label: "Regional Manager", value: "regional_manager", group: "Sales & BD" },
  { label: "BD Manager", value: "business_development_manager", group: "Sales & BD" },
  { label: "Sales Manager", value: "sales_manager", group: "Sales & BD" },
  { label: "Sales Executive", value: "sales_agent", group: "Sales & BD" },
  { label: "Support Head", value: "customer_support_head", group: "Customer Support" },
  { label: "Customer Support Team Lead", value: "customer_support_team_lead", group: "Customer Support" },
  { label: "Customer Care", value: "customer_care_executive", group: "Customer Support" },
  { label: "Customer Care (legacy)", value: "customer_care", group: "Customer Support" },
  { label: "Relationship Manager", value: "relationship_manager", group: "Customer Support" },
  { label: "Marketing Head", value: "marketing_head", group: "Marketing" },
  { label: "Digital Marketing", value: "digital_marketing", group: "Marketing" },
  { label: "Social Media", value: "social_media", group: "Marketing" },
  { label: "Content Team", value: "content_team", group: "Marketing" },
  { label: "Creative Team", value: "creative_team", group: "Marketing" },
  { label: "Performance Marketing", value: "performance_marketing", group: "Marketing" },
  { label: "Accounts", value: "accounts", group: "Back office" },
  { label: "Accounts & Finance", value: "accounts_finance", group: "Back office" },
  { label: "Legal & Compliance", value: "legal_compliance", group: "Back office" },
  { label: "HR & Admin", value: "hr_administration", group: "Back office" },
  { label: "Tech Support Head", value: "technical_support_head", group: "Technical" },
  { label: "Tech Support Team", value: "technical_support_team", group: "Technical" },
];

const RM_ROLES = ["sales_manager", "sales_agent", "relationship_manager"];

const roleLabel = (value) => ROLES.find((role) => role.value === value)?.label || cleanRoleLabel(value);

const GROUP_DEPTH = {
  Platform: 0,
  Leadership: 0,
  Operations: 0,
  "Sales & BD": 1,
  "Customer Support": 1,
  Marketing: 1,
  "Back office": 2,
  Technical: 2,
};

/** Only hierarchy children under the actor — never self / never above. */
const filterRolesBelowActor = (roles, currentUserRole, assignableNames) => {
  const actor = String(currentUserRole || "").toLowerCase();
  let list = roles.filter((role) => role.value !== "super_admin" && role.value !== "user");

  if (actor === "regional_manager") {
    list = list.filter((role) => RM_ROLES.includes(role.value));
  }

  // Prefer API assignable set (DB descendants). Fall back to canonical below-map.
  if (assignableNames?.size) {
    list = list.filter(
      (role) =>
        assignableNames.has(role.value) ||
        (role.value === "sales_agent" && assignableNames.has("sales_executive")) ||
        (role.value === "sales_executive" && assignableNames.has("sales_agent")) ||
        (role.value === "customer_care" && assignableNames.has("customer_care_executive")) ||
        (role.value === "customer_care_executive" && assignableNames.has("customer_care")),
    );
  } else if (actor && actor !== "super_admin" && actor !== "admin") {
    list = list.filter((role) => isRoleBelowActor(actor, role.value));
  }

  // Hard safety: never show the actor's own role or anything above them.
  if (actor && actor !== "super_admin" && actor !== "admin") {
    const below = getRolesBelowActor(actor) || [];
    list = list.filter((role) => {
      const value = role.value;
      if (value === actor) return false;
      if (below.length) {
        return (
          below.includes(value) ||
          (value === "sales_agent" && below.includes("sales_executive")) ||
          (value === "customer_care" && below.includes("customer_care_executive"))
        );
      }
      return isRoleBelowActor(actor, value);
    });
  }

  return list;
};

const STEPS = [
  { id: 1, title: "Find person", hint: "Who needs a new role?" },
  { id: 2, title: "New role", hint: "What should they become?" },
  { id: 3, title: "Confirm", hint: "Review and transfer" },
];

function groupRoles(roles) {
  const map = new Map();
  roles.forEach((role) => {
    const list = map.get(role.group) || [];
    list.push(role);
    map.set(role.group, list);
  });
  return [...map.entries()];
}

export default function TransferCredentials({ onClose, currentUserRole, currentUser }) {
  const regionalState = currentUserRole === "regional_manager" ? currentUser?.state || "" : "";
  const [assignableNames, setAssignableNames] = useState(null);

  const allowedRoles = useMemo(
    () => filterRolesBelowActor(ROLES, currentUserRole, assignableNames),
    [currentUserRole, assignableNames],
  );
  const sourceRoles = allowedRoles;

  const sourceRoleOptions = useMemo(
    () =>
      sourceRoles.map((role) => ({
        name: role.value,
        label: role.label,
        group: role.group,
        hierarchyDepth: GROUP_DEPTH[role.group] ?? 1,
      })),
    [sourceRoles],
  );

  const [step, setStep] = useState(1);
  const [sourceRole, setSourceRole] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [locFilters, setLocFilters] = useState({
    state: regionalState || "",
    city: "",
    locality: "",
    pincode: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  const [reportsToUserId, setReportsToUserId] = useState("");
  const [reportsToOptions, setReportsToOptions] = useState([]);
  const [reportsToQuery, setReportsToQuery] = useState("");
  const [reportsToLocFilters, setReportsToLocFilters] = useState({
    state: regionalState || "",
    city: "",
    locality: "",
    pincode: "",
  });
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAssignableRoles()
      .then((result) => {
        if (cancelled) return;
        const names = new Set(
          (result.roles || []).map((role) => String(role.name || "").toLowerCase()).filter(Boolean),
        );
        setAssignableNames(names);
      })
      .catch(() => {
        if (!cancelled) setAssignableNames(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Drop selection if role is no longer allowed under hierarchy.
    if (sourceRole && !sourceRoles.some((role) => role.value === sourceRole)) {
      setSourceRole("");
      setSelectedUser(null);
    }
    if (targetRole && !allowedRoles.some((role) => role.value === targetRole)) {
      setTargetRole("");
    }
  }, [sourceRoles, allowedRoles, sourceRole, targetRole]);

  useEffect(() => {
    if (!sourceRole) {
      setUsers([]);
      return;
    }
    let cancelled = false;
    setUsersLoading(true);
    getUserSearch(sourceRole)
      .then((res) => {
        if (cancelled) return;
        let list = res?.data?.results || [];
        if (regionalState) {
          list = list.filter((user) => !user.state || user.state === regionalState);
        }
        setUsers(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setUsers([]);
        toast.error(err?.response?.data?.message || "Unable to load users. Retry in a moment.");
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceRole, regionalState]);

  useEffect(() => {
    if (!targetRole || !selectedUser) {
      setReportsToOptions([]);
      setHierarchy(null);
      setReportsToUserId("");
      return;
    }
    let cancelled = false;
    getEligibleReportsTo({
      targetRole,
      forUserId: selectedUser._id,
      state: regionalState || undefined,
    })
      .then((response) => {
        if (cancelled) return;
        const data = response.data || response;
        setReportsToOptions(Array.isArray(data.users) ? data.users : []);
        setHierarchy(data);
        setReportsToUserId("");
        setReportsToQuery("");
        setReportsToLocFilters({ state: regionalState || "", city: "", locality: "", pincode: "" });
      })
      .catch(() => {
        if (!cancelled) {
          setReportsToOptions([]);
          setHierarchy(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [targetRole, selectedUser, regionalState]);

  const filteredUsers = useMemo(() => {
    const byLocation = applyLocationFilters(users, locFilters);
    const q = userQuery.trim().toLowerCase();
    if (!q) return byLocation;
    return byLocation.filter((user) =>
      `${user.name} ${user.email} ${user.phone} ${user.city} ${user.state} ${user.locality} ${user.pincode}`
        .toLowerCase()
        .includes(q),
    );
  }, [users, userQuery, locFilters]);

  const filteredTargetRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    const list = allowedRoles.filter((role) => role.value !== "user");
    if (!q) return list;
    return list.filter(
      (role) =>
        role.label.toLowerCase().includes(q) ||
        role.value.includes(q) ||
        role.group.toLowerCase().includes(q),
    );
  }, [allowedRoles, roleQuery]);

  const groupedTargetRoles = useMemo(() => groupRoles(filteredTargetRoles), [filteredTargetRoles]);
  const filteredReportsTo = useMemo(() => {
    const byLocation = applyLocationFilters(reportsToOptions, reportsToLocFilters);
    const q = reportsToQuery.trim().toLowerCase();
    if (!q) return byLocation;
    return byLocation.filter((user) =>
      `${user.name} ${user.email} ${user.phone} ${user.city} ${user.state} ${user.locality} ${user.pincode} ${user.roleName}`
        .toLowerCase()
        .includes(q),
    );
  }, [reportsToOptions, reportsToLocFilters, reportsToQuery]);
  const hierarchyHint = formatHierarchyHint(hierarchy);
  const currentRoleName =
    selectedUser?.role?.name || selectedUser?.roleName || sourceRole || "";

  const goNextFromUser = () => {
    if (!selectedUser) return toast.error("Select the person whose role you want to change");
    setStep(2);
  };

  const goNextFromRole = () => {
    if (!targetRole) return toast.error("Select the new role");
    if (targetRole === currentRoleName) {
      return toast.error("Pick a different role than their current one");
    }
    setStep(3);
  };

  const handleTransfer = async () => {
    if (!selectedUser || !targetRole || loading) return;
    setLoading(true);
    try {
      const payload = { roleName: targetRole };
      if (reportsToUserId) payload.reportsToUserId = reportsToUserId;
      else payload.clearManager = true;
      await transferCredentials(selectedUser._id, payload);
      setSuccess(true);
      toast.success(`${selectedUser.name} is now ${roleLabel(targetRole)}`);
      setTimeout(() => onClose?.(), 1600);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      onClick={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <section className="flex h-full w-full max-w-[720px] flex-col bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-[slideIn_0.28s_ease]">
        <style>{`@keyframes slideIn{from{transform:translateX(24px);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>

        {/* Header — compact */}
        <header className="border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Operations</p>
              <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">Transfer credentials</h2>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Change role only — login stays the same.
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

          {!success && (
            <ol className="mt-3 flex items-center gap-1.5">
              {STEPS.map((item, index) => {
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <li key={item.id} className="flex min-w-0 flex-1 items-center gap-1.5">
                    <div
                      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                        active
                          ? "border-emerald-300 bg-emerald-50"
                          : done
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                          done || active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {done ? <Check size={11} /> : item.id}
                      </span>
                      <span className={`truncate text-[11px] font-semibold ${active ? "text-emerald-800" : "text-slate-600"}`}>
                        {item.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && <span className="hidden text-slate-300 sm:inline">›</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {success ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={28} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">Transfer complete</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                <strong>{selectedUser?.name}</strong> now has the <strong>{roleLabel(targetRole)}</strong> role.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <HierarchyRoleFilterSelect
                      label="Current role"
                      value={sourceRole}
                      onChange={(next) => {
                        setSourceRole(next);
                        setSelectedUser(null);
                        setUserQuery("");
                        setLocFilters({
                          state: regionalState || "",
                          city: "",
                          locality: "",
                          pincode: "",
                        });
                      }}
                      roles={sourceRoleOptions}
                      getLabel={(role) => role.label || roleLabel(role.name)}
                      getMeta={(role) => role.group || ""}
                      hideAllOption
                      allLabel="Select their current role…"
                      emptyHint="Roles below you"
                      headerNote="Only roles below you in the organisation hierarchy are listed."
                    />
                    {!sourceRoles.length && (
                      <p className="mt-1 text-xs text-amber-700">
                        No child roles under your account. You cannot transfer credentials for higher or peer roles.
                      </p>
                    )}
                  </div>

                  {sourceRole && (
                    <>
                      <LocationFilterBar
                        users={users}
                        filters={locFilters}
                        setFilters={setLocFilters}
                        lockedState={regionalState}
                      />

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Find the person
                        </label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                          <input
                            value={userQuery}
                            onChange={(event) => setUserQuery(event.target.value)}
                            placeholder={`Search ${roleLabel(sourceRole)} by name, email…`}
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-bold text-slate-600">
                            {roleLabel(sourceRole)} · {filteredUsers.length} shown
                          </p>
                          {usersLoading && <Loader2 size={13} className="animate-spin text-emerald-600" />}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {usersLoading ? (
                            <p className="p-6 text-center text-sm text-slate-500">Loading people…</p>
                          ) : filteredUsers.length ? (
                            filteredUsers.map((user) => {
                              const active = selectedUser?._id === user._id;
                              const location = [user.locality, user.city, user.state, user.pincode]
                                .filter(Boolean)
                                .join(", ");
                              return (
                                <button
                                  key={user._id}
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
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
                              <p className="mt-2 text-sm font-semibold text-slate-600">No people match these filters</p>
                              <p className="mt-1 text-xs text-slate-400">
                                Clear location filters or pick another role.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!sourceRole && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                      <ShieldCheck className="mx-auto text-slate-300" size={28} />
                      <p className="mt-2 text-sm font-semibold text-slate-600">Choose their current role first</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Then filter by location and select the person.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Selected person</p>
                    <p className="mt-1 text-base font-black text-slate-900">{selectedUser?.name}</p>
                    <p className="text-xs text-slate-500">
                      Current role: <strong>{roleLabel(currentRoleName)}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Search new role
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
                      <input
                        value={roleQuery}
                        onChange={(event) => setRoleQuery(event.target.value)}
                        placeholder="Search Sales Manager, Team Lead, Marketing…"
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {groupedTargetRoles.map(([group, roles]) => (
                      <div key={group} className="overflow-hidden rounded-2xl border border-slate-200">
                        <div className="bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {group}
                        </div>
                        <div className="divide-y divide-slate-100">
                          {roles.map((role) => {
                            const active = targetRole === role.value;
                            const isCurrent = role.value === currentRoleName;
                            return (
                              <button
                                key={role.value}
                                type="button"
                                disabled={isCurrent}
                                onClick={() => setTargetRole(role.value)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                                  isCurrent
                                    ? "cursor-not-allowed bg-slate-50 opacity-50"
                                    : active
                                      ? "bg-emerald-50"
                                      : "hover:bg-slate-50"
                                }`}
                              >
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200">
                                  <ShieldCheck size={16} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-bold text-slate-800">{role.label}</span>
                                  <span className="block text-[11px] text-slate-400">{role.value}</span>
                                </span>
                                {isCurrent && (
                                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                    Current
                                  </span>
                                )}
                                {active && !isCurrent && <Check size={18} className="text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!groupedTargetRoles.length && (
                      <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        No roles match your search.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">From</p>
                      <p className="mt-2 text-lg font-black text-slate-900">{selectedUser?.name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{roleLabel(currentRoleName)}</p>
                      <p className="mt-1 truncate text-xs text-slate-400">{selectedUser?.email}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">To</p>
                      <p className="mt-2 text-lg font-black text-emerald-900">{roleLabel(targetRole)}</p>
                      <p className="mt-1 text-xs text-emerald-700/80">Dashboard role will update immediately</p>
                    </div>
                  </div>

                  {hierarchy && (
                    <div className="rounded-2xl border border-slate-200 p-4 text-xs leading-5 text-slate-600">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Network size={16} className="text-emerald-600" />
                        New role in hierarchy
                      </div>
                      <p>
                        <span className="font-semibold text-slate-700">Above:</span> {hierarchyHint.aboveText}
                      </p>
                      <p className="mt-1">
                        <span className="font-semibold text-slate-700">Below:</span> {hierarchyHint.belowText}
                      </p>
                    </div>
                  )}

                  {(hierarchy?.reportsToRoles || []).length > 0 && (
                    <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Reports to after transfer (optional)
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Filter by location, then pick a manager — or leave unselected to clear the old line.
                        </p>
                      </div>

                      <LocationFilterBar
                        users={reportsToOptions}
                        filters={reportsToLocFilters}
                        setFilters={setReportsToLocFilters}
                        lockedState={regionalState}
                      />

                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                          value={reportsToQuery}
                          onChange={(event) => setReportsToQuery(event.target.value)}
                          placeholder="Search manager by name, email, city…"
                          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-bold text-slate-600">
                            Eligible managers · {filteredReportsTo.length} shown
                          </p>
                          {reportsToUserId && (
                            <button
                              type="button"
                              onClick={() => setReportsToUserId("")}
                              className="text-[10px] font-bold text-rose-600 hover:underline"
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {filteredReportsTo.length ? (
                            filteredReportsTo.map((user) => {
                              const active = String(reportsToUserId) === String(user._id);
                              const location = [user.locality, user.city, user.state, user.pincode]
                                .filter(Boolean)
                                .join(", ");
                              return (
                                <button
                                  key={user._id}
                                  type="button"
                                  onClick={() => setReportsToUserId(user._id)}
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
                            <p className="p-6 text-center text-sm text-slate-500">
                              {reportsToOptions.length
                                ? "No managers match these location filters"
                                : "No eligible managers found"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                    This does not change password or OTP secrets. It only updates their dashboard role
                    {reportsToUserId ? " and reports-to person" : ""}.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
            <button
              type="button"
              onClick={() => {
                if (step === 1) onClose?.();
                else setStep((current) => current - 1);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={16} />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step === 1 && (
              <button
                type="button"
                disabled={!selectedUser}
                onClick={goNextFromUser}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                disabled={!targetRole}
                onClick={goNextFromRole}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Review transfer <ArrowRight size={16} />
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleTransfer}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Transferring…
                  </>
                ) : (
                  <>
                    Transfer credentials <Check size={16} />
                  </>
                )}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
