import { useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";


const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];


const Status = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();
    return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Status
      </p>
        <select
            value={form.status || ""}
            onChange={(e) => updateFieldValue("status", e.target.value)}
            className="w-full p-3 border text-sm outline-none font-weight-bold placeholder:text-[#524d4d] text-[#000000] border-[#27AD75] rounded-lg"
          >
            <option value="" disabled>
                Select Status
            </option>
            {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                {option.label}
                </option>   
            ))}
          </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
export default Status;
