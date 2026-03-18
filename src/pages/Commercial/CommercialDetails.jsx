// // frontend/admin-dashboard/src/pages/Commercial/CommercialDetails.jsx
// import { useState, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import {
//   ArrowLeft,
//   MapPin,
//   Building2,
//   Ruler,
//   DoorOpen,
//   Users,
//   Car,
//   Share2,
//   Heart,
//   Phone,
//   Mail,
//   Download,
//   Eye,
//   Calendar,
//   IndianRupee,
//   Shield,
//   Wifi,
//   Zap,
//   CheckCircle,
//   Info,
//   Navigation,
// } from "lucide-react";

// import { fetchCommercialById } from "../../services/propertyservice";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import { getContrastTextColor } from "../../utils/colorUtils";
// import { formatPrice } from "../../utils/formatters";

// export default function CommercialDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [debugOpen, setDebugOpen] = useState(false);
//   const [rawResponse, setRawResponse] = useState(null);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [isLiked, setIsLiked] = useState(false);

//   const [colors] = useState({
//     primary: "#ff6600",
//     title: "#ff6600",
//     icon: "#3b82f6",
//     priceCard: "#10b981",
//     specCard: "#8b5cf6",
//     button: "#ef4444",
//     amenity: "#f59e0b",
//   });

//   const query = useQuery({
//     queryKey: ["commercial", id],
//     queryFn: async () => {
//       const res = await fetchCommercialById(id);
//       return res;
//     },
//     onSuccess: (res) => {
//       setRawResponse(res);
//       console.debug("fetchCommercialById raw response:", res);
//     },
//     onError: (err) => {
//       console.error("fetchCommercialById error:", err);
//     },
//     staleTime: 1000 * 60,
//   });

//   const property = useMemo(() => {
//     const data = query.data;
//     if (!data) return null;
//     if (data._id) return data;
//     if (Array.isArray(data.items)) {
//       const found = data.items.find((p) => String(p._id) === String(id));
//       return found || data.items[0] || null;
//     }
//     if (data.data && typeof data.data === "object") {
//       if (data.data._id) return data.data;
//       if (Array.isArray(data.data.items)) {
//         const found = data.data.items.find((p) => String(p._id) === String(id));
//         return found || data.data.items[0] || null;
//       }
//     }
//     if (data.result && typeof data.result === "object" && data.result._id)
//       return data.result;
//     const nested = Object.values(data).find(
//       (v) => v && typeof v === "object" && v._id
//     );
//     if (nested) return nested;
//     return data;
//   }, [query.data, id]);

//   const safeNumber = (v) =>
//     v === null || v === undefined || isNaN(Number(v)) ? null : Number(v);

//   const safeText = (v, fallback = "N/A") =>
//     v === undefined || v === null || (typeof v === "string" && v.trim() === "")
//       ? fallback
//       : v;

//   if (query.isLoading)
//     return (
//       <div className="flex justify-center py-20">
//         <LoadingSpinner size="lg" />
//       </div>
//     );

//   if (query.isError || !property)
//     return (
//       <div className="text-center py-20">
//         <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
//         <h2 className="text-2xl font-bold mt-4">
//           Commercial Property Not Found
//         </h2>
//         <p className="text-sm text-slate-500 mt-2">
//           Check console (devtools) for API response.
//         </p>
//         <button
//           onClick={() => navigate("/commercial")}
//           className="text-blue-600 underline mt-3"
//         >
//           Go Back
//         </button>
//         <div className="mt-6">
//           <button
//             onClick={() => setDebugOpen((s) => !s)}
//             className="px-3 py-1 rounded bg-slate-100 border"
//           >
//             Toggle Debug Panel
//           </button>
//           {debugOpen && (
//             <pre className="mt-3 p-3 bg-black text-white rounded text-xs max-h-72 overflow-auto">
//               {JSON.stringify(rawResponse ?? query.data, null, 2)}
//             </pre>
//           )}
//         </div>
//       </div>
//     );

//   const heroImage =
//     property?.gallery?.[0]?.url ||
//     "https://images.unsplash.com/photo-1497366216548-37526070297c";

//   const allImages = property?.gallery?.length
//     ? property.gallery.map((img) => img?.url)
//     : [heroImage];

//   const priceVal = safeNumber(property.price) ?? safeNumber(property.priceFrom);
//   const displayPrice = priceVal
//     ? `${formatPrice(priceVal)}`
//     : "Price On Request";

//   const superBuilt = safeNumber(property.superBuiltUpArea);
//   const carpet = safeNumber(property.carpetArea);
//   const builtUp = safeNumber(property.builtUpArea);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       {/* Top Navigation */}
//       <div className="flex items-center justify-between mb-6 animate-fade-in">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span className="font-medium">Back to Listings</span>
//         </button>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setIsLiked(!isLiked)}
//             className={`p-3 rounded-full border-2 transition-all ${
//               isLiked
//                 ? "bg-red-50 border-red-500 text-red-500"
//                 : "bg-white border-slate-200 text-slate-600 hover:border-red-300"
//             }`}
//           >
//             <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//           </button>
//           <button className="p-3 rounded-full border-2 bg-white border-slate-200 text-slate-600 hover:border-blue-300 transition-all">
//             <Share2 className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* Layout Split */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         {/* LEFT SIDE - GALLERY */}
//         <div className="lg:col-span-2 animate-slide-in-left">
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
//             <div className="relative h-96 lg:h-[500px] overflow-hidden group">
//               <img
//                 src={allImages[selectedImageIndex]}
//                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                 alt={property.title}
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//               <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
//                 <Eye className="w-4 h-4" />
//                 <span className="text-sm font-medium">
//                   {selectedImageIndex + 1} / {allImages.length}
//                 </span>
//               </div>
//               <div
//                 className="absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-md text-white font-semibold shadow-lg animate-slide-in-left"
//                 style={{ backgroundColor: `${colors.primary}dd` }}
//               >
//                 {safeText(property.propertySubType, property.propertyType || "Commercial Property")}
//               </div>
//             </div>

//             {allImages.length > 1 && (
//               <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100">
//                 <div className="flex gap-3 overflow-x-auto pb-2">
//                   {allImages.map((img, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setSelectedImageIndex(idx)}
//                       className={`w-24 h-20 rounded-xl overflow-hidden border-3 transition-all ${
//                         selectedImageIndex === idx
//                           ? "ring-4 ring-offset-2 ring-orange-500 scale-105"
//                           : "opacity-60 hover:opacity-100"
//                       }`}
//                     >
//                       <img
//                         src={img}
//                         className="w-full h-full object-cover"
//                         alt={`thumb-${idx}`}
//                       />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT SIDE - Quick Info */}
//         <div className="lg:col-span-1 space-y-4 animate-slide-in-right">
//           {/* PRICE CARD */}
//           <div
//             className="bg-white rounded-3xl shadow-xl p-6 border-2 relative overflow-hidden"
//             style={{ borderColor: colors.priceCard }}
//           >
//             <div
//               className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
//               style={{ backgroundColor: colors.priceCard }}
//             />
//             <div className="relative">
//               <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">
//                 <IndianRupee
//                   className="w-5 h-5"
//                   style={{ color: colors.priceCard }}
//                 />
//                 Property Price
//               </p>
//               <p
//                 className="text-4xl font-bold mb-2"
//                 style={{ color: colors.priceCard }}
//               >
//                 {displayPrice}
//               </p>
//               <p className="text-xs text-slate-500 mt-1">+ Taxes & Charges</p>
//             </div>
//           </div>

//           {/* Quick Specs */}
//           <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
//             <h3 className="font-bold text-lg text-slate-800 mb-4">
//               Quick Specifications
//             </h3>

//             {superBuilt && (
//               <QuickSpecItem
//                 icon={<Building2 className="w-5 h-5" />}
//                 label="Super Built-up"
//                 value={`${superBuilt} sqft`}
//                 color={colors.icon}
//               />
//             )}

//             {carpet && (
//               <QuickSpecItem
//                 icon={<Ruler className="w-5 h-5" />}
//                 label="Carpet Area"
//                 value={`${carpet} sqft`}
//                 color={colors.icon}
//               />
//             )}

//             {builtUp && (
//               <QuickSpecItem
//                 icon={<Ruler className="w-5 h-5" />}
//                 label="Built-up Area"
//                 value={`${builtUp} sqft`}
//                 color={colors.icon}
//               />
//             )}

//             <QuickSpecItem
//               icon={<DoorOpen className="w-5 h-5" />}
//               label="Floor"
//               value={`${safeText(property.floorNumber)} / ${safeText(property.totalFloors)}`}
//               color={colors.icon}
//             />

//             {property.seats && (
//               <QuickSpecItem
//                 icon={<Users className="w-5 h-5" />}
//                 label="Workstations"
//                 value={`${property.seats}`}
//                 color={colors.icon}
//               />
//             )}

//             {property.parkingCapacity && (
//               <QuickSpecItem
//                 icon={<Car className="w-5 h-5" />}
//                 label="Parking"
//                 value={`${property.parkingCapacity} Cars`}
//                 color={colors.icon}
//               />
//             )}
//           </div>

//           {/* Contact Buttons */}
//           <div className="space-y-3">
//             <button
//               className="w-full py-4 rounded-2xl shadow-lg font-semibold"
//               style={{
//                 backgroundColor: colors.button,
//                 color: getContrastTextColor(colors.button),
//               }}
//             >
//               <Phone className="w-5 h-5 inline-block mr-2" />
//               Schedule Visit
//             </button>
//             <button
//               className="w-full py-4 rounded-2xl border-2 bg-white font-semibold"
//               style={{
//                 borderColor: colors.button,
//                 color: colors.button,
//               }}
//             >
//               <Mail className="w-5 h-5 inline-block mr-2" />
//               Contact Owner
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* TITLE + LOCATION */}
//       <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//         <h1 className="text-4xl font-bold mb-4" style={{ color: colors.title }}>
//           {safeText(property.title, "Untitled Commercial Property")}
//         </h1>

//         <div className="flex items-start gap-2 text-slate-600 mb-4">
//           <MapPin className="w-6 h-6 mt-1" style={{ color: colors.icon }} />
//           <div>
//             <p className="text-lg">{safeText(property.address)}</p>
//             <p className="text-sm text-slate-500">
//               {safeText(property.city)}, {safeText(property.state)} -{" "}
//               {safeText(property.pincode)}
//             </p>
//           </div>
//         </div>

//         {/* Tags */}
//         <div className="flex flex-wrap gap-2">
//           {property.listingType && (
//             <Tag label={property.listingType} color={colors.primary} delay="0s" />
//           )}
//           {property.propertyType && (
//             <Tag label={property.propertyType} color={colors.specCard} delay="0.1s" />
//           )}
//           {property.propertySubType && (
//             <Tag label={property.propertySubType} color={colors.amenity} delay="0.2s" />
//           )}
//           {property.furnishedStatus && (
//             <Tag label={property.furnishedStatus} color={colors.icon} delay="0.3s" />
//           )}
//           {property.constructionStatus && (
//             <Tag label={property.constructionStatus} color={colors.priceCard} delay="0.4s" />
//           )}
//         </div>
//       </div>

//       {/* DETAILED SPECIFICATIONS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Property Details */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-left">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Building2 className="w-7 h-7" />
//             Property Details
//           </h2>
//           <div className="space-y-4">
//             <DetailRow label="Property Type" value={property.propertyType} />
//             <DetailRow label="Property Sub Type" value={property.propertySubType} />
//             <DetailRow label="Furnishing" value={property.furnishedStatus} />
//             <DetailRow label="Cabins" value={safeText(property.cabins)} />
//             <DetailRow label="Meeting Rooms" value={safeText(property.meetingRooms)} />
//             <DetailRow label="Conference Rooms" value={safeText(property.conferenceRooms)} />
//             <DetailRow label="Washrooms" value={safeText(property.washrooms)} />
//             <DetailRow label="Pantry Type" value={safeText(property.pantry?.type)} />
//             <DetailRow label="Total Units" value={safeText(property.totalUnits)} />
//           </div>
//         </div>

//         {/* Area & Construction */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-right">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Ruler className="w-7 h-7" />
//             Area & Construction
//           </h2>
//           <div className="space-y-4">
//             <DetailRow label="Carpet Area" value={carpet ? `${carpet} sqft` : "N/A"} />
//             <DetailRow label="Built-up Area" value={builtUp ? `${builtUp} sqft` : "N/A"} />
//             <DetailRow label="Super Built-up Area" value={superBuilt ? `${superBuilt} sqft` : "N/A"} />
//             <DetailRow label="Property Age" value={safeText(property.builtYear)} />
//             <DetailRow label="Construction Status" value={safeText(property.constructionStatus)} />
//             <DetailRow label="Available From" value={safeText(property.availableFrom)} />
//           </div>
//         </div>

//         {/* Parking & Security */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-left">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Shield className="w-7 h-7" />
//             Parking & Security
//           </h2>
//           <div className="space-y-4">
//             <DetailRow label="Parking Capacity" value={safeText(property.parkingCapacity)} />
//             {property.security?.gated !== undefined && (
//               <DetailRow label="Gated Community" value={property.security.gated ? "Yes" : "No"} />
//             )}
//             {property.security?.cctv !== undefined && (
//               <DetailRow label="CCTV" value={property.security.cctv ? "Yes" : "No"} />
//             )}
//             {property.security?.guard !== undefined && (
//               <DetailRow label="Security Guard" value={property.security.guard ? "Yes" : "No"} />
//             )}
//             {property.security?.details && (
//               <DetailRow label="Security Details" value={property.security.details} />
//             )}
//           </div>
//         </div>

//         {/* Pricing & Charges */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-right">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <IndianRupee className="w-7 h-7" />
//             Pricing & Charges
//           </h2>
//           <div className="space-y-4">
//             <DetailRow label="Price" value={displayPrice} highlight={colors.priceCard} />
//             <DetailRow
//               label="Maintenance Charges"
//               value={property.maintenanceCharges ? `₹${formatPrice(property.maintenanceCharges)}/month` : "N/A"}
//             />
//             <DetailRow label="Listing Source" value={safeText(property.listingSource)} />
//             <DetailRow label="Featured" value={property.isFeatured ? "Yes" : "No"} />
//             <DetailRow label="Status" value={safeText(property.status)} />
//           </div>
//         </div>
//       </div>

//       {/* SMART HOME FEATURES */}
//       {property.smartHomeFeatures?.length > 0 && (
//         <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Wifi className="w-7 h-7" />
//             Smart Office Features
//           </h2>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//             {property.smartHomeFeatures.map((feature, idx) => (
//               <div
//                 key={idx}
//                 className="p-4 text-center rounded-2xl shadow-md border-2 hover:shadow-lg transition-all animate-bounce-in"
//                 style={{
//                   borderColor: `${colors.specCard}40`,
//                   backgroundColor: `${colors.specCard}10`,
//                   animationDelay: `${idx * 0.05}s`,
//                 }}
//               >
//                 <div
//                   className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
//                   style={{
//                     backgroundColor: `${colors.specCard}30`,
//                     color: colors.specCard,
//                   }}
//                 >
//                   <Zap className="w-6 h-6" />
//                 </div>
//                 <p className="font-semibold text-sm capitalize">
//                   {feature.replace(/-/g, " ")}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* AMENITIES */}
//       <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//           <CheckCircle className="w-7 h-7" />
//           Amenities
//         </h2>
//         {property.amenities?.length ? (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//             {property.amenities.map((a, idx) => (
//               <div
//                 key={idx}
//                 className="p-4 text-center rounded-2xl shadow-md border-2 hover:shadow-lg transition-all animate-bounce-in"
//                 style={{
//                   borderColor: `${colors.amenity}40`,
//                   backgroundColor: `${colors.amenity}10`,
//                   animationDelay: `${idx * 0.05}s`,
//                 }}
//               >
//                 <div
//                   className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
//                   style={{
//                     backgroundColor: `${colors.amenity}30`,
//                     color: colors.amenity,
//                   }}
//                 >
//                   <Building2 className="w-6 h-6" />
//                 </div>
//                 <p className="font-semibold text-sm">{a.title || a}</p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-slate-500 text-center">No amenities listed.</p>
//         )}
//       </div>

//       {/* NEARBY PLACES */}
//       {property.nearbyPlaces?.length > 0 && (
//         <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Navigation className="w-7 h-7" />
//             Nearby Places
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {property.nearbyPlaces.map((place, idx) => (
//               <div
//                 key={idx}
//                 className="p-5 rounded-2xl border-2 hover:shadow-lg transition-all"
//                 style={{
//                   borderColor: `${colors.icon}20`,
//                   backgroundColor: `${colors.icon}05`,
//                 }}
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className="w-12 h-12 rounded-full flex items-center justify-center"
//                     style={{
//                       backgroundColor: `${colors.icon}20`,
//                       color: colors.icon,
//                     }}
//                   >
//                     <MapPin className="w-6 h-6" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-bold text-slate-800">{place.name}</p>
//                     <p className="text-sm text-slate-600">{place.type}</p>
//                     <p className="text-xs text-slate-500 mt-1">{place.distanceText} away</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* SPECIFICATIONS GRID */}
//       {property.specifications?.length > 0 && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {property.specifications.map((spec, idx) => (
//             <div
//               key={idx}
//               className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-left"
//             >
//               <h2 className="text-2xl font-bold mb-6" style={{ color: colors.title }}>
//                 {spec.category}
//               </h2>
//               <ul className="space-y-3">
//                 {spec.items?.map((i, ind) => (
//                   <li
//                     key={ind}
//                     className="p-3 rounded-lg bg-slate-50 border border-slate-200"
//                   >
//                     <strong className="text-slate-800">{i.title}:</strong>{" "}
//                     <span className="text-slate-600">{i.description}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* DESCRIPTION */}
//       {property.description && (
//         <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Info className="w-7 h-7" />
//             About This Property
//           </h2>
//           <p className="text-slate-700 text-lg leading-relaxed">
//             {property.description}
//           </p>
//         </div>
//       )}

//       {/* TENANT INFO */}
//       {property.tenantInfo?.length > 0 && (
//         <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//             <Users className="w-7 h-7" />
//             Current Tenants
//           </h2>
//           <div className="space-y-4">
//             {property.tenantInfo.map((tenant, idx) => (
//               <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <p className="text-sm text-slate-500">Tenant</p>
//                     <p className="font-semibold">{safeText(tenant.currentTenant)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500">Monthly Rent</p>
//                     <p className="font-semibold text-lg" style={{ color: colors.priceCard }}>
//                       {tenant.rent ? `₹${formatPrice(tenant.rent)}` : "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-500">Lease Period</p>
//                     <p className="font-semibold">
//                       {safeText(tenant.leaseStart)} → {safeText(tenant.leaseEnd)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* PROPERTY INSIGHTS */}
//       <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
//         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
//           <Eye className="w-7 h-7" />
//           Property Insights
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           <div className="text-center p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
//             <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
//             <p className="text-3xl font-bold text-blue-600">{property.meta?.views || 0}</p>
//             <p className="text-sm text-slate-600 mt-1">Views</p>
//           </div>
//           <div className="text-center p-4 rounded-2xl bg-green-50 border-2 border-green-200">
//             <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
//             <p className="text-3xl font-bold text-green-600">{property.meta?.inquiries || 0}</p>
//             <p className="text-sm text-slate-600 mt-1">Inquiries</p>
//           </div>
//           <div className="text-center p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
//             <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
//             <p className="text-sm font-bold text-purple-600">
//               {new Date(property.createdAt).toLocaleDateString()}
//             </p>
//             <p className="text-sm text-slate-600 mt-1">Listed On</p>
//           </div>
//           <div className="text-center p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
//             <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
//             <p className="text-sm font-bold text-orange-600 capitalize">
//               {property.status || "Active"}
//             </p>
//             <p className="text-sm text-slate-600 mt-1">Status</p>
//           </div>
//         </div>
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <ActionButton
//             label="Schedule Visit"
//             icon={<Phone className="w-6 h-6 inline-block mr-2" />}
//             bg={colors.button}
//           />
//           <ActionButton
//             label="Download Brochure"
//             icon={<Download className="w-6 h-6 inline-block mr-2" />}
//             border={colors.button}
//           />
//           <ActionButton
//             label="Email Details"
//             icon={<Mail className="w-6 h-6 inline-block mr-2" />}
//             border={colors.icon}
//           />
//         </div>
//       </div>

//       {/* Animations CSS */}
//       <style>{`
//         @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
//         @keyframes slideInLeft { from{opacity:0;transform:translateX(-50px);} to{opacity:1;transform:translateX(0);} }
//         @keyframes slideInRight { from{opacity:0;transform:translateX(50px);} to{opacity:1;transform:translateX(0);} }
//         @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3);} 50%{opacity:1;transform:scale(1.05);} 100%{transform:scale(1);} }

//         .animate-fade-in { animation: fadeIn 0.6s ease-out; }
//         .animate-slide-in-left { animation: slideInLeft 0.7s ease-out; }
//         .animate-slide-in-right { animation: slideInRight 0.7s ease-out; }
//         .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
//       `}</style>
//     </div>
//   );
// }

// // Reusable Components (identical to Residential)
// function QuickSpecItem({ icon, label, value, color }) {
//   return (
//     <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
//       <div
//         className="w-10 h-10 rounded-lg flex items-center justify-center"
//         style={{ backgroundColor: `${color}20`, color }}
//       >
//         {icon}
//       </div>
//       <div className="flex-1">
//         <p className="text-xs text-slate-500">{label}</p>
//         <p className="font-semibold text-slate-800">{value}</p>
//       </div>
//     </div>
//   );
// }

// function Tag({ label, color, delay }) {
//   return (
//     <span
//       className="px-4 py-2 rounded-full text-sm font-medium animate-bounce-in capitalize"
//       style={{ backgroundColor: `${color}20`, color, animationDelay: delay }}
//     >
//       {label?.replace(/-/g, " ")}
//     </span>
//   );
// }

// function DetailRow({ label, value, highlight }) {
//   return (
//     <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
//       <span className="text-slate-600 font-medium">{label}</span>
//       <span
//         className={`font-semibold ${highlight ? "text-lg" : ""} capitalize`}
//         style={highlight ? { color: highlight } : { color: "#1e293b" }}
//       >
//         {value || "N/A"}
//       </span>
//     </div>
//   );
// }

// function ActionButton({ label, icon, bg, border }) {
//   if (bg)
//     return (
//       <button
//         className="p-6 rounded-2xl shadow-lg font-semibold hover:shadow-xl transition-all hover:-translate-y-1"
//         style={{ backgroundColor: bg, color: getContrastTextColor(bg) }}
//       >
//         {icon}
//         {label}
//       </button>
//     );

//   return (
//     <button
//       className="p-6 rounded-2xl border-2 font-semibold hover:shadow-lg transition-all bg-white hover:-translate-y-1"
//       style={{ borderColor: border, color: border }}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }











// frontend/admin-dashboard/src/pages/Residential/ResidentialDetails.jsx
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FALLBACK from "../../assets/fallback.svg";

import {
  ArrowLeft,
  MapPin,
  Home,
  Building2,
  Ruler,
  DoorOpen,
  Car,
  Share2,
  Heart,
  Phone,
  Mail,
  IndianRupee,
  Shield,
  CheckCircle,
  Info,
  Calendar,
  Eye,
  User,
} from "lucide-react";

import { fetchResidentialById } from "../../services/PaymentServices";
import LoadingSpinner from "../../components/common/LoadingSpinner";
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};


const FALLBACK_IMAGE = FALLBACK;

export default function ResidentialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["residential", id],
    queryFn: () => fetchResidentialById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const property = useMemo(() => rawData?.data || rawData || null, [rawData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <Home className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Property Not Found
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          The property may have been removed or is no longer available.
        </p>
        <button
          onClick={() => navigate("/residential")}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const gallery = property.gallery?.filter((img) => img?.url) || [];
  const heroImage = gallery[selectedImageIndex]?.url || gallery[0]?.url || FALLBACK_IMAGE;

  const price = Number(property.price) || 0;
  const displayPrice = price ? `₹${formatPrice(price)}` : "Price on Request";
  const pricePerSqft = Number(property.pricePerSqft) || 0;

  // Owner / Creator information
  const creator = property.createdBy || {};
  const hasCreatorInfo = creator.name || creator.phone;

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Top bar - Back + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </button>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full transition-colors duration-200 ${
                isLiked
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600"
              }`}
              aria-label="Like property"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              className="p-3 rounded-full bg-white border border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Share property"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Gallery */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              {/* Hero Image */}
              <div className="relative aspect-[4/3] sm:aspect-[5/3] lg:aspect-[16/10] overflow-hidden">
                <img
                  src={heroImage}
                  alt={property.title || "Property image"}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {gallery.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                    {selectedImageIndex + 1} / {gallery.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-24 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-center ${
                          selectedImageIndex === idx
                            ? "border-orange-500 scale-105 shadow-md"
                            : "border-transparent opacity-75 hover:opacity-100 hover:border-orange-300"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Price + Quick info + CTA */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-7">
            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1.5">Asking Price</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 tracking-tight">
                {displayPrice}
              </p>
              {pricePerSqft > 0 && (
                <p className="mt-2 text-sm font-medium text-gray-600">
                  ₹{pricePerSqft.toLocaleString("en-IN")} / sq.ft
                </p>
              )}
              {property.isPriceNegotiable && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <span>Negotiable</span>
                </div>
              )}
            </div>

            {/* Quick Specs */}
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-7 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">Key Highlights</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                <div>
                  <span className="text-gray-500 block">Type</span>
                  <strong className="font-semibold">{property.propertyType?.toUpperCase() || "Apartment"}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Configuration</span>
                  <strong className="font-semibold">
                    {property.bedrooms || property.bhk || "?"} BHK
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <strong className="font-semibold">
                    {property.constructionStatus?.replace(/-/g, " ") || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Facing</span>
                  <strong className="font-semibold capitalize">{property.facing || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Furnishing</span>
                  <strong className="font-semibold">
                    {property.furnishing?.replace(/-/g, " ") || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Floor</span>
                  <strong className="font-semibold">
                    {property.floorNumber || "?"} / {property.totalFloors || "?"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="space-y-3.5">
              <button
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-5 h-5" />
                Schedule Site Visit
              </button>
              <button
                className="w-full py-4 border-2 border-red-600 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Owner
              </button>
            </div>
          </div>
        </div>

        {/* Title + Location + Tags */}
        <section className="mt-8 lg:mt-10 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {property.title || "Residential Property in Hyderabad"}
          </h1>

          <div className="flex items-start gap-3 text-gray-700 mb-5">
            <MapPin className="w-6 h-6 mt-1 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-lg font-medium leading-snug">
                {property.address?.trim() || "Green Residency, Shaikpet"}
              </p>
              <p className="text-gray-600 mt-1">
                {property.locality ? `${property.locality}, ` : ""}
                {property.city}, {property.state}
                {property.pincode ? ` - ${property.pincode}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="px-4 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              For Sale
            </span>
            <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
              {property.transactionType?.replace(/-/g, " ") || "New Sale"}
            </span>
            {property.isModularKitchen && (
              <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Modular Kitchen
              </span>
            )}
          </div>
        </section>

        {/* Description */}
        {property.description && (
          <section className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <Info className="w-6 h-6 text-blue-600" />
              About This Property
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </section>
        )}

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <section className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <CheckCircle className="w-7 h-7 text-green-600" />
              Amenities & Facilities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {property.amenities.map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="font-medium text-sm text-gray-800">{item.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Configuration + Building Details */}
        <section className="mt-6 lg:mt-8 grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <Ruler className="w-7 h-7 text-blue-600" />
              Area & Configuration
            </h2>
            <div className="space-y-4">
              <Detail label="Bedrooms" value={property.bedrooms} />
              <Detail label="Bathrooms" value={property.bathrooms} />
              <Detail label="Balconies" value={property.balconies} />
              <Detail
                label="Carpet Area"
                value={property.carpetArea ? `${property.carpetArea} sq.ft` : "N/A"}
              />
              <Detail label="Flooring Type" value={property.flooringType} />
              <Detail label="Kitchen Type" value={property.kitchenType} />
              <Detail
                label="Modular Kitchen"
                value={property.isModularKitchen ? "Yes" : "No"}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-purple-600" />
              Building & Security
            </h2>
            <div className="space-y-4">
              <Detail label="Total Floors" value={property.totalFloors} />
              <Detail
                label="Property Age"
                value={property.propertyAge?.replace(/-/g, " ") || "N/A"}
              />
              <Detail
                label="Construction Status"
                value={property.constructionStatus?.replace(/-/g, " ") || "N/A"}
              />
              <Detail label="Facing Direction" value={property.facing} />
              <Detail label="Gated Community" value="Yes" />
              <Detail label="24×7 Security" value="Yes" />
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
            <Eye className="w-7 h-7 text-indigo-600" />
            Property Insights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 text-center">
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">{property.meta?.views || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Views</p>
            </div>
            <div className="p-5 bg-green-50 rounded-xl border border-green-100">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-xl font-bold text-green-700">
                {new Date(property.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">Listed On</p>
            </div>
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-xl font-bold text-purple-700 capitalize">
                {property.status || "Draft"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Status</p>
            </div>
          </div>
        </section>

        {/* Posted By / Owner Information */}
        {hasCreatorInfo && (
          <section className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <User className="w-7 h-7 text-indigo-600" />
              Posted By
            </h2>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {creator.name || "Owner / Agent"}
                  </p>
                  {creator.phone && (
                    <a
                      href={`tel:${creator.phone}`}
                      className="text-indigo-600 hover:underline flex items-center gap-1.5 mt-1 text-base"
                    >
                      <Phone className="w-4 h-4" />
                      {creator.phone}
                    </a>
                  )}
                </div>
              </div>

              {creator.roleId && (
                <div className="text-sm text-gray-600">
                  Role ID: <span className="font-medium">{creator.roleId}</span>
                </div>
              )}

              <p className="text-sm text-gray-500 pt-3 border-t border-gray-100">
                Contact directly for more details or to schedule a visit.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="font-semibold text-gray-800">{value || "N/A"}</span>
    </div>
  );
}