
// BuildingManagement.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const inputCls = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all";

const BuildingManagement = ({ errors = {} }) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();
  const bm = form.buildingManagement || { security: false, managedBy: "", contact: "" };
  const isSecurityEnabled = !!bm.security;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Building Management</p>
      <span className="text-xs text-[#9ca3eg] mt-0.5" >Provide information about your building&apos;s management details.</span>

      {/* Security Toggle */}
      {/* <div className="flex items-center justify-between px-4 py-3.5 border-2 border-[#e5e7eb] rounded-xl hover:border-[#bbf7d0] transition-colors">
        <div>
          <p className="text-sm font-bold text-[#111827]">Managed Security</p>
          <p className="text-xs text-[#9ca3af] mt-0.5">24/7 security personnel on premises</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isSecurityEnabled}
          onClick={() => updateNestedFieldValue("buildingManagement", "security", !isSecurityEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${isSecurityEnabled ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isSecurityEnabled ? "translate-x-5" : ""}`} />
        </button>
      </div> */}

      {/* Managed By */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#374151]">Management Company</label>
        <input
          type="text"
          value={bm.managedBy || ""}
          onChange={(e) => updateNestedFieldValue("buildingManagement", "managedBy", e.target.value)}
          placeholder="e.g. Facility Management Company"
          className={inputCls}
        />
        {errors.managedBy && <p className="text-red-500 text-xs font-medium">{errors.managedBy}</p>}
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#374151]">Management Contact</label>
        <input
          type="text"
          value={bm.contact || ""}
          onChange={(e) => updateNestedFieldValue("buildingManagement", "contact", e.target.value)}
          placeholder="Contact person / number"
          className={inputCls}
        />
        {errors.contact && <p className="text-red-500 text-xs font-medium">{errors.contact}</p>}
      </div>
    </div>
  );
};

export default BuildingManagement;
