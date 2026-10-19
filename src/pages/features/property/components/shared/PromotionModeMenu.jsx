import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot, CalendarClock, Hand, Loader2, MousePointerClick, PackageCheck, RefreshCw } from "lucide-react";
import { getProjectPlanStatus } from "../../../../../features/property/propertyService";
import { promotionStatusMeta } from "../../../../../features/builderPlans/planPackage";
import { formatPromotionDate } from "./promotionTracking";

const MENU_WIDTH = 300;

export const planStatusQueryKey = (projectId) => ["project-plan-status", projectId];

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
      className={`flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50/70 opacity-60"
          : current
            ? "border-emerald-300 bg-emerald-50/70 hover:bg-emerald-50"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
      }`}
    >
      <span className={`mt-0.5 rounded-lg p-1.5 ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
          {title}
          {current ? (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-emerald-700">
              Current
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
          {disabledReason || desc}
        </span>
      </span>
    </button>
  );
}

/**
 * Project card "Promote" dropdown: Automatic (plan drives it), One button from plan, or Direct.
 */
export default function PromotionModeMenu({
  anchorRef,
  open,
  onClose,
  projectId,
  busy = false,
  onChooseAuto,
  onChoosePlan,
  onChooseDirect,
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

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
  const planMissing = !plan
    ? "No paid builder plan. Create an invoice in Builder Plans first."
    : plan.mainType === "normal"
      ? `${plan.planName || "This plan"} is listing only (no promotion).`
      : "";
  const notApproved = status && !status.approved ? "Approve the project first." : "";
  const statusMeta = plan ? promotionStatusMeta(plan.promotionStatus) : null;

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
            <p className="text-[12px] font-bold">Promote · how should it run?</p>
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
            <div className="mt-1.5 rounded-lg bg-white/10 px-2 py-1.5 ring-1 ring-white/20">
              <p className="flex items-center gap-1 truncate text-[11px] font-semibold">
                <PackageCheck className="h-3 w-3 shrink-0" />
                {plan.planName || "Builder plan"} · {plan.label}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-50/90">
                <CalendarClock className="h-2.5 w-2.5" />
                {formatPromotionDate(plan.periodStart)} → {formatPromotionDate(plan.periodEnd)}
                {plan.renewals ? ` · ${plan.renewals} renewal${plan.renewals > 1 ? "s" : ""}` : ""}
              </p>
              <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
              {plan.note ? <p className="mt-1 text-[9px] leading-3 text-emerald-50/80">{plan.note}</p> : null}
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-emerald-50/80">
              {isLoading ? "Checking builder plan…" : "No paid builder plan for this project."}
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
                  Could not load the builder plan. Direct still works.
                </p>
              ) : null}
              <Option
                icon={Bot}
                tone="bg-emerald-100 text-emerald-700"
                title="Automatic"
                desc={
                  plan?.needsLocations
                    ? "Plan runs it by itself. First start needs locations (team picks)."
                    : "The plan starts, renews and ends it by itself."
                }
                current={runningMode === "auto" || (!runningMode && savedMode === "auto")}
                disabledReason={isError ? "Plan status unavailable." : planMissing}
                busy={busy}
                onClick={() => onChooseAuto?.(status)}
              />
              <Option
                icon={MousePointerClick}
                tone="bg-sky-100 text-sky-700"
                title="One button from plan"
                desc={
                  plan
                    ? `Start ${plan.label} now. Placement, dates and leads come from the plan.`
                    : "Start the plan's package now."
                }
                current={runningMode === "plan"}
                disabledReason={isError ? "Plan status unavailable." : planMissing || notApproved}
                busy={busy}
                onClick={() => onChoosePlan?.(status)}
              />
              <Option
                icon={Hand}
                tone="bg-amber-100 text-amber-700"
                title="Direct (no plan)"
                desc="Pick placement, locations, dates and leads yourself."
                current={runningMode === "manual" || (!runningMode && savedMode === "manual")}
                busy={busy}
                onClick={() => onChooseDirect?.(status)}
              />
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
