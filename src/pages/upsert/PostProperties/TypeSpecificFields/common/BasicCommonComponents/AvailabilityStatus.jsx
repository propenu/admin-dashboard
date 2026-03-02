import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";


const AVAILABILITY_OPTS = [
  { label: "Ready to move", value: "ready-to-move" },
  { label: "Under construction", value: "under-construction" },
];
const AvailabilityStatus = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div >
      <div className="space-y-3">
        <p className="text-[13px]  font-weight-bold text-[#000000] uppercase font-poppins">
          Availability Status
        </p>
        <div className="flex gap-2">
          {AVAILABILITY_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFieldValue("constructionStatus", opt.value)}
              className={`w-full flex-1 py-3 rounded-lg border text-[13px] t font-weight-bold transition-all ${
                form.constructionStatus === opt.value
                  ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                  : "border-[#000000] text-[#000000] "
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default AvailabilityStatus;
