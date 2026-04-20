// src/pages/post-property/featured-create/steps/BHKStep.jsx
import { useRef, useImperativeHandle, forwardRef, useState } from "react";
import { Plus, Trash2, Upload, LayoutGrid } from "lucide-react";
import imageCompression from "browser-image-compression";
import { saveImage } from "../utils/indexedDB";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression error:", error);
    return file;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

const inp = (err) => `w-full px-3 py-2.5 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

const BHKStep = forwardRef(({ payload, update }, ref) => {
  const bhkSummary = payload.bhkSummary || [];
  const sqftRange  = payload.sqftRange  || { min: "", max: "" };
  const [errors, setErrors] = useState({});
  const bhkSummaryRef = useRef(null);
  const sqftRangeRef  = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!bhkSummary.length) e.bhkSummary = "At least one BHK is required";
      bhkSummary.forEach((b, bi) => {
        if (!b.units?.length) e[`bhk-${bi}`] = "At least one unit is required";
        b.units?.forEach((u, ui) => {
          if (!u.minSqft)       e[`bhk-${bi}-unit-${ui}-minSqft`]  = "Required";
          if (!u.maxPrice)      e[`bhk-${bi}-unit-${ui}-maxPrice`]  = "Required";
          if (!u.availableCount) e[`bhk-${bi}-unit-${ui}-count`]   = "Required";
        });
      });
      if (!sqftRange.min || !sqftRange.max) e.sqftRange = "Overall sqft range required";
      setErrors(e);
      if (Object.keys(e).length) {
        (e.bhkSummary ? bhkSummaryRef : sqftRangeRef).current?.scrollIntoView({ behavior:"smooth" });
        return false;
      }
      return true;
    },
  }));

  const addBhk = () => update({
    bhkSummary: [...bhkSummary, {
      bhk: bhkSummary.length + 1,
      bhkLabel: `${bhkSummary.length + 1} BHK`,
      units: [{ minSqft:"", maxPrice:"", availableCount:"" }],
    }],
  });

  const updBhk  = (i, patch) => { const n=[...bhkSummary]; n[i]={...n[i],...patch}; update({bhkSummary:n}); };
  const remBhk  = (i) => { const n=[...bhkSummary]; n.splice(i,1); update({bhkSummary:n}); };
  const addUnit = (i) => { const n=[...bhkSummary]; n[i].units.push({minSqft:"",maxPrice:"",availableCount:""}); update({bhkSummary:n}); };
  const updUnit = (bi,ui,patch) => { const n=[...bhkSummary]; n[bi].units[ui]={...n[bi].units[ui],...patch}; update({bhkSummary:n}); };
  const remUnit = (bi,ui) => { const n=[...bhkSummary]; n[bi].units.splice(ui,1); update({bhkSummary:n}); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={bhkSummaryRef} className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Configuration
          </p>
          <h3 className="text-lg font-black text-gray-900">BHK Summary</h3>
        </div>
        <button
          onClick={addBhk}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black
            hover:opacity-90 transition-all shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
        >
          <Plus size={15} strokeWidth={3} /> Add BHK
        </button>
      </div>

      {errors.bhkSummary && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.bhkSummary}
        </div>
      )}

      {/* Empty state */}
      {bhkSummary.length === 0 && (
        <div className="flex flex-col items-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <LayoutGrid size={40} className="mb-3 opacity-40" />
          <p className="font-bold text-sm">No BHK types added</p>
          <p className="text-xs mt-1">Click "Add BHK" to get started</p>
        </div>
      )}

      {/* BHK Cards */}
      {bhkSummary.map((b, bi) => (
        <div
          key={bi}
          className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          {/* BHK header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div
              className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              {bi + 1}
            </div>
            <input
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900
              outline-none focus:border-[#27AE60] bg-white"
              value={b.bhkLabel}
              onChange={(e) => updBhk(bi, { bhkLabel: e.target.value })}
              placeholder="e.g. 2 BHK"
            />
            <button
              onClick={() => remBhk(bi)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-red-100"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {b.units.map((u, ui) => (
              <div
                key={ui}
                className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                    Unit {ui + 1}
                  </span>
                  {b.units.length > 1 && (
                    <button
                      onClick={() => remUnit(bi, ui)}
                      className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={LABEL}>Min Sqft *</label>
                    <input
                      type="number"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-minSqft`])}
                      placeholder="1200"
                      value={u.minSqft}
                      onChange={(e) =>
                        updUnit(bi, ui, { minSqft: e.target.value })
                      }
                    />
                    {errors[`bhk-${bi}-unit-${ui}-minSqft`] && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        ⚠ Required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={LABEL}>Max Price *</label>
                    <input
                      type="number"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-maxPrice`])}
                      placeholder="5000000"
                      value={u.maxPrice}
                      onChange={(e) =>
                        updUnit(bi, ui, { maxPrice: e.target.value })
                      }
                    />
                    {errors[`bhk-${bi}-unit-${ui}-maxPrice`] && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        ⚠ Required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={LABEL}>Count *</label>
                    <input
                      type="number"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-count`])}
                      placeholder="24"
                      value={u.availableCount}
                      onChange={(e) =>
                        updUnit(bi, ui, { availableCount: e.target.value })
                      }
                    />
                    {errors[`bhk-${bi}-unit-${ui}-count`] && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        ⚠ Required
                      </p>
                    )}
                  </div>
                </div>
                {/* Plan Upload */}
                <div>
                  <label className={LABEL}>Floor Plan Image</label>
                  <label
                    className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-gray-200
                    rounded-xl cursor-pointer hover:border-[#27AE60] hover:bg-[#f0fdf6] transition-all group"
                  >
                    <Upload
                      size={16}
                      className="text-gray-400 group-hover:text-[#27AE60] transition-colors"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-[#27AE60] font-semibold transition-colors">
                      {u.planFileName || "Upload floor plan"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      

                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const compressed = await compressImage(file);
                        const base64 = await fileToBase64(compressed);

                        //const key = await saveImage(compressed, "other");
                        const key = await saveImage(
                          compressed,
                          "other",
                          `bhk_${bi}_${ui}`,
                        );

                        updUnit(bi, ui, {
                          planFile: {
                            file: compressed,
                            key: key,
                          },
                          planFileName: file.name,
                          planPreview: base64,
                        });
                      }}
                    />
                  </label>
                  {u.planPreview && (
                    <img
                      src={u.planPreview}
                      className="mt-2 h-32 object-contain rounded-xl border-2 border-gray-200"
                      alt="Plan"
                    />
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => addUnit(bi)}
                className="flex items-center gap-2 text-sm text-[#27AE60] font-black hover:text-[#1a8a4a] transition-colors"
              >
                <Plus size={14} strokeWidth={3} /> Add Unit
              </button>
              <button
                onClick={addBhk}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black
            hover:opacity-90 transition-all shadow-md"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                }}
              >
                <Plus size={15} strokeWidth={3} /> Add BHK
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Sqft Range */}
      <div
        ref={sqftRangeRef}
        className="border-2 border-gray-200 rounded-2xl p-5 bg-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2 h-6 rounded-full"
            style={{ background: "#27AE60" }}
          />
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Project Wide
            </p>
            <h3 className="text-base font-black text-gray-900">
              Overall Sqft Range
            </h3>
          </div>
        </div>
        {errors.sqftRange && (
          <p className="text-xs text-red-500 font-semibold mb-3">
            ⚠ {errors.sqftRange}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Min Sqft *</label>
            <input
              type="number"
              className={inp(errors.sqftRange)}
              placeholder="800"
              value={sqftRange.min}
              onChange={(e) =>
                update({ sqftRange: { ...sqftRange, min: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={LABEL}>Max Sqft *</label>
            <input
              type="number"
              className={inp(errors.sqftRange)}
              placeholder="3500"
              value={sqftRange.max}
              onChange={(e) =>
                update({ sqftRange: { ...sqftRange, max: e.target.value } })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default BHKStep;