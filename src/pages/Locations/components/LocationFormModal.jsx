// frontend/admin-dashboard/src/pages/Locations/components/LocationFormModal.jsx
import { motion } from "framer-motion";
import { X, AlertCircle, ShieldAlert } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  state: "",
  city: "",
  category: "city",
  isHome: false,
  localityName: "",
  lat: "",
  lng: "",
};

function formatPermissionError(error) {
  if (!error) return null;
  if (typeof error === "string") return { message: error, allowedRoles: [], howToGetAccess: "" };

  return {
    message: error.message || error.error || "Operation failed",
    allowedRoles: Array.isArray(error.allowedRoles) ? error.allowedRoles : [],
    howToGetAccess: error.howToGetAccess || "",
    requiredPermission: error.requiredPermission || "",
    yourRoleLabel: error.yourRoleLabel || error.yourRole || "",
  };
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
    if (show) {
      if (initialData) {
        const isAddLocalityMode = title === "Add Locality to City";

        setForm({
          state: initialData.state || "",
          city: initialData.city || "",
          category: initialData.category || "city",
          isHome: initialData.isHome === true,

          // Empty when adding new locality
          localityName: isAddLocalityMode
            ? ""
            : initialData.localities?.[0]?.name || "",

          lat: isAddLocalityMode
            ? ""
            : initialData.localities?.[0]?.location?.coordinates?.[1] || "",

          lng: isAddLocalityMode
            ? ""
            : initialData.localities?.[0]?.location?.coordinates?.[0] || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [initialData, show, title]);

  // SUCCESS HANDLER WITH DEBUGGING
  useEffect(() => {
    if (success && show && !toastProcessedRef.current) {
      toastProcessedRef.current = true; // Lock immediately

      toast.success(success, { id: "unique-location-toast" });

      onClose();
      clearSuccess?.();
    }
  }, [success, show, onClose, clearSuccess]);

  const handleClose = () => {
    clearSuccess?.();
    onClose();
  };

  const isFormInvalid = !form.state || !form.city || !form.localityName;
  const toTitleCase = (v) =>
    v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-[#27AE60]">{title}</h2>
          <button onClick={handleClose}>
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
              setForm({ ...form, state: e.target.value, city: "" })
            }
            className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            disabled={!form.state}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full p-3 border border-[#27AE60] rounded-xl outline-none disabled:opacity-50"
          >
            <option value="">Select City</option>
            {getCities(form.state).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Locality Name"
            value={form.localityName}
            onChange={(e) =>
              setForm({ ...form, localityName: toTitleCase(e.target.value) })
            }
            className="w-full p-3 border border-[#27AE60] rounded-xl outline-none"
          />

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
            <button
              type="button"
              title={
                form.isHome
                  ? "Home ON — shows on propenu.com. Click to hide."
                  : "Home OFF — hidden on propenu.com. Click to show."
              }
              onClick={() => setForm({ ...form, isHome: !form.isHome })}
              className={`flex-1 py-2 rounded-xl border font-medium ${
                form.isHome
                  ? "bg-[#27AE60] text-white border-[#27AE60]"
                  : "bg-red-500 text-white border-red-500"
              }`}
            >
              Home
            </button>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            City / Popular = list section.{" "}
            <span className="font-semibold text-[#27AE60]">Home green</span> =
            active on website;{" "}
            <span className="font-semibold text-red-500">Home red</span> =
            hidden.
          </p>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 border rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={loading || isFormInvalid}
            onClick={() => onSubmit(form)}
            className="flex-1 bg-[#27AE60] text-white rounded-xl disabled:opacity-60 font-bold"
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
