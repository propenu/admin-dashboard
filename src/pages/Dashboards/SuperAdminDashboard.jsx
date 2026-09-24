import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSuperAdminDashboard } from "./superAdminDashboard/useSuperAdminDashboard";
import { useDashboardLayoutMode } from "./superAdminDashboard/useDashboardLayoutMode";
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
import { saSurface } from "./superAdminDashboard/dashboardSurface";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dashboard = useSuperAdminDashboard();
  const { isDesktop, isCompact } = useDashboardLayoutMode();
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
    if (!isCompact) return;
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    contentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mobileTab, isCompact]);

  const engagementBlock = (
    <SaEngagementPanel
      engagement={dashboard.engagement}
      rangeLabel={dashboard.rangeLabel}
      isLoading={dashboard.engagementLoading}
      isError={dashboard.engagementError && !dashboard.engagement}
      onRetry={() => dashboard.retrySection?.("engagement")}
      onOpenActivity={() => go("/all-users-activity")}
    />
  );

  const financeBlock = (
    <SaFinancePanel
      paymentDonut={dashboard.paymentDonut}
      planRows={dashboard.planRows}
      summary={dashboard.summary}
      isLoading={dashboard.sectionLoading?.finance}
      onOpenPayments={() => go("/payments-list")}
      onOpenPlans={() => go("/revenue-by-plan")}
    />
  );

  const inventoryBlock = (
    <SaInventoryPanel
      propertyStatus={dashboard.propertyStatus}
      projectStatus={dashboard.projectStatus}
      summary={dashboard.summary}
      isLoading={dashboard.sectionLoading?.inventory}
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
    <div
      className={`mx-auto max-w-[1680px] space-y-3 text-[#0f3d2e] ${
        isCompact
          ? "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]"
          : "pb-6"
      }`}
    >
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
        onOpenStaffFloor={() => go("/dashboard/staff-floor")}
        onOpenClientProgress={() => {
          const href =
            dashboard.followUpTracks?.[0]?.items?.find(
              (i) => i.key === "onboarding_all",
            )?.href || "/follow-up-tracking";
          go(href);
        }}
      />

      {dashboard.sectionError?.summary ||
      dashboard.sectionError?.users ||
      dashboard.sectionError?.inventory ||
      dashboard.sectionError?.leads ||
      dashboard.sectionError?.tickets ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <p>
            {dashboard.sectionError.summary
              ? "Some finance totals could not be refreshed."
              : dashboard.sectionError.users
                ? "User counts could not be refreshed."
                : dashboard.sectionError.inventory
                  ? "Listing or project totals could not be refreshed."
                  : dashboard.sectionError.leads
                    ? "Lead totals could not be refreshed."
                    : "Ticket totals could not be refreshed."}
            {" "}Showing last good values where available.
          </p>
          <button
            type="button"
            onClick={() =>
              dashboard.retrySection(
                dashboard.sectionError.summary
                  ? "finance"
                  : dashboard.sectionError.users
                    ? "users"
                    : dashboard.sectionError.inventory
                      ? "inventory"
                      : dashboard.sectionError.leads
                        ? "leads"
                        : "tickets",
              )
            }
            className="rounded-lg border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-800 hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <SaKpiStrip
        kpis={dashboard.kpis}
        loadingMap={dashboard.kpiLoading}
        activeKey={activeKpi}
        layout={isDesktop ? "desktop" : "compact"}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      {isCompact ? (
        <>
          <div ref={contentTopRef} style={{ scrollMarginTop: "4.75rem" }}>
            <section className={`sa-panel-enter overflow-hidden rounded-2xl ${saSurface}`}>
              <header className="border-b border-emerald-50 bg-[#f7fbf8] px-3.5 py-3 sm:px-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  {activeTabMeta.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-tight text-[#0f3d2e] sm:text-base">
                  {activeTabMeta.hint}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[#5c7d6d] sm:text-[11px]">
                  Use the tabs below to switch sections
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

          <SaMobileSectionTabs active={mobileTab} onChange={setMobileTab} />
        </>
      ) : (
        <div className="space-y-3">
          {engagementBlock}
          <div className="grid grid-cols-1 items-stretch gap-3 min-[1100px]:grid-cols-12">
            <div className="min-h-[320px] min-[1100px]:col-span-5">
              {financeBlock}
            </div>
            <div className="min-h-[320px] min-[1100px]:col-span-4">
              {inventoryBlock}
            </div>
            <div className="min-h-[320px] min-[1100px]:col-span-3">
              {alertsBlock}
            </div>
          </div>
          <div className="min-h-[260px]">{opsBlock}</div>
          {hubBlock}
        </div>
      )}
    </div>
  );
}
