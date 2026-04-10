// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/BHKEditor.jsx
import React, { useState } from "react";

export default function BHKEditor({
  formData,
  setFormData,
  onSaveBhk,
  saving,
  selectedBhkIndex,
  setSelectedBhkIndex,
  setLivePreviewData,
}) {
  const bhkSummary = formData?.bhkSummary || [];
  const [openUnitIndex, setOpenUnitIndex] = useState(null);

 function addBhk() {
   const existingNumbers = bhkSummary
     .map((b) => parseInt(b.bhkLabel))
     .filter(Boolean);

   let nextNumber = 1;

   while (existingNumbers.includes(nextNumber)) {
     nextNumber++;
   }

   const newBhk = {
     bhk: nextNumber,
     bhkLabel: `${nextNumber} BHK`,
     units: [
       {
         minSqft: "",
         maxPrice: "",
         availableCount: "",
         planFile: null,
         planPreview: "",
       },
     ],
   };

   const updated = [...bhkSummary, newBhk];
   const updatedData = { ...formData, bhkSummary: updated };

   setFormData(updatedData);
   setLivePreviewData(updatedData);
   setSelectedBhkIndex(updated.length - 1);
 }

  // function deleteBhk(index) {
  //   const updated = [...bhkSummary];
  //   updated.splice(index, 1);
  //   setFormData({ ...formData, bhkSummary: updated });
  // }

  
function deleteBhk(index) {
  const updated = [...bhkSummary];
  updated.splice(index, 1);

  const updatedData = { ...formData, bhkSummary: updated };

  setFormData(updatedData);
  setLivePreviewData(updatedData); 

  if (updated.length === 0) {
    setSelectedBhkIndex(null);
  } else if (index >= updated.length) {
    setSelectedBhkIndex(updated.length - 1);
  }
}

  const isValid =
    typeof selectedBhkIndex === "number" &&
    selectedBhkIndex < bhkSummary.length;

  if (!isValid)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-[#27AE60]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-[#27AE60]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          Select a BHK type from the preview to start editing
        </p>
        <button
          onClick={addBhk}
          className="mt-4 px-5 py-2.5 bg-[#27AE60] text-white text-xs font-bold rounded-xl hover:bg-[#219150] transition shadow-md shadow-[#27AE60]/20"
        >
          + Add New BHK
        </button>
      </div>
    );

  const bhk = bhkSummary[selectedBhkIndex];

  function updateUnit(ui, partial) {
    const nextBhkSummary = [...bhkSummary];
    const units = [...bhk.units];
    units[ui] = { ...units[ui], ...partial };
    nextBhkSummary[selectedBhkIndex].units = units;

    const updatedData = { ...formData, bhkSummary: nextBhkSummary };

    setFormData(updatedData);
    setLivePreviewData(updatedData); // 🔥 important
  }

  
  function addUnit() {
    const newUnit = {
      minSqft: "",
      maxPrice: "",
      availableCount: "",
      planFile: null,
      planPreview: "",
    };

    const next = [...bhkSummary];
    next[selectedBhkIndex].units = [...bhk.units, newUnit];

    setFormData({ ...formData, bhkSummary: next });
    setOpenUnitIndex(bhk.units.length);
  }

  function deleteUnit(ui) {
    const units = bhk.units.filter((_, i) => i !== ui);
    const next = [...bhkSummary];
    next[selectedBhkIndex].units = units;
    setFormData({ ...formData, bhkSummary: next });
    if (openUnitIndex === ui) setOpenUnitIndex(null);
  }

  function handleSave() {
    const cleaned = bhkSummary.map((b) => {
      const prices = b.units
        .map((u) => Number(u.maxPrice))
        .filter((p) => !isNaN(p));
      return {
        ...b,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        units: b.units.map((u) => {
          // const base = {
          //   minSqft: u.minSqft,
          //   maxPrice: u.maxPrice,
          //   availableCount: u.availableCount,
          //   _id: u._id,
          // };
          const base = {
            minSqft: u.minSqft,
            maxPrice: u.maxPrice,
            availableCount: u.availableCount,
            ...(u._id && { _id: u._id }),
          };
          if (u.planFile instanceof File)
            return {
              ...base,
              planFile: u.planFile,
              planFileName: u.planFile.name,
              planPreview: u.planPreview,
            };
          if (u.plan?.url) return { ...base, plan: u.plan };
          return base;
        }),
      };
    });
    onSaveBhk({ ...formData, bhkSummary: cleaned });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">
                {bhk?.bhkLabel?.split(" ")[0]}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Editing: {bhk?.bhkLabel}
              </h3>
              <p className="text-[10px] text-gray-400">
                {bhk?.units?.length || 0} unit variants
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={addBhk}
              className="px-2.5 py-1.5 bg-[#27AE60] text-white rounded-lg text-[10px] font-bold hover:bg-[#219150] transition"
            >
              + BHK
            </button>
            <button
              onClick={() => deleteBhk(selectedBhkIndex)}
              className="px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-bold hover:bg-red-100 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Unit cards */}
        {bhk?.units?.map((u, ui) => (
          <div
            key={ui}
            className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/50"
          >
            {/* Unit header */}
            <div
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50 transition bg-white"
              onClick={() => setOpenUnitIndex(openUnitIndex === ui ? null : ui)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "#27AE60" }}
                >
                  {ui + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {u?.minSqft ? `${u.minSqft} sqft` : "New Variant"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {u?.maxPrice
                      ? `₹${Number(u.maxPrice).toLocaleString("en-IN")}`
                      : "Price not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUnit(ui);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${openUnitIndex === ui ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Expanded unit form */}
            {openUnitIndex === ui && (
              <div className="p-4 border-t border-gray-100 space-y-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Area (Sqft)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
                      value={u?.minSqft ?? ""}
                      onChange={(e) =>
                        updateUnit(ui, { minSqft: e.target.value })
                      }
                      placeholder="e.g. 1250"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
                      value={u?.maxPrice ?? ""}
                      onChange={(e) =>
                        updateUnit(ui, { maxPrice: e.target.value })
                      }
                      placeholder="e.g. 9500000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Units Available
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
                    value={u?.availableCount ?? ""}
                    onChange={(e) =>
                      updateUnit(ui, { availableCount: e.target.value })
                    }
                    placeholder="e.g. 24"
                  />
                </div>

                {/* Floorplan upload */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Floor Plan
                  </label>
                  {u.planPreview || u.plan?.url ? (
                    <div className="relative group h-36 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img
                        src={u.planPreview || u.plan?.url}
                        className="w-full h-full object-cover"
                        alt="Plan"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() =>
                            updateUnit(ui, {
                              planFile: null,
                              planPreview: "",
                              plan: null,
                            })
                          }
                          className="bg-red-500 text-white text-xs px-4 py-2 rounded-lg font-bold"
                        >
                          Replace Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor={`plan-${ui}`}
                      className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 hover:border-[#27AE60] rounded-xl bg-gray-50/50 cursor-pointer transition"
                    >
                      <div className="w-9 h-9 bg-[#27AE60]/10 rounded-xl flex items-center justify-center mb-2">
                        <svg
                          className="w-5 h-5 text-[#27AE60]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-[#27AE60]">
                        Upload Floor Plan
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG supported
                      </span>
                      <input
                        id={`plan-${ui}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            updateUnit(ui, {
                              planFile: file,
                              planPreview: URL.createObjectURL(file),
                            });
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Variant */}
        <button
          onClick={addUnit}
          className="w-full py-3 border-2 border-dashed border-[#27AE60]/30 text-[#27AE60] rounded-xl text-sm font-bold hover:border-[#27AE60] hover:bg-[#27AE60]/5 transition"
        >
          + Add Unit Variant
        </button>

        {/* Save */}
        <div className="sticky bottom-0 pt-2 bg-white">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save All Configurations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}