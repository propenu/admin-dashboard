//import { useRef, useImperativeHandle, forwardRef, useState } from "react";
import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import { Plus, Trash2, Upload, LayoutGrid } from "lucide-react";
import imageCompression from "browser-image-compression";
import { saveImage, getFileFromKey } from "../utils/indexedDB";
import { toast } from "sonner";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {

    //return await imageCompression(file, options);
    const compressedFile = await imageCompression(file, options);
    const originalMB = (file.size / (1024 * 1024)).toFixed(2);
    const compressedMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
    const savedMB = ((file.size - compressedFile.size) / (1024 * 1024)).toFixed(
      2,
    );

    toast.success(
      `File compressed successfully! ${originalMB} MB → ${compressedMB} MB (Saved ${savedMB} MB)`,
    );

    return compressedFile;


  } catch (error) {
    console.error("Compression error:", error);
     toast.error("Image compression failed");
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

const inp = (err) =>
  `w-full px-3 py-2.5 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL =
  "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

const AREA_UNITS = [
  "sqft",
  "sqm",
  "sqyd",
  "acre",
  "hectare",
  "gunta",
  "cent",
  "bigha",
  "ankanam",
  "marla",
  "kanal",
];

// How many sqft equals 1 of this unit
const AREA_CONVERSIONS = {
  sqft: 1,
  sqm: 10.7639,
  sqyd: 9,
  acre: 43560,
  hectare: 107639,
  gunta: 1089,
  cent: 435.6,
  bigha: 27225,
  ankanam: 72,
  marla: 272.25,
  kanal: 5445,
};

/**
 * Price per selected unit.
 *
 * Formula:  totalPrice ÷ areaValue  = price per 1 [unit]
 *
 * Examples (totalPrice=200000, areaValue=2):
 *   acre  → 200000 ÷ 2 = 100000 / acre
 *   sqyd  → 200000 ÷ 2 = 100000 / sqyd
 *   sqft  → 200000 ÷ 2 = 100000 / sqft
 *   gunta → 200000 ÷ 2 = 100000 / gunta
 *
 * When unit changes the formula stays the same — price ÷ area —
 * only the label changes (price/sqft, price/acre, etc.)
 */
const calculatePricePerUnit = (totalPrice, areaValue, areaUnit) => {
  const price = Number(String(totalPrice || "").replace(/,/g, ""));
  const area = Number(areaValue || 0);
  if (!price || !area || !areaUnit) return "";
  return Math.round(price / area);
};

/**
 * Convert areaValue in given unit → sqft.
 *
 * Example: 2 acre → 2 × 43560 = 87120 sqft
 */
const convertToSqft = (value, unit) => {
  return Math.round(Number(value || 0) * (AREA_CONVERSIONS[unit] || 1));
};

const formatIndianPrice = (value) => {
  if (!value && value !== 0) return "";
  const num = Number(String(value).replace(/,/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN");
};

const parsePrice = (value) => value.replace(/,/g, "");

const LAND_FACING_OPTIONS = [
  "East Facing",
  "West Facing",
  "North Facing",
  "South Facing",
  "North East Facing",
  "North West Facing",
  "South East Facing",
  "South West Facing",
  "Corner Facing",
  "Plot",
];

const RESIDENTIAL_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK",
  "6 BHK",
  "Villa",
  "Duplex",
  "Triplex",
  "Farmhouse",
  "1 BHK East Facing",
  "1 BHK West Facing",
  "1 BHK North Facing",
  "1 BHK South Facing",
  "2 BHK East Facing",
  "2 BHK West Facing",
  "2 BHK North Facing",
  "2 BHK South Facing",
  "3 BHK East Facing",
  "3 BHK West Facing",
  "3 BHK North Facing",
  "3 BHK South Facing",
  "4 BHK East Facing",
  "4 BHK West Facing",
  "4 BHK North Facing",
  "4 BHK South Facing",
  "5 BHK East Facing",
  "5 BHK West Facing",
  "5 BHK North Facing",
  "5 BHK South Facing",
  "6 BHK East Facing",
  "6 BHK West Facing",
  "6 BHK North Facing",
  "6 BHK South Facing",
];

const BHKStep = forwardRef(({ payload, update }, ref) => {
  const projectSummary = payload.projectSummary || [];
  const [errors, setErrors] = useState({});
  const projectSummaryRef = useRef(null);
  const sqftRangeRef = useRef(null);



  const clearError = (key) => {
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (!projectSummary.length)
        e.projectSummary =
          payload.categoryType === "land"
            ? "At least one facing is required"
            : "At least one BHK is required";

      projectSummary.forEach((b, bi) => {
        const label = (b.label || "").trim();

        if (payload.categoryType === "land") {
          if (
            !LAND_FACING_OPTIONS.some(
              (item) => item.toLowerCase() === label.toLowerCase(),
            )
          ) {
            e[`label-${bi}`] = "Only valid facing directions allowed";
          }
        }

        if (payload.categoryType === "residential") {
          if (
            !RESIDENTIAL_OPTIONS.some(
              (item) => item.toLowerCase() === label.toLowerCase(),
            )
          ) {
            e[`label-${bi}`] = "Only valid BHK types allowed";
          }
        }

        if (!b.units?.length) e[`bhk-${bi}`] = "At least one unit is required";

        b.units?.forEach((u, ui) => {
          if (payload.categoryType === "residential") {
            if (!u.minSqft) e[`bhk-${bi}-unit-${ui}-minSqft`] = "Required";
            if (!u.maxSqft) e[`bhk-${bi}-unit-${ui}-maxSqft`] = "Required";
            if (!u.minPrice) e[`bhk-${bi}-unit-${ui}-minPrice`] = "Required";
            if (!u.maxPrice) e[`bhk-${bi}-unit-${ui}-maxPrice`] = "Required";
            //if (!u.availableCount) e[`bhk-${bi}-unit-${ui}-count`] = "Required";
            if (!u.planFileName)
              e[`bhk-${bi}-unit-${ui}-plan`] = "Floor plan required";
          } else if (payload.categoryType === "land") {
            if (!String(u.area?.value || "").trim())
              e[`bhk-${bi}-unit-${ui}-area`] = "Plot area required";
            if (!u.minPrice) e[`bhk-${bi}-unit-${ui}-minPrice`] = "Required";
            //if (!u.maxPrice) e[`bhk-${bi}-unit-${ui}-maxPrice`] = "Required";
            //if (!u.availableCount) e[`bhk-${bi}-unit-${ui}-count`] = "Required";
            if (!u.planFileName)
              e[`bhk-${bi}-unit-${ui}-plan`] = "Floor plan required";
          }
        });
      });

      setErrors(e);

      if (Object.keys(e).length) {
        (e.projectSummary
          ? projectSummaryRef
          : sqftRangeRef
        ).current?.scrollIntoView({
          behavior: "smooth",
        });
        return false;
      }

      return true;
    },

    isValid() {
      if (!projectSummary.length) return false;

      for (let b of projectSummary) {
        if (!b.units?.length) return false;

        for (let u of b.units) {
          if (payload.categoryType === "residential") {
            if (
              !u.minSqft ||
              !u.maxSqft ||
              !u.minPrice ||
              !u.maxPrice ||
              !u.availableCount ||
              !u.planFileName
            )
              return false;
          } else if (payload.categoryType === "land") {
            if (
              !String(u.area?.value || "").trim() ||
              !u.maxPrice ||
              !u.minPrice ||
              !u.availableCount ||
              !u.planFileName
            )
              return false;
          }
        }
      }

      return true;
    },
  }));

  const addProjectSummary = () =>
    update({
      projectSummary: [
        ...projectSummary,
        {
          bhk: payload.categoryType === "land" ? 0 : projectSummary.length + 1,
          label:
            payload.categoryType === "land"
              ? "East Facing"
              : `${projectSummary.length + 1} BHK`,
          units: [
            {
              minSqft: "",
              maxSqft: "",
              availableCount: "",
              minPrice: "",
              maxPrice: "",
              area: { value: "", unit: "sqft", sqftValue: "" },
            },
          ],
        },
      ],
    });

  const updProject = (i, patch) => {
    const n = [...projectSummary];
    n[i] = { ...n[i], ...patch };
    update({ projectSummary: n });
  };

  const remProject = (i) => {
    const n = [...projectSummary];
    n.splice(i, 1);
    update({ projectSummary: n });
  };

  const addUnit = (i) => {
    const n = [...projectSummary];
    n[i].units.push({
      minSqft: "",
      maxSqft: "",
      availableCount: "",
      minPrice: "",
      maxPrice: "",
      area: { value: "", unit: "sqft", sqftValue: "" },
    });
    update({ projectSummary: n });
  };

  const updUnit = (bi, ui, patch) => {
    const n = [...projectSummary];
    const old = n[bi].units[ui];
    const updated = { ...old, ...patch };

    if (patch.area) {
      // Merge the area patch onto existing area
      updated.area = { ...old.area, ...patch.area };
      // Recalculate sqftValue whenever area value or unit changes
      updated.area.sqftValue = convertToSqft(
        updated.area.value,
        updated.area.unit,
      );
    }

    n[bi].units[ui] = updated;
    update({ projectSummary: n });
  };

  const remUnit = (bi, ui) => {
    const n = [...projectSummary];
    n[bi].units.splice(ui, 1);
    update({ projectSummary: n });
  };

  const isLand = payload.categoryType === "land";
  const isResidential = payload.categoryType === "residential";

  const propertyType = payload.propertyType?.trim().toLowerCase();

  const dynamicConfig = {
    land: {
      summaryTitle: "Plot Facing Summary",
      addButtonText: "Add Facing",
      emptyText: "No facing types added",
      placeholderText: "e.g. East Facing",
      unitLabel: "Facing",
      planLabel: "Layout Plan Image",
      uploadText: "Upload Layout Plan",
    },
    villa: {
      summaryTitle: "Villa Configuration",
      addButtonText: "Add Villa Type",
      emptyText: "No villa types added",
      placeholderText: "e.g. 4BHK Villa",
      unitLabel: "Villa",
      planLabel: "Villa Floor Plan",
      uploadText: "Upload Villa Plan",
    },
    duplex: {
      summaryTitle: "Duplex Configuration",
      addButtonText: "Add Duplex",
      emptyText: "No duplex types added",
      placeholderText: "e.g. 3BHK Duplex",
      unitLabel: "Duplex",
      planLabel: "Duplex Floor Plan",
      uploadText: "Upload Duplex Plan",
    },
    farmhouse: {
      summaryTitle: "Farmhouse Configuration",
      addButtonText: "Add Farmhouse",
      emptyText: "No farmhouse types added",
      placeholderText: "e.g. Luxury Farmhouse",
      unitLabel: "Farmhouse",
      planLabel: "Farmhouse Plan",
      uploadText: "Upload Farmhouse Plan",
    },
    default: {
      summaryTitle: "BHK Summary",
      addButtonText: "Add BHK",
      emptyText: "No BHK types added",
      placeholderText: "e.g. 2 BHK",
      unitLabel: "Unit",
      planLabel: "Floor Plan Image",
      uploadText: "Upload Floor Plan",
    },
  };

  const uiText =
    dynamicConfig[propertyType] ||
    (isLand ? dynamicConfig.land : dynamicConfig.default);

  const {
    summaryTitle,
    addButtonText,
    emptyText,
    placeholderText,
    unitLabel,
    planLabel,
    uploadText,
  } = uiText;

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (restored) return;

    const restorePreviews = async () => {
      let changed = false;

      const updated = await Promise.all(
        (projectSummary || []).map(async (b) => ({
          ...b,

          units: await Promise.all(
            (b.units || []).map(async (u) => {
              // already exists
              if (u.planPreview) return u;

              const key =
                typeof u.planFile === "string" ? u.planFile : u.planFile?.key;

              if (!key) return u;

              try {
                const file = await getFileFromKey(key, "other");

                if (!file) return u;

                const preview = await fileToBase64(file);

                changed = true;

                return {
                  ...u,
                  planPreview: preview,
                };
              } catch (err) {
                console.error("Preview restore failed", err);

                return u;
              }
            }),
          ),
        })),
      );

      if (changed) {
        update({
          projectSummary: updated,
        });
      }

      setRestored(true);
    };

    restorePreviews();
  }, [projectSummary, restored]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={projectSummaryRef}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Configuration
          </p>
          <h3 className="text-lg font-black text-gray-900">{summaryTitle}</h3>
        </div>
        <button
          onClick={addProjectSummary}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
        >
          <Plus size={15} strokeWidth={3} /> {addButtonText}
        </button>
      </div>

      {errors.projectSummary && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.projectSummary}
        </div>
      )}

      {/* Empty state */}
      {projectSummary.length === 0 && (
        <div className="flex flex-col items-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <LayoutGrid size={40} className="mb-3 opacity-40" />
          <p className="font-bold text-sm">{emptyText}</p>
          <p className="text-xs mt-1">Click "{addButtonText}" to get started</p>
        </div>
      )}

      {/* Cards */}
      {projectSummary.map((b, bi) => (
        <div
          key={bi}
          className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                }}
              >
                {bi + 1}
              </div>

              {isLand ? (
                <select
                  className={inp(errors[`label-${bi}`])}
                  value={b.label}
                  onChange={(e) => {
                    updProject(bi, { label: e.target.value });
                    clearError(`label-${bi}`);
                  }}
                >
                  <option value="">Select Facing</option>
                  {LAND_FACING_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className={inp(errors[`label-${bi}`])}
                  value={b.label}
                  onChange={(e) => {
                    updProject(bi, { label: e.target.value });
                    clearError(`label-${bi}`);
                  }}
                >
                  <option value="">Select Configuration</option>
                  {RESIDENTIAL_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => remProject(bi)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-red-100"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {errors[`label-${bi}`] && (
              <p className="text-xs text-red-500 font-semibold mt-2 ml-11">
                ⚠ {errors[`label-${bi}`]}
              </p>
            )}
          </div>

          <div className="p-5 space-y-4">
            {b.units.map((u, ui) => (
              <div
                key={ui}
                className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                    {unitLabel} {ui + 1}
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

                <div
                  className={`grid grid-cols-1 gap-3 ${
                    isLand ? "md:grid-cols-3" : "md:grid-cols-4"
                  }`}
                >
                  {/* ── RESIDENTIAL ONLY: Min Sqft + Max Sqft ── */}
                  {isResidential && (
                    <>
                      <div>
                        <label className={LABEL}>Min Sqft *</label>
                        <input
                          type="number"
                          className={inp(
                            errors[`bhk-${bi}-unit-${ui}-minSqft`],
                          )}
                          placeholder="1200"
                          value={u.minSqft || ""}
                          onChange={(e) => {
                            updUnit(bi, ui, { minSqft: e.target.value });
                            clearError(`bhk-${bi}-unit-${ui}-minSqft`);
                          }}
                        />
                        {errors[`bhk-${bi}-unit-${ui}-minSqft`] && (
                          <p className="text-xs text-red-500 font-semibold">
                            ⚠ {errors[`bhk-${bi}-unit-${ui}-minSqft`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={LABEL}>Max Sqft *</label>
                        <input
                          type="number"
                          className={inp(
                            errors[`bhk-${bi}-unit-${ui}-maxSqft`],
                          )}
                          placeholder="1800"
                          value={u.maxSqft || ""}
                          onChange={(e) => {
                            updUnit(bi, ui, { maxSqft: e.target.value });
                            clearError(`bhk-${bi}-unit-${ui}-maxSqft`);
                          }}
                        />
                        {errors[`bhk-${bi}-unit-${ui}-maxSqft`] && (
                          <p className="text-xs text-red-500 font-semibold">
                            ⚠ {errors[`bhk-${bi}-unit-${ui}-maxSqft`]}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── MIN PRICE (for land this is "Total Price") ── */}
                  <div>
                    <label className={LABEL}>
                      {isLand ? "Min Price *" : "Min Price"}
                    </label>
                    <input
                      type="text"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-minPrice`])}
                      placeholder="5000000"
                      value={formatIndianPrice(u.minPrice)}
                      onChange={(e) => {
                        updUnit(bi, ui, {
                          minPrice: parsePrice(e.target.value),
                        });
                        clearError(`bhk-${bi}-unit-${ui}-minPrice`);
                      }}
                    />
                    {errors[`bhk-${bi}-unit-${ui}-minPrice`] && (
                      <p className="text-xs text-red-500 font-semibold">
                        ⚠ {errors[`bhk-${bi}-unit-${ui}-minPrice`]}
                      </p>
                    )}
                  </div>

                  {/* ── MAX PRICE (residential + land both) ── */}
                  {/* <div>
                    <label className={LABEL}>Max Price *</label>
                    <input
                      type="text"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-maxPrice`])}
                      placeholder="7000000"
                      value={formatIndianPrice(u.maxPrice)}
                      onChange={(e) => {
                        updUnit(bi, ui, {
                          maxPrice: parsePrice(e.target.value),
                        });
                        clearError(`bhk-${bi}-unit-${ui}-maxPrice`);
                      }}
                    />
                    {errors[`bhk-${bi}-unit-${ui}-maxPrice`] && (
                      <p className="text-xs text-red-500 font-semibold">
                        ⚠ {errors[`bhk-${bi}-unit-${ui}-maxPrice`]}
                      </p>
                    )}
                  </div> */}
                  {/* ── MAX PRICE ONLY FOR RESIDENTIAL ── */}
                  {!isLand && (
                    <div>
                      <label className={LABEL}>Max Price *</label>

                      <input
                        type="text"
                        className={inp(errors[`bhk-${bi}-unit-${ui}-maxPrice`])}
                        placeholder="7000000"
                        value={formatIndianPrice(u.maxPrice)}
                        onChange={(e) => {
                          updUnit(bi, ui, {
                            maxPrice: parsePrice(e.target.value),
                          });

                          clearError(`bhk-${bi}-unit-${ui}-maxPrice`);
                        }}
                      />

                      {errors[`bhk-${bi}-unit-${ui}-maxPrice`] && (
                        <p className="text-xs text-red-500 font-semibold">
                          ⚠ {errors[`bhk-${bi}-unit-${ui}-maxPrice`]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── LAND ONLY: Plot Area + Price/Unit (auto) + Converted Sqft (auto) ── */}
                  {isLand && (
                    <>
                      {/* Plot Area with unit dropdown */}
                      <div className="md:col-span-1">
                        <label className={LABEL}>Plot Area *</label>
                        <div
                          className={`flex items-center border-2 rounded-xl overflow-hidden bg-white
                            ${
                              errors[`bhk-${bi}-unit-${ui}-area`]
                                ? "border-red-400"
                                : "border-gray-200 focus-within:border-[#27AE60] focus-within:ring-4 focus-within:ring-[#27AE60]/10"
                            }`}
                        >
                          <input
                            type="number"
                            className="flex-1 px-3 py-2.5 text-sm font-semibold outline-none bg-transparent"
                            placeholder="2"
                            value={u.area?.value || ""}
                            onChange={(e) => {
                              updUnit(bi, ui, {
                                area: { ...u.area, value: e.target.value },
                              });
                              clearError(`bhk-${bi}-unit-${ui}-area`);
                            }}
                          />
                          <div className="w-px self-stretch bg-gray-200" />
                          <select
                            className="w-32 px-3 py-2.5 text-sm font-semibold outline-none bg-transparent"
                            value={u.area?.unit || "sqft"}
                            onChange={(e) => {
                              // When unit changes, recalc sqftValue with new unit
                              updUnit(bi, ui, {
                                area: { ...u.area, unit: e.target.value },
                              });
                            }}
                          >
                            {AREA_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[`bhk-${bi}-unit-${ui}-area`] && (
                          <p className="text-xs text-red-500 font-semibold">
                            ⚠ {errors[`bhk-${bi}-unit-${ui}-area`]}
                          </p>
                        )}
                      </div>

                      {/*
                        Price / [unit]  — auto-calculated, read-only
                        Formula: minPrice ÷ areaValue
                        e.g. minPrice=200000, area=2 acre → 200000÷2 = 100000 / acre
                        When unit changes: same formula, label updates to price/[newUnit]
                      */}
                      <div>
                        <label className={LABEL}>
                          Price / {u.area?.unit || "sqft"}
                        </label>
                        <input
                          type="text"
                          disabled
                          className={inp()}
                          value={
                            formatIndianPrice(
                              calculatePricePerUnit(
                                u.minPrice,
                                u.area?.value,
                                u.area?.unit,
                              ),
                            ) || ""
                          }
                          placeholder="Auto-calculated"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Min Price ÷ Area Value
                        </p>
                      </div>

                      {/*
                        Converted Sqft — auto-calculated, read-only
                        Formula: areaValue × conversionFactor
                        e.g. 2 acre → 2 × 43560 = 87120 sqft
                        e.g. 2 sqyd → 2 × 9 = 18 sqft
                        Recalculates automatically when unit or value changes
                      */}
                      <div>
                        <label className={LABEL}>Converted (sqft)</label>
                        <input
                          type="text"
                          disabled
                          className={inp()}
                          value={
                            u.area?.sqftValue
                              ? formatIndianPrice(u.area.sqftValue)
                              : ""
                          }
                          placeholder="Auto-calculated"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Area × {AREA_CONVERSIONS[u.area?.unit || "sqft"]} ={" "}
                          {u.area?.value
                            ? formatIndianPrice(
                                convertToSqft(u.area.value, u.area?.unit),
                              )
                            : "0"}{" "}
                          sqft
                        </p>
                      </div>
                    </>
                  )}

                  {/* ── COUNT ── */}
                  <div>
                    <label className={LABEL}>Available Units *</label>
                    {/* <input
                      type="number"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-count`])}
                      placeholder="24"
                      value={u.availableCount || ""}
                      onChange={(e) => {
                        updUnit(bi, ui, { availableCount: e.target.value });
                        clearError(`bhk-${bi}-unit-${ui}-count`);
                      }}
                    /> */}
                    <input
                      type="text"
                      inputMode="numeric"
                      className={inp(errors[`bhk-${bi}-unit-${ui}-count`])}
                      placeholder="24"
                      value={u.availableCount || ""}
                      onChange={(e) => {
                        updUnit(bi, ui, {
                          availableCount: e.target.value.replace(/\D/g, ""),
                        });
                        clearError(`bhk-${bi}-unit-${ui}-count`);
                      }}
                    />
                    {errors[`bhk-${bi}-unit-${ui}-count`] && (
                      <p className="text-xs text-red-500 font-semibold">
                        ⚠ {errors[`bhk-${bi}-unit-${ui}-count`]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Floor Plan Upload */}
                <div>
                  <label className={LABEL}>{planLabel}</label>
                  <label
                    className={`flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed rounded-xl cursor-pointer transition-all group
                      ${
                        errors[`bhk-${bi}-unit-${ui}-plan`]
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:border-[#27AE60] hover:bg-[#f0fdf6]"
                      }`}
                  >
                    <Upload
                      size={16}
                      className="text-gray-400 group-hover:text-[#27AE60] transition-colors"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-[#27AE60] font-semibold transition-colors">
                      {u.planFileName || uploadText}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      // onChange={async (e) => {
                      //   const file = e.target.files?.[0];
                      //   if (!file) return;
                      //   const compressed = await compressImage(file);
                      //   const base64 = await fileToBase64(compressed);
                      //   const key = await saveImage(
                      //     compressed,
                      //     "other",
                      //     `bhk_${bi}_${ui}`,
                      //   );
                      //   updUnit(bi, ui, {
                      //     planFile: { file: compressed, key },
                      //     planFileName: file.name,
                      //     planPreview: base64,
                      //   });
                      //   clearError(`bhk-${bi}-unit-${ui}-plan`);
                      // }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        // Maximum 50 floor plans
                        const totalPlans = projectSummary.reduce(
                          (count, item) => count + (item.units?.length || 0),
                          0,
                        );

                        if (totalPlans >= 50) {
                          toast.error(
                            "Maximum 50 floor plan images are allowed.",
                          );

                          e.target.value = "";
                          return;
                        }

                        const loadingToast = toast.loading(
                          "Compressing image... ⏳",
                        );

                        // Compress image
                        const compressed = await compressImage(file);

                        toast.dismiss(loadingToast);

                        // // Check compressed size
                        // if (compressed.size > 1024 * 1024) {
                        //   toast.error(
                        //     "Compressed image is still larger than 1 MB. Please upload a smaller image.",
                        //   );

                        //   e.target.value = "";

                        //   return;
                        // }

                        const compressedMB = (
                          compressed.size /
                          (1024 * 1024)
                        ).toFixed(2);

                        if (compressed.size > 1024 * 1024) {
                          updUnit(bi, ui, {
                            planPreview: "",
                            planFile: null,
                            planFileName: "",
                            // planError: `Image size is ${compressedMB} MB. Please upload an image below 1 MB.`,
                            planError: `Image size is ${compressedMB} MB. Maximum allowed size is 1 MB.`,
                          });

                          e.target.value = "";

                          return;
                        }

                        const base64 = await fileToBase64(compressed);

                        const key = await saveImage(
                          compressed,
                          "other",
                          `bhk_${bi}_${ui}`,
                        );

                        // updUnit(bi, ui, {
                        //   planFile: {
                        //     file: compressed,
                        //     key,
                        //   },
                        //   planFileName: file.name,
                        //   planPreview: base64,
                        // });
                        updUnit(bi, ui, {
                          planFile: {
                            file: compressed,
                            key,
                          },
                          planFileName: file.name,
                          planPreview: base64,
                          planError: "",
                        });

                        clearError(`bhk-${bi}-unit-${ui}-plan`);
                      }}
                    />
                  </label>
                  {u.planPreview && !u.planError && (
                    <img
                      src={u.planPreview}
                      className="mt-2 h-32 object-contain rounded-xl border-2 border-gray-200"
                      alt="Plan"
                    />
                  )}
                  {u.planError && (
                    <p className="mt-2 text-sm font-semibold text-red-500">
                      ❌ {u.planError}
                    </p>
                  )}
                  {errors[`bhk-${bi}-unit-${ui}-plan`] && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      ⚠ {errors[`bhk-${bi}-unit-${ui}-plan`]}
                    </p>
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
                onClick={addProjectSummary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                }}
              >
                <Plus size={15} strokeWidth={3} /> {addButtonText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default BHKStep;