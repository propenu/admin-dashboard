// StepPropertyDetails.jsx — Premium Emerald Theme
import {
  ImagePlus, Sparkles, Car, Home, UtensilsCrossed, AlignLeft,
  CheckCircle2, Save, ClipboardList, Globe, ShieldCheck, Minus, Plus
} from "lucide-react";
import AmenitiesInput from "../components/editable/AmenitiesInput";
import GalleryUpload from "../components/editable/GalleryUpload";
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
  const cat = data.propertyCategory?.toLowerCase();

  const totalImgs = (data.gallery?.length || 0) + (data.galleryFiles?.length || 0);

  return (
    <div className="space-y-8">
      {/* Gallery */}
      <ColorBlock borderColor="#bfdbfe" bgFrom="#eff6ff08" stripColor="#3B82F6">
        <div className="flex items-center justify-between mb-5">
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
          <CountBadge count={totalImgs} max={10} />
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-blue-100/60">
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
      <div className="space-y-4">
        <SH
          icon={<Sparkles className="w-4 h-4" />}
          title="Features & Amenities"
          bg="#f0fdf4"
          color="#27AE60"
          badge={`${data.amenities?.length || 0} Selected`}
        />
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 sm:p-7">
          <AmenitiesInput
            value={data.amenities || []}
            onChange={(v) => upd("amenities", v)}
            propertyType={cat}
          />
        </div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <PantryInput data={data} onChange={upd} />
            <FI
              label="Zoning"
              value={data.zoning || ""}
              onChange={(v) => upd("zoning", v)}
              placeholder="Industrial / Commercial"
              icon={<Globe className="w-3 h-3" />}
            />
          </div>
          <div className="pt-6 border-t border-[#27AE60]/10 mt-6">
            <BuildingManagement data={data} onChange={upd} />
          </div>
          <div className="pt-6 border-t border-[#27AE60]/10 mt-6">
            <TenantInfo
              data={data}
              onUpdateTenant={(t) => upd("tenantInfo", t)}
            />
          </div>
          <div className="pt-6 border-t border-[#27AE60]/10 mt-6 space-y-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {PARKING_TYPES.map((type) => {
                const isSel = data.parkingType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => upd("parkingType", type.value)}
                    className="relative p-4 rounded-2xl border-2 text-center transition-all"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Panel>
            <SH
              icon={<Home className="w-4 h-4" />}
              title="Infrastructure"
              bg="#f1f5f9"
              color="#64748b"
            />
            <div className="space-y-4 mt-5">
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
                  value={data.floorNumber || ""}
                  onChange={(v) => upd("floorNumber", parseInt(v) || 0)}
                />
                <FI
                  label="Total Floors"
                  type="number"
                  value={data.totalFloors || ""}
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
            <div className="space-y-4 mt-5">
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <div className="pt-4 border-t border-slate-100 space-y-4">
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
        <div className="space-y-6">
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
          <div className="pt-4 border-t border-slate-100 space-y-4">
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
      <div className="space-y-3">
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
            rows={5}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:border-purple-200 outline-none resize-none transition-all"
          />
          <span className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 tabular-nums">
            {data.description?.length || 0}/2000
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-5 border-t border-slate-100">
        <button
          onClick={onSave}
          className="flex items-center gap-2.5 px-8 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #7c3aed)",
            boxShadow: "0 8px 25px #8B5CF635",
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
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor, background: bgFrom }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${stripColor}70, ${stripColor}20, transparent)` }} />
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  );
}

function IconBox({ bg, color, children }) {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>{children}</div>
  );
}

function CountBadge({ count, max }) {
  const good = count >= 5;
  return (
    <div className="px-3.5 py-1.5 rounded-xl text-sm font-black tabular-nums" style={{ background: good ? "#f0fdf4" : "#f8fafc", color: good ? "#15803d" : "#64748b", border: `1.5px solid ${good ? "#27AE6030" : "#e2e8f0"}` }}>
      {count} / {max}
    </div>
  );
}

function SH({ icon, title, bg, color, badge }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>{icon}</div>
      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">{title}</h3>
      {badge && <div className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-black" style={{ background: `${color}15`, color, border: `1.5px solid ${color}25` }}>{badge}</div>}
    </div>
  );
}

function TC({ label, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all" style={{ borderColor: checked ? "#27AE60" : "#f1f5f9", background: checked ? "#f0fdf4" : "#fff", boxShadow: checked ? "0 2px 12px #27AE6015" : "none" }}>
      <span className={`text-[11px] font-black uppercase tracking-tight ${checked ? "text-[#15803d]" : "text-slate-400"}`}>{label}</span>
      <button type="button" onClick={onToggle} className="relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3" style={{ background: checked ? "#27AE60" : "#cbd5e1" }}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" style={{ left: checked ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </div>
  );
}

function TR({ label, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <button type="button" onClick={() => onToggle(!checked)} className="relative w-10 h-5 rounded-full transition-colors shrink-0" style={{ background: checked ? "#27AE60" : "#cbd5e1" }}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" style={{ left: checked ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </div>
  );
}

function Panel({ children }) {
  return <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">{children}</div>;
}

function FS({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#27AE60]/30 focus:bg-white outline-none transition-all appearance-none">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function FI({ label, type = "text", value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">{icon}{label}</label>
      <input type={type} value={value} placeholder={placeholder || "—"} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#27AE60]/30 focus:bg-white outline-none transition-all" />
    </div>
  );
}

function ParkingCounter({ label, icon, value, onUpdate }) {
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5"><span className="text-xl">{icon}</span><span className="text-xs font-black text-slate-600 uppercase tracking-tight">{label}</span></div>
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100">
        <button onClick={() => onUpdate(Math.max(0, value - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-500 transition-all"><Minus className="w-3.5 h-3.5" /></button>
        <span className="w-7 text-center font-black text-slate-800 text-sm tabular-nums">{value}</span>
        <button onClick={() => onUpdate(value + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:bg-[#27AE60]/10 hover:text-[#27AE60] transition-all"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}