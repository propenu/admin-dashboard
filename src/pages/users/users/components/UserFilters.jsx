import { useMemo, useState } from "react";
import { Download, Filter, Loader2, Search, X } from "lucide-react";
import { ROLE_OPTIONS } from "../constants/roleLabels";
import { FilterSelect } from "./ReusableComaponents";
import { MobileFiltersSheet } from "./MobileFiltersSheet";

const PHONE_OPTIONS = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

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
  hasFilters,
  clearAll,
  filteredCount = 0,
  isExporting = false,
  onExportExcel,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const mobileFilterCount = useMemo(() => {
    let n = 0;
    if (datePreset && datePreset !== "all") n += 1;
    if (locationSearch) n += 1;
    if (filterPhoneVerified) n += 1;
    return n;
  }, [
    datePreset,
    locationSearch,
    filterPhoneVerified,
  ]);

  return (
    <>
      {/* ── Mobile: search + filter button only ── */}
      <section className="mb-3 md:hidden">
        <div className="flex items-center gap-2">
          <SearchField
            id="users-search-mobile"
            label="Search users"
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            placeholder="Search name, email, phone"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-bold transition ${
              mobileFilterCount > 0
                ? "bg-[#12A150] text-white shadow-md shadow-[#12A150]/25"
                : "border border-[#dceee3] bg-white text-[#12A150]"
            }`}
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filters
            {mobileFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-white">
                {mobileFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {mobileFilterCount > 0 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {datePreset === "today" ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                Today
              </span>
            ) : null}
            {datePreset === "custom" ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                Custom dates
              </span>
            ) : null}
            {locationSearch ? (
              <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                Loc: {locationSearch}
              </span>
            ) : null}
            {filterPhoneVerified ? (
              <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                Phone:{" "}
                {PHONE_OPTIONS.find((o) => o.value === filterPhoneVerified)
                  ?.label || filterPhoneVerified}
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearAll}
              className="shrink-0 text-[11px] font-bold text-red-500"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </section>

      <MobileFiltersSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        datePreset={datePreset}
        onDatePreset={onDatePreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={onCustomFromChange}
        onCustomToChange={onCustomToChange}
        onApplyCustom={onApplyCustom}
        onClearCustom={onClearCustom}
        customError={customError}
        locationSearch={locationSearch}
        setLocationSearch={setLocationSearch}
        filterAccountStatus={filterAccountStatus}
        setFilterAccountStatus={setFilterAccountStatus}
        filterKycStatus={filterKycStatus}
        setFilterKycStatus={setFilterKycStatus}
        filterPhoneVerified={filterPhoneVerified}
        setFilterPhoneVerified={setFilterPhoneVerified}
        hasFilters={hasFilters}
        clearAll={clearAll}
        filteredCount={filteredCount}
        isExporting={isExporting}
        onExportExcel={onExportExcel}
      />

      {/* ── Desktop / tablet: full filter bar (role kept here; mobile uses bottom tabs) ── */}
      <section className="mb-4 hidden rounded-[18px] border border-[#d9ebe0] bg-white p-4 shadow-[0_1px_3px_rgba(23,33,43,0.03)] md:block">
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
          <div className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-[#d9ebe0] bg-[#f7fbf8] p-2.5">
            <div className="min-w-[140px] flex-1">
              <label
                htmlFor="users-custom-from"
                className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                From
              </label>
              <input
                id="users-custom-from"
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#dceee3] bg-white px-3 text-sm text-[#102033] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
              />
            </div>
            <div className="min-w-[140px] flex-1">
              <label
                htmlFor="users-custom-to"
                className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                To
              </label>
              <input
                id="users-custom-to"
                type="date"
                value={customTo}
                onChange={(e) => onCustomToChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#dceee3] bg-white px-3 text-sm text-[#102033] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
              />
            </div>
            <button
              type="button"
              onClick={onApplyCustom}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#12A150] px-4 text-sm font-semibold text-white transition hover:bg-[#0f8f46]"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClearCustom}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dceee3] bg-white px-3 text-sm font-semibold text-slate-500"
            >
              Clear dates
            </button>
            {customError ? (
              <p className="w-full text-xs font-medium text-amber-600">
                {customError}
              </p>
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
            id="users-phone-status"
            label="Phone Status"
            value={filterPhoneVerified}
            onChange={setFilterPhoneVerified}
            placeholder="Phone Status"
            options={PHONE_OPTIONS}
          />

          <button
            type="button"
            onClick={onExportExcel}
            disabled={isExporting || filteredCount === 0}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#dceee3] bg-white px-3 text-sm font-semibold text-[#12A150] transition hover:bg-[#12A150]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Excel
          </button>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-500"
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
};
