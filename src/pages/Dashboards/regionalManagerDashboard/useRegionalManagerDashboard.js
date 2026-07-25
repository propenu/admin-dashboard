import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";

const isKnown = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return Boolean(s) && !["unknown", "not specified", "not_specified", "n/a", "na", "null", "undefined"].includes(s);
};

const RM_TEAM_ROLES = new Set([
  "sales_manager",
  "sales_agent",
  "sales_executive",
  "sales_executives",
  "business_development_manager",
  "business_development_executive",
]);

const asNum = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
};

const toIsoDate = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const unpackList = (result) => {
  if (result?.status !== "fulfilled") return [];
  const payload = result.value?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const unpackAnalytics = (result) => {
  if (result?.status !== "fulfilled") return {};
  return result.value?.data?.data || result.value?.data || {};
};

const resolveDateRange = (preset, customFrom, customTo) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (preset === "all") return { from: "", to: "" };
  if (preset === "today") return { from: toIsoDate(startOfToday), to: toIsoDate(today) };
  if (preset === "7d") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 6);
    return { from: toIsoDate(from), to: toIsoDate(today) };
  }
  if (preset === "30d") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 29);
    return { from: toIsoDate(from), to: toIsoDate(today) };
  }
  if (preset === "month") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toIsoDate(from), to: toIsoDate(today) };
  }
  if (preset === "custom") {
    return {
      from: customFrom || "",
      to: customTo || "",
    };
  }
  return { from: "", to: "" };
};

export function useRegionalManagerDashboard() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedLocality, setSelectedLocality] = useState("All Localities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [data, setData] = useState({
    projects: {},
    properties: {},
    users: [],
    currentUser: null,
  });

  const dateRange = useMemo(
    () => resolveDateRange(datePreset, customFrom, customTo),
    [customFrom, customTo, datePreset],
  );

  const triggerToast = useCallback((msg) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setLoading(true);

        const currentUserResult = await getUserDetails().catch(() => null);
        const currentUser =
          currentUserResult?.data?.user || currentUserResult?.data || currentUserResult || null;

        const analyticsParams = {};
        if (currentUser?.state) analyticsParams.state = currentUser.state;
        if (selectedCity && selectedCity !== "All Cities") analyticsParams.city = selectedCity;
        if (selectedLocality && selectedLocality !== "All Localities") {
          analyticsParams.locality = selectedLocality;
        }
        if (dateRange.from) analyticsParams.from = dateRange.from;
        if (dateRange.to) analyticsParams.to = dateRange.to;

        const [usersResult, projectResult, propertyResult] = await Promise.allSettled([
          getAllUsers({ scope: "team_directory" }),
          getAllProjectsAnalytics(analyticsParams),
          getAllPropertiesAnalytics(analyticsParams),
        ]);

        setData({
          currentUser,
          users: unpackList(usersResult),
          projects: unpackAnalytics(projectResult),
          properties: unpackAnalytics(propertyResult),
        });
        if (isRefresh) triggerToast("Regional data refreshed");
      } catch (err) {
        console.error("RegionalManagerDashboard load error:", err);
        triggerToast("Failed to load regional data");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange.from, dateRange.to, selectedCity, selectedLocality, triggerToast],
  );

  useEffect(() => {
    // Custom range waits until both dates are set (or cleared)
    if (datePreset === "custom" && customFrom && customTo && customFrom > customTo) return;
    if (datePreset === "custom" && (Boolean(customFrom) !== Boolean(customTo))) return;
    loadData(false);
  }, [customFrom, customTo, datePreset, loadData]);

  const projectOverview = data.projects?.overview || {};
  const propertyOverview = data.properties?.overview || {};

  const metrics = useMemo(() => {
    const totalProperties =
      asNum(projectOverview.totalProjects) + asNum(propertyOverview.totalProperties);
    const activeListings =
      asNum(projectOverview.activeProjects) + asNum(propertyOverview.activeProperties);
    const pendingCount =
      asNum(projectOverview.pendingProjects) + asNum(propertyOverview.pendingProperties);
    const draftCount =
      asNum(projectOverview.draftProjects || projectOverview.inactiveProjects) +
      asNum(propertyOverview.draftProperties);
    const totalInquiries =
      asNum(projectOverview.totalInquiries) + asNum(propertyOverview.totalInquiries);
    const totalClicks =
      asNum(projectOverview.totalClicks) + asNum(propertyOverview.totalClicks);
    const totalViews =
      asNum(projectOverview.totalViews) + asNum(propertyOverview.totalViews);

    const leadByStatus =
      data.projects?.leadSummary?.byStatus || data.properties?.leadSummary?.byStatus || {};
    const newLeads = asNum(leadByStatus.new_lead);
    const qualified = asNum(leadByStatus.qualified);
    const siteVisits = asNum(leadByStatus.site_visit);
    const negotiation = asNum(leadByStatus.negotiation);
    const conversions = asNum(leadByStatus.sale);
    const inquiryTotal = totalInquiries || newLeads;

    return {
      totalProperties,
      activeListings,
      pendingCount,
      draftCount,
      totalInquiries: inquiryTotal,
      totalClicks,
      totalViews,
      newLeads,
      qualified,
      siteVisits,
      negotiation,
      conversions,
      conversionRate:
        inquiryTotal > 0 ? ((conversions / inquiryTotal) * 100).toFixed(0) : "0",
      funnelCounts: [inquiryTotal, qualified, siteVisits, negotiation, conversions],
    };
  }, [data.projects, data.properties, projectOverview, propertyOverview]);

  const cityRows = useMemo(() => {
    const raw = [...(data.projects?.cityWise || []), ...(data.properties?.cityWise || [])];
    const map = new Map();
    raw.forEach((row) => {
      const key = String(row?._id ?? "");
      if (!isKnown(key)) return;
      const existing = map.get(key) || {
        city: key,
        total: 0,
        active: 0,
        pending: 0,
        draft: 0,
      };
      existing.total += asNum(row?.total);
      existing.active += asNum(row?.active);
      existing.pending += asNum(row?.pending);
      existing.draft += asNum(row?.draft);
      map.set(key, existing);
    });
    const sorted = [...map.values()].sort((a, b) => b.total - a.total);
    const max = sorted[0]?.total || 1;
    return sorted.map((r) => ({ ...r, pct: Math.round((r.total / max) * 100) }));
  }, [data.projects, data.properties]);

  const localityRows = useMemo(() => {
    const raw = [
      ...(data.projects?.localityWise || []),
      ...(data.properties?.localityWise || []),
    ];
    const map = new Map();
    raw.forEach((row) => {
      const key = String(row?._id ?? "");
      if (!isKnown(key)) return;
      const existing = map.get(key) || {
        locality: key,
        total: 0,
        active: 0,
        pending: 0,
        draft: 0,
      };
      existing.total += asNum(row?.total);
      existing.active += asNum(row?.active);
      existing.pending += asNum(row?.pending);
      existing.draft += asNum(row?.draft);
      map.set(key, existing);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [data.projects, data.properties]);

  const statusRows = useMemo(() => {
    const raw = [...(data.projects?.statusWise || []), ...(data.properties?.statusWise || [])];
    const map = new Map();
    raw.forEach((row) => {
      const key = String(row?._id ?? "unknown").toLowerCase();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + asNum(row?.total));
    });
    return [...map.entries()]
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => b.total - a.total);
  }, [data.projects, data.properties]);

  const filteredDetailRows = useMemo(() => {
    const base =
      selectedLocality !== "All Localities" || localityRows.length
        ? localityRows.map((row) => ({
            key: row.locality,
            label: row.locality,
            type: "Locality",
            total: row.total,
            active: row.active,
            pending: row.pending,
            draft: row.draft,
          }))
        : cityRows.map((row) => ({
            key: row.city,
            label: row.city,
            type: "City",
            total: row.total,
            active: row.active,
            pending: row.pending,
            draft: row.draft,
          }));

    return base.filter((row) => {
      if (selectedStatus === "All Statuses") return true;
      if (selectedStatus === "active") return asNum(row.active) > 0;
      if (selectedStatus === "pending") return asNum(row.pending) > 0;
      if (selectedStatus === "draft") return asNum(row.draft) > 0;
      return true;
    });
  }, [cityRows, localityRows, selectedLocality, selectedStatus]);

  const teamMembers = useMemo(
    () =>
      data.users.filter((u) => RM_TEAM_ROLES.has(String(u.roleName || "").toLowerCase())),
    [data.users],
  );

  const allCities = useMemo(() => {
    const fromUsers = data.users.map((u) => u.city).filter(isKnown);
    const fromAnalytics = cityRows.map((r) => r.city).filter(isKnown);
    return [...new Set([...fromUsers, ...fromAnalytics])].sort();
  }, [cityRows, data.users]);

  const allLocalities = useMemo(
    () => localityRows.map((r) => r.locality).filter(isKnown).sort(),
    [localityRows],
  );

  const allStates = useMemo(
    () => [...new Set(data.users.map((u) => u.state).filter(isKnown))].sort(),
    [data.users],
  );

  const clearFilters = useCallback(() => {
    setSelectedCity("All Cities");
    setSelectedLocality("All Localities");
    setSelectedStatus("All Statuses");
    setDatePreset("all");
    setCustomFrom("");
    setCustomTo("");
  }, []);

  const activeFilterCount = [
    selectedCity !== "All Cities",
    selectedLocality !== "All Localities",
    selectedStatus !== "All Statuses",
    datePreset !== "all",
  ].filter(Boolean).length;

  return {
    loading,
    isRefreshing,
    toastMsg,
    triggerToast,
    selectedCity,
    setSelectedCity,
    selectedLocality,
    setSelectedLocality,
    selectedStatus,
    setSelectedStatus,
    datePreset,
    setDatePreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    dateRange,
    clearFilters,
    activeFilterCount,
    loadData,
    data,
    metrics,
    cityRows,
    localityRows,
    statusRows,
    filteredDetailRows,
    teamMembers,
    allCities,
    allLocalities,
    allStates,
    regionLabel: data.currentUser?.state || "Your region",
    currentUser: data.currentUser,
  };
}

export { isKnown, asNum, RM_TEAM_ROLES, toIsoDate };
