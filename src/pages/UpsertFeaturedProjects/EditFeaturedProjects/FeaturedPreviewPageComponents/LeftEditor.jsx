// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/LeftEditor.jsx
import { useState, useEffect } from "react";
import { compressImage } from "./imageCompressor";
import { getUserSearch } from "../../../../features/user/userService";

const getUserId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id || value.userId || "";
  return value;
};

export default function LeftEditor({ formData, setFormData, setLivePreviewData, onSave, saving }) {
   

  const [local, setLocal] = useState({});
  const [relationshipManagers, setRelationshipManagers] = useState([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [managersLoading, setManagersLoading] = useState(true);
  const [managersError, setManagersError] = useState("");

  

  useEffect(() => {
    setLocal(formData || {});
  }, [formData]);

  useEffect(() => {
    let active = true;

    async function loadRelationshipManagers() {
      try {
        const response = await getUserSearch("relationship_manager");
        if (active) setRelationshipManagers(response?.data?.results || []);
      } catch (error) {
        console.error("Failed to load relationship managers", error);
        if (active) setManagersError("Unable to load relationship managers");
      } finally {
        if (active) setManagersLoading(false);
      }
    }

    loadRelationshipManagers();
    return () => {
      active = false;
    };
  }, []);
  
  if (!formData) return null;

  function changeLocal(name, value) {
    console.log("🔥 changeLocal()");
    console.log("FIELD:", name);
    console.log("VALUE:", value);
    console.log("IS FILE:", value instanceof File);
    const updated = { ...local, [name]: value };
    setLocal(updated);
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLivePreviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSaveClick() {
    console.log("🚀 SAVE CLICK");

    console.log("LOCAL HERO:", local.heroImage);
    console.log("LOCAL HERO IS FILE:", local.heroImage instanceof File);

    console.log("FORM HERO:", formData.heroImage);
    console.log("FORM HERO IS FILE:", formData.heroImage instanceof File);
    onSave({ ...formData, ...local });
  }

  const formatToCr = (v) => (v ? `₹${(v / 10000000).toFixed(2)} Cr` : "");

  const selectedManagerId = String(getUserId(local.relationshipManagerId));
  const normalizedSearch = managerSearch.trim().toLowerCase();
  const filteredRelationshipManagers = relationshipManagers.filter((manager) => {
    if (!normalizedSearch) return true;
    return [manager.name, manager.email, manager.phone, manager.city, manager.state]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });
  const currentManager =
    local.relationshipManagerId && typeof local.relationshipManagerId === "object"
      ? local.relationshipManagerId
      : null;
  const managerOptions = currentManager &&
    !filteredRelationshipManagers.some((manager) => String(manager._id) === selectedManagerId)
      ? [currentManager, ...filteredRelationshipManagers]
      : filteredRelationshipManagers;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Hero Editor</h3>
            <p className="text-[10px] text-gray-400">
              Live preview updates instantly
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
        {/* Tagline */}
        <FieldGroup label="Tagline" hint="Bold colored tagline">
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
            value={local.heroTagline ?? ""}
            onChange={(e) => changeLocal("heroTagline", e.target.value)}
            placeholder="e.g. Where Dreams Come Home"
          />
        </FieldGroup>

        {/* Sub Tagline */}
        <FieldGroup label="Sub Tagline" hint="Appears below the hero image">
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
            value={local.heroSubTagline ?? ""}
            onChange={(e) => changeLocal("heroSubTagline", e.target.value)}
            placeholder="e.g. Luxury Living Redefined"
          />
        </FieldGroup>

        {/* Description */}
        <FieldGroup label="Description" hint="Bold colored tagline">
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
            value={local.heroDescription ?? ""}
            onChange={(e) => changeLocal("heroDescription", e.target.value)}
            placeholder="e.g. Where Dreams Come Home"
          />
        </FieldGroup>

        {/* File Uploads */}
        <div className="grid grid-cols-2 gap-3">
          {/* <FileUploadBox
            label="Hero Image"
            preview={typeof local.heroImage === "string" ? local.heroImage : local.heroImage?.url}
            onChange={(file) => changeLocal("heroImage", file)}
          />
          <FileUploadBox
            label="Logo"
            preview={typeof local.logo === "string" ? local.logo : local.logo?.url}
            onChange={(file) => changeLocal("logo", file)}
          /> */}
          <FileUploadBox
            label="Hero Image"
            preview={
              typeof local.heroImage === "string"
                ? local.heroImage
                : local.heroImage?.url
            }
            onChange={async (file) => {
              if (!file) return;

              // ✅ Compress Hero Image
              const compressedHero = await compressImage(
                file,
                "hero",
                "Hero Image",
              );

              console.log("✅ COMPRESSED HERO:", compressedHero);
              console.log("✅ IS FILE:", compressedHero instanceof File);
              console.log("✅ HERO SIZE:", compressedHero.size);

              changeLocal("heroImage", compressedHero);
            }}
          />

          <FileUploadBox
            label="Logo"
            preview={
              typeof local.logo === "string" ? local.logo : local.logo?.url
            }
            onChange={async (file) => {
              if (!file) return;

              // ✅ Compress Logo
              const compressedLogo = await compressImage(file, "logo", "Logo");

              changeLocal("logo", compressedLogo);
            }}
          />
        </div>

        {/* Color Picker */}
        <FieldGroup label="Theme Color">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <input
                type="color"
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                value={local.color ?? "#27AE60"}
                onChange={(e) => changeLocal("color", e.target.value)}
              />
            </div>
            <input
              type="text"
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
              value={local.color ?? "#27AE60"}
              onChange={(e) => changeLocal("color", e.target.value)}
            />
          </div>
        </FieldGroup>

        {/* Price Range */}
        {/* <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Price From" hint={formatToCr(local.priceFrom)}>
            <input
              type="number"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
              value={local.priceFrom ?? ""}
              onChange={(e) => changeLocal("priceFrom", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="e.g. 5000000"
            />
          </FieldGroup>
          <FieldGroup label="Price To" hint={formatToCr(local.priceTo)}>
            <input
              type="number"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
              value={local.priceTo ?? ""}
              onChange={(e) => changeLocal("priceTo", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="e.g. 12000000"
            />
          </FieldGroup>
        </div> */}

        {/* RERA */}
        <FieldGroup label="RERA Number" hint="Leave empty to hide RERA badge">
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
            value={local.reraNumber ?? ""}
            onChange={(e) => changeLocal("reraNumber", e.target.value)}
            placeholder="e.g. P52100XXXXXX"
          />
        </FieldGroup>

        <div className="rounded-xl border border-[#27AE60]/20 bg-[#27AE60]/5 p-3 space-y-3">
          <FieldGroup label="Relationship Manager" hint="Assigned to this project">
            <input
              type="search"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white"
              value={managerSearch}
              onChange={(e) => setManagerSearch(e.target.value)}
              placeholder="Search by name, email or phone"
            />
          </FieldGroup>
          <select
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white"
            value={selectedManagerId}
            onChange={(e) => changeLocal("relationshipManagerId", e.target.value)}
            disabled={managersLoading}
          >
            <option value="">
              {managersLoading ? "Loading relationship managers..." : "Select Relationship Manager"}
            </option>
            {managerOptions.map((manager) => (
              <option key={getUserId(manager)} value={getUserId(manager)}>
                {manager.name || manager.email || "Relationship Manager"}
                {[manager.locality, manager.city, manager.state].filter(Boolean).length
                  ? ` - ${[manager.locality, manager.city, manager.state].filter(Boolean).join(", ")}`
                  : ""}
              </option>
            ))}
          </select>
          {managersError && <p className="text-xs font-medium text-red-500">{managersError}</p>}
          {!managersLoading && !managersError && managerOptions.length === 0 && (
            <p className="text-xs text-gray-500">No relationship managers match this search.</p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
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
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function FieldGroup({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-[10px] text-[#27AE60] font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function FileUploadBox({ label, preview, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </label>
      <label className="block cursor-pointer">
        <div className="relative h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#27AE60] overflow-hidden transition group bg-gray-50/50">
          {preview ? (
            <>
              {/* <img src={preview} alt={label} className="w-full h-full object-cover" /> */}
              <img
                src={
                  preview instanceof File
                    ? URL.createObjectURL(preview)
                    : preview
                }
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  Replace
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-[10px] text-gray-400">Upload</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files[0])}
        />
      </label>
    </div>
  );
}
