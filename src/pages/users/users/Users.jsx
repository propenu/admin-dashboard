import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { UserFilters } from "./components/UserFilters";
import { useUsers } from "./hook/useUserData";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";
import { Pagination } from "./components/Pagination";
import { todayIstIso, toIstIso } from "./utils/dateTime";

const ONBOARDING_STATUSES = [
  "location_pending",
  "kyc_pending",
  "pending",
  "incomplete",
];

const matchesAccountStatus = (userStatus, filterStatus) => {
  if (!filterStatus) return true;
  const status = String(userStatus || "").toLowerCase();
  if (filterStatus === "onboarding") return ONBOARDING_STATUSES.includes(status);
  if (filterStatus === "inactive") {
    return status === "inactive" || status === "";
  }
  return status === filterStatus;
};

const matchesLocation = (user, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [user.locality, user.city, user.state, user.pincode]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(q));
};

const matchesKyc = (kyc, filterKycStatus) => {
  if (!filterKycStatus) return true;
  const kycStatus = String(kyc?.status || "not_started").toLowerCase();
  if (filterKycStatus === "pending") {
    return kycStatus === "pending" || kycStatus === "not_started";
  }
  if (filterKycStatus === "not_started") {
    return kycStatus === "not_started";
  }
  return kycStatus === filterKycStatus;
};

export default function Users() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableTopRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [filterAccountStatus, setFilterAccountStatus] = useState("");
  const [filterKycStatus, setFilterKycStatus] = useState("");
  const [filterPhoneVerified, setFilterPhoneVerified] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const {
    data: allUsers = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState(() => todayIstIso());
  const [customTo, setCustomTo] = useState(() => todayIstIso());
  const [customError, setCustomError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => setLocationSearch(locationInput), 300);
    return () => clearTimeout(t);
  }, [locationInput]);

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
    if (!nextDate && joined === "today") nextDate = todayIstIso();
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
    } else if (nextDate && nextDate === todayIstIso()) {
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

  const currentFilterBase = () => ({
    status: filterAccountStatus,
    kyc: filterKycStatus,
    phone: filterPhoneVerified,
    active: filterIsActive,
    role: filterRole,
  });

  const applyDatePreset = (preset) => {
    const base = currentFilterBase();
    setCustomError("");

    if (preset === "all") {
      setDatePreset("all");
      setSelectedDate("");
      setFromDate("");
      setToDate("");
      syncUrl({ ...base, date: "", from: "", to: "" });
      return;
    }

    if (preset === "today") {
      const today = todayIstIso();
      setDatePreset("today");
      setSelectedDate(today);
      setFromDate("");
      setToDate("");
      setCustomFrom(today);
      setCustomTo(today);
      syncUrl({ ...base, date: today, from: "", to: "" });
      return;
    }

    const from = fromDate || selectedDate || customFrom || todayIstIso();
    const to = toDate || selectedDate || customTo || todayIstIso();
    setDatePreset("custom");
    setCustomFrom(from);
    setCustomTo(to);
  };

  const applyCustomDateRange = () => {
    if (!customFrom || !customTo) {
      setCustomError("Select both from and to dates");
      return;
    }
    const from = customFrom <= customTo ? customFrom : customTo;
    const to = customFrom <= customTo ? customTo : customFrom;
    if (customFrom > customTo) {
      setCustomError("Date range was swapped to a valid order");
    } else {
      setCustomError("");
    }
    setCustomFrom(from);
    setCustomTo(to);
    setDatePreset("custom");
    const base = currentFilterBase();

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

  const clearCustomDates = () => {
    setCustomError("");
    setCustomFrom(todayIstIso());
    setCustomTo(todayIstIso());
    applyDatePreset("all");
  };

  const patchFilters = (patch) => {
    const next = {
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      ...patch,
    };
    if ("status" in patch) setFilterAccountStatus(patch.status);
    if ("kyc" in patch) setFilterKycStatus(patch.kyc);
    if ("phone" in patch) setFilterPhoneVerified(patch.phone);
    if ("active" in patch) setFilterIsActive(patch.active);
    if ("role" in patch) setFilterRole(patch.role || "all");
    syncUrl(next);
  };

  const users = useMemo(
    () =>
      allUsers.filter((u) => {
        if (filterRole === "all") {
          return ["user", "builder", "builder_staff", "agent"].includes(
            u.roleName,
          );
        }
        return u.roleName === filterRole;
      }),
    [allUsers, filterRole],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => {
        if (
          q &&
          !u.name?.toLowerCase().includes(q) &&
          !u.phone?.includes(q) &&
          !u.email?.toLowerCase().includes(q) &&
          !String(u._id || "").toLowerCase().includes(q) &&
          !String(u.id || "").toLowerCase().includes(q) &&
          !String(u.userId || "").toLowerCase().includes(q)
        ) {
          return false;
        }

        if (!matchesLocation(u, locationSearch)) return false;
        if (!matchesAccountStatus(u.accountStatus, filterAccountStatus)) {
          return false;
        }
        if (!matchesKyc(u.kyc, filterKycStatus)) return false;

        if (filterPhoneVerified) {
          const verified = Boolean(u.phoneVerified);
          if (filterPhoneVerified === "true" && !verified) return false;
          if (filterPhoneVerified === "false" && verified) return false;
        }

        // Active = already onboarded (accountStatus === "active")
        if (filterIsActive) {
          const onboarded = String(u.accountStatus || "").toLowerCase() === "active";
          if (filterIsActive === "true" && !onboarded) return false;
          if (filterIsActive === "false" && onboarded) return false;
        }

        const createdDay = toIstIso(u.createdAt);
        if (selectedDate && createdDay !== selectedDate) return false;
        if (fromDate || toDate) {
          if (!createdDay) return false;
          if (fromDate && createdDay < fromDate) return false;
          if (toDate && createdDay > toDate) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
  }, [
    users,
    search,
    locationSearch,
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
      active: users.filter(
        (u) => String(u.accountStatus || "").toLowerCase() === "active",
      ).length,
      kycVerified: users.filter((u) => u.kyc?.status === "verified").length,
      phoneVerified: users.filter((u) => u.phoneVerified).length,
      locPending: users.filter((u) => u.accountStatus === "location_pending")
        .length,
      joinedToday: users.filter((u) => toIstIso(u.createdAt) === todayIstIso())
        .length,
    }),
    [users],
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    locationSearch,
    filterAccountStatus,
    filterKycStatus,
    filterPhoneVerified,
    filterIsActive,
    filterRole,
    selectedDate,
    fromDate,
    toDate,
    pageSize,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  const hasFilters = Boolean(
    searchInput ||
      locationInput ||
      filterAccountStatus ||
      filterKycStatus ||
      filterPhoneVerified ||
      filterIsActive ||
      selectedDate ||
      fromDate ||
      toDate ||
      (filterRole && filterRole !== "all"),
  );

  const clearAll = () => {
    setSearchInput("");
    setSearch("");
    setLocationInput("");
    setLocationSearch("");
    setFilterAccountStatus("");
    setFilterKycStatus("");
    setFilterPhoneVerified("");
    setFilterIsActive("");
    setFilterRole("all");
    setSelectedDate("");
    setFromDate("");
    setToDate("");
    setDatePreset("all");
    setCustomFrom(todayIstIso());
    setCustomTo(todayIstIso());
    setCustomError("");
    setMoreOpen(false);
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
      syncUrl({ ...base, date: todayIstIso() });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;
    setIsRefreshing(true);
    setRefreshError("");
    try {
      await refetch();
    } catch {
      setRefreshError("Could not refresh users. Try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadError =
    refreshError ||
    (isError
      ? error?.message || "Failed to load users. Please try again."
      : "");

  return (
    <div className="w-full max-w-full pb-16">
      <Header
        isLoading={isLoading}
        isRefreshing={isRefreshing || isFetching}
        usersCount={users.length}
        filteredCount={filtered.length}
        onRefresh={handleRefresh}
        error={refreshError}
      />

      <StatCards
        stats={stats}
        activeKey={
          selectedDate === todayIstIso() && !filterAccountStatus && !fromDate
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

      <UserFilters
        datePreset={datePreset}
        onDatePreset={applyDatePreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={(v) => {
          setCustomError("");
          setCustomFrom(v);
        }}
        onCustomToChange={(v) => {
          setCustomError("");
          setCustomTo(v);
        }}
        onApplyCustom={applyCustomDateRange}
        onClearCustom={clearCustomDates}
        customError={customError}
        search={searchInput}
        setSearch={setSearchInput}
        locationSearch={locationInput}
        setLocationSearch={setLocationInput}
        filterAccountStatus={filterAccountStatus}
        setFilterAccountStatus={(value) => patchFilters({ status: value })}
        filterKycStatus={filterKycStatus}
        setFilterKycStatus={(value) => patchFilters({ kyc: value })}
        filterPhoneVerified={filterPhoneVerified}
        setFilterPhoneVerified={(value) => patchFilters({ phone: value })}
        filterRole={filterRole}
        setFilterRole={(value) => patchFilters({ role: value || "all" })}
        filterIsActive={filterIsActive}
        setFilterIsActive={(value) => patchFilters({ active: value })}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        hasFilters={hasFilters}
        clearAll={clearAll}
      />

      <div
        ref={tableTopRef}
        className="overflow-hidden rounded-[18px] border border-[#d9ebe0] bg-white shadow-[0_1px_3px_rgba(23,33,43,0.04)]"
      >
        <DesktopTable
          filtered={pagedUsers}
          loading={isLoading && !allUsers.length}
          error={loadError && !allUsers.length ? loadError : ""}
          hasFilters={hasFilters}
          rowOffset={(safePage - 1) * pageSize}
          onRetry={handleRefresh}
          onClearFilters={clearAll}
        />
        <MobileCardView
          filtered={pagedUsers}
          loading={isLoading && !allUsers.length}
          hasFilters={hasFilters}
          onClearFilters={clearAll}
        />
        <Pagination
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalFiltered={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          page={safePage}
          totalPages={totalPages}
          onPrev={() => goToPage(Math.max(1, safePage - 1))}
          onNext={() => goToPage(Math.min(totalPages, safePage + 1))}
        />
      </div>
    </div>
  );
}
