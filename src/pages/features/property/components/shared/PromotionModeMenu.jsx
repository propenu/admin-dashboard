import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarClock,
  FileText,
  FlaskConical,
  Hand,
  Receipt,
  Loader2,
  MousePointerClick,
  PackageCheck,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { getProjectPlanStatus, reuseProjectPlanInvoice } from "../../../../../features/property/propertyService";
import { useAuthUserProfile } from "../../../../../hooks/useAuthUser";
import { canForceManualPromotion } from "../../../../../utils/projectAccessControl";
import { formatPromotionDate } from "./promotionTracking";

const MENU_WIDTH = 300;

export const planStatusQueryKey = (projectId) => ["project-plan-status", projectId];

const INVOICE_BLOCKERS = {
  unpaid: {
    title: "Invoice not paid yet",
    desc: "This project has an invoice, but its payment is not marked as Paid. Mark it as Paid in Invoices, then return here to promote.",
    action: "Open invoices",
  },
  cancelled: {
    title: "Invoice promotion cancelled",
    desc: "The promotion on this paid invoice was cancelled. Promote again with the same invoice, or create a new one.",
    action: "Create new invoice",
    reusable: true,
  },
  expired: {
    title: "Invoice period ended",
    desc: "The latest paid invoice for this project has expired. Renew or create a new invoice to promote again.",
    action: "Create invoice",
  },
  unavailable: {
    title: "Invoice not usable",
    desc: "The latest invoice for this project cannot start a promotion yet. Check it in Invoices.",
    action: "Open invoices",
  },
};

const PAYMENT_TONE = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-700",
};

function Option({ icon: Icon, tone, title, desc, current, disabledReason, busy, onClick }) {
  const disabled = Boolean(disabledReason) || busy;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={disabledReason || undefined}
      className={`flex w-full gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
        disabledReason || desc ? "items-start" : "items-center"
      } ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50/70 opacity-60"
          : current
            ? "border-emerald-300 bg-emerald-50/70 hover:bg-emerald-50"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
      }`}
    >
      <span className={`rounded-lg p-1.5 ${desc || disabledReason ? "mt-0.5" : ""} ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-5 text-slate-800">
          {title}
        </span>
        {disabledReason || desc ? (
          <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{disabledReason || desc}</span>
        ) : null}
      </span>
    </button>
  );
}

/**
 * Project card "Promote" dropdown: same as the invoice plan, or set the promotion yourself.
 */
export default function PromotionModeMenu({
  anchorRef,
  open,
  onClose,
  projectId,
  currentBasis = null,
  builder = null,
  busy = false,
  onChoosePlan,
  onChooseDirect,
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [askInvoice, setAskInvoice] = useState(false);
  if (!open && askInvoice) setAskInvoice(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthUserProfile();
  const canBypassInvoice = canForceManualPromotion(user);

  const reuseMutation = useMutation({
    mutationFn: (invoiceId) => reuseProjectPlanInvoice(projectId, invoiceId),
    onSuccess: (res) => {
      if (res?.data) queryClient.setQueryData(planStatusQueryKey(projectId), res.data);
      queryClient.invalidateQueries({ queryKey: planStatusQueryKey(projectId) });
      toast.success(res?.message || "Invoice is ready to promote again");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Could not reuse the invoice");
    },
  });

  const { data: status, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: planStatusQueryKey(projectId),
    queryFn: () => getProjectPlanStatus(projectId),
    enabled: Boolean(open && projectId),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!open || !anchorRef?.current) return undefined;
    const recalc = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      let left = rect.right - MENU_WIDTH;
      if (left < 8) left = 8;
      if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
      setPos({ top: rect.bottom + window.scrollY + 4, left: left + window.scrollX });
    };
    recalc();
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  const plan = status?.plan || null;
  const runningMode = status?.runningMode || null;
  const savedMode = status?.mode || null;
  const invoiceMissing = !isLoading && !isError && !plan;
  const invoiceRequired =
    invoiceMissing && !canBypassInvoice ? "Invoice required before promotion." : "";
  const planMissing = !plan
    ? canBypassInvoice
      ? ""
      : "Invoice required before promotion."
    : plan.mainType === "normal"
      ? `${plan.planName || "This plan"} is listing only (no promotion).`
      : "";
  const notApproved =
    status && !status.approved && !canBypassInvoice
      ? "Approve the project first."
      : "";
  const latestInvoice = invoiceMissing ? status?.latestInvoice || null : null;
  const askingForInvoice = !canBypassInvoice || askInvoice;
  const invoiceBlock =
    askingForInvoice && latestInvoice
      ? INVOICE_BLOCKERS[latestInvoice.reason] || INVOICE_BLOCKERS.unavailable
      : null;
  const showPromoteOptions = Boolean(plan || isError || canBypassInvoice);
  const createInvoicePath = () => {
    const params = new URLSearchParams({ createInvoice: "1", projectId: String(projectId || "") });
    if (builder?.id) {
      params.set("builderId", String(builder.id));
      if (builder.name) params.set("builderName", builder.name);
    }
    return `/builder-plans?${params.toString()}`;
  };
  const startWithoutInvoice = canBypassInvoice ? (
    <button
      type="button"
      onClick={() => onChooseDirect?.(status, { basis: "invoice" })}
      className="mt-1.5 w-full rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
    >
      Promote now without invoice
    </button>
  ) : null;

  return createPortal(
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />
      <div
        data-action
        onClick={(e) => e.stopPropagation()}
        className="absolute overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        style={{ zIndex: 9999, top: pos.top, left: pos.left, width: MENU_WIDTH, animation: "menuIn 0.12s ease" }}
      >
        <div className="bg-gradient-to-br from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-3 py-2 text-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold">Promote this project</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md bg-white/10 p-1 hover:bg-white/20"
              title="Refresh plan status"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
          {plan ? (
            <div className="mt-1.5 rounded-lg bg-white px-2 py-1.5 text-slate-800 shadow-sm">
              <p className="flex items-center gap-1 truncate text-[11px] font-semibold">
                <PackageCheck className="h-3 w-3 shrink-0 text-[#27AE60]" />
                {plan.planName || plan.label || "Builder plan"}
                {plan.label && plan.planName && plan.label.trim().toLowerCase() !== plan.planName.trim().toLowerCase()
                  ? ` · ${plan.label}`
                  : ""}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                <CalendarClock className="h-2.5 w-2.5 text-slate-400" />
                {formatPromotionDate(plan.periodStart)} → {formatPromotionDate(plan.periodEnd)}
                {plan.renewals ? ` · ${plan.renewals} renewal${plan.renewals > 1 ? "s" : ""}` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-emerald-50/80">
              {isLoading
                ? "Checking invoice…"
                : latestInvoice
                  ? `Invoice ${latestInvoice.invoiceNumber} found · ${latestInvoice.paymentStatus}`
                  : "No invoice for this project."}
            </p>
          )}
        </div>

        <div className="space-y-1.5 p-2">
          {isLoading ? (
            <p className="flex items-center justify-center gap-2 py-4 text-[11px] text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </p>
          ) : (
            <>
              {isError ? (
                <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800">
                  Could not check the invoice. Refresh and try again.
                </p>
              ) : null}
              {invoiceBlock ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                    <FileText className="h-3.5 w-3.5" /> {invoiceBlock.title}
                  </p>
                  <div className="mt-1.5 rounded-lg bg-white px-2 py-1.5 ring-1 ring-amber-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-semibold text-slate-800">
                        {latestInvoice.invoiceNumber}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          PAYMENT_TONE[latestInvoice.paymentStatus] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {latestInvoice.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {latestInvoice.planName ? `${latestInvoice.planName} · ` : ""}
                      {formatPromotionDate(latestInvoice.startDate)} → {formatPromotionDate(latestInvoice.endDate)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-amber-800">{invoiceBlock.desc}</p>
                  {invoiceBlock.reusable ? (
                    <button
                      type="button"
                      disabled={reuseMutation.isPending}
                      onClick={() => reuseMutation.mutate(latestInvoice.invoiceId)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#27AE60] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-60"
                    >
                      {reuseMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      Use this invoice again
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      navigate(invoiceBlock.action === "Open invoices" ? "/builder-plans?view=invoices" : createInvoicePath());
                    }}
                    className={`mt-1.5 w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                      invoiceBlock.reusable
                        ? "border border-[#27AE60] bg-white text-[#27AE60] hover:bg-emerald-50"
                        : "bg-[#27AE60] text-white hover:bg-[#219653]"
                    }`}
                  >
                    {invoiceBlock.action}
                  </button>
                  {startWithoutInvoice}
                </div>
              ) : invoiceMissing && askingForInvoice ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                    <FileText className="h-3.5 w-3.5" /> {canBypassInvoice ? "Create an invoice first?" : "Invoice required"}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-amber-800">
                    This project has no invoice. Create one for {builder?.name || "the builder"}, mark it as Paid,
                    and the promotion runs with the invoice&apos;s placement, locations, lead visibility and dates.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      navigate(createInvoicePath());
                    }}
                    className="mt-2 w-full rounded-lg bg-[#27AE60] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#219653]"
                  >
                    Create invoice
                  </button>
                  {startWithoutInvoice}
                </div>
              ) : null}
              {invoiceMissing && canBypassInvoice && !askInvoice ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
                  <p className="text-[11px] font-semibold text-emerald-900">
                    Choose how to start
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-emerald-800">
                    Invoice-based runs from the builder&apos;s paid invoice. Demo is a free trial with no invoice.
                  </p>
                </div>
              ) : null}
              {showPromoteOptions ? (
                <>
                  {(plan || isError) && !canBypassInvoice ? (
                    <Option
                      icon={MousePointerClick}
                      tone="bg-emerald-100 text-emerald-700"
                      title="Use existing plan"
                      current={runningMode === "plan" || runningMode === "auto" || (!runningMode && savedMode === "auto")}
                      disabledReason={isError ? "Plan status unavailable." : planMissing || notApproved}
                      busy={busy}
                      onClick={() => onChoosePlan?.(status)}
                    />
                  ) : null}
                  {canBypassInvoice ? (
                    <>
                      {!askInvoice ? (
                        <Option
                          icon={Receipt}
                          tone="bg-emerald-100 text-emerald-700"
                          title="Invoice-based promotion"
                          current={
                            Boolean(runningMode) && currentBasis !== "demo"
                          }
                          disabledReason={isError ? "Invoice status unavailable." : plan ? planMissing : ""}
                          busy={busy}
                          onClick={() => (plan ? onChoosePlan?.(status) : setAskInvoice(true))}
                        />
                      ) : null}
                      <Option
                        icon={FlaskConical}
                        tone="bg-orange-100 text-orange-700"
                        title="Demo promotion"
                        current={currentBasis === "demo"}
                        busy={busy}
                        onClick={() => onChooseDirect?.(status, { basis: "demo" })}
                      />
                    </>
                  ) : (
                    <Option
                      icon={Hand}
                      tone="bg-amber-100 text-amber-700"
                      title="Customize promotion"
                      current={runningMode === "manual" || (!runningMode && savedMode === "manual")}
                      disabledReason={isError ? "Invoice status unavailable." : invoiceRequired}
                      busy={busy}
                      onClick={() => onChooseDirect?.(status, { basis: "invoice" })}
                    />
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
