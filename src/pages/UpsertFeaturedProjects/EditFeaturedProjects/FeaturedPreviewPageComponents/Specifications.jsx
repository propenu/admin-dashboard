// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/Specifications.jsx
import React, { useState } from "react";

const PRIMARY = "#27AE60";

export default function Specification({ specifications = [], primaryColor }) {
  const color = primaryColor || PRIMARY;
  const [activeGroup, setActiveGroup] = useState(null);

  if (!specifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${color}12` }}>
          <svg className="w-7 h-7" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">No specifications added yet</p>
        <p className="text-xs text-gray-300 mt-1">Use the editor to add construction details</p>
      </div>
    );
  }

  const sorted = [...specifications].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const visible = activeGroup === null ? sorted : sorted.filter((_, i) => i === activeGroup);

  return (
    <section className="min-h-full">
      {/* ── Tab bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 px-5 py-3 overflow-x-auto scrollbar-none">
          {/* All tab */}
          <button
            onClick={() => setActiveGroup(null)}
            className={`flex-none flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200
              ${activeGroup === null
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            style={activeGroup === null
              ? { backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }
              : {}}
          >
            All
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
              ${activeGroup === null ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"}`}>
              {sorted.reduce((a, g) => a + (g.items?.length || 0), 0)}
            </span>
          </button>

          {sorted.map((g, i) => (
            <button
              key={i}
              onClick={() => setActiveGroup(i)}
              className={`flex-none flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200
                ${activeGroup === i
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              style={activeGroup === i
                ? { backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }
                : {}}
            >
              {g.category}
              {g.items?.length !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
                  ${activeGroup === i ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {g.items.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 py-6 space-y-10">
        {visible.map((group, index) => (
          <GroupSection key={index} group={group} color={color} />
        ))}
      </div>
    </section>
  );
}

function GroupSection({ group, color }) {
  return (
    <div>
      {/* Group header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}12` }}>
          <svg className="w-4 h-4" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-800 leading-tight">{group.category}</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {group.items?.length ?? 0} specification{(group.items?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-1" />
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {group.items?.length ?? 0} items
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {group.items?.map((item, i) => (
          <SpecCard key={i} item={item} color={color} index={i} />
        ))}
      </div>
    </div>
  );
}

function SpecCard({ item, color, index }) {
  if (!item.title && !item.description) return null;

  return (
    <div
      className="group relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Top accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Ghost index number */}
      <span
        className="absolute top-3 right-3.5 text-3xl font-black opacity-[0.05] select-none leading-none"
        style={{ color }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Icon dot + title */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: color }}
        />
        <h4 className="text-sm font-bold text-gray-800 leading-snug pr-6">
          {item.title}
        </h4>
      </div>

      {item.description && (
        <p className="text-xs text-gray-500 leading-relaxed pl-4">
          {item.description}
        </p>
      )}

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-20"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}