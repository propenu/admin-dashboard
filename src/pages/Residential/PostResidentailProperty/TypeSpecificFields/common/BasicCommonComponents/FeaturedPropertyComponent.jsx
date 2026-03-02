
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/FeaturedPropertyComponent.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FeaturedPropertyComponent = () => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const isFeatured = !!form.isFeatured;

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg">
        <span className="text-sm font-semibold text-[#000000]">
          Featured Property
        </span>

        {/* ✅ Stable Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isFeatured}
          onClick={() => updateFieldValue("isFeatured", !isFeatured)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isFeatured ? "bg-[#27AE60]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isFeatured ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
      
    </div>
  );
};

export default FeaturedPropertyComponent;
