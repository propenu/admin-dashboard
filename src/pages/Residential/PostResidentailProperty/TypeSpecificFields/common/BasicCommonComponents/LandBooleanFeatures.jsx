import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BOOLEAN_FIELDS = [
  { key: "readyToConstruct", label: "Ready to Construct" },
  { key: "waterConnection", label: "Water Connection Available" },
  { key: "electricityConnection", label: "Electricity Connection Available" },
  { key: "fencing", label: "Fencing Done" },
  { key: "cornerPlot", label: "Corner Plot" },
  { key: "isPriceNegotiable", label: "Price Negotiable" },
];

const LandBooleanFeatures = () => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const toggleValue = (key) => {
    updateFieldValue(key, !form[key]);
  };

  return (
    <div className="pt-6 border-t space-y-4">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Land Features
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BOOLEAN_FIELDS.map((item) => {
          const checked = !!form[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-sm font-weight-bold text-[#000000]">
                {item.label}
              </span>

              {/* ✅ STABLE BUTTON TOGGLE */}
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => toggleValue(item.key)}
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
    </div>
  );
};

export default LandBooleanFeatures;
