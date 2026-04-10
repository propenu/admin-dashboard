// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/AmenitiesEditor.jsx
import React, { useState, useMemo, useEffect } from "react";
import { updateFeaturedProperty } from "../../../../services/PostAPropertyService";
import { useParams } from "react-router-dom";

/* ── Categorised master list ── */
const AMENITIES_MASTER = {
  Safety: [
    "24 x 7 Security",
    "CCTV / Video Surveillance",
    "Fire Fighting Systems",
    "Smoke / Heat Sensors",
    "Smart Card Access",
    "Seismic Safety Compliant",
    "Video Intercom",
    "Emergency Rescue/Alarms",
  ],
  Land: ["Free from encroachments", "Levelled / semi-levelled land"],
  "Water Resources": [
    "Borewell / Open well",
    "Drip irrigation facility",
    "Sprinkler irrigation system",
    "Canal / river water access",
    "river harvesting system",
  ],
  "Power & Utilities": [
    "electricity connection",
    "Solar power provision",
    "Power Backup",
    "Water pump set",
    "Motor Shed",
  ],
  "Farm Infrastructure": ["Cattle shed", "Greenhouse"],
  Leisure: [
    "Clubhouse",
    "Indoor Games",
    "Hypermarket",
    "Restaurant",
    "Conference Room",
    "Jacuzzi",
    "Sauna",
    "Cafe / Coffee Bar",
    "Massage Room",
    "Dance Room",
    "Mini Theatre",
    "Reading Room / Library",
    "Party Hall",
    "Amphitheatre",
    "Bowling",
    "Spa",
    "Private Pool in Select Unit",
    "sky Deck",
    "Outdoor Cafes",
    "Patisseries",
    "Senior Citizen Area",
  ],
  Convenience: [
    "Power Backup",
    "Convenience store",
    "Home Automation",
    "Play school",
    "Medical Facility",
    "Pet Area",
    "Pet Friendly",
    "ATM's",
    "Gas pipeline connection",
    "AC Waiting Lobby",
    "Solar Heaters",
    "Treated Water Supply",
    "Car Washing Bays",
    "Parking",
    "Valet Parking",
    "Visitor Parking",
    "Podium Parking",
    "Multi level parking",
    "Common laundry",
    "Front desk service",
    "Centralized AC",
    "24 x 7 Water Supply",
    "Separate Entry / Exit Gates",
    "Automatic Boom Barriers",
    "Elevator",
    "Party Lawn",
  ],
  Sports: [
    "Gymnasium",
    "Swimming Pool",
    "Badminton Court",
    "Tennis Court",
    "Squash Court",
    "Kids' Play Area",
    "Football",
    "Jogging",
    "Cycle Track",
    "Golf Court",
    "Kid's Pool",
    "Cricket",
    "Basketball",
    "Volleyball",
    "Yoga Area",
    "Table Tennis",
    "Snooker / Pool",
    "Skating Rink",
    "Golf Simulator",
    "Base Ball",
    "Rugby",
    "Golf Putting green",
    "Horse Riding",
    "Go Kart/Racing Track",
    "Rappelling/Rock Climbing",
    "Gazebo",
  ],
  Environment: [
    "Rain Water Harvesting",
    "Solar Treatment Plant",
    "Park",
    "Solar Lighting",
    "IGBC Certified Building",
  ],
  "Connectivity & Access": ["Near highway", "Close to Village"],
  "Residentail & Farm Living": ["Watchman room", "Toilets & wash area"],
  Security: ["CCTV / Video Surveillance"],
};

const CAT_ICONS = {
  Sports: "🏋️",
  Convenience: "🏪",
  Leisure: "🎭",
  Safety: "🛡️",
  Environment: "🌿",
  Land: "🏞️",
  WaterResources: "💧",
  "Power & Utilities": "⚡",
  FarmInfrastructure: "🌾",
  "Connectivity & Access": "🚗",
  "Residentail & Farm Living": "🏠",
  Security: "🛡️",
};
export default function AmenitiesEditor({ formData, setFormData }) {
  const amenities = formData?.amenities || [];
  const { id }    = useParams();

  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [collapsed, setCollapsed] = useState({});

  /* Set of selected keys for O(1) lookup */
  const selectedKeys = useMemo(
    () => new Set(amenities.map((a) => a.key)),
    [amenities]
  );

  /* Expand all when search is active */
  useEffect(() => {
    if (search.trim()) setCollapsed({});
  }, [search]);

  /* Filter master list by search */
  const filteredMaster = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return AMENITIES_MASTER;
    const result = {};
    Object.entries(AMENITIES_MASTER).forEach(([cat, items]) => {
      const visible = items.filter((i) => i.toLowerCase().includes(q));
      if (visible.length) result[cat] = visible;
    });
    return result;
  }, [search]);

  /* Toggle a single amenity on/off */
 function toggleAmenity(title) {
   const normalizedTitle = title.trim().toLowerCase();
   const key = normalizedTitle.replace(/\s+/g, "-");

   setFormData((prev) => {
     const exists = prev.amenities.some((a) => a.key === key);

     if (exists) {
       return {
         ...prev,
         amenities: prev.amenities.filter((a) => a.key !== key),
       };
     }

     return {
       ...prev,
       amenities: [...prev.amenities, { key, title: title.trim() }],
     };
   });
 }

  /* Add custom amenity from search bar */
  function addCustom() {
    const val = search.trim();
    if (!val) return;

    const normalizedKey = val.toLowerCase().replace(/\s+/g, "-");

    const exists = amenities.some((a) => a.key === normalizedKey);
    if (exists) {
      setSearch("");
      return; // Already exists — do nothing
    }

    toggleAmenity(val);
    setSearch("");
  }

  /* Save to backend */
  async function handleSave() {
    try {
      setSaving(true);

      const uniqueAmenities = Array.from(
        new Map(formData.amenities.map((item) => [item.key, item])).values(),
      );

      const res = await updateFeaturedProperty(id, {
        ...formData,
        amenities: uniqueAmenities,
      });

      setFormData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const hasResults = Object.keys(filteredMaster).length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "82vh" }}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Amenities Editor</h3>
              <p className="text-[10px] text-gray-400">Click to toggle · Search or add custom</p>
            </div>
          </div>
          {amenities.length > 0 && (
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#27AE6018", color: "#27AE60" }}
            >
              {amenities.length} selected
            </span>
          )}
        </div>
      </div>

      {/* ── Sticky search bar + chips ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 pt-3 pb-3 flex-shrink-0 space-y-3">

        {/* Search + Add row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
              placeholder="Search or type custom amenity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
            />
          </div>

          {/* "Add custom" button — shows when user types something not in list */}
          {search.trim() && (
            <button
              onClick={addCustom}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-black flex-shrink-0 active:scale-95 transition-all shadow-sm"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>

        {/* Selected chips bar */}
        {/* {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-3 bg-[#f0fdf6] border border-[#27AE60]/20 rounded-xl">
            <span className="text-[9px] font-black text-[#27AE60] uppercase tracking-widest shrink-0 mr-1">
              Selected ({amenities.length}):
            </span>
            {amenities.map((a) => (
              <button
                key={a.key}
                onClick={() => toggleAmenity(a.title)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 group"
                style={{ background: "white", borderColor: "#bbf7d0", color: "#1a7a42" }}
              >
                {a.title}
                <span className="group-hover:text-red-500 transition-colors ml-0.5 text-xs leading-none">×</span>
              </button>
            ))}
          </div>
        )} */}
      </div>

      {/* ── Category toggle grids (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7 min-h-0">
        {!hasResults ? (
          <div className="text-center py-10 text-gray-300 text-sm">
            No amenities match "<span className="italic text-gray-400">{search}</span>"
          </div>
        ) : (
          Object.entries(filteredMaster).map(([cat, items]) => {
            const selCount   = items.filter((i) =>
              selectedKeys.has(i.toLowerCase().replace(/\s+/g, "-"))
            ).length;
            const isCollapsed = !!collapsed[cat];

            return (
              <div key={cat}>
                {/* Category header */}
                <button
                  className="w-full flex items-center gap-2.5 mb-3 group"
                  onClick={() =>
                    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
                  }
                >
                  <span className="text-base flex-shrink-0">{CAT_ICONS[cat] || "🏠"}</span>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-700 transition whitespace-nowrap">
                    {cat}
                  </h4>
                  <div className="flex-1 h-px bg-gray-100 mx-1" />
                  {selCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-black text-white flex-shrink-0"
                      style={{ background: "#27AE60" }}
                    >
                      {selCount} ✓
                    </span>
                  )}
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isCollapsed ? "-rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Amenity toggle pills */}
                {!isCollapsed && (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const key = item.toLowerCase().replace(/\s+/g, "-");
                      const sel = selectedKeys.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-xl border-2 transition-all duration-150 active:scale-95"
                          style={{
                            background:  sel
                              ? "linear-gradient(135deg,#27AE60,#1e8449)"
                              : "white",
                            borderColor: sel ? "#27AE60" : "#e5e7eb",
                            color:       sel ? "white"   : "#4b5563",
                            boxShadow:   sel
                              ? "0 2px 8px rgba(39,174,96,0.28)"
                              : "none",
                            transform:   sel ? "translateY(-1px)" : "none",
                          }}
                        >
                          {sel && (
                            <span className="mr-0.5">✓ </span>
                          )}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Save button ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Amenities
            </>
          )}
        </button>
      </div>
    </div>
  );
}