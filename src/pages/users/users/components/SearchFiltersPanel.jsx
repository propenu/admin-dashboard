
import { Filter, Search, Tag, X } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { FilterSelect } from "./ReusableComaponents";
import { ACCOUNT_STATUS_MAP } from "../constants/accountStatusMap";
import { KYC_STATUS_MAP } from "../constants/kycStatusMap";

export const SearchFiltersPanel = ({ 
    search, 
    setSearch, 
    locationFilter, 
    setLocationFilter, 
    users, 
    filterAccountStatus, 
    setFilterAccountStatus, 
    filterKycStatus, 
    setFilterKycStatus, 
    filterPhoneVerified, 
    setFilterPhoneVerified, 
    filterIsActive, 
    setFilterIsActive, 
    filterRole, 
    setFilterRole,
    hasFilters,
    clearAll
}) => {
    return (
        <div className="bg-white rounded-2xl  border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        <div className="flex w-full gap-4">
          {/* Search Input */}
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#27AE60]
                 focus:ring-4 focus:ring-[#27AE60]/10 shadow-sm transition-all duration-200"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Location Search */}
          <div className="flex-1">
            <LocationSearch
              users={users}
              onFilter={setLocationFilter}
              activeTag={locationFilter}
              onClearTag={() => setLocationFilter(null)}
            />
          </div>
        </div>
        {/* Row 3: Dropdown filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>

          <FilterSelect
            value={filterRole}
            onChange={setFilterRole}
            placeholder="All Roles"
            options={[
              { value: "super_admin", label: "Super Admin" },
              { value: "admin", label: "Admin" },
              { value: "sales_manager", label: "Sales Manager" },
              { value: "sales_agent", label: "Sales Agent" },
              { value: "accounts", label: "Accounts" },
              { value: "user", label: "User" },
              { value: "agent", label: "Agent" },
              { value: "builder", label: "Builder" },
              { value: "customer_care", label: "Customer Care" },
            ]}
          />

          <FilterSelect
            value={filterAccountStatus}
            onChange={setFilterAccountStatus}
            placeholder="All Statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "location_pending", label: "Location Pending" },
              { value: "kyc_pending", label: "KYC Pending" },
            ]}
          />
          <FilterSelect
            value={filterKycStatus}
            onChange={setFilterKycStatus}
            placeholder="All KYC"
            options={[
              { value: "verified", label: "KYC Verified" },
              { value: "not_started", label: "Not Started" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
          <FilterSelect
            value={filterPhoneVerified}
            onChange={setFilterPhoneVerified}
            placeholder="Phone Status"
            options={[
              { value: "true", label: "Phone Verified" },
              { value: "false", label: "Unverified" },
            ]}
          />
          <FilterSelect
            value={filterIsActive}
            onChange={setFilterIsActive}
            placeholder="Active Status"
            options={[
              { value: "true", label: "Is Active" },
              { value: "false", label: "Inactive" },
            ]}
          />

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600
                         bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Active filter tags summary */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
            <span className="text-[11px] text-gray-400 self-center">
              Active:
            </span>
            {search && (
              <Tag
                label={`Search: "${search}"`}
                onRemove={() => setSearch("")}
                color="gray"
              />
            )}
            {locationFilter && (
              <Tag
                label={`${locationFilter.type === "city" ? "City" : locationFilter.type === "state" ? "State" : locationFilter.type === "locality" ? "Locality" : "Pincode"}: ${locationFilter.value}`}
                onRemove={() => setLocationFilter(null)}
                color="green"
              />
            )}
            {filterAccountStatus && (
              <Tag
                label={`Status: ${ACCOUNT_STATUS_MAP[filterAccountStatus]?.label || filterAccountStatus}`}
                onRemove={() => setFilterAccountStatus("")}
                color="amber"
              />
            )}
            {filterKycStatus && (
              <Tag
                label={`KYC: ${KYC_STATUS_MAP[filterKycStatus]?.label || filterKycStatus}`}
                onRemove={() => setFilterKycStatus("")}
                color="blue"
              />
            )}
            {filterPhoneVerified && (
              <Tag
                label={`Phone: ${filterPhoneVerified === "true" ? "Verified" : "Unverified"}`}
                onRemove={() => setFilterPhoneVerified("")}
                color="purple"
              />
            )}
            {filterIsActive && (
              <Tag
                label={`Active: ${filterIsActive === "true" ? "Yes" : "No"}`}
                onRemove={() => setFilterIsActive("")}
                color="gray"
              />
            )}
          </div>
        )}
      </div>
    )

  };