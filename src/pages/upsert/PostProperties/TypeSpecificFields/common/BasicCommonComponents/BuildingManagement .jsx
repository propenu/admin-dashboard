
//

import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BuildingManagement = ({errors={}}) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();

  const buildingManagement = form.buildingManagement || {
    security: false,
    managedBy: "",
    contact: "",
  };

  const isSecurityEnabled = !!buildingManagement.security;

  return (
    <div  className="pt-6 border-t space-y-4">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Building Management
      </p>

      {/* ✅ Security Toggle (STABLE) */}
      <div className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg">
        <span className="text-sm font-weight-bold text-[#000000]">
          Managed Security
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={isSecurityEnabled}
          onClick={() =>
            updateNestedFieldValue(
              "buildingManagement",
              "security",
              !isSecurityEnabled
            )
          }
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isSecurityEnabled ? "bg-[#27AE60]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isSecurityEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>

        
      </div>

      {/* Managed By */}
      <div className="space-y-2">
        <p className="text-[12px] font-weight-bold text-[#000000] uppercase">
          Managed By
        </p>
        <input
          type="text"
          value={buildingManagement.managedBy || ""}
          onChange={(e) =>
            updateNestedFieldValue(
              "buildingManagement",
              "managedBy",
              e.target.value
            )
          }
          placeholder="e.g. Facility Management Company"
          className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold outline-none bg-white"
        />
        {errors.managedBy && (
          <p className="text-red-500 text-xs">{errors.managedBy}</p>
        )}
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <p className="text-[12px] font-weight-bold text-[#000000] uppercase">
          Contact Number
        </p>
        <input
          type="text"
          value={buildingManagement.contact || ""}
          onChange={(e) =>
            updateNestedFieldValue(
              "buildingManagement",
              "contact",
              e.target.value
            )
          }
          placeholder="Contact person / number"
          className="w-full p-3 border placeholder:text[#525252] border-[#27AD75] rounded-lg text-sm font-weight-bold outline-none bg-white"
        />
        {errors.contact && (
          <p className="text-red-500 text-xs">{errors.contact}</p>
        )}
      </div>

       
    </div>
  );
};

export default BuildingManagement;
