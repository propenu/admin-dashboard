import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { builderPlanService } from "../../../features/builderPlans/builderPlanService";
import { Empty, Skel, fmtDate } from "./shared";
import Pager from "./Pager";

const PROJECT_PAGE = 12;
const INVOICE_PAGE = 12;
const DAY_MS = 86_400_000;

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const STATE_META = {
  active: { label: "Active", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  scheduled: { label: "Scheduled", tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  expired: { label: "Expired", tone: "bg-slate-100 text-slate-500 ring-slate-200" },
  pending: { label: "Payment pending", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  none: { label: "No subscription", tone: "bg-slate-50 text-slate-500 ring-slate-200" },
  loading: { label: "Loading…", tone: "bg-slate-50 text-slate-400 ring-slate-200" },
};

const PAYMENT_TONE = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  partial: "bg-blue-50 text-blue-700 ring-blue-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
};

const PROMOTION_COPY = {
  running: "Running",
  scheduled: "Queued",
  ended: "Ended",
  cancelled: "Cancelled",
  waiting_payment: "Waiting payment",
  waiting_team: "Waiting for team",
  waiting_approval: "Waiting approval",
  not_started: "Not started",
};

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const daysBetween = (from, to) => Math.max(0, Math.ceil((new Date(to) - new Date(from)) / DAY_MS));

async function openInvoicePdf(invoice) {
  const tab = window.open("", "_blank");
  try {
    const blob = await builderPlanService.invoicePdf(invoice._id);
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    tab?.close();
    toast.error("Could not open the invoice PDF");
  }
}

function Stat({ label, value, tone, onClick, hint }) {
  const body = (
    <>
      <p className="flex items-center justify-between gap-1 text-[9px] font-bold uppercase tracking-wider opacity-70">
        {label}
        {onClick ? <ChevronRight size={11} /> : null}
      </p>
      <p className="mt-0.5 text-[17px] font-extrabold tracking-tight">{value}</p>
    </>
  );
  const base = `min-w-[96px] flex-1 rounded-xl px-3 py-2.5 ring-1 ${tone}`;
  if (!onClick) return <div className={base}>{body}</div>;
  return (
    <button type="button" onClick={onClick} title={hint} className={`${base} text-left transition hover:shadow-sm hover:brightness-[.97]`}>
      {body}
    </button>
  );
}

function ProjectInvoices({ userId, projectId, onPageChange }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["builder-subscription-invoices", userId, projectId, page],
    queryFn: ({ signal }) =>
      builderPlanService.invoicePage({ userId, propertyId: projectId, page, limit: INVOICE_PAGE, facets: "0" }, signal),
    enabled: Boolean(userId && projectId),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const invoices = query.data?.invoices || [];
  const total = Number(query.data?.meta?.total) || 0;
  const pages = Math.max(1, Number(query.data?.meta?.pages) || 1);
  const changePage = (next) => {
    setPage(next);
    onPageChange?.();
  };

  if (query.isLoading) {
    return (
      <div className="space-y-2 px-3 pb-3">
        {[1, 2].map((key) => <Skel key={key} h="54px" radius="10px" />)}
      </div>
    );
  }
  if (query.isError) {
    return <p className="mx-3 mb-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">Could not load invoices.</p>;
  }
  if (!invoices.length) {
    return <p className="mx-3 mb-3 rounded-lg bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-500">No invoices created for this project yet.</p>;
  }

  return (
    <div className="px-3 pb-3">
      <ol className={`relative space-y-2 border-l border-dashed border-slate-200 pl-4 transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}>
        {invoices.map((invoice, index) => (
          <InvoiceItem key={invoice._id} invoice={invoice} serial={(page - 1) * INVOICE_PAGE + index + 1} />
        ))}
      </ol>
      <div className="mt-3 border-t border-slate-100 pt-2.5">
        <Pager
          page={page}
          pages={pages}
          total={total}
          pageSize={INVOICE_PAGE}
          onChange={changePage}
          loading={query.isFetching}
          noun={total === 1 ? "invoice" : "invoices"}
          compact
        />
      </div>
    </div>
  );
}

/** One invoice in a timeline; `showProject` adds the project name for builder-wide lists. */
function InvoiceItem({ invoice, showProject = false, serial }) {
  const now = Date.now();
  const start = invoice.startDate ? new Date(invoice.startDate).getTime() : null;
  const end = invoice.endDate ? new Date(invoice.endDate).getTime() : null;
  const live = invoice.paymentStatus === "paid" && invoice.promotionStatus !== "cancelled";
  const runningNow = live && start && end && start <= now && end > now;
  return (
    <li className="relative">
      <span
        className={`absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
          runningNow ? "bg-[#27AE60]" : invoice.renewalOf ? "bg-sky-400" : "bg-slate-300"
        }`}
      />
      <div className="rounded-xl border border-slate-100 bg-white p-2.5">
        {showProject ? (
          <p className="mb-1 flex items-center gap-1 truncate text-[10px] font-semibold text-[#219653]">
            <Building2 size={10} />
            {invoice.propertyTitle || "Project"}
            {invoice.projectCode ? <span className="font-mono text-slate-400">· {invoice.projectCode}</span> : null}
          </p>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-800">
              {serial ? <span className="font-mono text-[10px] font-semibold text-slate-400">#{serial}</span> : null}
              {invoice.servicePlanName || "Builder plan"}
              {invoice.renewalOf ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-1.5 py-px text-[8px] font-bold uppercase text-sky-700 ring-1 ring-sky-200">
                  <RefreshCw size={8} />Renewal
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[8px] font-bold uppercase text-emerald-700 ring-1 ring-emerald-200">
                  New
                </span>
              )}
              {runningNow ? (
                <span className="rounded-full bg-[#27AE60] px-1.5 py-px text-[8px] font-bold uppercase text-white">Current</span>
              ) : null}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
              {invoice.invoiceNumber} · {fmtDate(invoice.invoiceDate)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ring-1 ${PAYMENT_TONE[invoice.paymentStatus] || PAYMENT_TONE.pending}`}>
              {invoice.paymentStatus}
            </span>
            <span className="text-[12px] font-extrabold text-slate-800">{money(invoice.totalAmount)}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={11} className="text-slate-400" />
            {fmtDate(invoice.startDate)} → {fmtDate(invoice.endDate)}
            {start && end ? ` · ${daysBetween(start, end)} days` : ""}
            {runningNow ? ` · ${daysBetween(now, end)} left` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            {PROMOTION_COPY[invoice.promotionStatus] ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                {PROMOTION_COPY[invoice.promotionStatus]}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => openInvoicePdf(invoice)}
              className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 hover:bg-sky-100"
            >
              <Eye size={10} />PDF
            </button>
          </span>
        </div>
        {invoice.renewalOf?.invoiceNumber ? (
          <p className="mt-1 text-[9px] text-sky-700">Renews {invoice.renewalOf.invoiceNumber}</p>
        ) : null}
      </div>
    </li>
  );
}

const ALL_INVOICES_PAGE = 12;
const INVOICE_TYPE_TABS = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "renewal", label: "Renewal" },
];
const PAYMENT_TABS = [
  { key: "", label: "Any payment" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "partial", label: "Partial" },
  { key: "failed", label: "Failed" },
];

function FilterChips({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.key || "all"}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 transition ${
            value === item.key
              ? "bg-[#27AE60] text-white ring-[#27AE60]"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/** Right-side drawer: every invoice created for this builder, newest first, paged on the server. */
function AllInvoicesDrawer({ userId, onClose, initialType = "" }) {
  const [page, setPage] = useState(1);
  const [invoiceType, setInvoiceType] = useState(initialType);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["builder-all-invoices", userId, page, invoiceType, paymentStatus],
    queryFn: ({ signal }) =>
      builderPlanService.invoicePage(
        { userId, page, limit: ALL_INVOICES_PAGE, invoiceType, paymentStatus, facets: "0" },
        signal,
      ),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const invoices = data?.invoices || [];
  const total = Number(data?.meta?.total) || 0;
  const pages = Math.max(1, Number(data?.meta?.pages) || 1);
  const bodyRef = useRef(null);

  const goToPage = (next) => {
    setPage(next);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="flex h-dvh w-[min(100vw,560px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
        <header className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100">Builder invoices</p>
              <h2 className="mt-0.5 text-lg font-semibold">
                {invoiceType === "renewal" ? "Renewal invoices" : invoiceType === "new" ? "New invoices" : "All invoices"}
              </h2>
              <p className="text-[11px] text-emerald-50/90">
                {isLoading ? "Loading…" : `${total} invoice${total === 1 ? "" : "s"} · newest first`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => refetch()} title="Refresh" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25">
                <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
              </button>
              <button type="button" onClick={onClose} title="Close" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25">
                <X size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3">
          <FilterChips
            items={INVOICE_TYPE_TABS}
            value={invoiceType}
            onChange={(value) => {
              setInvoiceType(value);
              goToPage(1);
            }}
          />
          <FilterChips
            items={PAYMENT_TABS}
            value={paymentStatus}
            onChange={(value) => {
              setPaymentStatus(value);
              goToPage(1);
            }}
          />
        </div>

        <div ref={bodyRef} className={`flex-1 overflow-y-auto p-4 transition-opacity ${isFetching && !isLoading ? "opacity-70" : ""}`}>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((key) => <Skel key={key} h="70px" radius="12px" />)}
            </div>
          ) : isError ? (
            <div className="rounded-xl bg-red-50 p-4 text-center text-[12px] text-red-600">
              Could not load invoices.
              <button type="button" onClick={() => refetch()} className="ml-2 font-semibold underline">Try again</button>
            </div>
          ) : invoices.length === 0 ? (
            <Empty msg="No invoices match these filters" icon="🧾" />
          ) : (
            <ol className="relative space-y-2 border-l border-dashed border-slate-200 pl-4">
              {invoices.map((invoice, index) => (
                <InvoiceItem
                  key={invoice._id}
                  invoice={invoice}
                  serial={(page - 1) * ALL_INVOICES_PAGE + index + 1}
                  showProject
                />
              ))}
            </ol>
          )}
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3">
          <Pager
            page={page}
            pages={pages}
            total={total}
            pageSize={ALL_INVOICES_PAGE}
            onChange={goToPage}
            loading={isFetching}
            noun={total === 1 ? "invoice" : "invoices"}
          />
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function ProjectThumb({ src, title }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#27AE60]">
        <Building2 size={18} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
    />
  );
}

function ProjectRow({ project, open, onToggle }) {
  const state = STATE_META[project.state] || STATE_META.pending;
  const daysLeft = project.state === "active" && project.lastEnd ? daysBetween(Date.now(), project.lastEnd) : null;
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white transition ${open ? "border-emerald-200 shadow-sm" : "border-slate-200"}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 p-3 text-left hover:bg-slate-50/60">
        <ProjectThumb src={project.image} title={project.title} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[13px] font-bold text-slate-900">{project.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${state.tone}`}>{state.label}</span>
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-slate-500">
            {project.code ? `${project.code} · ` : ""}
            {project.location ? `${project.location} · ` : ""}
            {project.currentPlan || project.latestPlan || "Builder plan"}
          </span>
          <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={11} className="text-slate-400" />
              {project.firstStart ? `${fmtDate(project.firstStart)} → ${fmtDate(project.lastEnd)}` : "Not started"}
            </span>
            {daysLeft !== null ? (
              <span className={`font-semibold ${daysLeft <= 7 ? "text-red-600" : "text-[#219653]"}`}>{daysLeft} days left</span>
            ) : null}
            <span><b className="text-slate-700">{project.invoices}</b> invoice{project.invoices === 1 ? "" : "s"}</span>
            <span><b className="text-sky-700">{project.renewals}</b> renewal{project.renewals === 1 ? "" : "s"}</span>
            {project.pending ? <span className="text-amber-700"><b>{project.pending}</b> unpaid</span> : null}
            <span>Paid <b className="text-slate-700">{money(project.paidTotal)}</b></span>
          </span>
        </span>
        <ChevronRight size={16} className={`mt-1 shrink-0 transition ${open ? "text-[#27AE60]" : "text-slate-400"}`} />
      </button>
    </div>
  );
}

function DrawerFact({ label, value, tone = "text-slate-800" }) {
  return (
    <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-100">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[13px] font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

/** Right-side drawer: one project's subscription summary and full invoice timeline. */
function ProjectDrawer({ userId, project, onClose, loading = false }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const state = STATE_META[project.state] || STATE_META.pending;
  const daysLeft = project.state === "active" && project.lastEnd ? daysBetween(Date.now(), project.lastEnd) : null;
  const invoicesRef = useRef(null);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="flex h-dvh w-[min(100vw,560px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
        <header className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <ProjectThumb src={project.image} title={project.title} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100">Project subscription</p>
                <h2 className="mt-0.5 truncate text-lg font-semibold">{project.title}</h2>
                <p className="truncate text-[11px] text-emerald-50/90">
                  {[project.code, project.location].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} title="Close" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {project.currentPlan ? "Current plan" : "Latest plan"}
                </p>
                <p className="mt-0.5 text-[15px] font-bold text-slate-900">
                  {project.currentPlan || project.latestPlan || "Builder plan"}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <CalendarDays size={12} className="text-slate-400" />
                  {project.firstStart ? `${fmtDate(project.firstStart)} → ${fmtDate(project.lastEnd)}` : "Not started"}
                </p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${state.tone}`}>{state.label}</span>
                {daysLeft !== null ? (
                  <p className={`mt-1.5 text-[11px] font-bold ${daysLeft <= 7 ? "text-red-600" : "text-[#219653]"}`}>
                    {daysLeft} days left
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DrawerFact label="Invoices" value={loading ? "…" : project.invoices} />
            <DrawerFact label="Renewals" value={loading ? "…" : project.renewals} tone="text-sky-700" />
            <DrawerFact label="Unpaid" value={loading ? "…" : project.pending || 0} tone={project.pending ? "text-amber-700" : "text-slate-800"} />
            <DrawerFact label="Paid" value={loading ? "…" : money(project.paidTotal)} tone="text-[#219653]" />
          </div>

          <div ref={invoicesRef} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white pt-3">
            <p className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <FileText size={11} /> Invoices & renewals
            </p>
            <ProjectInvoices
              userId={userId}
              projectId={project.projectId}
              onPageChange={() => invoicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

const METHOD_LABEL = { razorpay: "Razorpay", upi: "UPI", card: "Card", netbanking: "Net banking", cheque: "Cheque", cash: "Cash", other: "Other" };
const monthLabel = (key) => new Date(`${key}-01T00:00:00Z`).toLocaleString("en-IN", { month: "short", timeZone: "UTC" });

function CalcRow({ label, value, sign = "", strong = false, tone = "text-slate-700" }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-[12px] ${strong ? "border-t border-dashed border-slate-200 pt-2 font-extrabold" : ""}`}>
      <span className={strong ? "text-slate-900" : "text-slate-500"}>{label}</span>
      <span className={`${tone} ${strong ? "text-[14px]" : "font-semibold"}`}>
        {sign}
        {money(value)}
      </span>
    </div>
  );
}

const SHARE_PAGE = 12;

function ShareList({ title, rows, total, renderLabel, noun = "rows" }) {
  const [page, setPage] = useState(1);
  if (!rows?.length) return null;
  const pages = Math.max(1, Math.ceil(rows.length / SHARE_PAGE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * SHARE_PAGE, current * SHARE_PAGE);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <ul className="space-y-2">
        {visible.map((row, index) => {
          const pct = total > 0 ? Math.round((row.paid / total) * 100) : 0;
          return (
            <li key={(current - 1) * SHARE_PAGE + index}>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="min-w-0 truncate font-semibold text-slate-700">{renderLabel(row)}</span>
                <span className="shrink-0 font-bold text-slate-800">
                  {money(row.paid)} <span className="font-medium text-slate-400">· {pct}%</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#27AE60]" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      {pages > 1 ? (
        <div className="mt-3 border-t border-slate-100 pt-2.5">
          <Pager page={current} pages={pages} total={rows.length} pageSize={SHARE_PAGE} onChange={setPage} noun={noun} compact />
        </div>
      ) : null}
    </div>
  );
}

/** Right-side drawer: how the builder's total paid amount adds up. */
function SpendDrawer({ userId, onClose }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["builder-spend-summary", userId],
    queryFn: ({ signal }) => builderPlanService.builderSpendSummary(userId, signal),
    enabled: Boolean(userId),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const t = data?.totals || {};
  const paidInvoices = (t.subtotal || 0) - (t.discount || 0) + (t.gst || 0);
  const otherReceived = (t.paid || 0) - paidInvoices;
  const months = data?.byMonth || [];
  const maxMonth = Math.max(1, ...months.map((m) => m.paid));
  const statusOf = (key) => (data?.byStatus || []).find((row) => row.status === key) || { count: 0, amount: 0 };
  const newPct = t.paid > 0 ? Math.round(((t.newPaid || 0) / t.paid) * 100) : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="flex h-dvh w-[min(100vw,560px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl">
        <header className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100">Total spent</p>
              <h2 className="mt-0.5 text-2xl font-bold tracking-tight">{isLoading ? "…" : money(t.paid)}</h2>
              <p className="text-[11px] text-emerald-50/90">
                {t.firstPaidAt ? `${fmtDate(t.firstPaidAt)} → ${fmtDate(t.lastPaidAt)}` : "No payments yet"} · {t.invoices || 0} invoices
              </p>
            </div>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => refetch()} title="Refresh" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25">
                <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
              </button>
              <button type="button" onClick={onClose} title="Close" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25">
                <X size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading ? (
            [1, 2, 3].map((key) => <Skel key={key} h="120px" radius="16px" />)
          ) : isError ? (
            <div className="rounded-xl bg-red-50 p-4 text-center text-[12px] text-red-600">
              Could not load the spend summary.
              <button type="button" onClick={() => refetch()} className="ml-2 font-semibold underline">Try again</button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">How it adds up</p>
                <CalcRow label={`Plan amount (${statusOf("paid").count} paid invoices)`} value={t.subtotal} />
                {t.discount ? <CalcRow label="Discount" value={t.discount} sign="− " tone="text-red-600" /> : null}
                <CalcRow label="GST" value={t.gst} sign="+ " />
                {otherReceived > 0 ? (
                  <CalcRow label="Partial payments received" value={otherReceived} sign="+ " tone="text-blue-700" />
                ) : null}
                <CalcRow label="Total paid" value={t.paid} strong tone="text-[#219653]" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <DrawerFact label="Invoiced" value={money(t.invoiced)} />
                <DrawerFact label="Outstanding" value={money(t.outstanding)} tone={t.outstanding ? "text-amber-700" : "text-slate-800"} />
                <DrawerFact
                  label="Unpaid invoices"
                  value={statusOf("pending").count + statusOf("partial").count}
                  tone={statusOf("pending").count + statusOf("partial").count ? "text-amber-700" : "text-slate-800"}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">New vs renewal</p>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-[#27AE60]" style={{ width: `${newPct}%` }} />
                  <div className="h-full bg-sky-400" style={{ width: `${t.paid > 0 ? 100 - newPct : 0}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#27AE60]" />New <b className="text-slate-800">{money(t.newPaid)}</b>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />Renewal <b className="text-slate-800">{money(t.renewalPaid)}</b>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Last 12 months</p>
                <div className="flex h-28 items-end gap-1">
                  {months.map((m) => (
                    <div key={m.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${monthLabel(m.month)}: ${money(m.paid)} · ${m.invoices} invoices`}>
                      <div
                        className={`w-full rounded-t ${m.paid ? "bg-[#27AE60] group-hover:bg-[#219653]" : "bg-slate-100"}`}
                        style={{ height: `${m.paid ? Math.max(6, (m.paid / maxMonth) * 100) : 4}%` }}
                      />
                      <span className="text-[8px] text-slate-400">{monthLabel(m.month)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ShareList
                title="By project"
                noun="projects"
                rows={data?.byProject}
                total={t.paid}
                renderLabel={(row) => `${row.title}${row.code ? ` · ${row.code}` : ""}`}
              />
              <ShareList title="By plan" noun="plans" rows={data?.byPlan} total={t.paid} renderLabel={(row) => row.plan} />
              <ShareList
                title="By payment method"
                noun="methods"
                rows={data?.byMethod}
                total={t.paid}
                renderLabel={(row) => METHOD_LABEL[row.method] || row.method}
              />
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

/** Same drawer opened from a project card: loads that one project's subscription summary by id. */
export function ProjectSubscriptionDrawer({ userId, project, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["builder-subscription-project", userId, project.projectId],
    queryFn: ({ signal }) =>
      builderPlanService.builderSubscriptionProjects(userId, { projectId: project.projectId, limit: 1 }, signal),
    enabled: Boolean(userId && project.projectId),
    staleTime: 30_000,
  });

  const summary = data?.projects?.[0];
  const merged = summary
    ? { ...project, ...summary, image: summary.image || project.image, location: summary.location || project.location }
    : { invoices: 0, renewals: 0, pending: 0, paidTotal: 0, state: isLoading ? "loading" : "none", ...project };

  return <ProjectDrawer userId={userId} project={merged} onClose={onClose} loading={isLoading} />;
}

/** Builder "Subscriptions" tab: every invoice created for this builder, grouped project-wise. */
export default function BuilderSubscriptionsSection({ userId, onOpenProjects }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openProject, setOpenProject] = useState(null);
  const [invoicesView, setInvoicesView] = useState(null);
  const [spendOpen, setSpendOpen] = useState(false);
  const closeSpend = useCallback(() => setSpendOpen(false), []);
  const closeDrawer = useCallback(() => setOpenProject(null), []);
  const closeInvoices = useCallback(() => setInvoicesView(null), []);
  const q = useDebounced(search.trim());

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["builder-subscription-projects", "v3", userId, page, q],
    queryFn: ({ signal }) => builderPlanService.builderSubscriptionProjects(userId, { page, limit: PROJECT_PAGE, q }, signal),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const totals = data?.totals || {};
  const projects = data?.projects || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Stat
          label="Projects"
          value={totals.projects ?? "—"}
          tone="bg-emerald-50/60 text-emerald-800 ring-emerald-100"
          onClick={onOpenProjects}
          hint="Show all projects"
        />
        <Stat
          label="Invoices"
          value={totals.invoices ?? "—"}
          tone="bg-slate-50 text-slate-700 ring-slate-200"
          onClick={() => setInvoicesView({ type: "" })}
          hint="Show all invoices"
        />
        <Stat
          label="Renewals"
          value={totals.renewals ?? "—"}
          tone="bg-sky-50 text-sky-700 ring-sky-100"
          onClick={() => setInvoicesView({ type: "renewal" })}
          hint="Show renewal invoices"
        />
        <Stat
          label="Paid"
          value={totals.paidTotal != null ? money(totals.paidTotal) : "—"}
          tone="bg-violet-50 text-violet-700 ring-violet-100"
          onClick={() => setSpendOpen(true)}
          hint="Show how the total adds up"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search project name or code"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] outline-none focus:border-[#27AE60]"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          title="Refresh"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((key) => <Skel key={key} h="86px" radius="16px" />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-[12px] text-red-600">
          Could not load subscriptions.
          <button type="button" onClick={() => refetch()} className="ml-2 font-semibold underline">Try again</button>
        </div>
      ) : projects.length === 0 ? (
        <Empty msg={q ? "No project matches this search" : "No subscriptions created for this builder yet"} icon="📦" />
      ) : (
        <div className={`space-y-2 transition-opacity ${isFetching ? "opacity-70" : ""}`}>
          {projects.map((project) => (
            <ProjectRow
              key={project.projectId}
              project={project}
              open={openProject?.projectId === project.projectId}
              onToggle={() => setOpenProject(project)}
            />
          ))}
        </div>
      )}

      {openProject ? (
        <ProjectDrawer userId={userId} project={openProject} onClose={closeDrawer} />
      ) : null}
      {spendOpen ? <SpendDrawer userId={userId} onClose={closeSpend} /> : null}
      {invoicesView ? (
        <AllInvoicesDrawer
          key={invoicesView.type || "all"}
          userId={userId}
          initialType={invoicesView.type}
          onClose={closeInvoices}
        />
      ) : null}

      {!isLoading && !isError ? (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Pager
            page={page}
            pages={meta.pages}
            total={meta.total}
            pageSize={PROJECT_PAGE}
            onChange={setPage}
            loading={isFetching}
            noun={meta.total === 1 ? "project" : "projects"}
          />
        </div>
      ) : null}

      <p className="flex items-center gap-1 text-[10px] text-slate-400">
        <FileText size={10} /> Click a project to open its invoices, dates and renewals on the right.
      </p>
    </div>
  );
}
