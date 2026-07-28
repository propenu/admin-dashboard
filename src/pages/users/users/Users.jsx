// frontend/admin-dashboard/src/pages/users/Users.jsx
import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { SearchFiltersPanel } from "./components/SearchFiltersPanel";
import { useUsers, useSearchUsers } from "./hook/useUserData";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";
import DashboardDateFilter from "../../Dashboards/shared/DashboardDateFilter";

const ONBOARDING_STATUSES = ["location_pending", "kyc_pending", "pending", "incomplete"];

const USER_DATE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "custom", label: "Custom" },
];

const toLocalIso = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayIso = () => toLocalIso(new Date());

const matchesAccountStatus = (userStatus, filterStatus) => {
  if (!filterStatus) return true;
  const status = String(userStatus || "").toLowerCase();
  if (filterStatus === "onboarding") return ONBOARDING_STATUSES.includes(status);
  return status === filterStatus;
};

export default function Users() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterAccountStatus, setFilterAccountStatus] = useState("");
  const [filterKycStatus, setFilterKycStatus] = useState("");
  const [filterPhoneVerified, setFilterPhoneVerified] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const listParams = useMemo(() => {
    const createdFrom =
      searchParams.get("createdFrom") || searchParams.get("from") || "";
    const createdTo =
      searchParams.get("createdTo") || searchParams.get("to") || "";
    const date = searchParams.get("date") || "";
    const joined = searchParams.get("joined");
    const day =
      date ||
      (joined === "today" ? todayIso() : "") ||
      (createdFrom && createdTo && createdFrom === createdTo ? createdFrom : "");
    const params = {};
    if (day) {
      params.createdFrom = day;
      params.createdTo = day;
    } else {
      if (createdFrom) params.createdFrom = createdFrom;
      if (createdTo) params.createdTo = createdTo;
    }
    return Object.keys(params).length ? params : undefined;
  }, [searchParams]);
  const { data: allUsers = [], isLoading, refetch } = useUsers(listParams);
  useSearchUsers(search);
  const [locationFilter, setLocationFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState(() => todayIso());
  const [customTo, setCustomTo] = useState(() => todayIso());

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Apply dashboard drill-down filters from URL (e.g. /users?createdFrom=&createdTo= / joined=today)
  useEffect(() => {
    const status =
      searchParams.get("status") ||
      searchParams.get("accountStatus") ||
      (searchParams.get("filter") === "onboarding" ? "onboarding" : "");
    const kyc = searchParams.get("kyc") || "";
    const phone = searchParams.get("phone") || "";
    const active = searchParams.get("active") || "";
    const roleFromPath = location.pathname.includes("builder-staff")
      ? "builder_staff"
      : "";
    const role = roleFromPath || searchParams.get("role") || "all";
    const joined = searchParams.get("joined");
    const dateParam = searchParams.get("date") || "";
    const from =
      searchParams.get("createdFrom") || searchParams.get("from") || "";
    const to = searchParams.get("createdTo") || searchParams.get("to") || "";

    let nextDate = dateParam;
    if (!nextDate && joined === "today") nextDate = todayIso();
    if (!nextDate && from && to && from === to) nextDate = from;

    const rangeFrom = from && to && from !== to ? from : "";
    const rangeTo = from && to && from !== to ? to : "";

    setFilterAccountStatus(status);
    setFilterKycStatus(kyc);
    setFilterPhoneVerified(phone);
    setFilterIsActive(active);
    setFilterRole(role === "" ? "all" : role);
    setSelectedDate(nextDate);
    setFromDate(rangeFrom);
    setToDate(rangeTo);

    if (rangeFrom && rangeTo) {
      setDatePreset("custom");
      setCustomFrom(rangeFrom);
      setCustomTo(rangeTo);
    } else if (nextDate && nextDate === todayIso()) {
      setDatePreset("today");
      setCustomFrom(nextDate);
      setCustomTo(nextDate);
    } else if (nextDate) {
      setDatePreset("custom");
      setCustomFrom(nextDate);
      setCustomTo(nextDate);
    } else {
      setDatePreset("all");
    }
  }, [searchParams, location.pathname]);

  const syncUrl = (next) => {
    const params = new URLSearchParams();
    if (next.status) {
      if (next.status === "onboarding") params.set("filter", "onboarding");
      else params.set("status", next.status);
    }
    if (next.kyc) params.set("kyc", next.kyc);
    if (next.phone) params.set("phone", next.phone);
    if (next.active) params.set("active", next.active);
    if (next.role && next.role !== "all") params.set("role", next.role);
    if (next.date) params.set("date", next.date);
    if (next.from && next.to) {
      if (next.from === next.to) {
        params.set("createdFrom", next.from);
        params.set("createdTo", next.to);
        params.set("date", next.from);
      } else {
        params.set("createdFrom", next.from);
        params.set("createdTo", next.to);
        params.set("from", next.from);
        params.set("to", next.to);
      }
    } else if (next.date) {
      params.set("createdFrom", next.date);
      params.set("createdTo", next.date);
    }
    setSearchParams(params, { replace: true });
  };

  const applyDatePreset = (preset) => {
    const base = {
      status: filterAccountStatus,
      kyc: filterKycStatus,
      phone: filterPhoneVerified,
      active: filterIsActive,
      role: filterRole,
    };

    if (preset === "all") {
      setDatePreset("all");
      setSelectedDate("");
      setFromDate("");
      setToDate("");
      syncUrl({ ...base, date: "", from: "", to: "" });
      return;
    }

    if (preset === "today") {
      const today = todayIso();
      setDatePreset("today");
      setSelectedDate(today);
      setFromDate("");
      setToDate("");
      setCustomFrom(today);
      setCustomTo(today);
      syncUrl({ ...base, date: today, from: "", to: "" });
      return;
    }

    // Custom — keep current window until Search is clicked
    const from = fromDate || selectedDate || customFrom || todayIso();
    const to = toDate || selectedDate || customTo || todayIso();
    setDatePreset("custom");
    setCustomFrom(from);
    setCustomTo(to);
  };

  const applyCustomDateRange = () => {
    if (!customFrom || !customTo) return;
    const from = customFrom <= customTo ? customFrom : customTo;
    const to = customFrom <= customTo ? customTo : customFrom;
    setCustomFrom(from);
    setCustomTo(to);
    setDatePreset("custom");

    const base = {
      status: filterAccountStatus,
      kyc: filterKycStatus,
      phone: filterPhoneVerified,
      active: filterIsActive,
      role: filterRole,
    };

    if (from === to) {
      setSelectedDate(from);
      setFromDate("");
      setToDate("");
      syncUrl({ ...base, date: from, from: "", to: "" });
      return;
    }

    setSelectedDate("");
    setFromDate(from);
    setToDate(to);
    syncUrl({ ...base, date: "", from, to });
  };

  const users = allUsers.filter((u) => {
    if (filterRole === "all") {
      return ["user", "builder", "builder_staff", "agent"].includes(u.roleName);
    }
    return u.roleName === filterRole;
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((u) => {
      if (
        q &&
        !u.name?.toLowerCase().includes(q) &&
        !u.phone?.includes(q) &&
        !u.email?.toLowerCase().includes(q) &&
        !String(u._id || "").toLowerCase().includes(q) &&
        !String(u.id || "").toLowerCase().includes(q) &&
        !String(u.userId || "").toLowerCase().includes(q) &&
        !toLocalIso(u.createdAt).includes(q)
      ) {
        return false;
      }

      if (locationFilter) {
        const { value, type } = locationFilter;
        const field = u[type]?.toLowerCase() || "";
        if (!field.includes(value.toLowerCase())) return false;
      }

      if (!matchesAccountStatus(u.accountStatus, filterAccountStatus)) return false;

      if (filterKycStatus && u.kyc?.status !== filterKycStatus) return false;

      if (filterPhoneVerified) {
        const verified = Boolean(u.phoneVerified);
        if (filterPhoneVerified === "true" && !verified) return false;
        if (filterPhoneVerified === "false" && verified) return false;
      }

      if (filterIsActive) {
        const active = u.isActive !== false && u.accountStatus === "active";
        if (filterIsActive === "true" && !active) return false;
        if (filterIsActive === "false" && active) return false;
      }

      const createdDay = toLocalIso(u.createdAt);
      if (selectedDate && createdDay !== selectedDate) return false;

      if (fromDate || toDate) {
        if (!createdDay) return false;
        if (fromDate && createdDay < fromDate) return false;
        if (toDate && createdDay > toDate) return false;
      }

      return true;
    });
  }, [
    users,
    search,
    locationFilter,
    filterAccountStatus,
    filterKycStatus,
    filterPhoneVerified,
    filterIsActive,
    selectedDate,
    fromDate,
    toDate,
  ]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.accountStatus === "active").length,
      kycVerified: users.filter((u) => u.kyc?.status === "verified").length,
      phoneVerified: users.filter((u) => u.phoneVerified).length,
      locPending: users.filter((u) => u.accountStatus === "location_pending").length,
      joinedToday: users.filter((u) => toLocalIso(u.createdAt) === todayIso()).length,
    }),
    [users],
  );

  const hasFilters = Boolean(
    search ||
      filterAccountStatus ||
      filterKycStatus ||
      filterPhoneVerified ||
      filterIsActive ||
      locationFilter ||
      selectedDate ||
      fromDate ||
      toDate ||
      (filterRole && filterRole !== "all"),
  );

  const clearAll = () => {
    setSearch("");
    setFilterAccountStatus("");
    setFilterKycStatus("");
    setFilterPhoneVerified("");
    setFilterIsActive("");
    setLocationFilter(null);
    setFilterRole("all");
    setSelectedDate("");
    setFromDate("");
    setToDate("");
    setDatePreset("all");
    setCustomFrom(todayIso());
    setCustomTo(todayIso());
    setSearchParams({}, { replace: true });
  };

  const applyStatFilter = (key) => {
    const base = {
      status: "",
      kyc: "",
      phone: "",
      active: "",
      role: filterRole,
      date: "",
      from: "",
      to: "",
    };

    if (key === "total") {
      syncUrl(base);
      return;
    }
    if (key === "active") {
      syncUrl({ ...base, status: "active" });
      return;
    }
    if (key === "kyc") {
      syncUrl({ ...base, kyc: "verified" });
      return;
    }
    if (key === "phone") {
      syncUrl({ ...base, phone: "true" });
      return;
    }
    if (key === "locPending") {
      syncUrl({ ...base, status: "location_pending" });
      return;
    }
    if (key === "joinedToday") {
      syncUrl({ ...base, date: todayIso() });
    }
  };

  const formatLocation = (u) => {
    const parts = [u.locality, u.city, u.state, u.pincode].filter(Boolean);
    return parts.length ? parts : null;
  };

  const locQuery = locationFilter?.value || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/40 p-4 md:p-6 lg:p-8">
      <Header
        isLoading={isLoading}
        users={users}
        filtered={filtered}
        onRefresh={refetch}
      />
      <StatCards
        stats={stats}
        activeKey={
          selectedDate === todayIso() && !filterAccountStatus && !fromDate
            ? "joinedToday"
            : filterAccountStatus === "active"
              ? "active"
              : filterAccountStatus === "location_pending"
                ? "locPending"
                : filterKycStatus === "verified"
                  ? "kyc"
                  : filterPhoneVerified === "true"
                    ? "phone"
                    : !hasFilters
                      ? "total"
                      : null
        }
        onStatClick={applyStatFilter}
      />

      <div className="mb-3">
        <DashboardDateFilter
          preset={datePreset}
          onPresetChange={applyDatePreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          onApplyCustom={applyCustomDateRange}
          presets={USER_DATE_PRESETS}
          label="Joined date"
          trailing="Filter users by account created date"
        />
      </div>

      <SearchFiltersPanel
        search={search}
        setSearch={setSearch}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        users={users}
        filterAccountStatus={filterAccountStatus}
        setFilterAccountStatus={(value) => {
          setFilterAccountStatus(value);
          syncUrl({
            status: value,
            kyc: filterKycStatus,
            phone: filterPhoneVerified,
            active: filterIsActive,
            role: filterRole,
            date: selectedDate,
            from: fromDate,
            to: toDate,
          });
        }}
        filterKycStatus={filterKycStatus}
        setFilterKycStatus={setFilterKycStatus}
        filterPhoneVerified={filterPhoneVerified}
        setFilterPhoneVerified={setFilterPhoneVerified}
        filterIsActive={filterIsActive}
        setFilterIsActive={setFilterIsActive}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        hasFilters={hasFilters}
        selectedDate={selectedDate}
        fromDate={fromDate}
        toDate={toDate}
        onClearDate={() => applyDatePreset("all")}
        clearAll={clearAll}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <DesktopTable
          filtered={filtered}
          loading={isLoading}
          hasFilters={hasFilters}
          formatLocation={formatLocation}
          locQuery={locQuery}
        />
        <MobileCardView
          filtered={filtered}
          loading={isLoading}
          formatLocation={formatLocation}
          locQuery={locQuery}
        />
      </div>
      {!isLoading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Showing {filtered.length} of {users.length} users
          {locationFilter &&
            ` in ${locationFilter.type === "city" ? "city" : locationFilter.type} "${locationFilter.value}"`}
          {selectedDate && ` · joined ${selectedDate}`}
          {fromDate && toDate && ` · joined ${fromDate} → ${toDate}`}
        </p>
      )}
    </div>
  );
}
