import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, MapPin, Power, RotateCcw, Save, Search, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteAccessRole, getAccessRole, getAccessRoles, getAccessUsers, getPermissionCatalog, updateAccessRolePermissions, updateAccessRoleStatus } from "../../features/accessControl/accessControlService";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";

const EXCLUDED_ROLES = new Set(["super_admin", "user", "builder", "builder_staff", "agent"]);

export default function UserPermissionsPage() {
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

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => setIsSuperAdmin(user?.roleName === "super_admin"))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    Promise.all([getAccessUsers(), getPermissionCatalog(), getAccessRoles()])
      .then(([userResult, catalogResult, roleResult]) => {
        const dashboardUsers = (Array.isArray(userResult) ? userResult : userResult.users || [])
          .filter((user) => user.roleId && !EXCLUDED_ROLES.has(user.roleName));
        const dashboardRoles = (roleResult.roles || [])
          .filter((item) => !EXCLUDED_ROLES.has(item.name));
        setUsers(dashboardUsers);
        setRoles(dashboardRoles);
        setModules(catalogResult.modules || []);
        if (dashboardUsers[0]) setSelectedUserId(String(dashboardUsers[0]._id));
      })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load user access data"))
      .finally(() => setLoading(false));
  }, []);

  const selectedUser = users.find((user) => String(user._id) === selectedUserId);

  useEffect(() => {
    if (!selectedUser?.roleId) return;
    getAccessRole(selectedUser.roleId)
      .then(({ role: roleResult }) => {
        setRole(roleResult);
        setPermissions(new Set(roleResult.permissions || []));
      })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load assigned role"));
  }, [selectedUser?.roleId]);

  const roleOptions = useMemo(() => {
    return roles
      .map((item) => ({
        ...item,
        userCount: users.filter((user) => user.roleName === item.name).length,
      }))
      .sort((a, b) => String(a.label || a.name).localeCompare(String(b.label || b.name)));
  }, [roles, users]);

  const visibleUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !selectedRole || user.roleName === selectedRole;
      const searchable = `${user.name} ${user.email} ${user.phone} ${user.roleName} ${user.state} ${user.city} ${user.locality} ${user.pincode}`.toLowerCase();
      return matchesRole && (!value || searchable.includes(value));
    });
  }, [query, selectedRole, users]);

  const selectRole = (roleName) => {
    setSelectedRole(roleName);
    const firstMatch = users.find((user) => !roleName || user.roleName === roleName);
    setSelectedUserId(firstMatch ? String(firstMatch._id) : "");
    if (roleName && !firstMatch) {
      const selectedRoleRecord = roles.find((item) => item.name === roleName);
      setRole(selectedRoleRecord || null);
      setPermissions(new Set(selectedRoleRecord?.permissions || []));
    } else if (!roleName && !firstMatch) {
      setRole(null);
      setPermissions(new Set());
    }
  };

  const location = [selectedUser?.locality, selectedUser?.city, selectedUser?.state, selectedUser?.pincode]
    .filter(Boolean)
    .join(", ");

  const sharedCount = role ? users.filter((user) => String(user.roleId) === String(role._id)).length : 0;

  const togglePermission = (key) => setPermissions((current) => {
    const next = new Set(current);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const toggleModule = (item) => setPermissions((current) => {
    const next = new Set(current);
    const allSelected = item.actions.every(({ key }) => next.has(key));
    item.actions.forEach(({ key }) => allSelected ? next.delete(key) : next.add(key));
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
    } finally { setSaving(false); }
  };

  const changeRoleStatus = async (isActive) => {
    if (!role) return;
    setStatusSaving(true);
    try {
      const result = await updateAccessRoleStatus(role._id, isActive);
      const updatedRole = result.role || { ...role, isActive };
      setRole(updatedRole);
      setRoles((current) => current.map((item) => String(item._id) === String(role._id) ? { ...item, isActive: updatedRole.isActive } : item));
      setDeleteConfirmation("");
      toast.success(`${role.label} ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update role status");
    } finally {
      setStatusSaving(false);
    }
  };

  const deleteSelectedRole = async () => {
    if (!role || role.isActive !== false || sharedCount > 0 || deleteConfirmation !== role.name) return;
    setDeleting(true);
    try {
      const result = await deleteAccessRole(role._id);
      setRoles((current) => current.filter((item) => String(item._id) !== String(role._id)));
      setSelectedRole("");
      setSelectedUserId("");
      setRole(null);
      setPermissions(new Set());
      setDeleteConfirmation("");
      toast.success(result.message || "Role deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Role deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  return <div className="mx-auto max-w-[1500px] pb-12 text-slate-900">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700"><ShieldCheck size={14} /> Access control</div><h1 className="text-3xl font-bold tracking-tight">User permissions</h1><p className="mt-1 text-sm text-slate-500">Review any dashboard user’s assigned role and update its module access.</p></div>
      <button onClick={save} disabled={!role || saving} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"><Save size={17} />{saving ? "Saving…" : "Save permissions"}</button>
    </div>

    <div className="grid min-h-[700px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)] lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-slate-50/70 p-5 lg:border-b-0 lg:border-r">
        <div className="space-y-3">
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Filter by role</span><select value={selectedRole} onChange={(event) => selectRole(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"><option value="">All dashboard roles</option>{roleOptions.map((item) => <option key={item._id} value={item.name}>{item.label || String(item.name).replace(/_/g, " ")} - {item.userCount ? `${item.userCount} ${item.userCount === 1 ? "user" : "users"}` : "No users"}</option>)}</select></label>
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search selected role users" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></div>
        </div>
        <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
          {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading users…</p> : visibleUsers.length ? visibleUsers.map((user) => <button key={user._id} onClick={() => setSelectedUserId(String(user._id))} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selectedUserId === String(user._id) ? "border-emerald-300 bg-emerald-50 shadow-sm" : "border-transparent bg-white hover:border-slate-200"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selectedUserId === String(user._id) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}><UserRound size={18} /></span><span className="min-w-0"><span className="block truncate text-sm font-bold">{user.name || "Unnamed user"}</span><span className="block truncate text-xs text-slate-500">{user.email || user.phone}</span><span className="mt-1 block text-[11px] font-semibold capitalize text-emerald-700">{String(user.roleName || "").replace(/_/g, " ")}</span></span></button>) : <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">No users found for this role.</p>}
        </div>
      </aside>

      <section className="p-5 sm:p-7">
        {!role ? <div className="grid h-full place-items-center text-center text-slate-500"><div><Users className="mx-auto mb-3" size={42} /><p>Select a dashboard role or user to inspect access.</p></div></div> : <>
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{selectedUser ? "Assigned access" : "Role access"}</p><h2 className="mt-1 text-2xl font-bold">{selectedUser?.name || role.label || String(role.name).replace(/_/g, " ")}</h2><p className="mt-1 text-sm text-slate-500">Role: <strong className="text-slate-700">{role.label || selectedUser?.roleName}</strong> · {permissions.size} permissions</p>{selectedUser ? <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin size={15} className="shrink-0 text-emerald-600" /><span>{location || "Work location not provided"}</span></p> : <p className="mt-2 text-sm font-semibold text-slate-500">No users are currently assigned to this role.</p>}</div>{sharedCount > 1 && <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"><strong>Shared role:</strong> Saving changes updates {sharedCount} users assigned to this role.</div>}</div>
          {isSuperAdmin && role.roleType === "custom" && !role.isProtected && <div className={`mt-5 rounded-2xl border p-4 ${role.isActive === false ? "border-slate-200 bg-slate-50" : "border-emerald-200 bg-emerald-50/60"}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${role.isActive === false ? "bg-slate-400" : "bg-emerald-500"}`} /><strong className="text-sm">Role status: {role.isActive === false ? "Deactivated" : "Active"}</strong></div><p className="mt-1 text-xs leading-5 text-slate-600">{role.isActive === false ? "Assigned users cannot use this role until it is activated again." : `Deactivating this role affects ${sharedCount} assigned ${sharedCount === 1 ? "user" : "users"}.`}</p></div>
              <button type="button" disabled={statusSaving || deleting} onClick={() => changeRoleStatus(role.isActive === false)} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${role.isActive === false ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50" : "bg-amber-500 text-white hover:bg-amber-600"}`}>{role.isActive === false ? <RotateCcw size={16} /> : <Power size={16} />}{statusSaving ? "Updating..." : role.isActive === false ? "Activate role" : "Deactivate role"}</button>
            </div>
            {role.isActive === false && sharedCount > 0 && <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900"><strong>Permanent deletion is locked.</strong> Reassign all {sharedCount} users to another role first.</div>}
            {role.isActive === false && sharedCount === 0 && <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label><span className="block text-[11px] font-bold uppercase tracking-wider text-red-600">Type {role.name} to confirm permanent deletion</span><input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} disabled={deleting || statusSaving} placeholder={role.name} className="mt-1.5 w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" /></label><button type="button" disabled={deleteConfirmation !== role.name || deleting || statusSaving} onClick={deleteSelectedRole} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={16} />{deleting ? "Deleting..." : "Delete this role"}</button></div>}
          </div>}
          <div className="mt-5 grid gap-3 xl:grid-cols-2">{modules.map((item) => {
            const open = expanded.has(item.key);
            const count = item.actions.filter(({ key }) => permissions.has(key)).length;
            return <article key={item.key} className="self-start overflow-hidden rounded-2xl border border-slate-200"><div className="flex items-center gap-3 p-4"><button type="button" onClick={() => toggleModule(item)} className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${count === item.actions.length ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>{count === item.actions.length && <Check size={14} />}</button><button type="button" onClick={() => setExpanded((current) => { const next = new Set(current); next.has(item.key) ? next.delete(item.key) : next.add(item.key); return next; })} className="flex min-w-0 flex-1 items-center text-left"><span className="min-w-0 flex-1"><span className="block font-bold">{item.label}</span><span className="block truncate text-xs text-slate-500">{item.description}</span></span><span className="mx-3 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{count}/{item.actions.length}</span>{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button></div>{open && <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">{item.actions.map((action) => <label key={action.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${permissions.has(action.key) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}><input type="checkbox" checked={permissions.has(action.key)} onChange={() => togglePermission(action.key)} className="accent-emerald-600" />{action.label}</label>)}</div>}</article>;
          })}</div>
        </>}
      </section>
    </div>
  </div>;
}
