
// StepBasicDetails.jsx
import React from "react";
import {
  Home, Layers, Zap, Info, Tag, Clock, Compass,
  ArrowRightLeft, ChevronDown, Save, Minus, Plus
} from "lucide-react";
import * as Enums from "../components/editable/residentialEnums";
import TotalArea from "../components/editable/TotalArea"; 
import CreatedBy  from "../../PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/CreatedBy";

const ROAD_WIDTH_UNITS = [
  { label: "Feet", value: "ft", icon: "📏" },
  { label: "Meters", value: "m", icon: "📐" },
];

const PLOT_AREA_UNITS = [
  { label: "sq.ft", value: "sqft" },
  { label: "sq.mt", value: "sqmt" },
  { label: "sq.yd", value: "sqyd" },
  { label: "Acre", value: "acre" },
  { label: "Guntha", value: "guntha" },
  { label: "Cent", value: "cent" },
  { label: "Kanal", value: "kanal" },
  { label: "Hectare", value: "hectare" },
];

const PLOT_AREA_TO_SQFT = {
  sqft: 1,
  sqmt: 10.7639104167,
  sqyd: 9,
  acre: 43560,
  guntha: 1089,
  cent: 435.6,
  kanal: 5445,
  hectare: 107639.104167,
};

const AGENT_PROJECT_TYPES = {
  residential: [
    { label: "Apartment", value: "apartment" },
    { label: "Villa", value: "villa" },
  ],
  land: [
    { label: "Open Plot", value: "residential-plot" },
    { label: "Commercial Plot", value: "commercial-plot" },
  ],
};

export default function StepBasicDetails({
  data = {},
  onChange,
  onSave,
  createdByError,
}) {
  const cat = (data.propertyCategory || "residential").toLowerCase();
  const isLoading = data.loading;
  const upd = React.useCallback(
    (field, value) => onChange(field, value, "basic"),
    [onChange],
  );
  const hasProjectInventory = [
    "projectArea",
    "totalTowers",
    "totalUnits",
    "availableUnits",
  ].some(
    (field) =>
      Object.prototype.hasOwnProperty.call(data, field) &&
      data[field] !== "" &&
      data[field] !== null &&
      data[field] !== undefined,
  );
  const isAgentProject = Boolean(data.isAgentProject || hasProjectInventory);

  React.useEffect(() => {
    let areaInSqft = 0;

    if (cat === "residential" || cat === "commercial") {
      areaInSqft = Number(
        data.priceCalculationBasis === "builtUpArea"
          ? data.builtUpArea
          : data.carpetArea,
      );
    } else if (cat === "land") {
      areaInSqft =
        Number(data.plotArea) *
        (PLOT_AREA_TO_SQFT[data.plotAreaUnit || "sqft"] || 1);
    } else if (cat === "agricultural") {
      areaInSqft = Number(data.totalArea?.value);
    }

    if (Number(data.price) > 0 && areaInSqft > 0) {
      const calculated = Math.round(Number(data.price) / areaInSqft);
      if (Number(data.pricePerSqft) !== calculated) {
        upd("pricePerSqft", calculated);
      }
    }
  }, [
    cat,
    data.price,
    data.carpetArea,
    data.builtUpArea,
    data.priceCalculationBasis,
    data.plotArea,
    data.plotAreaUnit,
    data.totalArea,
    data.pricePerSqft,
    upd,
  ]);

  const propertyTypes = () => ({ commercial: Enums.COMMERCIAL_TYPES, land: Enums.LAND_TYPES, agricultural: Enums.AGRI_TYPES })[cat] || Enums.PROPERTY_TYPES;
  const subTypes = () => ({ commercial: Enums.COMMERCIAL_SUB_TYPES, land: Enums.LAND_SUB_TYPES, agricultural: Enums.AGRI_SUB_TYPES })[cat] || [];
  const furnishTypes = () => cat === "commercial" ? Enums.FURNISHED_STATUS_COMMERCIAL : Enums.FURNISHING_TYPES;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#27AE60]">
            Property essentials
          </p>
          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            Basic details
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Define how this property is listed, priced, and presented.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Autosave enabled
        </span>
      </div>

      {/* Intent */}
      <Block
        label="Listing Intent"
        icon={<Tag className="w-3.5 h-3.5" />}
        required
      >
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          {Enums.LISTING_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("listingType", item.value)}
              className="relative flex min-h-12 items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor:
                  data.listingType === item.value ? "#27AE60" : "#e5e7eb",
                background:
                  data.listingType === item.value
                    ? "linear-gradient(135deg,#f0fdf4,#f8fffe)"
                    : "#fff",
                boxShadow:
                  data.listingType === item.value
                    ? "0 4px 20px #27AE6018"
                    : "none",
              }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm transition-transform ${data.listingType === item.value ? "scale-105 bg-emerald-100" : ""}`}
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold ${data.listingType === item.value ? "text-[#1a7a43]" : "text-slate-700"}`}
                >
                  {item.label}
                </p>
                {item.description && (
                  <p className="mt-0.5 truncate text-[9px] font-medium leading-tight text-slate-400">
                    {item.description}
                  </p>
                )}
              </div>
              {data.listingType === item.value && (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#27AE60]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Block>

      {/* Property Type */}
      <Block
        label={isAgentProject ? "Project Property Sub Type" : "Property Type"}
        icon={<Layers className="w-3.5 h-3.5" />}
      >
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {(isAgentProject
            ? AGENT_PROJECT_TYPES[cat] || []
            : propertyTypes()
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("propertyType", item.value)}
              className="flex min-h-9 items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-left text-[11px] font-bold transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
              style={{
                borderColor:
                  data.propertyType === item.value ? "#27AE60" : "#e5e7eb",
                background:
                  data.propertyType === item.value ? "#f0fdf4" : "#fff",
                color: data.propertyType === item.value ? "#15803d" : "#64748b",
                boxShadow:
                  data.propertyType === item.value
                    ? "0 2px 12px #27AE6020"
                    : "none",
              }}
            >
              {item.icon && <span className="text-sm">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      </Block>

      {/* Sub-type */}
      {!isAgentProject && subTypes().length > 0 && (
        <Block label="Sub Type" icon={<Layers className="w-3.5 h-3.5" />}>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
            {subTypes().map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => upd("propertySubType", item.value)}
                className="flex min-h-9 items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-left text-[11px] font-bold transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                style={{
                  borderColor:
                    data.propertySubType === item.value ? "#27AE60" : "#e5e7eb",
                  background:
                    data.propertySubType === item.value ? "#f0fdf4" : "#fff",
                  color:
                    data.propertySubType === item.value ? "#15803d" : "#64748b",
                }}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </Block>
      )}

      {/* Room Counters */}
      {(cat === "residential" || cat === "commercial") && (
        <Block label="Room Configuration" icon={<Home className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            <RoomCounter
              icon="🛏️"
              label={cat === "commercial" ? "Cabins" : "Bedrooms"}
              value={
                cat === "commercial" ? data.cabins || 0 : data.bedrooms || 0
              }
              onChange={(v) =>
                upd(cat === "commercial" ? "cabins" : "bedrooms", v)
              }
            />
            {cat === "commercial" && (
              <RoomCounter
                icon="💺"
                label="Seats"
                value={data.seats || 0}
                onChange={(v) => upd("seats", v)}
              />
            )}
            {cat === "residential" && (
              <RoomCounter
                icon="🚿"
                label="Bathrooms"
                value={data.bathrooms || 0}
                onChange={(v) => upd("bathrooms", v)}
              />
            )}
            {cat === "residential" && (
              <RoomCounter
                icon="🏖️"
                label="Balconies"
                value={data.balconies || 0}
                onChange={(v) => upd("balconies", v)}
              />
            )}
          </div>
        </Block>
      )}

      {isAgentProject && (
        <Block label="Project Inventory" icon={<Layers className="w-3.5 h-3.5" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(cat === "residential" || cat === "land") && (
              <NumField
                label="Project Area"
                value={data.projectArea ?? ""}
                onChange={(v) => upd("projectArea", v)}
              />
            )}
            {cat === "residential" && (
              <NumField
                label="Total Towers"
                value={data.totalTowers ?? ""}
                onChange={(v) => upd("totalTowers", v)}
              />
            )}
            <NumField
              label="Total Units"
              value={data.totalUnits ?? ""}
              onChange={(v) => upd("totalUnits", v)}
            />
            <NumField
              label="Available Units"
              value={data.availableUnits ?? ""}
              onChange={(v) => upd("availableUnits", v)}
            />
          </div>
        </Block>
      )}

      {/* Furnishing + Availability */}
      {(cat === "residential" || cat === "commercial") && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Block label="Furnishing" icon={<Home className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              {furnishTypes().map((item) => {
                const active =
                  data.furnishing === item.value ||
                  data.furnishedStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      upd(
                        cat === "commercial" ? "furnishedStatus" : "furnishing",
                        item.value,
                      )
                    }
                    className="flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-center transition-all hover:border-emerald-300 hover:shadow-sm"
                    style={{
                      borderColor: active ? "#27AE60" : "#e5e7eb",
                      background: active ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <span className="block text-sm leading-none">{item.icon}</span>
                    <span
                      className={`text-[9px] font-bold uppercase leading-3 tracking-tight ${active ? "text-[#15803d]" : "text-slate-600"} `}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {data.constructionStatus === "under-construction" && (
              <div className="mt-3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Possession Date
                </label>
                <input
                  type="date"
                  value={data.possessionDate?.slice?.(0, 10) || ""}
                  onChange={(event) => upd("possessionDate", event.target.value)}
                  className="h-10 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition hover:border-emerald-200 focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            )}
          </Block>
          <Block label="Availability" icon={<Zap className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              {Enums.AVAILABILITY_TYPES.map((item) => {
                const active = data.constructionStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => upd("constructionStatus", item.value)}
                    className="flex h-14 min-w-0 items-center justify-center gap-2 rounded-lg border px-2 py-1.5 transition-all hover:border-emerald-300 hover:shadow-sm"
                    style={{
                      borderColor: active ? "#27AE60" : "#e5e7eb",
                      background: active
                        ? "linear-gradient(135deg,#f0fdf4,#f8fffe)"
                        : "#fff",
                    }}
                  >
                    <span className="shrink-0 text-sm">{item.icon}</span>
                    <span
                      className={`text-center text-[10px] font-bold leading-3.5 ${active ? "text-[#15803d]" : "text-slate-600"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Block>
        </div>
      )}

      {/* Dropdowns */}
      {cat !== "agricultural" && (
      <Block label="Property Attributes" icon={<Compass className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(cat === "residential" || cat === "commercial") && (
          <ElegantDrop
            label="Property Age"
            icon={<Clock className="w-3.5 h-3.5" />}
            value={data.propertyAge}
            options={Enums.PROPERTY_AGE_TYPES}
            onChange={(v) => upd("propertyAge", v)}
          />
        )}
        {(cat === "residential" || cat === "commercial" || cat === "land") && (
          <ElegantDrop
            label="Transaction"
            icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            value={data.transactionType}
            options={Enums.TRANSACTION_TYPES}
            onChange={(v) => upd("transactionType", v)}
          />
        )}
        {cat === "residential" && (
          <ElegantDrop
            label="Facing"
            icon={<Compass className="w-3.5 h-3.5" />}
            value={data.facing}
            options={Enums.FACING_TYPES}
            onChange={(v) => upd("facing", v)}
          />
        )}
        {cat === "commercial" && (
          <ElegantDrop
            label="Wall Finish"
            icon={<Compass className="w-3.5 h-3.5" />}
            value={data.wallFinishStatus}
            options={Enums.WALL_FINISH_STATUS}
            onChange={(v) => upd("wallFinishStatus", v)}
          />
        )}
        </div>
      </Block>
      )}

      {/* Financials */}
      {(cat === "residential" || cat === "commercial" || cat === "land") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FinCard
            headerColor="#27AE60"
            headerIcon="₹"
            headerLabel="Price Terms"
          >
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumField
                label="Expected Price"
                value={data.price || ""}
                onChange={(v) => upd("price", v)}
                prefix="₹"
              />
              <NumField
                label="Price / sqft"
                value={data.pricePerSqft || ""}
                onChange={(v) => upd("pricePerSqft", v)}
                prefix="₹"
              />
            </div>
            {(cat === "residential" || cat === "commercial") && (
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Calculate price / sqft using
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "carpetArea", label: "Carpet Area" },
                    { value: "builtUpArea", label: "Built-up Area" },
                  ].map((option) => {
                    const active =
                      (data.priceCalculationBasis || "carpetArea") ===
                      option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          upd("priceCalculationBasis", option.value)
                        }
                        className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
                          active
                            ? "border-[#27AE60] bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  Automatically calculated from Price ÷{" "}
                  {(data.priceCalculationBasis || "carpetArea") ===
                  "builtUpArea"
                    ? "Built-up Area"
                    : "Carpet Area"}
                </p>
              </div>
            )}
          </FinCard>
          <FinCard
            headerColor="#27AE60"
            headerIcon="📏"
            headerLabel="Dimension Metrics"
          >
            <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(cat === "residential" || cat === "commercial") && (
                <>
                  <NumField
                    label="Built-up (sqft)"
                    value={data.builtUpArea || ""}
                    onChange={(v) => upd("builtUpArea", v)}
                  />
                  <NumField
                    label="Carpet (sqft)"
                    value={data.carpetArea || ""}
                    onChange={(v) => upd("carpetArea", v)}
                  />
                </>
              )}
              {cat === "land" && (
                <>
                  <NumField
                    label="Length"
                    value={data.dimensions?.length || ""}
                    onChange={(v) =>
                      upd("dimensions", { ...data.dimensions, length: v })
                    }
                  />
                  <NumField
                    label="Width"
                    value={data.dimensions?.width || ""}
                    onChange={(v) =>
                      upd("dimensions", { ...data.dimensions, width: v })
                    }
                  />
                  <NumField
                    label="Road Width (ft)"
                    value={data.roadWidthFt || ""}
                    onChange={(v) => upd("roadWidthFt", v)}
                  />
                  {/* <NumField
                    label="Plot Area"
                    value={data.plotArea || ""}
                    onChange={(v) => upd("plotArea", v)}
                  />
                  <NumField
                    label="Plot Area units"
                    value={data.plotAreaUnit || ""}
                    onChange={(v) => upd("plotAreaUnit", v)}
                  /> */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Plot Area
                    </label>

                    <div className="flex flex-col overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 transition focus-within:border-[#27AE60] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 min-[420px]:flex-row min-[420px]:items-center">
                      {/* Plot Area Input */}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        placeholder="0"
                        value={data.plotArea || ""}
                        onChange={(e) => upd("plotArea", e.target.value)}
                        className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs font-bold text-slate-800 outline-none"
                      />

                      {/* Unit Dropdown */}
                      <select
                        value={data.plotAreaUnit || ""}
                        onChange={(e) => upd("plotAreaUnit", e.target.value)}
                        className="h-10 w-full border-t border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none min-[420px]:w-32 min-[420px]:border-l min-[420px]:border-t-0"
                      >
                        <option value="">Unit</option>
                        {PLOT_AREA_UNITS.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </FinCard>
        </div>
      )}

      {cat === "agricultural" && (
        <FinCard
          headerColor="#27AE60"
          headerIcon="📐"
          headerLabel="Dimension Metrics"
        >
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* <NumField label="Road Width (ft)" value={data.roadWidth || ""} onChange={(v) => upd("roadWidth", v)} /> */}
            <MeasurementField
              label="Road Width"
              value={data.roadWidth?.value || ""}
              unit={data.roadWidth?.unit || "ft"}
              units={ROAD_WIDTH_UNITS}
              onValueChange={(value) =>
                upd("roadWidth", { ...data.roadWidth, value })
              }
              onUnitChange={(unit) =>
                upd("roadWidth", { ...data.roadWidth, unit })
              }
            />
            <TotalArea
              value={data.totalArea}
              onChange={(val) => upd("totalArea", val)}
            />
            <FinCard
              headerColor="#27AE60"
              headerIcon="₹"
              headerLabel="Commercial Terms"
            >
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumField
                  label="Expected Price"
                  value={data.price || ""}
                  onChange={(v) => upd("price", v)}
                  prefix="₹"
                />
              </div>
            </FinCard>
          </div>
        </FinCard>
      )}

      <CreatedBy data={data} onChange={upd} error={createdByError} />

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#27AE60]" />
          </div>
          <div>
            <p className="text-xs text-[#27AE60]">Basic Details</p>
            <p className="text-[10px] text-[#000000]">
              Progress auto-saved as you make changes
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={onSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          style={{
            background: isLoading
              ? "#94a3b8"
              : "linear-gradient(135deg, #27AE60, #1e9e52)",
            boxShadow: isLoading ? "none" : "0 8px 25px #27AE6035",
          }}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Block({ label, icon, required, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#27AE60]">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      </div>
      {children}
    </section>
  );
}

function RoomCounter({ icon, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5"><span className="text-sm">{icon}</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span></div>
      <div className="flex h-10 items-center overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition focus-within:border-[#27AE60] focus-within:ring-4 focus-within:ring-emerald-100">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="flex h-full w-10 items-center justify-center border-r border-slate-200 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"><Minus className="w-3.5 h-3.5" /></button>
        <span className="flex-1 text-center text-sm font-black tabular-nums text-slate-800">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="flex h-full w-10 items-center justify-center border-l border-slate-200 text-[#27AE60] transition-colors hover:bg-emerald-50"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function ElegantDrop({ label, icon, value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const sel = options.find((o) => o.value === value);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[#27AE60]">{icon}<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span></div>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="flex h-10 w-full items-center justify-between rounded-xl border-2 bg-white px-3 text-xs transition-all hover:border-emerald-300"
          style={{ borderColor: open ? "#27AE60" : "#e5e7eb", boxShadow: open ? "0 0 0 4px #27AE6010" : "none" }}>
          <div className="flex items-center gap-2">
            {sel ? <><span className="text-base">{sel.icon}</span><span className=" text-slate-700">{sel.label}</span></> : <span className="text-slate-400 font-medium">Select {label}</span>}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-1" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
              {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#f0fdf4] transition-colors"
                  style={{ background: value === opt.value ? "#f0fdf4" : "" }}>
                  <span className="text-base">{opt.icon}</span>
                  <span className={value === opt.value ? "font-black text-[#15803d]" : "font-medium text-slate-600"}>{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FinCard({ children, headerColor, headerIcon, headerLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md sm:p-4">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-white" style={{ background: headerColor }}>{headerIcon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: headerColor }}>{headerLabel}</span>
      </div>
      {children}
    </div>
  );
}

function MeasurementField({
  label,
  value,
  unit,
  units,
  onValueChange,
  onUnitChange,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <div className="flex h-10 overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 transition-all focus-within:border-[#27AE60] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="0"
          className="min-w-0 flex-1 bg-transparent px-3 text-xs font-bold text-slate-800 outline-none"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="w-24 border-l border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600 outline-none"
        >
          {units.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, prefix }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      <div className="flex h-10 items-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 transition-all focus-within:border-[#27AE60] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
        {prefix && <span className="flex h-full items-center border-r border-slate-200 bg-white px-3 text-sm font-bold text-[#27AE60]">{prefix}</span>}
        <input type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-xs font-bold text-slate-800 outline-none placeholder:text-slate-300" />
      </div>
    </div>
  );
}
