// frontend/admin-dashboard/src/pages/Locations/components/LocationFormModal.jsx
import { motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  state: "",
  city: "",
  category: "city",
  localityName: "",
  lat: "",
  lng: "",
};

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

  

  useEffect(() => {
    if (show) {
      toastProcessedRef.current = false;
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setForm({
          state: initialData.state || "",
          city: initialData.city || "",
          category: initialData.category || "city",
          localityName: initialData.localities?.[0]?.name || "",
          lat: initialData.localities?.[0]?.location?.coordinates?.[1] || "",
          lng: initialData.localities?.[0]?.location?.coordinates?.[0] || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [initialData, show]);

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
          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded-xl text-sm flex gap-2 items-center">
              <AlertCircle size={18} /> {error}
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
                className={`flex-1 py-2 rounded-xl border ${
                  form.category === cat
                    ? "bg-[#27AE60] text-white border-[#27AE60]"
                    : "border-gray-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
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

