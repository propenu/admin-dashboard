import { Minus, Plus } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { forwardRef } from "react";

const Counter = forwardRef(({ label, reduxKey, isNested = false, parentKey = "", error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const value = isNested
    ? Number(form?.[parentKey]?.[reduxKey] || 0)
    : Number(form?.[reduxKey] || 0);

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <p className="text-[13px] font-poppins font-weight-bold text-[#000000] uppercase tracking-tight">
        {label}
      </p>

      <div className="flex items-center justify-between border border-[#27AD75] rounded-lg p-2 min-w-[120px] bg-white">
        <button
          type="button"
          onClick={() => {
            const newVal = Math.max(0, value - 1);
            isNested
              ? updateFieldValue(parentKey, {
                  ...form[parentKey],
                  [reduxKey]: newVal,
                })
              : updateFieldValue(reduxKey, newVal);
          }}
        >
          <Minus size={14} />
        </button>

        <span className="text-sm font-weight-bold">{value}</span>

        <button
          type="button"
          onClick={() => {
            const newVal = value + 1;
            isNested
              ? updateFieldValue(parentKey, {
                  ...form[parentKey],
                  [reduxKey]: newVal,
                })
              : updateFieldValue(reduxKey, newVal);
          }}
        >
          <Plus size={14} />
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

export default Counter;

