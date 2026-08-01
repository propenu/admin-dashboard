import { Filter, Search, X } from "lucide-react";
import { ROLE_OPTIONS } from "../constants/roleLabels";
import { FilterSelect } from "./ReusableComaponents";
import { MoreFiltersPanel } from "./MoreFiltersPanel";

const SearchField = ({
  id,
  label,
  value,
  onChange,
  onClear,
  placeholder,
  className = "",
}) => (
  <div className={`relative min-w-0 ${className}`}>
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <Search
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden
    />
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-[#dceee3] bg-white py-2 pl-10 pr-9 text-sm text-[#102033] placeholder:text-slate-400 focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
    />
    {value ? (
      <button
        type="button"
        aria-label={`Clear ${label}`}
        onClick={onClear}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    ) : null}
  </div>
);

export const UserFilters = ({
  datePreset,
  onDatePreset,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onClearCustom,
  customError,
  search,
  setSearch,
  locationSearch,
  setLocationSearch,
  filterAccountStatus,
  setFilterAccountStatus,
  filterKycStatus,
  setFilterKycStatus,
  filterPhoneVerified,
  setFilterPhoneVerified,
  filterRole,
  setFilterRole,
  filterIsActive,
  setFilterIsActive,
  moreOpen,
  setMoreOpen,
  hasFilters,
  clearAll,
}) => {
  return (
    <section className="mb-3 rounded-[18px] border border-[#d9ebe0] bg-white p-3 shadow-[0_1px_3px_rgba(23,33,43,0.03)] sm:mb-4 sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Joined Date
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "all", label: "All time" },
            { key: "today", label: "Today" },
            { key: "custom", label: "Custom" },
          ].map((item) => {
            const active = datePreset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onDatePreset(item.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
                  active
                    ? "bg-[#12A150] text-white shadow-sm"
                    : "border border-[#d9ebe0] bg-white text-slate-500 hover:border-[#12A150]/35 hover:text-[#12A150]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {datePreset === "custom" ? (
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div>
            <label
              htmlFor="users-custom-from"
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400"
            >
              From
            </label>
            <input
              id="users-custom-from"
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="h-10 rounded-xl border border-[#d9ebe0] bg-white px-3 text-sm text-[#102033] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
            />
          </div>
          <div>
            <label
              htmlFor="users-custom-to"
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400"
            >
              To
            </label>
            <input
              id="users-custom-to"
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="h-10 rounded-xl border border-[#d9ebe0] bg-white px-3 text-sm text-[#102033] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
            />
          </div>
          <button
            type="button"
            onClick={onApplyCustom}
            className="h-10 rounded-xl bg-[#12A150] px-3.5 text-xs font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#12A150]/20"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClearCustom}
            className="h-10 rounded-xl border border-[#d9ebe0] bg-white px-3.5 text-xs font-semibold text-slate-500 hover:text-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/15"
          >
            Clear
          </button>
          {customError ? (
            <p className="w-full text-xs font-medium text-amber-600">{customError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SearchField
          id="users-search"
          label="Search by name, email or phone"
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Search by name, email or phone"
        />
        <SearchField
          id="users-location-search"
          label="Search by location"
          value={locationSearch}
          onChange={setLocationSearch}
          onClear={() => setLocationSearch("")}
          placeholder="Search by location"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <FilterSelect
          id="users-role-filter"
          label="Role"
          value={filterRole === "all" ? "" : filterRole}
          onChange={(value) => setFilterRole(value || "all")}
          placeholder="All Roles"
          options={ROLE_OPTIONS}
        />
        <FilterSelect
          id="users-account-status"
          label="Account Status"
          value={filterAccountStatus}
          onChange={setFilterAccountStatus}
          placeholder="Account Status"
          options={[
            { value: "active", label: "Active" },
            { value: "location_pending", label: "Location Pending" },
            { value: "kyc_pending", label: "KYC Pending" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
            { value: "blocked", label: "Blocked" },
            { value: "onboarding", label: "Onboarding" },
          ]}
        />
        <FilterSelect
          id="users-kyc-status"
          label="KYC Status"
          value={filterKycStatus}
          onChange={setFilterKycStatus}
          placeholder="KYC Status"
          options={[
            { value: "verified", label: "Verified" },
            { value: "pending", label: "Pending" },
            { value: "rejected", label: "Rejected" },
            { value: "not_started", label: "Not Submitted" },
          ]}
        />
        <FilterSelect
          id="users-phone-status"
          label="Phone Status"
          value={filterPhoneVerified}
          onChange={setFilterPhoneVerified}
          placeholder="Phone Status"
          options={[
            { value: "true", label: "Verified" },
            { value: "false", label: "Not Verified" },
          ]}
        />

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
            moreOpen
              ? "border-[#12A150] bg-[#12A150]/10 text-[#12A150]"
              : "border-[#dceee3] bg-white text-[#12A150] hover:bg-[#12A150]/5"
          }`}
        >
          <Filter className="h-4 w-4" aria-hidden />
          More Filters
        </button>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            Clear
          </button>
        ) : null}
      </div>

      <MoreFiltersPanel
        open={moreOpen}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterIsActive={filterIsActive}
        setFilterIsActive={setFilterIsActive}
        onClose={() => setMoreOpen(false)}
        onClearExtra={() => {
          setFilterRole("all");
          setFilterIsActive("");
        }}
      />
    </section>
  );
};
