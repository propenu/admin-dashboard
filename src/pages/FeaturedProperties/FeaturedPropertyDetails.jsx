// // // frontend/admin-dashboard/src/pages/PropertyDetails.jsx
// import { useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import {
//   ArrowLeft,
//   MapPin,
//   Building2,
//   Ruler,
//   Bed,
//   Layers,
//   ShieldCheck,
//   IndianRupee,
//   Eye,
//   Calendar,
//   CheckCircle,
//   Navigation,
// } from "lucide-react";

// import { fetchFeaturedProperties } from "../../services/PropertyService";
// import LoadingSpinner from "../../components/common/LoadingSpinner";

// export const formatPrice = (price) => {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(price);
// };

// export default function FeaturedPropertyDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [selectedImage, setSelectedImage] = useState(0);

//   const { data, isLoading } = useQuery({
//     queryKey: ["featuredProperties"],
//     queryFn: fetchFeaturedProperties,
//   });

//   const property = useMemo(
//     () => data?.items?.find((p) => p._id === id),
//     [data, id]
//   );

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-20">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!property) {
//     return (
//       <div className="text-center py-20">
//         <Building2 className="w-16 h-16 mx-auto text-slate-300" />
//         <h2 className="text-2xl font-bold mt-4">Property Not Found</h2>
//         <button
//           onClick={() => navigate(-1)}
//           className="text-blue-600 underline mt-3"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const images =
//     property.gallerySummary?.length > 0
//       ? property.gallerySummary.sort((a, b) => a.order - b.order)
//       : [{ url: property.heroImage }];

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       {/* BACK */}
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center gap-2 text-slate-600 mb-6"
//       >
//         <ArrowLeft className="w-5 h-5" /> Back
//       </button>

//       {/* GALLERY */}
//       <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
//         <div className="relative h-[420px] overflow-hidden">
//           <img
//             src={images[selectedImage].url}
//             className="w-full h-full object-cover"
//             alt={property.title}
//           />
//           <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
//             <Eye className="w-4 h-4" />
//             {selectedImage + 1} / {images.length}
//           </div>
//         </div>

//         {images.length > 1 && (
//           <div className="flex gap-3 p-4 overflow-x-auto bg-slate-50">
//             {images.map((img, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setSelectedImage(idx)}
//                 className={`w-24 h-20 rounded-xl overflow-hidden ${
//                   idx === selectedImage
//                     ? "ring-4 ring-orange-500"
//                     : "opacity-60 hover:opacity-100"
//                 }`}
//               >
//                 <img src={img.url} className="w-full h-full object-cover" />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* TITLE + LOCATION */}
//       <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//         <h1 className="text-4xl font-bold mb-4">{property.title}</h1>

//         <div className="flex items-start gap-2 text-slate-600 mb-4">
//           <MapPin className="w-6 h-6 mt-1" />
//           <div>
//             <p className="text-lg">{property.address}</p>
//             <p className="text-sm text-slate-500">{property.city}</p>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <Tag label={property.status} />
//           <Tag label={`RERA: ${property.reraNumber}`} />
//           <Tag label={`Possession: ${property.possessionDate}`} />
//         </div>
//       </div>

//       {/* PRICE */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <InfoCard icon={<IndianRupee />} label="Price Range">
//           ₹ {formatPrice(property.priceFrom)} – ₹{" "}
//           {formatPrice(property.priceTo)}
//         </InfoCard>

//         <InfoCard icon={<Building2 />} label="Units">
//           {property.availableUnits} / {property.totalUnits}
//         </InfoCard>

//         <InfoCard icon={<Layers />} label="Project Area">
//           {property.projectArea} Acres
//         </InfoCard>
//       </div>

//       {/* BHK CONFIG */}
//       <Section title="BHK Configurations">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {property.bhkSummary.map((bhk, idx) => {
//             const units = bhk.units;
//             const minSqft = Math.min(...units.map((u) => u.minSqft));
//             const maxSqft = Math.max(...units.map((u) => u.minSqft));
//             const minPrice = Math.min(...units.map((u) => u.maxPrice));
//             const maxPrice = Math.max(...units.map((u) => u.maxPrice));
//             const totalUnits = units.reduce(
//               (sum, u) => sum + u.availableCount,
//               0
//             );

//             return (
//               <div
//                 key={idx}
//                 className="p-6 border rounded-xl bg-slate-50 shadow-sm"
//               >
//                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
//                   <Bed className="w-5 h-5" />
//                   {bhk.bhkLabel}
//                 </h3>

//                 <DetailRow
//                   label="Size"
//                   value={`${minSqft} - ${maxSqft} sqft`}
//                 />
//                 <DetailRow
//                   label="Price"
//                   value={`₹ ${formatPrice(minPrice)} – ₹ ${formatPrice(
//                     maxPrice
//                   )}`}
//                 />
//                 <DetailRow label="Available Units" value={`${totalUnits}`} />
//               </div>
//             );
//           })}
//         </div>
//       </Section>

//       {/* AMENITIES */}
//       <Section title="Amenities">
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {property.amenities.map((a) => (
//             <div
//               key={a.key}
//               className="p-4 text-center rounded-xl bg-slate-50 border shadow-sm"
//             >
//               <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
//               <p className="font-semibold">{a.title}</p>
//             </div>
//           ))}
//         </div>
//       </Section>

//       {/* NEARBY */}
//       <Section title="Nearby Places">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {property.nearbyPlaces.map((p, idx) => (
//             <div
//               key={idx}
//               className="p-4 border rounded-xl flex gap-3 items-center"
//             >
//               <Navigation className="w-6 h-6 text-blue-600" />
//               <div>
//                 <p className="font-bold">{p.name}</p>
//                 <p className="text-sm text-slate-500">
//                   {p.type} • {p.distanceText}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Section>
//     </div>
//   );
// }

// /* ---------- REUSABLE ---------- */

// function Section({ title, children }) {
//   return (
//     <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//       <h2 className="text-2xl font-bold mb-6">{title}</h2>
//       {children}
//     </div>
//   );
// }

// function InfoCard({ icon, label, children }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-xl flex gap-3 items-center">
//       <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
//         {icon}
//       </div>
//       <div>
//         <p className="text-sm text-slate-500">{label}</p>
//         <p className="font-bold">{children}</p>
//       </div>
//     </div>
//   );
// }

// function Tag({ label }) {
//   return (
//     <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
//       {label}
//     </span>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <div className="flex justify-between text-sm py-1">
//       <span className="text-slate-600">{label}</span>
//       <span className="font-semibold">{value}</span>
//     </div>
//   );
// }





// src/pages/FeaturedProperties/FeaturedPropertyDetails.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  ArrowLeft,
  Phone,
  User,
  TrendingUp,
  Eye,
  Star,
  BadgeCheck,
  Layers,
  Clock,
  GripVertical,
  ChevronRight,
  Bed,
  Trees,
  ShieldCheck,
  CreditCard,
  Youtube,
  Download,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
  Navigation,
  AlertCircle,
  Hash,
} from "lucide-react";
import { projectAnalytics } from "../../features/property/propertyService";
import { fetchFeaturedProperties } from "../../services/PropertyService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Fallback from "../../assets/fallback.svg";

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const getYouTubeEmbedId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const nearbyTypeLabel = {
  supermarket: "Supermarket",
  restaurant: "Restaurant",
  educational_institution: "School / College",
  hospital: "Hospital",
  station: "Station",
  primary: "Road",
  secondary: "Road",
  residential: "Residential Area",
  apartments: "Mall / Apartments",
  yes: "Landmark",
};

const promotionColor = {
  featured: "bg-amber-100 text-amber-700 border-amber-200",
  prime: "bg-purple-100 text-purple-700 border-purple-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 p-5 border-b border-slate-50">
      <div className="p-2 rounded-xl bg-[#27AE60]/10">
        <Icon className="w-4 h-4 text-[#27AE60]" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "green" }) {
  const ring = {
    green: "bg-green-50 text-[#27AE60] border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ring[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-700 mt-1 capitalize">{String(value)}</p>
    </div>
  );
}

function LeadRow({ lead, index }) {
  const badge = {
    new: "bg-green-100 text-green-700",
    contacted: "bg-blue-100 text-blue-700",
    closed: "bg-slate-100 text-slate-600",
    converted: "bg-purple-100 text-purple-700",
  };
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 text-xs text-slate-400 font-mono">{index + 1}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-[#27AE60]" />
          </div>
          <span className="text-sm font-semibold text-slate-700">{lead.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Phone className="w-3.5 h-3.5 text-[#27AE60] flex-shrink-0" />
          {lead.phone}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${badge[lead.status] || "bg-slate-100 text-slate-600"}`}>
          {lead.status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
        {formatDateTime(lead.createdAt)}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // ── Fetch property list → find by :id ───────────────────────────────────
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["featuredProperties"],
    queryFn: fetchFeaturedProperties,
  });

  const property = listData?.items?.find((p) => p._id === id) || null;
  console.log("PROPERTY =>", property);

  if (property) {
    console.log("PROPERTY =>", property?.createdBy);
  }
  

  // ── Fetch analytics (leads) ──────────────────────────────────────────────
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useQuery({
    queryKey: ["projectAnalytics", id],
    queryFn: () => projectAnalytics(id),
    enabled: !!id,
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (listLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-12 h-12 text-red-300" />
        <p className="text-slate-600 font-medium">Property not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#27AE60] underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const isLand = property.categoryType === "land";
  const images = [
    ...(property.heroImage ? [{ url: property.heroImage, title: "Hero" }] : []),
    ...(property.gallerySummary || []),
  ];
  const displayImage = images[activeImage]?.url || Fallback;

  const priceFrom =
    typeof property.priceFrom === "number" ? formatPrice(property.priceFrom) : "N/A";
  const priceTo =
    typeof property.priceTo === "number" ? formatPrice(property.priceTo) : "N/A";
  const status = property.status === "active" ? "Active" : "Inactive";
  const promotionType = property.promotion?.type || "normal";

  // Analytics - safely extract leads from any API response shape
  const extractLeads = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === "object") return extractLeads(raw.data);
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.leads)) return raw.leads;
    return [];
  };
  const leads = extractLeads(analyticsData);
  const totalLeads = typeof analyticsData?.count === "number" ? analyticsData.count : leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const views = property.meta?.views ?? 0;
  const clicks = property.meta?.clicks ?? 0;

  // Tabs
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "units", label: isLand ? "Plots" : "Units" },
    { key: "amenities", label: "Amenities" },
    { key: "nearby", label: "Nearby" },
    { key: "specs", label: "Specifications" },
    { key: "leads", label: `Leads (${totalLeads})` },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* ── BREADCRUMB ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#27AE60] hover:text-green-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Prime Projects
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-700 font-medium line-clamp-1 max-w-xs">
          {property.title || "Property Details"}
        </span>
      </div>

      {/* ── HERO PANEL ──────────────────────────────────────────────────── */}
      <SectionCard>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* IMAGE COLUMN */}
          <div className="lg:col-span-2 relative">
            <div className="h-64 sm:h-80 lg:h-full min-h-[300px] bg-slate-100 relative overflow-hidden">
              <img
                src={displayImage}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  e.target.src = Fallback;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Status + Promotion badges */}
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${
                    status === "Active"
                      ? "bg-[#27AE60] text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {status}
                </span>
                {promotionType !== "normal" && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${promotionColor[promotionType]}`}
                  >
                    ★ {promotionType}
                  </span>
                )}
              </div>

              {/* Rank badge */}
              {property.rank != null && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#27AE60] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  <GripVertical className="w-3 h-3" />#{property.rank}
                </div>
              )}

              {/* Logo */}
              {property.logo?.url && (
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden bg-white shadow border">
                  <img
                    src={property.logo.url}
                    alt="logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-[#27AE60] scale-105"
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = Fallback;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* META COLUMN */}
          <div className="lg:col-span-3 p-6 flex flex-col gap-4">
            {/* Title + address */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                {property.title || "Untitled Project"}
              </h1>
              <div className="flex items-start gap-1.5 text-sm text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                <span>
                  {[
                    property.address,
                    property.locality,
                    property.city,
                    property.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>

            {/* Price banner */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <p className="text-[11px] font-bold text-[#27AE60] uppercase tracking-widest">
                Price Range
              </p>
              <p className="text-2xl font-extrabold text-[#27AE60] mt-1">
                {priceFrom}{" "}
                <span className="text-slate-300 font-normal text-xl">–</span>{" "}
                {priceTo}
              </p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetaItem
                label="Property Type"
                value={property.propertyType?.replace(/-/g, " ")}
              />
              <MetaItem label="Category" value={property.categoryType} />
              <MetaItem label="Total Units" value={property.totalUnits} />
              <MetaItem
                label="Available Units"
                value={property.availableUnits}
              />
              {property.totalTowers > 0 && (
                <MetaItem label="Towers" value={property.totalTowers} />
              )}
              {property.totalFloors && (
                <MetaItem label="Floors" value={property.totalFloors} />
              )}
              {property.projectArea && (
                <MetaItem
                  label="Project Area (acres)"
                  value={property.projectArea}
                />
              )}
              <MetaItem
                label="Possession"
                value={formatDate(property.possessionDate)}
              />
            </div>

            {/* RERA */}
            <div className="flex flex-wrap gap-2 items-center">
              {property.reraNumber && (
                <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RERA: {property.reraNumber}
                </div>
              )}
              {property.slug && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 text-slate-500 border px-3 py-1.5 rounded-full">
                  <Hash className="w-3 h-3" />
                  {property.slug}
                </div>
              )}
            </div>

            {/* Banks approved */}
            {Array.isArray(property.banksApproved) &&
              property.banksApproved.length > 0 && (
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Banks Approved
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.banksApproved.map((b, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-1">
              <button
                onClick={() => navigate(`/post-property/${property._id}`)}
                className="flex-1 text-sm font-bold py-2.5 rounded-xl bg-[#27AE60] text-white hover:bg-green-700 transition shadow"
              >
                Edit Property
              </button>
              {property.brochure?.url && (
                <a
                  href={property.brochure.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <Download className="w-4 h-4" />
                  Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── ANALYTICS STATS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Total Leads"
          value={totalLeads}
          color="green"
        />
        <StatCard
          icon={Star}
          label="New Leads"
          value={newLeads}
          color="orange"
        />
        <StatCard
          icon={BadgeCheck}
          label="Contacted"
          value={contactedLeads}
          color="blue"
        />
        <StatCard icon={Eye} label="Page Views" value={views} color="purple" />
      </div>

      {/* ── PROMOTION DETAILS ────────────────────────────────────────────── */}
      {property.promotion && promotionType !== "normal" && (
        <SectionCard>
          <SectionHeader icon={Zap} title="Promotion Details" />
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaItem label="Type" value={property.promotion.type} />
            <MetaItem label="Priority" value={property.promotion.priority} />
            <MetaItem label="Source" value={property.promotion.source} />
            <MetaItem
              label="Start Date"
              value={formatDate(property.promotion.startDate)}
            />
            <MetaItem
              label="Boost Expiry"
              value={formatDate(property.promotion.boostExpiry)}
            />
            <MetaItem
              label="Enquiry Limit"
              value={property.promotion.enquiryLimit || "Unlimited"}
            />
            <MetaItem
              label="Enquiries Used"
              value={property.promotion.enquiriesUsed}
            />
          </div>
        </SectionCard>
      )}

      {/* ── TABBED SECTION ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.key
                  ? "border-[#27AE60] text-[#27AE60] bg-green-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── TAB: OVERVIEW ─────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* About summary */}
              {Array.isArray(property.aboutSummary) &&
                property.aboutSummary.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#27AE60]" />
                      About This Project
                    </h3>
                    {property.aboutSummary.map((ab, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
                      >
                        {ab.url && (
                          <img
                            src={ab.url}
                            alt="about"
                            className="w-full h-44 object-cover rounded-xl border border-slate-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div>
                          {ab.aboutDescription && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {ab.aboutDescription}
                            </p>
                          )}
                          {ab.rightContent && (
                            <div
                              className="text-sm text-slate-600 leading-relaxed mt-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: ab.rightContent,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Hero taglines */}
              {(property.heroTagline || property.heroDescription) && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-1">
                  {property.heroTagline && (
                    <p className="text-sm font-bold text-[#27AE60]">
                      {property.heroTagline}
                    </p>
                  )}
                  {property.heroSubTagline && (
                    <p className="text-xs text-slate-500">
                      {property.heroSubTagline}
                    </p>
                  )}
                  {property.heroDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {property.heroDescription}
                    </p>
                  )}
                </div>
              )}

              {/* YouTube videos */}
              {Array.isArray(property.youtubeVideos) &&
                property.youtubeVideos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      Videos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {property.youtubeVideos.map((v, i) => {
                        const vid = getYouTubeEmbedId(v.url);
                        return vid ? (
                          <div
                            key={i}
                            className="rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${vid}`}
                              title={v.title || "Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-44"
                            />
                            {v.title && (
                              <p className="text-xs text-slate-600 font-semibold px-3 py-2 bg-slate-50">
                                {v.title}
                              </p>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

              {/* Created by */}
              {/* {property.createdBy && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Created By
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {property.createdBy?.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.email}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.state}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.city}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.locality}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.createdBy?.pincode}
                  </p>
                </div>
              )} */}
              {/* ── ULTRA SMALL CREATED BY CARD ───────────────────────── */}
{property?.createdBy && (
  <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">

    {/* Mini Header */}
    <div className="h-10 bg-gradient-to-r from-[#27AE60] to-emerald-500 relative">
      <div className="absolute -bottom-3 left-2">
        <div className="w-7 h-7 rounded-md border-2 border-white bg-white flex items-center justify-center shadow">
          <User className="w-3 h-3 text-[#27AE60]" />
        </div>
      </div>
    </div>

    <div className="pt-4 p-2">

      {/* Name */}
      <div className="mb-2">
        <h3 className="text-[12px] font-bold text-slate-800 leading-none">
          {property.createdBy?.name || "Unknown"}
        </h3>

        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <span className="px-1.5 py-[2px] rounded bg-green-50 text-[#27AE60] text-[8px] font-bold border border-green-100">
            Creator
          </span>

          <span className="text-[8px] text-slate-400">
            {property.createdBy?._id?.slice(-4)}
          </span>
        </div>
      </div>

      {/* Mini Grid */}
      <div className="grid grid-cols-2 gap-1.5">

        {/* Email */}
        {property.createdBy?.email && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              Email
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-50 flex items-center justify-center">
                <User className="w-2 h-2 text-blue-600" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.email}
              </p>
            </div>
          </div>
        )}

        {/* Phone */}
        {property.createdBy?.phone && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              Phone
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-50 flex items-center justify-center">
                <Phone className="w-2 h-2 text-[#27AE60]" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.phone}
              </p>
            </div>
          </div>
        )}

        {/* State */}
        {property.createdBy?.state && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              State
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-orange-50 flex items-center justify-center">
                <MapPin className="w-2 h-2 text-orange-600" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.state}
              </p>
            </div>
          </div>
        )}

        {/* City */}
        {property.createdBy?.city && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              City
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-purple-50 flex items-center justify-center">
                <Navigation className="w-2 h-2 text-purple-600" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.city}
              </p>
            </div>
          </div>
        )}

        {/* Locality */}
        {property.createdBy?.locality && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              Locality
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-pink-50 flex items-center justify-center">
                <Layers className="w-2 h-2 text-pink-600" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.locality}
              </p>
            </div>
          </div>
        )}

        {/* Pincode */}
        {property.createdBy?.pincode && (
          <div className="bg-slate-50 border border-slate-100 rounded-md p-1.5">
            <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">
              PIN
            </p>

            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-cyan-50 flex items-center justify-center">
                <Hash className="w-2 h-2 text-cyan-600" />
              </div>

              <p className="text-[9px] font-semibold text-slate-700 truncate">
                {property.createdBy.pincode}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[8px] text-slate-400">
          <BadgeCheck className="w-2.5 h-2.5 text-[#27AE60]" />
          Verified
        </div>

        <div className="text-[8px] text-slate-400">
          {formatDate(property.createdBy?.createdAt)}
        </div>
      </div>
    </div>
  </div>
)}
             
            </div>
          )}

          {/* ── TAB: UNITS / PLOTS ─────────────────────────────────────── */}
          {activeTab === "units" && (
            <div className="space-y-4">
              {Array.isArray(property.projectSummary) &&
              property.projectSummary.length > 0 ? (
                property.projectSummary.map((group, gi) => (
                  <div
                    key={gi}
                    className="border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    {/* Group header */}
                    <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                      {isLand ? (
                        <Trees className="w-4 h-4 text-[#27AE60]" />
                      ) : (
                        <Bed className="w-4 h-4 text-[#27AE60]" />
                      )}
                      <span className="text-sm font-bold text-[#27AE60]">
                        {group.label ||
                          (group.bhk > 0 ? `${group.bhk} BHK` : "Plot")}
                      </span>
                    </div>

                    {/* Units */}
                    <div className="divide-y divide-slate-50">
                      {(group.units || []).map((unit, ui) => (
                        <div
                          key={ui}
                          className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start"
                        >
                          {/* Floor plan image */}
                          {unit.plan?.url && (
                            <div className="sm:row-span-2">
                              <img
                                src={unit.plan.url}
                                alt="Floor plan"
                                className="w-full h-36 object-cover rounded-xl border border-slate-100"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 col-span-1 lg:col-span-2">
                            {isLand ? (
                              <>
                                {unit.area?.value > 0 && (
                                  <MetaItem
                                    label="Area"
                                    value={`${unit.area.value} ${unit.area.unit} (${unit.area.sqftValue?.toLocaleString()} sq.ft)`}
                                  />
                                )}
                                <MetaItem
                                  label="Min Price"
                                  value={
                                    unit.minPrice
                                      ? formatPrice(unit.minPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Max Price"
                                  value={
                                    unit.maxPrice
                                      ? formatPrice(unit.maxPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Available"
                                  value={unit.availableCount}
                                />
                              </>
                            ) : (
                              <>
                                {unit.minSqft > 0 && (
                                  <MetaItem
                                    label="Size Range"
                                    value={`${unit.minSqft} – ${unit.maxSqft} sq.ft`}
                                  />
                                )}
                                <MetaItem
                                  label="Min Price"
                                  value={
                                    unit.minPrice
                                      ? formatPrice(unit.minPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Max Price"
                                  value={
                                    unit.maxPrice
                                      ? formatPrice(unit.maxPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Available"
                                  value={unit.availableCount}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No unit data available.
                </p>
              )}
            </div>
          )}

          {/* ── TAB: AMENITIES ─────────────────────────────────────────── */}
          {activeTab === "amenities" && (
            <div>
              {Array.isArray(property.amenities) &&
              property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-sm bg-green-50 text-[#27AE60] border border-green-100 px-3 py-1.5 rounded-full font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {a.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No amenities listed.
                </p>
              )}
            </div>
          )}

          {/* ── TAB: NEARBY ────────────────────────────────────────────── */}
          {activeTab === "nearby" && (
            <div className="space-y-2">
              {Array.isArray(property.nearbyPlaces) &&
              property.nearbyPlaces.length > 0 ? (
                property.nearbyPlaces.map((place, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-green-50/50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-[#27AE60]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                        {place.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {nearbyTypeLabel[place.type] || place.type}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-[#27AE60] bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                      {place.distanceText}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No nearby places listed.
                </p>
              )}
            </div>
          )}

          {/* ── TAB: SPECIFICATIONS ────────────────────────────────────── */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              {Array.isArray(property.specifications) &&
              property.specifications.length > 0 ? (
                property.specifications.map((spec, si) => (
                  <div
                    key={si}
                    className="border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-700">
                        {spec.category}
                      </p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {(spec.items || []).map((item, ii) => (
                        <div key={ii} className="px-4 py-3 flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No specifications available.
                </p>
              )}
            </div>
          )}

          {/* ── TAB: LEADS ─────────────────────────────────────────────── */}
          {activeTab === "leads" && (
            <div>
              {analyticsError && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Failed to load leads data.
                </div>
              )}
              {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
                  <User className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">
                    No leads yet for this project
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {["#", "Name", "Phone", "Status", "Date"].map((h) => (
                            <th
                              key={h}
                              className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, i) => (
                          <LeadRow key={lead._id || i} lead={lead} index={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      Total:{" "}
                      <span className="font-bold text-slate-600">
                        {leads.length}
                      </span>
                    </span>
                    <div className="flex gap-4">
                      <span>
                        New:{" "}
                        <span className="font-bold text-green-600">
                          {newLeads}
                        </span>
                      </span>
                      <span>
                        Contacted:{" "}
                        <span className="font-bold text-blue-600">
                          {contactedLeads}
                        </span>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RECORD META ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Clock} title="Record Info" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Property ID
            </p>
            <p className="font-mono text-xs text-slate-500 mt-1 break-all">
              {property._id}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Created At
            </p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {formatDate(property.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Last Updated
            </p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {formatDate(property.updatedAt)}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}