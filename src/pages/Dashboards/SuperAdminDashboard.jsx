import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSuperAdminDashboard } from "./superAdminDashboard/useSuperAdminDashboard";
import SaHeader from "./superAdminDashboard/components/SaHeader";
import SaKpiStrip from "./superAdminDashboard/components/SaKpiStrip";
import SaFinancePanel from "./superAdminDashboard/components/SaFinancePanel";
import SaInventoryPanel from "./superAdminDashboard/components/SaInventoryPanel";
import SaAlertsPanel from "./superAdminDashboard/components/SaAlertsPanel";
import SaOpsPanel from "./superAdminDashboard/components/SaOpsPanel";
import SaEngagementPanel from "./superAdminDashboard/components/SaEngagementPanel";
import SaModuleGrid from "./superAdminDashboard/components/SaModuleGrid";
import SaMobileSectionTabs, {
  TABS,
} from "./superAdminDashboard/components/SaMobileSectionTabs";
import { formatINR } from "./superAdminDashboard/superAdminDashboardData";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dashboard = useSuperAdminDashboard();
  const [activeKpi, setActiveKpi] = useState(null);
  const [mobileTab, setMobileTab] = useState("overview");
  const contentTopRef = useRef(null);
  const skipScrollRef = useRef(true);

  const go = (href) => {
    if (href) navigate(href);
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Platform dashboard refreshed");
  };

  const handleExport = async () => {
    const s = dashboard.summary;
    const lines = [
      `Super Admin — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Period revenue: ${formatINR(s.periodRevenue ?? s.totalRevenue)}`,
      `Lifetime revenue: ${formatINR(s.lifetimeRevenue ?? s.totalRevenue)}`,
      `Today revenue: ${formatINR(s.todayRevenue)}`,
      `New users (period): ${s.usersInPeriod ?? 0}`,
      `Platform users: ${s.platformUsers}`,
      `Listings (period): ${s.propertyCounts?.total || 0}`,
      `Projects (period): ${s.projectCounts?.total || 0}`,
      `Leads (period): ${s.totalLeads}`,
      `Open tickets: ${s.openTickets}`,
      `Active subscriptions: ${s.activeSubs}`,
      `Failed payments (period): ${s.failedPayCount}`,
      `Published blogs (period): ${s.publishedBlogs}`,
      `Website/app clicks: ${dashboard.engagement?.summary?.clicks ?? 0}`,
      `Total actions: ${dashboard.engagement?.summary?.actions ?? 0}`,
      `Views: ${dashboard.engagement?.summary?.views ?? 0}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Executive platform summary copied");
    } catch {
      toast.error("Unable to copy summary");
    }
  };

  const openProperties = () => {
    const from = dashboard.range?.from;
    const to = dashboard.range?.to;
    const qs = new URLSearchParams();
    if (from) qs.set("createdFrom", from);
    if (to) qs.set("createdTo", to);
    go(qs.toString() ? `/properties?${qs}` : "/properties");
  };

  const openProjects = () => {
    const from = dashboard.range?.from;
    const to = dashboard.range?.to;
    const qs = new URLSearchParams();
    if (from) qs.set("createdFrom", from);
    if (to) qs.set("createdTo", to);
    go(qs.toString() ? `/projects?${qs}` : "/projects");
  };

  const activeTabMeta = TABS.find((t) => t.key === mobileTab) || TABS[0];

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    // On tab click: bring section content to the top (above sticky bottom tabs)
    contentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mobileTab]);

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3 pb-24 xl:pb-6">
        <div className="h-20 animate-pulse rounded-2xl bg-emerald-50" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-emerald-50" />
          ))}
        </div>
      </div>
    );
  }

  const engagementBlock = (
    <SaEngagementPanel
      engagement={dashboard.engagement}
      rangeLabel={dashboard.rangeLabel}
      isLoading={dashboard.engagementLoading}
      isError={dashboard.engagementError && !dashboard.engagement}
      onOpenActivity={() => go("/all-users-activity")}
    />
  );

  const financeBlock = (
    <SaFinancePanel
      paymentDonut={dashboard.paymentDonut}
      planRows={dashboard.planRows}
      summary={dashboard.summary}
      onOpenPayments={() => go("/payments-list")}
      onOpenPlans={() => go("/revenue-by-plan")}
    />
  );

  const inventoryBlock = (
    <SaInventoryPanel
      propertyStatus={dashboard.propertyStatus}
      projectStatus={dashboard.projectStatus}
      summary={dashboard.summary}
      onOpenProperties={openProperties}
      onOpenProjects={openProjects}
    />
  );

  const alertsBlock = (
    <SaAlertsPanel alerts={dashboard.alerts} onOpen={go} />
  );

  const opsBlock = (
    <SaOpsPanel
      leadSourceRows={dashboard.leadSourceRows}
      ticketStatusRows={dashboard.ticketStatusRows}
      roleRows={dashboard.roleRows}
      summary={dashboard.summary}
      onOpenLeads={() => go("/leads")}
      onOpenTickets={() => go("/tickets")}
      onOpenUsers={() => go("/users?filter=onboarding")}
    />
  );

  const hubBlock = <SaModuleGrid modules={dashboard.modules} onOpen={go} />;

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-slate-900 xl:pb-6">
      <SaHeader
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
        onExport={handleExport}
        summary={dashboard.summary}
        onOpenClientProgress={() => {
          const href =
            dashboard.followUpTracks?.[0]?.items?.find(
              (i) => i.key === "onboarding_all",
            )?.href || "/follow-up-tracking";
          go(href);
        }}
      />

      <SaKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      {/* Content ABOVE sticky bottom tabs (mobile + tablet) */}
      <div className="xl:hidden" ref={contentTopRef} style={{ scrollMarginTop: "4.75rem" }}>
        <section className="sa-panel-enter overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 via-white to-lime-50/40 shadow-[0_12px_40px_rgba(16,185,129,0.14)] ring-1 ring-emerald-100">
          <header className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 px-3.5 py-3 text-white sm:px-4">
            <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl sa-orb" />
            <span className="pointer-events-none absolute -bottom-10 left-10 h-20 w-20 rounded-full bg-lime-200/30 blur-2xl sa-orb-delay" />
            <p className="relative text-sm font-black tracking-tight sm:text-base">
              {activeTabMeta.label}
            </p>
            <p className="relative mt-0.5 text-[10px] font-medium text-emerald-50 sm:text-[11px]">
              {activeTabMeta.hint} · swipe tabs below to switch
            </p>
          </header>

          <div
            key={mobileTab}
            role="tabpanel"
            className="sa-tab-content min-h-[16rem] space-y-3 p-2.5 sm:min-h-[20rem] sm:p-3 md:min-h-[22rem] md:p-4"
          >
            {mobileTab === "overview" ? (
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                <div className="md:col-span-2">{engagementBlock}</div>
                <div>{alertsBlock}</div>
                <div>{inventoryBlock}</div>
              </div>
            ) : null}
            {mobileTab === "finance" ? (
              <div className="md:mx-auto md:max-w-3xl">{financeBlock}</div>
            ) : null}
            {mobileTab === "ops" ? opsBlock : null}
            {mobileTab === "hub" ? hubBlock : null}
          </div>
        </section>
      </div>

      {/* Sticky bottom tabs — phone & tablet */}
      <SaMobileSectionTabs active={mobileTab} onChange={setMobileTab} />

      {/* Desktop xl+ full layout */}
      <div className="hidden space-y-3 xl:block">
        {engagementBlock}
        <div className="grid gap-3 xl:grid-cols-12 xl:items-stretch">
          <div className="min-h-[320px] xl:col-span-5">{financeBlock}</div>
          <div className="min-h-[320px] xl:col-span-4">{inventoryBlock}</div>
          <div className="min-h-[320px] xl:col-span-3">{alertsBlock}</div>
        </div>
        <div className="min-h-[260px]">{opsBlock}</div>
        {hubBlock}
      </div>
    </div>
  );
}
