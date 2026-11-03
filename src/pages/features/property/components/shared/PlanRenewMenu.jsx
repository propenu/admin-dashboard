import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarClock, CopyPlus, FilePlus2, FileText, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { getProjectPlanStatus, renewProjectWithInvoice } from "../../../../../features/property/propertyService";
import { builderPlanService } from "../../../../../features/builderPlans/builderPlanService";
import { planStatusQueryKey } from "./PromotionModeMenu";
import { formatPromotionDate } from "./promotionTracking";

const MENU_WIDTH = 300;

const STATUS_COPY = {
  cancelled: "Cancelled",
  not_started: "Not used",
  waiting_team: "Not used",
  waiting_approval: "Not used",
  scheduled: "Scheduled",
};

const PAST_STATE = {
  ended: "Ended",
  cancelled: "Cancelled",
  running: "Running",
  scheduled: "Scheduled",
};

const PAYMENT_METHODS = [
  ["upi", "UPI"],
  ["cash", "Cash"],
  ["card", "Card"],
  ["netbanking", "Net banking"],
  ["cheque", "Cheque"],
  ["razorpay", "Razorpay"],
];

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/**
 * Project card "Renew" dropdown for plan promotions: reuse a paid invoice of this
 * project (its unused time starts when the current plan ends) or create a new invoice.
 */
export default function PlanRenewMenu({ anchorRef, open, onClose, projectId, onRenewed }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: status, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: planStatusQueryKey(projectId),
    queryFn: () => getProjectPlanStatus(projectId),
    enabled: Boolean(open && projectId),
    staleTime: 15_000,
  });

  const renewMutation = useMutation({
    mutationFn: (invoiceId) => renewProjectWithInvoice(projectId, invoiceId),
    onSuccess: (res) => {
      if (res?.data) queryClient.setQueryData(planStatusQueryKey(projectId), res.data);
      queryClient.invalidateQueries({ queryKey: planStatusQueryKey(projectId) });
      toast.success(res?.message || "Renewal saved");
      onRenewed?.();
      onClose?.();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not renew with this invoice"),
  });

  const [renewFrom, setRenewFrom] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const copyMutation = useMutation({
    mutationFn: async (invoiceId) => {
      const res = await builderPlanService.renewInvoice(invoiceId, { paymentStatus, paymentMethod });
      await builderPlanService.syncProjectPromotion(projectId);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: planStatusQueryKey(projectId) });
      toast.success(
        paymentStatus === "paid"
          ? `${res?.invoice?.invoiceNumber || "Renewal invoice"} created. The plan extends on its own.`
          : `${res?.invoice?.invoiceNumber || "Renewal invoice"} created as Pending. Mark it Paid to extend the plan.`,
      );
      setRenewFrom(null);
      onRenewed?.();
      onClose?.();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not create the renewal invoice"),
  });

  useEffect(() => {
    if (!open || !anchorRef?.current) return undefined;
    const recalc = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      let left = rect.left;
      if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8;
      if (left < 8) left = 8;
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

  const renewal = status?.renewal || null;
  const candidates = renewal?.candidates || [];
  const pastInvoices = renewal?.pastInvoices || [];
  const endsAt = renewal?.endsAt || status?.plan?.periodEnd || null;

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
            <p className="text-[12px] font-bold">Renew plan</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md bg-white/10 p-1 hover:bg-white/20"
              title="Refresh"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-50/90">
            <CalendarClock className="h-2.5 w-2.5" />
            {endsAt ? `Current plan ends ${formatPromotionDate(endsAt, true)}` : "No plan running"}
            {renewal?.queuedRenewals
              ? ` · ${renewal.queuedRenewals} renewal${renewal.queuedRenewals > 1 ? "s" : ""} queued`
              : ""}
          </p>
        </div>

        <div className="space-y-2 p-2">
          {isLoading ? (
            <p className="flex items-center justify-center gap-2 py-4 text-[11px] text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </p>
          ) : (
            <>
              {isError ? (
                <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800">
                  Could not load invoices. Refresh and try again.
                </p>
              ) : null}

              <div>
                <p className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Use unused days
                </p>
                {candidates.length ? (
                  <div className="custom-scrollbar max-h-[200px] space-y-1.5 overflow-y-auto">
                    {candidates.map((inv) => {
                      const busy = renewMutation.isPending && renewMutation.variables === inv.invoiceId;
                      return (
                        <div
                          key={inv.invoiceId}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2"
                        >
                          <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
                            <FileText className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-semibold text-slate-800">
                              {inv.planName || "Builder plan"}
                            </span>
                            <span className="block truncate text-[10px] text-slate-500">
                              {inv.invoiceNumber} · {inv.remainingDays} day{inv.remainingDays > 1 ? "s" : ""} left
                              {STATUS_COPY[inv.promotionStatus] ? ` · ${STATUS_COPY[inv.promotionStatus]}` : ""}
                            </span>
                          </span>
                          <button
                            type="button"
                            disabled={renewMutation.isPending}
                            onClick={() => renewMutation.mutate(inv.invoiceId)}
                            className="flex shrink-0 items-center gap-1 rounded-lg bg-[#27AE60] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#219653] disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                            Use
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-500">
                    No other paid invoice with unused days for this project.
                  </p>
                )}
              </div>

              {pastInvoices.length ? (
                <div>
                  <p className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Renew from old invoice
                  </p>
                  <div className="custom-scrollbar max-h-[240px] space-y-1.5 overflow-y-auto">
                    {pastInvoices.map((inv) => {
                      const expanded = renewFrom === inv.invoiceId;
                      return (
                        <div key={inv.invoiceId} className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-sky-100 p-1.5 text-sky-700">
                              <CopyPlus className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-semibold text-slate-800">
                                {inv.planName || "Builder plan"}
                              </span>
                              <span className="block truncate text-[10px] text-slate-500">
                                {inv.invoiceNumber} · {money(inv.totalAmount)}
                                {inv.timePeriod ? ` · ${inv.timePeriod}` : ""}
                                {PAST_STATE[inv.state] ? ` · ${PAST_STATE[inv.state]}` : ""}
                              </span>
                            </span>
                            <button
                              type="button"
                              disabled={copyMutation.isPending}
                              onClick={() => setRenewFrom(expanded ? null : inv.invoiceId)}
                              className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold disabled:opacity-60 ${
                                expanded
                                  ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  : "bg-[#27AE60] text-white hover:bg-[#219653]"
                              }`}
                            >
                              {expanded ? "Close" : "Renew"}
                            </button>
                          </div>
                          {expanded ? (
                            <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                              <p className="text-[10px] text-slate-500">
                                A new invoice with the same plan and amount is created. It starts when the current plan ends.
                              </p>
                              <div className="flex gap-1">
                                {[
                                  ["paid", "Paid"],
                                  ["pending", "Pending"],
                                ].map(([value, label]) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setPaymentStatus(value)}
                                    className={`flex-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                                      paymentStatus === value
                                        ? "border-[#27AE60] bg-emerald-50 text-[#219653]"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none focus:border-[#27AE60]"
                              >
                                {PAYMENT_METHODS.map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                disabled={copyMutation.isPending}
                                onClick={() => copyMutation.mutate(inv.invoiceId)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#27AE60] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#219653] disabled:opacity-60"
                              >
                                {copyMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CopyPlus className="h-3 w-3" />}
                                Create renewal invoice
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  navigate("/builder-plans");
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#27AE60] bg-white px-2 py-2 text-[11px] font-semibold text-[#27AE60] hover:bg-emerald-50"
              >
                <FilePlus2 className="h-3.5 w-3.5" /> Create new invoice
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
