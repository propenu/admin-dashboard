import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hourglass,
  Inbox,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { followUpTrackHref } from "../../superAdminDashboard/superAdminDashboardData";
import SupportMetricCard from "../../customerSupportTeamLeadDashboard/commandOverview/SupportMetricCard";
import CshCommandOverviewHeader from "./CshCommandOverviewHeader";
import TlPodsPanel from "./TlPodsPanel";
import HeadLeadershipPanel from "./HeadLeadershipPanel";
import TlPodDetailDrawer from "./TlPodDetailDrawer";
import {
  mapCshCommandOverviewData,
  readLastOpsReport,
  writeLastOpsReport,
} from "./mapCshCommandOverviewData";
import { downloadOpsReportPdf } from "./downloadOpsReportPdf";

export default function CshCommandOverview({
  dashboard,
  clientProgress,
  activeTab,
  onTabChange,
  onOpenDirectory,
  onViewTickets,
  navigate,
  onRefresh,
  isFetching,
  headName,
  /** full = desktop; home = mobile metrics+pods; focus = leadership only */
  layout = "full",
}) {
  const [lastOpsReport, setLastOpsReport] = useState(() => readLastOpsReport());
  const [submitting, setSubmitting] = useState(false);
  const [selectedPod, setSelectedPod] = useState(null);

  const overview = useMemo(
    () =>
      mapCshCommandOverviewData({
        summary: dashboard.summary || {},
        journey: clientProgress.report?.journey || {},
        byExecutive: clientProgress.report?.byExecutive || [],
        teamMembers: dashboard.teamMembers || [],
        inventory: clientProgress.report?.inventory || {},
        performanceWeek: dashboard.performanceWeek || [],
        lastOpsReport,
      }),
    [
      clientProgress.report,
      dashboard.performanceWeek,
      dashboard.summary,
      dashboard.teamMembers,
      lastOpsReport,
    ],
  );

  const loading =
    (dashboard.isLoading || clientProgress.isLoading) && !(overview.tlPods || []).length;

  const periodRange = useMemo(
    () => ({
      from: dashboard.range?.from || "",
      to: dashboard.range?.to || "",
      preset: dashboard.preset,
    }),
    [dashboard.preset, dashboard.range?.from, dashboard.range?.to],
  );

  useEffect(() => {
    setSelectedPod(null);
  }, [periodRange.from, periodRange.to, periodRange.preset]);

  const openTrack = (trackKey, extras = {}) => {
    navigate(
      followUpTrackHref(trackKey, periodRange, {
        preset: dashboard.preset,
        ...extras,
      }),
    );
  };

  const openQueue = (extras = {}) => openTrack("onboarding_all", extras);

  const viewTickets = (tab = "open", pod = null) => {
    onViewTickets?.(pod, tab);
  };

  const handleRefresh = async () => {
    if (isFetching) return;
    await onRefresh?.();
  };

  const handleSendOpsReport = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await downloadOpsReportPdf({
        overview,
        rangeLabel: dashboard.rangeLabel,
        headName,
      });
      const payload = {
        submittedAt: new Date().toISOString(),
        submittedBy: headName || "Support Head",
      };
      writeLastOpsReport(payload);
      setLastOpsReport(payload);
      toast.success("Ops report PDF downloaded");
    } catch {
      toast.error("Unable to download Ops report PDF");
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemClick = (item) => {
    if (!item?.available) return;
    if (item.hrefKind === "directory") {
      onOpenDirectory?.();
      return;
    }
    if (item.hrefKind === "stuck_location") {
      openTrack("stuck_location");
      return;
    }
    if (item.hrefKind === "tickets_unassigned") {
      viewTickets("unassigned");
      return;
    }
    if (item.hrefKind === "tickets_overdue") {
      viewTickets("overdue");
    }
  };

  const kpis = [
    {
      id: "open",
      label: "Open tickets",
      value: overview.summary.openTickets,
      icon: Inbox,
      tone: "emerald",
      accent: "emerald",
      hint: `${dashboard.rangeLabel || "Period"} · Department open`,
      onClick: () => viewTickets("open"),
    },
    {
      id: "unassigned",
      label: "Unassigned",
      value: overview.summary.unassignedTickets,
      icon: ClipboardList,
      tone: overview.summary.unassignedTickets > 0 ? "orange" : "emerald",
      accent: "amber",
      hint: "Need assignment across pods",
      onClick: () => viewTickets("unassigned"),
    },
    {
      id: "sla",
      label: "SLA risk",
      value: overview.summary.slaRisk,
      icon: AlertTriangle,
      tone: overview.summary.slaRisk > 0 ? "orange" : "emerald",
      accent: "orange",
      hint: "Past-due tickets",
      onClick: () => viewTickets("overdue"),
    },
    {
      id: "assigned",
      label: "Assigned",
      value: overview.summary.assigned,
      icon: ClipboardList,
      tone: "emerald",
      accent: "violet",
      hint: "CCE process · Assigned",
      onClick: () => openTrack("process_assigned"),
    },
    {
      id: "inProgress",
      label: "In progress",
      value: overview.summary.inProgress,
      icon: Hourglass,
      tone: "emerald",
      accent: "sky",
      hint: "CCE process · In progress",
      onClick: () => openTrack("process_in_progress"),
    },
    {
      id: "completed",
      label: "Completed",
      value: overview.summary.completed,
      icon: CheckCircle2,
      tone: "emerald",
      accent: "teal",
      hint: "CCE process · Completed",
      onClick: () => openTrack("process_completed"),
    },
    {
      id: "tls",
      label: "Team Leads",
      value: overview.summary.activeTeamLeads,
      icon: Users,
      tone: "emerald",
      accent: "blue",
      hint: "Active / listed Team Leads",
      onClick: () => onOpenDirectory?.(),
    },
    {
      id: "ops",
      label: "Ops focus",
      value: overview.summary.pendingOpsReports,
      icon: FileText,
      tone: overview.summary.pendingOpsReports > 0 ? "orange" : "emerald",
      accent: "amber",
      hint: "Actionable items for Ops report",
      onClick: () =>
        document.getElementById("csh-ops-report")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
    },
  ];

  return (
    <div className={`space-y-2.5 sm:space-y-3 ${layout !== "full" ? "csh-mobile-compact" : ""}`}>
      {layout !== "focus" ? (
        <CshCommandOverviewHeader
          rangeLabel={dashboard.rangeLabel}
          preset={dashboard.preset}
          onPresetChange={dashboard.setPreset}
          onOpenQueue={openQueue}
          onRefresh={handleRefresh}
          isFetching={isFetching}
          activeTab={activeTab}
          onTabChange={onTabChange}
          compact={layout === "home"}
        />
      ) : null}

      {layout !== "focus" ? (
        <section
          aria-label="Department metrics"
          className={
            layout === "home"
              ? "grid w-full grid-cols-2 gap-2"
              : "grid w-full grid-cols-2 gap-1.5 min-[480px]:grid-cols-4 lg:grid-cols-8 lg:gap-2"
          }
        >
          {kpis.map((kpi) => (
            <SupportMetricCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              tone={kpi.tone}
              accent={kpi.accent}
              hint={kpi.hint}
              spark={overview.spark}
              onClick={kpi.onClick}
              loading={loading}
              size={layout === "home" ? "lead" : "default"}
            />
          ))}
        </section>
      ) : null}

      {layout === "focus" ? (
        <div className="min-w-0" id="csh-ops-report">
          <HeadLeadershipPanel
            leadershipPack={overview.leadershipPack}
            workflow={overview.workflow}
            onSendOpsReport={handleSendOpsReport}
            onItemClick={handleItemClick}
            submitting={submitting}
          />
        </div>
      ) : null}

      {layout === "home" ? (
        <div className="min-w-0" id="csh-tl-pods">
          <TlPodsPanel
            pods={overview.tlPods}
            journeyMix={overview.journeyMix}
            journeyTotal={overview.journeyTotal}
            rangeLabel={dashboard.rangeLabel}
            onOpenDirectory={onOpenDirectory}
            onSelectPod={setSelectedPod}
            onJourneyClick={(item) => item?.track && openTrack(item.track)}
            selectedPodId={selectedPod?.id}
            loading={loading}
          />
        </div>
      ) : null}

      {layout === "full" ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
          <div className="min-w-0 lg:col-span-7" id="csh-tl-pods">
            <TlPodsPanel
              pods={overview.tlPods}
              journeyMix={overview.journeyMix}
              journeyTotal={overview.journeyTotal}
              rangeLabel={dashboard.rangeLabel}
              onOpenDirectory={onOpenDirectory}
              onSelectPod={setSelectedPod}
              onJourneyClick={(item) => item?.track && openTrack(item.track)}
              selectedPodId={selectedPod?.id}
              loading={loading}
            />
          </div>
          <div className="min-w-0 lg:col-span-5" id="csh-ops-report">
            <HeadLeadershipPanel
              leadershipPack={overview.leadershipPack}
              workflow={overview.workflow}
              onSendOpsReport={handleSendOpsReport}
              onItemClick={handleItemClick}
              submitting={submitting}
            />
          </div>
        </div>
      ) : null}

      <TlPodDetailDrawer
        open={Boolean(selectedPod)}
        pod={selectedPod}
        onClose={() => setSelectedPod(null)}
        onOpenClientProgress={(pod) => {
          setSelectedPod(null);
          const ids = (pod?.cceIds || []).filter(Boolean);
          openQueue(
            ids.length
              ? {
                  assigneeIds: ids.join(","),
                  assigneeName: pod?.name || "Team Lead pod",
                }
              : {},
          );
        }}
        onOpenTickets={(pod) => {
          setSelectedPod(null);
          viewTickets("open", pod);
        }}
        onOpenDirectory={() => {
          setSelectedPod(null);
          onOpenDirectory?.();
        }}
      />
    </div>
  );
}
