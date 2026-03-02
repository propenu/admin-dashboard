// frontend/admin-dashboard/src/components/common/BasicCommonComponents/Zoning.jsx

import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const Zoning = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Zoning
      </p>

      <input
        type="text"
        placeholder="e.g. Commercial / Residential / Mixed-use"
        value={form.zoning || ""}
        onChange={(e) => updateFieldValue("zoning", e.target.value)}
        className="w-full p-3 border border-[#27AD75] placeholder:text-[#524d4d] rounded-lg text-sm font-weight-bold text-[#000000] outline-none bg-white"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Zoning;
