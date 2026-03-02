// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/steps/StepLocationDetails.jsx
import { useEffect, useState } from "react";
import { search } from "india-pincode-search";
import OpenStreetPinMap from "../components/location/OpenStreetPinMap";
import NearbyPlacesInput from "../components/location/NearbyPlacesInput";

/**
 * Step 2 – Location Details
 * Integrated with Auto-Save PATCH flow
 */
export default function StepLocationDetails({ data, onChange, onSave }) {
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'success', 'error', null

  if (!data) return null;

  /**
   * ✅ Helper to handle field updates
   * Passes field, value, and step name ('location') to EditWizard
   */
  const handleUpdate = (field, value) => {
    onChange(field, value, "location");
  };

  /* -------------------------------------------------------
      AUTO GEO-CODE WHEN LOCATION FIELDS CHANGE
  ------------------------------------------------------- */
  useEffect(() => {
    if (!data.locality || !data.city || !data.state) return;

    const controller = new AbortController();

    const fetchCoordinates = async () => {
      try {
        const query = `${data.locality}, ${data.city}, ${data.state}`;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&limit=1`,
          {
            signal: controller.signal,
            headers: { "Accept-Language": "en" },
          },
        );

        const geo = await res.json();
        if (!geo || geo.length === 0) return;

        // Auto-update coordinates in the background
        handleUpdate("location", {
          type: "Point",
          coordinates: [Number(geo[0].lon), Number(geo[0].lat)],
        });
      } catch (e) {
        if (e.name !== "AbortError") console.error("Geocode error", e);
      }
    };

    fetchCoordinates();
    return () => controller.abort();
  }, [data.locality, data.city, data.state]);

  /* -------------------------------------------------------
      PINCODE → AUTO FILL CITY / STATE / LOCALITY
  ------------------------------------------------------- */
  const handlePincodeChange = (value) => {
    const numeric = value.replace(/\D/g, "");

    // Update pincode immediately
    handleUpdate("pincode", numeric);

    if (numeric.length !== 6) {
      setPincodeStatus(null);
      return;
    }

    try {
      const result = search(numeric);

      if (!result || result.length === 0) {
        setPincodeStatus("error");
        return;
      }

      const pin = result[0];

      // Update multiple fields simultaneously
      if (pin.state) handleUpdate("state", toTitleCase(pin.state));
      if (pin.city || pin.district)
        handleUpdate("city", toTitleCase(pin.city || pin.district));
      if (pin.village || pin.office || pin.taluk) {
        handleUpdate(
          "locality",
          toTitleCase(pin.village || pin.office || pin.taluk),
        );
      }

      setPincodeStatus("success");
    } catch (error) {
      console.error("Error searching pincode:", error);
      setPincodeStatus("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          📍
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
          <p className="text-gray-500 text-sm">Address and landmarks</p>
        </div>
        <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
          Step 2 of 4
        </div>
      </div>

      {/* Property Address Section */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase">
          <span>🏠 Property Address</span>
        </div>

        {/* Street Address */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Street Address / House No.
          </label>
          <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <input
              type="text"
              value={data.address || ""}
              onChange={(e) => handleUpdate("address", e.target.value)}
              placeholder="e.g., Plot No. 123, Sector 4, Main Road"
              className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Building Name and Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Building / Society Name
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                value={data.buildingName || ""}
                onChange={(e) => handleUpdate("buildingName", e.target.value)}
                placeholder="e.g., Green Valley Apartments"
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Pincode
            </label>
            <div
              className={`bg-white border rounded-xl p-4 transition-all focus-within:ring-2 ${
                pincodeStatus === "success"
                  ? "border-green-500 ring-green-200"
                  : pincodeStatus === "error"
                    ? "border-red-500 ring-red-200"
                    : "border-gray-200 focus-within:ring-blue-500"
              }`}
            >
              <input
                type="text"
                value={data.pincode || ""}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="6 Digit Pincode"
                maxLength={6}
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Locality, City, State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Locality
            </label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                value={data.locality || ""}
                onChange={(e) => handleUpdate("locality", e.target.value)}
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">City</label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                value={data.city || ""}
                onChange={(e) => handleUpdate("city", e.target.value)}
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">State</label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                value={data.state || ""}
                onChange={(e) => handleUpdate("state", e.target.value)}
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h3 className="text-lg font-bold text-gray-900">
              Pin Exact Location
            </h3>
          </div>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Required
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner h-[350px]">
          <OpenStreetPinMap
            value={data.location}
            onChange={(coords) =>
              handleUpdate("location", {
                type: "Point",
                coordinates: coords,
              })
            }
          />
        </div>
        <p className="text-xs text-gray-500 italic">
          Tip: Drag the marker exactly to your property's gate.
        </p>
      </div>

      {/* Landmarks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <h3 className="text-lg font-bold text-gray-900">Nearby Landmarks</h3>
        </div>
        <NearbyPlacesInput
          value={data.nearbyPlaces || []}
          onChange={(places) => handleUpdate("nearbyPlaces", places)}
        />
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-[#27AE60] hover:bg-[#219150] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-100 transition-all transform active:scale-95"
        >
          <span>💾</span>
          Save Location Details
        </button>
      </div>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function toTitleCase(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
