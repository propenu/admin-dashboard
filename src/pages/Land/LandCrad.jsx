// frontend/admin-dashboard/src/pages/Land/LandCard.jsx
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveCategory } from "../../store/Ui/uiSlice";
import { actions } from "../../store/newIndex";
import {
  MapPin,
  Bed,
  Bath,
  Move,
  Eye,
  FileCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import FALLBACK from "../../assets/fallback.svg";

// ✅ Indian Price Formatter
const formatPrice = (price) => {
  if (!price || isNaN(price)) return "Price on Request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

export default function LandCard({ property }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(property);
  // Logic to determine status badge UI
  const getDocStatus = () => {
    const docs = property?.verificationDocuments || [];
    if (docs.length === 0)
      return {
        label: "No Docs",
        color: "text-slate-500 bg-slate-100",
        icon: AlertCircle,
      };
    if (docs.some((d) => d.status === "rejected"))
      return {
        label: "Rejected",
        color: "text-red-600 bg-red-50",
        icon: AlertCircle,
      };
    if (docs.some((d) => d.status === "pending"))
      return {
        label: "Pending Review",
        color: "text-amber-600 bg-amber-50",
        icon: Clock,
      };
    if (docs.every((d) => d.status === "verified"))
      return {
        label: "Verified",
        color: "text-green-600 bg-green-50",
        icon: FileCheck,
      };
    return { label: "Draft", color: "text-blue-600 bg-blue-50", icon: Clock };
  };

  const statusInfo = getDocStatus();
  const completion = property?.completion?.percent || 0;
  const isPendingReview = property?.verificationDocuments?.some(
    (d) => d.status === "pending",
  );

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#27AE60]/30 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 flex flex-col md:flex-row p-3 gap-5">
      {/* --- Image Section --- */}
      <div className="relative w-full md:w-72 h-52 shrink-0 rounded-xl overflow-hidden bg-slate-100">
        <img
          src={property?.gallery?.[0]?.url || FALLBACK}
          alt={property?.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Status Badge Over Image */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm backdrop-blur-md ${statusInfo.color}`}
        >
          <statusInfo.icon className="w-3 h-3" />
          {statusInfo.label}
        </div>
        {/* Photo Count */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-lg flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> {property?.gallery?.length || 0}
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="flex-grow flex flex-col">
        {/* Top Info */}
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                {property?.status || "Unknown"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  {completion}% done
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-[#27AE60] transition-colors">
              {property?.title || "Unnamed Property"}
            </h2>
          </div>

          {/* Price Desktop */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-2xl font-black text-[#27AE60]">
              {typeof property?.price === "number"
                ? formatPrice(property.price)
                : "Price on Request"}
            </span>
            {property?.pricePerSqft && (
              <span className="text-[11px] text-slate-400 font-medium">
                ₹{property.pricePerSqft}/sqft
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 text-[#27AE60]/70" />
          <span className="line-clamp-1">
            {property?.address}, {property?.city}
          </span>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-50 mb-4">
          <div className="flex flex-col items-center md:items-start border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Bed className="w-4 h-4" />
              <span className="text-xs">Layout Type</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.layoutType || 0}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Bath className="w-4 h-4" />
              <span className="text-xs">Facing</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.facing || 0}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Move className="w-4 h-4" />
              <span className="text-xs">Plot Area</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.plotArea}{" "}
              <small className="text-[10px] font-normal">acer</small>
            </span>
          </div>
        </div>

        {/* Posted By */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-slate-600">Posted By:</span>
          <span className="text-[#27AE60] font-semibold">
            {property?.createdBy?.name
              ?.split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") || "Unknown"}
          </span>
          {property?.createdBy?.phone && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {property.createdBy.phone}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {property?.views || 0}
            </span>
            <span>
              Listed:{" "}
              {property?.createdAt
                ? new Date(property.createdAt).toLocaleDateString()
                : "Today"}
            </span>
          </div>

          <div className="flex gap-2">
            {isPendingReview ? (
              <button
                onClick={() =>
                  navigate(`/land-property-verification/${property._id}`)
                }
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold bg-[#27AE60] text-white shadow-lg shadow-green-200 hover:bg-[#219150] transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                Review Docs <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  dispatch(setActiveCategory("land"));
                  dispatch(actions.land.hydrateForm(property));
                  navigate(`/edit-property/${property._id}`);
                }}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold bg-[#27AE60] text-white transition-all active:scale-95"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Price Mobile Only */}
      <div className="md:hidden pt-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400 font-bold uppercase">
          Total Price
        </span>
        <span className="text-xl font-black text-[#27AE60]">
          {typeof property?.price === "number"
            ? formatPrice(property.price)
            : "Price on Request"}
        </span>
      </div>
    </div>
  );
}
