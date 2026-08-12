import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSalesExecutiveHub } from "./useSalesExecutiveHub";
import {
  clientId,
  meetingMatchesClient,
} from "./salesExecutiveHubData";
import SeHubHeader from "./components/SeHubHeader";
import SeHubClientRail from "./components/SeHubClientRail";
import SeHubWorkspace from "./components/SeHubWorkspace";
import SeHubRightRail from "./components/SeHubRightRail";

/**
 * Sales Executive Hub — client location search, meeting history/results,
 * properties/projects, subscription, and follow-ups (matches SE Hub UX).
 */
export default function SalesExecutiveHub() {
  const navigate = useNavigate();
  const hub = useSalesExecutiveHub();

  const lastMeetingMap = useMemo(() => {
    const map = {};
    (hub.clients || []).forEach((client) => {
      const id = clientId(client);
      if (!id) return;
      const match = (hub.meetings || [])
        .filter((m) => meetingMatchesClient(m, client))
        .sort(
          (a, b) =>
            new Date(b.scheduledStart || b.punchOutAt || b.updatedAt || 0).getTime() -
            new Date(a.scheduledStart || a.punchOutAt || a.updatedAt || 0).getTime(),
        )[0];
      if (match) map[id] = match;
    });
    return map;
  }, [hub.clients, hub.meetings]);

  const followUpClientIds = useMemo(() => {
    const ids = new Set();
    (hub.clients || []).forEach((client) => {
      const id = clientId(client);
      if (!id) return;
      if ((hub.allFollowUps || []).some((m) => meetingMatchesClient(m, client))) {
        ids.add(id);
      }
    });
    return ids;
  }, [hub.clients, hub.allFollowUps]);

  const refreshAll = async () => {
    await hub.refetch();
    toast.success("Dashboard refreshed");
  };

  const openProperty = (property) => {
    const id = String(property?._id || property?.id || "").trim();
    if (!id) return toast.error("Property id missing");
    const category = String(
      property?._category || property?.category || "residential",
    )
      .trim()
      .toLowerCase();
    const allowed = new Set(["residential", "commercial", "land", "agricultural"]);
    navigate(`/property/${allowed.has(category) ? category : "residential"}/${id}`);
  };

  const openProject = (project) => {
    const id = String(project?._id || project?.id || "").trim();
    if (!id) return toast.error("Project id missing");
    navigate(`/featured-project/${id}`);
  };

  if (hub.isLoading && !(hub.clients || []).length) {
    return (
      <div className="grid min-h-[320px] place-items-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="-m-3 flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col gap-3 overflow-x-hidden p-3 sm:-m-4 sm:p-4 lg:-m-6 lg:p-4 xl:p-5">
      <SeHubHeader
        userName={hub.currentUserName}
        summary={hub.hubSummary}
        preset={hub.preset}
        onPresetChange={hub.setPreset}
        customFrom={hub.customFrom}
        customTo={hub.customTo}
        onCustomFromChange={hub.setCustomFrom}
        onCustomToChange={hub.setCustomTo}
        onApplyCustom={hub.applyCustomRange}
        onRefresh={refreshAll}
        isFetching={hub.isFetching}
        onNewMeeting={() => navigate("/field-meetings")}
        onOpenFieldMeetings={() => navigate("/field-meetings")}
        onOpenFollowUp={() => navigate("/follow-up-tracking")}
      />

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:h-[clamp(560px,calc(100dvh-300px),900px)] lg:min-h-[560px] lg:grid-cols-[minmax(260px,0.95fr)_minmax(0,1.45fr)_minmax(250px,0.9fr)] lg:overflow-hidden">
        <div className="flex min-h-[380px] min-w-0 flex-col max-lg:max-h-[520px] lg:h-full lg:min-h-0">
          <SeHubClientRail
            clients={hub.filteredClients}
            selectedClientId={hub.selectedClientId}
            onSelect={hub.setSelectedClientId}
            searchQuery={hub.searchQuery}
            onSearchChange={hub.setSearchQuery}
            locationFilters={hub.locationFilters}
            onLocationFilter={hub.setLocationFilter}
            locationOptions={hub.locationOptions}
            lastMeetingByClientId={lastMeetingMap}
            followUpClientIds={followUpClientIds}
          />
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-col lg:h-full lg:min-h-0">
          <SeHubWorkspace
            client={hub.selectedClient}
            clientTab={hub.clientTab}
            onTabChange={hub.setClientTab}
            stats={hub.clientStats}
            meetings={hub.clientMeetings}
            properties={hub.clientProperties}
            projects={hub.clientProjects}
            subscription={hub.clientSubscription}
            followUps={hub.clientFollowUps}
            loadingDetail={hub.clientDetailLoading}
            onScheduleMeeting={() => navigate("/field-meetings")}
            onOpenFieldMeetings={() => navigate("/field-meetings")}
            onOpenFollowUp={() => navigate("/follow-up-tracking")}
            onOpenProperty={openProperty}
            onOpenProject={openProject}
          />
        </div>

        <div className="flex min-h-[360px] min-w-0 flex-col max-lg:max-h-[640px] lg:h-full lg:min-h-0">
          <SeHubRightRail
            followUps={hub.allFollowUps}
            propertyCounts={hub.clientStats.propertyCounts}
            projectCounts={hub.clientStats.projectCounts}
            subscription={hub.clientSubscription}
            onOpenFollowUp={() => navigate("/follow-up-tracking")}
            onOpenFieldMeetings={() => navigate("/field-meetings")}
          />
        </div>
      </div>
    </div>
  );
}
