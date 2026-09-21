import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { UserFilters } from "./components/UserFilters";
import { MobileRoleTabs } from "./components/MobileRoleTabs";
import { normalizeUsersResponse, useUsers } from "./hook/useUserData";
import { getAllUsers } from "../../../features/user/userService";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";
import { Pagination } from "./components/Pagination";
import SafeUserDeleteModal from "./components/SafeUserDeleteModal";
import { roleLabel } from "./constants/roleLabels";
import { todayIstIso } from "./utils/dateTime";
import {
  clearUsersFilterStorage,
  DEFAULT_PAGE_SIZE,
  parsePositiveInt,
  readUsersFilterStorage,
  rememberUsersListReturn,
  urlHasUsersFilters,
  writeUsersFilterStorage,
} from "./utils/usersFilterStorage";
import { fetchLoggedInUser } from "../../../services/UserServices/userServices";
import {
  deleteAccessUser,
  updateAccessUserStatus,
} from "../../../features/accessControl/accessControlService";
import { canUseLifecycleActions } from "../../../utils/userLifecycleAccess";

/** Build query params for GET /auth/all-users — fixed limit 20 (same as backend). */
const buildUsersApiParams = ({
  page = 1,
  q = "",
  location = "",
  role = "all",
  status = "",
  phone = "",
  active = "",
  date = "",
  from = "",
  to = "",
  exportMode = false,
} = {}) => {
  const params = {
    page: Math.max(1, Number(page) || 1),
    limit: exportMode ? 5000 : DEFAULT_PAGE_SIZE,
    platformOnly: 1,
  };
  if (exportMode) params.export = 1;
  const search = String(q || "").trim();
  if (search) params.q = search;
  const loc = String(location || "").trim();
  if (loc) params.location = loc;
  if (role && role !== "all") params.role = role;
  if (status === "onboarding") params.filter = "onboarding";
  else if (status) params.status = status;
  if (phone) params.phone = phone;
  if (active) params.active = active;
  if (from && to) {
    params.createdFrom = from;
    params.createdTo = to;
  } else if (date) {
    params.createdFrom = date;
    params.createdTo = date;
  }
  return params;
};

export default function Users() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableTopRef = useRef(null);
  const restoredRef = useRef(false);
  const skipPersistRef = useRef(false);
  const lastUrlTextRef = useRef({ q: null, location: null });

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") || searchParams.get("search") || "",
  );
  const [search, setSearch] = useState(
    () => searchParams.get("q") || searchParams.get("search") || "",
  );
  const [locationInput, setLocationInput] = useState(
    () => searchParams.get("location") || "",
  );
  const [locationSearch, setLocationSearch] = useState(
    () => searchParams.get("location") || "",
  );
  const [filterAccountStatus, setFilterAccountStatus] = useState("");
  const [filterKycStatus, setFilterKycStatus] = useState("");
  const [filterPhoneVerified, setFilterPhoneVerified] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterRole, setFilterRole] = useState("all");
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
  const [page, setPage] = useState(() =>
    parsePositiveInt(searchParams.get("page"), 1),
  );
  const pageSize = DEFAULT_PAGE_SIZE;

  const [actorRoleName, setActorRoleName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [statusBusyId, setStatusBusyId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiParams = useMemo(
    () =>
      buildUsersApiParams({
        page,
        q: search,
        location: locationSearch,
        role: filterRole,
        status: filterAccountStatus,
        phone: filterPhoneVerified,
        active: filterIsActive,
        date: selectedDate,
        from: fromDate,
        to: toDate,
      }),
    [
      page,
      search,
      locationSearch,
      filterRole,
      filterAccountStatus,
      filterPhoneVerified,
      filterIsActive,
      selectedDate,
      fromDate,
      toDate,
    ],
  );

  const {
    data: usersPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers(apiParams);

  const pagedUsers = usersPayload?.data || [];
  const meta = usersPayload?.meta || {
    total: 0,
    page: 1,
    limit: pageSize,
    pages: 1,
  };
  const stats = usersPayload?.stats || {
    total: 0,
    active: 0,
    kycVerified: 0,
    phoneVerified: 0,
    locPending: 0,
    joinedToday: 0,
  };
  const roleTabCounts = usersPayload?.roleCounts || {
    all: 0,
    user: 0,
    builder: 0,
    builder_staff: 0,
    agent: 0,
  };

  const totalFiltered = meta.total || 0;
  const totalPages = Math.max(1, meta.pages || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalFiltered);

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => {
        setActorRoleName(String(user?.roleName || ""));
        setCurrentUserId(String(user?._id || user?.id || ""));
      })
      .catch(() => {
        setActorRoleName("");
        setCurrentUserId("");
      });
  }, []);

  const changeUserActive = useCallback(
    async (user, isActive) => {
      if (!canUseLifecycleActions(actorRoleName) || !user?._id) return;
      setStatusBusyId(String(user._id));
      try {
        const result = await updateAccessUserStatus(user._id, isActive);
        toast.success(
          result?.message || (isActive ? "User activated" : "User deactivated"),
        );
        await refetch();
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Unable to update user status",
        );
      } finally {
        setStatusBusyId("");
      }
    },
    [actorRoleName, refetch],
  );

  const confirmDeleteUser = useCallback(async () => {
    if (!canUseLifecycleActions(actorRoleName) || !deleteTarget?._id) return;
    setDeleteLoading(true);
    try {
      const result = await deleteAccessUser(
        deleteTarget._id,
        actorRoleName === "business_development_head"
          ? "Deleted by Business Development Head from Users page"
          : "Deleted by Super Admin from Users page",
      );
      toast.success(result?.message || "User permanently deleted");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "User deletion failed");
    } finally {
      setDeleteLoading(false);
    }
  }, [actorRoleName, deleteTarget, refetch]);

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
    if (storedPage > 1) params.set("page", String(storedPage));

    if ([...params.keys()].length === 0) return;
    skipPersistRef.current = true;
    setSearchInput(stored.q || "");
    setSearch(stored.q || "");
    setLocationInput(stored.location || "");
    setLocationSearch(stored.location || "");
    setPage(storedPage);
    setSearchParams(params, { replace: true });
    queueMicrotask(() => {
      skipPersistRef.current = false;
    });
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
    if (nextPage > 1) params.set("page", String(nextPage));
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
      state.page > 1;
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
  });

  // Clamp URL page when server meta shrinks (filters / delete)
  useEffect(() => {
    if (isLoading || isFetching) return;
    if (page <= totalPages) return;
    const next = totalPages;
    setPage(next);
    syncUrl({
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      page: next,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, page, isLoading, isFetching]);

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
    setPage(1);
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
    if (key === "joinedToday") {
      syncUrl({ ...base, date: todayIstIso() });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;
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

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const exportParams = buildUsersApiParams({
        page: 1,
        q: search,
        location: locationSearch,
        role: filterRole,
        status: filterAccountStatus,
        phone: filterPhoneVerified,
        active: filterIsActive,
        date: selectedDate,
        from: fromDate,
        to: toDate,
        exportMode: true,
      });
      const res = await getAllUsers(exportParams);
      const normalized = normalizeUsersResponse(res?.data);
      const rowsSource = normalized.data || [];
      if (!rowsSource.length) {
        toast.message("No users to download for the current filters");
        return;
      }
      const rows = rowsSource.map((u, i) => ({
        NO: i + 1,
        Name: u.name || "",
        Email: u.email || "",
        Phone: u.phone || "",
        Role: roleLabel(u.roleName || u.role || u.roleId?.name),
        AccountStatus: String(u.accountStatus || "").replace(/_/g, " "),
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
      toast.success(
        `Downloaded ${rowsSource.length} user${rowsSource.length === 1 ? "" : "s"}`,
      );
    } catch {
      toast.error("Could not export Excel. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const goToPage = (nextPage) => {
    const target = Math.max(1, Number(nextPage) || 1);
    setPage(target);
    skipPersistRef.current = false;
    syncUrl({
      ...currentFilterBase(),
      date: selectedDate,
      from: fromDate,
      to: toDate,
      page: target,
    });
    tableTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Save filters + page, then open user — Back returns to same list state */
  const openUserDetail = useCallback(
    (userId) => {
      const id = String(userId || "").trim();
      if (!id) return;
      const working = {
        ...currentFilterBase(),
        date: selectedDate,
        from: fromDate,
        to: toDate,
        page: safePage,
      };
      skipPersistRef.current = false;
      writeUsersFilterStorage(working);
      const params = buildParams(working);
      const qs = params.toString();
      const returnTo = qs ? `/users?${qs}` : "/users";
      rememberUsersListReturn(returnTo);
      setSearchParams(params, { replace: true });
      navigate(`/dashboard/users/${id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filterAccountStatus,
      filterKycStatus,
      filterPhoneVerified,
      filterIsActive,
      filterRole,
      searchInput,
      locationInput,
      selectedDate,
      fromDate,
      toDate,
      safePage,
      navigate,
      setSearchParams,
    ],
  );

  const loadError =
    refreshError ||
    (isError
      ? error?.message || "Failed to load users. Please try again."
      : "");

  return (
    <div className="w-full max-w-full pb-28 md:pb-16">
      <Header
        isLoading={isLoading}
        isRefreshing={isRefreshing || isFetching}
        usersCount={stats.total || totalFiltered}
        filteredCount={totalFiltered}
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
        hasFilters={hasFilters}
        clearAll={clearAll}
        filteredCount={totalFiltered}
        isExporting={isExporting}
        onExportExcel={handleExportExcel}
      />

      <div
        ref={tableTopRef}
        className="overflow-hidden rounded-[18px] border border-[#d9ebe0] bg-white shadow-[0_1px_3px_rgba(23,33,43,0.04)]"
      >
        <DesktopTable
          filtered={pagedUsers}
          loading={isLoading && !pagedUsers.length}
          error={loadError && !pagedUsers.length ? loadError : ""}
          hasFilters={hasFilters}
          rowOffset={(safePage - 1) * pageSize}
          onRetry={handleRefresh}
          onClearFilters={clearAll}
          onOpenUser={openUserDetail}
          actorRoleName={actorRoleName}
          isSuperAdmin={actorRoleName === "super_admin"}
          currentUserId={currentUserId}
          statusBusy={Boolean(statusBusyId)}
          onActivate={(user) => changeUserActive(user, true)}
          onDeactivate={(user) => changeUserActive(user, false)}
          onRequestDelete={setDeleteTarget}
        />
        <MobileCardView
          filtered={pagedUsers}
          loading={isLoading && !pagedUsers.length}
          hasFilters={hasFilters}
          onClearFilters={clearAll}
          onOpenUser={openUserDetail}
          actorRoleName={actorRoleName}
          isSuperAdmin={actorRoleName === "super_admin"}
          currentUserId={currentUserId}
          statusBusy={Boolean(statusBusyId)}
          onActivate={(user) => changeUserActive(user, true)}
          onDeactivate={(user) => changeUserActive(user, false)}
          onRequestDelete={setDeleteTarget}
        />
        <Pagination
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalFiltered={totalFiltered}
          page={safePage}
          totalPages={totalPages}
          onPrev={() => goToPage(Math.max(1, safePage - 1))}
          onNext={() => goToPage(Math.min(totalPages, safePage + 1))}
        />
      </div>

      <SafeUserDeleteModal
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteUser}
      />

      <MobileRoleTabs
        value={filterRole || "all"}
        onChange={(role) => patchFilters({ role: role || "all" })}
        counts={roleTabCounts}
      />
    </div>
  );
}
