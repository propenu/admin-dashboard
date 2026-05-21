// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/BHKEditor.jsx
import React, { useState, useEffect } from "react";
import { compressImage } from "./imageCompressor";

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

const AREA_CONVERSION_TO_SQFT = {
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

function formatIndianPrice(value) {
  if (!value) return "";

  return Number(value).toLocaleString("en-IN");
}

function formatShortPrice(value) {
  const num = Number(value || 0);

  if (num >= 10000000) {
    return (num / 10000000).toFixed(1).replace(".0", "") + " Cr";
  }

  if (num >= 100000) {
    return (num / 100000).toFixed(1).replace(".0", "") + " L";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + " K";
  }

  return num.toString();
}

const LAND_FACING_OPTIONS = [
  "East Facing",
  "West Facing",
  "North Facing",
  "South Facing",
  "North East Facing",
  "North West Facing",
  "South East Facing",
  "South West Facing",
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
export default function BHKEditor({
  formData,
  setFormData,
  onSaveProject,
  saving,
  selectedProjectIndex,
  setSelectedProjectIndex,
  setLivePreviewData,
}) {
  const projectSummary = formData?.projectSummary || [];
  const [openUnitIndex, setOpenUnitIndex] = useState(null);
  

  useEffect(() => {
    if (
      projectSummary?.length > 0 &&
      (selectedProjectIndex === null || selectedProjectIndex === undefined)
    ) {
      setSelectedProjectIndex(0);

      setOpenUnitIndex(0);
    }
  }, [projectSummary, selectedProjectIndex]);
  

  function addProject() {
    const existingNumbers = projectSummary
      .map((b) => Number(b.bhk))
      .filter((n) => !isNaN(n));

    let nextNumber = 1;

    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    const newProject = {
      bhk: nextNumber,

      label:formData?.categoryType === "land"
    ? `East Facing Plot`
    : `${nextNumber} BHK`,

      units: [
        {
          minSqft: "",
          maxSqft: "",

          minPrice: "",
          maxPrice: "",

          availableCount: "",

          area: {
            value: "",
            unit: "sqft",
            sqftValue: "",
          },

          planFile: null,
          planPreview: "",
          planFileName: "",
        },
      ],
    };

    const updated = [...projectSummary, newProject];
    const updatedData = { ...formData, projectSummary: updated };

    setFormData(updatedData);
    setLivePreviewData(updatedData);
    setSelectedProjectIndex(updated.length - 1);
  }

  function deleteProject(index) {
    const updated = [...projectSummary];
    updated.splice(index, 1);

    const updatedData = { ...formData, projectSummary: updated };

    setFormData(updatedData);
    setLivePreviewData(updatedData);

    if (updated.length === 0) {
      setSelectedProjectIndex(null);
    } else if (index >= updated.length) {
      setSelectedProjectIndex(updated.length - 1);
    }
  }

  const isValid =
    typeof selectedProjectIndex === "number" &&
    selectedProjectIndex < projectSummary.length;

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
          Select a Project type from the preview to start editing
        </p>
        <button
          onClick={addProject}
          className="mt-4 px-5 py-2.5 bg-[#27AE60] text-white text-xs font-bold rounded-xl hover:bg-[#219150] transition shadow-md shadow-[#27AE60]/20"
        >
          + Add New Project
        </button>
      </div>
    );

  const project = projectSummary[selectedProjectIndex];

  function updateUnit(ui, partial) {
    const nextBhkSummary = [...projectSummary];
    const units = [...project.units];
    units[ui] = { ...units[ui], ...partial };
    nextBhkSummary[selectedProjectIndex].units = units;

    const updatedData = { ...formData, projectSummary: nextBhkSummary };
    setFormData(updatedData);
    setLivePreviewData(updatedData);
  }

  function addUnit() {
    

    const newUnit = {
      minSqft: "",
      maxSqft: "",

      minPrice: "",
      maxPrice: "",

      availableCount: "",

      area: {
        value: "",
        unit: "sqft",
        sqftValue: "",
      },

      planFile: null,
      planPreview: "",
      planFileName: "",
    };

    const next = [...projectSummary];
    next[selectedProjectIndex].units = [...project.units, newUnit];

    const updatedData = { ...formData, projectSummary: next };
    setFormData(updatedData);
    setLivePreviewData(updatedData);
    setOpenUnitIndex(project.units.length);
  }

  function deleteUnit(ui) {
    const units = project.units.filter((_, i) => i !== ui);
    const next = [...projectSummary];
    next[selectedProjectIndex].units = units;

    const updatedData = { ...formData, projectSummary: next };
    setFormData(updatedData);
    setLivePreviewData(updatedData);

    if (openUnitIndex === ui) setOpenUnitIndex(null);
  }

  function handleSave() {
    const fixedBhkSummary = projectSummary.map((b, index) => ({
      ...b,
      bhk: index + 1, // ✅ FORCE UNIQUE
    }));
    const cleaned = fixedBhkSummary.map((b) => ({
      ...(b._id && { _id: b._id }),
      bhk: b.bhk,
      label: b.label,
      units: b.units.map((u) => {
        // const base = {
        //   ...(u._id && { _id: u._id }),
        //   minSqft: Number(u.minSqft),
        //   maxPrice: Number(u.maxPrice),
        //   availableCount: Number(u.availableCount),
        // };

        const base = {
          ...(u._id && { _id: u._id }),

          minSqft: Number(u.minSqft || 0),
          maxSqft: Number(u.maxSqft || 0),

          minPrice: Number(u.minPrice || 0),
          maxPrice: Number(u.maxPrice || 0),

          availableCount: Number(u.availableCount || 0),

          area: {
            value: Number(
              formData?.categoryType === "land"
                ? u.area?.value || 0
                : u.minSqft || 0,
            ),

            unit:
              formData?.categoryType === "land"
                ? u.area?.unit || "sqft"
                : "sqft",

            sqftValue: Number(
              formData?.categoryType === "land"
                ? u.area?.sqftValue || 0
                : u.minSqft || 0,
            ),
          },
        };

        if (u.planFile instanceof File) {
          return {
            ...base,
            planFile: u.planFile,
            planFileName: u.planFile.name,
          };
        }

        if (u.plan?.url) {
          return {
            ...base,
            plan: u.plan,
            planFileName: u.planFileName,
          };
        }

        return base;
      }),
    }));

    onSaveProject({ projectSummary: cleaned });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">
                {project?.label?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {/* Editing: {project?.label} */}
                Editing:{" "}
                {formData?.categoryType === "land"
                  ? "Plot Configuration"
                  : "BHK Configuration"}
              </h3>
              <p className="text-[10px] text-gray-400">
                {project?.units?.length || 0} unit variants
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex-1">
            <label className="text-[12px] font-bold text-[#27AE60] uppercase tracking-widest block mb-1">
              {formData?.categoryType === "land"
                ? "Facing / Plot Label"
                : "BHK Label"}
            </label>
            {/* <input
              type="text"
              value={project?.label || ""}
              onChange={(e) => {
                const next = [...projectSummary];
                next[selectedProjectIndex] = {
                  ...next[selectedProjectIndex],
                  label: e.target.value,
                };

                const updatedData = { ...formData, projectSummary: next };
                setFormData(updatedData);
                setLivePreviewData(updatedData);
              }}
              placeholder={
                formData?.categoryType === "land"
                  ? "e.g. East Facing"
                  : "e.g. 2 BHK Premium"
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30"
            /> */}
            <select
              className="
    w-full px-3 py-2 border-2 border-gray-200
    rounded-xl text-sm font-bold text-gray-900
    outline-none bg-white
    focus:border-[#27AE60]
  "
              value={project?.label || ""}
              onChange={(e) => {
                const next = [...projectSummary];

                next[selectedProjectIndex] = {
                  ...next[selectedProjectIndex],
                  label: e.target.value,
                };

                const updatedData = {
                  ...formData,
                  projectSummary: next,
                };

                setFormData(updatedData);
                setLivePreviewData(updatedData);
              }}
            >
              <option value="">
                {formData?.categoryType === "land"
                  ? "Select Facing"
                  : "Select Configuration"}
              </option>

              {(formData?.categoryType === "land"
                ? LAND_FACING_OPTIONS
                : RESIDENTIAL_OPTIONS
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 mt-5">
            <button
              onClick={addProject}
              className="px-2.5 py-1.5 bg-[#27AE60] text-white rounded-lg text-[10px] font-bold hover:bg-[#219150] transition"
            >
              +
            </button>
            <button
              onClick={() => deleteProject(selectedProjectIndex)}
              className="px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-bold hover:bg-red-100 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Unit cards */}
        {project?.units?.map((u, ui) => (
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
                    {formData?.categoryType === "land"
                      ? u?.area?.value
                        ? `${u.area.value} ${u.area.unit}`
                        : "New Variant"
                      : u?.minSqft
                        ? `${u.minSqft} - ${u.maxSqft} sqft`
                        : "New Variant"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {u?.minPrice || u?.maxPrice
                      ? `₹${Number(u.minPrice || 0).toLocaleString("en-IN")} - ₹${Number(u.maxPrice || 0).toLocaleString("en-IN")}`
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
                  {formData?.categoryType !== "land" && (
                    <>
                      {/* Min Sqft */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Min Sqft
                        </label>

                        <input
                          type="text"
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl"
                          value={u?.minSqft ?? ""}
                          onChange={(e) =>
                            updateUnit(ui, { minSqft: e.target.value })
                          }
                          placeholder="1200"
                        />
                      </div>

                      {/* Max Sqft */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Max Sqft
                        </label>

                        <input
                          type="text"
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl"
                          value={u?.maxSqft ?? ""}
                          onChange={(e) =>
                            updateUnit(ui, { maxSqft: e.target.value })
                          }
                          placeholder="1400"
                        />
                      </div>
                    </>
                  )}

                  {/* Min Price */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Min Price
                    </label>

                    <input
                      type="text"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl"
                      value={formatIndianPrice(u?.minPrice)}
                      onChange={(e) =>
                        updateUnit(ui, {
                          minPrice: e.target.value.replace(/,/g, ""),
                        })
                      }
                      placeholder="8,00,00,000"
                    />
                  </div>

                  {formData?.categoryType == "land" && (
                    <> 

                  {/* Max Price */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Max Price
                    </label>

                    <input
                      type="text"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl"
                      value={formatIndianPrice(u?.maxPrice)}
                      onChange={(e) =>
                        updateUnit(ui, {
                          maxPrice: e.target.value.replace(/,/g, ""),
                        })
                      }
                      placeholder="9,50,00,000"
                    />
                  </div>
                    </>
                  )}

                  {formData?.categoryType == "land" && (
                    <>
                      {/* Plot Area Combined */}
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Plot Area
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-gray-200">
                          {/* AREA VALUE */}
                          <input
                            type="number"
                            className="flex-1 px-3 w-[70px] py-2.5 text-sm outline-none border-none"
                            value={u?.area?.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;

                              const unit = u?.area?.unit || "sqft";

                              const sqftValue =
                                Number(value || 0) *
                                (AREA_CONVERSION_TO_SQFT[unit] || 1);

                              updateUnit(ui, {
                                area: {
                                  ...u.area,
                                  value,
                                  sqftValue,
                                },
                              });
                            }}
                            placeholder="Enter area"
                          />

                          {/* UNIT SELECT */}
                          <select
                            className="w-32 px-3 py-2.5 text-sm bg-gray-50 border-l border-gray-400 outline-none cursor-pointer"
                            value={u?.area?.unit || "sqft"}
                            onChange={(e) => {
                              const unit = e.target.value;

                              const value = Number(u?.area?.value || 0);

                              const sqftValue =
                                value * (AREA_CONVERSION_TO_SQFT[unit] || 1);

                              updateUnit(ui, {
                                area: {
                                  ...u.area,
                                  unit,
                                  sqftValue,
                                },
                              });
                            }}
                          >
                            {AREA_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {formData?.categoryType == "land" && (
                    <>

                <div className="grid grid-cols-2 gap-1 w-full">
                  {/* Price Per Unit */}
                  <div
                    className="
      min-h-[58px]
      rounded-md
      border border-[#27AE60]/10
      bg-[#27AE60]/5
      px-2 py-1.5
      flex flex-col justify-between
    "
                  >
                    <p
                      className="
        text-[6px]
        font-bold
        uppercase
        tracking-[1px]
        text-[#27AE60]
        leading-none
      "
                    >
                      Price Per Unit
                    </p>

                    <div className="flex items-end gap-[2px] mt-[2px] flex-wrap">
                      <span
                        className="
          text-[15px]
          font-black
          text-[#27AE60]
          leading-none
        "
                      >
                        ₹
                        {u?.minPrice && u?.area?.value
                          ? formatShortPrice(
                              Math.round(
                                Number(u.minPrice) / Number(u.area.value),
                              ),
                            )
                          : 0}
                      </span>

                      <span
                        className="
          text-[8px]
          font-semibold
          text-gray-500
          mb-[1px]
          leading-none
        "
                      >
                        / {u?.area?.unit || "sqft"}
                      </span>
                    </div>

                    <p
                      className="
        text-[7px]
        text-gray-500
        leading-none
        mt-[2px]
      "
                    >
                      Auto calculated
                    </p>
                  </div>

                  {/* Converted Sqft */}
                  <div
                    className="
      min-h-[58px]
      rounded-md
      border border-blue-100
      bg-blue-50
      px-2 py-1.5
      flex flex-col justify-between
    "
                  >
                    <p
                      className="
        text-[6px]
        font-bold
        uppercase
        tracking-[1px]
        text-blue-600
        leading-none
      "
                    >
                      Converted Sqft
                    </p>

                    <div className="flex items-end gap-[2px] mt-[2px] flex-wrap">
                      <span
                        className="
          text-[15px]
          font-black
          text-blue-700
          leading-none
        "
                      >
                        {Number(u?.area?.sqftValue || 0).toLocaleString(
                          "en-IN",
                        )}
                      </span>

                      <span
                        className="
          text-[8px]
          font-semibold
          text-gray-500
          mb-[1px]
          leading-none
        "
                      >
                        sqft
                      </span>
                    </div>

                    <p
                      className="
        text-[7px]
        text-gray-500
        leading-none
        mt-[2px]
      "
                    >
                      Auto converted
                    </p>
                  </div>
                </div>

                </>
                )}

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
                    {/* Floor Plan */}
                    {formData?.categoryType === "land"
                      ? "Plot Image"
                      : "Floor Plan"}
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
                              plan: undefined,
                              planFileName: "",
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
                      htmlFor={`plan-${selectedProjectIndex}-${ui}`}
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
                        {/* Upload Floor Plan */}
                        {formData?.categoryType === "land"
                          ? "Upload Plot Image"
                          : "Upload Floor Plan"}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG supported
                      </span>
                      {/* ✅ FIX: unique id per project+unit combo to avoid conflicts */}
                      <input
                        id={`plan-${selectedProjectIndex}-${ui}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        // onChange={(e) => {
                        //   const file = e.target.files?.[0];
                        //   if (!file) return;
                        //   // ✅ FIX: Store planFile as raw File (instanceof File check in updateFeaturedProperty works)
                        //   updateUnit(ui, {
                        //     planFile: file,
                        //     planFileName: file.name,
                        //     planPreview: URL.createObjectURL(file),
                        //   });
                        // }}

                        onChange={async (e) => {
                          const file = e.target.files?.[0];

                          if (!file) return;

                          console.log(
                            "📸 ORIGINAL:",
                            (file.size / 1024 / 1024).toFixed(2),
                            "MB",
                          );

                          // ✅ Compress Image
                          const compressed = await compressImage(
                            file,
                            "gallery",
                            formData?.categoryType === "land"
                              ? "Plot Image"
                              : "Floor Plan",
                          );

                          console.log(
                            "✅ COMPRESSED:",
                            (compressed.size / 1024 / 1024).toFixed(2),
                            "MB",
                          );

                          updateUnit(ui, {
                            planFile: compressed,
                            planFileName: compressed.name,
                            planPreview: URL.createObjectURL(compressed),
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
          {formData?.categoryType === "land"
            ? "+ Add Plot Variant"
            : "+ Add Unit Variant"}
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
                {formData?.categoryType === "land"
                  ? "Save Plot Configurations"
                  : "Save BHK Configurations"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}