import { ROLE_OPTIONS } from "../constants/roleLabels";
import { FilterSelect } from "./ReusableComaponents";

export const MoreFiltersPanel = ({
  open,
  filterRole,
  setFilterRole,
  filterIsActive,
  setFilterIsActive,
  onClose,
  onClearExtra,
}) => {
  if (!open) return null;

  return (
    <div className="mt-3 rounded-2xl border border-[#d9ebe0] bg-[#f7fbf8] p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          More filters
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearExtra}
            className="text-xs font-semibold text-slate-500 hover:text-[#12A150]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#12A150]"
          >
            Done
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <FilterSelect
          id="users-role-filter-more"
          label="User role"
          value={filterRole === "all" ? "" : filterRole}
          onChange={(value) => setFilterRole(value || "all")}
          placeholder="All Roles"
          options={ROLE_OPTIONS}
        />
        <FilterSelect
          id="users-active-filter"
          label="Onboarded status"
          value={filterIsActive}
          onChange={setFilterIsActive}
          placeholder="Onboarded Status"
          options={[
            { value: "true", label: "Active (Onboarded)" },
            { value: "false", label: "Not Active" },
          ]}
        />
      </div>
    </div>
  );
};
