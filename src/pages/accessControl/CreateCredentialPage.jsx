import { createElement, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Check, ChevronDown, KeyRound, Mail, MapPin, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { completeCredentialLocation, getAccessUsers, getAssignableRoles, requestCredentialOtp, verifyCredentialOtp } from "../../features/accessControl/accessControlService";

const EMPTY = { name: "", email: "", role: "", otp: "", locality: "", city: "", state: "", pincode: "" };

export default function CreateCredentialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ ...EMPTY, role: location.state?.roleName || "" });
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [createdRole, setCreatedRole] = useState(null);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.allSettled([getAssignableRoles(), getAccessUsers()]).then(([roleResult, userResult]) => {
      if (roleResult.status === "fulfilled") setRoles(roleResult.value.roles || []);
      else toast.error(roleResult.reason?.response?.data?.message || "Unable to load dashboard roles");
      if (userResult.status === "fulfilled") setUsers(Array.isArray(userResult.value) ? userResult.value : userResult.value?.users || []);
    });
  }, []);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.role) return toast.error("Complete name, email and select a role");
    if (!form.state || !form.city || !form.locality || !/^\d{6}$/.test(form.pincode)) return toast.error("Select a work location and enter a valid 6-digit pincode");
    setBusy(true);
    try { await requestCredentialOtp(form.email); setStep(2); toast.success("Verification code sent"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not send code"); }
    finally { setBusy(false); }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(form.otp)) return toast.error("Enter the 4-digit verification code");
    setBusy(true);
    try {
      const result = await verifyCredentialOtp({ name: form.name, email: form.email, role: form.role, otp: form.otp });
      setToken(result.token);
      setCreatedRole(result.role);
      setStep(3);
      toast.success("Email verified");
    } catch (error) { toast.error(error.response?.data?.message || "Verification failed"); }
    finally { setBusy(false); }
  };

  const complete = async (event) => {
    event.preventDefault();
    if (!form.locality.trim() || !form.city.trim() || !form.state.trim() || !/^\d{6}$/.test(form.pincode)) return toast.error("Complete the location with a valid 6-digit pincode");
    setBusy(true);
    try {
      await completeCredentialLocation({ locality: form.locality, city: form.city, state: form.state, pincode: form.pincode }, token);
      toast.success("Credential created. Review the assigned role permissions.");
      navigate(`/access-control/roles/${createdRole._id}/permissions`, {
        state: { createdUserName: form.name, roleLabel: createdRole.label },
      });
    } catch (error) { toast.error(error.response?.data?.message || "Could not finish account setup"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12 text-slate-900">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft size={17} /> Back</button>
      <div className="grid overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[360px_1fr]">
        <aside className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-9">
          <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"><KeyRound size={23} /></div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Create credentials</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Create and verify a dashboard account, assign an existing role, then review its permissions.</p>
            <div className="mt-9 space-y-3">{[
              [1, "Account & location", UserRound], [2, "Email verification", Mail], [3, "Review & activate", MapPin],
            ].map(([number, label, stepIcon]) => <div key={number} className={`flex items-center gap-3 rounded-xl border p-3 transition ${step === number ? "border-emerald-400/40 bg-emerald-400/15" : step > number || done ? "border-white/10 bg-white/5" : "border-transparent text-slate-500"}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${step > number || done ? "bg-emerald-500" : "bg-white/10"}`}>{step > number || done ? <Check size={16} /> : createElement(stepIcon, { size: 16 })}</span><span className="text-sm font-semibold">{label}</span></div>)}</div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300"><ShieldCheck className="mb-2 text-emerald-400" size={19} />Select an existing active role from the backend. After verification, its permission checkboxes open automatically.</div>
          </div>
        </aside>

        <main className="p-6 sm:p-10">
          {done ? <Success name={form.name} role={createdRole?.label || "Custom access"} onCreateAnother={() => { setForm(EMPTY); setStep(1); setToken(""); setDone(false); }} onDone={() => navigate("/propenu-team-members")} /> : <>
            <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Step {step} of 3</p><h2 className="mt-2 text-2xl font-bold">{step === 1 ? "Account, role and work location" : step === 2 ? "Verify the work email" : "Review and activate credential"}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{Math.round(step / 3 * 100)}% complete</span></div>

            {step === 1 && <form onSubmit={sendOtp} className="grid gap-5 sm:grid-cols-2"><Field label="Full name" icon={UserRound}><input value={form.name} onChange={update("name")} placeholder="e.g. Aarav Sharma" /></Field><Field label="Work email" icon={Mail}><input type="email" value={form.email} onChange={update("email")} placeholder="aarav@propenu.com" /></Field><div className="sm:col-span-2"><RoleSelect roles={roles} users={users} value={form.role} onChange={(role) => setForm((current) => ({ ...current, role }))} /></div><Field label="State" icon={MapPin}><input value={form.state} onChange={update("state")} placeholder="e.g. Andhra Pradesh" /></Field><Field label="City" icon={Building2}><input value={form.city} onChange={update("city")} placeholder="e.g. Pitapuram" /></Field><Field label="Locality" icon={MapPin}><input value={form.locality} onChange={update("locality")} placeholder="Enter locality" /></Field><Field label="Pincode" icon={MapPin}><input inputMode="numeric" maxLength={6} value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "") }))} placeholder="500081" /></Field><div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Existing role assignment.</strong> The selected backend role is assigned to this account; after verification, its permission page opens automatically.</div><div className="sm:col-span-2"><Primary busy={busy}>Send verification code <ArrowRight size={17} /></Primary></div></form>}

            {step === 2 && <form onSubmit={verifyOtp} className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">A 4-digit code was sent to <strong className="text-slate-900">{form.email}</strong>.</div><Field label="Verification code" icon={KeyRound}><input inputMode="numeric" maxLength={4} value={form.otp} onChange={(e) => setForm((current) => ({ ...current, otp: e.target.value.replace(/\D/g, "") }))} className="text-center font-mono text-2xl tracking-[0.45em]" placeholder="0000" /></Field><Primary busy={busy}>Verify & continue <ArrowRight size={17} /></Primary><button type="button" onClick={() => setStep(1)} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Change account information</button></form>}

            {step === 3 && <form onSubmit={complete} className="space-y-5"><div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2"><Review label="Name" value={form.name} /><Review label="Email" value={form.email} /><Review label="Role" value={createdRole?.label || "Created automatically"} /><Review label="Work location" value={`${form.locality}, ${form.city}, ${form.state} - ${form.pincode}`} /></div><Primary busy={busy}>Create account & assign permissions <BadgeCheck size={18} /></Primary><button type="button" onClick={() => setStep(1)} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Edit account or location</button></form>}
          </>}
        </main>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) { return <label className="access-control-field block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><span className="relative block">{createElement(icon, { className: "pointer-events-none absolute left-3.5 top-3.5 text-slate-400", size: 18 })}{children}</span></label>; }
const ROLE_HIERARCHY = [
  ["super_admin", 0], ["ceo", 1], ["founder", 1], ["operations_head", 1],
  ["business_development_head", 2], ["regional_manager", 3], ["business_development_manager", 4], ["sales_agent", 4], ["sales_executive", 4],
  ["customer_support_head", 2], ["team_lead", 3], ["customer_care", 4], ["customer_care_executive", 4], ["relationship_manager", 4],
  ["marketing_head", 2], ["digital_marketing", 3], ["social_media", 3], ["content_team", 3], ["creative_team", 3],
  ["accounts", 2], ["accounts_finance", 2], ["legal_compliance", 2], ["hr_administration", 2],
  ["technical_support_head", 2], ["technical_support_team", 3],
];
const normalizeRole = (value = "") => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const ROLE_ALIASES = {
  operation_head: "operations_head", ceo_founders: "ceo", regional_managers: "regional_manager",
  sales_executives: "sales_executive", team_leads: "team_lead", customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager", accounts_and_finance: "accounts_finance",
};
const hierarchyRank = new Map(ROLE_HIERARCHY.map(([name, depth], index) => [name, { depth, index }]));

function RoleSelect({ roles, users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = roles.find((role) => role.name === value);
  const rolesById = new Map(roles.map((role) => [String(role._id), role]));
  const storedDepth = (role, visited = new Set()) => {
    const parentId = role?.parentRoleId?._id || role?.parentRoleId;
    if (!parentId || visited.has(String(parentId))) return 0;
    const parent = rolesById.get(String(parentId));
    if (!parent) return 1;
    visited.add(String(parentId));
    return 1 + storedDepth(parent, visited);
  };
  const orderedRoles = [...roles].map((role) => {
    const rawNameKey = normalizeRole(role.name);
    const rawLabelKey = normalizeRole(role.label);
    const nameKey = ROLE_ALIASES[rawNameKey] || rawNameKey;
    const labelKey = ROLE_ALIASES[rawLabelKey] || rawLabelKey.replace(/_and_/g, "_");
    const hierarchy = hierarchyRank.get(nameKey) || hierarchyRank.get(labelKey);
    const persistedDepth = storedDepth(role);
    return { ...role, hierarchy: { depth: role.parentRoleId ? persistedDepth : hierarchy?.depth || 0, index: hierarchy?.index ?? 1000 } };
  }).sort((first, second) => first.hierarchy.index - second.hierarchy.index || first.label.localeCompare(second.label));
  const membersFor = (role) => users.filter((user) => String(user.roleId) === String(role._id) || user.roleName === role.name);
  const selectedMembers = selected ? membersFor(selected) : [];
  return <div className="relative z-30">
    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Dashboard role</span>
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left outline-none transition ${open ? "border-emerald-500 ring-4 ring-emerald-100" : "border-slate-200 hover:border-slate-300"}`}>
      <ShieldCheck className="shrink-0 text-slate-400" size={18} />
      <span className={`min-w-0 flex-1 truncate text-sm ${selected ? "font-semibold text-slate-900" : "text-slate-400"}`}>{selected?.label || "Select an existing active role"}</span>
      <ChevronDown className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} size={18} />
    </button>
    {open && <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Organisation hierarchy</div>
      {orderedRoles.length ? orderedRoles.map((role) => { const members = membersFor(role); return <button key={role._id} type="button" onClick={() => { onChange(role.name); setOpen(false); }} style={{ paddingLeft: `${12 + role.hierarchy.depth * 20}px` }} className={`flex w-full items-center gap-2 rounded-lg py-2.5 pr-3 text-left text-sm transition ${value === role.name ? "bg-emerald-50 font-bold text-emerald-800" : "text-slate-700 hover:bg-slate-50"}`}><span className="text-slate-300">{role.hierarchy.depth ? "└" : ""}</span><span className="min-w-0 flex-1 truncate">{role.label}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{members.length}</span>{value === role.name && <Check className="shrink-0 text-emerald-600" size={16} />}</button>; }) : <div className="px-3 py-5 text-center text-sm text-slate-500">No active dashboard roles found</div>}
    </div>}
    {selected && <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-bold text-slate-700"><UsersRound size={15} className="text-emerald-600" /> People assigned to {selected.label}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">{selectedMembers.length}</span></div>{selectedMembers.length ? <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto">{selectedMembers.map((user) => <span key={user._id} title={user.email || user.phone} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">{user.name || user.email || "Unnamed user"}</span>)}</div> : <p className="mt-2 text-[11px] text-slate-400">No users are currently assigned to this role.</p>}</div>}
  </div>;
}
function Primary({ busy, children }) { return <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">{busy ? "Please wait…" : children}</button>; }
function Review({ label, value }) { return <div className="rounded-xl bg-white p-3"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-semibold text-slate-800">{value}</div></div>; }
function Success({ name, role, onCreateAnother, onDone }) { return <div className="py-12 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"><BadgeCheck size={40} /></div><h2 className="mt-6 text-3xl font-bold">Credential ready</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500"><strong>{name}</strong> can now continue with the <strong>{role}</strong> dashboard role.</p><div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"><button onClick={onCreateAnother} className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50">Create another</button><button onClick={onDone} className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">View team</button></div></div>; }
