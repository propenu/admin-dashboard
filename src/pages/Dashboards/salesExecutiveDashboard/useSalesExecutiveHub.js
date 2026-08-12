import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSeClients,
  getUserDetails,
} from "../../../features/user/userService";
import {
  getUserFeaturedProjects,
  getUserPayments,
  getUserProperties,
  getUserSubscriptions,
} from "../../../features/user/userDetailService";
import { listFieldMeetings } from "../../../features/fieldMeetings/fieldMeetingService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import {
  clientId,
  clientLocation,
  countByBucket,
  dedupeById,
  filterClients,
  HUB_DATE_PRESETS,
  isFollowUpOpen,
  isMeetingToday,
  meetingMatchesClient,
  pickItems,
  subscriptionSummary,
  uniqueSorted,
} from "./salesExecutiveHubData";

const PROPERTY_CATEGORIES = ["residential", "commercial", "land", "agricultural"];
const PROJECT_TYPES = ["featured", "prime", "normal", "sponsored"];

const getUserId = (user) =>
  String(user?._id || user?.id || user?.userId || "").trim();

async function loadUserInventory(userId) {
  if (!userId) return { properties: [], projects: [] };
  const [propertyChunks, projectChunks] = await Promise.all([
    Promise.all(
      PROPERTY_CATEGORIES.map((category) =>
        getUserProperties(userId, category, 1, 80)
          .then((res) =>
            pickItems(res.data).map((item) => ({ ...item, _category: category })),
          )
          .catch(() => []),
      ),
    ),
    Promise.all(
      PROJECT_TYPES.map((type) =>
        getUserFeaturedProjects(userId, type, 1, 80)
          .then((res) =>
            pickItems(res.data).map((item) => ({
              ...item,
              _type: type || item.promotion?.type || "normal",
            })),
          )
          .catch(() => []),
      ),
    ),
  ]);
  return {
    properties: dedupeById(propertyChunks.flat()),
    projects: dedupeById(projectChunks.flat()),
  };
}

export function useSalesExecutiveHub() {
  const dateRange = useDashboardDateRange("today", HUB_DATE_PRESETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilters, setLocationFilters] = useState({
    state: "",
    city: "",
    pincode: "",
    locality: "",
  });
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientTab, setClientTab] = useState("meetings");

  const currentUserQuery = useQuery({
    queryKey: ["se-hub", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const executiveId = getUserId(currentUserQuery.data);

  const clientsQuery = useQuery({
    queryKey: ["se-hub", "clients", executiveId],
    enabled: Boolean(executiveId),
    queryFn: async () => {
      const res = await getSeClients(executiveId);
      return pickItems(res?.data || res);
    },
    staleTime: 45_000,
  });

  const meetingsQuery = useQuery({
    queryKey: ["se-hub", "meetings", executiveId],
    enabled: Boolean(executiveId),
    queryFn: async () => {
      const payload = await listFieldMeetings({ limit: 120 });
      return Array.isArray(payload?.meetings) ? payload.meetings : pickItems(payload);
    },
    staleTime: 20_000,
    refetchInterval: 60_000,
  });

  const seInventoryQuery = useQuery({
    queryKey: ["se-hub", "se-inventory", executiveId],
    enabled: Boolean(executiveId),
    queryFn: () => loadUserInventory(executiveId),
    staleTime: 60_000,
  });

  const clients = clientsQuery.data || [];
  const meetings = meetingsQuery.data || [];

  const filteredClients = useMemo(
    () =>
      filterClients(clients, {
        q: searchQuery,
        ...locationFilters,
      }),
    [clients, searchQuery, locationFilters],
  );

  useEffect(() => {
    if (!filteredClients.length) {
      setSelectedClientId("");
      return;
    }
    if (
      !selectedClientId ||
      !filteredClients.some((c) => clientId(c) === selectedClientId)
    ) {
      setSelectedClientId(clientId(filteredClients[0]));
    }
  }, [filteredClients, selectedClientId]);

  const selectedClient = useMemo(
    () => clients.find((c) => clientId(c) === selectedClientId) || null,
    [clients, selectedClientId],
  );

  const clientDetailQuery = useQuery({
    queryKey: ["se-hub", "client-detail", selectedClientId],
    enabled: Boolean(selectedClientId),
    queryFn: async () => {
      const [inventory, paymentsRes, subsRes] = await Promise.all([
        loadUserInventory(selectedClientId),
        getUserPayments(selectedClientId).catch(() => ({ data: [] })),
        getUserSubscriptions(selectedClientId).catch(() => ({ data: [] })),
      ]);
      return {
        ...inventory,
        payments: pickItems(paymentsRes?.data || paymentsRes),
        subscriptions: pickItems(subsRes?.data || subsRes),
      };
    },
    staleTime: 45_000,
  });

  const clientMeetings = useMemo(() => {
    if (!selectedClient) return [];
    return meetings
      .filter((m) => meetingMatchesClient(m, selectedClient))
      .sort(
        (a, b) =>
          new Date(b.scheduledStart || b.punchOutAt || b.updatedAt || 0).getTime() -
          new Date(a.scheduledStart || a.punchOutAt || a.updatedAt || 0).getTime(),
      );
  }, [meetings, selectedClient]);

  const clientFollowUps = useMemo(
    () => clientMeetings.filter(isFollowUpOpen),
    [clientMeetings],
  );

  const allFollowUps = useMemo(
    () =>
      meetings
        .filter(isFollowUpOpen)
        .sort(
          (a, b) =>
            new Date(a.nextAction?.dueAt || a.punchOutAt || 0).getTime() -
            new Date(b.nextAction?.dueAt || b.punchOutAt || 0).getTime(),
        ),
    [meetings],
  );

  const locationOptions = useMemo(() => {
    const states = [];
    const cities = [];
    const pincodes = [];
    const localities = [];
    clients.forEach((client) => {
      const loc = clientLocation(client);
      if (loc.state) states.push(loc.state);
      if (loc.city) cities.push(loc.city);
      if (loc.pincode) pincodes.push(loc.pincode);
      if (loc.locality) localities.push(loc.locality);
    });
    return {
      states: uniqueSorted(states),
      cities: uniqueSorted(
        clients
          .filter((c) => !locationFilters.state || clientLocation(c).state === locationFilters.state)
          .map((c) => clientLocation(c).city),
      ),
      pincodes: uniqueSorted(
        clients
          .filter((c) => {
            const loc = clientLocation(c);
            if (locationFilters.state && loc.state !== locationFilters.state) return false;
            if (locationFilters.city && loc.city !== locationFilters.city) return false;
            return true;
          })
          .map((c) => clientLocation(c).pincode),
      ),
      localities: uniqueSorted(
        clients
          .filter((c) => {
            const loc = clientLocation(c);
            if (locationFilters.state && loc.state !== locationFilters.state) return false;
            if (locationFilters.city && loc.city !== locationFilters.city) return false;
            if (locationFilters.pincode && loc.pincode !== locationFilters.pincode) {
              return false;
            }
            return true;
          })
          .map((c) => clientLocation(c).locality),
      ),
    };
  }, [clients, locationFilters.state, locationFilters.city, locationFilters.pincode]);

  const seProperties = seInventoryQuery.data?.properties || [];
  const seProjects = seInventoryQuery.data?.projects || [];
  const clientProperties = clientDetailQuery.data?.properties || [];
  const clientProjects = clientDetailQuery.data?.projects || [];
  const clientSubscription = subscriptionSummary(
    clientDetailQuery.data?.subscriptions || [],
    clientDetailQuery.data?.payments || [],
  );

  const hubSummary = useMemo(() => {
    const activeSubs = clients.filter((c) => {
      const status = String(c?.subscriptionStatus || c?.planStatus || "").toLowerCase();
      return status.includes("active") || Boolean(c?.hasActiveSubscription);
    }).length;

    return {
      myClients: clients.length,
      meetingsToday: meetings.filter(isMeetingToday).length,
      followUpsDue: allFollowUps.length,
      propertiesHandled: seProperties.length,
      projects: seProjects.length,
      activeSubscriptions:
        activeSubs ||
        clients.filter((c) =>
          ["active", "paid"].includes(String(c?.accountStatus || "").toLowerCase()),
        ).length,
    };
  }, [clients, meetings, allFollowUps.length, seProperties.length, seProjects.length]);

  const clientStats = useMemo(() => {
    const completed = clientMeetings.filter(
      (m) => m.punchOutAt || String(m.status || "").toLowerCase() === "completed",
    ).length;
    return {
      meetingCount: clientMeetings.length,
      completed,
      pendingFollowUp: clientFollowUps.length,
      propertyCounts: countByBucket(clientProperties),
      projectCounts: countByBucket(clientProjects),
    };
  }, [clientMeetings, clientFollowUps.length, clientProperties, clientProjects]);

  const isLoading =
    currentUserQuery.isLoading ||
    (Boolean(executiveId) && (clientsQuery.isLoading || meetingsQuery.isLoading));

  const isFetching =
    clientsQuery.isFetching ||
    meetingsQuery.isFetching ||
    seInventoryQuery.isFetching ||
    clientDetailQuery.isFetching;

  const refetch = async () => {
    await Promise.all([
      currentUserQuery.refetch(),
      clientsQuery.refetch(),
      meetingsQuery.refetch(),
      seInventoryQuery.refetch(),
      selectedClientId ? clientDetailQuery.refetch() : Promise.resolve(),
    ]);
  };

  const setLocationFilter = (key, value) => {
    setLocationFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "state") {
        next.city = "";
        next.pincode = "";
        next.locality = "";
      } else if (key === "city") {
        next.pincode = "";
        next.locality = "";
      } else if (key === "pincode") {
        next.locality = "";
      }
      return next;
    });
  };

  return {
    ...dateRange,
    currentUserName:
      currentUserQuery.data?.name ||
      currentUserQuery.data?.fullName ||
      "Sales Executive",
    executiveId,
    hubSummary,
    clients,
    meetings,
    filteredClients,
    searchQuery,
    setSearchQuery,
    locationFilters,
    setLocationFilter,
    locationOptions,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    clientTab,
    setClientTab,
    clientMeetings,
    clientFollowUps,
    allFollowUps,
    clientProperties,
    clientProjects,
    clientSubscription,
    clientStats,
    clientDetailLoading: clientDetailQuery.isLoading,
    isLoading,
    isFetching,
    refetch,
  };
}
