// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/BHKSection.jsx
import React, { useState,useEffect } from "react";

export default function BHKSection({
  data,
  ctaText = "Book a Consultation",
  onSelectBhk,
  selectedBhkIndex,
  setLivePreviewData,
}) {
  const bhkSummary = data?.bhkSummary || [];
  const primary = data?.color || "#27AE60";
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const active =
    typeof selectedBhkIndex === "number" && selectedBhkIndex < bhkSummary.length
      ? selectedBhkIndex
      : 0;
  const activeBhk = bhkSummary[active];
  const activeUnit = activeBhk?.units?.[selectedUnitIndex] || {};

  const imageSrc =
    activeUnit?.planPreview ||
    activeUnit?.plan?.url ||
    activeUnit?.floorplanUrl ||
    "/src/assets/designplat.png";

  useEffect(() => {
    setSelectedUnitIndex(0);
  }, [selectedBhkIndex]);
  const formatPrice = (p) =>
    p ? `₹${Number(p).toLocaleString("en-IN")}` : "—";

  if (!bhkSummary.length) {
    return (
      <section className="p-6 text-center text-gray-400">
        No BHK configurations added.
      </section>
    );
  }

  return (
    <section className="p-6">
      {/* BHK Tab Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {bhkSummary.map((b, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              onClick={() => {
                onSelectBhk(i);
                setSelectedUnitIndex(0);
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
              style={{
                backgroundColor: isActive ? primary : "transparent",
                borderColor: isActive ? primary : "#e5e7eb",
                color: isActive ? "#fff" : "#6b7280",
              }}
            >
              {b?.bhkLabel}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div
        className="rounded-2xl border p-5 lg:p-6"
        style={{ backgroundColor: `${primary}08`, borderColor: `${primary}20` }}
      >
        {/* Unit size sub-tabs */}
        {activeBhk?.units?.length > 1 && (
          <div
            className="flex gap-1 mb-5 border-b pb-3 overflow-x-auto"
            style={{ borderColor: `${primary}20` }}
          >
            {activeBhk.units.map((u, i) => (
              <button
                key={i}
                onClick={() => setSelectedUnitIndex(i)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  backgroundColor:
                    selectedUnitIndex === i ? primary : "transparent",
                  color: selectedUnitIndex === i ? "#fff" : "#6b7280",
                }}
              >
                {u?.minSqft} sqft
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Floorplan Image */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <img
              src={imageSrc}
              alt="Floor Plan"
              className="w-full max-h-64 object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "/src/assets/designplat.png";
              }}
            />
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: primary }}
              >
                Starting From
              </p>
              <p className="text-3xl font-black text-gray-900">
                {formatPrice(activeUnit?.maxPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: primary }}
                />
                <span className="text-sm font-semibold text-gray-800">
                  {activeBhk?.bhkLabel} Apartment
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: primary }}
                />
                <span className="text-sm text-gray-600">
                  {activeUnit?.minSqft} sqft Super Built-up Area
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: primary }}
                />
                <span className="text-sm text-gray-600">
                  Possession: {data?.possessionDate || "On Request"}
                </span>
              </div>
            </div>

            {/* Stats row */}
            {activeUnit?.availableCount && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: `${primary}12`, color: primary }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {activeUnit.availableCount} units available
              </div>
            )}

            <button
              className="w-full py-3 text-white font-bold rounded-xl text-sm transition-all hover:brightness-110 active:scale-95 shadow-md"
              style={{
                backgroundColor: primary,
                boxShadow: `0 4px 14px ${primary}40`,
              }}
            >
              {ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}