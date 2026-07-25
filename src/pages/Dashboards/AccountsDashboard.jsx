import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAccountsDashboard } from "./accountsDashboard/useAccountsDashboard";
import AcHeader from "./accountsDashboard/components/AcHeader";
import AcKpiStrip from "./accountsDashboard/components/AcKpiStrip";
import AcRevenuePanel from "./accountsDashboard/components/AcRevenuePanel";
import AcPlanPanel from "./accountsDashboard/components/AcPlanPanel";
import AcAlertsPanel from "./accountsDashboard/components/AcAlertsPanel";
import AcPaymentsPanel from "./accountsDashboard/components/AcPaymentsPanel";
import AcSubscriptionsPanel from "./accountsDashboard/components/AcSubscriptionsPanel";
import { formatINR } from "./accountsDashboard/accountsDashboardData";

export default function AccountsDashboard() {
  const navigate = useNavigate();
  const dashboard = useAccountsDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Accounts dashboard refreshed");
  };

  const handleExport = async () => {
    const lines = [
      `Finance Command Center — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Lifetime revenue: ${formatINR(dashboard.summary.totalRevenue)}`,
      `Period revenue: ${formatINR(dashboard.summary.periodRevenue)}`,
      `Today: ${formatINR(dashboard.summary.todayRevenue)}`,
      `Active subscriptions: ${dashboard.summary.activeSubscriptions}`,
      `Failed payments: ${dashboard.summary.failedPayments}`,
      `Success rate: ${dashboard.summary.successRate ?? "N/A"}%`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Finance summary copied");
    } catch {
      toast.error("Unable to copy summary");
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="grid grid-cols-4 gap-2 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[14px] bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 pb-6 text-slate-900">
      <AcHeader
        userName={dashboard.currentUserName}
        rangeLabel={dashboard.rangeLabel}
        refreshedAt={dashboard.refreshedAt}
        preset={dashboard.preset}
        onPresetChange={dashboard.setPreset}
        customFrom={dashboard.customFrom}
        customTo={dashboard.customTo}
        onCustomFromChange={dashboard.setCustomFrom}
        onCustomToChange={dashboard.setCustomTo}
        onApplyCustom={dashboard.applyCustomRange}
        onRefresh={refreshAll}
        isFetching={dashboard.isFetching}
        onOpenPayments={() => navigate("/payments-list")}
        onOpenSubscriptions={() => navigate("/active-subscriptions")}
        onExport={handleExport}
        summary={dashboard.summary}
      />

      <AcKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(key) => {
          setActiveKpi((current) => (current === key ? null : key));
          if (key === "failed" || key === "period" || key === "today" || key === "lifetime") {
            navigate("/payments-list");
          }
          if (key === "subs") navigate("/active-subscriptions");
          if (key === "plans") navigate("/revenue-by-plan");
        }}
      />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[320px] lg:col-span-6">
          <AcRevenuePanel
            trendRows={dashboard.trendRows}
            typeRows={dashboard.typeRows}
            revenueBridge={dashboard.revenueBridge}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-3">
          <AcPlanPanel
            planRows={dashboard.planRows}
            onOpenPlans={() => navigate("/revenue-by-plan")}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-3">
          <AcAlertsPanel alerts={dashboard.alerts} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[280px] lg:col-span-8">
          <AcPaymentsPanel
            payments={dashboard.recentPayments}
            onOpenPayments={() => navigate("/payments-list")}
          />
        </div>
        <div className="min-h-[280px] lg:col-span-4">
          <AcSubscriptionsPanel
            subRows={dashboard.subRows}
            onOpenSubscriptions={() => navigate("/active-subscriptions")}
          />
        </div>
      </div>
    </div>
  );
}
