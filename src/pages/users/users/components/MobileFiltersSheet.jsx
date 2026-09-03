import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Filter,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { FilterSelect } from "./ReusableComaponents";

const PHONE_OPTIONS = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

const Chip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? "bg-[#12A150] text-white shadow-sm"
        : "border border-[#d9ebe0] bg-white text-slate-500"
    }`}
  >
    {children}
  </button>
);

/** Mobile-only bottom sheet for date / location / status filters */
export function MobileFiltersSheet({
  open,
  onClose,
  datePreset,
  onDatePreset,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onClearCustom,
  customError,
  locationSearch,
  setLocationSearch,
  filterAccountStatus,
  setFilterAccountStatus,
  filterKycStatus,
  setFilterKycStatus,
  filterPhoneVerified,
  setFilterPhoneVerified,
  hasFilters,
  clearAll,
  filteredCount = 0,
  isExporting = false,
  onExportExcel,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-[28px] border border-[#d9ebe0] bg-white shadow-2xl md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-[#eef5f0] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12A150]/10 text-[#12A150]">
                  <Filter className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#102033]">Filters</p>
                  <p className="text-[11px] text-slate-400">
                    {filteredCount} users match
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> Joined
                </p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={datePreset === "all"}
                    onClick={() => onDatePreset("all")}
                  >
                    All time
                  </Chip>
                  <Chip
                    active={datePreset === "today"}
                    onClick={() => onDatePreset("today")}
                  >
                    Today
                  </Chip>
                  <Chip
                    active={datePreset === "custom"}
                    onClick={() => onDatePreset("custom")}
                  >
                    Custom
                  </Chip>
                </div>
                {datePreset === "custom" ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#d9ebe0] bg-[#f7fbf8] p-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                        From
                      </label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => onCustomFromChange(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#dceee3] bg-white px-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                        To
                      </label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => onCustomToChange(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#dceee3] bg-white px-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={onApplyCustom}
                      className="col-span-2 h-10 rounded-xl bg-[#12A150] text-sm font-bold text-white"
                    >
                      Apply dates
                    </button>
                    <button
                      type="button"
                      onClick={onClearCustom}
                      className="col-span-2 text-xs font-semibold text-slate-500"
                    >
                      Clear dates
                    </button>
                    {customError ? (
                      <p className="col-span-2 text-xs text-amber-600">
                        {customError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="City, locality, state…"
                    className="h-11 w-full rounded-2xl border border-[#dceee3] bg-[#f7fbf8] py-2 pl-10 pr-9 text-sm"
                  />
                  {locationSearch ? (
                    <button
                      type="button"
                      onClick={() => setLocationSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Status filters
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <FilterSelect
                    id="m-phone"
                    label="Phone Status"
                    value={filterPhoneVerified}
                    onChange={setFilterPhoneVerified}
                    placeholder="Phone Status"
                    options={PHONE_OPTIONS}
                    className="!max-w-none sm:!w-full"
                  />
                </div>
              </section>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExportExcel}
                  disabled={isExporting || filteredCount === 0}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#dceee3] text-sm font-bold text-[#12A150] disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Excel
                </button>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearAll();
                    }}
                    className="h-11 rounded-2xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-500"
                  >
                    Clear
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 flex-1 rounded-2xl bg-[#12A150] text-sm font-bold text-white shadow-md shadow-[#12A150]/25"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
