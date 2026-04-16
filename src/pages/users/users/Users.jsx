// frontend/admin-dashboard/src/pages/users/Users.jsx
import { useEffect, useState, useMemo } from "react";
import {
  X,
} from "lucide-react";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { SearchFiltersPanel } from "./components/SearchFiltersPanel";
import {useUsers, useSearchUsers} from "./hook/useUserData";
import { MobileCardView } from "./components/MobileCardView";
import { DesktopTable } from "./components/DesktopTable";

export default function Users() {
  // General filters
  const [search, setSearch] = useState("");
  const [filterAccountStatus, setFilterAccountStatus] = useState("");
  const [filterKycStatus, setFilterKycStatus] = useState("");
  const [filterPhoneVerified, setFilterPhoneVerified] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterRole, setFilterRole] = useState("user"); 
  const { data: allUsers = [], isLoading, refetch } = useUsers();
  const { data: searchData = {} } = useSearchUsers(search);
  const [locationFilter, setLocationFilter] = useState(null);

  useEffect(() => {
    refetch();
  }, []);


// const users = search ? searchData?.results || [] :  allUsers;

const users =   allUsers;

const filtered = useMemo(() => {

  const q = search.trim().toLowerCase();

  return users.filter((u) => {
    if (
      q &&
      !u.name?.toLowerCase().includes(q) &&
      !u.phone?.includes(q) &&
      !u.email?.toLowerCase().includes(q)
    )
      return false;

    if (filterRole && u.roleName !== filterRole) return false;

    if (locationFilter) {
      const { value, type } = locationFilter;
      const field = u[type]?.toLowerCase() || "";
      if (!field.includes(value.toLowerCase())) return false;
    }

    if (filterAccountStatus && u.accountStatus !== filterAccountStatus)
      return false;

    if (filterKycStatus && u.kyc?.status !== filterKycStatus) return false;

    if (filterPhoneVerified !== "") {
      const want = filterPhoneVerified === "true";
      if (!!u.phoneVerified !== want) return false;
    }

    if (filterIsActive !== "") {
      const want = filterIsActive === "true";
      if (!!u.isActive !== want) return false;
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
  filterRole,
]);


  /* ── Stats ── */
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.accountStatus === "active").length,
      kycVerified: users.filter((u) => u.kyc?.status === "verified").length,
      phoneVerified: users.filter((u) => u.phoneVerified).length,
      locPending: users.filter((u) => u.accountStatus === "location_pending")
        .length,
    }),
    [users],
  );

  const hasFilters =
    search ||
    filterAccountStatus ||
    filterKycStatus ||
    filterPhoneVerified ||
    filterIsActive ||
    locationFilter;

  const clearAll = () => {
    setSearch("");
    setFilterAccountStatus("");
    setFilterKycStatus("");
    setFilterPhoneVerified("");
    setFilterIsActive("");
    setLocationFilter(null);
    setFilterRole("user"); // ✅ reset to default user
  };

  /* ── Format location for display ── */
  const formatLocation = (u) => {
    const parts = [u.locality, u.city, u.state, u.pincode].filter(Boolean);
    return parts.length ? parts : null;
  };

  /* ── Highlight location fields matching active filter ── */
  const locQuery = locationFilter?.value || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/40 p-4 md:p-6 lg:p-8">
      <Header
        isLoading={isLoading}
        users={users}
        filtered={filtered}
        onRefresh={refetch}
      />

     
      <StatCards stats={stats} />

      
      <SearchFiltersPanel
        search={search}
        setSearch={setSearch}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        users={users}
        filterAccountStatus={filterAccountStatus}
        setFilterAccountStatus={setFilterAccountStatus}
        filterKycStatus={filterKycStatus}
        setFilterKycStatus={setFilterKycStatus}
        filterPhoneVerified={filterPhoneVerified}
        setFilterPhoneVerified={setFilterPhoneVerified}
        filterIsActive={filterIsActive}
        setFilterIsActive={setFilterIsActive}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        hasFilters={hasFilters}
        clearAll={clearAll}
      />

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Desktop Table ── */}
        <DesktopTable
          filtered={filtered}
          loading={isLoading}
          hasFilters={hasFilters}
          formatLocation={formatLocation}
          locQuery={locQuery}
        /> 
        {/* ── Mobile Card View ── */}
        <MobileCardView
          filtered={filtered}
          loading={isLoading}
          formatLocation={formatLocation}
          locQuery={locQuery}
        />
      </div>
      {/* Footer count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Showing {filtered.length} of {users.length} users
          {locationFilter &&
            ` in ${locationFilter.type === "city" ? "city" : locationFilter.type} "${locationFilter.value}"`}
        </p>
      )}
    </div>
  );
}
/* ── Filter Tag ── */
const TAG_COLORS = {
  green: "bg-[#27AE60]/10 text-[#27AE60]",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  purple: "bg-purple-50 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

const Tag = ({ label, onRemove, color = "gray" }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${TAG_COLORS[color]}`}>
    {label}
    <button onClick={onRemove} className="hover:opacity-60 transition-opacity">
      <X className="w-3 h-3" />
    </button>
  </span>
);
