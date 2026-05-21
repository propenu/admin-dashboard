// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/PropertyDetailsEditor.jsx

import React, { useState, useEffect, useRef } from "react";
import { compressPdfAdvanced } from "../../CreateFeaturedProjects/utils/compressPdfAdvanced";
import { compressImage } from "./imageCompressor";
import { toast } from "sonner";

/* ─── PINCODE AUTOFILL ───── */

async function geocodePincode(pincode, signal) {

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${pincode}` +
    `&country=India` +
    `&format=json` +
    `&addressdetails=1` +
    `&limit=1`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error("Pincode fetch failed");
  }

  const data = await res.json();

  if (!Array.isArray(data) || !data.length) {
    return null;
  }

  const a = data[0].address || {};

  return {

    locality: (
      a.suburb ||
      a.neighbourhood ||
      a.village ||
      a.town ||
      ""
    )
      .replace(/^Ward\s*\d+\s*/i, "")
      .trim(),

    city:
      a.city ||
      a.town ||
      a.village ||
      "",

    state:
      a.state || "",
  };
}

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment" },
    { label: "Villa", value: "villa" },
    { label: "Duplex", value: "duplex" },
    { label: "Triplex", value: "triplex" },
    { label: "Farmhouse", value: "farmhouse" },
  ],

  land: [
    { label: "Plot", value: "plot" },
    { label: "Residential Plot", value: "residential-plot" },
    { label: "Industrial Plot", value: "industrial-plot" },
    { label: "Agricultural Plot", value: "agricultural-plot" },
    { label: "Commercial Plot", value: "commercial-plot" },
  ],
};

export default function PropertyDetailsEditor({
  formData,
  setFormData,
  setLivePreviewData,
  saving,
  onSave,
}) {


  const [local, setLocal] = useState({});
  const [newBank, setNewBank] = useState("");
  const [newVideo, setNewVideo] = useState({ title: "", url: "", order: "" });
  const [brochureFile, setBrochureFile] = useState(null);

  const pincodeAbortRef = useRef(null);

  useEffect(() => {
    setLocal({
      totalTowers: formData.totalTowers ?? "",
      totalFloors: formData.totalFloors ?? "",
      projectArea: formData.projectArea ?? "",
      totalUnits: formData.totalUnits ?? "",
      availableUnits: formData.availableUnits ?? "",
      possessionDate: formData.possessionDate ?? "",
      reraNumber: formData.reraNumber ?? "",
      redirectUrl: formData.redirectUrl ?? "",
      propertyType: formData.propertyType ?? "",
      categoryType: formData.categoryType ?? "",
      title: formData.title ?? "",
      address: formData.address ?? "",
      pincode: formData.pincode ?? "",
      state: formData.state ?? "",
      city: formData.city ?? "",
      locality: formData.locality ?? "",
      banksApproved: Array.isArray(formData.banksApproved)
        ? formData.banksApproved
        : [],
      youtubeVideos: Array.isArray(formData.youtubeVideos)
        ? formData.youtubeVideos
        : [],
      //brochureUrl: formData.brochureUrl ?? "",
      brochureUrl: formData?.brochure?.url ?? "",
    });
  }, [formData]);

  if (!formData) return null;

  const isLand = formData?.categoryType === "land";

  const propertyType = formData?.propertyType?.toLowerCase?.() || "";

  const showTowerFields =
    !isLand &&
    ["villa", "duplex", "triplex", "farmhouse"].includes(propertyType);

    const propertyOptions = PROPERTY_TYPES[local.categoryType] || [];

  function sync(patch) {
    const updated = { ...local, ...patch };
    setLocal(updated);
    setFormData((prev) => ({ ...prev, ...patch }));
    setLivePreviewData((prev) => ({ ...prev, ...patch }));
  }

  function change(field, value) {
    sync({ [field]: value });
  }

  /* ─── PINCODE AUTOFILL ───── */

  useEffect(() => {
    const pin = (local?.pincode || "").replace(/\D/g, "");

    if (pin.length !== 6) {
      return;
    }

    pincodeAbortRef.current?.abort();

    const ctrl = new AbortController();

    pincodeAbortRef.current = ctrl;

    const timer = setTimeout(async () => {
      try {
        const geo = await geocodePincode(pin, ctrl.signal);

        if (!geo) return;

        sync({
          state: geo.state,
          city: geo.city,
          locality: geo.locality,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    }, 500);

    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [local?.pincode]);

  /* ── Banks ── */
  function addBank() {
    const trimmed = newBank.trim();
    if (!trimmed) return;
    if (local.banksApproved.includes(trimmed)) {
      setNewBank("");
      return;
    }
    const updated = [...local.banksApproved, trimmed];
    sync({ banksApproved: updated });
    setNewBank("");
  }

  function removeBank(bank) {
    sync({ banksApproved: local.banksApproved.filter((b) => b !== bank) });
  }

  /* ── YouTube videos ── */
  function getYoutubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
      /youtube\.com\/shorts\/([^?&]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function addVideo() {
    if (!newVideo.url.trim() || !getYoutubeId(newVideo.url)) return;
    const entry = {
      title: newVideo.title.trim() || `Video ${local.youtubeVideos.length + 1}`,
      url: newVideo.url.trim(),
      order: newVideo.order
        ? Number(newVideo.order)
        : local.youtubeVideos.length + 1,
    };
    const updated = [...local.youtubeVideos, entry];
    sync({ youtubeVideos: updated });
    setNewVideo({ title: "", url: "", order: "" });
  }

  function removeVideo(index) {
    const updated = local.youtubeVideos
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, order: i + 1 }));
    sync({ youtubeVideos: updated });
  }

  /* ── Brochure ── */
  // function handleBrochure(e) {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setBrochureFile(file);
  //   //setFormData((prev) => ({ ...prev, brochureFile: file }));
  //   setFormData((prev) => ({
  //     ...prev,
  //     brochure: {
  //       file: file,
  //       filename: file.name,
  //     },
  //   }));
    
  //   setLivePreviewData((prev) => ({
  //     ...prev,
  //     brochureUrl: URL.createObjectURL(file),
  //     brochure: {
  //       filename: file.name,
  //     },
  //   }));
  // }

  async function handleBrochure(e) {
    let file = e.target.files?.[0];

    if (!file) return;

    console.log(
      "📦 ORIGINAL FILE:",
      file.name,
      (file.size / 1024 / 1024).toFixed(2),
      "MB",
    );

    try {
      // ✅ PDF Compression
      if (file.type === "application/pdf") {
        toast.loading("Compressing PDF... ⏳");

        file = await compressPdfAdvanced(file);

        toast.dismiss();

        console.log(
          "✅ COMPRESSED PDF:",
          (file.size / 1024 / 1024).toFixed(2),
          "MB",
        );
      }

      // ✅ Image Compression
      else if (file.type.startsWith("image/")) {
        file = await compressImage(file, "gallery", "Brochure Image");

        console.log(
          "✅ COMPRESSED IMAGE:",
          (file.size / 1024 / 1024).toFixed(2),
          "MB",
        );
      }

      setBrochureFile(file);

      setFormData((prev) => ({
        ...prev,
        brochure: {
          file,
          filename: file.name,
        },
      }));

      setLivePreviewData((prev) => ({
        ...prev,
        brochureUrl: URL.createObjectURL(file),
        brochure: {
          filename: file.name,
        },
      }));

      toast.success("Brochure optimized successfully ✅");
    } catch (err) {
      console.error("❌ Brochure compression failed:", err);

      toast.error("Compression failed ❌");
    }
  }

  

  function handleSave() {
    const payload = {
      ...local,
      ...(formData.brochure && { brochure: formData.brochure }),
    };

    delete payload.pincode;

    onSave(payload);
  }

  const isValidYoutube = getYoutubeId(newVideo.url);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      style={{ maxHeight: "90vh" }}
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              {isLand ? "Plot Details Editor" : "Property Details Editor"}
            </h3>
            <p className="text-[10px] text-gray-400">
              {isLand
                ? "Plot stats, approvals & documents"
                : "Project stats, documents & videos"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 min-h-0">
        {/* ── Location Details ── */}

        <div>
          <SectionLabel icon="📍" label="Location Details" />

          {/* <div className="grid grid-cols-2 gap-3 mb-2">
            <FieldGroup label="Category Type">
              <select
                className={inputCls}
                value={local.categoryType ?? ""}
                onChange={(e) => {
                  sync({
                    categoryType: e.target.value,
                    propertyType: "",
                  });
                }}
              >
                <option value="">Select Category</option>

                <option value="residential">Residential</option>

                <option value="land">Land</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Project Type">
              <select
                className={inputCls}
                value={local.propertyType ?? ""}
                onChange={(e) => change("propertyType", e.target.value)}
                disabled={!local.categoryType}
              >
                <option value="">Select Project Type</option>

                {propertyOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div> */}

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Project Name">
              <input
                className={`${inputCls} capitalize`}
                value={local.title ?? ""}
                onChange={(e) => change("title", e.target.value)}
                placeholder="Project Name"
              />
            </FieldGroup>
            <FieldGroup label="Address">
              <input
                className={`${inputCls} capitalize`}
                value={local.address ?? ""}

                onChange={(e) => change("address", e.target.value)}
                placeholder="Address"
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <FieldGroup label="Pincode">
              <input
                className={inputCls}
                value={local.pincode ?? ""}
                onChange={(e) => change("pincode", e.target.value)}
                placeholder="500084"
              />
            </FieldGroup>

            <FieldGroup label="State" warning>
              <input
                className={inputCls}
                value={local.state ?? ""}
                onChange={(e) => change("state", e.target.value)}
                placeholder="Telangana"
              />
            </FieldGroup>

            <FieldGroup label="City" warning>
              <input
                className={inputCls}
                value={local.city ?? ""}
                onChange={(e) => change("city", e.target.value)}
                placeholder="Hyderabad"
              />
            </FieldGroup>

            <FieldGroup label="Locality" warning>
              <input
                className={inputCls}
                value={local.locality ?? ""}
                onChange={(e) => change("locality", e.target.value)}
                placeholder="Kondapur"
              />
            </FieldGroup>
          </div>
        </div>
        {/* ── Project Stats ── */}
        <div>
          <SectionLabel
            icon={isLand ? "🌍" : "📊"}
            label={isLand ? "Plot Details" : "Project Stats"}
          />

          <div className="grid grid-cols-2 gap-3 mt-3">
            {showTowerFields && (
              <>
                <FieldGroup label="Total Towers">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g. 4"
                    value={local.totalTowers ?? ""}
                    onChange={(e) => change("totalTowers", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Total Floors">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g. 32"
                    value={local.totalFloors ?? ""}
                    onChange={(e) => change("totalFloors", e.target.value)}
                  />
                </FieldGroup>
              </>
            )}
            <FieldGroup label={isLand ? "Layout Area" : "Project Area"}>
              <input
                className={inputCls}
                placeholder="e.g. 5 Acres"
                value={local.projectArea ?? ""}
                onChange={(e) => change("projectArea", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label={isLand ? "Total Plots" : "Total Units"}>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 480"
                value={local.totalUnits ?? ""}
                onChange={(e) => change("totalUnits", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label={isLand ? "Available Plots" : "Available Units"}>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 120"
                value={local.availableUnits ?? ""}
                onChange={(e) => change("availableUnits", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup
              label={isLand ? "Development Completion" : "Possession Date"}
            >
              <input
                className={inputCls}
                placeholder="e.g. Dec 2026"
                value={local.possessionDate ?? ""}
                onChange={(e) => change("possessionDate", e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>

        {/* ── Legal & Compliance ── */}
        <div>
          <SectionLabel icon="📋" label="Legal &amp; Compliance" />
          <div className="mt-3 space-y-3">
            <FieldGroup label="RERA Number" hint="Leave blank to hide badge">
              <input
                className={`${inputCls} font-mono`}
                placeholder="e.g. P52100XXXXXX"
                value={local.reraNumber ?? ""}
                onChange={(e) => change("reraNumber", e.target.value)}
              />
            </FieldGroup>

            {/* Banks Approved */}
            <FieldGroup label="Banks Approved">
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="e.g. HDFC, SBI…"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addBank();
                  }}
                />
                <button
                  type="button"
                  onClick={addBank}
                  disabled={!newBank.trim()}
                  className="px-3 py-2 bg-[#27AE60] text-white text-xs font-bold rounded-xl hover:bg-[#219150] transition disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              {local.banksApproved?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {local.banksApproved.map((bank) => (
                    <span
                      key={bank}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                      style={{
                        backgroundColor: "#27AE6012",
                        borderColor: "#27AE6030",
                        color: "#1a7a42",
                      }}
                    >
                      {bank}
                      <button
                        type="button"
                        onClick={() => removeBank(bank)}
                        className="ml-0.5 text-gray-400 hover:text-red-500 transition leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </FieldGroup>
          </div>
        </div>

        {/* ── Documents & Links ── */}
        <div>
          <SectionLabel icon="🔗" label="Documents &amp; Links" />
          <div className="mt-3 space-y-3">
            <FieldGroup
              label={isLand ? "Layout Website URL" : "Project Website URL"}
            >
              <input
                className={inputCls}
                placeholder="https://projectname.com"
                value={local.redirectUrl ?? ""}
                onChange={(e) => change("redirectUrl", e.target.value)}
              />
            </FieldGroup>

            {/* Brochure upload */}
            <FieldGroup label={isLand ? "Layout Brochure" : "Project Brochure"}>
              <label className="block cursor-pointer">
                <div
                  className={[
                    "flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed transition group",
                    local.brochureUrl || brochureFile
                      ? "border-[#27AE60]/30 bg-[#27AE60]/5"
                      : "border-gray-200 hover:border-[#27AE60] bg-gray-50/50",
                  ].join(" ")}
                >
                  {local.brochureUrl || brochureFile ? (
                    <div className="flex flex-col items-center gap-1">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[11px] font-bold text-[#27AE60]">
                        {brochureFile
                          ? brochureFile.name
                          : formData?.brochure?.filename || "Brochure uploaded"}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        Click to replace
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {isLand ? "Upload Layout Brochure" : "Upload Brochure"}
                      </span>
                      <span className="text-[9px] text-gray-300">
                        PDF, PNG, JPG
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={handleBrochure}
                />
              </label>
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* ── Save footer ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
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
              {isLand ? "Save Plot Details" : "Save Property Details"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function WarningTooltip() {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    function handleClickOutside() {
      setOpen(false);
    }

    if (open) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative flex-shrink-0">
      {/* Warning Icon */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="
          w-3 h-3
          rounded-full

          bg-amber-100
          text-amber-600

          text-[8px]
          font-bold

          flex items-center justify-center

          cursor-pointer

          hover:bg-amber-200
          transition
        "
      >
        !
      </button>

      {/* Tooltip */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            absolute top-4 left-8
            -translate-x-1/2

            w-32

            px-2 py-1

            rounded-md

            bg-gray-900
            text-white

            text-[7px]
            leading-3

            shadow-lg
            z-50
          "
        >
          ⚠ Use correct spelling.
          <br />
          Use pincode autofill.
        </div>
      )}
    </div>
  );
}
/* ── Helpers ── */
const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50";

function FieldGroup({ label, hint, children, warning }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </label>

        {warning && <WarningTooltip />}

        
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </span>
      
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
