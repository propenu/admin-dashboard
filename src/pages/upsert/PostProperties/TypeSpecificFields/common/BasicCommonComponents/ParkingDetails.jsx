

// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/ParkingDetails.jsx

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

export const PARKING_TYPES = [
  { label: "Covered", value: "covered" },
  { label: "Open", value: "open" },
  { label: "Stilt", value: "stilt" },
  { label: "Basement", value: "basement" },
  { label: "Street", value: "street" },
  { label: "Dedicated", value: "dedicated" },
  { label: "Shared", value: "shared" },
];

const ParkingDetails = ({ errors = {} }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click (same as Facing)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedParking =
    PARKING_TYPES.find((p) => p.value === form.parkingType)?.label ||
    "Select Parking Type";

  return (
    <div className="pt-6 border-t border-gray-200">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins mb-2">
        Parking Details (Optional)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PARKING TYPE */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <p className="text-sm font-weight-bold text-[#000000]">
            Parking Type
          </p>

          {/* INPUT BOX (same as Facing) */}
          <div
            onClick={() => setOpen(!open)}
            className="relative cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
          >
            {selectedParking}

            <ChevronDown
              size={16}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
          {errors.parkingType && (
            <p className="text-red-500 text-xs">{errors.parkingType}</p>
          )}

          {/* DROPDOWN LIST */}
          {open && (
            <div
              className="absolute text-[#000000] top-full left-0 mt-2 w-full rounded-xl border border-[#27AD75] bg-white shadow-lg z-50 overflow-y-auto custom-scrollbar1"
              style={{ maxHeight: "150px" }}
            >
              {PARKING_TYPES.map((opt, idx) => {
                const isSelected = form.parkingType === opt.value;
                const isFirst = idx === 0;
                const isLast = idx === PARKING_TYPES.length - 1;

                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      updateFieldValue("parkingType", opt.value);
                      setOpen(false);
                    }}
                    className={`
                      px-4 py-3 text-sm cursor-pointer
                      text-[#000000]
                      hover:bg-green-100
                      ${isSelected ? "bg-green-100 font-medium" : ""}
                      ${isFirst ? "rounded-t-xl" : ""}
                      ${isLast ? "rounded-b-xl" : ""}
                      ${!isLast ? "border-b border-[#27AD75]" : ""}
                    `}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TWO WHEELER PARKING */}
        <div className="space-y-2">
          <p className="text-sm font-weight-bold text-[#000000]">
            Two-Wheeler Parking
          </p>

          <div className="flex items-center justify-between px-4 py-2 border border-[#27AD75] rounded-lg">
            <button
              type="button"
              onClick={() =>
                updateFieldValue(
                  "twoWheeler",
                  Math.max(0, (form.twoWheeler || 0) - 1)
                )
              }
              className="text-xl text-[#000000]"
            >
              −
            </button>

            <span className="text-sm font-weight-bold text-gray-800">
              {form.twoWheeler || 0}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFieldValue("twoWheeler", (form.twoWheeler || 0) + 1)
              }
              className="text-xl text-[#000000]"
            >
              +
            </button>
          </div>
          {errors.twoWheeler && (
            <p className="text-red-500 text-xs">{errors.twoWheeler}</p>
          )}
        </div>

        {/* FOUR WHEELER PARKING */}
        <div className="space-y-2">
          <p className="text-sm font-weight-bold text-[#000000]">
            Four-Wheeler Parking
          </p>

          <div className="flex items-center justify-between px-4 py-2 border border-[#27AD75] rounded-lg">
            <button
              type="button"
              onClick={() =>
                updateFieldValue(
                  "fourWheeler",
                  Math.max(0, (form.fourWheeler || 0) - 1)
                )
              }
              className="text-xl text-[#000000]"
            >
              −
            </button>

            <span className="text-sm font-weight-bold text-[#000000]">
              {form.fourWheeler || 0}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFieldValue("fourWheeler", (form.fourWheeler || 0) + 1)
              }
              className="text-xl text-[#000000]"
            >
              +
            </button>
          </div>
          {errors.fourWheeler && (
            <p className="text-red-500 text-xs">{errors.fourWheeler}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingDetails;
