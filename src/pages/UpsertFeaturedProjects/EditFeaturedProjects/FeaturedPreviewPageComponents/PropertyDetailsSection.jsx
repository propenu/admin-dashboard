// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/PropertyDetailsSection.jsx

import React, { useState } from "react";

const PRIMARY = "#27AE60";

function getYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function PropertyDetailsSection({ data }) {
  if (!data) return null;

  const color = data.color || PRIMARY;
  const iconBg = `${color}14`;

  const videos = Array.isArray(data.youtubeVideos) ? data.youtubeVideos : [];
  const banks = Array.isArray(data.banksApproved) ? data.banksApproved : [];
  const sorted = [...videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [activeVideo, setActiveVideo] = useState(0);

  /* ── Stats config ── */
  const stats = [
    { icon: "🏗️", label: "Total Towers", value: data.totalTowers || null },
    { icon: "🏢", label: "Total Floors", value: data.totalFloors || null },
    { icon: "📐", label: "Project Area", value: data.projectArea || null },
    { icon: "🏠", label: "Total Units", value: data.totalUnits || null },
    {
      icon: "✅",
      label: "Available Units",
      value: data.availableUnits || null,
    },
    { icon: "📅", label: "Possession", value: data.possessionDate || null },
  ];

  const visibleStats = stats.filter((s) => s.value);

  const activeVid = sorted[activeVideo];
  const activeVidId = getYoutubeId(activeVid?.url);

  /* ── Empty guard ── */
  const hasContent =
    visibleStats.length > 0 ||
    data.reraNumber ||
    banks.length > 0 ||
    data.brochureUrl ||
    data.redirectUrl ||
    sorted.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: iconBg }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">
          No property details added yet
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Use the editor to add project stats and documents
        </p>
      </div>
    );
  }

  return (
    <section className="p-6 space-y-8">
      {/* ── Project Stats Grid ── */}
      {visibleStats.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: iconBg }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Project Overview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visibleStats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{ backgroundColor: iconBg, borderColor: `${color}20` }}
              >
                <span className="text-lg mb-2 block">{s.icon}</span>
                <p className="text-base font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Legal Row (RERA + Banks) ── */}
      {(data.reraNumber || banks.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* RERA */}
          {data.reraNumber && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border flex-1"
              style={{ backgroundColor: iconBg, borderColor: `${color}20` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  RERA Approved
                </p>
                <p className="text-sm font-bold font-mono" style={{ color }}>
                  {data.reraNumber}
                </p>
              </div>
            </div>
          )}

          {/* Banks */}
          {banks.length > 0 && (
            <div
              className="flex-1 px-4 py-3 rounded-2xl border"
              style={{ backgroundColor: iconBg, borderColor: `${color}20` }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                Banks Approved
              </p>
              <div className="flex flex-wrap gap-1.5">
                {banks.map((bank) => (
                  <span
                    key={bank}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CTA Buttons Row ── */}
      {(data.brochureUrl || data.redirectUrl) && (
        <div className="flex flex-wrap gap-3">
          {data.brochureUrl && (
            <a
              href={data.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all hover:brightness-95 active:scale-95"
              style={{
                borderColor: color,
                color,
                backgroundColor: `${color}10`,
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Brochure
            </a>
          )}
          {data.redirectUrl && (
            <a
              href={data.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95 shadow-md"
              style={{
                backgroundColor: color,
                boxShadow: `0 4px 14px ${color}40`,
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Visit Website
            </a>
          )}
        </div>
      )}

      {/* ── YouTube Videos ── */}
      {sorted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-50">
              <svg
                className="w-3 h-3 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Project Videos
            </span>
          </div>

          {/* Main player */}
          {activeVidId && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video mb-4">
              <iframe
                key={activeVidId}
                src={`https://www.youtube.com/embed/${activeVidId}?rel=0`}
                className="w-full h-full"
                title={activeVid?.title || "Project Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Video title + link */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-800">
                {activeVid?.title || "Project Video"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {activeVideo + 1} of {sorted.length}
              </p>
            </div>
            <a
              href={activeVid?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>
          </div>

          {/* Playlist thumbnails */}
          {sorted.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sorted.map((v, i) => {
                const vid = getYoutubeId(v.url);
                const isActive = i === activeVideo;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveVideo(i)}
                    className="group relative rounded-xl overflow-hidden border-2 transition-all text-left"
                    style={{
                      borderColor: isActive ? color : "transparent",
                      boxShadow: isActive ? `0 0 0 2px ${color}30` : "none",
                    }}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {vid ? (
                        <img
                          src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                          alt={v.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                      <div
                        className={`absolute inset-0 transition-opacity ${isActive ? "opacity-20" : "opacity-0 group-hover:opacity-20"}`}
                        style={{ backgroundColor: color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100"}`}
                          style={{
                            backgroundColor: isActive
                              ? color
                              : "rgba(0,0,0,0.6)",
                          }}
                        >
                          <svg
                            className="w-3 h-3 text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 3v18l15-9L5 3z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-2.5 py-2"
                      style={{
                        backgroundColor: isActive ? `${color}08` : "white",
                      }}
                    >
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: isActive ? color : "#374151" }}
                      >
                        {v.title || `Video ${i + 1}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
