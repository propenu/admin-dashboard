
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const DescriptionMain = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="space-y-4 pt-4 border-t">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Description
      </p>
      <textarea
        onChange={(e) => updateFieldValue("description", e.target.value)}
        placeholder="Enter property details, highlights, and other important info..."
        className="w-full p-3 border border-[#27AD75] placeholder:text-[#525252] rounded-lg text-sm font-weight-bold text-[#000000] outline-none bg-gray-50/30"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
});

export default  DescriptionMain;
