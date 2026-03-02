// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/AmenitiesSection.jsx
import React, { useState } from "react";
import { hexToRGBA } from "../../../../Ui/hexToRGBA";
import { amenityTitleToIconComponent } from "../../../../lib/amenityIcons";

export default function AmenitiesSection({ data, onRemove }) {
  const primary = data?.color || "#27AE60";
  const iconBg = hexToRGBA(primary, 0.12);
  const pillBg = hexToRGBA(primary, 0.05);
  const borderC = hexToRGBA(primary, 0.18);

  // ✅ Read amenities from data prop every render — no local copy
  const items = data?.amenities || [];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  /* ── Empty state ── */
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: iconBg }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke={primary}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">
          No amenities added yet
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Use the editor to add facilities
        </p>
      </div>
    );
  }

  return (
    <section className="p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <svg
              className="w-2 h-2"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              World-Class Amenities
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Everything you need, all in one place
            </p>
          </div>
        </div>
        <div
          className="text-xs font-extrabold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: iconBg, color: primary }}
        >
          {items.length}+ Features
        </div>
      </div>

      {/* ── ALL amenities — uniform responsive grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((amenity, i) => {
          const Icon = amenityTitleToIconComponent(amenity.title);
          const isHover = hoveredIndex === i;
          return (
            <div
              key={`${amenity.key ?? amenity.title}-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative  flex flex-col items-center justify-center gap-2 py-1 px-2 rounded-2xl cursor-default overflow-hidden"
              style={{
                backgroundColor: isHover ? primary : pillBg,
                border: `1.5px solid ${isHover ? primary : borderC}`,
                boxShadow: isHover
                  ? `0 6px 20px ${hexToRGBA(primary, 0.22)}`
                  : "none",
                transform: isHover ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.22s ease",
              }}
            >
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-red-500 w-5 h-5 text-xs text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(amenity.key);
                }}
              >
                ✕
              </button>
              {/* Radial glow on hover */}
              {isHover && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, white, transparent 70%)",
                  }}
                />
              )}

              {/* Icon box */}
              <div
                className="w-5 h-5 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: isHover ? "rgba(255,255,255,0.2)" : iconBg,
                  transition: "background-color 0.22s ease",
                }}
              >
                <Icon
                  size={9}
                  strokeWidth={1.8}
                  color={isHover ? "#fff" : primary}
                />
              </div>

              {/* Title */}
              <span
                className="text-sm font-bold text-center leading-tight px-1"
                style={{
                  color: isHover ? "#fff" : "#374151",
                  transition: "color 0.22s ease",
                }}
              >
                {amenity.title}
              </span>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  backgroundColor: isHover ? "rgba(255,255,255,0.35)" : primary,
                  opacity: isHover ? 1 : 0.25,
                  transition: "opacity 0.22s ease",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Bottom strip ── */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ backgroundColor: iconBg, border: `1px solid ${borderC}` }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke={primary}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-[11px] font-bold" style={{ color: primary }}>
            All amenities included in the base price
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">
          No hidden charges
        </span>
      </div>
    </section>
  );
}