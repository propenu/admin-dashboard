// frontend/admin-dashboard/src/pages/Locations/components/LocationStats.jsx
import { MapPin, Star } from "lucide-react";

export default function LocationStats({ total, popularCities = [] }) {
  return (
    <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border mb-8 space-y-4">
      {/* TOTAL */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <MapPin className="text-green-600 w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Locations</p>
          <h3 className="text-2xl font-bold">{total}</h3>
        </div>
      </div>

      {/* POPULAR CITIES */}
      {popularCities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 text-yellow-500" />
            <p className="text-sm font-semibold text-gray-700">
              Popular Cities
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularCities.map((c, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full border"
              >
                {c.city}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
