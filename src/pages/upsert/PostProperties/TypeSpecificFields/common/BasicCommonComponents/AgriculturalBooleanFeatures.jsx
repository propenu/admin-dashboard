import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BOOLEAN_FIELDS = [
  {
    key: "boundaryWall",
    label: "Boundary Wall Available",
  },
  {
    key: "electricityConnection",
    label: "Electricity Connection",
  },
];

const AgricuturalBooleanFeatures = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="pt-6 border-t space-y-4">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Agricutural Features
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BOOLEAN_FIELDS.map((item) => {
          const isActive = Boolean(form[item.key]);

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-sm font-weight-bold text-[#000000]">
                {item.label}
              </span>

              {/* BUTTON TOGGLE (NO CHECKBOX, NO PEER) */}
              <button
                type="button"
                onClick={() => updateFieldValue(item.key, !isActive)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                  isActive ? "bg-[#27AE60]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    isActive ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default AgricuturalBooleanFeatures;
