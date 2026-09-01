import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HierarchyRoleFilterSelect from "../../components/common/HierarchyRoleFilterSelect";
import {
  deleteAccessRole,
  deleteAccessUser,
  getAccessRole,
  getAccessRoles,
  getAccessUsers,
  getPermissionCatalog,
  getTeamDirectoryRoles,
  updateAccessRolePermissions,
  updateAccessRoleStatus,
  updateAccessUserStatus,
} from "../../features/accessControl/accessControlService";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import {
  countUsersInExactRole,
  getExactRoleMatch,
  orderRolesByHierarchy,
  userMatchesExactRole,
} from "../../utils/roleHierarchy";

const EXCLUDED_ROLES = new Set(["super_admin", "user", "builder", "builder_staff", "agent"]);
const CUSTOMER_CARE_LIFECYCLE_ROLES = new Set([
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
]);

const cleanRole = (value = "") => String(value || "").replace(/_/g, " ");

/** Custom roles + Customer Care Executive (and legacy aliases). */
const canManageRoleLifecycle = (role) => {
  if (!role || role.isProtected || role.name === "super_admin") return false;
  if (role.roleType === "custom") return true;
  return CUSTOMER_CARE_LIFECYCLE_ROLES.has(String(role.name || "").toLowerCase());
};

const displayRoleLabel = (role) => {
  if (!role) return "Role";
  if (CUSTOMER_CARE_LIFECYCLE_ROLES.has(String(role.name || "").toLowerCase())) {
    return "Customer Care Executive";
  }
  return role.label || cleanRole(role.name);
};

const formatDateTime = (value) => {
  if (!value) return "Never logged in";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never logged in";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserPermissionsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set(["dashboard", "user", "project"]));
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [transferToRoleId, setTransferToRoleId] = useState("");
  const [userStatusSaving, setUserStatusSaving] = useState(false);
  const [userDeleting, setUserDeleting] = useState(false);
  const [userDeleteConfirmation, setUserDeleteConfirmation] = useState("");

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => setIsSuperAdmin(user?.roleName === "super_admin"))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    Promise.all([
      getAccessUsers({ scope: "team_directory" }),
      getPermissionCatalog(),
      getAccessRoles(),
      getTeamDirectoryRoles().catch(() => ({ roles: [] })),
    ])
      .then(([userResult, catalogResult, roleResult, hierarchyResult]) => {
        const dashboardUsers = (Array.isArray(userResult) ? userResult : userResult.users || []).filter(
          (user) => user.roleId && !EXCLUDED_ROLES.has(String(user.roleName || "")),
        );
        const hierarchyById = new Map(
          (hierarchyResult.roles || []).map((item) => [String(item._id), item]),
        );
        const dashboardRoles = (roleResult.roles || [])
          .filter((item) => !EXCLUDED_ROLES.has(item.name))
          .map((item) => {
            const hierarchyRole = hierarchyById.get(String(item._id));
            return {
              ...item,
              effectiveParentRoleId:
                hierarchyRole?.effectiveParentRoleId ||
                item.parentRoleId?._id ||
                item.parentRoleId ||
                null,
            };
          });
        setUsers(dashboardUsers);
        setRoles(dashboardRoles);
        setModules(catalogResult.modules || []);
        if (dashboardUsers[0]) setSelectedUserId(String(dashboardUsers[0]._id));
      })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load user access data"))
      .finally(() => setLoading(false));
  }, []);

  const selectedRoleMatch = useMemo(
    () => (selectedRole ? getExactRoleMatch(selectedRole, roles) : null),
    [roles, selectedRole],
  );

  const roleOptions = useMemo(() => {
    return orderRolesByHierarchy(roles).map((item) => ({
      ...item,
      userCount: countUsersInExactRole(users, item.name, roles),
    }));
  }, [roles, users]);

  const visibleUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !selectedRoleMatch || userMatchesExactRole(user, selectedRoleMatch);
      const searchable =
        `${user.name} ${user.email} ${user.phone} ${user.roleName} ${user.state} ${user.city} ${user.locality} ${user.pincode}`.toLowerCase();
      return matchesRole && (!value || searchable.includes(value));
    });
  }, [query, selectedRoleMatch, users]);

  const selectedUser = visibleUsers.find((user) => String(user._id) === selectedUserId) || null;
  const selectedRoleRecord = roles.find((item) => item.name === selectedRole) || null;

  // Keep selection in sync with the active role filter (clear when empty).
  useEffect(() => {
    if (!visibleUsers.length) {
      if (selectedUserId) setSelectedUserId("");
      return;
    }
    const stillVisible = visibleUsers.some((user) => String(user._id) === selectedUserId);
    if (!stillVisible) setSelectedUserId(String(visibleUsers[0]._id));
  }, [visibleUsers, selectedUserId]);

  useEffect(() => {
    setUserDeleteConfirmation("");
  }, [selectedUserId]);

  useEffect(() => {
    setDeleteConfirmation("");
  }, [selectedRole]);

  useEffect(() => {
    if (selectedUser?.roleId) {
      getAccessRole(selectedUser.roleId)
        .then(({ role: roleResult }) => {
          setRole(roleResult);
          setPermissions(new Set(roleResult.permissions || []));
        })
        .catch((error) => toast.error(error.response?.data?.message || "Unable to load assigned role"));
      return;
    }

    if (selectedRoleRecord) {
      setRole(selectedRoleRecord);
      setPermissions(new Set(selectedRoleRecord.permissions || []));
      return;
    }

    if (!selectedRole) {
      setRole(null);
      setPermissions(new Set());
    }
  }, [selectedUser?.roleId, selectedRole, selectedRoleRecord]);

  const selectRole = (roleName) => {
    setSelectedRole(roleName);
    setQuery("");
    const match = roleName ? getExactRoleMatch(roleName, roles) : null;
    const matched = users.filter((user) => !match || userMatchesExactRole(user, match));
    setSelectedUserId(matched[0] ? String(matched[0]._id) : "");
  };

  const location = [selectedUser?.locality, selectedUser?.city, selectedUser?.state, selectedUser?.pincode]
    .filter(Boolean)
    .join(", ");

  const sharedCount = role ? users.filter((user) => String(user.roleId) === String(role._id)).length : 0;
  const sharedCountForSelectedRole = selectedRoleRecord
    ? users.filter((user) => String(user.roleId) === String(selectedRoleRecord._id)).length
    : 0;

  const togglePermission = (key) =>
    setPermissions((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleModule = (item) =>
    setPermissions((current) => {
      const next = new Set(current);
      const allSelected = item.actions.every(({ key }) => next.has(key));
      item.actions.forEach(({ key }) => (allSelected ? next.delete(key) : next.add(key)));
      return next;
    });

  const save = async () => {
    if (!role) return;
    if (!permissions.size) return toast.error("Select at least one permission");
    setSaving(true);
    try {
      const result = await updateAccessRolePermissions(role._id, [...permissions]);
      setRole(result.role);
      setPermissions(new Set(result.role.permissions || []));
      toast.success(`${role.label} permissions updated`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Permission update failed");
    } finally {
      setSaving(false);
    }
  };

  const changeRoleStatus = async (isActive) => {
    const targetRole = selectedRoleRecord || role;
    if (!targetRole) return;
    setStatusSaving(true);
    try {
      const result = await updateAccessRoleStatus(targetRole._id, isActive);
      const updatedRole = result.role || { ...targetRole, isActive };
      if (role && String(role._id) === String(targetRole._id)) {
        setRole(updatedRole);
      }
      setRoles((current) =>
        current.map((item) =>
          String(item._id) === String(targetRole._id)
            ? { ...item, isActive: updatedRole.isActive }
            : item,
        ),
      );
      setDeleteConfirmation("");
      toast.success(
        `${displayRoleLabel(targetRole)} ${isActive ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update role status");
    } finally {
      setStatusSaving(false);
    }
  };

  const deleteSelectedRole = async () => {
    const targetRole = selectedRoleRecord || role;
    const assignedCount = targetRole
      ? users.filter((user) => String(user.roleId) === String(targetRole._id)).length
      : 0;
    if (!targetRole || targetRole.isActive !== false || deleteConfirmation !== targetRole.name) {
      return;
    }
    if (assignedCount > 0 && !transferToRoleId) {
      return toast.error("Select a transfer role for assigned users before deleting");
    }
    setDeleting(true);
    try {
      const result = await deleteAccessRole(
        targetRole._id,
        transferToRoleId ? { transferToRoleId } : {},
      );
      if (transferToRoleId && assignedCount > 0) {
        setUsers((current) =>
          current.map((user) =>
            String(user.roleId) === String(targetRole._id)
              ? { ...user, roleId: transferToRoleId }
              : user,
          ),
        );
      }
      setRoles((current) => current.filter((item) => String(item._id) !== String(targetRole._id)));
      setSelectedRole("");
      setSelectedUserId("");
      setRole(null);
      setPermissions(new Set());
      setDeleteConfirmation("");
      setTransferToRoleId("");
      toast.success(result.message || "Role deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Role deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const changeSelectedUserStatus = async (isActive) => {
    if (!selectedUser) return;
    setUserStatusSaving(true);
    try {
      const result = await updateAccessUserStatus(selectedUser._id, isActive);
      const nextActive = result?.user?.isActive ?? isActive;
      setUsers((current) =>
        current.map((item) =>
          String(item._id) === String(selectedUser._id) ? { ...item, isActive: nextActive } : item,
        ),
      );
      toast.success(result.message || (isActive ? "User activated" : "User deactivated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update user status");
    } finally {
      setUserStatusSaving(false);
    }
  };

  const deleteSelectedUserPermanently = async () => {
    if (!selectedUser || userDeleteConfirmation !== "DELETE") return;
    setUserDeleting(true);
    try {
      const result = await deleteAccessUser(selectedUser._id, "Deleted by Super Admin from User permissions");
      setUsers((current) => current.filter((item) => String(item._id) !== String(selectedUser._id)));
      setSelectedUserId("");
      setUserDeleteConfirmation("");
      toast.success(result.message || "User permanently deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "User deletion failed");
    } finally {
      setUserDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] pb-12 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck size={14} /> Access control
          </div>
          <h1 className="text-3xl font-bold tracking-tight">User permissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Filter by organisation hierarchy, review login activity, and update module access.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isSuperAdmin && role && role.name !== "super_admin" && (
            <button
              type="button"
              onClick={() => navigate(`/access-control/roles/${role._id}/permissions`)}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm hover:bg-emerald-50"
            >
              <Pencil size={17} /> Edit role & parent
            </button>
          )}
          <button
            onClick={save}
            disabled={!role || saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving…" : "Save permissions"}
          </button>
        </div>
      </div>

      <div className="grid min-h-[700px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)] lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50/70 p-5 lg:border-b-0 lg:border-r">
          <div className="space-y-3">
            <HierarchyRoleFilterSelect
              label="Filter by role"
              value={selectedRole}
              onChange={selectRole}
              roles={roleOptions}
              getLabel={displayRoleLabel}
              allLabel="All dashboard roles"
              emptyHint="Roles in hierarchy"
            />

            {isSuperAdmin && selectedRole && selectedRoleRecord && canManageRoleLifecycle(selectedRoleRecord) && (
              <div
                className={`rounded-xl border p-3 ${
                  selectedRoleRecord.isActive === false
                    ? "border-slate-200 bg-white"
                    : "border-emerald-200 bg-emerald-50/80"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Role controls (whole job)
                </p>
                <div className="mt-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          selectedRoleRecord.isActive === false ? "bg-slate-400" : "bg-emerald-500"
                        }`}
                      />
                      <strong className="truncate text-xs text-slate-800">
                        {displayRoleLabel(selectedRoleRecord)}:{" "}
                        {selectedRoleRecord.isActive === false ? "Deactivated" : "Active"}
                      </strong>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      {selectedRoleRecord.isActive === false
                        ? "This job is off for everyone in the list below."
                        : `Affects all ${sharedCountForSelectedRole} people in this role.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={statusSaving || deleting}
                    onClick={() => changeRoleStatus(selectedRoleRecord.isActive === false)}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition disabled:opacity-50 ${
                      selectedRoleRecord.isActive === false
                        ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {statusSaving
                      ? "…"
                      : selectedRoleRecord.isActive === false
                        ? "Activate role"
                        : "Deactivate role"}
                  </button>
                </div>
                {selectedRoleRecord.isActive === false && (
                  <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2">
                    {sharedCountForSelectedRole > 0 && (
                      <>
                        <p className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] leading-4 text-blue-900">
                          Safe delete: transfer {sharedCountForSelectedRole} user
                          {sharedCountForSelectedRole === 1 ? "" : "s"} first.
                        </p>
                        <select
                          value={transferToRoleId}
                          onChange={(event) => setTransferToRoleId(event.target.value)}
                          disabled={deleting || statusSaving}
                          className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-blue-500"
                        >
                          <option value="">Transfer users to…</option>
                          {roles
                            .filter(
                              (item) =>
                                String(item._id) !== String(selectedRoleRecord._id) &&
                                item.isActive !== false,
                            )
                            .map((item) => (
                              <option key={item._id} value={item._id}>
                                {displayRoleLabel(item)}
                              </option>
                            ))}
                        </select>
                      </>
                    )}
                    <input
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      disabled={deleting || statusSaving}
                      placeholder={`Type ${selectedRoleRecord.name}`}
                      className="w-full rounded-lg border border-red-200 bg-white px-2 py-1.5 font-mono text-[11px] outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      disabled={
                        deleteConfirmation !== selectedRoleRecord.name ||
                        deleting ||
                        statusSaving ||
                        (sharedCountForSelectedRole > 0 && !transferToRoleId)
                      }
                      onClick={deleteSelectedRole}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {deleting
                        ? "Deleting…"
                        : sharedCountForSelectedRole > 0
                          ? "Transfer & delete"
                          : "Delete role"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <span
                className={`absolute left-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg transition ${
                  query
                    ? "bg-[#12A150] text-white shadow-sm shadow-emerald-600/30"
                    : "bg-[#EAF8F0] text-[#12A150]"
                }`}
              >
                <Search size={14} strokeWidth={2.25} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search selected role users"
                className={`h-10 w-full rounded-xl border bg-white py-2 pl-12 pr-3 text-[13px] font-semibold text-[#101820] outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-[#12A150] focus:ring-4 focus:ring-[#12A150]/15 ${
                  query
                    ? "border-[#12A150] shadow-sm shadow-emerald-600/10"
                    : "border-[#d9ebe0] hover:border-[#12A150]/50"
                }`}
              />
            </div>
          </div>
          <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading users…</p>
            ) : visibleUsers.length ? (
              visibleUsers.map((user) => {
                const userLocation = [user.locality, user.city, user.state, user.pincode]
                  .filter(Boolean)
                  .join(", ");
                const isSelected = selectedUserId === String(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUserId(String(user._id))}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50 shadow-sm"
                        : "border-transparent bg-white hover:border-slate-200"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <UserRound size={18} />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block truncate text-sm font-bold">{user.name || "Unnamed user"}</span>
                      <span className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <Mail size={12} className="shrink-0" />
                        {user.email || "No email"}
                      </span>
                      <span className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <Phone size={12} className="shrink-0" />
                        {user.phone || "No phone"}
                      </span>
                      <span className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <MapPin size={12} className="shrink-0" />
                        {userLocation || "Location not set"}
                      </span>
                      <span className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <Clock3 size={12} className="shrink-0" />
                        Last login: {formatDateTime(user.lastLoginAt)}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold capitalize text-emerald-700">
                        {CUSTOMER_CARE_LIFECYCLE_ROLES.has(String(user.roleName || "").toLowerCase())
                          ? "Customer Care Executive"
                          : cleanRole(user.roleName)}
                        {user.isActive === false ? " · Deactivated" : ""}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
                <Users className="mx-auto mb-3 text-slate-300" size={32} />
                <p className="text-sm font-semibold text-slate-600">
                  {selectedRole
                    ? `No users under ${selectedRoleRecord?.label || cleanRole(selectedRole)}`
                    : "No dashboard users found"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedRole
                    ? "No users are currently assigned to this exact role."
                    : "Create credentials for a dashboard role to see people here."}
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="p-5 sm:p-7">
          {!role ? (
            <div className="grid h-full place-items-center text-center text-slate-500">
              <div>
                <Users className="mx-auto mb-3" size={42} />
                <p>Select a dashboard role or user to inspect access.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    {selectedUser ? "Assigned access" : "Role access"}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {selectedUser?.name || displayRoleLabel(role)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Role: <strong className="text-slate-700">{displayRoleLabel(role)}</strong> ·{" "}
                    {permissions.size} permissions
                    {selectedUser?.isActive === false ? " · User deactivated" : ""}
                  </p>
                  {selectedUser ? (
                    <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={15} className="shrink-0 text-emerald-600" />
                        <span>{location || "Work location not provided"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail size={15} className="shrink-0 text-emerald-600" />
                        <span>{selectedUser.email || "No email"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone size={15} className="shrink-0 text-emerald-600" />
                        <span>{selectedUser.phone || "No phone"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock3 size={15} className="shrink-0 text-emerald-600" />
                        <span>Last login: {formatDateTime(selectedUser.lastLoginAt)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {selectedRole
                        ? "No users are assigned to this role yet."
                        : "Select a user from the list to review their access."}
                    </p>
                  )}
                </div>
                {sharedCount > 1 && (
                  <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                    <strong>Shared role:</strong> Saving changes updates {sharedCount} users assigned to this
                    role.
                  </div>
                )}
              </div>
              {isSuperAdmin && selectedUser && (
                <div
                  className={`mt-5 rounded-2xl border p-4 ${
                    selectedUser.isActive === false
                      ? "border-slate-200 bg-slate-50"
                      : "border-rose-100 bg-rose-50/50"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    User controls (this person only)
                  </p>
                  <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            selectedUser.isActive === false ? "bg-slate-400" : "bg-emerald-500"
                          }`}
                        />
                        <strong className="text-sm">
                          {selectedUser.name || "User"}:{" "}
                          {selectedUser.isActive === false ? "Deactivated" : "Active"}
                        </strong>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Turns this one account on or off. Does not change the role for others.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={userStatusSaving || userDeleting}
                      onClick={() => changeSelectedUserStatus(selectedUser.isActive === false)}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
                        selectedUser.isActive === false
                          ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      {selectedUser.isActive === false ? <RotateCcw size={16} /> : <Power size={16} />}
                      {userStatusSaving
                        ? "Updating..."
                        : selectedUser.isActive === false
                          ? "Activate user"
                          : "Deactivate user"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-red-600">
                        Type DELETE to permanently remove {selectedUser.name || "this user"}
                      </span>
                      <input
                        value={userDeleteConfirmation}
                        onChange={(event) => setUserDeleteConfirmation(event.target.value)}
                        disabled={userDeleting || userStatusSaving}
                        placeholder="DELETE"
                        className="mt-1.5 w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={userDeleteConfirmation !== "DELETE" || userDeleting || userStatusSaving}
                      onClick={deleteSelectedUserPermanently}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {userDeleting ? "Deleting..." : "Delete permanently"}
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-5 grid gap-3 xl:grid-cols-2">
                {modules.map((item) => {
                  const open = expanded.has(item.key);
                  const count = item.actions.filter(({ key }) => permissions.has(key)).length;
                  return (
                    <article key={item.key} className="self-start overflow-hidden rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-3 p-4">
                        <button
                          type="button"
                          onClick={() => toggleModule(item)}
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                            count === item.actions.length
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {count === item.actions.length && <Check size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((current) => {
                              const next = new Set(current);
                              next.has(item.key) ? next.delete(item.key) : next.add(item.key);
                              return next;
                            })
                          }
                          className="flex min-w-0 flex-1 items-center text-left"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold">{item.label}</span>
                            <span className="block truncate text-xs text-slate-500">{item.description}</span>
                          </span>
                          <span className="mx-3 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
                            {count}/{item.actions.length}
                          </span>
                          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                        </button>
                      </div>
                      {open && (
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                          {item.actions.map((action) => (
                            <label
                              key={action.key}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${
                                permissions.has(action.key)
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={permissions.has(action.key)}
                                onChange={() => togglePermission(action.key)}
                                className="accent-emerald-600"
                              />
                              {action.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
