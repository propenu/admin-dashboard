
// Amenities.jsx
import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Check, Search } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

/* ─── Amenity Data by Category & Property Type ───────────────── */

const AMENITIES = {
  residential: [
    {
      category: "Sports",
      items: ["Gym", "Swimming Pool", "Jogging Track", "Kid's Play Area"],
    },
    {
      category: "Convenience",
      items: ["Elevator", "Power Backup", "Club House", "Visitor Parking"],
    },
    {
      category: "Safety",
      items: [
        "24x7 Security",
        "CCTV Video Surveillance",
        "Fire Fighting Systems",
        "Video Intercom",
      ],
    },
    {
      category: "Environment",
      items: ["Park", "Rain Water Harvesting", "Solar Lighting"],
    },
  ],

  commercial: [
    {
      category: "Sports",
      items: ["Gym", "Swimming Pool"],
    },
    {
      category: "Convenience",
      items: [
        "Elevator",
        "Power Backup",
        "Visitor Parking",
        "ATMs",
        "AC Waiting Lobby",
        "Parking",
        "Valet Parking",
        "Podium Parking",
        "Multi Level Parking",
        "Front Desk Service",
        "Centralized AC",
        "24x7 Water Supply",
        "Separate Entry or Exit Gates",
        "Automatic Boom Barriers",
        "Cafe or Coffee Bar",
      ],
    },
    {
      category: "Safety",
      items: [
        "24x7 Security",
        "CCTV Video Surveillance",
        "Fire Fighting Systems",
        "Smoke or Heat Sensors",
        "Smart Card Access",
        "Emergency Rescue Alarms",
      ],
    },
    {
      category: "Environment",
      items: ["Solar Lighting", "IGBC Certified Building"],
    },
  ],

  land: [
    {
      category: "Land",
      items: ["24x7 Water Supply"],
    },
    {
      category: "Water",
      items: ["Borewell Open Well"],
    },
    {
      category: "Power",
      items: ["Electricity Connection", "Solar Power Provision"],
    },
    {
      category: "Connectivity",
      items: ["Near Highway", "Close to Village"],
    },
    {
      category: "Safety",
      items: ["CCTV Video Surveillance"],
    },
  ],

  agricultural: [
    {
      category: "Land",
      items: ["Levelled or Semi-Levelled Land"],
    },
    {
      category: "Water",
      items: [
        "River Harvesting System",
        "Drip Irrigation Facility",
        "Sprinkler Irrigation System",
        "Canal River Water Access",
      ],
    },
    {
      category: "Power",
      items: [
        "Water Pump Set",
        "Solar Power Provision",
        "Electricity Connection",
      ],
    },
    {
      category: "Infrastructure",
      items: [
        "Cattle Shed",
        "Motor Shed",
        "Greenhouse",
        "Watchman Room",
        "Toilets and Wash Area",
      ],
    },
    {
      category: "Safety",
      items: ["CCTV Video Surveillance"],
    },
  ],
};

/* ─── Component ───────────────────────────────────────────────── */

const Amenities = ({ error }) => {
  const { form, toggleArrayValue, activeCategory } = useActivePropertySlice();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const categoryGroups = AMENITIES[activeCategory] || AMENITIES.residential;

  const filteredGroups = search.trim()
    ? categoryGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) =>
            item.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : categoryGroups;

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = form.amenities || [];
  const selectedCount = selected.length;

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Amenities</p>
        {selectedCount > 0 && (
          <span className="text-[11px] font-bold text-[#27AE60] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Trigger box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full border-2 rounded-xl px-3.5 py-3 min-h-[50px] flex flex-wrap gap-1.5 items-center cursor-pointer bg-white transition-all duration-150 ${
          error
            ? "border-red-300"
            : isOpen
            ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
            : "border-[#e5e7eb] hover:border-[#bbf7d0]"
        }`}
      >
        {selectedCount > 0 ? (
          <>
            {selected.slice(0, 4).map((item) => (
              <span
                key={item.key || item.title}
                className="bg-[#f0fdf4] text-[#27AE60] text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
              >
                {item.title}
                <X
                  size={10}
                  className="cursor-pointer hover:text-red-500 transition-colors flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArrayValue("amenities", item.title);
                  }}
                />
              </span>
            ))}
            {selectedCount > 4 && (
              <span className="text-xs font-bold text-[#9ca3af] px-1">
                +{selectedCount - 4} more
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-[#9ca3af] font-medium">
            Select amenities...
          </span>
        )}
        <ChevronDown
          size={15}
          className={`ml-auto flex-shrink-0 text-[#9ca3af] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="relative z-50 w-full bg-white border border-[#e5e7eb] rounded-xl shadow-2xl overflow-hidden">
          {/* Search bar */}
          <div className="px-3 py-2.5 border-b border-[#f0f0f0] bg-white">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
              <Search size={13} className="text-[#9ca3af] flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search amenities..."
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-[#c9c9c9] text-[#111827] font-medium"
              />
              {search && (
                <X
                  size={12}
                  className="text-[#9ca3af] cursor-pointer hover:text-[#374151] flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setSearch(""); }}
                />
              )}
            </div>
          </div>

          {/* Category-grouped list */}
          <div className="max-h-72 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#9ca3af] font-medium">
                No amenities match "{search}"
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.category}>
                  <div className="px-4 py-2 bg-[#f9fafb] border-y border-[#f0f0f0]">
                    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                      {group.category}
                    </p>
                  </div>
                  {group.items.map((name) => {
                    const isSelected = selected.some((a) => a.title === name);
                    return (
                      <div
                        key={name}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleArrayValue("amenities", name);
                        }}
                        className={`px-4 py-2.5 flex justify-between items-center cursor-pointer border-b border-[#f9f9f9] last:border-none transition-colors hover:bg-[#f0fdf4] ${
                          isSelected ? "bg-[#f0fdf4]" : ""
                        }`}
                      >
                        <span className={`text-sm ${isSelected ? "text-[#27AE60] font-bold" : "text-[#374151] font-medium"}`}>
                          {name}
                        </span>
                        {isSelected && <Check size={14} className="text-[#27AE60] flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {selectedCount > 0 && (
            <div className="px-4 py-3 border-t border-[#f0f0f0] bg-[#f9fafb] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6b7280]">
                {selectedCount} amenit{selectedCount === 1 ? "y" : "ies"} selected
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Clear all by updating each one — parent toggle handles it
                  // For a direct clear, use updateFieldValue if available
                }}
                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default Amenities;