// frontend/admin-dashboard/src/pages/Locations/components/LocationFormModal.jsx
import { motion } from "framer-motion";
import { X, AlertCircle, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";

const CITY_OTHER = "__other__";

const EMPTY_FORM = {
  state: "",
  citySelect: "",
  customCity: "",
  category: "city",
  isHome: false,
  localityIsHome: false,
  localityName: "",
  originalLocalityName: "",
  lat: "",
  lng: "",
};

function formatPermissionError(error) {
  if (!error) return null;
  if (typeof error === "string") {
    return { message: error, allowedRoles: [], howToGetAccess: "" };
  }

  return {
    message: error.message || error.error || "Operation failed",
    allowedRoles: Array.isArray(error.allowedRoles) ? error.allowedRoles : [],
    howToGetAccess: error.howToGetAccess || "",
    requiredPermission: error.requiredPermission || "",
    yourRoleLabel: error.yourRoleLabel || error.yourRole || "",
  };
}

function normalizeName(value = "") {
  return String(value).trim().toLowerCase();
}

function findPackageCityName(packageCities, cityName) {
  const key = normalizeName(cityName);
  if (!key) return "";
  const match = packageCities.find((c) => normalizeName(c.name) === key);
  return match?.name || "";
}

export default function LocationFormModal({
  show,
  title,
  initialData,
  states,
  getCities,
  onSubmit,
  onClose,
  loading,
  error,
  success,
  clearSuccess,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const toastProcessedRef = useRef(false);
  const permissionError = formatPermissionError(error);

  useEffect(() => {
    if (show) {
      toastProcessedRef.current = false;
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    if (!initialData) {
      setForm(EMPTY_FORM);
      return;
    }

    const isAddLocalityMode = title === "Add Locality to City";
    const stateName = initialData.state || "";
    const savedCity = String(initialData.city || "").trim();
    const packageCities = typeof getCities === "function" ? getCities(stateName) : [];
    const packageMatch = findPackageCityName(packageCities, savedCity);

    let citySelect = "";
    let customCity = "";

    if (packageMatch) {
      citySelect = packageMatch;
      customCity = "";
    } else if (savedCity) {
      citySelect = CITY_OTHER;
      customCity = savedCity;
    }

    const firstLocality = initialData.localities?.[0];
    const localityName = isAddLocalityMode
      ? ""
      : firstLocality?.name || "";

    setForm({
      state: stateName,
      citySelect,
      customCity,
      category: initialData.category || "city",
      isHome: initialData.isHome === true,
      localityIsHome: isAddLocalityMode
        ? false
        : firstLocality?.isHome === true,
      localityName,
      // Track original so rename/update works on save
      originalLocalityName: isAddLocalityMode ? "" : localityName,
      lat: isAddLocalityMode
        ? ""
        : firstLocality?.location?.coordinates?.[1] ?? "",
      lng: isAddLocalityMode
        ? ""
        : firstLocality?.location?.coordinates?.[0] ?? "",
    });
  }, [initialData, show, title, getCities]);

  useEffect(() => {
    if (success && show && !toastProcessedRef.current) {
      toastProcessedRef.current = true;
      toast.success(success, { id: "unique-location-toast" });
      onClose();
      clearSuccess?.();
    }
  }, [success, show, onClose, clearSuccess]);

  const handleClose = () => {
    clearSuccess?.();
    onClose();
  };

  const packageCities = useMemo(() => {
    if (!form.state || typeof getCities !== "function") return [];
    return getCities(form.state) || [];
  }, [form.state, getCities]);

  const cityOptions = useMemo(() => {
    const options = packageCities.map((c) => ({
      name: c.name,
      label: c.name,
      custom: false,
    }));

    // Keep last known custom name injectable if user switches away from Other briefly
    const customName = String(form.customCity || "").trim();
    const selectVal = String(form.citySelect || "").trim();
    const injectName =
      selectVal &&
      selectVal !== CITY_OTHER &&
      !findPackageCityName(packageCities, selectVal)
        ? selectVal
        : customName &&
            form.citySelect === CITY_OTHER &&
            !findPackageCityName(packageCities, customName)
          ? "" // Other mode — name lives in text field
          : "";

    if (injectName) {
      options.unshift({
        name: injectName,
        label: `${injectName} (custom)`,
        custom: true,
      });
    }

    return options;
  }, [packageCities, form.citySelect, form.customCity]);

  const stateOptions = useMemo(() => {
    const list = Array.isArray(states) ? [...states] : [];
    const savedState = String(form.state || "").trim();
    if (
      savedState &&
      !list.some(
        (s) =>
          normalizeName(s.name) === normalizeName(savedState) ||
          normalizeName(s.isoCode) === normalizeName(savedState),
      )
    ) {
      list.unshift({
        isoCode: `custom-${savedState}`,
        name: savedState,
      });
    }
    return list;
  }, [states, form.state]);

  const isOtherCity = form.citySelect === CITY_OTHER;
  const isCustomSelected =
    Boolean(form.citySelect) &&
    form.citySelect !== CITY_OTHER &&
    !findPackageCityName(packageCities, form.citySelect);

  // Show manual city input for Other OR selected custom (out-of-list) city
  const showManualCityField = isOtherCity || isCustomSelected;

  const effectiveCity = isOtherCity
    ? String(form.customCity || "").trim()
    : isCustomSelected
      ? String(form.customCity || form.citySelect || "").trim()
      : String(form.citySelect || "").trim();

  const isEditLocation = title === "Edit Location";
  const isAddLocalityMode = title === "Add Locality to City";
  const editLocalities = Array.isArray(initialData?.localities)
    ? initialData.localities
    : [];
  // Edit city/home can save without locality; add flows still need locality
  const localityRequired = !isEditLocation;
  const isFormInvalid =
    !form.state ||
    !effectiveCity ||
    (localityRequired && !String(form.localityName || "").trim());

  const toTitleCase = (v) =>
    String(v)
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const selectLocalityForEdit = (name) => {
    const loc = editLocalities.find(
      (l) => normalizeName(l.name) === normalizeName(name),
    );
    if (!loc) {
      setForm((prev) => ({
        ...prev,
        originalLocalityName: "",
        localityName: "",
        localityIsHome: false,
        lat: "",
        lng: "",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      originalLocalityName: loc.name || "",
      localityName: loc.name || "",
      localityIsHome: loc.isHome === true,
      lat: loc.location?.coordinates?.[1] ?? "",
      lng: loc.location?.coordinates?.[0] ?? "",
    }));
  };

  const handleSubmit = () => {
    if (isFormInvalid || loading) return;
    onSubmit({
      ...form,
      city: effectiveCity,
      state: String(form.state || "").trim(),
      localityName: String(form.localityName || "").trim(),
      originalLocalityName: String(form.originalLocalityName || "").trim(),
      _editWithoutLocality:
        isEditLocation && !String(form.localityName || "").trim(),
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#27AE60]">{title}</h2>
          <button type="button" onClick={handleClose}>
            <X className="text-[#27AE60]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {permissionError?.message && (
            <div className="text-red-700 bg-red-50 p-3 rounded-xl text-sm space-y-2 border border-red-100">
              <div className="flex gap-2 items-start">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle size={14} /> Access denied
                  </p>
                  <p>{permissionError.message}</p>
                  {permissionError.yourRoleLabel && (
                    <p className="text-xs text-red-600">
                      Your role: <strong>{permissionError.yourRoleLabel}</strong>
                      {permissionError.requiredPermission
                        ? ` · Needs: ${permissionError.requiredPermission}`
                        : ""}
                    </p>
                  )}
                  {permissionError.allowedRoles?.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-red-800 mb-1">
                        Roles that can create / manage locations:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {permissionError.allowedRoles.map((role) => (
                          <span
                            key={role.name || role.label}
                            className="px-2 py-0.5 rounded-full bg-white border border-red-200 text-xs font-medium text-red-700"
                          >
                            {role.label || role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {permissionError.howToGetAccess && (
                    <p className="text-xs text-red-600 pt-1">
                      {permissionError.howToGetAccess}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <select
            value={form.state}
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value,
                citySelect: "",
                customCity: "",
              })
            }
            className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
          >
            <option value="">Select State</option>
            {stateOptions.map((s) => (
              <option key={s.isoCode || s.name} value={s.name}>
                {s.name}
                {String(s.isoCode || "").startsWith("custom-")
                  ? " (custom)"
                  : ""}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <select
              disabled={!form.state}
              value={form.citySelect}
              onChange={(e) => {
                const next = e.target.value;
                if (next === CITY_OTHER) {
                  setForm({
                    ...form,
                    citySelect: CITY_OTHER,
                    customCity: form.customCity || "",
                  });
                  return;
                }
                const pkg = findPackageCityName(packageCities, next);
                if (pkg) {
                  setForm({
                    ...form,
                    citySelect: pkg,
                    customCity: "",
                  });
                  return;
                }
                // Custom option from list
                setForm({
                  ...form,
                  citySelect: CITY_OTHER,
                  customCity: next,
                });
              }}
              className="w-full p-3 border border-[#27AE60] rounded-xl outline-none disabled:opacity-50"
            >
              <option value="">Select City</option>
              {cityOptions.map((c) => (
                <option
                  key={`${c.custom ? "custom" : "pkg"}-${c.name}`}
                  value={c.name}
                >
                  {c.label}
                </option>
              ))}
              <option value={CITY_OTHER}>Other (custom city)</option>
            </select>

            {showManualCityField && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Custom city name (editable)
                </label>
                <input
                  placeholder="Type or edit city / mandal name"
                  value={form.customCity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      citySelect: CITY_OTHER,
                      customCity: toTitleCase(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
                />
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              Pick an India list city, or use{" "}
              <span className="font-semibold">Other</span> / custom to type any
              name. Out-of-list cities open with an editable name field.
            </p>
          </div>

          <div className="space-y-2">
            {isEditLocation && editLocalities.length > 1 ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Select locality to edit
                </label>
                <select
                  value={form.originalLocalityName || ""}
                  onChange={(e) => selectLocalityForEdit(e.target.value)}
                  className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
                >
                  <option value="">— Choose locality —</option>
                  {editLocalities.map((loc, idx) => (
                    <option key={`${loc.name}-${idx}`} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                {isAddLocalityMode
                  ? "New locality name"
                  : isEditLocation
                    ? "Locality name (editable)"
                    : "Locality name"}
              </label>
              <input
                placeholder={
                  isAddLocalityMode
                    ? "New locality name"
                    : isEditLocation
                      ? "Edit locality name, or leave blank to only update city/Home"
                      : "Locality Name"
                }
                value={form.localityName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    localityName: toTitleCase(e.target.value),
                  })
                }
                className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
              />
              {isEditLocation ? (
                <p className="text-[11px] text-gray-500">
                  Change the name or lat/lng, then Save — locality will update.
                  Clear the name to update only city / Home / category.
                </p>
              ) : null}
            </div>
          </div>

          {/* City Home + Locality Home — one row */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                title={
                  form.isHome
                    ? "City Home Active — click to hide city"
                    : "City Home Hidden — click to activate city"
                }
                onClick={() => setForm({ ...form, isHome: !form.isHome })}
                className={`py-2.5 rounded-xl border text-sm font-semibold ${
                  form.isHome
                    ? "bg-[#27AE60] text-white border-[#27AE60]"
                    : "bg-red-500 text-white border-red-500"
                }`}
              >
                City Home {form.isHome ? "· Active" : "· Hidden"}
              </button>
              <button
                type="button"
                title={
                  form.localityIsHome
                    ? "Locality Home Active — click to hide locality"
                    : "Locality Home Hidden — click to activate locality"
                }
                onClick={() =>
                  setForm({
                    ...form,
                    localityIsHome: !form.localityIsHome,
                  })
                }
                className={`py-2.5 rounded-xl border text-sm font-semibold ${
                  form.localityIsHome
                    ? "bg-[#27AE60] text-white border-[#27AE60]"
                    : "bg-red-500 text-white border-red-500"
                }`}
              >
                Locality Home {form.localityIsHome ? "· Active" : "· Hidden"}
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              One row · separate controls.{" "}
              <span className="font-semibold text-[#27AE60]">Green = Active</span>
              {" · "}
              <span className="font-semibold text-red-500">Red = Hidden</span>
              . City and locality Home do not overwrite each other.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Latitude"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="p-3 border border-[#27AE60] rounded-xl outline-none"
            />
            <input
              placeholder="Longitude"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="p-3 border border-[#27AE60] rounded-xl outline-none"
            />
          </div>

          <div className="flex gap-2">
            {["city", "popular"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`flex-1 py-2 rounded-xl border font-medium ${
                  form.category === cat
                    ? "bg-[#27AE60] text-white border-[#27AE60]"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            City / Popular = list section only. Home Active / Hidden is set above
            next to City and Locality.
          </p>
        </div>

        <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 border rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || isFormInvalid}
            onClick={handleSubmit}
            className="flex-1 bg-[#27AE60] text-white rounded-xl disabled:opacity-60 font-bold"
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
