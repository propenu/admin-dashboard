// StepPropertyDetails.jsx — Premium Emerald Theme
import {
  ImagePlus, Sparkles, Car, Home, UtensilsCrossed, AlignLeft,
  CheckCircle2, Save, ClipboardList, Globe, ShieldCheck, Minus, Plus
} from "lucide-react";
import AmenitiesInput from "../components/editable/AmenitiesInput";
import GalleryUpload from "../components/editable/GalleryUpload";
import SpecificationsInput from "../components/editable/SpecificationsInput";
import TenantInfo from "../components/editable/TenantInfo";
import BuildingManagement from "../components/editable/BuildingManagement";
import PantryInput from "../components/editable/PantryInput";
import BorewellDetails from "../components/editable/BorewellDetails";
import {
  KITCHEN_TYPES, PARKING_TYPES, COMMERCIAL_FLOORING, RESIDENTIAL_FLOORING,
  FACING_TYPES, LAYOUT_TYPES, SOIL_TYPES, WATER_SOURCES, IRRIGATION_TYPES,
} from "../components/editable/residentialEnums";

const FIRE_SAFETY = [
  { key: "fireExtinguisher", label: "Fire Extinguisher" },
  { key: "fireSprinklerSystem", label: "Sprinkler System" },
  { key: "fireHoseReel", label: "Hose Reel" },
  { key: "fireHydrant", label: "Fire Hydrant" },
  { key: "smokeDetector", label: "Smoke Detector" },
  { key: "fireAlarmSystem", label: "Alarm System" },
  { key: "fireControlPanel", label: "Control Panel" },
  { key: "emergencyExitSignage", label: "Exit Signage" },
];

const LAND_FEATURES = [
  { key: "readyToConstruct", label: "Ready to Construct" },
  { key: "waterConnection", label: "Water Connection" },
  { key: "electricityConnection", label: "Electricity" },
  { key: "fencing", label: "Fencing Done" },
  { key: "cornerPlot", label: "Corner Plot" },
  { key: "isPriceNegotiable", label: "Price Negotiable" },
];

const AGRICULTURAL_FEATURES = [
  { key: "boundaryWall", label: "Boundary Wall" },
  { key: "electricityConnection", label: "Electricity" },
  
]

export default function StepPropertyDetails({ data, onChange, onSave }) {
  
  if (!data) return null;
  const upd = (f, v) => onChange(f, v, "details");
  const cat = (data.categoryType || data.propertyCategory)?.toLowerCase();

  const totalImgs = data.galleryFiles?.length || data.gallery?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#27AE60]">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#27AE60]">Property presentation</p>
            <h2 className="mt-0.5 text-sm font-black text-slate-900">Features, media and property specifications</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500 sm:self-auto">
          <CheckCircle2 className="h-3 w-3 text-[#27AE60]" />
          Changes remain editable
        </div>
      </div>
      {/* Gallery */}
      <ColorBlock borderColor="#bfdbfe" bgFrom="#eff6ff08" stripColor="#3B82F6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconBox bg="#dbeafe" color="#2563eb">
              <ImagePlus className="w-4 h-4" />
            </IconBox>
            <div>
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                Visual Gallery
              </p>
              <p className="text-[10px] text-blue-400 italic">
                {totalImgs >= 5
                  ? "✨ Excellent! High images = more leads"
                  : "💡 Add 5+ photos for 3× views"}
              </p>
            </div>
          </div>
          <CountBadge count={totalImgs} max={12} />
        </div>
        <div className="rounded-xl border border-blue-100/60 bg-white p-2.5 sm:p-3">
          <GalleryUpload
            existing={data.gallery || []}
            files={data.galleryFiles || []}
            onChange={(rawFiles) => upd("galleryFiles", rawFiles)}
            onRemoveExisting={(key) =>
              upd(
                "gallery",
                data.gallery.filter((img) => img.key !== key),
              )
            }
          />
        </div>
      </ColorBlock>

      {/* Amenities */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
        <SH
          icon={<Sparkles className="w-4 h-4" />}
          title="Features & Amenities"
          bg="#f0fdf4"
          color="#27AE60"
          badge={`${data.amenities?.length || 0} Selected`}
        />
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <AmenitiesInput
            value={data.amenities || []}
            onChange={(v) => upd("amenities", v)}
            propertyType={cat}
          />
        </div>
      </div>

      {cat === "residential" && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
          <SH
            icon={<ClipboardList className="w-4 h-4" />}
            title="Specifications"
            bg="#f0fdf4"
            color="#27AE60"
            badge={`${data.specifications?.length || 0} Categories`}
          />
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <SpecificationsInput
              value={data.specifications || []}
              onChange={(v) => upd("specifications", v)}
            />
          </div>
        </div>
      )}

      {/* Commercial Block */}
      {cat === "commercial" && (
        <ColorBlock
          borderColor="#27AE6025"
          bgFrom="#f9fdfb"
          stripColor="#27AE60"
        >
          <SH
            icon={<ClipboardList className="w-4 h-4" />}
            title="Logistics & Operations"
            bg="#f0fdf4"
            color="#27AE60"
          />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PantryInput data={data} onChange={upd} />
            <FI
              label="Zoning"
              value={data.zoning || ""}
              onChange={(v) => upd("zoning", v)}
              placeholder="Industrial / Commercial"
              icon={<Globe className="w-3 h-3" />}
            />
          </div>
          <div className="mt-4 border-t border-[#27AE60]/10 pt-4">
            <BuildingManagement data={data} onChange={upd} />
          </div>
          <div className="mt-4 border-t border-[#27AE60]/10 pt-4">
            <TenantInfo
              data={data}
              onUpdateTenant={(t) => upd("tenantInfo", t)}
            />
          </div>
          <div className="mt-4 space-y-3 border-t border-[#27AE60]/10 pt-4">
            <SH
              icon={<ShieldCheck className="w-4 h-4" />}
              title="Fire Safety & Compliance"
              bg="#f0fdf4"
              color="#27AE60"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {FIRE_SAFETY.map((item) => {
                const checked = !!data.fireSafety?.[item.key];
                return (
                  <TC
                    key={item.key}
                    label={item.label}
                    checked={checked}
                    onToggle={() =>
                      upd("fireSafety", {
                        ...(data.fireSafety || {}),
                        [item.key]: !checked,
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        </ColorBlock>
      )}

      {/* Parking */}
      {(cat === "residential" || cat === "commercial") && (
        <ColorBlock
          borderColor="#fde68a50"
          bgFrom="#fffbeb08"
          stripColor="#F59E0B"
        >
          <SH
            icon={<Car className="w-4 h-4" />}
            title="Parking Configuration"
            bg="#fef3c7"
            color="#D97706"
          />
          {cat === "residential" && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PARKING_TYPES.map((type) => {
                const isSel = data.parkingType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => upd("parkingType", type.value)}
                    className="relative min-h-14 rounded-xl border-2 px-2 py-2 text-center transition-all"
                    style={{
                      borderColor: isSel ? "#F59E0B" : "#fef3c740",
                      background: isSel ? "#fffbeb" : "#fff",
                      boxShadow: isSel ? "0 4px 16px #F59E0B25" : "none",
                      transform: isSel ? "translateY(-2px)" : "",
                    }}
                  >
                    <span className="text-2xl block mb-1.5">🅿️</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-tight ${isSel ? "text-amber-700" : "text-slate-400"}`}
                    >
                      {type.label}
                    </span>
                    {isSel && (
                      <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ParkingCounter
              label="Two Wheeler"
              icon="🏍️"
              value={data.parkingDetails?.twoWheeler || 0}
              onUpdate={(val) =>
                upd("parkingDetails", {
                  ...data.parkingDetails,
                  twoWheeler: val,
                })
              }
            />
            <ParkingCounter
              label="Four Wheeler"
              icon="🚙"
              value={data.parkingDetails?.fourWheeler || 0}
              onUpdate={(val) =>
                upd("parkingDetails", {
                  ...data.parkingDetails,
                  fourWheeler: val,
                })
              }
            />
          </div>
        </ColorBlock>
      )}

      {/* Floor + Kitchen */}
      {(cat === "residential" || cat === "commercial") && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Panel>
            <SH
              icon={<Home className="w-4 h-4" />}
              title="Infrastructure"
              bg="#f1f5f9"
              color="#64748b"
            />
            <div className="mt-3 space-y-3">
              <FS
                label="Flooring Type"
                value={data.flooringType || ""}
                onChange={(v) => upd("flooringType", v)}
                options={
                  cat === "commercial"
                    ? COMMERCIAL_FLOORING
                    : RESIDENTIAL_FLOORING
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <FI
                  label="Floor No."
                  type="number"
                  value={data.floorNumber ?? ""}
                  onChange={(v) => upd("floorNumber", parseInt(v) || 0)}
                />
                <FI
                  label="Total Floors"
                  type="number"
                  value={data.totalFloors ?? ""}
                  onChange={(v) => upd("totalFloors", parseInt(v) || 0)}
                />
              </div>
            </div>
          </Panel>
          <Panel>
            <SH
              icon={<UtensilsCrossed className="w-4 h-4" />}
              title="Culinary Space"
              bg="#f1f5f9"
              color="#64748b"
            />
            <div className="mt-3 space-y-3">
              {cat === "residential" && (
                <>
                  <FS
                    label="Kitchen Type"
                    value={data.kitchenType || ""}
                    onChange={(v) => upd("kitchenType", v)}
                    options={KITCHEN_TYPES}
                  />
                  <TR
                    label="Modular Configuration"
                    checked={!!data.isModularKitchen}
                    onToggle={(v) => upd("isModularKitchen", v)}
                  />
                </>
              )}
              <TR
                label="Price Negotiable"
                checked={!!data.isPriceNegotiable}
                onToggle={(v) => upd("isPriceNegotiable", v)}
              />
            </div>
          </Panel>
        </div>
      )}

      {/* Land */}
      {cat === "land" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FS
              label="Facing"
              value={data.facing || ""}
              onChange={(v) => upd("facing", v)}
              options={FACING_TYPES}
            />
            <FS
              label="Layout Type"
              value={data.layoutType || ""}
              onChange={(v) => upd("layoutType", v)}
              options={LAYOUT_TYPES}
            />
            <FI
              label="Survey Number"
              value={data.surveyNumber || ""}
              onChange={(v) => upd("surveyNumber", v)}
            />
            <FI
              label="Land Use Zone"
              value={data.landUseZone || ""}
              onChange={(v) => upd("landUseZone", v)}
            />
          </div>
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <SH
              icon={<Sparkles className="w-4 h-4" />}
              title="Land Features"
              bg="#f0fdf4"
              color="#27AE60"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LAND_FEATURES.map((item) => (
                <TC
                  key={item.key}
                  label={item.label}
                  checked={!!data[item.key]}
                  onToggle={() => upd(item.key, !data[item.key])}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agricultural */}
      {cat === "agricultural" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              // { label: "Plantation Age", key: "plantationAge", type: "number" },
              {
                label: "Number of Borewells",
                key: "numberOfBorewells",
                type: "number",
              },
              { label: "Current Crop", key: "currentCrop" },
              // { label: "Suitable For", key: "suitableFor" },
              { label: "Land Shape", key: "landShape" },
              {
                label: "Purchase Restrictions",
                key: "statePurchaseRestrictions",
              },
              { label: "Access Road Type", key: "accessRoadType" },
            ].map(({ label, key, type }) => (
              <FI
                key={key}
                label={label}
                type={type}
                value={data[key] || ""}
                onChange={(v) => upd(key, v)}
              />
            ))}
            <FS
              label="Soil Type"
              value={data.soilType || ""}
              onChange={(v) => upd("soilType", v)}
              options={SOIL_TYPES}
            />
            <FS
              label="Irrigation Type"
              value={data.irigationType || ""}
              onChange={(v) => upd("irigationType", v)}
              options={IRRIGATION_TYPES}
            />
            <FS
              label="Water Source"
              value={data.waterSource || ""}
              onChange={(v) => upd("waterSource", v)}
              options={WATER_SOURCES}
            />

            <div className="col-span-full">
              <BorewellDetails data={data} onChange={upd} />
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <SH
              icon={<Sparkles className="w-4 h-4" />}
              title="Agricultural Features"
              bg="#f0fdf4"
              color="#27AE60"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGRICULTURAL_FEATURES.map((item) => (
                <TC
                  key={item.key}
                  label={item.label}
                  checked={!!data[item.key]}
                  onToggle={() => upd(item.key, !data[item.key])}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
        <SH
          icon={<AlignLeft className="w-4 h-4" />}
          title="Narrative & Remarks"
          bg="#f8f0ff"
          color="#8B5CF6"
        />
        <div className="relative">
          <textarea
            value={data.description || ""}
            onChange={(e) => upd("description", e.target.value)}
            placeholder="What makes this property special? Describe highlights, nearby amenities, unique features..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-700 outline-none transition-all placeholder:text-slate-300 hover:border-emerald-200 focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
          <span className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 tabular-nums">
            {data.description?.length || 0}/2000
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onSave}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all active:scale-95 sm:w-auto"
          style={{
            background: "linear-gradient(135deg, #27AE60, #219653)",
            boxShadow: "0 8px 25px #27AE6035",
          }}
        >
          <Save className="w-4 h-4" />
          Finalize Details
        </button>
      </div>
    </div>
  );
}

/* ═══ Shared Micro-Components ═══ */

function ColorBlock({ children, borderColor, bgFrom, stripColor }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]" style={{ borderColor, background: bgFrom }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${stripColor}, ${stripColor}35, transparent)` }} />
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

function IconBox({ bg, color, children }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: bg, color }}>{children}</div>
  );
}

function CountBadge({ count, max }) {
  const good = count >= 5;
  return (
    <div className="rounded-lg px-2.5 py-1 text-[10px] font-black tabular-nums" style={{ background: good ? "#f0fdf4" : "#f8fafc", color: good ? "#15803d" : "#64748b", border: `1px solid ${good ? "#27AE6030" : "#e2e8f0"}` }}>
      {count} / {max}
    </div>
  );
}

function SH({ icon, title, bg, color, badge }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: bg, color }}>{icon}</div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">{title}</h3>
      {badge && <div className="ml-auto rounded-full px-2 py-1 text-[9px] font-black" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>{badge}</div>}
    </div>
  );
}

function TC({ label, checked, onToggle }) {
  return (
    <div className="flex min-h-10 items-center justify-between rounded-lg border px-3 py-2 transition-all" style={{ borderColor: checked ? "#27AE60" : "#e2e8f0", background: checked ? "#f0fdf4" : "#fff", boxShadow: checked ? "0 2px 12px #27AE6015" : "none" }}>
      <span className={`text-[9px] font-black uppercase tracking-tight ${checked ? "text-[#15803d]" : "text-slate-500"}`}>{label}</span>
      <button type="button" onClick={onToggle} className="relative ml-3 h-4 w-8 shrink-0 rounded-full transition-colors" style={{ background: checked ? "#27AE60" : "#cbd5e1" }}>
        <span className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all" style={{ left: checked ? "calc(100% - 14px)" : "2px" }} />
      </button>
    </div>
  );
}

function TR({ label, checked, onToggle }) {
  return (
    <div className="flex min-h-10 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-emerald-200">
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
      <button type="button" onClick={() => onToggle(!checked)} className="relative h-4 w-8 shrink-0 rounded-full transition-colors" style={{ background: checked ? "#27AE60" : "#cbd5e1" }}>
        <span className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all" style={{ left: checked ? "calc(100% - 14px)" : "2px" }} />
      </button>
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md sm:p-4">{children}</div>;
}

function FS({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="ml-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition-all hover:border-emerald-200 focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-emerald-100">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function FI({ label, type = "text", value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="ml-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{icon}{label}</label>
      <input type={type} min={type === "number" ? "0" : undefined} value={value} placeholder={placeholder || "—"} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-300 hover:border-emerald-200 focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-emerald-100" />
    </div>
  );
}

function ParkingCounter({ label, icon, value, onUpdate }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center gap-2"><span className="text-base">{icon}</span><span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{label}</span></div>
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        <button type="button" onClick={() => onUpdate(Math.max(0, Number(value || 0) - 1))} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white transition-all hover:bg-red-50 hover:text-red-500"><Minus className="h-3 w-3" /></button>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={value}
          onFocus={(event) => event.target.select()}
          onChange={(event) =>
            onUpdate(Math.max(0, Math.trunc(Number(event.target.value) || 0)))
          }
          className="w-9 bg-transparent text-center text-xs font-black tabular-nums text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={label}
        />
        <button type="button" onClick={() => onUpdate(Number(value || 0) + 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white transition-all hover:bg-[#27AE60]/10 hover:text-[#27AE60]"><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  );
}
