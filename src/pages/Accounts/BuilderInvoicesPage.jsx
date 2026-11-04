import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Building2, CalendarDays, CheckCircle2, CirclePlus, ChevronLeft, ChevronRight, CircleDashed, Clock, Download, Eye,
  FileText, Layers, ListFilter, Loader2, Map as MapIcon, MapPin, Pencil, RefreshCw, Search, Trash2, UserPlus,
  UserRound, X, XCircle,
} from "lucide-react";
import { builderPlanService } from "../../features/builderPlans/builderPlanService";
import { describePlanPackage } from "../../features/builderPlans/planPackage";
import { useInvoicePdfCache } from "../../features/builderPlans/useInvoicePdfCache";
import BrandSelect from "./BrandSelect";
import InvoiceViewDrawer from "./InvoiceViewDrawer";
import PaymentMethodSelect, { PaymentStatusSelect } from "./PaymentMethodSelect";
import InvoicePaymentsPanel from "./InvoicePaymentsPanel";

const PAGE_SIZE = 12;
const EMPTY_FILTERS = { q: "", paymentStatus: "", invoiceType: "", userId: "", propertyId: "", planName: "", state: "", city: "", locality: "" };

const TYPE_OPTIONS = [
  { value: "", label: "All invoices", icon: FileText, tone: "bg-slate-100 text-slate-500" },
  { value: "new", label: "New", icon: CirclePlus, tone: "bg-emerald-100 text-emerald-700" },
  { value: "renewal", label: "Renewal", icon: RefreshCw, tone: "bg-sky-100 text-sky-700" },
];
const LOCATION_LEVELS = ["state", "city", "locality"];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses", icon: ListFilter, tone: "bg-slate-100 text-slate-500" },
  { value: "paid", label: "Paid", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
  { value: "pending", label: "Pending", icon: Clock, tone: "bg-amber-100 text-amber-700" },
  { value: "partial", label: "Partial", icon: CircleDashed, tone: "bg-blue-100 text-blue-700" },
  { value: "failed", label: "Failed", icon: XCircle, tone: "bg-red-100 text-red-700" },
];

const LOCATION_META = {
  state: { all: "All states", title: "State", icon: MapIcon, tone: "bg-amber-100 text-amber-700" },
  city: { all: "All cities", title: "City", icon: Building2, tone: "bg-sky-100 text-sky-700" },
  locality: { all: "All localities", title: "Locality", icon: MapPin, tone: "bg-violet-100 text-violet-700" },
};

const STATUS_BADGE = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  partial: "bg-blue-50 text-blue-700 ring-blue-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
};

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const locationText = (item = {}) => [
  item.locality || item.location?.locality, item.city || item.location?.city,
  item.state || item.location?.state, item.pincode || item.location?.pincode,
].filter(Boolean).join(", ");
const partsOf = (invoice) => ({
  builder: invoice.builderDetails || invoice.userId || {},
  project: invoice.propertyId || {},
  plan: invoice.servicePlanId || {},
});

function StatusBadge({ value }) {
  const status = String(value || "pending");
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ring-1 ${STATUS_BADGE[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>{status}</span>;
}

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function pageWindow(page, pages) {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  return Array.from({ length: Math.min(5, pages) }, (_, index) => start + index);
}

function DetailRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className={`text-right text-[11px] ${strong ? "font-semibold text-slate-900" : "text-slate-700"}`}>{value}</dd>
    </div>
  );
}

function InvoiceDetailsDrawer({ invoice, canUpdate, canDelete, startEditing = false, onClose, onViewPdf, onDownload, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(startEditing && canUpdate);
  const editRef = useRef(null);
  const { builder, project, plan } = partsOf(invoice);
  const pkg = invoice.planSnapshot || plan;
  const [status, setStatus] = useState(invoice.paymentStatus || "pending");
  const [method, setMethod] = useState(invoice.paymentMethod || "cash");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirty = status !== (invoice.paymentStatus || "pending") || method !== (invoice.paymentMethod || "cash");

  useEffect(() => {
    if (startEditing) editRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [startEditing]);

  const startEdit = () => {
    if (!canUpdate) {
      toast.error("You don't have permission to edit invoices. Ask a Super Admin for builder_invoice:update.");
      return;
    }
    setEditing(true);
  };
  const cancelEdit = () => {
    setStatus(invoice.paymentStatus || "pending");
    setMethod(invoice.paymentMethod || "cash");
    setEditing(false);
  };
  const projectId = project?._id || invoice.propertyId;

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && !confirmDelete && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, confirmDelete]);

  const save = async () => {
    setSaving(true);
    try {
      const result = await builderPlanService.updateInvoice(invoice._id, { paymentStatus: status, paymentMethod: method });
      await builderPlanService.syncProjectPromotion(projectId);
      toast.success("Invoice updated");
      const fresh = result?.invoice || {};
      onSaved({
        ...invoice,
        paymentStatus: fresh.paymentStatus ?? status,
        paymentMethod: fresh.paymentMethod ?? method,
        paidAmount: fresh.paidAmount ?? invoice.paidAmount,
        promotionStatus: fresh.promotionStatus ?? invoice.promotionStatus,
        updatedAt: fresh.updatedAt || new Date().toISOString(),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update invoice");
    } finally {
      setSaving(false);
    }
  };

  const onPaymentsChanged = async (fresh) => {
    if (!fresh) return;
    await builderPlanService.syncProjectPromotion(projectId);
    onSaved({
      ...invoice,
      ...fresh,
      userId: invoice.userId,
      propertyId: invoice.propertyId,
      servicePlanId: invoice.servicePlanId,
      renewalOf: invoice.renewalOf,
      updatedAt: fresh.updatedAt || new Date().toISOString(),
    });
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await builderPlanService.removeInvoice(invoice._id);
      await builderPlanService.syncProjectPromotion(projectId);
      toast.success("Invoice deleted");
      onDeleted(invoice);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete invoice");
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" style={{ animation: "invoicesFade .15s ease-out" }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="flex h-dvh w-[min(100vw,560px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl" style={{ animation: "invoicesSlide .22s cubic-bezier(.4,0,.2,1)" }}>
        <header className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100">Invoice details</p>
              <h2 className="mt-1 truncate font-mono text-lg font-medium">{invoice.invoiceNumber}</h2>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-50"><CalendarDays size={12} />{date(invoice.invoiceDate)}</p>
            </div>
            <button type="button" onClick={onClose} title="Close" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25"><X size={15} /></button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onViewPdf(invoice)} className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-[#17643f] shadow-sm hover:bg-emerald-50"><Eye size={13} />View PDF</button>
            <button type="button" onClick={() => onDownload(invoice)} className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-[11px] font-medium hover:bg-white/25"><Download size={13} />Download</button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Total amount</p>
              <p className="mt-1 text-2xl font-semibold text-[#219653]">{money(invoice.totalAmount)}</p>
            </div>
            <div className="text-right">
              <StatusBadge value={invoice.paymentStatus} />
              <p className="mt-1 text-[10px] capitalize text-slate-500">{invoice.paymentMethod || "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400"><UserRound size={12} />Bill to</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-900">{builder.companyName || builder.name || "Builder"}</p>
            {builder.companyName && builder.name && <p className="text-[11px] text-slate-500">{builder.name}</p>}
            <div className="mt-2 grid gap-1 text-[11px] text-slate-600 sm:grid-cols-2">
              <p>{builder.phone || "—"}</p>
              <p className="truncate">{builder.email || "—"}</p>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">{builder.address || locationText(builder) || "—"}</p>
            {builder.userCode && <p className="mt-1 font-mono text-[10px] text-slate-400">{builder.userCode}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400"><Building2 size={12} />Project & plan</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-900">{invoice.propertyTitle || project.title || "—"}</p>
            <p className="font-mono text-[10px] text-slate-400">{invoice.projectCode || project.propertyCode || "—"}</p>
            {locationText(project) && <p className="mt-1 text-[11px] text-slate-500">{locationText(project)}</p>}
            <div className="mt-3 rounded-xl bg-emerald-50/60 p-3">
              <p className="text-[12px] font-semibold text-slate-800">{invoice.servicePlanName || plan.title || "Builder plan"}</p>
              <p className="text-[10px] text-slate-500">{describePlanPackage(pkg)} · {invoice.timePeriod || "—"}</p>
              {invoice.startDate && <p className="mt-1 text-[10px] text-slate-500">{date(invoice.startDate)} → {date(invoice.endDate)}</p>}
            </div>
            {invoice.renewalOf ? (
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                <span className="rounded-lg bg-sky-100 p-1.5 text-sky-700"><RefreshCw size={12} /></span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-sky-900">Renewal invoice</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-sky-800">
                    {invoice.renewalOf?.invoiceNumber ? (
                      <>Renews <span className="font-mono font-medium">{invoice.renewalOf.invoiceNumber}</span>
                        {invoice.renewalOf.servicePlanName ? ` (${invoice.renewalOf.servicePlanName}` : ""}
                        {invoice.renewalOf.servicePlanName && invoice.renewalOf.endDate ? `, ended ${date(invoice.renewalOf.endDate)})` : invoice.renewalOf.servicePlanName ? ")" : ""}
                        . This period starts where that one ends.</>
                    ) : (
                      "Extends an earlier invoice for this project. This period starts where that one ends."
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4 py-1">
            <DetailRow label="Subtotal" value={money(invoice.subtotalAmount ?? invoice.totalAmount)} />
            <DetailRow label="Discount" value={`− ${money(invoice.discountAmount)}`} />
            <DetailRow label={`GST (${invoice.gstRate || 0}%)`} value={money(invoice.gstAmount)} />
            <DetailRow label="Total" value={money(invoice.totalAmount)} strong />
            <DetailRow label="Paid" value={money(invoice.paidAmount)} />
            {invoice.orderId && <DetailRow label="Order ID" value={invoice.orderId} />}
            {invoice.paymentId && <DetailRow label="Payment ID" value={invoice.paymentId} />}
            {invoice.proformaNumber && <DetailRow label="From pro-forma" value={invoice.proformaNumber} />}
          </dl>

          <InvoicePaymentsPanel invoice={invoice} canUpdate={canUpdate} canDelete={canDelete} onChanged={onPaymentsChanged} />

          <div ref={editRef} className={`rounded-2xl border bg-white p-4 transition ${editing ? "border-[#27AE60] ring-2 ring-emerald-100" : "border-slate-200"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Payment</p>
              {!editing && (
                <button type="button" onClick={startEdit} className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-[11px] font-semibold text-[#219653] hover:bg-emerald-50">
                  <Pencil size={12} />Edit
                </button>
              )}
            </div>
            {editing ? (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div><p className="mb-1 text-[10px] text-slate-500">Status</p><PaymentStatusSelect value={status} onChange={setStatus} /></div>
                  <div><p className="mb-1 text-[10px] text-slate-500">Method</p><PaymentMethodSelect value={method} onChange={setMethod} /></div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" disabled={saving} onClick={cancelEdit} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600 disabled:opacity-40">Cancel</button>
                  <button type="button" disabled={!dirty || saving} onClick={save} className="flex items-center gap-1.5 rounded-lg bg-[#27AE60] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-40">
                    {saving && <Loader2 size={12} className="animate-spin" />}Save changes
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div><p className="text-[10px] text-slate-400">Status</p><div className="mt-1"><StatusBadge value={invoice.paymentStatus} /></div></div>
                <div><p className="text-[10px] text-slate-400">Method</p><p className="mt-1 font-medium capitalize text-slate-700">{invoice.paymentMethod || "—"}</p></div>
              </div>
            )}
          </div>
        </div>

        {canDelete && (
          <footer className="border-t border-slate-200 bg-white px-4 py-3">
            {confirmDelete ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-red-600">Delete this invoice permanently?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600">Cancel</button>
                  <button type="button" onClick={remove} disabled={deleting} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                    {deleting && <Loader2 size={12} className="animate-spin" />}Delete
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50"><Trash2 size={13} />Delete invoice</button>
            )}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}

export default function BuilderInvoicesPage({ canCreate = false, canUpdate = false, canDelete = false, onCreateInvoice, onOpenProformas }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState({ invoices: [], meta: { total: 0, pages: 1 }, facets: null });
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewing, setViewing] = useState(null);
  const pdfCache = useInvoicePdfCache();
  const facetsRef = useRef(null);
  const q = useDebounced(filters.q.trim());

  useEffect(() => {
    const controller = new AbortController();
    setFetching(true);
    setError("");
    builderPlanService
      .invoicePage({ ...filters, q, page, limit: PAGE_SIZE }, controller.signal)
      .then((result) => {
        if (result.facets) facetsRef.current = result.facets;
        setData({
          invoices: Array.isArray(result.invoices) ? result.invoices : [],
          meta: result.meta || { total: 0, pages: 1 },
          facets: result.facets || facetsRef.current,
        });
        setLoaded(true);
        setFetching(false);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setError(requestError.response?.data?.message || "Unable to load builder invoices");
        setFetching(false);
      });
    return () => controller.abort();
    // `filters.q` is covered by the debounced `q`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filters.paymentStatus, filters.userId, filters.propertyId, filters.planName, filters.state, filters.city, filters.locality, page, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const setFilter = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      const index = LOCATION_LEVELS.indexOf(key);
      if (index >= 0) LOCATION_LEVELS.slice(index + 1).forEach((level) => { next[level] = ""; });
      return next;
    });
    if (key !== "q") setPage(1);
  };
  const onSearch = (value) => {
    setFilters((current) => ({ ...current, q: value }));
    setPage(1);
  };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);

  const openPdf = async (invoice, download = false) => {
    const ready = pdfCache.peek(invoice);
    if (ready && !download) { window.open(ready, "_blank"); return; }
    const popup = download ? null : window.open("", "_blank");
    try {
      const url = ready || await pdfCache.get(invoice);
      if (download) {
        const link = document.createElement("a");
        link.href = url; link.download = `${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link); link.click(); link.remove();
      } else if (popup) popup.location.href = url;
      else window.open(url, "_blank");
    } catch {
      popup?.close();
      toast.error("Unable to load invoice PDF");
    }
  };

  const onSaved = ({ editing: _editing, ...updated }) => {
    setSelected(updated);
    setData((current) => ({ ...current, invoices: current.invoices.map((row) => (row._id === updated._id ? updated : row)) }));
  };
  const onDeleted = () => {
    setSelected(null);
    if (data.invoices.length === 1 && page > 1) setPage(page - 1);
    else reload();
  };

  const facets = data.facets || {};
  const { total = 0, pages = 1 } = data.meta;
  const rangeStart = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const withSelected = (list, value, icon) => (value && !list.some((option) => option.value === value) ? [{ value, label: value, icon, tone: "bg-slate-100 text-slate-500" }, ...list] : list);

  const builderOptions = [{ value: "", label: "All builders", icon: UserRound, tone: "bg-slate-100 text-slate-500" },
    ...withSelected((facets.builders || []).map((option) => ({ ...option, icon: UserRound, tone: "bg-emerald-100 text-emerald-700" })), filters.userId, UserRound)];
  const projectOptions = [{ value: "", label: "All projects", icon: Building2, tone: "bg-slate-100 text-slate-500" },
    ...withSelected((facets.projects || []).map((option) => ({ ...option, icon: Building2, tone: "bg-sky-100 text-sky-700" })), filters.propertyId, Building2)];
  const planOptions = [{ value: "", label: "All plans", icon: Layers, tone: "bg-slate-100 text-slate-500" },
    ...withSelected((facets.plans || []).map((name) => ({ value: name, label: name, icon: Layers, tone: "bg-violet-100 text-violet-700" })), filters.planName, Layers)];
  const locationOptions = (level) => {
    const meta = LOCATION_META[level];
    const values = facets[level] || [];
    const list = filters[level] && !values.includes(filters[level]) ? [filters[level], ...values] : values;
    return [{ value: "", label: meta.all, icon: meta.icon, tone: "bg-slate-100 text-slate-500" },
      ...list.map((value) => ({ value, label: value, icon: meta.icon, tone: meta.tone }))];
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <style>{"@keyframes invoicesFade{from{opacity:0}to{opacity:1}}@keyframes invoicesSlide{from{transform:translateX(100%)}to{transform:none}}@keyframes invoicesBar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}@keyframes invoicesRow{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}"}</style>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-medium text-slate-900">Builder invoices</h1>
            <p className="mt-1 text-[12px] text-slate-500">Click any invoice to see full details.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={reload} disabled={fetching} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-60">
              <RefreshCw size={13} className={fetching ? "animate-spin" : ""} />Refresh
            </button>
            {onOpenProformas && (
              <button type="button" onClick={onOpenProformas} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:text-[#219653]">
                <FileText size={13} />Pro-forma
              </button>
            )}
            {canCreate && (
              <button type="button" onClick={onCreateInvoice} className="flex items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#219653]"><UserPlus size={15} />Create invoice</button>
            )}
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={filters.q} onChange={(event) => onSearch(event.target.value)} placeholder="Search invoice no, builder, phone, email, project, plan…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-[11px] outline-none focus:border-[#27AE60]" />
            </div>
            <BrandSelect size="sm" title="Status" value={filters.paymentStatus} onChange={(value) => setFilter("paymentStatus", value)} options={STATUS_OPTIONS} />
            <BrandSelect size="sm" title="Type" value={filters.invoiceType} onChange={(value) => setFilter("invoiceType", value)} options={TYPE_OPTIONS} />
            <BrandSelect size="sm" searchable title="Plan" value={filters.planName} onChange={(value) => setFilter("planName", value)} options={planOptions} />
            <button type="button" onClick={clearFilters} disabled={!hasFilters} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 hover:bg-slate-50 disabled:opacity-40">Clear filters</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <BrandSelect size="sm" searchable title="Builder" value={filters.userId} onChange={(value) => setFilter("userId", value)} options={builderOptions} />
            <BrandSelect size="sm" searchable title="Project" value={filters.propertyId} onChange={(value) => setFilter("propertyId", value)} options={projectOptions} />
            {LOCATION_LEVELS.map((level) => (
              <BrandSelect key={level} size="sm" searchable title={LOCATION_META[level].title} value={filters[level]} onChange={(value) => setFilter(level, value)} options={locationOptions(level)} />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {fetching && loaded && (
            <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-50">
              <div className="h-full w-1/3 bg-[#27AE60]" style={{ animation: "invoicesBar 1s ease-in-out infinite" }} />
            </div>
          )}
          {error && !loaded ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button type="button" onClick={reload} className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-xs text-[#219653]">Try again</button>
            </div>
          ) : (
            <table className="w-full table-fixed text-left">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="w-[19%] px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Builder</th>
                  <th className="hidden w-[20%] px-4 py-3 font-medium md:table-cell">Project</th>
                  <th className="hidden w-[15%] px-4 py-3 font-medium lg:table-cell">Plan</th>
                  <th className="w-[13%] px-4 py-3 font-medium">Amount</th>
                  <th className="w-[10%] px-4 py-3 font-medium">Status</th>
                  <th className="w-[120px] px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 transition-opacity ${fetching && loaded ? "opacity-60" : ""}`}>
                {!loaded
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        {Array.from({ length: 7 }).map((__, cell) => (
                          <td key={cell} className={`px-4 py-4 ${cell === 2 ? "hidden md:table-cell" : cell === 3 ? "hidden lg:table-cell" : ""}`}>
                            <div className="h-3 animate-pulse rounded bg-slate-100" />
                            <div className="mt-2 h-2 w-2/3 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data.invoices.map((invoice, index) => {
                      const { builder, project, plan } = partsOf(invoice);
                      return (
                        <tr
                          key={invoice._id}
                          onClick={() => setSelected(invoice)}
                          onMouseEnter={() => pdfCache.prefetch(invoice)}
                          style={{ animation: `invoicesRow .2s ease-out ${Math.min(index, 10) * 20}ms both` }}
                          className={`cursor-pointer transition hover:bg-emerald-50/50 ${selected?._id === invoice._id ? "bg-emerald-50/70" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <p className="truncate font-mono text-[10px] font-medium text-slate-800">{invoice.invoiceNumber}</p>
                            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[9px] text-slate-400">
                              <span className="shrink-0">{date(invoice.invoiceDate)}</span>
                              {invoice.renewalOf ? (
                                <span
                                  className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-sky-50 px-1.5 py-px text-[8px] font-semibold uppercase text-sky-700 ring-1 ring-sky-200"
                                  title={invoice.renewalOf?.invoiceNumber ? `Renewal of ${invoice.renewalOf.invoiceNumber}` : "Renewal invoice"}
                                >
                                  <RefreshCw size={8} />Renewal
                                </span>
                              ) : null}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="truncate text-[11px] font-medium text-slate-800">{builder.companyName || builder.name || "—"}</p>
                            <p className="mt-0.5 truncate text-[9px] text-slate-400">{builder.phone || builder.email || "—"}</p>
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <p className="truncate text-[10px] font-medium text-slate-700">{invoice.propertyTitle || project.title || "—"}</p>
                            <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">{invoice.projectCode || project.propertyCode || "—"}</p>
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            <p className="truncate text-[10px] font-medium text-slate-700">{invoice.servicePlanName || plan.title || "—"}</p>
                            <p className="mt-0.5 truncate text-[9px] text-slate-400">{invoice.timePeriod || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[11px] font-semibold text-[#219653]">{money(invoice.totalAmount)}</p>
                            <p className="mt-0.5 text-[9px] text-slate-400">Paid {money(invoice.paidAmount)}</p>
                          </td>
                          <td className="px-4 py-3"><StatusBadge value={invoice.paymentStatus} /></td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                              {canUpdate && <button type="button" onClick={() => setSelected({ ...invoice, editing: true })} title="Edit invoice" className="rounded-lg border border-emerald-200 p-1.5 text-[#27AE60] hover:bg-emerald-50"><Pencil size={13} /></button>}
                              <button type="button" onClick={() => setViewing(invoice)} title="View PDF" className="rounded-lg bg-[#27AE60] p-1.5 text-white shadow-sm hover:bg-[#219653]"><Eye size={13} /></button>
                              <button type="button" onClick={() => openPdf(invoice, true)} title="Download PDF" className="rounded-lg bg-emerald-50 p-1.5 text-[#219653] hover:bg-emerald-100"><Download size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          )}
          {loaded && data.invoices.length === 0 && (
            <div className="py-14 text-center">
              <FileText size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-700">No invoices found</p>
              <p className="mt-1 text-[11px] text-slate-400">{hasFilters ? "Try changing or clearing the filters." : "Create an invoice to see it here."}</p>
            </div>
          )}
          {loaded && error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-[11px] text-red-600">{error}</p>}

          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-[11px] text-slate-500">
              {total ? <>Showing <b className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</b> of <b className="font-medium text-slate-700">{total}</b> invoices</> : "No invoices"}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button type="button" disabled={page <= 1 || fetching} onClick={() => setPage(page - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-30"><ChevronLeft size={14} /></button>
                {pageWindow(page, pages).map((number) => (
                  <button key={number} type="button" disabled={fetching} onClick={() => setPage(number)} className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-medium transition ${number === page ? "bg-[#27AE60] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-[#219653]"}`}>{number}</button>
                ))}
                <button type="button" disabled={page >= pages || fetching} onClick={() => setPage(page + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#219653] disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <InvoiceDetailsDrawer
          key={`${selected._id}:${selected.updatedAt || ""}`}
          invoice={selected}
          canUpdate={canUpdate}
          startEditing={Boolean(selected.editing)}
          canDelete={canDelete}
          onClose={() => setSelected(null)}
          onViewPdf={setViewing}
          onDownload={(invoice) => openPdf(invoice, true)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
      {viewing && (
        <InvoiceViewDrawer invoice={viewing} pdf={pdfCache} onClose={() => setViewing(null)} onOpenPdf={(invoice) => openPdf(invoice)} onDownload={(invoice) => openPdf(invoice, true)} />
      )}
    </div>
  );
}
