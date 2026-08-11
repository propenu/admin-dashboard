import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Home,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserById,
  getUserFeaturedProjects,
  getUserPayments,
  getUserProperties,
} from "../../features/user/userDetailService";
import {
  getSeClients,
  getUserDetails,
  getUserSearch,
  seClaimClient,
} from "../../features/user/userService";
import { getUserActivityTimeline } from "../../features/activity/allUsersActivityService";
import DashboardDateFilter from "../Dashboards/shared/DashboardDateFilter";
import { inDateRange } from "../Dashboards/shared/dashboardDateRange";
import { useDashboardDateRange } from "../Dashboards/shared/useDashboardDateRange";
import CceTerritoryManagerModal from "../Dashboards/customerSupportTeamLeadDashboard/components/CceTerritoryManagerModal";

const SE_DETAIL_DATE_PRESETS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "7d", label: "Week" },
  { key: "30d", label: "Month" },
  { key: "custom", label: "Custom" },
];

const TABS = [
  { key: "overview", label: "Overview", icon: Briefcase },
  { key: "projects", label: "Projects posted", icon: Building2 },
  { key: "properties", label: "Properties handled", icon: Home },
  { key: "clients", label: "My clients", icon: Users },
  { key: "client_activity", label: "Client activity", icon: UserPlus },
];

const PROPERTY_CATEGORIES = ["residential", "commercial", "land", "agricultural"];
/** Empty type first = all types; skip empty if typed fetches already cover. */
const PROJECT_TYPES = ["featured", "prime", "normal", "sponsored"];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
];

const pickItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const dedupeById = (rows) => {
  const seen = new Set();
  return rows.filter((row) => {
    const id = String(row?._id || row?.id || "");
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const titleOf = (item) =>
  item?.title || item?.projectName || item?.name || item?.propertyTitle || item?.ticketNumber || "Untitled";

/** Normalize to draft | pending | active | other */
const bucketStatus = (item) => {
  const raw = String(
    item?.status || item?.approval?.status || item?.accountStatus || item?.kyc?.status || "",
  ).toLowerCase();
  if (["draft", "incomplete"].includes(raw)) return "draft";
  if (["pending", "onboarding", "under_review", "awaiting", "awaiting_approval"].some((s) => raw.includes(s)))
    return "pending";
  if (["active", "live", "published", "approved", "verified"].some((s) => raw.includes(s)))
    return "active";
  return raw || "unknown";
};

const statusOf = (item) => bucketStatus(item);

const tone = (status = "") => {
  const value = String(status).toLowerCase();
  if (["active", "live", "verified", "resolved", "paid", "approved"].some((s) => value.includes(s)))
    return "bg-emerald-50 text-emerald-700";
  if (["pending", "draft", "kyc", "onboarding", "awaiting", "incomplete"].some((s) => value.includes(s)))
    return "bg-amber-50 text-amber-700";
  if (["rejected", "expired", "inactive", "archived"].some((s) => value.includes(s)))
    return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const fmtDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const countByBucket = (rows) => {
  const counts = { draft: 0, pending: 0, active: 0, other: 0 };
  rows.forEach((row) => {
    const bucket = bucketStatus(row);
    if (bucket === "draft") counts.draft += 1;
    else if (bucket === "pending") counts.pending += 1;
    else if (bucket === "active") counts.active += 1;
    else counts.other += 1;
  });
  return counts;
};

const filterByStatus = (rows, filterKey) => {
  if (!filterKey || filterKey === "all") return rows;
  return rows.filter((row) => bucketStatus(row) === filterKey);
};

const itemDateValue = (item) =>
  item?.createdAt ||
  item?.postedAt ||
  item?.postedBy?.postedAt ||
  item?.updatedAt ||
  item?.paidAt ||
  null;

const inPeriod = (item, range) => inDateRange(itemDateValue(item), range);

export default function SalesExecutiveDetailPage() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "overview";
  const dateRange = useDashboardDateRange("all", SE_DETAIL_DATE_PRESETS);

  const openProjectDetails = (project) => {
    const id = String(project?._id || project?.id || "").trim();
    if (!id) return toast.error("Project id missing");
    navigate(`/featured-project/${id}`);
  };

  const openPropertyDetails = (property) => {
    const id = String(property?._id || property?.id || "").trim();
    if (!id) return toast.error("Property id missing");
    const category = String(
      property?._category ||
        property?.category ||
        property?.propertyType ||
        "residential",
    )
      .trim()
      .toLowerCase();
    const allowed = new Set(["residential", "commercial", "land", "agricultural"]);
    const pathCategory = allowed.has(category) ? category : "residential";
    navigate(`/property/${pathCategory}/${id}`);
  };

  const [seId, setSeId] = useState(routeUserId || "");
  const [seUser, setSeUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(searchParams.get("client") || "");
  const [clientPayments, setClientPayments] = useState([]);
  const [clientProperties, setClientProperties] = useState([]);
  const [clientTimeline, setClientTimeline] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [propertyStatusFilter, setPropertyStatusFilter] = useState("all");
  const [assignQuery, setAssignQuery] = useState("");
  const [assignResults, setAssignResults] = useState([]);
  const [assignSearching, setAssignSearching] = useState(false);
  const [assignBusyId, setAssignBusyId] = useState("");
  const [territoryOpen, setTerritoryOpen] = useState(false);
  const [viewerId, setViewerId] = useState("");

  const setTab = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  const resolveSeId = useCallback(async () => {
    if (routeUserId && routeUserId !== "me") return routeUserId;
    const me = await getUserDetails();
    const user = me?.data?.user || me?.data || me?.user || null;
    return String(user?._id || user?.id || "");
  }, [routeUserId]);

  const loadCore = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await getUserDetails().catch(() => null);
      const meUser = meRes?.data?.user || meRes?.data || meRes?.user || null;
      const meId = String(meUser?._id || meUser?.id || "").trim();
      if (meId) setViewerId(meId);

      const id =
        routeUserId && routeUserId !== "me"
          ? routeUserId
          : meId || (await resolveSeId());
      if (!id) throw new Error("Sales Executive not found");
      setSeId(id);

      const profileRes = await getUserById(id);
      const profilePayload = profileRes.data?.data || profileRes.data;
      const profile = Array.isArray(profilePayload)
        ? profilePayload.find((u) => String(u._id) === String(id))
        : profilePayload;
      setSeUser(profile || null);

      const [projectChunks, propertyChunks, clientRes] = await Promise.all([
        Promise.all(
          PROJECT_TYPES.map((type) =>
            getUserFeaturedProjects(id, type, 1, 100)
              .then((res) =>
                pickItems(res.data).map((item) => ({
                  ...item,
                  _type: type || item.promotion?.type || item.type || "normal",
                })),
              )
              .catch(() => []),
          ),
        ),
        Promise.all(
          PROPERTY_CATEGORIES.map((category) =>
            getUserProperties(id, category, 1, 100)
              .then((res) => pickItems(res.data).map((item) => ({ ...item, _category: category })))
              .catch(() => []),
          ),
        ),
        getSeClients(id).catch(() => ({ data: [] })),
      ]);

      setProjects(dedupeById(projectChunks.flat()));
      setProperties(dedupeById(propertyChunks.flat()));
      setClients(pickItems(clientRes?.data || clientRes));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Unable to load SE detail");
    } finally {
      setLoading(false);
    }
  }, [resolveSeId, routeUserId]);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  const selectedClient = useMemo(
    () => clients.find((c) => String(c._id) === String(selectedClientId)) || null,
    [clients, selectedClientId],
  );

  useEffect(() => {
    if (tab !== "client_activity" || !selectedClientId) {
      setClientPayments([]);
      setClientProperties([]);
      setClientTimeline([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setClientLoading(true);
      try {
        const [payRes, propChunks, timelineRes] = await Promise.all([
          getUserPayments(selectedClientId).catch(() => ({ data: [] })),
          Promise.all(
            PROPERTY_CATEGORIES.map((category) =>
              getUserProperties(selectedClientId, category, 1, 50)
                .then((res) => pickItems(res.data))
                .catch(() => []),
            ),
          ),
          getUserActivityTimeline(selectedClientId).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setClientPayments(pickItems(payRes?.data || payRes));
        setClientProperties(propChunks.flat());
        setClientTimeline(pickItems(timelineRes?.data || timelineRes));
      } finally {
        if (!cancelled) setClientLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, selectedClientId]);

  const rangedProjects = useMemo(
    () => projects.filter((item) => inPeriod(item, dateRange.range)),
    [projects, dateRange.range],
  );
  const rangedProperties = useMemo(
    () => properties.filter((item) => inPeriod(item, dateRange.range)),
    [properties, dateRange.range],
  );
  const rangedClients = useMemo(
    () => clients.filter((item) => inPeriod(item, dateRange.range)),
    [clients, dateRange.range],
  );

  const projectCounts = useMemo(() => countByBucket(rangedProjects), [rangedProjects]);
  const propertyCounts = useMemo(() => countByBucket(rangedProperties), [rangedProperties]);
  const filteredProjects = useMemo(
    () => filterByStatus(rangedProjects, projectStatusFilter),
    [rangedProjects, projectStatusFilter],
  );
  const filteredProperties = useMemo(
    () => filterByStatus(rangedProperties, propertyStatusFilter),
    [rangedProperties, propertyStatusFilter],
  );

  const assignedClientIds = useMemo(
    () => new Set(clients.map((c) => String(c._id || c.userId || ""))),
    [clients],
  );

  const searchExistingUsers = async () => {
    const q = String(assignQuery || "").trim();
    if (q.length < 2) {
      return toast.error("Enter at least 2 characters (name, phone, or email)");
    }
    setAssignSearching(true);
    try {
      const res = await getUserSearch({ role: "user,agent,builder", q });
      const rows =
        res?.data?.results ||
        res?.data?.data?.results ||
        res?.data?.data ||
        (Array.isArray(res?.data) ? res.data : []);
      setAssignResults(Array.isArray(rows) ? rows : []);
      if (!rows?.length) toast.message("No existing Propenu users found");
    } catch (error) {
      setAssignResults([]);
      toast.error(error?.response?.data?.message || "Search failed");
    } finally {
      setAssignSearching(false);
    }
  };

  const assignExistingClient = async (user) => {
    const userId = String(user?._id || user?.userId || "");
    if (!userId) return toast.error("Invalid user");
    if (!seId) return toast.error("Sales Executive id missing");
    setAssignBusyId(userId);
    try {
      const claim = await seClaimClient({
        userId,
        salesExecutiveId: seId,
      });
      const data = claim?.data || claim;
      if (data?.alreadyAssigned) {
        toast.success("Already assigned to you");
      } else if (data?.reassigned) {
        toast.success("Existing user reassigned to you");
      } else {
        toast.success("Existing user assigned to you");
      }
      await loadCore();
      setSelectedClientId(userId);
      const params = new URLSearchParams(searchParams);
      params.set("tab", "client_activity");
      params.set("client", userId);
      setSearchParams(params);
      setAssignResults((prev) => prev.filter((row) => String(row._id || row.userId) !== userId));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Assign failed");
    } finally {
      setAssignBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Sales Executive detail
          </p>
          <h1 className="text-2xl font-black text-slate-950">
            {seUser?.name || "Sales Executive"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {[seUser?.locality, seUser?.city, seUser?.state].filter(Boolean).join(", ") || "No location"}
            {" · "}
            Period{" "}
            <strong className="font-semibold text-slate-700">
              {dateRange.rangeLabel || "All time"}
            </strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadCore}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          {seId ? (
            <button
              type="button"
              onClick={() => setTerritoryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
            >
              <MapPin className="h-3.5 w-3.5" /> Working locations
            </button>
          ) : null}
          <Link
            to={`/sales-executives/onboard-user?seId=${encodeURIComponent(seId)}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Onboard new user
          </Link>
        </div>
      </div>

      <DashboardDateFilter
        preset={dateRange.preset}
        onPresetChange={dateRange.setPreset}
        customFrom={dateRange.customFrom}
        customTo={dateRange.customTo}
        onCustomFromChange={dateRange.setCustomFrom}
        onCustomToChange={dateRange.setCustomTo}
        onApplyCustom={dateRange.applyCustomRange}
        presets={SE_DETAIL_DATE_PRESETS}
        label="Date filter"
        trailing={dateRange.rangeLabel || "All time"}
      />

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                active ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <section className="space-y-2">
          <StatusRow
            title="Projects posted"
            total={rangedProjects.length}
            counts={projectCounts}
            onOpen={(status) => {
              setProjectStatusFilter(status);
              setTab("projects");
            }}
          />
          <StatusRow
            title="Properties handled"
            total={rangedProperties.length}
            counts={propertyCounts}
            onOpen={(status) => {
              setPropertyStatusFilter(status);
              setTab("properties");
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="My clients" value={rangedClients.length} onClick={() => setTab("clients")} />
            <MiniStat
              label="Total inventory"
              value={rangedProjects.length + rangedProperties.length}
              onClick={() => setTab("projects")}
            />
          </div>
        </section>
      )}

      {tab === "projects" && (
        <section className="space-y-3">
          <StatusFilterBar
            value={projectStatusFilter}
            onChange={setProjectStatusFilter}
            counts={projectCounts}
            total={rangedProjects.length}
          />
          <DataTable
            empty="No projects in this date range."
            rows={filteredProjects}
            onRowClick={openProjectDetails}
            columns={[
              { key: "title", label: "Project", render: (r) => titleOf(r) },
              {
                key: "type",
                label: "Type",
                render: (r) => r._type || r.promotion?.type || r.type || "—",
              },
              {
                key: "loc",
                label: "Location",
                render: (r) => [r.locality, r.city].filter(Boolean).join(", ") || "—",
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <Badge status={statusOf(r)} />,
              },
              { key: "date", label: "Posted", render: (r) => fmtDate(r.createdAt) },
            ]}
          />
        </section>
      )}

      {tab === "properties" && (
        <section className="space-y-3">
          <StatusFilterBar
            value={propertyStatusFilter}
            onChange={setPropertyStatusFilter}
            counts={propertyCounts}
            total={rangedProperties.length}
          />
          <DataTable
            empty="No properties in this date range."
            rows={filteredProperties}
            onRowClick={openPropertyDetails}
            columns={[
              { key: "title", label: "Listing", render: (r) => titleOf(r) },
              { key: "cat", label: "Type", render: (r) => r._category || "—" },
              {
                key: "loc",
                label: "Location",
                render: (r) => [r.locality, r.city].filter(Boolean).join(", ") || "—",
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <Badge status={statusOf(r)} />,
              },
              {
                key: "date",
                label: "Updated",
                render: (r) => fmtDate(r.updatedAt || r.createdAt),
              },
            ]}
          />
        </section>
      )}

      {tab === "clients" && (
        <section className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              to={`/sales-executives/onboard-user?seId=${encodeURIComponent(seId)}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
            >
              <Plus className="h-3.5 w-3.5" /> Onboard new user
            </Link>
          </div>
          <AssignExistingClientPanel
            query={assignQuery}
            onQueryChange={setAssignQuery}
            onSearch={searchExistingUsers}
            searching={assignSearching}
            results={assignResults}
            assignedIds={assignedClientIds}
            busyId={assignBusyId}
            onAssign={assignExistingClient}
          />
          <DataTable
            empty="No clients in this date range. Assign an existing user or onboard a new one."
            rows={rangedClients}
            onRowClick={(row) => {
              setSelectedClientId(String(row._id));
              const params = new URLSearchParams(searchParams);
              params.set("tab", "client_activity");
              params.set("client", String(row._id));
              setSearchParams(params);
            }}
            columns={[
              { key: "name", label: "Client", render: (r) => r.name || "—" },
              { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
              {
                key: "loc",
                label: "Location",
                render: (r) => [r.locality, r.city].filter(Boolean).join(", ") || "—",
              },
              {
                key: "kyc",
                label: "KYC",
                render: (r) => <Badge status={r.kyc?.status || r.accountStatus || "not_started"} />,
              },
              {
                key: "acct",
                label: "Account",
                render: (r) => <Badge status={r.accountStatus || "—"} />,
              },
              { key: "date", label: "Onboarded", render: (r) => fmtDate(r.createdAt) },
            ]}
          />
        </section>
      )}

      {tab === "client_activity" && (
        <section className="space-y-3">
          <AssignExistingClientPanel
            query={assignQuery}
            onQueryChange={setAssignQuery}
            onSearch={searchExistingUsers}
            searching={assignSearching}
            results={assignResults}
            assignedIds={assignedClientIds}
            busyId={assignBusyId}
            onAssign={assignExistingClient}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label className="min-w-[220px] flex-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select assigned client
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    const params = new URLSearchParams(searchParams);
                    params.set("tab", "client_activity");
                    if (e.target.value) params.set("client", e.target.value);
                    else params.delete("client");
                    setSearchParams(params);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="">Choose a client…</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name || c.phone} ({c.phone || "no phone"})
                    </option>
                  ))}
                </select>
              </label>
              <Link
                to={`/sales-executives/onboard-user?seId=${encodeURIComponent(seId)}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
              >
                <Plus className="h-3.5 w-3.5" /> Onboard new
              </Link>
            </div>
          </div>

          {!selectedClient ? (
            <EmptyBox text="Assign an existing user above, or select a client to see subscriptions, listings, and activity." />
          ) : clientLoading ? (
            <div className="grid place-items-center py-16">
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              <InfoCard title="Profile">
                <p className="font-bold text-slate-900">{selectedClient.name}</p>
                <p className="text-sm text-slate-600">{selectedClient.phone}</p>
                <p className="text-sm text-slate-600">{selectedClient.email || "No email"}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {[selectedClient.locality, selectedClient.city, selectedClient.state, selectedClient.pincode]
                    .filter(Boolean)
                    .join(", ") || "No location"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge status={selectedClient.kyc?.status || "not_started"} />
                  <Badge status={selectedClient.accountStatus || "—"} />
                </div>
              </InfoCard>
              <InfoCard title="Subscriptions / payments">
                {!clientPayments.length ? (
                  <p className="text-sm text-slate-500">No payments recorded.</p>
                ) : (
                  clientPayments.slice(0, 8).map((p) => (
                    <div key={p._id || p.id} className="border-b border-slate-100 py-2 text-sm last:border-0">
                      <p className="font-semibold text-slate-800">{p.planName || p.title || "Payment"}</p>
                      <p className="text-xs text-slate-500">
                        {fmtDate(p.createdAt || p.paidAt)} · {String(p.status || "—")}
                      </p>
                    </div>
                  ))
                )}
              </InfoCard>
              <InfoCard title="Client listings">
                {!clientProperties.length ? (
                  <p className="text-sm text-slate-500">No listings yet.</p>
                ) : (
                  clientProperties.slice(0, 8).map((p) => (
                    <div key={p._id || p.id} className="border-b border-slate-100 py-2 text-sm last:border-0">
                      <p className="font-semibold text-slate-800">{titleOf(p)}</p>
                      <Badge status={statusOf(p)} />
                    </div>
                  ))
                )}
              </InfoCard>
              <InfoCard title="Activity timeline">
                {!clientTimeline.length ? (
                  <p className="text-sm text-slate-500">No activity events yet.</p>
                ) : (
                  clientTimeline.slice(0, 12).map((row, idx) => (
                    <div key={row._id || row.id || idx} className="border-b border-slate-100 py-2 text-sm last:border-0">
                      <p className="font-semibold text-slate-800">
                        {row.title || row.action || row.type || "Activity"}
                      </p>
                      <p className="text-xs text-slate-500">{fmtDate(row.createdAt || row.time)}</p>
                    </div>
                  ))
                )}
              </InfoCard>
            </div>
          )}
        </section>
      )}

      <CceTerritoryManagerModal
        open={territoryOpen && Boolean(seId)}
        member={{
          id: seId,
          name: seUser?.name || "Sales Executive",
        }}
        readOnly={Boolean(viewerId && seId && viewerId === seId)}
        onClose={() => setTerritoryOpen(false)}
        onSaved={() => loadCore()}
      />
    </div>
  );
}

function AssignExistingClientPanel({
  query,
  onQueryChange,
  onSearch,
  searching,
  results,
  assignedIds,
  busyId,
  onAssign,
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          Assign existing user
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
            placeholder="Name, 10-digit phone, or email"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
        <button
          type="button"
          disabled={searching}
          onClick={onSearch}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {searching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          {searching ? "Searching…" : "Search users"}
        </button>
      </div>

      {results?.length ? (
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {results.map((user) => {
            const id = String(user._id || user.userId || "");
            const alreadyMine = assignedIds?.has(id);
            const busy = busyId === id;
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.name || "Unnamed user"}
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-500">
                    {[user.phone, user.email, user.city].filter(Boolean).join(" · ") || "No contact"}
                  </p>
                </div>
                {alreadyMine ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                    Already yours
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onAssign(user)}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                    {busy ? "Assigning…" : "Assign to me"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Compact horizontal row: label · total · draft · pending · active · view all */
function StatusRow({ title, total, counts, onOpen }) {
  const cells = [
    { key: "draft", label: "Draft", value: counts.draft, tone: "border-slate-200 bg-slate-50 text-slate-800" },
    { key: "pending", label: "Pending", value: counts.pending, tone: "border-amber-200 bg-amber-50 text-amber-900" },
    { key: "active", label: "Active", value: counts.active, tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-1.5 p-1.5 sm:flex-row sm:items-center sm:gap-1.5">
        <div className="flex min-w-[132px] shrink-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 sm:w-36 sm:flex-col sm:items-start sm:justify-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
            <p className="text-xs font-semibold text-slate-600">
              Total <span className="font-black text-slate-900">{total}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpen("all")}
            className="text-[10px] font-bold text-emerald-700 hover:underline"
          >
            View all
          </button>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5">
          {cells.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => onOpen(card.key)}
              className={`rounded-lg border px-2 py-1.5 text-left transition hover:shadow-sm ${card.tone}`}
            >
              <p className="text-base font-black leading-none sm:text-lg">{card.value}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">{card.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusFilterBar({ value, onChange, counts, total }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_FILTERS.map((item) => {
        const count =
          item.key === "all"
            ? total
            : item.key === "draft"
              ? counts.draft
              : item.key === "pending"
                ? counts.pending
                : counts.active;
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              active ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {item.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:border-emerald-200"
    >
      <p className="text-base font-black leading-none text-slate-900 sm:text-lg">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-500">{label}</p>
    </button>
  );
}

function Badge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone(status)}`}>
      {String(status || "—").replaceAll("_", " ")}
    </span>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function DataTable({ rows, columns, empty, onRowClick }) {
  if (!rows?.length) return <EmptyBox text={empty} />;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2.5">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id || row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-slate-100 ${onRowClick ? "cursor-pointer hover:bg-emerald-50/40" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 align-top text-slate-700">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
