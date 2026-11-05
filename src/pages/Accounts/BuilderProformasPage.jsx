import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, CheckSquare, ChevronLeft, ChevronRight, CircleDashed, Crown, Download, Eye,
  FileSpreadsheet, FileText, FolderOpen, Home, ListFilter, Loader2, Megaphone, PackageOpen, Pencil,
  Plus, ReceiptText, RefreshCw, Search, Send, Square, Trash2, TrendingUp, UserRound, X, XCircle,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import { useBuilderSearch } from "../../features/builderPlans/useBuilderSearch";
import { describePlanPackage } from "../../features/builderPlans/planPackage";
import BrandSelect from "./BrandSelect";
import PaymentMethodSelect from "./PaymentMethodSelect";

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
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] text-slate-700 outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";
const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

function StatusBadge({ value }) {
  const meta = STATUS_META[value] || STATUS_META.draft;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ring-1 ${meta.badge}`}>{meta.label}</span>;
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#27AE60] bg-white text-[#27AE60]">
          <Icon size={13} />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {action}
    </div>
  );
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

function ProformaEditorDrawer({ proforma, canUpdate, canCreateInvoice, canDelete, onClose, onSaved, onDeleted, onConvert }) {
  const isNew = !proforma?._id;
  const converted = proforma?.status === "converted";
  const readOnly = (!isNew && !canUpdate) || converted;
  const [form, setForm] = useState(() => formFromProforma(proforma));
  const [builderId, setBuilderId] = useState(proforma?.userId ? String(proforma.userId?._id || proforma.userId) : "");
  const [linkedBuilder, setLinkedBuilder] = useState(
    proforma?.userId ? { _id: String(proforma.userId?._id || proforma.userId), name: proforma.client?.name, companyName: proforma.client?.companyName } : null,
  );
  const [builderSearch, setBuilderSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(proforma?.propertyId ? String(proforma.propertyId?._id || proforma.propertyId) : "");
  const planId = proforma?.servicePlanId ? String(proforma.servicePlanId?._id || proforma.servicePlanId) : "";
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const builderLookup = useBuilderSearch({ query: builderSearch, location: { state: "", city: "", locality: "", pincode: "" }, enabled: !readOnly });

  useEffect(() => {
    if (!builderId) { setProjects([]); return; }
    let alive = true;
    builderPlanService.builderProjects(builderId).then((list) => alive && setProjects(list)).catch(() => alive && setProjects([]));
    return () => { alive = false; };
  }, [builderId]);

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
    { value: "", label: builderId ? `No project linked (${projects.length} available)` : "Link a builder to pick a project", icon: FolderOpen, tone: "bg-slate-100 text-slate-500" },
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
    const project = projects.find((item) => String(item._id) === id);
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
                {!isNew && <div className="mt-0.5 flex items-center gap-2 text-[11px] text-emerald-800/80"><StatusBadge value={proforma.status} />{proforma.createdByName && <span>by {proforma.createdByName}</span>}</div>}
              </div>
            </div>
            <button type="button" onClick={onClose} title="Close" className="rounded-xl p-2 text-[#0f3d2e] hover:bg-emerald-100"><X size={15} /></button>
          </div>
          {!isNew && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => openProformaPdf(proforma)} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#219653] hover:bg-emerald-100"><Eye size={13} />View PDF</button>
              <button type="button" onClick={() => openProformaPdf(proforma, true)} className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#219653] hover:bg-emerald-100"><Download size={13} />Download PDF</button>
              {canCreateInvoice && !converted && proforma.status !== "cancelled" && (
                <button type="button" onClick={() => onConvert(proforma)} className="flex items-center gap-1.5 rounded-xl bg-[#27AE60] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#219653]"><ReceiptText size={13} />Create invoice</button>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-4">
          {converted && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-900">
              Converted to invoice <b className="font-mono">{proforma.convertedInvoiceId?.invoiceNumber || ""}</b> on {dateText(proforma.convertedAt)}. Record payments on that invoice; this pro-forma is now read only.
            </div>
          )}

          <div>
            <SectionTitle icon={UserRound} title="Bill to" />
            {!readOnly && (
              <div className="mb-3">
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
                  />
                </Field>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Client / Builder name *"><input disabled={readOnly} value={form.client.name} onChange={(e) => setClient("name", e.target.value)} className={inputClass} placeholder="Contact person" /></Field>
              <Field label="Company name"><input disabled={readOnly} value={form.client.companyName} onChange={(e) => setClient("companyName", e.target.value)} className={inputClass} placeholder="Company / firm" /></Field>
              <Field label="Phone"><input disabled={readOnly} value={form.client.phone} onChange={(e) => setClient("phone", e.target.value)} className={inputClass} /></Field>
              <Field label="Email"><input disabled={readOnly} type="email" value={form.client.email} onChange={(e) => setClient("email", e.target.value)} className={inputClass} /></Field>
              <div className="sm:col-span-2"><Field label="Address"><input disabled={readOnly} value={form.client.address} onChange={(e) => setClient("address", e.target.value)} className={inputClass} placeholder="Street, area" /></Field></div>
              <Field label="City"><input disabled={readOnly} value={form.client.city} onChange={(e) => setClient("city", e.target.value)} className={inputClass} /></Field>
              <Field label="State"><input disabled={readOnly} value={form.client.state} onChange={(e) => setClient("state", e.target.value)} className={inputClass} /></Field>
              <Field label="Pincode"><input disabled={readOnly} value={form.client.pincode} onChange={(e) => setClient("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClass} /></Field>
              <Field label="GSTIN"><input disabled={readOnly} value={form.client.gstin} onChange={(e) => setClient("gstin", e.target.value.toUpperCase().slice(0, 15))} className={`${inputClass} font-mono`} placeholder="36ABCDE1234F1Z5" /></Field>
            </div>
          </div>

          <div>
            <SectionTitle icon={Building2} title="Project & plan" />
            <div className="grid gap-3 sm:grid-cols-2">
              {!readOnly && <Field label="Linked project"><BrandSelect searchable disabled={!builderId} value={projectId} onChange={selectProject} title="Project" options={projectOptions} /></Field>}
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
              <Field label="Pro-forma date"><input disabled={readOnly} type="date" value={form.proformaDate} onChange={(e) => setForm((c) => ({ ...c, proformaDate: e.target.value }))} className={inputClass} /></Field>
              <Field label="Valid until"><input disabled={readOnly} type="date" value={form.validUntil} onChange={(e) => setForm((c) => ({ ...c, validUntil: e.target.value }))} className={inputClass} /></Field>
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
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(proforma.propertyId ? String(proforma.propertyId?._id || proforma.propertyId) : "");
  const [planId, setPlanId] = useState(proforma.servicePlanId ? String(proforma.servicePlanId?._id || proforma.servicePlanId) : "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [saving, setSaving] = useState(false);
  const builderLookup = useBuilderSearch({ query: builderSearch, location: { state: "", city: "", locality: "", pincode: "" }, enabled: needsBuilder });

  useEffect(() => {
    if (!builderId) { setProjects([]); return; }
    let alive = true;
    builderPlanService.builderProjects(builderId).then((list) => alive && setProjects(list)).catch(() => alive && setProjects([]));
    return () => { alive = false; };
  }, [builderId]);

  const submit = async () => {
    if (!builderId || !projectId || !planId) return toast.error("Choose the builder, project and plan");
    setSaving(true);
    try {
      const result = await builderPlanService.convertProforma(proforma._id, { userId: builderId, propertyId: projectId, servicePlanId: planId, paymentMethod });
      toast.success(result?.message || "Invoice created");
      onConverted(result);
    } catch (error) {
      toast.error(errorMessage(error, "Unable to create invoice"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#27AE60]">Create invoice</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">From {proforma.proformaNumber}</h3>
            <p className="mt-1 text-[11px] text-slate-500">The invoice copies the pro-forma totals ({money(proforma.totalAmount)}) and starts as Pending. Record each payment on the invoice.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-400"><X size={14} /></button>
        </div>
        <div className="mt-4 space-y-3">
          {needsBuilder ? (
            <Field label="Builder *">
              <BrandSelect
                searchable value={builderId} onChange={(id) => { setBuilderId(id); setProjectId(""); }} title="Builder"
                options={[{ value: "", label: "Select builder", icon: UserRound, tone: "bg-slate-100 text-slate-500" },
                  ...builderLookup.items.map((b) => ({ value: String(b._id), label: `${b.name || "Builder"} — ${b.companyName || "No company"}`, hint: b.phone || b.email, icon: Building2, tone: "bg-emerald-100 text-emerald-700" }))]}
                searchValue={builderSearch} onSearchChange={setBuilderSearch} loading={builderLookup.loading}
                loadingMore={builderLookup.loadingMore} hasMore={builderLookup.hasMore} onLoadMore={builderLookup.loadMore}
              />
            </Field>
          ) : (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">Builder: <b>{proforma.client?.companyName || proforma.client?.name}</b></p>
          )}
          <Field label="Project *">
            <BrandSelect searchable disabled={!builderId} value={projectId} onChange={setProjectId} title="Project"
              options={[{ value: "", label: builderId ? "Select project" : "Select a builder first", icon: FolderOpen, tone: "bg-slate-100 text-slate-500" },
                ...projects.map((p) => ({ value: String(p._id), label: `${p.title}${p.propertyCode ? ` (${p.propertyCode})` : ""}`, hint: [p.locality, p.city].filter(Boolean).join(", "), icon: Home, tone: "bg-emerald-100 text-emerald-700" }))]} />
          </Field>
          <Field label="Plan (sets the promotion package) *">
            <BrandSelect searchable value={planId} onChange={setPlanId} title="Plan"
              options={[{ value: "", label: "Select plan", icon: PackageOpen, tone: "bg-slate-100 text-slate-500" },
                ...plans.filter((p) => p.isActive || String(p._id) === planId).map((p) => ({ value: String(p._id), label: p.title, hint: `${p.code} · ${describePlanPackage(p)}`, icon: PackageOpen, tone: "bg-emerald-100 text-emerald-700" }))]} />
          </Field>
          <Field label="Expected payment method" hint="You can record payments in any method later."><PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} /></Field>
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
        setData({ proformas: result.proformas || [], counts: result.counts || {}, meta: result.meta || { total: 0, pages: 1 } });
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
            <button type="button" onClick={reload} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-60"><RefreshCw size={13} className={loading ? "animate-spin" : ""} />Refresh</button>
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
                    <StatusBadge value={row.status} />
                    {row.convertedInvoiceId?.invoiceNumber && <p className="mt-0.5 truncate font-mono text-[8px] text-violet-600">{row.convertedInvoiceId.invoiceNumber}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => openProformaPdf(row)} title="View PDF" className="rounded-lg bg-[#27AE60] p-1.5 text-white hover:bg-[#219653]"><Eye size={13} /></button>
                      <button type="button" onClick={() => openProformaPdf(row, true)} title="Download PDF" className="rounded-lg bg-emerald-50 p-1.5 text-[#219653] hover:bg-emerald-100"><Download size={13} /></button>
                      {canUpdate && row.status !== "converted" && <button type="button" onClick={() => setEditing(row)} title="Edit" className="rounded-lg border border-emerald-200 p-1.5 text-[#27AE60] hover:bg-emerald-50"><Pencil size={13} /></button>}
                      {canCreateInvoice && !["converted", "cancelled"].includes(row.status) && (
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
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-[11px] text-slate-500">{total ? `${total} pro-forma invoice${total === 1 ? "" : "s"}` : "No pro-forma invoices"}</p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span className="px-2 text-[11px] text-slate-600">{page} / {pages}</span>
                <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <ProformaEditorDrawer
          key={`${editing._id || "new"}:${editing.updatedAt || ""}`}
          proforma={editing}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreateInvoice={canCreateInvoice}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          onDeleted={() => { setEditing(null); reload(); }}
          onConvert={(row) => setConverting(row)}
        />
      )}
      {converting && (
        <ConvertProformaModal
          proforma={converting}
          plans={plans}
          onClose={() => setConverting(null)}
          onConverted={(result) => {
            setConverting(null);
            setEditing(null);
            reload();
            if (result?.invoice?.propertyId) builderPlanService.syncProjectPromotion(String(result.invoice.propertyId));
            if (onOpenInvoices) {
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
