import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, LockKeyhole, Search, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createAccessRole, getAccessRole, getPermissionCatalog, updateAccessRolePermissions } from "../../features/accessControl/accessControlService";

export default function CreateRolePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleId } = useParams();
  const isEditing = Boolean(roleId);
  const [modules, setModules] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requests = [getPermissionCatalog()];
    if (roleId) requests.push(getAccessRole(roleId));

    Promise.all(requests)
      .then(([catalogResult, roleResult]) => {
        const items = catalogResult.modules || [];
        setModules(items || []);
        if (roleResult?.role) {
          setName(roleResult.role.name || "");
          setLabel(roleResult.role.label || "");
          setSelected(new Set(roleResult.role.permissions || []));
        } else {
          setSelected(new Set(["dashboard:view"]));
        }
        setExpanded(new Set((items || []).slice(0, 3).map((item) => item.key)));
      })
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load role permissions"))
      .finally(() => setLoading(false));
  }, [roleId]);

  const visibleModules = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return modules;
    return modules.filter((item) =>
      `${item.label} ${item.description} ${item.actions.map((action) => action.label).join(" ")}`
        .toLowerCase()
        .includes(value),
    );
  }, [modules, query]);

  const togglePermission = (key) => setSelected((current) => {
    const next = new Set(current);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const toggleModule = (item) => setSelected((current) => {
    const next = new Set(current);
    const allSelected = item.actions.every(({ key }) => next.has(key));
    item.actions.forEach(({ key }) => allSelected ? next.delete(key) : next.add(key));
    return next;
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!isEditing && (label.trim().length < 2 || name.trim().length < 2)) return toast.error("Enter a role name and display label");
    if (!selected.size) return toast.error("Select at least one permission");
    setSaving(true);
    try {
      if (isEditing) {
        await updateAccessRolePermissions(roleId, [...selected]);
        toast.success(`${label} permissions updated`);
        navigate("/propenu-team-members");
      } else {
        const result = await createAccessRole({ name, label, permissions: [...selected] });
        toast.success(`${result.role.label} role created`);
        navigate("/access-control/credentials/new", { state: { roleName: result.role.name } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditing ? "Permission update failed" : "Role creation failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1480px] pb-12 text-slate-900">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700">
        <ArrowLeft size={17} /> Back
      </button>

      <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <header className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-9">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Sparkles size={13} /> Access control
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{isEditing ? `Assign permissions to ${label || "role"}` : "Create a dashboard role"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{isEditing ? `Credential created for ${location.state?.createdUserName || "the new team member"}. Review and save role access now.` : "Build precise access from live backend permissions. System account roles remain protected and unchanged."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric value={modules.length} label="Modules" />
              <Metric value={selected.size} label="Selected" accent />
            </div>
          </div>
        </header>

        <form onSubmit={submit} className={isEditing ? "block" : "grid lg:grid-cols-[360px_minmax(0,1fr)]"}>
          {!isEditing && <aside className="border-b border-slate-200 bg-slate-50/70 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="text-emerald-600" size={20} /> Role identity</h2>
            <p className="mt-1 text-sm text-slate-500">{isEditing ? "You are updating the assigned role." : "Use a clear job-based name."}</p>
            <label className="mt-7 block text-xs font-bold uppercase tracking-wider text-slate-500">Display label</label>
            <input disabled={isEditing} value={label} onChange={(e) => { setLabel(e.target.value); if (!name) setName(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_")); }} placeholder="Property Reviewer" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100" />
            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">Role key</label>
            <input disabled={isEditing} value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="property_reviewer" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100" />
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              <div className="mb-1 flex items-center gap-2 font-bold"><LockKeyhole size={15} /> Safe by design</div>
              {isEditing ? "Saving here updates this role. Every team member assigned to the same role receives the updated permissions." : "This creates a custom Admin Dashboard role. User, Builder, Agent and Builder Staff account workflows are not changed."}
            </div>
            <button disabled={saving || loading} className="mt-7 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Saving…" : isEditing ? "Save role permissions" : "Create role & continue"}
            </button>
          </aside>}

          <section className="p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-bold">Module permissions</h2><p className="mt-1 text-sm text-slate-500">Select only what this role needs.</p></div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules or actions" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></div>{isEditing && <button disabled={saving || loading} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50">{saving ? "Saving…" : "Save permissions"}</button>}</div>
            </div>
            {loading ? <div className="py-24 text-center text-slate-500">Loading permission catalog…</div> : (
              <div className="mt-6 grid gap-3 xl:grid-cols-2">
                {visibleModules.map((item) => {
                  const isOpen = expanded.has(item.key) || Boolean(query);
                  const count = item.actions.filter(({ key }) => selected.has(key)).length;
                  return <article key={item.key} className="self-start overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-200 hover:shadow-md">
                    <div className="flex items-center gap-3 p-4">
                      <button type="button" onClick={() => toggleModule(item)} className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${count === item.actions.length ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`}>{count === item.actions.length && <Check size={14} strokeWidth={3} />}</button>
                      <button type="button" onClick={() => setExpanded((current) => { const next = new Set(current); next.has(item.key) ? next.delete(item.key) : next.add(item.key); return next; })} className="flex min-w-0 flex-1 items-center text-left">
                        <span className="min-w-0 flex-1"><span className="block font-bold">{item.label}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span></span>
                        <span className="mx-3 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{count}/{item.actions.length}</span>{isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                      </button>
                    </div>
                    {isOpen && <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-3">
                      {item.actions.map((action) => <label key={action.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${selected.has(action.key) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}><input type="checkbox" className="accent-emerald-600" checked={selected.has(action.key)} onChange={() => togglePermission(action.key)} />{action.label}</label>)}
                    </div>}
                  </article>;
                })}
              </div>
            )}
          </section>
        </form>
      </div>
    </div>
  );
}

function Metric({ value, label, accent }) {
  return <div className={`min-w-24 rounded-2xl border px-4 py-3 ${accent ? "border-emerald-400/30 bg-emerald-400/15" : "border-white/10 bg-white/5"}`}><div className="text-2xl font-bold">{value}</div><div className="text-xs text-slate-300">{label}</div></div>;
}
