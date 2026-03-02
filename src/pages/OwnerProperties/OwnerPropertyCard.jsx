// frontend/admin-dashboard/src/components/OwnerPropertyCard.jsx

import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  DoorOpen,
  User,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- UTIL HELPERS ---------------- */

const formatPrice = (value) => {
  if (typeof value !== "number") return "N/A";
  return value.toLocaleString("en-IN");
};

/* ---------------- COMPONENT ---------------- */

export default function OwnerPropertyCard({ property }) {
  const navigate = useNavigate();

  /* ---------------- SAFE DATA ---------------- */

  const image =
    property?.media?.[0]?.url ||
    property?.gallery?.[0]?.url ||
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=60";

  const isVerified = Boolean(property?.ownerProperties?.isVerified);

  const bedrooms = property?.bedrooms ?? 0;
  const bathrooms = property?.bathrooms ?? 0;
  const furnishing = property?.furnishing || "Not specified";

  const ownerName = property?.ownerDetails?.ownerName || "Owner not disclosed";

  const address = property?.address || "Address not available";
  const city = property?.city || "";

  /* ---------------- RENDER ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-slate-200"
    >
      {/* IMAGE */}
      <div className="relative h-48 sm:h-56 overflow-hidden group">
        <img
          src={image}
          alt={property?.title || "Property"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* VERIFIED BADGE */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          {isVerified ? (
            <>
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">
                Verified
              </span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-600">
                Not Verified
              </span>
            </>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-5">
        {/* TITLE */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 line-clamp-2">
          {property?.title || "Untitled Property"}
        </h3>

        {/* ADDRESS */}
        <div className="flex items-start gap-2 text-slate-600 mb-3">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm line-clamp-1">
            {address}
            {city && `, ${city}`}
          </p>
        </div>

        {/* SPECS */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <div className="flex items-center gap-1 mb-1">
              <Bed className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-semibold text-slate-900">Beds</span>
            </div>
            <p className="text-xs">{bedrooms} Bedrooms</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <div className="flex items-center gap-1 mb-1">
              <Bath className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-semibold text-slate-900">
                Baths
              </span>
            </div>
            <p className="text-xs">{bathrooms} Bathrooms</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <div className="flex items-center gap-1 mb-1">
              <DoorOpen className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-semibold text-slate-900">
                Furnishing
              </span>
            </div>
            <p className="text-xs">{furnishing}</p>
          </div>
        </div>

        {/* OWNER */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <User className="w-4 h-4 text-blue-700" />
          <div>
            <p className="text-xs text-slate-600">Owner</p>
            <p className="text-sm font-semibold text-slate-900">{ownerName}</p>
          </div>
        </div>

        {/* PRICE */}
        <div className="mb-4">
          <h4 className="text-xs text-slate-500">Price</h4>
          <p className="text-lg font-bold text-green-700">
            ₹ {formatPrice(property?.price)}
          </p>
        </div>

        {/* ACTION */}
        <button
          onClick={() => navigate(`/owner-property/${property?._id}`)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
