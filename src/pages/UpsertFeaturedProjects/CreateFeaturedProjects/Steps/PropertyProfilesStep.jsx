// src/pages/post-property/featured-create/steps/PropertyProfilesStep.jsx

import { forwardRef, useImperativeHandle, useRef, useState,useEffect } from "react";
import { Building2, FileText, BadgeCheck, Globe, Map, Tag } from "lucide-react";
import { getUserSearch } from "../../../../features/user/userService";
import { saveImage, deleteImage } from "../utils/indexedDB";
import { compressPdfAdvanced } from "../utils/compressPdfAdvanced";
import { toast } from "sonner";

 

/* ─── Design tokens ─────────────────────────────────────────── */
const inp = (err) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
   outline-none placeholder:text-gray-400 transition-all duration-200
   ${
     err
       ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
       : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"
   }`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";
const ERR   = "text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1";

/* ─── Constants ─────────────────────────────────────────────── */
const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "PNB", "Kotak", "Yes Bank"];



const AREA_UNITS = [
  { value: "Acres",   label: "Acres"   },
  { value: "Sq.Yd",  label: "Sq. Yards" },
  { value: "Sq.ft",  label: "Sq. Feet" },
  { value: "Cents",  label: "Cents"   },
  { value: "Grounds", label: "Grounds" },
  { value: "Guntha",  label: "Guntha"  },
  { value: "Hectares", label: "Hectares" },
];

 

/* ─── SectionCard — defined OUTSIDE component to avoid remount ── */
const SectionCard = ({ icon: Icon, title, sub, children }) => (
  <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#f0fdf6,#dcfce7)", border: "2px solid #bbf7d0" }}
      >
        <Icon size={17} style={{ color: "#27AE60" }} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{sub}</p>
        <h3 className="text-sm font-black text-gray-900">{title}</h3>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Component ─────────────────────────────────────────────── */
const PropertyProfilesStep = forwardRef(({ payload, update }, ref) => {
  const [errors, setErrors] = useState({});
  const profileRef = useRef(null);
  const [builders, setBuilders] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const builderRef = useRef(null);

  const isLand = payload.categoryType === "land";


  const [selectedBuilderId, setSelectedBuilderId] = useState("");

  
    const HIDE_TOWER_TYPES = [
  "villa",
  "duplex",
  "triplex",
  "farmhouse",
];

const shouldHideTowerFields =
  payload.categoryType === "land" ||
  HIDE_TOWER_TYPES.includes(
    payload.propertyType?.trim().toLowerCase()
  );

  const isResidential = payload.categoryType === "residential";

  

  const [filters, setFilters] = useState({
    state: "",
    city: "",
    pincode: "",
    locality: "",
  });

  useEffect(() => {
    async function loadBuilders() {
      try {
        const res = await getUserSearch("builder");
        console.log("BUILDER API RESPONSE =>", res);
        setBuilders(res?.data?.results || []);
      } catch (err) {
        console.error("Failed to load builders", err);
        setBuilders([]);
      }
    }

    loadBuilders();
  }, []);

  useEffect(() => {
    // ✅ If no builders available
    // auto assign current user

    if (builders.length === 0 && payload?.me?._id && !payload.createdBy) {
      console.log("✅ No builders found → using /me");

      update({
        createdBy: payload.me._id,
      });

      clr("createdBy");
    }
  }, [builders, payload?.me?._id]);

  // Unique values from full builder list
  const uniqueStates = [
    ...new Set(builders.map((b) => b.state).filter(Boolean)),
  ];
  const uniqueCities = [
    ...new Set(
      builders
        .filter((b) => !filters.state || b.state === filters.state)
        .map((b) => b.city)
        .filter(Boolean),
    ),
  ];
  const uniquePincodes = [
    ...new Set(
      builders
        .filter(
          (b) =>
            (!filters.state || b.state === filters.state) &&
            (!filters.city || b.city === filters.city),
        )
        .map((b) => b.pincode)
        .filter(Boolean),
    ),
  ];
  const uniqueLocalities = [
    ...new Set(
      builders
        .filter(
          (b) =>
            (!filters.state || b.state === filters.state) &&
            (!filters.city || b.city === filters.city) &&
            (!filters.pincode || b.pincode === filters.pincode),
        )
        .map((b) => b.locality)
        .filter(Boolean),
    ),
  ];

  

  const filteredBuilders = builders.filter((b) => {
    const matchesState = !filters.state || b.state === filters.state;
    const matchesCity = !filters.city || b.city === filters.city;
    const matchesPincode = !filters.pincode || b.pincode === filters.pincode;
    const matchesLocality =
      !filters.locality || b.locality === filters.locality;
    const matchesSearch =
      !searchQuery.trim() ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery);
    return (
      matchesState &&
      matchesCity &&
      matchesPincode &&
      matchesLocality &&
      matchesSearch
    );
  });

  const addYoutube = () => {
    const list = payload.youtubeVideos || [];
    update({
      youtubeVideos: [...list, { title: "", url: "", order: list.length + 1 }],
    });
  };

  const updateYoutube = (index, key, value) => {
    const list = [...(payload.youtubeVideos || [])];
    list[index][key] = value;
    update({ youtubeVideos: list });
  };

  const removeYoutube = (index) => {
    const list = [...(payload.youtubeVideos || [])];
    list.splice(index, 1);
    update({ youtubeVideos: list });
   
  };

  
  useImperativeHandle(ref, () => ({
    validate() {
      console.log("========== VALIDATION START ==========");

      const e = {};

      console.log("payload =>", payload);

      // RERA
      if (!payload.reraNumber?.trim()) {
        e.reraNumber = "Required";
        console.log("❌ RERA missing");
      }

      // Builder
      console.log("createdBy =>", payload.createdBy);

    

    const hasBuilders = builders.length > 0;

    if (hasBuilders && !payload.createdBy) {
      e.createdBy = "Please select builder from dropdown";

      console.log("❌ Builder not selected");
    } else {
      console.log("createdBy =>", payload.createdBy);
      console.log("✅ Builder selected");
    }

      // Brochure
      if (!payload.brochure) {
        e.brochure = "Brochure PDF is required";
        console.log("❌ Brochure missing");
      }

      // Redirect URL
      if (payload.redirectUrl?.trim()) {
        try {
          new URL(payload.redirectUrl.trim());
          console.log("✅ URL valid");
        } catch (err) {
          e.redirectUrl = "Enter valid URL";
          console.log("❌ Invalid URL");
        }
      }

      

      console.log("FINAL ERRORS =>", e);

      setErrors(e);

      // Scroll to error section
      if (Object.keys(e).length > 0) {
        console.log("❌ Validation Failed");

        const scrollTarget = e.createdBy ? builderRef : profileRef;

        scrollTarget.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return false;
      }

      console.log("✅ Validation Success");

      return true;
    },

    isValid() {
      return this.validate();
    },
  }));
  
  
  /* ── Helpers ── */
  const clr = (key) =>
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key]; 
      return copy;
    });

  // const handleChange = (key, value) => {
  //   update({ [key]: value });
  //   clr(key);
  // };
  const handleChange = (key, value) => {
    update({ [key]: value });
    clr(key);
  };

  const toggleBank = (bank) => {
    const sel = payload.banksApproved || [];
    update({
      banksApproved: sel.includes(bank)
        ? sel.filter((b) => b !== bank)
        : [...sel, bank],
    });
    clr("banksApproved");
  };


  const removeBrochure = async () => {
    const key =
      typeof payload.brochure === "string"
        ? payload.brochure
        : payload.brochure?.key;

    if (key) {
      await deleteImage(key, "other");
    }

    update({ brochure: null });

    toast.success("Brochure removed successfully");
  };
  
  const getBrochureName = () => {
    if (payload.brochure?.file) return payload.brochure.file.name;

    if (typeof payload.brochure === "string") {
      return payload.brochure.split("__")[2]; // extract filename
    }

    return null;
  };

  /* ── Render ── */
  return (
    <div className="space-y-5" ref={profileRef}>
      {/* ── 1. Project Stats ── */}
      <SectionCard
        icon={Building2}
        title="Project Stats"
        sub="Structure & Units"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HIDE IN LAND */}
          {!shouldHideTowerFields && (
            <>
              {/* Total Towers */}
              <div>
                <label className={LABEL}>Total Towers *</label>

                <input
                  type="number"
                  min="1"
                  className={inp(errors.totalTowers)}
                  placeholder="8"
                  value={payload.totalTowers || ""}
                  onChange={(e) => handleChange("totalTowers", e.target.value)}
                />

                {errors.totalTowers && (
                  <p className={ERR}>⚠ {errors.totalTowers}</p>
                )}
              </div>

              {/* Total Floors */}
              <div>
                <label className={LABEL}>Total Floors *</label>

                <input
                  type="text"
                  className={inp(errors.totalFloors)}
                  placeholder="G+32"
                  value={payload.totalFloors || ""}
                  onChange={(e) => handleChange("totalFloors", e.target.value)}
                />

                {errors.totalFloors && (
                  <p className={ERR}>⚠ {errors.totalFloors}</p>
                )}
              </div>
            </>
          )}

          {/* Project Area + Unit — paired in one cell */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className={LABEL}>Project Area *</label>
            <div
              className="
                          flex items-center
                          border-2 border-gray-200
                          rounded-xl
                          overflow-hidden
                          bg-white
                          focus-within:border-[#27AE60]
                          focus-within:ring-4
                          focus-within:ring-[#27AE60]/10
                        "
            >
              {/* VALUE */}
              <input
                type="number"
                min="0"
                step="0.01"
                className="
                          flex-1
                          px-4 py-3
                          text-sm font-semibold
                          outline-none
                          bg-transparent
                        "
                placeholder="2"
                value={payload.projectArea || ""}
                onChange={(e) => handleChange("projectArea", e.target.value)}
              />

              {/* DIVIDER */}
              <div className="w-px self-stretch bg-gray-200" />

              {/* STATIC UNIT */}
              <div
                className="
                    px-4 py-3
                    text-sm font-black
                    text-gray-700
                    bg-gray-50
                    uppercase
                  "
              >
                Acre
              </div>
            </div>
            {/* Error messages for both fields */}
            {errors.projectArea && (
              <p className={ERR}>⚠ {errors.projectArea}</p>
            )}
            {errors.areaUnits && <p className={ERR}>⚠ {errors.areaUnits}</p>}
          </div>

          {/* Total Units */}
          <div>
            <label className={LABEL}>Total Units *</label>
            <input
              type="number"
              min="1"
              className={inp(errors.totalUnits)}
              placeholder="480"
              value={payload.totalUnits || ""}
              onChange={(e) => handleChange("totalUnits", e.target.value)}
            />
            {errors.totalUnits && <p className={ERR}>⚠ {errors.totalUnits}</p>}
          </div>

          {/* Available Units */}
          <div>
            <label className={LABEL}>Available Units *</label>
            <input
              type="number"
              min="0"
              className={inp(errors.availableUnits)}
              placeholder="120"
              value={payload.availableUnits || ""}
              onChange={(e) => handleChange("availableUnits", e.target.value)}
            />
            {errors.availableUnits && (
              <p className={ERR}>⚠ {errors.availableUnits}</p>
            )}
          </div>

          {/* Possession Date */}
          <div>
            <label className={LABEL}>Possession Date *</label>
            <input
              type="date"
              className={inp(errors.possessionDate)}
              value={payload.possessionDate || ""}
              onChange={(e) => handleChange("possessionDate", e.target.value)}
            />
            {errors.possessionDate && (
              <p className={ERR}>⚠ {errors.possessionDate}</p>
            )}
          </div>
          {/* RERA Number */}
          <div>
            <label className={LABEL}>RERA Number *</label>
            <input
              type="text"
              className={inp(errors.reraNumber)}
              placeholder="RERA/T/2024/000123"
              value={payload.reraNumber || ""}
              onChange={(e) => handleChange("reraNumber", e.target.value)}
            />
            {errors.reraNumber && <p className={ERR}>⚠ {errors.reraNumber}</p>}
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Banks Approved ── */}
      <SectionCard icon={BadgeCheck} title="Banks Approved" sub="Finance">
        {errors.banksApproved && (
          <p className={`${ERR} mb-4`}>⚠ {errors.banksApproved}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {BANKS.map((bank) => {
            const sel = payload.banksApproved?.includes(bank);
            return (
              <button
                key={bank}
                type="button"
                onClick={() => toggleBank(bank)}
                className="px-5 py-2.5 rounded-xl border-2 text-sm font-black transition-all duration-200 select-none"
                style={{
                  background: sel
                    ? "linear-gradient(135deg,#27AE60,#1e8449)"
                    : "white",
                  borderColor: sel ? "#27AE60" : "#e5e7eb",
                  color: sel ? "white" : "#374151",
                  boxShadow: sel ? "0 4px 12px rgba(39,174,96,0.3)" : "none",
                  transform: sel ? "translateY(-1px)" : "none",
                }}
              >
                {sel ? "✓ " : ""}
                {bank}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ── 3. Documents & Links ── */}
      <SectionCard icon={FileText} title="Files & Links" sub="Documents">
        <div className="space-y-5">
          {/* Brochure */}
          <div>
            <label className={LABEL}>Brochure (PDF) *</label>
            <label
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed
                cursor-pointer transition-all group
                ${
                  errors.brochure
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"
                }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                  ${errors.brochure ? "bg-red-100" : "bg-white shadow-sm group-hover:bg-[#27AE60]/10"}`}
              >
                <FileText
                  size={20}
                  className={`transition-colors ${errors.brochure ? "text-red-400" : "text-gray-400 group-hover:text-[#27AE60]"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${errors.brochure ? "text-red-600" : "text-gray-800"}`}
                >
                  {/* {payload.brochure
                    ? payload.brochure.name
                    : "Upload Brochure PDF"} */}
                  {getBrochureName() || "Upload Brochure PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PDF files only</p>
              </div>
              {payload.brochure && (
                <span
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                  style={{ background: "#27AE60" }}
                >
                  Uploaded ✓
                </span>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={async (e) => {
                  let file = e.target.files[0];
                  if (!file) return;

                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF allowed ❌");
                    return;
                  }

                  // 🔥 compress if >1MB
                  const MAX_SIZE = 3 * 1024 * 1024;
                  if (file.size > MAX_SIZE) {
                    toast.loading("Compressing PDF... ⏳");

                    const compressed = await compressPdfAdvanced(file);

                    toast.dismiss();

                    const sizeMB = (compressed.size / 1024 / 1024).toFixed(2);

                    if (compressed.size > MAX_SIZE) {
                      toast.error(
                        `Still ${sizeMB}MB. Please upload smaller PDF ❌`,
                      );
                      return;
                    }

                    toast.success(`Compressed ✅`);

                    file = compressed;
                  }

                  const key = await saveImage(file, "other", "brochure");

                  update({
                    brochure: { key, file },
                  });

                  clr("brochure");
                }}
              />
              {payload.brochure && (
                <button
                  type="button"
                  onClick={removeBrochure}
                  className="text-red-500 text-xs font-bold ml-2"
                >
                  Remove
                </button>
              )}
            </label>

            {errors.brochure && <p className={ERR}>⚠ {errors.brochure}</p>}
          </div>

          {/* Project Website URL */}
          <div>
            <label className={LABEL}>
              Project Website URL
              <span className="ml-1 text-gray-400 font-semibold normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Globe
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="url"
                className={`${inp(errors.redirectUrl)} pl-10`}
                placeholder="https://project-website.com"
                value={payload.redirectUrl || ""}
                onChange={(e) => handleChange("redirectUrl", e.target.value)}
              />
            </div>
            {errors.redirectUrl && (
              <p className={ERR}>⚠ {errors.redirectUrl}</p>
            )}
            {/* Live preview link when valid URL entered */}
            {payload.redirectUrl && !errors.redirectUrl && (
              <a
                href={payload.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold mt-1.5 hover:underline"
                style={{ color: "#27AE60" }}
              >
                <Globe size={11} /> Preview link ↗
              </a>
            )}
          </div>

          {/* Map Embed URL */}
          <div>
            <label className={LABEL}>
              Google Maps Embed URL
              <span className="ml-1 text-gray-400 font-semibold normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Map
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="url"
                className={`${inp(errors.mapEmbedUrl)} pl-10`}
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={payload.mapEmbedUrl || ""}
                onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
              />
            </div>
            {errors.mapEmbedUrl && (
              <p className={ERR}>⚠ {errors.mapEmbedUrl}</p>
            )}
            {/* Live map preview */}
            {payload.mapEmbedUrl &&
              payload.mapEmbedUrl.includes("google.com/maps") && (
                <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <iframe
                    src={payload.mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  />
                </div>
              )}
          </div>
        </div>
      </SectionCard>
      <SectionCard icon={Globe} title="YouTube Videos" sub="Video Showcase">
        <div className="space-y-4">
          {/* {errors.youtubeVideos && (
            <p className={ERR}>⚠ {errors.youtubeVideos}</p>
          )} */}
          {(payload.youtubeVideos || []).map((video, i) => (
            <div
              key={i}
              className="border-2 border-gray-200 rounded-xl p-4 space-y-3"
            >
              <div>
                <label className={LABEL}>Video Title</label>
                <input
                  type="text"
                  className={inp()}
                  placeholder="Property Overview"
                  value={video.title}
                  onChange={(e) => updateYoutube(i, "title", e.target.value)}
                />
                {/* {errors[`youtube_title_${i}`] && (
                  <p className={ERR}>⚠ {errors[`youtube_title_${i}`]}</p>
                )} */}
              </div>

              <div>
                <label className={LABEL}>YouTube URL *</label>
                <input
                  type="url"
                  className={inp()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={video.url}
                  onChange={(e) => updateYoutube(i, "url", e.target.value)}
                />
                {/* {errors[`youtube_url_${i}`] && (
                  <p className={ERR}>⚠ {errors[`youtube_url_${i}`]}</p>
                )} */}
              </div>

              <div>
                <label className={LABEL}>Order</label>
                <input
                  type="number"
                  className={inp()}
                  value={video.order}
                  onChange={(e) => updateYoutube(i, "order", e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeYoutube(i)}
                className="text-red-500 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addYoutube}
            className="px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-lg"
          >
            + Add YouTube Video
          </button>
        </div>
      </SectionCard>

      <div ref={builderRef}>
        <SectionCard icon={Building2} title="Select Builder" sub="Builder">
          {/* Search bar */}
          <div className="mb-4">
            <label className={LABEL}>Search Builder</label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className={`${inp()} pl-10`}
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Location filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div>
              <label className={LABEL}>State</label>
              <select
                className={inp()}
                value={filters.state}
                onChange={(e) => {
                  setFilters({
                    state: e.target.value,
                    city: "",
                    pincode: "",
                    locality: "",
                  });
                }}
              >
                <option value="">All States</option>
                {uniqueStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>City</label>
              <select
                className={inp()}
                value={filters.city}
                onChange={(e) => {
                  setFilters((f) => ({
                    ...f,
                    city: e.target.value,
                    pincode: "",
                    locality: "",
                  }));
                }}
              >
                <option value="">All Cities</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Pincode</label>
              <select
                className={inp()}
                value={filters.pincode}
                onChange={(e) => {
                  setFilters((f) => ({
                    ...f,
                    pincode: e.target.value,
                    locality: "",
                  }));
                }}
              >
                <option value="">All Pincodes</option>
                {uniquePincodes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Locality</label>
              <select
                className={inp()}
                value={filters.locality}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, locality: e.target.value }));
                }}
              >
                <option value="">All Localities</option>
                {uniqueLocalities.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips + clear all */}
          {(searchQuery ||
            filters.state ||
            filters.city ||
            filters.pincode ||
            filters.locality) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {searchQuery && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                  "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.state && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                  {filters.state}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({
                        state: "",
                        city: "",
                        pincode: "",
                        locality: "",
                      });
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.city && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                  {filters.city}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((f) => ({
                        ...f,
                        city: "",
                        pincode: "",
                        locality: "",
                      }));
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.pincode && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                  {filters.pincode}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((f) => ({ ...f, pincode: "", locality: "" }));
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.locality && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                  {filters.locality}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((f) => ({ ...f, locality: "" }));
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    state: "",
                    city: "",
                    pincode: "",
                    locality: "",
                  });
                  setSearchQuery("");
                }}
                className="text-xs text-red-400 font-bold hover:text-red-600 ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Final builder dropdown */}
          <div>
            <label className={LABEL}>Select Builder *</label>
            <select
              className={inp(errors.createdBy)}
              value={payload.createdBy || ""}
              // onChange={(e) => {
              //   console.log("SELECTED BUILDER =>", e.target.value);

              //   handleChange("createdBy", e.target.value);
              // }}

              onChange={(e) => {
                const value = e.target.value;

                console.log("SELECTED BUILDER =>", value);

                setSelectedBuilderId(value);

                handleChange("createdBy", value);
              }}
            >
              <option value="">
                {filteredBuilders.length === 0
                  ? "No builders found"
                  : "Select Builder"}
              </option>
              {filteredBuilders.map((builder) => (
                <option key={builder._id} value={builder._id}>
                  {builder.name.charAt(0).toUpperCase() + builder.name.slice(1)}{" "}
                  — {builder.city}, {builder.state}
                </option>
              ))}
            </select>
            {errors.createdBy && <p className={ERR}>⚠ {errors.createdBy}</p>}
            {filteredBuilders.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {filteredBuilders.length} builder(s) found
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
});

export default PropertyProfilesStep;