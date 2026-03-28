
// StepBasicDetails.jsx — Premium Emerald Theme, Full Responsive
import React from "react";
import {
  Home, Layers, Zap, Info, Tag, Clock, Compass,
  ArrowRightLeft, ChevronDown, Save, Minus, Plus
} from "lucide-react";
import * as Enums from "../components/editable/residentialEnums";
import TotalArea from "../components/editable/TotalArea";

const ROAD_WIDTH_UNITS = [
  { label: "Feet", value: "ft", icon: "📏" },
  { label: "Meters", value: "m", icon: "📐" },
];

export default function StepBasicDetails({ data, onChange, onSave }) {
  if (!data) return null;
  const cat = data.propertyCategory || "residential";
  const isLoading = data.loading;
  const upd = (f, v) => onChange(f, v, "basic");

  const propertyTypes = () => ({ commercial: Enums.COMMERCIAL_TYPES, land: Enums.LAND_TYPES, agricultural: Enums.AGRI_TYPES })[cat] || Enums.PROPERTY_TYPES;
  const subTypes = () => ({ commercial: Enums.COMMERCIAL_SUB_TYPES, land: Enums.LAND_SUB_TYPES, agricultural: Enums.AGRI_SUB_TYPES })[cat] || [];
  const furnishTypes = () => cat === "commercial" ? Enums.FURNISHED_STATUS_COMMERCIAL : Enums.FURNISHING_TYPES;

  return (
    <div className="space-y-4">
      {/* Intent */}
      <Block
        label="Listing Intent"
        icon={<Tag className="w-3.5 h-3.5" />}
        required
      >
        <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
          {Enums.LISTING_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("listingType", item.value)}
              className="relative  text-center   p-1 rounded-2xl border-2 transition-all"
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
                className={`text-1xl block mb-1 transition-transform ${data.listingType === item.value ? "scale-110" : ""}`}
              >
                {item.icon}
              </span>
              <p
                className={` text-sm ${data.listingType === item.value ? "text-[#1a7a43]" : "text-slate-700"}`}
              >
                {item.label}
              </p>
              {item.description && (
                <p className="text-[10px] text-[#666] mt-0.5 font-medium leading-tight">
                  {item.description}
                </p>
              )}
              {data.listingType === item.value && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#27AE60] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Block>

      {/* Property Type */}
      <Block label="Property Type" icon={<Layers className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-2">
          {propertyTypes().map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("propertyType", item.value)}
              className="flex items-center gap-2 px-2 py-2 rounded-xl text-xs  transition-all border-2"
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
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </Block>

      {/* Sub-type */}
      {subTypes().length > 0 && (
        <Block label="Sub Type" icon={<Layers className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-2">
            {subTypes().map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => upd("propertySubType", item.value)}
                className="flex items-center gap-2 px-2 py-2 rounded-xl text-xs  transition-all border-2"
                style={{
                  borderColor:
                    data.propertySubType === item.value ? "#27AE60" : "#e5e7eb",
                  background:
                    data.propertySubType === item.value ? "#f0fdf4" : "#fff",
                  color:
                    data.propertySubType === item.value ? "#15803d" : "#64748b",
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </Block>
      )}

      {/* Room Counters */}
      {(cat === "residential" || cat === "commercial") && (
        <div
          className="rounded-2xl border border-[#27AE60]/15 p-2"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #f8fffe)" }}
        >
          <p className="text-[10px]  text-[#27AE60] uppercase mb-2">
            Room Configuration
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        </div>
      )}

      {/* Furnishing + Availability */}
      {(cat === "residential" || cat === "commercial") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Block label="Furnishing" icon={<Home className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-3 gap-2">
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
                    className="p-1 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor: active ? "#27AE60" : "#e5e7eb",
                      background: active ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <span className="text-xl block">{item.icon}</span>
                    <span
                      className={`text-xs uppercase tracking-tight ${active ? "text-[#15803d]" : "text-[#000000]"} `}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Block>
          <Block label="Availability" icon={<Zap className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-2 gap-2">
              {Enums.AVAILABILITY_TYPES.map((item) => {
                const active = data.constructionStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => upd("constructionStatus", item.value)}
                    className="flex justify-center items-center gap-3 p-2  rounded-xl border-2 transition-all"
                    style={{
                      borderColor: active ? "#27AE60" : "#e5e7eb",
                      background: active
                        ? "linear-gradient(135deg,#f0fdf4,#f8fffe)"
                        : "#fff",
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`text-sm  ${active ? "text-[#15803d]" : "text-slate-600"}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* Financials */}
      {(cat === "residential" || cat === "commercial" || cat === "land") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FinCard
            headerColor="#27AE60"
            headerIcon="₹"
            headerLabel="Price Terms"
          >
            <div className="grid grid-cols-2 gap-3 mt-4">
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
          </FinCard>
          <FinCard
            headerColor="#27AE60"
            headerIcon="📏"
            headerLabel="Dimension Metrics"
          >
            <div className="grid grid-cols-2 gap-3 mt-1">
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
                  <NumField
                    label="Plot Area"
                    value={data.plotArea || ""}
                    onChange={(v) => upd("plotArea", v)}
                  />
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
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* <NumField label="Road Width (ft)" value={data.roadWidth || ""} onChange={(v) => upd("roadWidth", v)} /> */}
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Road Width"
                value={data.roadWidth?.value || ""}
                onChange={(v) =>
                  upd("roadWidth", { ...data.roadWidth, value: v })
                }
              />

              <ElegantDrop
                label="Unit"
                icon={<Compass className="w-3.5 h-3.5" />}
                value={data.roadWidth?.unit}
                options={ROAD_WIDTH_UNITS}
                onChange={(v) =>
                  upd("roadWidth", { ...data.roadWidth, unit: v })
                }
              />
            </div>
            <TotalArea
              value={data.totalArea}
              onChange={(val) => upd("totalArea", val)}
            />
            <FinCard
              headerColor="#27AE60"
              headerIcon="₹"
              headerLabel="Commercial Terms"
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
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
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[#27AE60]">{icon}</span>
        <span className="text-[10px] font-bold text-[#27AE60] uppercase ">{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      </div>
      {children}
    </div>
  );
}

function RoomCounter({ icon, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5"><span className="text-sm">{icon}</span><span className="text-xs text-[#000000] uppercase ">{label}</span></div>
      <div className="flex items-center bg-white rounded-xl border border-[#27AE60]/50 overflow-hidden shadow-sm">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors border-r border-slate-300"><Minus className="w-3.5 h-3.5" /></button>
        <span className="flex-1 text-center  text-[#000000] tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-[#27AE60]/10 hover:text-[#27AE60] text-slate-400 transition-colors border-l border-slate-300"><Plus className="w-3.5 h-3.5 text-[#27AE60]" /></button>
      </div>
    </div>
  );
}

function ElegantDrop({ label, icon, value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const sel = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[#27AE60]">{icon}<span className="text-xs  uppercase">{label}</span></div>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-2 py-1 bg-white border-2 rounded-xl text-sm transition-all"
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
    <div className="bg-white rounded-2xl border border-[#27AE60] p-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-xl flex items-center justify-center text-white text-sm " style={{ background: headerColor }}>{headerIcon}</div>
        <span className="text-xs uppercase " style={{ color: headerColor }}>{headerLabel}</span>
      </div>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange, prefix }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#000000] uppercase ">{label}</label>
      <div className="flex items-center bg-slate-50 rounded-xl border border-[#27AE60]  focus-within:bg-white transition-all overflow-hidden">
        {prefix && <span className="pl-3 text-[#000000]  text-sm shrink-0">{prefix}</span>}
        <input type="number" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-3 outline-none  text-[#27AE60] text-sm bg-transparent" />
      </div>
    </div>
  );
}