import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Hourglass,
  AlertTriangle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { followUpTrackHref } from "../../superAdminDashboard/superAdminDashboardData";
import CommandOverviewHeader from "./CommandOverviewHeader";
import SupportMetricCard from "./SupportMetricCard";
import StaffPerformancePanel from "./StaffPerformancePanel";
import EscalationPanel from "./EscalationPanel";
import CceWorkDetailDrawer from "./CceWorkDetailDrawer";
import {
  buildHeadReportText,
  mapCommandOverviewData,
  readLastHeadReport,
  writeLastHeadReport,
} from "./mapCommandOverviewData";

export default function CommandOverview({
  dashboard,
  clientProgress,
  activeTab,
  onTabChange,
  onOpenDirectory,
  onViewCceTickets,
  onManageCceTerritories,
  navigate,
  onRefresh,
  isFetching,
  leadName,
}) {
  const [lastReport, setLastReport] = useState(() => readLastHeadReport());
  const [submitting, setSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const overview = useMemo(
    () =>
      mapCommandOverviewData({
        summary: dashboard.summary || {},
        journey: clientProgress.report?.journey || {},
        byExecutive: clientProgress.report?.byExecutive || [],
        teamMembers: dashboard.teamMembers || [],
        inventory: clientProgress.report?.inventory || {},
        performanceWeek: dashboard.performanceWeek || [],
        lastReport,
      }),
    [clientProgress.report, dashboard.performanceWeek, dashboard.summary, dashboard.teamMembers, lastReport],
  );

  const loading =
    (dashboard.isLoading || clientProgress.isLoading) &&
    !(overview.staffPerformance || []).length;

  const periodRange = useMemo(
    () => ({
      from: dashboard.range?.from || "",
      to: dashboard.range?.to || "",
      preset: dashboard.preset,
    }),
    [dashboard.preset, dashboard.range?.from, dashboard.range?.to],
  );

  useEffect(() => {
    setSelectedStaff(null);
  }, [periodRange.from, periodRange.to, periodRange.preset]);

  const openTrack = (trackKey, extras = {}) => {
    navigate(
      followUpTrackHref(trackKey, periodRange, {
        preset: dashboard.preset,
        ...extras,
      }),
    );
  };

  const openQueue = () => openTrack("onboarding_all");

  const handleRefresh = async () => {
    if (isFetching) return;
    await onRefresh?.();
  };

  const handleSendReport = async () => {
    if (submitting) return;
    const ok = window.confirm(
      "Copy this Team Lead operational report for Support Head? (clipboard — paste into chat/email)",
    );
    if (!ok) return;
    setSubmitting(true);
    try {
      const text = buildHeadReportText({
        overview,
        rangeLabel: dashboard.rangeLabel,
        leadName,
      });
      await navigator.clipboard.writeText(text);
      const payload = {
        submittedAt: new Date().toISOString(),
        submittedBy: leadName || "Team Lead",
      };
      writeLastHeadReport(payload);
      setLastReport(payload);
      toast.success("Report copied for Support Head");
    } catch {
      toast.error("Unable to prepare head report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenClientProgress = (staff) => {
    if (!staff?.id) return;
    openTrack("onboarding_all", {
      assigneeId: staff.id,
      assigneeName: staff.name,
    });
  };

  const handleOpenTickets = (staff) => {
    setSelectedStaff(null);
    onViewCceTickets?.(staff);
  };

  const handleManageTerritories = (staff) => {
    setSelectedStaff(null);
    onManageCceTerritories?.(staff);
  };

  const handleJourneyClick = (item) => {
    if (!item?.track) return;
    openTrack(item.track);
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
      onViewCceTickets?.(null);
      document.getElementById("tl-ticket-queue")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (item.hrefKind === "tickets_overdue") {
      document.getElementById("tl-ticket-queue")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const kpis = [
    {
      id: "assigned",
      label: "Assigned",
      value: overview.summary.assigned,
      icon: ClipboardList,
      tone: "emerald",
      hint: `${dashboard.rangeLabel || "Period"} · CCE process Assigned`,
      onClick: () => openTrack("process_assigned"),
    },
    {
      id: "inProgress",
      label: "In progress",
      value: overview.summary.inProgress,
      icon: Hourglass,
      tone: "emerald",
      hint: `${dashboard.rangeLabel || "Period"} · CCE In progress`,
      onClick: () => openTrack("process_in_progress"),
    },
    {
      id: "completed",
      label: "Completed",
      value: overview.summary.completed,
      icon: CheckCircle2,
      tone: "emerald",
      hint: `${dashboard.rangeLabel || "Period"} · CCE completed`,
      onClick: () => openTrack("process_completed"),
    },
    {
      id: "sla",
      label: "SLA risk",
      value: overview.summary.slaRisk,
      icon: AlertTriangle,
      tone: "orange",
      hint: `${dashboard.rangeLabel || "Period"} · Past-due tickets`,
      onClick: () =>
        document.getElementById("tl-ticket-queue")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
    },
    {
      id: "cce",
      label: "Active CCE",
      value: overview.summary.activeCCE,
      icon: Users,
      tone: "emerald",
      hint: "Online / active executives in pod",
      onClick: () => onOpenDirectory?.(),
    },
    {
      id: "pending",
      label: "Pending head report",
      value: overview.summary.pendingHeadReports,
      icon: FileText,
      tone: overview.summary.pendingHeadReports > 0 ? "orange" : "emerald",
      hint: "Actionable items not yet sent to Support Head",
      onClick: () =>
        document.getElementById("tl-head-report")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
    },
  ];

  return (
    <div className="space-y-3">
      <CommandOverviewHeader
        rangeLabel={dashboard.rangeLabel}
        preset={dashboard.preset}
        onPresetChange={dashboard.setPreset}
        onOpenQueue={openQueue}
        onRefresh={handleRefresh}
        isFetching={isFetching}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/*
        Use lg (1024) not xl (1280): at 100% zoom on 1366/1440 laptops with sidebar,
        xl never hits — layout looked “broken” vs 80% zoom.
      */}
      <section
        aria-label="Live pod metrics"
        className="grid w-full grid-cols-2 gap-1.5 min-[480px]:grid-cols-3 lg:grid-cols-6 lg:gap-2"
      >
        {kpis.map((kpi) => (
          <SupportMetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            tone={kpi.tone}
            hint={kpi.hint}
            spark={overview.spark}
            onClick={kpi.onClick}
            loading={loading}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-w-0 lg:col-span-7" id="tl-staff-analysis">
          <StaffPerformancePanel
            staff={overview.staffPerformance}
            journeyMix={overview.journeyMix}
            journeyTotal={overview.journeyTotal}
            rangeLabel={dashboard.rangeLabel}
            onOpenDirectory={onOpenDirectory}
            onSelectStaff={setSelectedStaff}
            onJourneyClick={handleJourneyClick}
            selectedStaffId={selectedStaff?.id}
            loading={loading}
          />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <EscalationPanel
            reportPack={overview.reportPack}
            workflow={overview.workflow}
            onSendReport={handleSendReport}
            onItemClick={handleItemClick}
            submitting={submitting}
          />
        </div>
      </div>

      <CceWorkDetailDrawer
        open={Boolean(selectedStaff)}
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
        onOpenClientProgress={handleOpenClientProgress}
        onOpenTickets={handleOpenTickets}
        onManageTerritories={handleManageTerritories}
      />
    </div>
  );
}
