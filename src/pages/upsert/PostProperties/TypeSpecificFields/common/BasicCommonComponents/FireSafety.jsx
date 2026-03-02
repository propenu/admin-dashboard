import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FIRE_SAFETY_OPTIONS = [
  { key: "fireExtinguisher", label: "Fire Extinguisher" },
  { key: "fireSprinklerSystem", label: "Fire Sprinkler System" },
  { key: "fireHoseReel", label: "Fire Hose Reel" },
  { key: "fireHydrant", label: "Fire Hydrant" },
  { key: "smokeDetector", label: "Smoke Detector" },
  { key: "fireAlarmSystem", label: "Fire Alarm System" },
  { key: "fireControlPanel", label: "Fire Control Panel" },
  { key: "emergencyExitSignage", label: "Emergency Exit Signage" },
];

const FireSafety = ({error}) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();
  const fireSafety = form.fireSafety || {};

  return (
    <div className="pt-6 border-t space-y-4">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Fire Safety
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIRE_SAFETY_OPTIONS.map((item) => {
          const checked = !!fireSafety[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg select-none"
            >
              <span className="text-sm font-weight-bold text-[#000000]">
                {item.label}
              </span>

              {/* Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() =>
                  updateNestedFieldValue("fireSafety", item.key, !checked)
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  checked ? "bg-[#27AE60]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    checked ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
};

export default FireSafety;
