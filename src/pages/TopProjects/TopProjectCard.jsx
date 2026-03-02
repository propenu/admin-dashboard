//frontend/admin-dashboard/src/components/TopProjectCard.jsx
import { useNavigate } from "react-router-dom";
import { MapPin, Bed, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "../../utils/formatters";
 

export default function TopProjectCard({ property }) {
  const navigate = useNavigate();

  // Use heroImage fallback
  const image =
    property.heroImage ||
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=60";

  // Extract Bedroom Count (from bhkSummary)
  const bedroomCount = property.bhkSummary?.length
    ? property.bhkSummary.map((b) => b.bhkLabel).join(", ")
    : "N/A";

  // Price handling
  const priceText =
    property.priceFrom && property.priceTo
      ? `₹ ${formatPrice(property.priceFrom)} - ₹ ${formatPrice(
          property.priceTo
        )}`
      : "Price Not Available";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-slate-200"
    >
      {/* Image */}
      <div className="relative h-48 sm:h-56 overflow-hidden group">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-semibold">
          {property.status === "active" ? (
            <span className="text-green-700">Active</span>
          ) : (
            <span className="text-red-700">Inactive</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 text-slate-600 mb-3">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm line-clamp-1">
            {property.address}, {property.city}
          </p>
        </div>

        {/* Bedrooms */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200 flex items-center gap-2">
          <Bed className="w-4 h-4 text-slate-700" />
          <p className="text-xs font-semibold text-slate-700">
            BHK Options: <span className="font-normal">{bedroomCount}</span>
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <h4 className="text-xs text-slate-500">Price Range</h4>
          <p className="text-lg font-bold text-green-700 mt-1">{priceText}</p>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate(`/top-project/${property._id}`)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
