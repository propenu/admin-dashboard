// frontend/admin-dashboard/src/pages/users/Users.jsx
import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { SearchFiltersPanel } from "./components/SearchFiltersPanel";
import { useUsers, useSearchUsers } from "./hook/useUserData";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";

const ONBOARDING_STATUSES = ["location_pending", "kyc_pending", "pending", "incomplete"];

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
  const { data: allUsers = [], isLoading, refetch } = useUsers();
  useSearchUsers(search);
  const [locationFilter, setLocationFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Apply dashboard drill-down filters from URL (e.g. /users?filter=onboarding&joined=today)
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
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    let nextDate = dateParam;
    if (!nextDate && joined === "today") nextDate = todayIso();
    if (!nextDate && from && to && from === to) nextDate = from;

    setFilterAccountStatus(status);
    setFilterKycStatus(kyc);
    setFilterPhoneVerified(phone);
    setFilterIsActive(active);
    setFilterRole(role === "" ? "all" : role);
    setSelectedDate(nextDate);
    setFromDate(from && to && from !== to ? from : "");
    setToDate(from && to && from !== to ? to : "");
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
    if (next.from && next.to && next.from !== next.to) {
      params.set("from", next.from);
      params.set("to", next.to);
    }
    setSearchParams(params, { replace: true });
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
      onboarding: users.filter((u) =>
        ONBOARDING_STATUSES.includes(String(u.accountStatus || "").toLowerCase()),
      ).length,
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
    if (key === "onboarding") {
      syncUrl({ ...base, status: "onboarding" });
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
          selectedDate === todayIso() && !filterAccountStatus
            ? "joinedToday"
            : filterAccountStatus === "onboarding"
              ? "onboarding"
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
        setSelectedDate={(value) => {
          setSelectedDate(value);
          setFromDate("");
          setToDate("");
          syncUrl({
            status: filterAccountStatus,
            kyc: filterKycStatus,
            phone: filterPhoneVerified,
            active: filterIsActive,
            role: filterRole,
            date: value,
            from: "",
            to: "",
          });
        }}
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
          {filterAccountStatus === "onboarding" && " · onboarding only"}
        </p>
      )}
    </div>
  );
}
