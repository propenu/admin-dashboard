// frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/steps/StepPropertyDetails.jsx
import AmenitiesInput from "../components/editable/AmenitiesInput";
import GalleryUpload from "../components/editable/GalleryUpload";

import {
  FLOORING_TYPES,
  KITCHEN_TYPES,
  PARKING_TYPES,
  PROPERTY_STATUS_TYPES,
} from "../components/editable/residentialEnums";

/**
 * Step 3 – Property Details
 * Integrated with Auto-Save PATCH flow
 */
export default function StepPropertyDetails({ data, onChange, onSave }) {
  if (!data) return null;

  /**
   * ✅ Helper to handle field updates
   * Passes field, value, and step name ('propertyDetails')
   */
  const handleUpdate = (field, value) => {
    onChange(field, value, "propertyDetails");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-purple-600">
          📄
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
          <p className="text-gray-500 text-sm">
            Features, amenities, and media
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
          Step 3 of 4
        </div>
      </div>

      {/* Property Images */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h3 className="text-lg font-bold text-gray-900">Property Images</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              💡 5+ images get 3x views
            </span>
            <span className="text-xs font-semibold text-blue-700">
              {(data.gallery?.length || 0) + (data.galleryFiles?.length || 0)} /
              10
            </span>
          </div>
        </div>

        <GalleryUpload
          existing={data.gallery || []}
          files={data.galleryFiles || []}
          onChange={(files) => handleUpdate("galleryFiles", files)}
          onRemoveExisting={(key) =>
            handleUpdate(
              "gallery",
              data.gallery.filter((img) => img.key !== key),
            )
          }
        />
      </div>

      {/* Amenities & Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-bold text-gray-900">
            Amenities & Features
          </h3>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
            {data.amenities?.length || 0} Selected
          </span>
        </div>

        <AmenitiesInput
          value={data.amenities || []}
          onChange={(amenities) => handleUpdate("amenities", amenities)}
        />
      </div>

      {/* Parking Details */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm uppercase">
          <span>🚗 Parking Details</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PARKING_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleUpdate("parkingType", type.value)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  data.parkingType === type.value
                    ? "border-amber-500 bg-white shadow-md shadow-amber-100 scale-105 z-10"
                    : "border-transparent bg-white/50 hover:bg-white hover:border-amber-200"
                }`}
              >
                <span className="text-2xl">{type.icon || "🅿️"}</span>
                <span
                  className={`text-xs font-bold ${data.parkingType === type.value ? "text-amber-700" : "text-gray-500"}`}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Two Wheeler Counter */}
            <div className="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏍️</span>
                <span className="text-sm font-bold text-gray-700">
                  Two Wheeler
                </span>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() =>
                    handleUpdate("parkingDetails", {
                      ...data.parkingDetails,
                      twoWheeler: Math.max(
                        0,
                        (data.parkingDetails?.twoWheeler || 0) - 1,
                      ),
                    })
                  }
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-gray-900">
                  {data.parkingDetails?.twoWheeler || 0}
                </span>
                <button
                  onClick={() =>
                    handleUpdate("parkingDetails", {
                      ...data.parkingDetails,
                      twoWheeler: (data.parkingDetails?.twoWheeler || 0) + 1,
                    })
                  }
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Four Wheeler Counter */}
            <div className="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">🚙</span>
                <span className="text-sm font-bold text-gray-700">
                  Four Wheeler
                </span>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() =>
                    handleUpdate("parkingDetails", {
                      ...data.parkingDetails,
                      fourWheeler: Math.max(
                        0,
                        (data.parkingDetails?.fourWheeler || 0) - 1,
                      ),
                    })
                  }
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-gray-900">
                  {data.parkingDetails?.fourWheeler || 0}
                </span>
                <button
                  onClick={() =>
                    handleUpdate("parkingDetails", {
                      ...data.parkingDetails,
                      fourWheeler: (data.parkingDetails?.fourWheeler || 0) + 1,
                    })
                  }
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor & Kitchen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Floor Details */}
        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-green-700 uppercase flex items-center gap-2">
            <span>🏢</span> Floor Details
          </h3>
          <div className="space-y-4">
            <select
              value={data.flooringType || ""}
              onChange={(e) => handleUpdate("flooringType", e.target.value)}
              className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            >
              <option value="">Select Flooring</option>
              {FLOORING_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={data.floorNumber || ""}
                onChange={(e) =>
                  handleUpdate("floorNumber", parseInt(e.target.value) || 0)
                }
                placeholder="Floor No."
                className="bg-white border border-green-200 rounded-xl px-4 py-3 text-sm text-center focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
              />
              <input
                type="number"
                value={data.totalFloors || ""}
                onChange={(e) =>
                  handleUpdate("totalFloors", parseInt(e.target.value) || 0)
                }
                placeholder="Total Floors"
                className="bg-white border border-green-200 rounded-xl px-4 py-3 text-sm text-center focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Kitchen Details */}
        <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-pink-700 uppercase flex items-center gap-2">
            <span>🔪</span> Kitchen Details
          </h3>
          <div className="space-y-4">
            <select
              value={data.kitchenType || ""}
              onChange={(e) => handleUpdate("kitchenType", e.target.value)}
              className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-sm"
            >
              <option value="">Select Kitchen Type</option>
              {KITCHEN_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <div className="bg-white rounded-xl border border-pink-100 p-3 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-gray-700">
                Modular Kitchen
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!data.isModularKitchen}
                  onChange={(e) =>
                    handleUpdate("isModularKitchen", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>📝</span> Property Description
          </h3>
          <span className="text-xs text-gray-400">
            {data.description?.length || 0} / 2000
          </span>
        </div>
        <textarea
          value={data.description || ""}
          onChange={(e) => handleUpdate("description", e.target.value)}
          placeholder="Describe the highlight features, neighborhood, or recent renovations..."
          rows={5}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Status & Negotiation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-bold text-yellow-800">
              Price Negotiable
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.isPriceNegotiable}
              onChange={(e) =>
                handleUpdate("isPriceNegotiable", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        <select
          value={data.status || ""}
          onChange={(e) => handleUpdate("status", e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="">Set Property Status</option>
          {PROPERTY_STATUS_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-[#9B51E0] hover:bg-[#8539cc] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-100 transition-all transform active:scale-95"
        >
          <span>💾</span>
          Save Property Details
        </button>
      </div>
    </div>
  );
}
