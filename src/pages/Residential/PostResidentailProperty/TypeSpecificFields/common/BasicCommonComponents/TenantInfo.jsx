//  import { forwardRef, useState } from "react";
//  import { Plus, X } from "lucide-react";
//  import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

//  const emptyTenant = {
//    currentTenant: "",
//    leaseStart: "",
//    leaseEnd: "",
//    rent: "",
//  };

//  const TenantInfo = forwardRef(({errors={}, ref}) => {
//    const { form, updateFieldValue } = useActivePropertySlice();
//    const tenants = Array.isArray(form.tenantInfo) ? form.tenantInfo : [];

//    const [showModal, setShowModal] = useState(false);
//    const [draft, setDraft] = useState(emptyTenant);

//    const addTenant = () => {
//      if (!draft.currentTenant) return;

//      updateFieldValue("tenantInfo", [...tenants, draft]);
//      setDraft(emptyTenant);
//      setShowModal(false);
//    };

//    const removeTenant = (index) => {
//      const updated = tenants.filter((_, i) => i !== index);
//      updateFieldValue("tenantInfo", updated);
//    };

//    return (
//      <div ref={ref} className="pt-6 border-t space-y-4">
//        <div className="flex items-center justify-between">
//          <p className="text-[13px] font-bold text-[#000000] uppercase font-poppins">
//            Tenant Information
//          </p>

//          {errors.tenantInfo && (
//            <p className="text-red-500 text-sm">{errors.tenantInfo}</p>
//          )}

//          <button
//            type="button"
//            onClick={() => setShowModal(true)}
//            className="flex items-center gap-1 text-sm font-semibold text-[#27AE60]"
//          >
//            <Plus size={16} /> Add Tenant
//          </button>
//        </div>

//        {/* TENANT LIST */}
//        {tenants.length === 0 && (
//          <p className="text-sm text-gray-500">No tenants added</p>
//        )}

//        <div className="space-y-3">
//          {tenants.map((t, i) => (
//            <div
//              key={i}
//              className="relative border border-gray-200 rounded-lg p-4 bg-white"
//            >
//              <button
//                type="button"
//                onClick={() => removeTenant(i)}
//                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
//              >
//                <X size={14} />
//              </button>

//              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                <div>
//                  <p className="text-gray-500">Tenant</p>
//                  <p className="font-semibold">{t.currentTenant}</p>

//                </div>

//                <div>
//                  <p className="text-gray-500">Lease Start</p>
//                  <p className="font-semibold">{t.leaseStart}</p>

//                </div>

//                <div>
//                  <p className="text-gray-500">Lease End</p>
//                  <p className="font-semibold">{t.leaseEnd}</p>

//                </div>

//                <div>
//                  <p className="text-gray-500">Rent</p>
//                  <p className="font-semibold">₹ {t.rent}</p>
//                  {errors[`tenantInfo.${i}.rent`] && (
//                    <p className="text-xs text-red-500 mt-1">
//                      {errors[`tenantInfo.${i}.rent`]}
//                    </p>
//                  )}
//                </div>
//              </div>
//            </div>
//          ))}
//        </div>

//        {/* MODAL */}
//        {showModal && (
//          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//            <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
//              <div className="flex justify-between items-center">
//                <p className="font-bold text-[#000000]">Add Tenant</p>
//                <button onClick={() => setShowModal(false)}>
//                  <X size={18} />
//                </button>
//              </div>

//              <div className="space-y-3">
//                <input
//                  type="text"
//                  placeholder="Tenant Name"
//                  value={draft.currentTenant}
//                  onChange={(e) =>
//                    setDraft({ ...draft, currentTenant: e.target.value })
//                  }
//                  className="w-full p-3 border border-[#27AD75] rounded-lg text-sm"
//                />

//                <input
//                  type="date"
//                  value={draft.leaseStart}
//                  onChange={(e) =>
//                    setDraft({ ...draft, leaseStart: e.target.value })
//                  }
//                  className="w-full p-3 border border-[#27AD75] rounded-lg text-sm"
//                />

//                <input
//                  type="date"
//                  value={draft.leaseEnd}
//                  onChange={(e) =>
//                    setDraft({ ...draft, leaseEnd: e.target.value })
//                  }
//                  className="w-full p-3 border border-[#27AD75] rounded-lg text-sm"
//                />

//                <input
//                  type="number"
//                  placeholder="Monthly Rent"
//                  value={draft.rent}
//                  onChange={(e) => setDraft({ ...draft, rent: e.target.value })}
//                  className="w-full p-3 border border-[#27AD75] rounded-lg text-sm"
//                />

//              </div>

//              <div className="flex gap-3 pt-4">
//                <button
//                  onClick={() => setShowModal(false)}
//                  className="w-full border border-gray-300 py-2 rounded-lg"
//                >
//                  Cancel
//                </button>
//                <button
//                  onClick={addTenant}
//                  className="w-full bg-[#27AE60] text-white py-2 rounded-lg"
//                >
//                  Save Tenant
//                </button>
//              </div>
//            </div>
//          </div>
//        )}
//      </div>
//    );
//  });

//  export default TenantInfo;

import { forwardRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const emptyTenant = {
  currentTenant: "",
  leaseStart: "",
  leaseEnd: "",
  rent: "",
};

const TenantInfo = forwardRef(({ errors = {} }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  // Ensure tenantInfo is always array
  const tenants = Array.isArray(form.tenantInfo) ? form.tenantInfo : [];

  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(emptyTenant);

  const addTenant = () => {
    if (!draft.currentTenant.trim()) return;

    const formattedTenant = {
      currentTenant: draft.currentTenant.trim(),
      leaseStart: draft.leaseStart || "",
      leaseEnd: draft.leaseEnd || "",
      rent: draft.rent ? Number(draft.rent) : 0,
    };

    updateFieldValue("tenantInfo", [...tenants, formattedTenant]);

    setDraft(emptyTenant);
    setShowModal(false);
  };

  const removeTenant = (index) => {
    const updated = tenants.filter((_, i) => i !== index);
    updateFieldValue("tenantInfo", updated);
  };

  return (
    <div ref={ref} className="pt-3 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase">Tenant Information</p>

        {errors.tenantInfo && (
          <p className="text-red-500 text-sm">{errors.tenantInfo}</p>
        )}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm font-semibold text-green-600"
        >
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      {/* TENANT LIST */}
      {tenants.length === 0 && (
        <p className="text-sm text-gray-500">No tenants added</p>
      )}

      <div className="space-y-3">
        {tenants.map((t, i) => (
          <div key={i} className="relative border rounded-lg p-4 bg-white">
            <button
              type="button"
              onClick={() => removeTenant(i)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <X size={14} />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tenant</p>
                <p className="font-semibold">{t.currentTenant}</p>
              </div>

              <div>
                <p className="text-gray-500">Lease Start</p>
                <p className="font-semibold">{t.leaseStart || "-"}</p>
              </div>

              <div>
                <p className="text-gray-500">Lease End</p>
                <p className="font-semibold">{t.leaseEnd || "-"}</p>
              </div>

              <div>
                <p className="text-gray-500">Rent</p>
                <p className="font-semibold">₹ {t.rent || 0}</p>

                {errors[`tenantInfo.${i}.rent`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors[`tenantInfo.${i}.rent`]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-bold">Add Tenant</p>
              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tenant Name"
                value={draft.currentTenant}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    currentTenant: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg text-sm"
              />

              <input
                type="date"
                value={draft.leaseStart}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    leaseStart: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg text-sm"
              />

              <input
                type="date"
                value={draft.leaseEnd}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    leaseEnd: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg text-sm"
              />

              <input
                type="number"
                placeholder="Monthly Rent"
                value={draft.rent}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    rent: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full border py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addTenant}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Save Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TenantInfo;