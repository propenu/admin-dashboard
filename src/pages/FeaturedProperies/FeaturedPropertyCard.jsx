// //D:\propenu\frontend\admin-dashboard\src\pages\HighlightProjects\HighlightProjectsCard.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { MapPin, Bed, ChevronRight, Building2 } from "lucide-react";
// import { motion } from "framer-motion";
// import { formatPrice } from "../../utils/formatters";
// import Fallback from "../../assets/fallback.svg";
// import { editFeaturedProject } from "../../features/property/propertyService";
// import { toast } from "sonner";

// export default function FeaturedPropertyCard({ property }) {
//   const navigate = useNavigate();

//   const [updating, setUpdating] = useState(false);
//   const [rank, setRank] = useState(property?.rank);

//   const handleMakeFeatured = async () => {
//     try {
//       setUpdating(true);

//       await editFeaturedProject(property._id, {
//         isFeatured: false,
//         rank: rank,
//       });

//       toast.success("Moved to Highlight Projects successfully");

//       // Option 1 (recommended)
//       window.location.reload();

//       // Option 2 (better way)
//       // Call parent refresh function instead of reload
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   /* ---------------- FALLBACK IMAGE ---------------- */
//   const fallbackImage = Fallback;

//   const image =
//     property?.heroImage || property?.gallerySummary?.[0]?.url || fallbackImage;

//   const city = property?.city?.trim() || "Unknown City";
//   const address = property?.address?.trim() || "Address not available";

//   const priceFrom =
//     typeof property?.priceFrom === "number"
//       ? formatPrice(property.priceFrom)
//       : "N/A";

//   const priceTo =
//     typeof property?.priceTo === "number"
//       ? formatPrice(property.priceTo)
//       : "N/A";

//   const status = property?.status === "active" ? "Active" : "Inactive";

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -3 }}
//       transition={{ duration: 0.25 }}
//       className="bg-white rounded-lg shadow border overflow-hidden"
//     >
//       {/* IMAGE */}
//       <div className="h-40 overflow-hidden relative">
//         <img
//           src={image}
//           alt={property?.title || "Highlighted property"}
//           className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-500"
//         />

//         {/* STATUS */}
//         <span className="absolute top-2 left-2 text-[10px] bg-white px-2 py-0.5 rounded-full">
//           <span
//             className={status === "Active" ? "text-green-700" : "text-red-600"}
//           >
//             {status}
//           </span>
//         </span>
//       </div>

//       {/* CONTENT */}
//       <div className="p-4">
//         {/* TITLE */}
//         <h3 className="text-sm font-bold line-clamp-1">
//           {property?.title || "Untitled Project"}
//         </h3>

//         {/* LOCATION */}
//         <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
//           <MapPin className="w-3 h-3" />
//           <span className="line-clamp-1">
//             {address}, {city}
//           </span>
//         </div>

//         {/* TYPE */}
//         <div className="flex items-center gap-1 text-[10px] mt-2 bg-slate-50 px-2 py-1 rounded border">
//           <Building2 className="w-3 h-3" />
//           Highlighted Property
//         </div>

//         {/* PRICE */}
//         <div className="mt-2">
//           <p className="text-[10px] text-slate-500">Price Range</p>
//           <p className="text-sm font-bold text-green-700">
//             ₹ {priceFrom} – {priceTo}
//           </p>
//         </div>

//         {/* BHK SUMMARY */}
//         {Array.isArray(property?.bhkSummary) &&
//           property.bhkSummary.length > 0 && (
//             <div className="grid grid-cols-2 gap-1 mt-2">
//               {property.bhkSummary.slice(0, 2).map((b, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-1 text-[10px] bg-slate-50 border rounded px-2 py-1"
//                 >
//                   <Bed className="w-3 h-3" />
//                   {b?.bhkLabel}
//                 </div>
//               ))}
//             </div>
//           )}
//         {/* VIEW BUTTON */}
//         <div className="flex gap-2 p-2">
//           <button
//             onClick={() => navigate(`/featured-property/${property._id}`)}
//             className="w-full text-xs font-semibold py-2 rounded-lg bg-[#27AE60] text-white flex items-center justify-center gap-1 hover:from-blue-700 hover:to-indigo-700 transition"
//           >
//             View
//             {/* <ChevronRight className="w-3 h-3" /> */}
//           </button>
//           <button
//             onClick={() => navigate(`/post-property/${property._id}`)}
//             className="w-full text-xs font-semibold py-2  rounded-lg bg-[#27AE60] text-white flex items-center justify-center gap-1 hover:from-blue-700 hover:to-indigo-700 transition"
//           >
//             Edit
//             {/* <ChevronRight className="w-3 h-3" /> */}
//           </button>
//         </div>

//         {property.isFeatured && (
//           <button
//             onClick={handleMakeFeatured}
//             disabled={updating}
//             className="w-full  text-xs font-semibold py-2 rounded-lg bg-green/50 text-[#27AE60] flex items-center justify-center gap-1 hover:bg-green/80 transition"
//           >
//             {updating ? "Updating..." : "Make Top Selling Project"}
//           </button>
//         )}
//       </div>
//     </motion.div>
//   );
// }


// frontend/admin-dashboard/src/pages/FeaturedPropertyCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bed, Building2, GripVertical, Check, X, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "../../utils/formatters";
import Fallback from "../../assets/fallback.svg";
import { editFeaturedProject } from "../../features/property/propertyService";
import { toast } from "sonner";

export default function FeaturedPropertyCard({ property, onRankUpdated }) {
  const navigate = useNavigate();

  const [updating, setUpdating] = useState(false);
  const [editingRank, setEditingRank] = useState(false);
  const [rankInput, setRankInput] = useState(property?.rank ?? "");

  // ── Save rank via PATCH ──────────────────────────────────────────────────
  const handleSaveRank = async () => {
    const newRank = parseInt(rankInput, 10);

    if (isNaN(newRank) || newRank < 1) {
      toast.error("Rank must be a positive number");
      return;
    }

    try {
      setUpdating(true);
      await editFeaturedProject(property._id, { rank: newRank });
      toast.success(`Rank updated to #${newRank}`);
      setEditingRank(false);
      // Notify parent to re-sort / refetch
      if (onRankUpdated) onRankUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rank");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRank = () => {
    setRankInput(property?.rank ?? "");
    setEditingRank(false);
  };

  // ── Move to Highlight Projects ───────────────────────────────────────────
  const handleMakeFeatured = async () => {
    try {
      setUpdating(true);
      await editFeaturedProject(property._id, {
        isFeatured: false,
        rank: property?.rank,
      });
      toast.success("Moved to Highlight Projects successfully");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const fallbackImage = Fallback;
  const image =
    property?.heroImage || property?.gallerySummary?.[0]?.url || fallbackImage;

  const city = property?.city?.trim() || "Unknown City";
  const address = property?.address?.trim() || "Address not available";

  const priceFrom =
    typeof property?.priceFrom === "number"
      ? formatPrice(property.priceFrom)
      : "N/A";

  const priceTo =
    typeof property?.priceTo === "number"
      ? formatPrice(property.priceTo)
      : "N/A";

  const status = property?.status === "active" ? "Active" : "Inactive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-lg shadow border overflow-hidden"
    >
      {/* IMAGE */}
      <div className="h-40 overflow-hidden relative">
        <img
          src={image}
          alt={property?.title || "Featured property"}
          className="w-full h-full object-fill transition-transform duration-500"
        />

        {/* STATUS badge */}
        <span className="absolute top-2 left-2 text-[10px] bg-white px-2 py-0.5 rounded-full shadow">
          <span className={status === "Active" ? "text-green-700" : "text-red-600"}>
            {status}
          </span>
        </span>

        {/* ── RANK BADGE (top-right corner) ─────────────────────────────── */}
        <div className="absolute top-20 right-2 flex items-center gap-1">
          {editingRank ? (
            /* Inline rank edit input */
            <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow border border-[#27AE60]">
              <GripVertical className="w-3 h-3 text-slate-400" />
              <input
                type="number"
                min={1}
                value={rankInput}
                onChange={(e) => setRankInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRank();
                  if (e.key === "Escape") handleCancelRank();
                }}
                autoFocus
                className="w-10 text-xs font-bold text-[#27AE60] outline-none text-center"
              />
              <button
                onClick={handleSaveRank}
                disabled={updating}
                className="text-green-600 hover:text-green-800"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCancelRank} className="text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Static rank pill — click to edit */
            <button
              onClick={() => setEditingRank(true)}
              title="Click to edit rank"
              className="flex items-center gap-1 bg-[#27AE60] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow hover:bg-green-700 transition"
            >
              <GripVertical className="w-3 h-3" />
              {property?.rank != null ? `#${property.rank}` : "Set Rank"}
              <Pencil className="w-2.5 h-2.5 opacity-70" />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* TITLE */}
        <h3 className="text-sm font-bold line-clamp-1">
          {property?.title || "Untitled Project"}
        </h3>

        {/* LOCATION */}
        <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">
            {address}, {city}
          </span>
        </div>

        {/* TYPE */}
        <div className="flex items-center gap-1 text-[10px] mt-2 bg-slate-50 px-2 py-1 rounded border">
          <Building2 className="w-3 h-3" />
          Featured Property
        </div>

        {/* PRICE */}
        <div className="mt-2">
          <p className="text-[10px] text-slate-500">Price Range</p>
          <p className="text-sm font-bold text-green-700">
            ₹ {priceFrom} – {priceTo}
          </p>
        </div>

        {/* BHK SUMMARY */}
        {Array.isArray(property?.bhkSummary) && property.bhkSummary.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mt-2">
            {property.bhkSummary.slice(0, 2).map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-[10px] bg-slate-50 border rounded px-2 py-1"
              >
                <Bed className="w-3 h-3" />
                {b?.bhkLabel}
              </div>
            ))}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 p-2">
          <button
            onClick={() => navigate(`/featured-property/${property._id}`)}
            className="w-full text-xs font-semibold py-2 rounded-lg bg-[#27AE60] text-white flex items-center justify-center gap-1 hover:bg-green-700 transition"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/post-property/${property._id}`)}
            className="w-full text-xs font-semibold py-2 rounded-lg bg-[#27AE60] text-white flex items-center justify-center gap-1 hover:bg-green-700 transition"
          >
            Edit
          </button>
        </div>

        {property.isFeatured && (
          <button
            onClick={handleMakeFeatured}
            disabled={updating}
            className="w-full text-xs font-semibold py-2 rounded-lg bg-green-50 text-[#27AE60] border border-[#27AE60] flex items-center justify-center gap-1 hover:bg-green-100 transition"
          >
            {updating ? "Updating..." : "Make Top Selling Project"}
          </button>
        )}
      </div>
    </motion.div>
  );
}