// // frontend/admin-dashboard/src/pages/PropertyDetails.jsx
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Ruler,
  Bed,
  Layers,
  ShieldCheck,
  IndianRupee,
  Eye,
  Calendar,
  CheckCircle,
  Navigation,
} from "lucide-react";

import { fetchHighlightProjects } from "../../services/PropertyService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function HighlightProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["highlightProjects"],
    queryFn: fetchHighlightProjects,
  });

  const property = useMemo(
    () => data?.items?.find((p) => p._id === id),
    [data, id]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-16 h-16 mx-auto text-slate-300" />
        <h2 className="text-2xl font-bold mt-4">Property Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 underline mt-3"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images =
    property.gallerySummary?.length > 0
      ? property.gallerySummary.sort((a, b) => a.order - b.order)
      : [{ url: property.heroImage }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* GALLERY */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="relative h-[420px] overflow-hidden">
          <img
            src={images[selectedImage].url}
            className="w-full h-full object-cover"
            alt={property.title}
          />
          <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {selectedImage + 1} / {images.length}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 p-4 overflow-x-auto bg-slate-50">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-24 h-20 rounded-xl overflow-hidden ${
                  idx === selectedImage
                    ? "ring-4 ring-orange-500"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TITLE + LOCATION */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{property.title}</h1>

        <div className="flex items-start gap-2 text-slate-600 mb-4">
          <MapPin className="w-6 h-6 mt-1" />
          <div>
            <p className="text-lg">{property.address}</p>
            <p className="text-sm text-slate-500">{property.city}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tag label={property.status} />
          <Tag label={`RERA: ${property.reraNumber}`} />
          <Tag label={`Possession: ${property.possessionDate}`} />
        </div>
      </div>

      {/* PRICE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard icon={<IndianRupee />} label="Price Range">
          ₹ {formatPrice(property.priceFrom)} – ₹{" "}
          {formatPrice(property.priceTo)}
        </InfoCard>

        <InfoCard icon={<Building2 />} label="Units">
          {property.availableUnits} / {property.totalUnits}
        </InfoCard>

        <InfoCard icon={<Layers />} label="Project Area">
          {property.projectArea} Acres
        </InfoCard>
      </div>

      {/* BHK CONFIG */}
      <Section title="BHK Configurations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {property.bhkSummary.map((bhk, idx) => {
            const units = bhk.units;
            const minSqft = Math.min(...units.map((u) => u.minSqft));
            const maxSqft = Math.max(...units.map((u) => u.minSqft));
            const minPrice = Math.min(...units.map((u) => u.maxPrice));
            const maxPrice = Math.max(...units.map((u) => u.maxPrice));
            const totalUnits = units.reduce(
              (sum, u) => sum + u.availableCount,
              0
            );

            return (
              <div
                key={idx}
                className="p-6 border rounded-xl bg-slate-50 shadow-sm"
              >
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  {bhk.bhkLabel}
                </h3>

                <DetailRow
                  label="Size"
                  value={`${minSqft} - ${maxSqft} sqft`}
                />
                <DetailRow
                  label="Price"
                  value={`₹ ${formatPrice(minPrice)} – ₹ ${formatPrice(
                    maxPrice
                  )}`}
                />
                <DetailRow label="Available Units" value={`${totalUnits}`} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* AMENITIES */}
      <Section title="Amenities">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {property.amenities.map((a) => (
            <div
              key={a.key}
              className="p-4 text-center rounded-xl bg-slate-50 border shadow-sm"
            >
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">{a.title}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* NEARBY */}
      <Section title="Nearby Places">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.nearbyPlaces.map((p, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-xl flex gap-3 items-center"
            >
              <Navigation className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {p.type} • {p.distanceText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------- REUSABLE ---------- */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({ icon, label, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl flex gap-3 items-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-bold">{children}</p>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
      {label}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
