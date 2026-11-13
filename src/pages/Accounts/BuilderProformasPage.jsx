import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, CheckSquare, ChevronLeft, ChevronRight, CircleDashed, Clock3, Copy, Crown, Download, Eye,
  FileSpreadsheet, FileText, FolderOpen, Home, ListFilter, Loader2, Megaphone, PackageOpen, Pencil,
  Plus, ReceiptText, Search, Send, Square, Trash2, TrendingUp, UserRound, X, XCircle,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import { useBuilderSearch } from "../../features/builderPlans/useBuilderSearch";
import { useBuilderProjects } from "../../features/builderPlans/useBuilderProjects";
import { describePlanPackage, normalizePlanPackage } from "../../features/builderPlans/planPackage";
import BrandSelect from "./BrandSelect";
import PaymentMethodSelect from "./PaymentMethodSelect";
import SectionTitle from "./SectionTitle";
import { PaymentEntryFields } from "./InvoicePaymentsPanel";
import { emptyPaymentForm, paymentEntry, paymentFormError } from "./paymentForm";

const PAGE_SIZE = 12;
const MAX_ITEMS = 10;
const DEFAULT_SAC = "998362";

const STATUS_META = {
  draft: { label: "Draft", icon: Pencil, tone: "bg-slate-100 text-slate-600", badge: "bg-slate-50 text-slate-600 ring-slate-200" },
  sent: { label: "Sent", icon: Send, tone: "bg-sky-100 text-sky-700", badge: "bg-sky-50 text-sky-700 ring-sky-200" },
  accepted: { label: "Accepted", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  converted: { label: "Invoiced", icon: ReceiptText, tone: "bg-violet-100 text-violet-700", badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  cancelled: { label: "Cancelled", icon: XCircle, tone: "bg-rose-100 text-rose-700", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
};
const EDITABLE_STATUSES = ["draft", "sent", "accepted", "cancelled"];
const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses", icon: ListFilter, tone: "bg-slate-100 text-slate-500" },
  ...Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label, icon: meta.icon, tone: meta.tone })),
  { value: "expired", label: "Expired", hint: "Past the valid-until date", icon: Clock3, tone: "bg-amber-100 text-amber-700" },
];
const STATUS_EDIT_OPTIONS = EDITABLE_STATUSES.map((value) => ({
  value, label: STATUS_META[value].label, icon: STATUS_META[value].icon, tone: STATUS_META[value].tone,
}));

const PLACEMENTS = [
  { key: "prime", main: "prime", sponsored: false, label: "Prime", icon: Crown },
  { key: "featured", main: "featured", sponsored: false, label: "Top Selling", icon: TrendingUp },
  { key: "sponsored", main: "none", sponsored: true, label: "Sponsored", icon: Megaphone },
  { key: "prime+sponsored", main: "prime", sponsored: true, label: "Prime + Sponsored", icon: Crown },
  { key: "featured+sponsored", main: "featured", sponsored: true, label: "Top Selling + Sponsored", icon: TrendingUp },
];
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
const dateText = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addDays = (days) => toInputDate(new Date(Date.now() + days * 86400000));
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const emptyItem = () => ({ productName: "", sacCode: DEFAULT_SAC, qty: "", days: "", amount: "" });
const wholeNumber = (value) => value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").replace(/^0$/, "");
const decimalNumber = (value) => {
  const [whole = "", ...rest] = value.replace(/[^\d.]/g, "").split(".");
  const cleanWhole = whole.replace(/^0+(?=\d)/, "");
  return rest.length ? `${cleanWhole || "0"}.${rest.join("").slice(0, 2)}` : cleanWhole.replace(/^0$/, "");
};
const numberText = (value) => (Number(value) ? String(value) : "");
const inputClass = "min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] text-slate-700 outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";
const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;
const projectFromProforma = (proforma) => {
  const ref = proforma?.propertyId;
  if (!ref) return null;
  return {
    _id: String(ref._id || ref),
    title: ref.title || proforma.projectName || "Linked project",
    propertyCode: ref.propertyCode || proforma.projectCode || "",
    locality: ref.locality || "",
    city: ref.city || "",
  };
};
const withLinked = (items, linked) =>
  linked && !items.some((item) => String(item._id) === String(linked._id)) ? [linked, ...items] : items;
const PLACEMENTS_LONGEST_FIRST = [...PLACEMENTS].sort((a, b) => b.label.length - a.label.length);
const placementOfLine = (productName = "") => {
  const name = productName.trim().toLowerCase();
  return PLACEMENTS_LONGEST_FIRST.find((option) => {
    const suffix = `${option.label} promotion`.toLowerCase();
    return name.endsWith(suffix) && /^$|[\s-]$/.test(name.slice(0, -suffix.length));
  });
};
const planForProforma = (proforma, plans) => {
  for (const item of proforma.items || []) {
    const option = placementOfLine(item.productName);
    if (!option) continue;
    const matches = plans.filter((plan) => {
      if (!plan.isActive) return false;
      const pkg = normalizePlanPackage(plan);
      return pkg.mainPlacement === option.main && pkg.sponsoredEnabled === option.sponsored;
    });
    const plan = matches.find((p) => Number(p.durationDays) === Number(item.days)) || matches[0];
    if (plan) return { planId: String(plan._id), productName: item.productName };
  }
  return null;
};
const pageWindow = (page, pages) => {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  return Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);
};

const isExpired = (proforma) =>
  ["draft", "sent", "accepted"].includes(proforma?.status) && Boolean(proforma?.validUntil) && toInputDate(proforma.validUntil) < toInputDate(new Date());

function ExpiredBadge() {
  return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-700 ring-1 ring-amber-200">Expired</span>;
}

function StatusBadge({ value }) {
  const meta = STATUS_META[value] || STATUS_META.draft;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ring-1 ${meta.badge}`}>{meta.label}</span>;
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
    </label>
  );
}

async function openProformaPdf(proforma, download = false) {
  const popup = download ? null : window.open("", "_blank");
  try {
    const blob = await builderPlanService.proformaPdf(proforma._id, download);
    const url = URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${proforma.proformaNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else if (popup) {
      popup.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  } catch {
    popup?.close();
    toast.error("Unable to load pro-forma PDF");
  }
}

function formFromProforma(proforma) {
  const client = proforma?.client || {};
  return {
    proformaDate: toInputDate(proforma?.proformaDate) || toInputDate(new Date()),
    validUntil: toInputDate(proforma?.validUntil) || addDays(15),
    client: {
      name: client.name || "", companyName: client.companyName || "", phone: client.phone || "", email: client.email || "",
      address: client.address || "", city: client.city || "", state: client.state || "", pincode: client.pincode || "", gstin: client.gstin || "",
    },
    projectName: proforma?.projectName || "",
    items: proforma?.items?.length
      ? proforma.items.map((item) => ({
          productName: item.productName || "", sacCode: item.sacCode || DEFAULT_SAC,
          qty: numberText(item.qty), days: numberText(item.days), amount: numberText(item.amount),
        }))
      : [emptyItem()],
    gstRate: String(proforma?.gstRate ?? 18),
    notes: proforma?.notes || "",
    status: proforma?.status && proforma.status !== "converted" ? proforma.status : "draft",
  };
}

function ProformaEditorDrawer({ proforma, canCreate, canUpdate, canCreateInvoice, canDelete, onClose, onSaved, onDeleted, onConvert, onDuplicate }) {
  const isNew = !proforma?._id;
  const converted = proforma?.status === "converted";
  const expired = isExpired(proforma);
  const readOnly = (!isNew && !canUpdate) || converted || expired;
  const [form, setForm] = useState(() => formFromProforma(proforma));
  const [builderId, setBuilderId] = useState(proforma?.userId ? String(proforma.userId?._id || proforma.userId) : "");
  const [linkedBuilder, setLinkedBuilder] = useState(
    proforma?.userId ? { _id: String(proforma.userId?._id || proforma.userId), name: proforma.client?.name, companyName: proforma.client?.companyName } : null,
  );
  const [builderSearch, setBuilderSearch] = useState("");
  const [projectId, setProjectId] = useState(proforma?.propertyId ? String(proforma.propertyId?._id || proforma.propertyId) : "");
  const [linkedProject, setLinkedProject] = useState(() => projectFromProforma(proforma));
  const [projectSearch, setProjectSearch] = useState("");
  const planId = proforma?.servicePlanId ? String(proforma.servicePlanId?._id || proforma.servicePlanId) : "";
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const builderLookup = useBuilderSearch({ query: builderSearch, location: { state: "", city: "", locality: "", pincode: "" }, enabled: !readOnly });
  const projectLookup = useBuilderProjects({ builderId: readOnly ? "" : builderId, query: projectSearch });
  const projects = withLinked(projectLookup.items, linkedProject);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setClient = (key, value) => setForm((current) => ({ ...current, client: { ...current.client, [key]: value } }));
  const setItem = (index, key, value) =>
    setForm((current) => ({ ...current, items: current.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)) }));
  const addItem = (item = emptyItem()) =>
    setForm((current) => (current.items.length >= MAX_ITEMS ? current : { ...current, items: [...current.items.filter((row) => row.productName || row.amount), item] }));
  const removeItem = (index) =>
    setForm((current) => ({ ...current, items: current.items.length > 1 ? current.items.filter((_, i) => i !== index) : [emptyItem()] }));

  const subtotal = round2(form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0));
  const gstAmount = round2((subtotal * (Number(form.gstRate) || 0)) / 100);
  const total = round2(subtotal + gstAmount);

  const placementLineName = (option) => `${option.label} promotion`;
  const selectedPlacements = new Set(
    PLACEMENTS.filter((option) => form.items.some((item) => item.productName.trim() === placementLineName(option))).map((option) => option.key),
  );
  const togglePlacement = (option) =>
    setForm((current) => {
      const name = placementLineName(option);
      if (current.items.some((item) => item.productName.trim() === name)) {
        const items = current.items.filter((item) => item.productName.trim() !== name);
        return { ...current, items: items.length ? items : [emptyItem()] };
      }
      const filled = current.items.filter((row) => row.productName || row.amount);
      if (filled.length >= MAX_ITEMS) return current;
      return { ...current, items: [...filled, { ...emptyItem(), productName: name }] };
    });
  const visibleBuilders = linkedBuilder && !builderLookup.items.some((b) => String(b._id) === String(linkedBuilder._id))
    ? [linkedBuilder, ...builderLookup.items]
    : builderLookup.items;
  const builderOptions = [
    { value: "", label: "Not linked (enter client manually)", hint: "Link a builder to auto-fill details and convert to invoice later", icon: UserRound, tone: "bg-slate-100 text-slate-500" },
    ...visibleBuilders.map((builder) => ({
      value: String(builder._id),
      label: `${builder.name || "Builder"} — ${builder.companyName || "No company"}`,
      hint: [builder.city, builder.phone || builder.email].filter(Boolean).join(" · "),
      icon: Building2,
      tone: "bg-emerald-100 text-emerald-700",
    })),
  ];
  const projectOptions = [
    { value: "", label: !builderId ? "Link a builder to pick a project" : projectLookup.loading ? "Loading projects…" : `No project linked (${projectLookup.total} available)`, icon: FolderOpen, tone: "bg-slate-100 text-slate-500" },
    ...projects.map((project) => ({
      value: String(project._id),
      label: `${project.title}${project.propertyCode ? ` (${project.propertyCode})` : ""}`,
      hint: [project.locality, project.city].filter(Boolean).join(", "),
      icon: Home,
      tone: "bg-emerald-100 text-emerald-700",
    })),
  ];
  const selectBuilder = (id) => {
    setBuilderId(id);
    setProjectId("");
    setLinkedProject(null);
    setProjectSearch("");
    const builder = visibleBuilders.find((b) => String(b._id) === id) || null;
    setLinkedBuilder(builder);
    if (builder) {
      setForm((current) => ({
        ...current,
        client: {
          ...current.client,
          name: builder.name || current.client.name,
          companyName: builder.companyName || current.client.companyName,
          phone: builder.phone || current.client.phone,
          email: builder.email || current.client.email,
          address: builder.address || current.client.address,
          city: builder.city || current.client.city,
          state: builder.state || current.client.state,
          pincode: builder.pincode || current.client.pincode,
        },
      }));
    }
  };
  const selectProject = (id) => {
    setProjectId(id);
    const project = projects.find((item) => String(item._id) === id) || null;
    setLinkedProject(project);
    if (project) setForm((current) => ({ ...current, projectName: project.title || current.projectName }));
  };
  const payload = () => ({
    userId: builderId || null,
    propertyId: projectId || null,
    servicePlanId: planId || null,
    client: form.client,
    projectName: form.projectName,
    items: form.items
      .filter((item) => item.productName.trim())
      .map((item) => ({ productName: item.productName.trim(), sacCode: item.sacCode, qty: Number(item.qty) || 0, days: Number(item.days) || 0, amount: Number(item.amount) || 0 })),
    gstRate: Number(form.gstRate) || 0,
    proformaDate: form.proformaDate,
    validUntil: form.validUntil,
    notes: form.notes,
    status: form.status,
  });

  const save = async () => {
    const body = payload();
    if (!body.client.name.trim() && !body.client.companyName.trim()) return toast.error("Enter the client / builder name");
    if (!body.items.length) return toast.error("Add at least one product line");
    if (Number(form.gstRate) < 0 || Number(form.gstRate) > 100) return toast.error("GST must be between 0 and 100");
    if (form.validUntil && form.validUntil < form.proformaDate) return toast.error("Valid until must be on or after the pro-forma date");
    setSaving(true);
    try {
      const result = isNew ? await builderPlanService.createProforma(body) : await builderPlanService.updateProforma(proforma._id, body);
      toast.success(result?.message || "Pro-forma saved");
      onSaved(result?.proforma, isNew);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to save pro-forma"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await builderPlanService.removeProforma(proforma._id);
      toast.success("Pro-forma deleted");
      onDeleted(proforma);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to delete pro-forma"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="flex h-dvh w-[min(100vw,760px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
        <header className="border-b border-emerald-100 border-t-[3px] border-t-[#27AE60] bg-emerald-50 px-5 py-3.5 text-[#0f3d2e]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#27AE60] text-white"><FileSpreadsheet size={16} /></span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[.16em] text-[#219653]">{isNew ? "New pro-forma" : "Pro-forma invoice"}</p>
                <h2 className="truncate font-mono text-base font-semibold">{isNew ? "Draft" : proforma.proformaNumber}</h2>
                {!isNew && <div className="mt-0.5 flex items-center gap-2 text-[11px] text-emerald-800/80"><StatusBadge value={proforma.status} />{expired && <ExpiredBadge />}{proforma.createdByName && <span>by {proforma.createdByName}</span>}</div>}
              </div>
            </div>
            <button type="button" onClick={onClose} title="Close" className="rounded-xl p-2 text-[#0f3d2e] hover:bg-emerald-100"><X size={15} /></button>
          </div>
          {!isNew && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => openProformaPdf(proforma)} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#219653] hover:bg-emerald-100"><Eye size={13} />View PDF</button>
              <button type="button" onClick={() => openProformaPdf(proforma, true)} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#219653] hover:bg-emerald-100"><Download size={13} />Download PDF</button>
              {canCreate && expired && (
                <button type="button" onClick={() => onDuplicate(proforma)} className="flex items-center gap-1.5 rounded-xl bg-[#27AE60] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#219653]"><Copy size={13} />Duplicate with new dates</button>
              )}
              {canCreateInvoice && !converted && !expired && proforma.status !== "cancelled" && (
                <button type="button" onClick={() => onConvert(proforma)} className="flex items-center gap-1.5 rounded-xl bg-[#27AE60] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#219653]"><ReceiptText size={13} />Create invoice</button>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-4">
          {expired && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
              <Clock3 size={14} className="mt-0.5 shrink-0" />
              <p>This pro-forma expired on <b>{dateText(proforma.validUntil)}</b>. It can no longer be edited or turned into an invoice. Use <b>Duplicate with new dates</b> to quote the same details again.</p>
            </div>
          )}
          {converted && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-900">
              Converted to invoice <b className="font-mono">{proforma.convertedInvoiceId?.invoiceNumber || ""}</b> on {dateText(proforma.convertedAt)}. Record payments on that invoice; this pro-forma is now read only.
            </div>
          )}

          <div>
            <SectionTitle icon={UserRound} title="Bill to" />
            <div className="grid gap-3 sm:grid-cols-2">
              {!readOnly && (
                <Field label="Link builder (optional)">
                  <BrandSelect
                    searchable
                    value={builderId}
                    onChange={selectBuilder}
                    title="Builder"
                    options={builderOptions}
                    searchValue={builderSearch}
                    onSearchChange={setBuilderSearch}
                    loading={builderLookup.loading}
                    loadingMore={builderLookup.loadingMore}
                    hasMore={builderLookup.hasMore}
                    onLoadMore={builderLookup.loadMore}
                    footer={`Showing ${builderLookup.items.length} of ${builderLookup.total} builders · 20 per page`}
                  />
                </Field>
              )}
              <Field label="Client / Builder name *"><input disabled={readOnly} value={form.client.name} onChange={(e) => setClient("name", e.target.value)} className={inputClass} placeholder="Contact person" /></Field>
              <Field label="Company name"><input disabled={readOnly} value={form.client.companyName} onChange={(e) => setClient("companyName", e.target.value)} className={inputClass} placeholder="Company / firm" /></Field>
              <Field label="Phone"><input disabled={readOnly} value={form.client.phone} onChange={(e) => setClient("phone", e.target.value)} className={inputClass} /></Field>
              <Field label="Email"><input disabled={readOnly} type="email" value={form.client.email} onChange={(e) => setClient("email", e.target.value)} className={inputClass} /></Field>
              <div className={readOnly ? "sm:col-span-2" : ""}><Field label="Address"><input disabled={readOnly} value={form.client.address} onChange={(e) => setClient("address", e.target.value)} className={inputClass} placeholder="Street, area" /></Field></div>
              <Field label="City"><input disabled={readOnly} value={form.client.city} onChange={(e) => setClient("city", e.target.value)} className={inputClass} /></Field>
              <Field label="State"><input disabled={readOnly} value={form.client.state} onChange={(e) => setClient("state", e.target.value)} className={inputClass} /></Field>
              <Field label="Pincode"><input disabled={readOnly} value={form.client.pincode} onChange={(e) => setClient("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} /></Field>
              <Field label="GSTIN"><input disabled={readOnly} value={form.client.gstin} onChange={(e) => setClient("gstin", e.target.value.toUpperCase().slice(0, 15))} className={`${inputClass} font-mono`} placeholder="36ABCDE1234F1Z5" /></Field>
            </div>
          </div>

          <div>
            <SectionTitle icon={Building2} title="Project & plan" />
            <div className="grid gap-3 sm:grid-cols-2">
              {!readOnly && (
                <Field label="Linked project">
                  <BrandSelect
                    searchable
                    disabled={!builderId}
                    value={projectId}
                    onChange={selectProject}
                    title="Project"
                    options={projectOptions}
                    searchValue={projectSearch}
                    onSearchChange={setProjectSearch}
                    loading={projectLookup.loading}
                    loadingMore={projectLookup.loadingMore}
                    hasMore={projectLookup.hasMore}
                    onLoadMore={projectLookup.loadMore}
                    footer={`Showing ${projectLookup.items.length} of ${projectLookup.total} projects · 12 per page`}
                  />
                </Field>
              )}
              <Field label="Project name (printed)"><input disabled={readOnly} value={form.projectName} onChange={(e) => setForm((c) => ({ ...c, projectName: e.target.value }))} className={inputClass} /></Field>
              {!readOnly && (
                <div className="sm:col-span-2">
                  <Field label="Promotion type">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                      {PLACEMENTS.filter((option) => !selectedPlacements.size || selectedPlacements.has(option.key)).map((option) => {
                        const active = selectedPlacements.has(option.key);
                        const Icon = option.icon;
                        const span =
                          selectedPlacements.size === 1
                            ? "col-span-2 sm:col-span-6"
                            : option.sponsored && option.main !== "none" ? "sm:col-span-3" : "sm:col-span-2";
                        return (
                          <button
                            key={option.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => togglePlacement(option)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-medium transition ${span} ${active ? "border-[#27AE60] bg-emerald-50 text-[#0f3d2e]" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50"}`}
                          >
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${active ? "bg-[#27AE60] text-white" : "bg-emerald-50 text-[#219653]"}`}>
                              <Icon size={12} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{option.label}</span>
                            {active ? <CheckSquare size={14} className="shrink-0 text-[#27AE60]" /> : <Square size={14} className="shrink-0 text-slate-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionTitle
              icon={FileText}
              title="Products"
              action={!readOnly && <button type="button" disabled={form.items.length >= MAX_ITEMS} onClick={() => addItem()} className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#219653] hover:bg-emerald-50 disabled:opacity-40"><Plus size={12} />Add line</button>}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[11px]">
                <thead>
                  <tr className="bg-[#27AE60] text-white">
                    <th className="w-10 rounded-l-lg px-2 py-2 font-medium">S.No</th>
                    <th className="px-2 py-2 font-medium">Product name</th>
                    <th className="w-24 px-2 py-2 font-medium">SAC code</th>
                    <th className="w-16 px-2 py-2 font-medium">Qty</th>
                    <th className="w-16 px-2 py-2 font-medium">Days</th>
                    <th className="w-28 px-2 py-2 text-right font-medium">Amount (₹)</th>
                    <th className="w-8 rounded-r-lg" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-2 text-slate-400">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-1 py-1.5"><input disabled={readOnly} value={item.productName} onChange={(e) => setItem(index, "productName", e.target.value)} className={inputClass} placeholder="e.g. Prime listing — 30 days" /></td>
                      <td className="px-1 py-1.5"><input disabled={readOnly} inputMode="numeric" value={item.sacCode} onChange={(e) => setItem(index, "sacCode", e.target.value.replace(/\D/g, "").slice(0, 8))} className={`${inputClass} font-mono`} placeholder={DEFAULT_SAC} /></td>
                      <td className="px-1 py-1.5"><input disabled={readOnly} inputMode="numeric" value={item.qty} onChange={(e) => setItem(index, "qty", wholeNumber(e.target.value))} className={inputClass} placeholder="1" /></td>
                      <td className="px-1 py-1.5"><input disabled={readOnly} inputMode="numeric" value={item.days} onChange={(e) => setItem(index, "days", wholeNumber(e.target.value))} className={inputClass} placeholder="30" /></td>
                      <td className="px-1 py-1.5"><input disabled={readOnly} inputMode="decimal" value={item.amount} onChange={(e) => setItem(index, "amount", decimalNumber(e.target.value))} className={`${inputClass} text-right`} placeholder="0.00" /></td>
                      <td className="px-1 py-1.5 text-center">{!readOnly && <button type="button" onClick={() => removeItem(index)} title="Remove line" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-col items-end gap-1 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
              <p>Sub total <b className="ml-2 text-slate-800">{money(subtotal)}</b></p>
              <div className="flex items-center gap-2">
                <span>GST</span>
                <input disabled={readOnly} type="number" min="0" max="100" step="0.01" value={form.gstRate} onChange={(e) => setForm((c) => ({ ...c, gstRate: e.target.value }))} className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-right text-[11px] outline-none focus:border-[#27AE60]" />
                <span>%</span>
                <b className="ml-2 text-slate-800">{money(gstAmount)}</b>
              </div>
              <p className="mt-1 rounded-lg bg-[#27AE60] px-3 py-1.5 text-[12px] font-semibold text-white">Total amount: {money(total)}</p>
            </div>
          </div>

          <div>
            <SectionTitle icon={CalendarDays} title="Dates & notes" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Pro-forma date"><input disabled={readOnly} type="date" value={form.proformaDate} onChange={(e) => setForm((c) => ({ ...c, proformaDate: e.target.value, validUntil: c.validUntil && c.validUntil < e.target.value ? e.target.value : c.validUntil }))} className={inputClass} /></Field>
              <Field label="Valid until" hint={readOnly ? "" : "After this date the pro-forma expires and can't be invoiced."}><input disabled={readOnly} type="date" min={form.proformaDate} value={form.validUntil} onChange={(e) => setForm((c) => ({ ...c, validUntil: e.target.value }))} className={inputClass} /></Field>
              <Field label="Status">{readOnly ? <div className="py-2"><StatusBadge value={proforma?.status} /></div> : <BrandSelect value={form.status} onChange={(value) => setForm((c) => ({ ...c, status: value }))} title="Status" options={STATUS_EDIT_OPTIONS} />}</Field>
              <div className="sm:col-span-3"><Field label="Notes (printed on PDF)"><textarea disabled={readOnly && !(converted && canUpdate)} rows={2} value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} className={inputClass} placeholder="Payment terms, offer details…" /></Field></div>
            </div>
          </div>

        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-red-600">Delete this pro-forma permanently?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600">Cancel</button>
                <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {!isNew && canDelete && !converted ? (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50"><Trash2 size={13} />Delete</button>
              ) : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-[11px] text-slate-600">Close</button>
                {(!readOnly || (converted && canUpdate)) && (
                  <button type="button" disabled={saving} onClick={converted ? async () => {
                    setSaving(true);
                    try {
                      const result = await builderPlanService.updateProforma(proforma._id, { notes: form.notes });
                      toast.success("Notes saved");
                      onSaved(result?.proforma, false);
                    } catch (error) { toast.error(errorMessage(error, "Unable to save notes")); }
                    finally { setSaving(false); }
                  } : save} className="flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-40">
                    {saving && <Loader2 size={12} className="animate-spin" />}{isNew ? "Create pro-forma" : converted ? "Save notes" : "Save changes"}
                  </button>
                )}
              </div>
            </div>
          )}
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function ConvertProformaModal({ proforma, plans, onClose, onConverted }) {
  const needsBuilder = !proforma.userId;
  const [builderSearch, setBuilderSearch] = useState("");
  const [builderId, setBuilderId] = useState(proforma.userId ? String(proforma.userId?._id || proforma.userId) : "");
  const [projectId, setProjectId] = useState(proforma.propertyId ? String(proforma.propertyId?._id || proforma.propertyId) : "");
  const [linkedProject, setLinkedProject] = useState(() => projectFromProforma(proforma));
  const [projectSearch, setProjectSearch] = useState("");
  const [suggestedPlan] = useState(() => planForProforma(proforma, plans));
  const [planId, setPlanId] = useState(() => (proforma.servicePlanId ? String(proforma.servicePlanId?._id || proforma.servicePlanId) : suggestedPlan?.planId || ""));
  const [collectNow, setCollectNow] = useState(true);
  const [paymentForm, setPaymentForm] = useState(() => emptyPaymentForm(round2(proforma.totalAmount), "upi"));
  const [proofs, setProofs] = useState([]);
  const [saving, setSaving] = useState(false);
  const builderLookup = useBuilderSearch({ query: builderSearch, location: { state: "", city: "", locality: "", pincode: "" }, enabled: needsBuilder });
  const projectLookup = useBuilderProjects({ builderId, query: projectSearch });
  const projects = withLinked(projectLookup.items, linkedProject);
  const autoPicked = suggestedPlan && planId === suggestedPlan.planId;

  const submit = async () => {
    if (!builderId || !projectId || !planId) return toast.error("Choose the builder, project and plan");
    if (collectNow) {
      const problem = paymentFormError(paymentForm);
      if (problem) return toast.error(problem);
    }
    setSaving(true);
    try {
      const result = await builderPlanService.convertProforma(proforma._id, { userId: builderId, propertyId: projectId, servicePlanId: planId, paymentMethod: paymentForm.method });
      if (!collectNow) {
        toast.success(result?.message || "Invoice created");
        return onConverted(result, false);
      }
      try {
        const paid = await builderPlanService.recordPayment(result.invoice._id, paymentEntry(paymentForm), proofs);
        toast.success(`${result?.message || "Invoice created"} · payment of ${money(paymentForm.amount)} recorded`);
        onConverted({ ...result, invoice: paid?.invoice || result.invoice }, true);
      } catch (error) {
        toast.error(errorMessage(error, "Invoice created, but the payment could not be saved — record it on the invoice"));
        onConverted(result, false);
      }
    } catch (error) {
      toast.error(errorMessage(error, "Unable to create invoice"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#27AE60]">Create invoice</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">From {proforma.proformaNumber}</h3>
            <p className="mt-1 text-[11px] text-slate-500">The invoice copies the pro-forma totals ({money(proforma.totalAmount)}). Enter the payment received now and it is saved on the invoice.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-400"><X size={14} /></button>
        </div>
        <div className="mt-4 space-y-3">
          {needsBuilder ? (
            <Field label="Builder *">
              <BrandSelect
                searchable value={builderId} onChange={(id) => { setBuilderId(id); setProjectId(""); setLinkedProject(null); setProjectSearch(""); }} title="Builder"
                options={[{ value: "", label: "Select builder", icon: UserRound, tone: "bg-slate-100 text-slate-500" },
                  ...builderLookup.items.map((b) => ({ value: String(b._id), label: `${b.name || "Builder"} — ${b.companyName || "No company"}`, hint: b.phone || b.email, icon: Building2, tone: "bg-emerald-100 text-emerald-700" }))]}
                searchValue={builderSearch} onSearchChange={setBuilderSearch} loading={builderLookup.loading}
                loadingMore={builderLookup.loadingMore} hasMore={builderLookup.hasMore} onLoadMore={builderLookup.loadMore}
                footer={`Showing ${builderLookup.items.length} of ${builderLookup.total} builders · 20 per page`}
              />
            </Field>
          ) : (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">Builder: <b>{proforma.client?.companyName || proforma.client?.name}</b></p>
          )}
          <Field label="Project *">
            <BrandSelect searchable disabled={!builderId} value={projectId} title="Project"
              onChange={(id) => { setProjectId(id); setLinkedProject(projects.find((p) => String(p._id) === id) || null); }}
              options={[{ value: "", label: builderId ? "Select project" : "Select a builder first", icon: FolderOpen, tone: "bg-slate-100 text-slate-500" },
                ...projects.map((p) => ({ value: String(p._id), label: `${p.title}${p.propertyCode ? ` (${p.propertyCode})` : ""}`, hint: [p.locality, p.city].filter(Boolean).join(", "), icon: Home, tone: "bg-emerald-100 text-emerald-700" }))]}
              searchValue={projectSearch} onSearchChange={setProjectSearch} loading={projectLookup.loading}
              loadingMore={projectLookup.loadingMore} hasMore={projectLookup.hasMore} onLoadMore={projectLookup.loadMore}
              footer={`Showing ${projectLookup.items.length} of ${projectLookup.total} projects · 12 per page`} />
          </Field>
          <Field label="Plan (sets the promotion package) *" hint={autoPicked ? `Auto-selected from the pro-forma line "${suggestedPlan.productName}"` : ""}>
            <BrandSelect searchable value={planId} onChange={setPlanId} title="Plan"
              options={[{ value: "", label: "Select plan", icon: PackageOpen, tone: "bg-slate-100 text-slate-500" },
                ...plans.filter((p) => p.isActive || String(p._id) === planId).map((p) => ({ value: String(p._id), label: p.title, hint: `${p.code} · ${describePlanPackage(p)}`, icon: PackageOpen, tone: "bg-emerald-100 text-emerald-700" }))]} />
          </Field>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-[#0f3d2e]">Payment</p>
              <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-emerald-100">
                {[[true, "Received now"], [false, "Record later"]].map(([value, label]) => (
                  <button key={label} type="button" onClick={() => setCollectNow(value)} className={`rounded-md px-3 py-1 text-[10px] font-medium ${collectNow === value ? "bg-[#27AE60] text-white" : "text-slate-500 hover:text-[#219653]"}`}>{label}</button>
                ))}
              </div>
            </div>
            {collectNow ? (
              <PaymentEntryFields form={paymentForm} setForm={setPaymentForm} proofs={proofs} setProofs={setProofs} />
            ) : (
              <Field label="Expected payment method" hint="Record the payment on the invoice when it arrives.">
                <PaymentMethodSelect value={paymentForm.method} onChange={(method) => setPaymentForm((current) => ({ ...current, method }))} />
              </Field>
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-[11px] text-slate-600">Cancel</button>
          <button type="button" disabled={saving} onClick={submit} className="flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-40">
            {saving && <Loader2 size={12} className="animate-spin" />}Create invoice
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function BuilderProformasPage({ plans = [], canCreate = false, canUpdate = false, canDelete = false, canCreateInvoice = false, onBack, onOpenInvoices }) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState({ proformas: [], counts: {}, meta: { total: 0, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [converting, setConverting] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    builderPlanService
      .proformaPage({ q: debouncedQ, status, page, limit: PAGE_SIZE }, controller.signal)
      .then((result) => {
        const meta = result.meta || { total: 0, pages: 1 };
        if (page > meta.pages) {
          setPage(meta.pages);
          return;
        }
        setData({ proformas: result.proformas || [], counts: result.counts || {}, expiredCount: result.expiredCount || 0, meta });
        setLoading(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        toast.error(errorMessage(error, "Unable to load pro-forma invoices"));
        setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQ, status, page, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const totals = useMemo(() => Object.values(data.counts).reduce((sum, row) => sum + (row?.count || 0), 0), [data.counts]);

  const onSaved = (saved) => {
    if (saved) setEditing(saved);
    reload();
  };

  const duplicate = async (row) => {
    try {
      const result = await builderPlanService.duplicateProforma(row._id);
      toast.success(result?.message || "Pro-forma duplicated");
      setStatus("");
      setPage(1);
      setEditing(result?.proforma || null);
      reload();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to duplicate pro-forma"));
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = [];
      for (let p = 1; p <= 20; p += 1) {
        const result = await builderPlanService.proformaPage({ q: debouncedQ, status, page: p, limit: 50 });
        rows.push(...(result.proformas || []));
        if (!result.meta?.hasNextPage) break;
      }
      const sheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
        "Pro-forma no": row.proformaNumber,
        Date: dateText(row.proformaDate),
        "Valid until": dateText(row.validUntil),
        Client: row.client?.name || "",
        Company: row.client?.companyName || "",
        Phone: row.client?.phone || "",
        Email: row.client?.email || "",
        GSTIN: row.client?.gstin || "",
        Project: row.projectName || "",
        Plan: row.servicePlanName || "",
        Products: (row.items || []).map((item) => `${item.productName} (${item.days || 0}d) ${item.amount}`).join("; "),
        Subtotal: row.subtotalAmount,
        "GST %": row.gstRate,
        GST: row.gstAmount,
        Total: row.totalAmount,
        Status: STATUS_META[row.status]?.label || row.status,
        Invoice: row.convertedInvoiceId?.invoiceNumber || "",
        "Created by": row.createdByName || "",
      })));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Pro-forma");
      XLSX.writeFile(book, `proforma-invoices-${toInputDate(new Date())}.xlsx`);
    } catch (error) {
      toast.error(errorMessage(error, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  const { total = 0, pages = 1 } = data.meta;
  const rangeStart = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {onBack && <button type="button" onClick={onBack} className="mb-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#219653]"><ArrowLeft size={12} />Builder plans</button>}
            <h1 className="text-2xl font-medium text-slate-900">Pro-forma invoices</h1>
            <p className="mt-1 text-[12px] text-slate-500">Quote a builder before payment, share the PDF, then turn it into an invoice with one click.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={exportExcel} disabled={exporting || !total} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-50">{exporting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}Export Excel</button>
            {onOpenInvoices && <button type="button" onClick={onOpenInvoices} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-[#219653]"><ReceiptText size={13} />Invoices</button>}
            {canCreate && <button type="button" onClick={() => setEditing({})} className="flex items-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#219653]"><Plus size={15} />Create pro-forma</button>}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setStatus(""); setPage(1); }} className={`rounded-full px-3 py-1.5 text-[11px] ring-1 ${!status ? "bg-[#27AE60] text-white ring-[#27AE60]" : "bg-white text-slate-600 ring-slate-200"}`}>All · {totals}</button>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <button key={value} type="button" onClick={() => { setStatus(value); setPage(1); }} className={`rounded-full px-3 py-1.5 text-[11px] ring-1 ${status === value ? "bg-[#27AE60] text-white ring-[#27AE60]" : "bg-white text-slate-600 ring-slate-200"}`}>
              {meta.label} · {data.counts[value]?.count || 0}
            </button>
          ))}
          <button type="button" onClick={() => { setStatus("expired"); setPage(1); }} className={`rounded-full px-3 py-1.5 text-[11px] ring-1 ${status === "expired" ? "bg-amber-500 text-white ring-amber-500" : "bg-white text-amber-700 ring-amber-200"}`}>
            Expired · {data.expiredCount || 0}
          </button>
        </div>

        <div className="mb-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search pro-forma no, client, company, phone, project, plan…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[11px] outline-none focus:border-[#27AE60]" />
          </div>
          <BrandSelect size="sm" title="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={STATUS_FILTER_OPTIONS} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-left">
            <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="w-[18%] px-4 py-3 font-medium">Pro-forma</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="hidden w-[22%] px-4 py-3 font-medium md:table-cell">Project / plan</th>
                <th className="w-[13%] px-4 py-3 font-medium">Total</th>
                <th className="w-[11%] px-4 py-3 font-medium">Status</th>
                <th className="w-[150px] px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-60" : ""}`}>
              {data.proformas.map((row) => (
                <tr key={row._id} onClick={() => setEditing(row)} className="cursor-pointer hover:bg-emerald-50/50">
                  <td className="px-4 py-3">
                    <p className="truncate font-mono text-[10px] font-medium text-slate-800">{row.proformaNumber}</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">{dateText(row.proformaDate)} · valid {dateText(row.validUntil)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate text-[11px] font-medium text-slate-800">{row.client?.companyName || row.client?.name || "—"}</p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">{row.client?.phone || row.client?.email || "—"}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="truncate text-[10px] font-medium text-slate-700">{row.projectName || "—"}</p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">{row.servicePlanName || `${row.items?.length || 0} line(s)`}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#219653]">{money(row.totalAmount)}</p>
                    <p className="mt-0.5 text-[9px] text-slate-400">GST {row.gstRate}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1"><StatusBadge value={row.status} />{isExpired(row) && <ExpiredBadge />}</div>
                    {row.convertedInvoiceId?.invoiceNumber && <p className="mt-0.5 truncate font-mono text-[8px] text-violet-600">{row.convertedInvoiceId.invoiceNumber}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openProformaPdf(row)} title="View PDF" className="rounded-lg bg-[#27AE60] p-1.5 text-white hover:bg-[#219653]"><Eye size={13} /></button>
                      <button type="button" onClick={() => openProformaPdf(row, true)} title="Download PDF" className="rounded-lg bg-emerald-50 p-1.5 text-[#219653] hover:bg-emerald-100"><Download size={13} /></button>
                      {isExpired(row) ? (
                        canCreate && <button type="button" onClick={() => duplicate(row)} title="Expired — duplicate with new dates" className="rounded-lg bg-amber-100 p-1.5 text-amber-800 hover:bg-amber-200"><Copy size={13} /></button>
                      ) : canUpdate && row.status !== "converted" && <button type="button" onClick={() => setEditing(row)} title="Edit" className="rounded-lg border border-emerald-200 p-1.5 text-[#27AE60] hover:bg-emerald-50"><Pencil size={13} /></button>}
                      {canCreateInvoice && !isExpired(row) && !["converted", "cancelled"].includes(row.status) && (
                        <button type="button" onClick={() => setConverting(row)} title="Create invoice from this pro-forma" className="rounded-lg bg-amber-100 p-1.5 text-amber-800 hover:bg-amber-200"><ReceiptText size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.proformas.length === 0 && (
            <div className="py-14 text-center">
              <FileText size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-700">No pro-forma invoices</p>
              <p className="mt-1 text-[11px] text-slate-400">{q || status ? "Try a different search or status." : "Create one to quote a builder."}</p>
            </div>
          )}
          {loading && !data.proformas.length && <div className="flex justify-center py-12"><CircleDashed size={22} className="animate-spin text-emerald-300" /></div>}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-[11px] text-slate-500">
              {total ? <>Showing <b className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</b> of <b className="font-medium text-slate-700">{total}</b> pro-forma invoices · {PAGE_SIZE} per page</> : "No pro-forma invoices"}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-30"><ChevronLeft size={14} /></button>
                {pageWindow(page, pages).map((number) => (
                  <button key={number} type="button" disabled={loading} onClick={() => setPage(number)} className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-medium transition ${number === page ? "bg-[#27AE60] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-[#219653]"}`}>{number}</button>
                ))}
                <button type="button" disabled={page >= pages || loading} onClick={() => setPage(page + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <ProformaEditorDrawer
          key={`${editing._id || "new"}:${editing.updatedAt || ""}`}
          proforma={editing}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreateInvoice={canCreateInvoice}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          onDeleted={() => { setEditing(null); reload(); }}
          onConvert={(row) => setConverting(row)}
          onDuplicate={duplicate}
        />
      )}
      {converting && (
        <ConvertProformaModal
          proforma={converting}
          plans={plans}
          onClose={() => setConverting(null)}
          onConverted={(result, paymentSaved) => {
            setConverting(null);
            setEditing(null);
            reload();
            if (result?.invoice?.propertyId) builderPlanService.syncProjectPromotion(String(result.invoice.propertyId));
            if (onOpenInvoices && !paymentSaved) {
              toast.message("Open the invoice to record the payment", {
                action: { label: "Open invoices", onClick: onOpenInvoices },
              });
            }
          }}
        />
      )}
    </div>
  );
}
