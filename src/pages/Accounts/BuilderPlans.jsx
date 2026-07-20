import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  BadgeIndianRupee, ChevronRight, CirclePlus,
  Banknote, Building2, CalendarDays, CreditCard, Download, Edit3, ExternalLink,
  Eye, FileText, Landmark, PackageOpen, Search, Smartphone, Sparkles, Trash2,
  UserPlus, WalletCards, X, Zap,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";

const EMPTY_FORM = {
  code: "", title: "", price: "", discount: "0", description: "",
  promotionType: "normal", durationDays: "30", isActive: true,
};

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(Number(value || 0));

const locationText = (item = {}) => [
  item.locality || item.location?.locality,
  item.city || item.location?.city,
  item.state || item.location?.state,
  item.pincode || item.location?.pincode,
].filter(Boolean).join(", ");
const locationValue = (item = {}, key) => String(item[key] || item.location?.[key] || "");
const matchesLocation = (item, filters) => ["state", "city", "locality", "pincode"]
  .every((key) => !filters[key] || locationValue(item, key) === filters[key]);
const locationOptions = (items, key) => [...new Set(items.map((item) => locationValue(item, key)).filter(Boolean))].sort();

function LocationFilterRow({ items, value, onChange, prefix }) {
  return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[
    ["state", `All ${prefix} states`], ["city", `All ${prefix} cities`],
    ["locality", `All ${prefix} localities`], ["pincode", `All ${prefix} pincodes`],
  ].map(([key, placeholder]) => <select key={key} value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] text-slate-600 outline-none focus:border-[#27AE60]"><option value="">{placeholder}</option>{locationOptions(items, key).map((option) => <option key={option} value={option}>{option}</option>)}</select>)}</div>;
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Plan title is required";
  if (!form.code.trim()) errors.code = "Plan code is required";
  else if (!/^[A-Z0-9_-]+$/.test(form.code)) errors.code = "Use uppercase letters, numbers, - or _";
  if (form.price === "" || Number(form.price) < 0) errors.price = "Enter a valid price";
  if (Number(form.discount) < 0) errors.discount = "Discount cannot be negative";
  if (Number(form.discount) > Number(form.price)) errors.discount = "Discount cannot exceed price";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.promotionType.trim()) errors.promotionType = "Promotion type is required";
  if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) < 1) errors.durationDays = "Duration must be at least 1 day";
  return errors;
}

function Field({ label, error, hint, children }) {
  return <label className="block">
    <span className="mb-1.5 block text-[12px] font-normal text-slate-700">{label}</span>
    {children}
    {error ? <span className="mt-1 block text-[11px] text-red-600">{error}</span> : hint ? <span className="mt-1 block text-[11px] text-slate-400">{hint}</span> : null}
  </label>;
}

function PlanModal({ plan, mode = "create", onClose, onEdit, onCreateInvoice, onCreateReady, onSaved }) {
  const readOnly = mode === "view";
  const [form, setForm] = useState(plan ? {
    ...plan, promotionType: String(plan.promotionType || "normal").toLowerCase(), price: String(plan.price), discount: String(plan.discount || 0),
    durationDays: String(plan.durationDays || 30),
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const finalPrice = Math.max(Number(form.price || 0) - Number(form.discount || 0), 0);

  const submit = async (event) => {
    event.preventDefault();
    if (readOnly) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      code: form.code.trim().toUpperCase(), title: form.title.trim(), price: Number(form.price),
      discount: Number(form.discount || 0), description: form.description.trim(),
      promotionType: form.promotionType.trim(), durationDays: Number(form.durationDays),
      isActive: Boolean(form.isActive),
    };
    setSaving(true);
    try {
      let savedPlan;
      if (plan?._id) savedPlan = await builderPlanService.update(plan._id, payload);
      else if (onCreateReady) {
        onCreateReady(payload);
        onClose();
        return;
      } else savedPlan = await builderPlanService.create(payload);
      toast.success(`Plan ${plan ? "updated" : "created"} successfully`);
      await onSaved?.(savedPlan?.plan || savedPlan);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save builder plan");
    } finally { setSaving(false); }
  };

  if (readOnly) {
    const promotionLabel = form.promotionType === "featured"
      ? "Top Selling"
      : `${form.promotionType.charAt(0).toUpperCase()}${form.promotionType.slice(1)}`;
    return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="flex h-dvh w-[min(100vw,560px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
        <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-normal uppercase tracking-[.18em] text-[#27AE60]">Subscription overview</p><h2 className="mt-1.5 text-xl font-medium tracking-tight text-slate-900">Builder plan details</h2><p className="mt-1 text-[11px] text-slate-500">Review this plan’s commercial configuration.</p></div><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"><X size={17}/></button></div>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-[#123a29] p-5 text-white shadow-lg shadow-emerald-950/10">
            <div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-[9px] font-normal uppercase tracking-wider text-emerald-100">{form.code}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-normal uppercase tracking-wide ${form.isActive ? "bg-[#27AE60] text-white" : "bg-white/10 text-slate-300"}`}>{form.isActive ? "● Live" : "● Inactive"}</span></div>
            <h3 className="mt-5 text-[22px] font-medium tracking-tight">{form.title}</h3><p className="mt-1 text-[11px] font-normal uppercase tracking-[.14em] text-emerald-300">{promotionLabel} promotion</p>
            <div className="mt-5 border-t border-white/10 pt-5"><p className="text-[9px] font-normal uppercase tracking-[.16em] text-emerald-100/60">Customer price</p><div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1"><span className="text-[30px] font-medium leading-none">{money(finalPrice)}</span><span className="pb-0.5 text-[10px] font-normal text-emerald-100/70">for {form.durationDays} days</span></div>{Number(form.discount)>0 && <p className="mt-2 text-[10px] text-emerald-100/70"><span className="line-through">{money(form.price)}</span><span className="ml-2 rounded-md bg-white/10 px-2 py-1 font-normal text-emerald-200">Save {money(form.discount)}</span></p>}</div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-normal uppercase tracking-[.14em] text-slate-400">Plan information</p>
            <dl className="mt-3 divide-y divide-slate-100">
              {[["Promotion type",promotionLabel],["Base price",money(form.price)],["Discount",money(form.discount)],["Billing duration",`${form.durationDays} days`],["Availability",form.isActive ? "Available for purchase" : "Not available"]].map(([label,value]) => <div key={label} className="flex items-center justify-between gap-4 py-3"><dt className="text-[11px] font-normal text-slate-500">{label}</dt><dd className="text-right text-[11px] font-normal text-slate-800">{value}</dd></div>)}
            </dl>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-[10px] font-normal uppercase tracking-[.14em] text-slate-400">Description</p><p className="mt-3 whitespace-pre-wrap text-[12px] font-normal leading-6 text-slate-600">{form.description || "No description provided."}</p></div>
        </div>
        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-6"><div className="grid grid-cols-3 gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Close</button><button type="button" onClick={onEdit} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-3 text-xs font-bold text-[#27AE60]"><Edit3 size={14}/>Edit</button><button type="button" onClick={onCreateInvoice} className="rounded-xl bg-[#27AE60] px-3 py-3 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-[#219653]">Create invoice</button></div></footer>
      </section>
    </div>;
  }

  return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <form onSubmit={submit} className="flex h-dvh w-[min(100vw,620px)] flex-col overflow-hidden bg-white shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
        <div><p className="text-[11px] font-normal uppercase tracking-[.16em] text-[#27AE60]">{readOnly ? "Subscription overview" : "Plan configuration"}</p><h2 className="mt-1 text-xl font-medium text-slate-900">{readOnly ? "View builder plan" : plan ? "Edit builder plan" : "Create builder plan"}</h2><p className="mt-1 text-xs text-slate-500">{readOnly ? "Review pricing, promotion and availability." : "Set pricing, promotion and availability."}</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18}/></button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Plan title *" error={errors.title}><input disabled={readOnly} className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Growth Builder"/></Field>
          <Field label="Plan code *" error={errors.code} hint="Unique and used by integrations"><input disabled={readOnly} className={inputClass} value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s+/g, "_"))} placeholder="BUILDER_GROWTH"/></Field>
          <Field label="Base price (₹) *" error={errors.price}><input disabled={readOnly} className={inputClass} type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="14999"/></Field>
          <Field label="Flat discount (₹)" error={errors.discount}><input disabled={readOnly} className={inputClass} type="number" min="0" value={form.discount} onChange={(e) => set("discount", e.target.value)} /></Field>
          <Field label="Promotion type *" error={errors.promotionType}><select disabled={readOnly} className={inputClass} value={form.promotionType} onChange={(e) => set("promotionType", e.target.value)}><option value="normal">Normal</option><option value="prime">Prime</option><option value="sponsored">Sponsored</option><option value="featured">Top Selling</option></select></Field>
          <Field label="Duration (days) *" error={errors.durationDays}><input disabled={readOnly} className={inputClass} type="number" min="1" step="1" value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)}/></Field>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <div><p className="text-xs font-normal text-slate-800">Final customer price</p><p className="text-[11px] text-slate-500">Automatically calculated by the server</p></div>
          <p className="text-lg font-medium text-[#27AE60]">{money(finalPrice)}</p>
        </div>
        <Field label="Description *" error={errors.description}><textarea disabled={readOnly} rows="4" className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Explain who this plan is for and its primary value."/></Field>
        <label className={`flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 ${readOnly ? "cursor-default" : "cursor-pointer"}`}><div><p className="text-xs font-normal text-slate-800">Available for purchase</p><p className="text-[11px] text-slate-500">Inactive plans remain saved but cannot be offered.</p></div><input disabled={readOnly} type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-[#27AE60]"/></label>
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">{readOnly ? "Close" : "Cancel"}</button>{!readOnly && <button disabled={saving} className="rounded-xl bg-[#27AE60] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-200 hover:bg-[#219653] disabled:opacity-60">{saving ? "Saving…" : plan ? "Save changes" : "Create plan"}</button>}</div>
    </form>
  </div>;
}

function AssignPlanDrawer({ plan, onClose, onAssigned }) {
  const [builders, setBuilders] = useState([]);
  const [builderQuery, setBuilderQuery] = useState("");
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loadingBuilders, setLoadingBuilders] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    builderPlanService.builders().then(setBuilders).catch(() => toast.error("Unable to load builders")).finally(() => setLoadingBuilders(false));
  }, []);

  const chooseBuilder = async (builder) => {
    setSelectedBuilder(builder); setSelectedProjects([]); setLoadingProjects(true);
    try { setProjects(await builderPlanService.builderProjects(builder._id)); }
    catch { setProjects([]); toast.error("Unable to load this builder’s projects"); }
    finally { setLoadingProjects(false); }
  };
  const visibleBuilders = builders.filter((builder) => `${builder.name || ""} ${builder.companyName || ""} ${builder.email || ""} ${builder.phone || ""} ${builder.userCode || ""}`.toLowerCase().includes(builderQuery.toLowerCase()));
  const toggleProject = (id) => setSelectedProjects((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const assign = async () => {
    if (!selectedBuilder) return toast.error("Select a builder");
    if (!selectedProjects.length) return toast.error("Select at least one project");
    setSaving(true);
    try { const result = await builderPlanService.assign(plan, selectedBuilder._id, selectedProjects); toast.success(`Subscription assigned to ${result.created} project${result.created === 1 ? "" : "s"}`); await onAssigned(); onClose(); }
    catch (error) { const summary = error.assignmentSummary; toast.error(summary?.created ? `${summary.created} assigned, ${summary.failed} failed. ${error.response?.data?.message || "Check duplicate assignments."}` : error.response?.data?.message || "Unable to assign subscription"); if (summary?.created) await onAssigned(); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="flex h-dvh w-[min(100vw,640px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#27AE60]">Assign subscription</p><h2 className="mt-1 text-xl font-medium text-slate-900">Choose builder and projects</h2><p className="mt-1 text-[11px] text-slate-500">Assign <span className="font-medium text-slate-700">{plan.title}</span> to projects owned by one builder.</p></div><button onClick={onClose} className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-slate-50"><X size={17}/></button></div></header>
      <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-emerald-700">Selected plan</p><p className="mt-1 text-[14px] font-medium text-slate-900">{plan.title}</p><p className="mt-1 text-[10px] text-slate-500">{plan.promotionType === "featured" ? "Top Selling" : plan.promotionType} · {plan.durationDays} days</p></div><p className="text-lg font-medium text-[#27AE60]">{money(plan.finalPrice)}</p></div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[12px] font-medium text-slate-800">1. Find a builder</p><p className="text-[10px] text-slate-400">Search by name, company, email, phone or user code.</p></div>{selectedBuilder && <button onClick={() => {setSelectedBuilder(null);setProjects([]);setSelectedProjects([]);}} className="text-[10px] text-[#27AE60]">Change</button>}</div>
          {selectedBuilder ? <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-[#27AE60]"><Building2 size={18}/></span><div className="min-w-0"><p className="truncate text-[12px] font-medium text-slate-800">{selectedBuilder.companyName || selectedBuilder.name}</p><p className="truncate text-[10px] text-slate-500">{selectedBuilder.name} · {selectedBuilder.email || selectedBuilder.phone}</p></div></div> : <><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input value={builderQuery} onChange={(e) => setBuilderQuery(e.target.value)} placeholder="Search builders…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-[11px] outline-none focus:border-[#27AE60]"/></div><div className="mt-2 max-h-52 space-y-1 overflow-y-auto">{loadingBuilders ? <p className="py-5 text-center text-[11px] text-slate-400">Loading builders…</p> : visibleBuilders.length ? visibleBuilders.map((builder) => <button key={builder._id} onClick={() => chooseBuilder(builder)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-emerald-50"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Building2 size={15}/></span><span className="min-w-0"><span className="block truncate text-[11px] font-medium text-slate-700">{builder.companyName || builder.name}</span><span className="block truncate text-[9px] text-slate-400">{builder.name} · {builder.email || builder.phone || builder.userCode}</span></span></button>) : <p className="py-5 text-center text-[11px] text-slate-400">No builders found</p>}</div></>}
        </div>
        <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${!selectedBuilder ? "opacity-50" : ""}`}><div className="mb-3 flex items-center justify-between"><div><p className="text-[12px] font-medium text-slate-800">2. Select projects</p><p className="text-[10px] text-slate-400">Only projects owned by the selected builder are shown.</p></div>{projects.length>0 && <button onClick={() => setSelectedProjects(selectedProjects.length === projects.length ? [] : projects.map((p) => p._id))} className="text-[10px] text-[#27AE60]">{selectedProjects.length === projects.length ? "Clear all" : "Select all"}</button>}</div>
          {!selectedBuilder ? <p className="rounded-xl bg-slate-50 py-8 text-center text-[11px] text-slate-400">Select a builder first</p> : loadingProjects ? <p className="py-8 text-center text-[11px] text-slate-400">Loading projects…</p> : projects.length ? <div className="space-y-2">{projects.map((project) => <label key={project._id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selectedProjects.includes(project._id) ? "border-emerald-200 bg-emerald-50/60" : "border-slate-100 hover:border-slate-200"}`}><input type="checkbox" checked={selectedProjects.includes(project._id)} onChange={() => toggleProject(project._id)} className="h-4 w-4 accent-[#27AE60]"/><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium text-slate-700">{project.title}</span><span className="block truncate text-[9px] text-slate-400">{project.propertyCode || "No code"} · {[project.locality,project.city].filter(Boolean).join(", ") || "Location unavailable"}</span></span><span className="text-[9px] capitalize text-slate-400">{project.promotion?.type || "normal"}</span></label>)}</div> : <p className="rounded-xl bg-slate-50 py-8 text-center text-[11px] text-slate-400">This builder has no active projects</p>}
        </div>
      </div>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4"><div className="mb-3 flex items-center justify-between text-[10px] text-slate-500"><span>{selectedProjects.length} project{selectedProjects.length === 1 ? "" : "s"} selected</span><span>Ends after {plan.durationDays} days</span></div><div className="flex gap-2"><button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-xs text-slate-600">Cancel</button><button disabled={!selectedBuilder || !selectedProjects.length || saving} onClick={assign} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#27AE60] py-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"><UserPlus size={14}/>{saving ? "Assigning…" : "Assign subscription"}</button></div></footer>
    </section>
  </div>;
}

function CreateInvoiceDrawer({ initialPlan, plans, onClose, onCreatePlan }) {
  const [planId, setPlanId] = useState(initialPlan?._id || "");
  const [builders, setBuilders] = useState([]);
  const [builderId, setBuilderId] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [gstRate, setGstRate] = useState("0");
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [builderSearch, setBuilderSearch] = useState("");
  const [builderLocation, setBuilderLocation] = useState({ state: "", city: "", locality: "", pincode: "" });
  const [projectSearch, setProjectSearch] = useState("");
  const [projectLocation, setProjectLocation] = useState({ state: "", city: "", locality: "", pincode: "" });
  const availablePlans = plans.filter((item) => item.isActive);
  const plan = plans.find((item) => item._id === planId) || initialPlan || null;
  const selectedBuilder = builders.find((item) => item._id === builderId);
  const selectedBuilderName = selectedBuilder?.companyName || selectedBuilder?.name || "Builder";
  const amount = Number(plan?.finalPrice ?? Math.max(Number(plan?.price || 0) - Number(plan?.discount || 0), 0));
  const gstAmount = Number((amount * Number(gstRate || 0) / 100).toFixed(2));
  const invoiceTotal = Number((amount + gstAmount).toFixed(2));
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[12px] text-slate-700 outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";
  const paymentIcons = {
    cash: Banknote, cheque: WalletCards, upi: Smartphone,
    card: CreditCard, netbanking: Landmark, razorpay: BadgeIndianRupee,
  };
  const PaymentIcon = paymentIcons[paymentMethod] || Banknote;
  const visibleBuilders = builders.filter((builder) => {
    const text = [builder.name, builder.companyName, builder.email, builder.phone, builder.userCode, locationText(builder)].filter(Boolean).join(" ").toLowerCase();
    return text.includes(builderSearch.toLowerCase()) && matchesLocation(builder, builderLocation);
  });
  const visibleProjects = projects.filter((project) => {
    const text = [project.title, project.propertyCode, locationText(project)].filter(Boolean).join(" ").toLowerCase();
    return text.includes(projectSearch.toLowerCase()) && matchesLocation(project, projectLocation);
  });

  useEffect(() => {
    builderPlanService.builders().then(setBuilders).catch(() => toast.error("Unable to load builders")).finally(() => setLoading(false));
  }, []);

  const selectBuilder = async (id) => {
    setBuilderId(id); setProjectId(""); setProjects([]); setProjectSearch(""); setProjectLocation({ state: "", city: "", locality: "", pincode: "" });
    if (!id) return;
    setLoadingProjects(true);
    try { setProjects(await builderPlanService.builderProjects(id)); }
    catch { toast.error("Unable to load this builder's projects"); }
    finally { setLoadingProjects(false); }
  };

  const submit = async () => {
    if (!plan?._id) return toast.error("Select a plan");
    if (!builderId || !projectId) return toast.error("Select a builder and project");
    if (Number(gstRate) < 0 || Number(gstRate) > 100) return toast.error("GST must be between 0 and 100 percent");
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(plan.durationDays || 30));
    setSaving(true);
    try {
      await builderPlanService.createInvoice({
        invoiceNumber: `BLD-INV-${Date.now()}`,
        invoiceDate: startDate.toISOString(), userId: builderId, propertyId: projectId,
        servicePlanId: plan._id, timePeriod: `${plan.durationDays || 30} days`,
        startDate: startDate.toISOString(), endDate: endDate.toISOString(),
        subtotalAmount: Number(plan.price || amount), totalAmount: invoiceTotal,
        discountType: "flat", discountValue: Number(plan.discount || 0),
        discountAmount: Number(plan.discount || 0), gstRate: Number(gstRate || 0),
        gstAmount, paidAmount: invoiceTotal, paymentMethod, paymentStatus,
      });
      toast.success("Builder invoice created successfully"); onClose();
    } catch (error) { toast.error(error.response?.data?.message || "Unable to create builder invoice"); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="flex h-dvh w-[min(100vw,620px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
      <header className="border-b border-slate-100 bg-white px-6 py-5"><div className="flex justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#27AE60]">Create invoice</p><h2 className="mt-1 text-xl font-medium text-slate-900">Assign plan to builder project</h2><p className="mt-1 text-[11px] text-slate-500">Select the builder first, then one of that builder's projects.</p></div><button type="button" onClick={onClose} className="h-fit rounded-xl border border-slate-200 p-2.5 text-slate-400"><X size={17}/></button></div></header>
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-[12px] text-slate-700">1. Subscription plan *</p>{availablePlans.length > 0 && <button type="button" onClick={onCreatePlan} className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-medium text-[#219653] hover:bg-emerald-100"><CirclePlus size={13}/>Create custom plan</button>}</div>{availablePlans.length ? <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={inputClass}><option value="">Select plan</option>{availablePlans.map((item) => <option key={item._id} value={item._id}>{item.title} ({item.code})</option>)}</select> : <div className="rounded-xl bg-amber-50 p-4 text-center"><p className="text-[11px] text-amber-800">No active subscription plan is available.</p><button type="button" onClick={onCreatePlan} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-[11px] font-medium text-white"><CirclePlus size={13}/>Create plan first</button></div>}</div>
        {plan && <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-[10px] uppercase tracking-wider text-emerald-700">Plan values · read only</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Amount", money(amount)],["Duration", `${plan.durationDays} days`],["Promotion", plan.promotionType],["Discount", money(plan.discount)]].map(([label,value]) => <div key={label}><p className="text-[9px] uppercase text-slate-400">{label}</p><p className="mt-1 text-[12px] font-medium capitalize text-slate-800">{value}</p></div>)}</div></div>}
        <div><p className="mb-2 text-[12px] text-slate-700">2. Builder *</p><div className="mb-2"><input value={builderSearch} onChange={(e) => setBuilderSearch(e.target.value)} placeholder="Search builder name, company, email, phone or code" className={inputClass}/></div><div className="mb-2"><LocationFilterRow items={builders} value={builderLocation} onChange={setBuilderLocation} prefix="builder"/></div><select disabled={loading} value={builderId} onChange={(e) => selectBuilder(e.target.value)} className={inputClass}><option value="">{loading ? "Loading builders…" : `Select builder (${visibleBuilders.length} found)`}</option>{visibleBuilders.map((builder) => <option key={builder._id} value={builder._id}>{builder.name || "Builder"} — {builder.companyName || "No company"} {locationText(builder) ? `— ${locationText(builder)}` : ""}</option>)}</select></div>
        <div><p className="mb-2 text-[12px] text-slate-700">3. Project *</p>{builderId && <><div className="mb-2"><input value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder="Search project name, code or location" className={inputClass}/></div><div className="mb-2"><LocationFilterRow items={projects} value={projectLocation} onChange={setProjectLocation} prefix="project"/></div></>}<select disabled={!builderId || loadingProjects} value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}><option value="">{loadingProjects ? "Loading projects…" : builderId ? `Select project (${visibleProjects.length} found)` : "Select a builder first"}</option>{visibleProjects.map((project) => <option key={project._id} value={project._id}>{project.title} {project.propertyCode ? `(${project.propertyCode})` : ""} — {selectedBuilderName} {locationText(project) ? `— ${locationText(project)}` : ""}</option>)}</select><p className="mt-1 text-[10px] text-slate-400">Only projects belonging to the selected builder and matching location filters are listed.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[12px] font-medium text-slate-800">4. Payment details</p><p className="mt-1 text-[10px] text-slate-400">Enter GST manually. GST amount and final paid amount are calculated automatically.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Method"><div className="relative"><PaymentIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#27AE60]"/><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`${inputClass} pl-11`}><option value="cash">💵 Cash</option><option value="cheque">🧾 Cheque</option><option value="upi">📱 UPI</option><option value="card">💳 Card</option><option value="netbanking">🏦 Net banking</option><option value="razorpay">₹ Razorpay</option></select></div></Field><Field label="Status"><select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={inputClass}><option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="failed">Failed</option></select></Field><Field label="GST (%)"><input type="number" min="0" max="100" step="0.01" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className={inputClass} placeholder="18"/></Field><Field label="Paid amount"><div className={`${inputClass} cursor-not-allowed bg-slate-50 font-medium text-slate-800`} aria-readonly="true">{plan ? money(invoiceTotal) : "Select a plan"}</div></Field></div>{plan && <div className="mt-3 flex flex-wrap justify-end gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-[10px] text-slate-500"><span>Plan amount: <b className="text-slate-700">{money(amount)}</b></span><span>GST: <b className="text-slate-700">{money(gstAmount)}</b></span><span>Total: <b className="text-[#219653]">{money(invoiceTotal)}</b></span></div>}</div>
      </div>
      <footer className="border-t border-slate-200 bg-white px-6 py-4"><div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-xs text-slate-600">Cancel</button><button type="button" disabled={!planId || !builderId || !projectId || saving} onClick={submit} className="flex-1 rounded-xl bg-[#27AE60] py-3 text-xs font-medium text-white disabled:opacity-40">{saving ? "Creating…" : "Create invoice"}</button></div></footer>
    </section>
  </div>;
}

function InvoiceListDrawer({ onClose }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const loadInvoices = async () => {
    setLoading(true); setError("");
    try {
      const data = await builderPlanService.invoices();
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load builder invoices");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadInvoices(); }, []);

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const builder = invoice.builderDetails || invoice.userId || {};
    const project = invoice.propertyId || {};
    const plan = invoice.servicePlanId || {};
    const haystack = [invoice.invoiceNumber, builder.name, builder.companyName, builder.email,
      builder.phone, project.title, invoice.propertyTitle, plan.title, invoice.servicePlanName,
      invoice.serviceType].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) &&
      (status === "all" || invoice.paymentStatus === status);
  }), [invoices, query, status]);

  const statusClass = (value) => ({
    paid: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700",
    partial: "bg-blue-50 text-blue-700", failed: "bg-red-50 text-red-700",
  }[value] || "bg-slate-100 text-slate-600");

  const createInvoicePdf = async (invoice) => {
    return builderPlanService.invoicePdf(invoice._id);
    /* The PDF is generated by generateBuilderPlanInvoicePdf.ts on the server.
       The legacy browser layout below is intentionally unreachable and will be
       removed after all deployed payment-service instances expose /:id/pdf. */
    // eslint-disable-next-line no-unreachable
    const builder = invoice.builderDetails || invoice.userId || {};
    const project = invoice.propertyId || {};
    const plan = invoice.servicePlanId || {};
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const green = rgb(0.09, 0.55, 0.31);
    page.drawRectangle({ x: 0, y: 740, width: 595, height: 102, color: rgb(0.07, 0.23, 0.16) });
    page.drawText("PROPENU", { x: 44, y: 796, size: 20, font: bold, color: rgb(1, 1, 1) });
    page.drawText("BUILDER INVOICE", { x: 44, y: 770, size: 11, font: regular, color: rgb(0.68, 0.9, 0.77) });
    page.drawText(invoice.invoiceNumber || "Invoice", { x: 390, y: 786, size: 13, font: bold, color: rgb(1, 1, 1) });
    page.drawText(invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN") : "", { x: 390, y: 766, size: 9, font: regular, color: rgb(0.85, 0.9, 0.87) });
    const rows = [
      ["Builder", builder.companyName || builder.name || "—"],
      ["Contact", builder.email || builder.phone || builder.userCode || "—"],
      ["Project", invoice.propertyTitle || project.title || "—"],
      ["Plan", invoice.servicePlanName || plan.title || "—"],
      ["Promotion", invoice.serviceType || plan.promotionType || "—"],
      ["Duration", invoice.timePeriod || "—"],
      ["Payment method", invoice.paymentMethod || "—"],
      ["Payment status", invoice.paymentStatus || "—"],
    ];
    let y = 690;
    rows.forEach(([label, value]) => {
      page.drawText(label.toUpperCase(), { x: 44, y, size: 8, font: bold, color: rgb(0.45, 0.5, 0.55) });
      page.drawText(String(value).slice(0, 65), { x: 180, y, size: 10, font: regular, color: rgb(0.12, 0.16, 0.2) });
      page.drawLine({ start: { x: 44, y: y - 13 }, end: { x: 551, y: y - 13 }, thickness: 0.5, color: rgb(0.88, 0.9, 0.91) });
      y -= 43;
    });
    page.drawRectangle({ x: 330, y: 245, width: 221, height: 110, color: rgb(0.95, 0.98, 0.96) });
    page.drawText("TOTAL AMOUNT", { x: 350, y: 321, size: 9, font: bold, color: rgb(0.4, 0.48, 0.43) });
    page.drawText(`INR ${Number(invoice.totalAmount || 0).toLocaleString("en-IN")}`, { x: 350, y: 290, size: 21, font: bold, color: green });
    page.drawText(`Paid: INR ${Number(invoice.paidAmount || 0).toLocaleString("en-IN")}`, { x: 350, y: 266, size: 10, font: regular, color: rgb(0.25, 0.32, 0.28) });
    page.drawText("Thank you for choosing Propenu.", { x: 44, y: 80, size: 10, font: regular, color: rgb(0.45, 0.5, 0.55) });
    return new Blob([await pdf.save()], { type: "application/pdf" });
  };

  const openPdf = async (invoice) => {
    const previewWindow = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await createInvoicePdf(invoice));
      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, "_blank");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      previewWindow?.close(); toast.error("Unable to open invoice PDF");
    }
  };

  const downloadPdf = async (invoice) => {
    try {
      const url = URL.createObjectURL(await createInvoicePdf(invoice));
      const link = document.createElement("a");
      link.href = url; link.download = `${invoice.invoiceNumber || "builder-invoice"}.pdf`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch { toast.error("Unable to download invoice PDF"); }
  };

  return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="flex h-dvh w-[min(100vw,820px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
      <header className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#27AE60]">Builder billing</p><h2 className="mt-1 text-xl font-medium text-slate-900">Builder invoices</h2><p className="mt-1 text-[11px] text-slate-500">Search and review all invoices created for builder projects.</p></div><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-slate-50"><X size={17}/></button></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice, builder, project or plan" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-[11px] outline-none focus:border-[#27AE60]"/></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[11px] text-slate-600 outline-none focus:border-[#27AE60]"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option><option value="failed">Failed</option></select></div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? <div className="grid min-h-64 place-items-center"><div className="text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-[#27AE60]"/><p className="mt-3 text-xs text-slate-400">Loading invoices…</p></div></div>
        : error ? <div className="grid min-h-64 place-items-center text-center"><div><p className="text-sm font-medium text-red-600">{error}</p><button type="button" onClick={loadInvoices} className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-xs text-[#219653]">Try again</button></div></div>
        : filteredInvoices.length === 0 ? <div className="grid min-h-64 place-items-center text-center"><div><FileText className="mx-auto text-slate-300" size={32}/><p className="mt-3 text-sm font-medium text-slate-700">No invoices found</p><p className="mt-1 text-xs text-slate-400">Create an invoice or change your filters.</p></div></div>
        : <div className="space-y-3">{filteredInvoices.map((invoice) => {
          const builder = invoice.builderDetails || invoice.userId || {};
          const project = invoice.propertyId || {};
          const plan = invoice.servicePlanId || {};
          return <article key={invoice._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] font-medium text-slate-800">{invoice.invoiceNumber}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-medium uppercase ${statusClass(invoice.paymentStatus)}`}>{invoice.paymentStatus}</span></div><p className="mt-2 text-[14px] font-medium text-slate-900">{builder.companyName || builder.name || "Builder"}</p><p className="mt-0.5 text-[10px] text-slate-400">{builder.email || builder.phone || builder.userCode || "No contact details"}</p></div><div className="sm:text-right"><p className="text-xl font-medium text-[#219653]">{money(invoice.totalAmount)}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 sm:justify-end"><CalendarDays size={11}/>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN") : "No date"}</p></div></div>
            <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-3"><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Project</p><p className="mt-1 truncate text-[11px] font-medium text-slate-700">{invoice.propertyTitle || project.title || "—"}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Plan</p><p className="mt-1 truncate text-[11px] font-medium text-slate-700">{invoice.servicePlanName || plan.title || "—"}</p></div><div><p className="text-[9px] uppercase tracking-wide text-slate-400">Payment</p><p className="mt-1 text-[11px] font-medium capitalize text-slate-700">{invoice.paymentMethod || "—"} · Paid {money(invoice.paidAmount)}</p></div></div>
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => openPdf(invoice)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-medium text-slate-600 hover:border-emerald-200 hover:text-[#219653]"><ExternalLink size={13}/>Open PDF</button><button type="button" onClick={() => downloadPdf(invoice)} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-medium text-[#219653] hover:bg-emerald-100"><Download size={13}/>Download</button></div>
          </article>;
        })}</div>}
      </div>
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-[10px] text-slate-500">Showing {filteredInvoices.length} of {invoices.length} invoices</footer>
    </section>
  </div>;
}

function InvoiceTablePage({ onBack }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [builderFilter, setBuilderFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState({ state: "", city: "", locality: "", pincode: "" });

  useEffect(() => {
    builderPlanService.invoices().then((data) => setInvoices(Array.isArray(data.invoices) ? data.invoices : []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load builder invoices"))
      .finally(() => setLoading(false));
  }, []);

  const details = (invoice) => ({
    builder: invoice.builderDetails || invoice.userId || {},
    project: invoice.propertyId || {}, plan: invoice.servicePlanId || {},
  });
  const uniqueOptions = (getter) => [...new Set(invoices.map(getter).filter(Boolean))].sort();
  const builders = uniqueOptions((invoice) => { const b = details(invoice).builder; return b.companyName || b.name; });
  const projects = uniqueOptions((invoice) => invoice.propertyTitle || details(invoice).project.title);
  const plansList = uniqueOptions((invoice) => invoice.servicePlanName || details(invoice).plan.title);
  const invoiceLocationItems = invoices.flatMap((invoice) => [details(invoice).builder, details(invoice).project]);
  const filtered = invoices.filter((invoice) => {
    const { builder, project, plan } = details(invoice);
    const builderName = builder.companyName || builder.name || "";
    const projectName = invoice.propertyTitle || project.title || "";
    const planName = invoice.servicePlanName || plan.title || "";
    const text = [invoice.invoiceNumber, builder.name, builder.companyName, builder.email, builder.phone,
      builder.userCode, projectName, invoice.projectCode || project.propertyCode, planName, location].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "all" || invoice.paymentStatus === status) &&
      (builderFilter === "all" || builderName === builderFilter) && (projectFilter === "all" || projectName === projectFilter) &&
      (planFilter === "all" || planName === planFilter) &&
      (matchesLocation(builder, locationFilter) || matchesLocation(project, locationFilter));
  });

  const openPdf = async (invoice, download = false) => {
    const popup = download ? null : window.open("", "_blank");
    try {
      const blob = await builderPlanService.invoicePdf(invoice._id, download);
      const url = URL.createObjectURL(blob);
      if (download) { const link = document.createElement("a"); link.href = url; link.download = `${invoice.invoiceNumber}.pdf`; document.body.appendChild(link); link.click(); link.remove(); }
      else if (popup) popup.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { popup?.close(); toast.error("Unable to load invoice PDF"); }
  };

  const statusClass = (value) => ({ paid: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", partial: "bg-blue-50 text-blue-700", failed: "bg-red-50 text-red-700" }[value] || "bg-slate-100 text-slate-600");

  return <div className="min-h-full bg-[#f6f8f7] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1600px]">
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><button type="button" onClick={onBack} className="mb-3 flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#219653]"><ChevronRight size={13} className="rotate-180"/>Back to builder plans</button><h1 className="text-2xl font-medium text-slate-900">Builder invoices</h1><p className="mt-1 text-[12px] text-slate-500">All builder billing records in table format.</p></div><p className="text-[11px] text-slate-500">Showing {filtered.length} of {invoices.length}</p></div>
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5"><div className="relative xl:col-span-2"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice, builder, phone, project…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-[11px] outline-none focus:border-[#27AE60]"/></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px]"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="partial">Partial</option><option value="failed">Failed</option></select><select value={builderFilter} onChange={(e) => setBuilderFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px]"><option value="all">All builders</option>{builders.map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={() => { setQuery(""); setStatus("all"); setBuilderFilter("all"); setProjectFilter("all"); setPlanFilter("all"); setLocationFilter({ state: "", city: "", locality: "", pincode: "" }); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] text-slate-500 hover:bg-slate-50">Clear filters</button></div><div className="mt-2 grid gap-2 md:grid-cols-2"><select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px]"><option value="all">All projects</option>{projects.map((item) => <option key={item}>{item}</option>)}</select><select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px]"><option value="all">All plans</option>{plansList.map((item) => <option key={item}>{item}</option>)}</select></div><div className="mt-2"><LocationFilterRow items={invoiceLocationItems} value={locationFilter} onChange={setLocationFilter} prefix="invoice"/></div></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="py-20 text-center text-xs text-slate-400">Loading invoices…</p> : error ? <p className="py-20 text-center text-xs text-red-500">{error}</p> : <div className="overflow-x-auto"><table className="min-w-[1450px] w-full text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400"><tr>{["Invoice / Date","Builder / Bill To","Contact","Location","Project / Code","Plan / Period","Subtotal","Discount","GST","Total / Paid","Payment","Actions"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((invoice) => { const { builder, project, plan } = details(invoice); return <tr key={invoice._id} className="align-top hover:bg-slate-50/60"><td className="px-4 py-4"><p className="font-mono text-[10px] font-medium text-slate-800">{invoice.invoiceNumber}</p><p className="mt-1 text-[9px] text-slate-400">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN") : "—"}</p></td><td className="px-4 py-4"><p className="text-[11px] font-medium text-slate-800">{builder.name || "—"}</p><p className="mt-1 text-[9px] text-slate-400">{builder.companyName || "No company"}</p></td><td className="px-4 py-4"><p className="text-[10px] text-slate-700">{builder.phone || "—"}</p><p className="mt-1 text-[9px] text-slate-400">{builder.email || "—"}</p></td><td className="max-w-48 px-4 py-4 text-[10px] leading-4 text-slate-600">{locationText(builder) || locationText(project) || "—"}</td><td className="px-4 py-4"><p className="text-[10px] font-medium text-slate-700">{invoice.propertyTitle || project.title || "—"}</p><p className="mt-1 font-mono text-[9px] text-slate-400">{invoice.projectCode || project.propertyCode || "—"}</p></td><td className="px-4 py-4"><p className="text-[10px] font-medium text-slate-700">{invoice.servicePlanName || plan.title || "—"}</p><p className="mt-1 text-[9px] text-slate-400">{invoice.timePeriod || "—"}</p></td><td className="px-4 py-4 text-[10px] text-slate-700">{money(invoice.subtotalAmount)}</td><td className="px-4 py-4 text-[10px] text-slate-700">{money(invoice.discountAmount)}</td><td className="px-4 py-4"><p className="text-[10px] text-slate-700">{money(invoice.gstAmount)}</p><p className="text-[9px] text-slate-400">{invoice.gstRate || 0}%</p></td><td className="px-4 py-4"><p className="text-[11px] font-medium text-[#219653]">{money(invoice.totalAmount)}</p><p className="mt-1 text-[9px] text-slate-400">Paid {money(invoice.paidAmount)}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[8px] font-medium uppercase ${statusClass(invoice.paymentStatus)}`}>{invoice.paymentStatus}</span><p className="mt-2 text-[9px] capitalize text-slate-500">{invoice.paymentMethod}</p></td><td className="px-4 py-4"><div className="flex gap-1"><button type="button" onClick={() => openPdf(invoice)} title="Open PDF" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#219653]"><ExternalLink size={13}/></button><button type="button" onClick={() => openPdf(invoice, true)} title="Download PDF" className="rounded-lg bg-emerald-50 p-2 text-[#219653]"><Download size={13}/></button></div></td></tr>; })}</tbody></table>{filtered.length === 0 && <p className="py-16 text-center text-xs text-slate-400">No invoices match these filters.</p>}</div>}</div>
  </div></div>;
}

export default function BuilderPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [assigningPlan, setAssigningPlan] = useState(null);
  const [invoicingPlan, setInvoicingPlan] = useState(null);
  const [resumeInvoiceAfterPlan, setResumeInvoiceAfterPlan] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true); setError("");
    try { const data = await builderPlanService.list(); setPlans(Array.isArray(data.plans) ? data.plans : []); }
    catch (e) { setError(e.response?.data?.message || "Could not load builder plans."); }
    finally { setLoading(false); }
  };
  // The catalogue is remote state; load it once when this route is mounted.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => plans.filter((plan) => {
    const matchesQuery = `${plan.title} ${plan.code} ${plan.promotionType}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || String(plan.isActive) === status);
  }), [plans, query, status]);
  const active = plans.filter((plan) => plan.isActive).length;
  const avgPrice = active ? plans.filter((p) => p.isActive).reduce((sum, p) => sum + Number(p.finalPrice || 0), 0) / active : 0;

  const remove = async (plan) => {
    if (!window.confirm(`Delete “${plan.title}”? This action cannot be undone.`)) return;
    setDeleting(plan._id);
    try { await builderPlanService.remove(plan._id); toast.success("Builder plan deleted"); await load(); }
    catch (e) { toast.error(e.response?.data?.message || "Unable to delete plan"); }
    finally { setDeleting(null); }
  };

  if (showInvoices) {
    return <InvoiceTablePage onBack={() => setShowInvoices(false)}/>;
  }

  return <div className="min-h-full bg-[#f6f8f7] p-4 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-[1480px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-1.5 text-[11px] text-slate-400"><span>Subscriptions</span><ChevronRight size={12}/><span className="text-slate-600">Builder plans</span></div><h1 className="text-2xl font-medium tracking-tight text-slate-900 sm:text-[28px]">Builder subscription plans</h1><p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-slate-500">Create reusable plans and assign them to builder projects through invoices.</p></div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row"><button onClick={() => setShowInvoices(true)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-200 hover:text-[#219653]"><Eye size={16}/>View invoices</button><button onClick={() => setInvoicingPlan({})} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-200 hover:text-[#219653]"><UserPlus size={16}/>Create invoice</button><button onClick={() => setModal({ type: "create" })} className="flex items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-4 py-3 text-xs font-medium text-white shadow-sm hover:bg-[#219653]"><CirclePlus size={16}/>New subscription plan</button></div>
      </div>

      <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <div className="flex min-w-max items-center gap-1">
          <button className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-[11px] font-normal text-[#219653]"><PackageOpen size={15}/>Builder plans<span className="rounded-full bg-white px-2 py-0.5 text-[9px] shadow-sm">{plans.length}</span></button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <span className="px-3 text-[10px] font-normal uppercase tracking-wider text-slate-400">Plan performance</span>
          <span className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-normal text-slate-600"><Zap size={14} className="text-[#27AE60]"/>{active} live</span>
          <span className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-normal text-slate-600"><BadgeIndianRupee size={14} className="text-[#27AE60]"/>{money(avgPrice)} average</span>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[16px] font-medium text-slate-900">Available subscriptions</h2><p className="mt-0.5 text-[11px] text-slate-500">Compare pricing, benefits and availability at a glance.</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subscriptions" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[11px] outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100 sm:w-56"/></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 outline-none focus:border-[#27AE60]"><option value="all">All plans</option><option value="true">Active plans</option><option value="false">Inactive plans</option></select></div></div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-3 sm:p-4">
        {loading ? <div className="grid min-h-64 place-items-center"><div className="text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-[#27AE60]"/><p className="mt-3 text-xs text-slate-400">Loading plans…</p></div></div>
        : error ? <div className="grid min-h-64 place-items-center p-6 text-center"><div><p className="text-sm font-bold text-slate-700">We couldn’t load the catalogue</p><p className="mt-1 text-xs text-red-500">{error}</p><button onClick={load} className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-[#27AE60]">Try again</button></div></div>
        : filtered.length === 0 ? <div className="grid min-h-64 place-items-center p-6 text-center"><div><PackageOpen className="mx-auto text-slate-300" size={32}/><p className="mt-3 text-sm font-bold text-slate-700">No plans found</p><p className="mt-1 text-xs text-slate-400">Create a plan or adjust your search filters.</p></div></div>
        : <div className="flex flex-wrap items-stretch gap-4">{filtered.map((plan) => {
          return <article key={plan._id} className="group relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
          <div className={`h-1.5 w-full ${plan.isActive ? "bg-gradient-to-r from-[#219653] via-[#27AE60] to-emerald-300" : "bg-slate-300"}`}/>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3"><div><div className="mb-3 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-[#27AE60]"><Sparkles size={17}/></span><span className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-[9px] font-normal uppercase tracking-wide text-slate-500">{plan.code}</span></div><h3 className="text-[17px] font-medium text-slate-900">{plan.title}</h3><p className="mt-1 text-[10px] font-normal uppercase tracking-[.12em] text-[#27AE60]">{String(plan.promotionType).toLowerCase() === "featured" ? "Top Selling" : plan.promotionType} promotion</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-normal uppercase tracking-wide ${plan.isActive ? "bg-emerald-50 text-[#219653]" : "bg-slate-100 text-slate-500"}`}><span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${plan.isActive ? "bg-[#27AE60]" : "bg-slate-400"}`}/>{plan.isActive ? "Live" : "Draft"}</span></div>
            <div className="mt-5 rounded-2xl bg-[#f4fbf7] p-4"><p className="text-[9px] font-normal uppercase tracking-[.14em] text-slate-400">Subscription price</p><div className="mt-1 flex items-end gap-2"><span className="text-[28px] font-medium leading-none tracking-tight text-slate-900">{money(plan.finalPrice)}</span><span className="pb-0.5 text-[10px] font-normal text-slate-500">/ {plan.durationDays} days</span></div>{Number(plan.discount)>0 && <div className="mt-2 flex items-center gap-2"><span className="text-[10px] text-slate-400 line-through">{money(plan.price)}</span><span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-normal text-[#219653]">SAVE {money(plan.discount)}</span></div>}</div>
            <p className="mt-4 min-h-10 text-[11px] leading-5 text-slate-500">{plan.description}</p>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-5"><button onClick={() => setInvoicingPlan(plan)} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#27AE60] py-2.5 text-[11px] font-medium text-white shadow-md shadow-emerald-100 hover:bg-[#219653]"><UserPlus size={13}/>Create invoice</button><button onClick={() => setModal({ type: "view", plan })} className="rounded-xl bg-emerald-50 py-2.5 text-[11px] font-medium text-[#27AE60] hover:bg-emerald-100">View</button><button onClick={() => setModal({ type: "edit", plan })} className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-[10px] text-slate-500 hover:bg-slate-50"><Edit3 size={12}/>Edit</button><button disabled={deleting===plan._id} onClick={() => remove(plan)} className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-[10px] text-slate-400 hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2 size={12}/>Delete</button></div>
          </div>
          </article>;
        })}</div>}
      </div>
    </div>
    {modal && <PlanModal plan={modal.plan} mode={modal.type} onClose={() => { setModal(null); setResumeInvoiceAfterPlan(false); }} onEdit={() => setModal({ type: "edit", plan: modal.plan })} onCreateInvoice={() => { setInvoicingPlan(modal.plan); setModal(null); }} onSaved={async (savedPlan) => { await load(); if (resumeInvoiceAfterPlan && savedPlan?._id) { setInvoicingPlan(savedPlan); setResumeInvoiceAfterPlan(false); } }}/>} 
    {assigningPlan && <AssignPlanDrawer plan={assigningPlan} onClose={() => setAssigningPlan(null)} onAssigned={load}/>} 
    {invoicingPlan && <CreateInvoiceDrawer initialPlan={invoicingPlan._id ? invoicingPlan : null} plans={plans} onClose={() => setInvoicingPlan(null)} onCreatePlan={() => { setInvoicingPlan(null); setResumeInvoiceAfterPlan(true); setModal({ type: "create" }); }}/>} 
    {showInvoices && <InvoiceListDrawer onClose={() => setShowInvoices(false)}/>} 
  </div>;
}
