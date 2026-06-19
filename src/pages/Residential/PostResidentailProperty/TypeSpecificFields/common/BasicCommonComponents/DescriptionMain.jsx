

// frontend/.../TypeSpecificFields/common/BasicCommonComponents/DescriptionMain.jsx
import { forwardRef, memo, useMemo } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const MAX_CHAR_LIMIT = 500;

const DescriptionMain = forwardRef(({ error = "" }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const description = form?.description || "";

  const handleChange = (e) => {
    updateFieldValue("description", e.target.value.slice(0, MAX_CHAR_LIMIT));
  };

  const charCount = useMemo(() => description.length, [description]);
  const wordCount = useMemo(() => description.trim() ? description.trim().split(/\s+/).length : 0, [description]);
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.8;
  const pct = Math.round((charCount / MAX_CHAR_LIMIT) * 100);

  return (
    <div ref={ref} className="space-y-2">
      <label htmlFor="property-description" className="block text-xs font-bold text-[#374151] uppercase tracking-widest">
        Property Description
      </label>

      <textarea
        id="property-description"
        value={description}
        onChange={handleChange}
        rows={5}
        placeholder="Describe your property — key highlights, features, nearby facilities, and why it's the perfect choice..."
        className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border-2 outline-none transition-all resize-none leading-relaxed ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10"
        } placeholder:text-[#c9c9c9] text-[#111827]`}
      />

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-red-500 text-xs font-medium">{error}</p>
        ) : (
          <span className="text-[10px] text-[#9ca3af] font-medium">{wordCount} words</span>
        )}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isNearLimit ? "bg-orange-400" : "bg-[#27AE60]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold ${isNearLimit ? "text-orange-500" : "text-[#9ca3af]"}`}>
            {charCount}/{MAX_CHAR_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
});

export default memo(DescriptionMain);