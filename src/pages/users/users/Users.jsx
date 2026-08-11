import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { UserFilters } from "./components/UserFilters";
import { useUsers } from "./hook/useUserData";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";
import { Pagination } from "./components/Pagination";
import { roleLabel } from "./constants/roleLabels";
import { todayIstIso, toIstIso } from "./utils/dateTime";
import {
  clearUsersFilterStorage,
  DEFAULT_PAGE_SIZE,
  parsePositiveInt,
  readUsersFilterStorage,
  urlHasUsersFilters,
  writeUsersFilterStorage,
} from "./utils/usersFilterStorage";

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
  const restoredRef = useRef(false);
  const skipPersistRef = useRef(false);
  const lastUrlTextRef = useRef({ q: null, location: null });

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
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState(() => todayIstIso());
  const [customTo, setCustomTo] = useState(() => todayIstIso());
  const [customError, setCustomError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => setLocationSearch(locationInput), 300);
    return () => clearTimeout(t);
  }, [locationInput]);

  // Restore last working filters + page when sidebar opens /users without query
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (urlHasUsersFilters(searchParams)) return;
    const stored = readUsersFilterStorage();
    if (!stored) return;

    const params = new URLSearchParams();
    if (stored.status) {
      if (stored.status === "onboarding") params.set("filter", "onboarding");
      else params.set("status", stored.status);
    }
    if (stored.kyc) params.set("kyc", stored.kyc);
    if (stored.phone) params.set("phone", stored.phone);
    if (stored.active) params.set("active", stored.active);
    if (stored.role && stored.role !== "all") params.set("role", stored.role);
    if (stored.date) {
      params.set("date", stored.date);
      params.set("createdFrom", stored.date);
      params.set("createdTo", stored.date);
    }
    if (stored.from && stored.to) {
      params.set("createdFrom", stored.from);
      params.set("createdTo", stored.to);
      if (stored.from !== stored.to) {
        params.set("from", stored.from);
        params.set("to", stored.to);
      } else {
        params.set("date", stored.from);
      }
    }
    if (stored.q) params.set("q", stored.q);
    if (stored.location) params.set("location", stored.location);
    const storedPage = parsePositiveInt(stored.page, 1);
    const storedPageSize = parsePositiveInt(stored.pageSize, DEFAULT_PAGE_SIZE);
    if (storedPage > 1) params.set("page", String(storedPage));
    if (storedPageSize !== DEFAULT_PAGE_SIZE) {
      params.set("pageSize", String(storedPageSize));
    }

    if ([...params.keys()].length === 0) return;
    skipPersistRef.current = true;
    setSearchInput(stored.q || "");
    setSearch(stored.q || "");
    setLocationInput(stored.location || "");
    setLocationSearch(stored.location || "");
    setPage(storedPage);
    setPageSize(storedPageSize);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

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
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const loc = searchParams.get("location") || "";
    const nextPage = parsePositiveInt(searchParams.get("page"), 1);
    const nextPageSize = parsePositiveInt(
      searchParams.get("pageSize"),
      DEFAULT_PAGE_SIZE,
    );

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
    setPage(nextPage);
    setPageSize(nextPageSize);
    if (lastUrlTextRef.current.q !== q) {
      lastUrlTextRef.current.q = q;
      setSearchInput(q);
      setSearch(q);
    }
    if (lastUrlTextRef.current.location !== loc) {
      lastUrlTextRef.current.location = loc;
      setLocationInput(loc);
      setLocationSearch(loc);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from URL only
  }, [searchParams, location.pathname]);

  const buildParams = (next) => {
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
    if (next.q) params.set("q", next.q);
    if (next.location) params.set("location", next.location);
    const nextPage = parsePositiveInt(next.page, 1);
    const nextPageSize = parsePositiveInt(next.pageSize, DEFAULT_PAGE_SIZE);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextPageSize !== DEFAULT_PAGE_SIZE) {
      params.set("pageSize", String(nextPageSize));
    }
    return params;
  };

  const persistFilters = (next) => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    const state = {
      status: next.status || "",
      kyc: next.kyc || "",
      phone: next.phone || "",
      active: next.active || "",
      role: next.role || "all",
      date: next.date || "",
      from: next.from || "",
      to: next.to || "",
      q: next.q || "",
      location: next.location || "",
      page: parsePositiveInt(next.page, 1),
      pageSize: parsePositiveInt(next.pageSize, DEFAULT_PAGE_SIZE),
    };
    const hasAny =
      Boolean(state.status) ||
      Boolean(state.kyc) ||
      Boolean(state.phone) ||
      Boolean(state.active) ||
      Boolean(state.date) ||
      Boolean(state.from) ||
      Boolean(state.to) ||
      Boolean(state.q) ||
      Boolean(state.location) ||
      (state.role && state.role !== "all") ||
      state.page > 1 ||
      state.pageSize !== DEFAULT_PAGE_SIZE;
    if (!hasAny) {
      clearUsersFilterStorage();
      return;
    }
    writeUsersFilterStorage(state);
  };

  const syncUrl = (next) => {
    const payload = {
      ...next,
      page: parsePositiveInt(next.page, page),
      pageSize: parsePositiveInt(next.pageSize, pageSize),
    };
    const params = buildParams(payload);
    persistFilters(payload);
    setSearchParams(params, { replace: true });
  };

  const currentFilterBase = () => ({
    status: filterAccountStatus,
    kyc: filterKycStatus,
    phone: filterPhoneVerified,
    active: filterIsActive,
    role: filterRole,
    q: searchInput,
    location: locationInput,
    page,
    pageSize,
  });

  // Debounce text filters into URL + session (survives leaving All Users)
  useEffect(() => {
    const t = setTimeout(() => {
      const urlQ = searchParams.get("q") || searchParams.get("search") || "";
      const urlLoc = searchParams.get("location") || "";
      if (searchInput === urlQ && locationInput === urlLoc) return;
      lastUrlTextRef.current = { q: searchInput, location: locationInput };
      setPage(1);
      syncUrl({
        status: filterAccountStatus,
        kyc: filterKycStatus,
        phone: filterPhoneVerified,
        active: filterIsActive,
        role: filterRole,
        date: selectedDate,
        from: fromDate,
        to: toDate,
        q: searchInput,
        location: locationInput,
        page: 1,
        pageSize,
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, locationInput]);

  const applyDatePreset = (preset) => {
    const base = { ...currentFilterBase(), page: 1 };
    setCustomError("");

    if (preset === "all") {
      setDatePreset("all");
      setSelectedDate("");
      setFromDate("");
      setToDate("");
      setPage(1);
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
      setPage(1);
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
    const base = { ...currentFilterBase(), page: 1 };
    setPage(1);

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
    const nextPage = "page" in patch ? parsePositiveInt(patch.page, 1) : 1;
    const next = {
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      ...patch,
      page: nextPage,
    };
    if ("status" in patch) setFilterAccountStatus(patch.status);
    if ("kyc" in patch) setFilterKycStatus(patch.kyc);
    if ("phone" in patch) setFilterPhoneVerified(patch.phone);
    if ("active" in patch) setFilterIsActive(patch.active);
    if ("role" in patch) setFilterRole(patch.role || "all");
    setPage(nextPage);
    syncUrl(next);
  };

  const users = useMemo(
    () =>
      allUsers.filter((u) => {
        const roleKey = String(u.roleName || u.role || u.roleId?.name || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_");
        const platformRoles = new Set([
          "user",
          "users",
          "owner",
          "owners",
          "builder",
          "builders",
          "builder_staff",
          "builderstaff",
          "agent",
          "agents",
        ]);
        if (filterRole === "all") {
          return platformRoles.has(roleKey);
        }
        const wanted = String(filterRole || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_");
        if (wanted === "user") {
          return ["user", "users", "owner", "owners"].includes(roleKey);
        }
        if (wanted === "agent") return roleKey === "agent" || roleKey === "agents";
        if (wanted === "builder") return roleKey === "builder" || roleKey === "builders";
        if (wanted === "builder_staff") {
          return roleKey === "builder_staff" || roleKey === "builderstaff";
        }
        return roleKey === wanted;
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  // Keep URL page in range after data is loaded (avoid wiping page while loading)
  useEffect(() => {
    if (isLoading && !allUsers.length) return;
    if (page === safePage) return;
    setPage(safePage);
    syncUrl({
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      page: safePage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, isLoading, allUsers.length]);
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
    skipPersistRef.current = true;
    clearUsersFilterStorage();
    lastUrlTextRef.current = { q: "", location: "" };
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
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
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
      q: searchInput,
      location: locationInput,
      page: 1,
      pageSize,
    };
    setPage(1);

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
    // In-page Refresh = reset working filters to initial + reload data
    clearAll();
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

  const handleExportExcel = () => {
    if (!filtered.length) {
      toast.message("No users to download for the current filters");
      return;
    }
    setIsExporting(true);
    try {
      const rows = filtered.map((u, i) => ({
        NO: i + 1,
        Name: u.name || "",
        Email: u.email || "",
        Phone: u.phone || "",
        Role: roleLabel(u.roleName || u.role || u.roleId?.name),
        AccountStatus: String(u.accountStatus || "").replace(/_/g, " "),
        KycStatus: String(u.kyc?.status || "not_started").replace(/_/g, " "),
        KycReason: u.kyc?.rejectionReason || u.kyc?.reason || "",
        PhoneVerified: u.phoneVerified ? "Verified" : "Not Verified",
        Locality: u.locality || "",
        City: u.city || "",
        State: u.state || "",
        Pincode: u.pincode || "",
        JoinedAt: u.createdAt
          ? new Date(u.createdAt).toLocaleString("en-IN")
          : "",
        UserId: String(u._id || u.id || u.userId || ""),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const stamp = todayIstIso();
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `users-filtered-${stamp}.xlsx`,
      );
      toast.success(`Downloaded ${filtered.length} user${filtered.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("Could not export Excel. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const goToPage = (nextPage) => {
    const target = Math.max(1, Number(nextPage) || 1);
    setPage(target);
    syncUrl({
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      page: target,
      pageSize,
    });
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changePageSize = (size) => {
    const nextSize = parsePositiveInt(size, DEFAULT_PAGE_SIZE);
    setPageSize(nextSize);
    setPage(1);
    syncUrl({
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      page: 1,
      pageSize: nextSize,
    });
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
        filteredCount={filtered.length}
        isExporting={isExporting}
        onExportExcel={handleExportExcel}
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
          onPageSizeChange={changePageSize}
          page={safePage}
          totalPages={totalPages}
          onPrev={() => goToPage(Math.max(1, safePage - 1))}
          onNext={() => goToPage(Math.min(totalPages, safePage + 1))}
        />
      </div>
    </div>
  );
}
