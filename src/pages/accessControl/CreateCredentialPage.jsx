import { createElement, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Check, KeyRound, Mail, MapPin, Network, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import HierarchyRoleFilterSelect from "../../components/common/HierarchyRoleFilterSelect";
import ActivityFilterSelect from "../Activity/components/ActivityFilterSelect";
import { completeCredentialLocation, getAssignableRoles, requestCredentialOtp, verifyCredentialOtp } from "../../features/accessControl/accessControlService";
import { getEligibleReportsTo } from "../../features/user/userService";
import { cleanRoleLabel, formatHierarchyHint } from "../../utils/reportsToHierarchy";
import {
  orderRolesByHierarchy,
  getAssignedUserCountForRole,
  canonicalTeamRole,
} from "../../utils/roleHierarchy";
import { requestSidebarRefresh } from "../../utils/sidebarActivity";
import { isTerritoryRole } from "../../utils/workingLocations";

const EMPTY = { name: "", email: "", role: "", reportsToUserId: "", otp: "", locality: "", city: "", state: "", pincode: "" };

export default function CreateCredentialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ ...EMPTY, role: location.state?.roleName || "" });
  const [roles, setRoles] = useState([]);
  const [reportsToOptions, setReportsToOptions] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [createdRole, setCreatedRole] = useState(null);
  const [reportsToSummary, setReportsToSummary] = useState(null);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Roles carry assignedUserCount — avoid loading every user just for the dropdown.
    getAssignableRoles()
      .then((roleResult) => setRoles(roleResult.roles || []))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Unable to load dashboard roles"),
      );
  }, []);

  useEffect(() => {
    if (!form.role) {
      setReportsToOptions([]);
      setHierarchy(null);
      setForm((current) => ({ ...current, reportsToUserId: "" }));
      return;
    }
    let cancelled = false;
    getEligibleReportsTo({ targetRole: form.role })
      .then((response) => {
        if (cancelled) return;
        const data = response.data || response;
        setReportsToOptions(Array.isArray(data.users) ? data.users : []);
        setHierarchy(data);
        setForm((current) => {
          const stillValid = (data.users || []).some((user) => String(user._id) === String(current.reportsToUserId));
          return stillValid ? current : { ...current, reportsToUserId: "" };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setReportsToOptions([]);
        setHierarchy(null);
      });
    return () => { cancelled = true; };
  }, [form.role]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const hierarchyHint = formatHierarchyHint(hierarchy, form.role);
  const selectedReportsTo = reportsToOptions.find((user) => String(user._id) === String(form.reportsToUserId));
  const preferredReportsLabel = hierarchyHint?.preferredReportsToRole
    ? cleanRoleLabel(hierarchyHint.preferredReportsToRole)
    : "parent role";

  const reportsToFilterOptions = useMemo(
    () => [
      { value: "", label: "Select who this person works under (optional)" },
      ...reportsToOptions.map((user) => ({
        value: String(user._id),
        label: [
          user.name || "Unnamed",
          cleanRoleLabel(user.roleName),
          [user.city, user.state].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" · "),
      })),
    ],
    [reportsToOptions],
  );

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.role) return toast.error("Complete name, email and select a role");
    if (!form.state || !form.city || !form.locality || !/^\d{6}$/.test(form.pincode)) return toast.error("Select a work location and enter a valid 6-digit pincode");
    setBusy(true);
    try {
      await requestCredentialOtp(form.email);
      setStep(2);
      toast.success("Verification code sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(form.otp)) return toast.error("Enter the 4-digit verification code");
    setBusy(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, otp: form.otp };
      if (form.reportsToUserId) payload.reportsToUserId = form.reportsToUserId;
      const result = await verifyCredentialOtp(payload);
      setToken(result.token);
      setCreatedRole(result.role);
      setReportsToSummary(result.reportsTo || selectedReportsTo || null);
      setStep(3);
      requestSidebarRefresh();
      toast.success("Email verified");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setBusy(false);
    }
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not finish account setup");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1480px] pb-8 text-slate-900 sm:pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 sm:mb-4"
      >
        <ArrowLeft size={17} /> Back
      </button>
      <div className="grid overflow-hidden rounded-2xl border border-[#c8ebd6] bg-white shadow-[0_10px_28px_rgba(15,61,46,0.08)] lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative flex h-full min-h-0 flex-col border-b border-[#d9ebe0] bg-[#f6fbf8] p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#27AE60] text-white shadow-sm shadow-emerald-600/25">
              <KeyRound size={16} />
            </div>
            <h1 className="mt-3 text-lg font-bold tracking-tight text-[#0f3d2e] sm:text-xl">
              Create credentials
            </h1>
            <p className="mt-1.5 text-[11px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
              Create and verify a dashboard account, assign a role, then review permissions.
            </p>
            <div className="mt-4 space-y-1.5">
              {[
                [1, "Account & location", UserRound],
                [2, "Email verification", Mail],
                [3, "Review & activate", MapPin],
              ].map(([number, stepLabel, stepIcon]) => {
                const active = step === number;
                const complete = step > number || done;
                return (
                  <div
                    key={number}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                      active
                        ? "border-[#27AE60]/40 bg-white text-[#128C45] shadow-sm"
                        : complete
                          ? "border-[#c8ebd6] bg-white/80 text-[#0f3d2e]"
                          : "border-transparent text-slate-400"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-md ${
                        complete
                          ? "bg-[#27AE60] text-white"
                          : active
                            ? "bg-[#e8f8ee] text-[#27AE60]"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {complete ? (
                        <Check size={13} />
                      ) : (
                        createElement(stepIcon, { size: 13 })
                      )}
                    </span>
                    <span className="text-[11px] font-semibold sm:text-xs">{stepLabel}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto flex items-start gap-2 rounded-lg border border-[#c8ebd6] bg-white p-2.5 pt-3 text-[10px] leading-4 text-slate-600 lg:mt-6">
              <ShieldCheck className="mt-0.5 shrink-0 text-[#27AE60]" size={14} />
              <span>Pick an active role. Permissions open after email verification.</span>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col p-3 sm:p-4 lg:p-5">
          {done ? <Success name={form.name} role={createdRole?.label || "Custom access"} onCreateAnother={() => { setForm(EMPTY); setStep(1); setToken(""); setDone(false); }} onDone={() => navigate("/propenu-team-members")} /> : <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Step {step} of 3
                </p>
                <h2 className="mt-0.5 text-base font-bold sm:text-lg">
                  {step === 1
                    ? "Account, role and work location"
                    : step === 2
                      ? "Verify the work email"
                      : "Review and activate credential"}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {Math.round((step / 3) * 100)}% complete
              </span>
            </div>

            {step === 1 && (
              <form
                onSubmit={sendOtp}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3.5"
              >
                <Field label="Full name" icon={UserRound}>
                  <input value={form.name} onChange={update("name")} placeholder="e.g. Aarav Sharma" />
                </Field>
                <Field label="Work email" icon={Mail}>
                  <input type="email" value={form.email} onChange={update("email")} placeholder="aarav@propenu.com" />
                </Field>
                <Field label="State" icon={MapPin}>
                  <input value={form.state} onChange={update("state")} placeholder="e.g. Andhra Pradesh" />
                </Field>
                <Field label="City" icon={Building2}>
                  <input value={form.city} onChange={update("city")} placeholder="e.g. Pitapuram" />
                </Field>
                <Field label="Locality" icon={MapPin}>
                  <input value={form.locality} onChange={update("locality")} placeholder="Enter locality" />
                </Field>
                <Field label="Pincode" icon={MapPin}>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pincode: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="500081"
                  />
                </Field>
                <div className="sm:col-span-1 lg:col-span-1">
                  <RoleSelect
                    roles={roles}
                    value={form.role}
                    onChange={(role) =>
                      setForm((current) => ({ ...current, role, reportsToUserId: "" }))
                    }
                  />
                </div>
                {form.role && hierarchy && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-600">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Network size={14} className="text-emerald-600" /> Hierarchy for{" "}
                      {cleanRoleLabel(form.role)}
                    </div>
                    <p>
                      <span className="font-semibold text-slate-700">Above:</span>{" "}
                      {hierarchyHint?.aboveText || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Below:</span>{" "}
                      {hierarchyHint?.belowText || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Reports to:</span>{" "}
                      {hierarchyHint?.reportsToText || "—"}
                    </p>
                  </div>
                )}
                {form.role && (hierarchy?.reportsToRoles || []).length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <ActivityFilterSelect
                      showLabel
                      searchable
                      label="Reports to (person)"
                      value={form.reportsToUserId ? String(form.reportsToUserId) : ""}
                      onChange={(next) =>
                        setForm((current) => ({ ...current, reportsToUserId: next }))
                      }
                      options={reportsToFilterOptions}
                      icon={UsersRound}
                    />
                    {!reportsToOptions.length && (
                      <p className="mt-1.5 text-[11px] text-amber-700">
                        No {preferredReportsLabel} account found yet. Create that credential first,
                        then set reports-to.
                      </p>
                    )}
                  </div>
                )}
                {isTerritoryRole(form.role) && (
                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] leading-4 text-sky-950">
                    <strong>Territory tip.</strong> This location becomes their first working
                    territory; expand later from Team Directory.
                  </div>
                )}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Primary busy={busy}>
                    Send verification code <ArrowRight size={16} />
                  </Primary>
                </div>
              </form>
            )}

            {step === 2 && <form onSubmit={verifyOtp} className="space-y-3"><div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">A 4-digit code was sent to <strong className="text-slate-900">{form.email}</strong>.</div><Field label="Verification code" icon={KeyRound}><input inputMode="numeric" maxLength={4} value={form.otp} onChange={(e) => setForm((current) => ({ ...current, otp: e.target.value.replace(/\D/g, "") }))} className="text-center font-mono text-xl tracking-[0.4em]" placeholder="0000" /></Field><Primary busy={busy}>Verify & continue <ArrowRight size={16} /></Primary><button type="button" onClick={() => setStep(1)} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800">Change account information</button></form>}

            {step === 3 && <form onSubmit={complete} className="space-y-3"><div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2"><Review label="Name" value={form.name} /><Review label="Email" value={form.email} /><Review label="Role" value={createdRole?.label || "Created automatically"} /><Review label="Reports to" value={reportsToSummary?.name ? `${reportsToSummary.name}${reportsToSummary.roleName ? ` (${cleanRoleLabel(reportsToSummary.roleName)})` : ""}` : "Not assigned yet"} /><Review label="Work location" value={`${form.locality}, ${form.city}, ${form.state} - ${form.pincode}`} /></div><Primary busy={busy}>Create account & assign permissions <BadgeCheck size={16} /></Primary><button type="button" onClick={() => setStep(1)} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800">Edit account or location</button></form>}
          </>}
        </main>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="access-control-field block min-w-0">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-2.5 top-1/2 z-[1] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg bg-[#EAF8F0] text-[#12A150]">
          {createElement(icon, { size: 14, strokeWidth: 2.25 })}
        </span>
        {children}
      </span>
    </label>
  );
}

const ROLE_DISPLAY_LABELS = {
  ceo: "CEO",
  operations_head: "Operations Head",
  business_development_head: "Business Development Head",
  regional_manager: "Regional Manager",
  business_development_manager: "Business Development Manager",
  sales_manager: "Sales Manager",
  team_lead: "Customer Support Team Lead",
  team_leads: "Customer Support Team Lead",
  customer_support_team_lead: "Customer Support Team Lead",
  customer_support_team_leads: "Customer Support Team Lead",
  customer_care: "Customer Care Executive",
  customer_care_executive: "Customer Care Executive",
  customer_care_executives: "Customer Care Executive",
  relationship_manager: "Relationship Manager",
  sales_executive: "Sales Executive",
  sales_agent: "Sales Executive",
  marketing_head: "Marketing Head",
  digital_marketing: "Digital Marketing",
  social_media: "Social Media",
  content_team: "Content Team",
  creative_team: "Creative Team",
  performance_marketing: "Performance Marketing",
  accounts: "Accounts",
  legal_compliance: "Legal",
  legal: "Legal",
  hr_administration: "HR",
  hr: "HR",
  human_resources: "HR",
  technical_support_head: "Technical Support Head",
  technical_support_team: "Technical Support Team",
  customer_support_head: "Customer Support Head",
};

const roleDisplayLabel = (role) =>
  ROLE_DISPLAY_LABELS[canonicalTeamRole(role?.name)] ||
  ROLE_DISPLAY_LABELS[String(role?.name || "").toLowerCase()] ||
  role?.label ||
  cleanRoleLabel(role?.name);

function RoleSelect({ roles, value, onChange }) {
  const orderedRoles = useMemo(
    () =>
      orderRolesByHierarchy(roles).map((role) => ({
        ...role,
        userCount: getAssignedUserCountForRole(role, roles),
      })),
    [roles],
  );

  const selected =
    orderedRoles.find((role) => role.name === value) ||
    orderedRoles.find((role) => canonicalTeamRole(role.name) === canonicalTeamRole(value)) ||
    roles.find((role) => role.name === value);

  const selectedCount = selected ? getAssignedUserCountForRole(selected, roles) : 0;

  return (
    <div className="relative z-30">
      <HierarchyRoleFilterSelect
        label="Dashboard role"
        value={selected?.name || value || ""}
        onChange={onChange}
        roles={orderedRoles}
        getLabel={roleDisplayLabel}
        hideAllOption
        allLabel="Select an existing active role"
        emptyHint="Roles below you in the organisation"
        headerNote="Only child roles under your position are listed (e.g. Legal, HR, Sales, Support)."
        className={!orderedRoles.length ? "pointer-events-none opacity-70" : ""}
      />
      {!orderedRoles.length ? (
        <p className="mt-2 text-center text-sm text-slate-500">
          No child roles found under your hierarchy
        </p>
      ) : null}
      {selected ? (
        <div className="mt-3 rounded-xl border border-[#d9ebe0] bg-[#F6FBF8] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <UsersRound size={15} className="text-[#12A150]" /> People assigned to{" "}
              {roleDisplayLabel(selected)}
            </span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#0B7A3A]">
              {selectedCount}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {selectedCount
              ? `${selectedCount} user${selectedCount === 1 ? "" : "s"} currently hold this role.`
              : "No users are currently assigned to this role."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
function Primary({ busy, children }) { return <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50">{busy ? "Please wait..." : children}</button>; }
function Review({ label, value }) { return <div className="rounded-xl bg-white p-3"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-semibold text-slate-800">{value}</div></div>; }
function Success({ name, role, onCreateAnother, onDone }) { return <div className="py-12 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"><BadgeCheck size={40} /></div><h2 className="mt-6 text-3xl font-bold">Credential ready</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500"><strong>{name}</strong> can now continue with the <strong>{role}</strong> dashboard role.</p><div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"><button onClick={onCreateAnother} className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:bg-slate-50">Create another</button><button onClick={onDone} className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">View team</button></div></div>; }
