

// src/pages/Agricultural/AgriculturalDetails.jsx

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  ArrowLeft,
  MapPin,
  Building2,
  Ruler,
  Droplets,
  Zap,
  Shield,
  Car,
  Share2,
  Heart,
  Phone,
  Mail,
  Download,
  Eye,
  Calendar,
  IndianRupee,
  Navigation,
  CheckCircle,
  Info,
} from "lucide-react";

import { fetchAgricultural } from "../../services/propertyservice"; 
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getContrastTextColor } from "../../utils/colorUtils";
import { formatPrice } from "../../utils/formatters";

export default function AgriculturalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [colors] = useState({
    primary: "#ff6600",
    title: "#ff6600",
    icon: "#3b82f6",
    priceCard: "#10b981",
    specCard: "#8b5cf6",
    button: "#ef4444",
    amenity: "#f59e0b",
  });

  const query = useQuery({
    queryKey: ["agricultural", id],
    queryFn: () => fetchAgricultural(id),
  });

  const property = useMemo(() => {
    const data = query.data;
    if (!data) return null;
    if (data._id) return data;
    if (Array.isArray(data.items)) {
      return data.items.find((p) => String(p._id) === String(id)) || null;
    }
    return null;
  }, [query.data, id]);

  const safeText = (v, fallback = "N/A") =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "")
      ? fallback
      : v;

  const safeNumber = (v) => (isNaN(Number(v)) ? null : Number(v));

  if (query.isLoading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (query.isError || !property)
    return (
      <div className="text-center py-20">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Agricultural Land Not Found</h2>
        <button
          onClick={() => navigate("/agricultural")}
          className="text-blue-600 underline mt-3"
        >
          Go Back
        </button>
      </div>
    );

  const heroImage = property.gallery?.[0]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef";
  const allImages = property.gallery?.length ? property.gallery.map((img) => img.url) : [heroImage];

  const totalArea = property.totalArea
    ? `${property.totalArea.value} ${property.totalArea.unit}`
    : "N/A";

  const displayPrice = property.price
    ? `${formatPrice(property.price)}`
    : "Price On Request";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full border-2 transition-all ${
              isLiked
                ? "bg-red-50 border-red-500 text-red-500"
                : "bg-white border-slate-200 text-slate-600 hover:border-red-300"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </button>
          <button className="p-3 rounded-full border-2 bg-white border-slate-200 text-slate-600 hover:border-blue-300 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT - GALLERY */}
        <div className="lg:col-span-2 animate-slide-in-left">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative h-96 lg:h-[500px] overflow-hidden group">
              <img
                src={allImages[selectedImageIndex]}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={property.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedImageIndex + 1} / {allImages.length}
                </span>
              </div>
              <div
                className="absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-md text-white font-semibold shadow-lg animate-slide-in-left"
                style={{ backgroundColor: `${colors.primary}dd` }}
              >
                {safeText(property.propertyType, "Agricultural Land")}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-24 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                        selectedImageIndex === idx
                          ? "ring-4 ring-offset-2 ring-orange-500 scale-105"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`thumb-${idx}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - Quick Info */}
        <div className="lg:col-span-1 space-y-4 animate-slide-in-right">
          {/* PRICE CARD */}
          <div
            className="bg-white rounded-3xl shadow-xl p-6 border-2 relative overflow-hidden"
            style={{ borderColor: colors.priceCard }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: colors.priceCard }}
            />
            <div className="relative">
              <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-2">
                <IndianRupee className="w-5 h-5" style={{ color: colors.priceCard }} />
                Land Price
              </p>
              <p className="text-4xl font-bold mb-2" style={{ color: colors.priceCard }}>
                {displayPrice}
              </p>
              <p className="text-xs text-slate-500 mt-1">+ Taxes & Charges</p>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Specifications</h3>

            <QuickSpecItem
              icon={<Ruler className="w-5 h-5" />}
              label="Total Area"
              value={totalArea}
              color={colors.icon}
            />

            {property.roadWidth && (
              <QuickSpecItem
                icon={<Car className="w-5 h-5" />}
                label="Road Width"
                value={`${property.roadWidth.value} ${property.roadWidth.unit}`}
                color={colors.icon}
              />
            )}

            {property.soilType && (
              <QuickSpecItem
                icon={<Building2 className="w-5 h-5" />}
                label="Soil Type"
                value={safeText(property.soilType).replace(/-/g, " ")}
                color={colors.icon}
              />
            )}

            {property.irrigationType && (
              <QuickSpecItem
                icon={<Droplets className="w-5 h-5" />}
                label="Irrigation"
                value={safeText(property.irrigationType).replace(/-/g, " ")}
                color={colors.icon}
              />
            )}

            {property.numberOfBorewells && (
              <QuickSpecItem
                icon={<Zap className="w-5 h-5" />}
                label="Borewells"
                value={property.numberOfBorewells}
                color={colors.icon}
              />
            )}
          </div>

          {/* Contact Buttons */}
          <div className="space-y-3">
            <button
              className="w-full py-4 rounded-2xl shadow-lg font-semibold"
              style={{
                backgroundColor: colors.button,
                color: getContrastTextColor(colors.button),
              }}
            >
              <Phone className="w-5 h-5 inline-block mr-2" />
              Contact Owner
            </button>
            <button
              className="w-full py-4 rounded-2xl border-2 bg-white font-semibold"
              style={{
                borderColor: colors.button,
                color: colors.button,
              }}
            >
              <Mail className="w-5 h-5 inline-block mr-2" />
              Send Inquiry
            </button>
          </div>
        </div>
      </div>

      {/* TITLE + LOCATION */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4" style={{ color: colors.title }}>
          {safeText(property.title, "Untitled Agricultural Land")}
        </h1>

        <div className="flex items-start gap-2 text-slate-600 mb-4">
          <MapPin className="w-6 h-6 mt-1" style={{ color: colors.icon }} />
          <div>
            <p className="text-lg">{safeText(property.address)}</p>
            <p className="text-sm text-slate-500">
              {safeText(property.city)}, {safeText(property.state)} - {safeText(property.pincode)}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {property.propertyType && <Tag label={property.propertyType} color={colors.primary} delay="0s" />}
          {property.propertySubType && <Tag label={property.propertySubType} color={colors.specCard} delay="0.1s" />}
          {property.landShape && <Tag label={property.landShape} color={colors.amenity} delay="0.2s" />}
          {property.boundaryWall && <Tag label="Boundary Wall" color={colors.icon} delay="0.3s" />}
          {property.electricityConnection && <Tag label="Electricity" color={colors.priceCard} delay="0.4s" />}
        </div>
      </div>

      {/* DETAILED SPECIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-left">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
            <Ruler className="w-7 h-7" />
            Land & Irrigation
          </h2>
          <div className="space-y-4">
            <DetailRow label="Total Area" value={totalArea} />
            <DetailRow label="Land Shape" value={safeText(property.landShape)} />
            <DetailRow label="Soil Type" value={safeText(property.soilType).replace(/-/g, " ")} />
            <DetailRow label="Current Crop" value={safeText(property.currentCrop)} />
            <DetailRow label="Suitable For" value={safeText(property.suitableFor)} />
            <DetailRow label="Irrigation Type" value={safeText(property.irrigationType).replace(/-/g, " ")} />
            <DetailRow label="Water Source" value={safeText(property.waterSource)} />
            <DetailRow label="Access Road Type" value={safeText(property.accessRoadType)} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-in-right">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
            <Zap className="w-7 h-7" />
            Facilities & Legal
          </h2>
          <div className="space-y-4">
            <DetailRow label="Boundary Wall" value={property.boundaryWall ? "Yes" : "No"} />
            <DetailRow label="Electricity Connection" value={property.electricityConnection ? "Yes" : "No"} />
            <DetailRow label="Number of Borewells" value={safeText(property.numberOfBorewells)} />
            {property.borewellDetails && (
              <>
                <DetailRow label="Borewell Depth" value={`${safeText(property.borewellDetails.depthMeters)} meters`} />
                <DetailRow label="Yield" value={`${safeText(property.borewellDetails.yieldLpm)} LPM`} />
                <DetailRow label="Drilled Year" value={safeText(property.borewellDetails.drilledYear)} />
              </>
            )}
            <DetailRow label="Purchase Restrictions" value={safeText(property.statePurchaseRestrictions)} />
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      {property.description && (
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
            <Info className="w-7 h-7" />
            About This Land
          </h2>
          <p className="text-slate-700 text-lg leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* PROPERTY INSIGHTS */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.title }}>
          <Eye className="w-7 h-7" />
          Property Insights
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
            <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-blue-600">{property.meta?.views || 0}</p>
            <p className="text-sm text-slate-600 mt-1">Views</p>
          </div>

          <div className="text-center p-4 rounded-2xl bg-green-50 border-2 border-green-200">
            <Phone className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold text-green-600">{property.meta?.inquiries || 0}</p>
            <p className="text-sm text-slate-600 mt-1">Inquiries</p>
          </div>

          <div className="text-center p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-bold text-purple-600">
              {new Date(property.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-600 mt-1">Listed On</p>
          </div>

          <div className="text-center p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm font-bold text-orange-600 capitalize">
              {property.status || "Active"}
            </p>
            <p className="text-sm text-slate-600 mt-1">Status</p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            label="Contact Owner"
            icon={<Phone className="w-6 h-6 inline-block mr-2" />}
            bg={colors.button}
          />
          <ActionButton
            label="Download Details"
            icon={<Download className="w-6 h-6 inline-block mr-2" />}
            border={colors.button}
          />
          <ActionButton
            label="Email Inquiry"
            icon={<Mail className="w-6 h-6 inline-block mr-2" />}
            border={colors.icon}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-50px);} to{opacity:1;transform:translateX(0);} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(50px);} to{opacity:1;transform:translateX(0);} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3);} 50%{opacity:1;transform:scale(1.05);} 100%{transform:scale(1);} }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-in-left { animation: slideInLeft 0.7s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.7s ease-out; }
        .animate-bounce-in { animation: bounceIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}

// Reusable Components (same as Residential)
function QuickSpecItem({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Tag({ label, color, delay }) {
  return (
    <span
      className="px-4 py-2 rounded-full text-sm font-medium animate-bounce-in capitalize"
      style={{ backgroundColor: `${color}20`, color, animationDelay: delay }}
    >
      {label?.replace(/-/g, " ")}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-semibold capitalize text-slate-800">{value || "N/A"}</span>
    </div>
  );
}

function ActionButton({ label, icon, bg, border }) {
  if (bg)
    return (
      <button
        className="p-6 rounded-2xl shadow-lg font-semibold hover:shadow-xl transition-all hover:-translate-y-1"
        style={{ backgroundColor: bg, color: getContrastTextColor(bg) }}
      >
        {icon}
        {label}
      </button>
    );

  return (
    <button
      className="p-6 rounded-2xl border-2 font-semibold hover:shadow-lg transition-all bg-white hover:-translate-y-1"
      style={{ borderColor: border, color: border }}
    >
      {icon}
      {label}
    </button>
  );
}