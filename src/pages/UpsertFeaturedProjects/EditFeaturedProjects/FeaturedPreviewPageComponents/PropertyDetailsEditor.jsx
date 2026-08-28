// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/PropertyDetailsEditor.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { toTitleCase } from "../../../../utils/countryStateCity";
import { fetchLoggedInUser } from "../../../../services/UserServices/userServices";
import { fetchSearchableLocationsService } from "../../../../services/LocationsServices/LocationServices";
import { fetchListingLocationOptions } from "../../../../services/PostAPropertyService";
import SearchableSelect from "../../../../components/common/location/SearchableSelect";
import {
  CITY_OTHER,
  titleCase,
  getStateSuggestions,
  getCitySuggestions,
  getSavedCityNamesForState,
  getSavedLocalitySuggestions,
  isKnownCityName,
  unwrapLocationList,
  mergeSavedLocationSources,
  locationsFromFeaturedOptions,
  searchLocalitiesWithPhoton,
  normalizeComparisonValue,
  canAddCustomLocation,
  canEditFeaturedCategory,
} from "../../../../components/common/location/searchableLocationUtils";

const MAX_BROCHURE_BYTES = 20 * 1024 * 1024; // 20 MB — no compression

/* ─── PINCODE AUTOFILL ───── */

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment", icon: "🏗" },
    { label: "Villa", value: "villa", icon: "🏰" },
    { label: "Duplex", value: "duplex", icon: "🏘" },
    { label: "Triplex", value: "triplex", icon: "🏚" },
    { label: "Farmhouse", value: "farmhouse", icon: "🌿" },
  ],

  land: [
    { label: "Plot", value: "plot", icon: "📌" },
    { label: "Residential Plot", value: "residential-plot", icon: "🏠" },
    { label: "Industrial Plot", value: "industrial-plot", icon: "🏭" },
    { label: "Agricultural Plot", value: "agricultural-plot", icon: "🌾" },
    { label: "Commercial Plot", value: "commercial-plot", icon: "🏢" },
  ],
};

/** Edit: only Residential + Land (Commercial / Agricultural stay hidden) */
const CATEGORY_TYPES = [
  {
    value: "residential",
    label: "Residential",
    icon: "🏠",
    desc: "Apartments, villas & homes",
  },
  {
    value: "land",
    label: "Land",
    icon: "🌍",
    desc: "Plots & open land",
  },
];

/** Category / type editor + custom city/locality — Super Admin & BDH only */

/** Same as create PropertyProfilesStep — hide towers for these */
const HIDE_TOWER_TYPES = ["villa", "duplex", "triplex", "farmhouse"];

/** Fields that no longer apply when category/type changes (same idea as post flow) */
function categoryChangePatch(nextCategory, prevLocal = {}) {
  const patch = {
    categoryType: nextCategory,
    propertyType: "",
  };
  if (nextCategory === "land") {
    patch.totalTowers = "";
    patch.totalFloors = "";
  }
  // Keep existing values for shared fields (title, location, rera, etc.)
  return { ...prevLocal, ...patch };
}

function propertyTypeChangePatch(nextType, prevLocal = {}) {
  const patch = { propertyType: nextType };
  const lower = String(nextType || "").toLowerCase();
  if (
    prevLocal.categoryType === "land" ||
    HIDE_TOWER_TYPES.includes(lower)
  ) {
    patch.totalTowers = "";
    patch.totalFloors = "";
  }
  return { ...prevLocal, ...patch };
}

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
  const [preferOtherCity, setPreferOtherCity] = useState(false);
  const [canEditCategory, setCanEditCategory] = useState(false);
  const [canAddCustomCity, setCanAddCustomCity] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);

  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [localityLoading, setLocalityLoading] = useState(false);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const localityDropdownRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchLoggedInUser()
      .then((user) => {
        if (cancelled) return;
        const role = user?.roleName || user?.role?.name;
        setCanEditCategory(canEditFeaturedCategory(role));
        setCanAddCustomCity(canAddCustomLocation(role));
      })
      .catch(() => {
        if (!cancelled) {
          setCanEditCategory(false);
          setCanAddCustomCity(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchSearchableLocationsService().catch(() => null),
      fetchListingLocationOptions().catch(() => null),
    ]).then(([locRes, featuredRes]) => {
      if (cancelled) return;
      setSavedLocations(
        mergeSavedLocationSources(
          unwrapLocationList(locRes),
          locationsFromFeaturedOptions(featuredRes),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      currency: formData.currency ?? "INR",
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
      brochureUrl: formData?.brochure?.url ?? "",
    });
  }, [formData]);

  const savedCitiesForState = useMemo(
    () => getSavedCityNamesForState(savedLocations, local.state),
    [savedLocations, local.state],
  );

  const citySuggestionExtras = useMemo(() => {
    const current = titleCase(String(local.city || "").trim());
    if (!current || !local.state) return savedCitiesForState;
    if (isKnownCityName(local.state, current, savedCitiesForState)) {
      return savedCitiesForState;
    }
    return [...savedCitiesForState, current];
  }, [savedCitiesForState, local.city, local.state]);

  const cityInKnownList = useMemo(() => {
    const city = String(local.city || "").trim();
    const state = String(local.state || "").trim();
    if (!city || !state) return true;
    return isKnownCityName(state, city, savedCitiesForState);
  }, [local.city, local.state, savedCitiesForState]);

  const showManualCityField =
    canAddCustomCity && (preferOtherCity || !cityInKnownList);

  useEffect(() => {
    if (canAddCustomCity && !cityInKnownList && String(local.city || "").trim()) {
      setPreferOtherCity(true);
    }
  }, [cityInKnownList, local.city, canAddCustomCity]);

  useEffect(() => {
    if (!stateOpen) {
      setStateSuggestions([]);
      return;
    }
    const tid = setTimeout(() => {
      setStateLoading(true);
      setStateSuggestions(getStateSuggestions(stateSearch));
      setStateLoading(false);
    }, 250);
    return () => clearTimeout(tid);
  }, [stateOpen, stateSearch]);

  useEffect(() => {
    if (!cityOpen) {
      setCitySuggestions([]);
      return;
    }
    const query = citySearch.trim();
    const tid = setTimeout(() => {
      if (!local.state) {
        setCitySuggestions([]);
        return;
      }
      setCityLoading(true);
      setCitySuggestions(
        getCitySuggestions(local.state, query || undefined, {
          includeOther: canAddCustomCity,
          savedCities: citySuggestionExtras,
        }),
      );
      setCityLoading(false);
    }, 200);
    return () => clearTimeout(tid);
  }, [cityOpen, citySearch, local.state, citySuggestionExtras, canAddCustomCity]);

  useEffect(() => {
    if (!localityOpen) {
      setLocalitySuggestions([]);
      return;
    }
    const trimmed = localitySearch.trim();
    if (!local.city) {
      setLocalitySuggestions([]);
      return;
    }

    const saved = getSavedLocalitySuggestions(
      savedLocations,
      local.state,
      local.city,
      trimmed,
    );

    if (trimmed.length < 2) {
      const current = titleCase(String(local.locality || "").trim());
      const list = [...saved];
      if (
        current &&
        !list.some(
          (r) =>
            normalizeComparisonValue(r.label) ===
            normalizeComparisonValue(current),
        )
      ) {
        list.unshift({
          label: current,
          city: local.city,
          state: local.state,
          isSaved: true,
        });
      }
      setLocalitySuggestions(list);
      return;
    }

    const ctrl = new AbortController();
    const tid = setTimeout(async () => {
      setLocalityLoading(true);
      const results = await searchLocalitiesWithPhoton(
        trimmed,
        ctrl.signal,
        local.state || undefined,
        local.city || undefined,
        trimmed,
      );
      const seen = new Set(saved.map((s) => normalizeComparisonValue(s.label)));
      const merged = [...saved];
      for (const r of results) {
        const key = normalizeComparisonValue(r.label);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(r);
      }
      if (
        canAddCustomCity &&
        !merged.some(
          (r) =>
            normalizeComparisonValue(r.label) ===
            normalizeComparisonValue(trimmed),
        )
      ) {
        merged.push({
          label: titleCase(trimmed),
          isCustom: true,
          city: local.city,
          state: local.state,
        });
      }
      setLocalitySuggestions(merged);
      setLocalityLoading(false);
    }, 350);
    return () => {
      ctrl.abort();
      clearTimeout(tid);
    };
  }, [
    localityOpen,
    localitySearch,
    local.city,
    local.state,
    local.locality,
    savedLocations,
    canAddCustomCity,
  ]);

  if (!formData) return null;

  // Use local so category/type edits update the editor UI immediately (same as post)
  const isLand = local?.categoryType === "land";
  const propertyType = String(local?.propertyType || "").toLowerCase();
  const showTowerFields =
    !isLand &&
    Boolean(propertyType) &&
    !HIDE_TOWER_TYPES.includes(propertyType);

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

  function handleCategoryChange(val) {
    const lower = String(val || "").toLowerCase();
    if (!lower) return;
    const next = categoryChangePatch(lower, local);
    const patch = {
      categoryType: next.categoryType,
      propertyType: next.propertyType,
      totalTowers: next.totalTowers,
      totalFloors: next.totalFloors,
    };
    setLocal(next);
    setFormData((prev) => ({ ...prev, ...patch }));
    setLivePreviewData((prev) => ({ ...prev, ...patch }));
  }

  function handlePropertyTypeChange(val) {
    const next = propertyTypeChangePatch(val, local);
    const patch = {
      propertyType: next.propertyType,
      totalTowers: next.totalTowers,
      totalFloors: next.totalFloors,
    };
    setLocal(next);
    setFormData((prev) => ({ ...prev, ...patch }));
    setLivePreviewData((prev) => ({ ...prev, ...patch }));
  }

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
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      toast.error("Only PDF or image files are allowed");
      input.value = "";
      return;
    }

    const sizeMb = file.size / 1024 / 1024;
    if (file.size > MAX_BROCHURE_BYTES) {
      toast.error(
        `Brochure must be 20 MB or less. Your file is ${sizeMb.toFixed(2)} MB.`,
      );
      input.value = "";
      return;
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

    toast.success(`Brochure ready (${sizeMb.toFixed(2)} MB)`);
  }

  

  function handleSave() {
    if (canEditCategory) {
      if (!String(local.categoryType || "").trim()) {
        toast.error("Please select a project category");
        return;
      }
      if (!String(local.propertyType || "").trim()) {
        toast.error("Please select a property type");
        return;
      }
    }

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
        {canEditCategory && (
          <div>
            <SectionLabel icon="🏷" label="Project Category & Property Type" />

            <div className="mt-3 grid grid-cols-2 gap-2">
              {CATEGORY_TYPES.map((cat) => {
                const active = local.categoryType === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={[
                      "relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition select-none",
                      active
                        ? "border-[#27AE60] bg-[#f0fdf6] shadow-sm"
                        : "border-gray-100 bg-white hover:border-[#27AE60]/40",
                    ].join(" ")}
                  >
                    <span className="text-lg leading-none">{cat.icon}</span>
                    <span
                      className={[
                        "text-xs font-black",
                        active ? "text-[#1a7a42]" : "text-gray-700",
                      ].join(" ")}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[9px] font-medium text-gray-400 leading-snug">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {local.categoryType && propertyOptions.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Property Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {propertyOptions.map((opt) => {
                    const selected = local.propertyType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handlePropertyTypeChange(opt.value)}
                        className={[
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-[11px] font-bold transition select-none",
                          selected
                            ? "border-[#27AE60] bg-[#27AE60] text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#27AE60]/50",
                        ].join(" ")}
                      >
                        <span>{opt.icon}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Location Details ── */}

        <div>
          <SectionLabel icon="📍" label="Location Details" />

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
            <FieldGroup label="Currency">
              <select
                className={inputCls}
                value={local.currency || "INR"}
                onChange={(e) => change("currency", e.target.value)}
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Pincode">
              <input
                className={inputCls}
                value={local.pincode ?? ""}
                onChange={(e) =>
                  change(
                    "pincode",
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-3">
            <SearchableSelect
              warning
              label="State"
              value={local.state || ""}
              placeholder="Select state"
              open={stateOpen}
              onToggle={() => {
                setStateOpen((o) => !o);
                setCityOpen(false);
                setLocalityOpen(false);
                if (!stateOpen) setStateSearch("");
              }}
              onClose={() => setStateOpen(false)}
              searchValue={stateSearch}
              onSearchChange={setStateSearch}
              searchPlaceholder="Search state..."
              loading={stateLoading}
              options={stateSuggestions}
              onSelect={(opt) => {
                setPreferOtherCity(false);
                sync({ state: opt.label, city: "", locality: "" });
                setStateOpen(false);
              }}
              emptyHint={
                stateSearch.trim().length >= 2
                  ? "No state found"
                  : "Type to search Indian states"
              }
              dropdownRef={stateDropdownRef}
              optionKey={(opt) => opt.isoCode || opt.label}
            />

            <div className="space-y-3">
              <SearchableSelect
                warning
                label="City"
                value={
                  canAddCustomCity && preferOtherCity && !local.city
                    ? "Other (custom city)"
                    : local.city || ""
                }
                placeholder={
                  local.state ? "Select city" : "Select state first"
                }
                disabled={!local.state}
                open={cityOpen}
                onToggle={() => {
                  if (!local.state) return;
                  setCityOpen((o) => !o);
                  setStateOpen(false);
                  setLocalityOpen(false);
                  if (!cityOpen) setCitySearch("");
                }}
                onClose={() => setCityOpen(false)}
                searchValue={citySearch}
                onSearchChange={setCitySearch}
                searchPlaceholder="Search city…"
                loading={cityLoading}
                options={citySuggestions}
                onSelect={(opt) => {
                  if (opt.isOther || opt.value === CITY_OTHER) {
                    setPreferOtherCity(true);
                    sync({ city: "", locality: "" });
                  } else {
                    setPreferOtherCity(false);
                    sync({ city: opt.label, locality: "" });
                  }
                  setCityOpen(false);
                }}
                emptyHint={
                  citySearch.trim().length >= 2
                    ? "No city found"
                    : local.state
                      ? "Suggested cities for selected state"
                      : "Select state first"
                }
                dropdownRef={cityDropdownRef}
                optionKey={(opt, idx) =>
                  `${opt.value || opt.label}-${opt.isSaved ? "saved" : "pkg"}-${opt.stateCode || idx}`
                }
                renderOption={(opt) => (
                  <span className="min-w-0 flex-1 truncate">
                    {opt.label}
                    {opt.isSaved ? (
                      <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                        (saved)
                      </span>
                    ) : null}
                  </span>
                )}
              />

              {showManualCityField && (
                <FieldGroup label="Custom city" warning>
                  <input
                    className={inputCls}
                    value={local.city ?? ""}
                    onChange={(e) => {
                      setPreferOtherCity(true);
                      change("city", e.target.value);
                    }}
                    onBlur={(e) =>
                      change("city", toTitleCase(e.target.value))
                    }
                    placeholder="Type or edit city / mandal name"
                  />
                </FieldGroup>
              )}
            </div>

            <SearchableSelect
              warning
              label="Locality"
              value={local.locality || ""}
              placeholder={
                local.city ? "Search locality..." : "Select city first"
              }
              disabled={!local.city}
              open={localityOpen}
              onToggle={() => {
                if (!local.city) return;
                setLocalityOpen((o) => !o);
                setStateOpen(false);
                setCityOpen(false);
                if (!localityOpen) {
                  setLocalitySearch("");
                  setLocalitySuggestions([]);
                }
              }}
              onClose={() => setLocalityOpen(false)}
              searchValue={localitySearch}
              onSearchChange={setLocalitySearch}
              searchPlaceholder="Search locality..."
              loading={localityLoading}
              options={localitySuggestions}
              onSelect={(opt) => {
                sync({ locality: opt.label });
                setLocalityOpen(false);
              }}
              emptyHint={
                !local.city
                  ? "Select city first"
                  : localitySearch.trim().length >= 2
                    ? canAddCustomCity
                      ? "No locality found — keep typing to use a custom name"
                      : "No locality found — pick a saved or suggested locality"
                    : "Saved localities for this city, or type to search"
              }
              dropdownRef={localityDropdownRef}
              optionKey={(opt, idx) =>
                `${opt.label}-${opt.isSaved ? "s" : "p"}-${idx}`
              }
              renderOption={(opt) => (
                <span className="min-w-0 flex-1 truncate">
                  {opt.label}
                  {opt.isSaved ? (
                    <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                      (saved)
                    </span>
                  ) : null}
                  {opt.isCustom ? (
                    <span className="ml-1 text-[10px] text-gray-400">
                      (use typed)
                    </span>
                  ) : null}
                </span>
              )}
            />
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
          <SectionLabel icon="📋" label="Legal & Compliance" />
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
          <SectionLabel icon="🔗" label="Documents & Links" />
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
                        PDF, PNG, JPG · max 20 MB (no compression)
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
          ⚠ PIN is manual (6 digits).
          <br />
          Edit State / City / Locality below.
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
