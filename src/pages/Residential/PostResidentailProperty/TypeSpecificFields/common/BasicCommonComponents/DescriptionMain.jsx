import { forwardRef, memo, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { stripPhoneNumbersFromText } from "../../../../../../utils/stripPhoneFromDescription";

const MAX_CHAR_LIMIT = 500;

const DescriptionMain = forwardRef(({ error = "" }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const description = form?.description || "";
  const warnedRef = useRef(false);

  const handleChange = (e) => {
    const next = e.target.value.slice(0, MAX_CHAR_LIMIT);
    const { cleaned, removed } = stripPhoneNumbersFromText(next);
    updateFieldValue("description", cleaned.slice(0, MAX_CHAR_LIMIT));
    if (removed && !warnedRef.current) {
      warnedRef.current = true;
      toast.error(
        "Phone numbers, emails, and house addresses are not allowed in the description",
      );
      window.setTimeout(() => {
        warnedRef.current = false;
      }, 1500);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const el = e.currentTarget;
    const start = el.selectionStart ?? description.length;
    const end = el.selectionEnd ?? description.length;
    const merged = `${description.slice(0, start)}${pasted}${description.slice(end)}`.slice(
      0,
      MAX_CHAR_LIMIT,
    );
    const { cleaned, removed } = stripPhoneNumbersFromText(merged);
    updateFieldValue("description", cleaned.slice(0, MAX_CHAR_LIMIT));
    if (removed && !warnedRef.current) {
      warnedRef.current = true;
      toast.error(
        "Phone numbers, emails, and house addresses are not allowed in the description",
      );
      window.setTimeout(() => {
        warnedRef.current = false;
      }, 1500);
    }
  };

  const charCount = useMemo(() => description.length, [description]);
  const wordCount = useMemo(
    () => (description.trim() ? description.trim().split(/\s+/).length : 0),
    [description],
  );
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.8;
  const pct = Math.round((charCount / MAX_CHAR_LIMIT) * 100);

  return (
    <div ref={ref} className="space-y-2">
      <label
        htmlFor="property-description"
        className="block text-xs font-bold uppercase tracking-widest text-[#374151]"
      >
        Property Description
      </label>

      <textarea
        id="property-description"
        value={description}
        onChange={handleChange}
        onPaste={handlePaste}
        rows={5}
        placeholder="Describe your property — key highlights, features, nearby facilities, and why it's the perfect choice..."
        className={`w-full resize-none rounded-xl border-2 px-4 py-3.5 text-sm font-medium leading-relaxed text-[#111827] outline-none transition-all placeholder:text-[#c9c9c9] ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10"
        }`}
      />

      <p className="text-[10px] font-medium text-[#9ca3af]">
        Phone numbers, emails, and house addresses (e.g. 1-14) are not allowed in
        the description.
      </p>

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : (
          <span className="text-[10px] font-medium text-[#9ca3af]">
            {wordCount} words
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNearLimit ? "bg-orange-400" : "bg-[#27AE60]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span
            className={`text-[10px] font-bold ${
              isNearLimit ? "text-orange-500" : "text-[#9ca3af]"
            }`}
          >
            {charCount}/{MAX_CHAR_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
});

export default memo(DescriptionMain);
