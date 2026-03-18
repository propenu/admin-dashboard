// src/pages/post-property/featured-create/steps/AmenitiesStep.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import SpecificationsStep from "./Components/SpecificationsStep";
import LeadsStep from "./Components/LeadsStep";
import { Search, Plus } from "lucide-react";

const AMENITIES_MASTER = {
  Safety: [
    "24 x 7 Security",
    "CCTV / Video Surveillance",
    "Fire Fighting Systems",
    "Smoke/Heat Sensors",
    "Smart Card Access",
    "Seismic Safety Compliant",
    "Video Intercom",
    "Emergency Rescue / Alarms",
    "Security Cabin / Guard Room",
"Compound Wall / Fencing Boom Barrier",
  ],
  Land: ["Free from encroachments", "Levelled / semi-levelled land"],
  "Water Resources": [
    "Borewell / Open well",
    "Drip irrigation facility",
    "Sprinkler irrigation system",
    "Canal/river water access",
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
    "Sky Deck",
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
    "Common Restrooms",
    "Emergency Staircases",
    "Maintenance Services",
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
    "Go Kart / Racing Track",
    "Rappelling / Rock Climbing",
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
  Technology: [
    "High-Speed Internet",
     "Server / IT Room Provision",
  ],
  Infrastucture: [
    "Infrastructure",
"Blacktop / CC Internal Roads",
"Plot Demarcation with Stones",
"Street Lighting",
"Water Pipeline Network",
"Underground Drainage",
  ],
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
  Technology: "📡",
  Infrastucture: "🛰️",
};

const AmenitiesStep = forwardRef(({ payload, update }, ref) => {
  const amenities = payload.amenities || [];
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const amenitiesRef = useRef(null);
  const specsRef     = useRef(null);
  const leadsRef     = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      if (!amenities.length) {
        setErrors({ amenities:"Please select at least one amenity" });
        amenitiesRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
        return false;
      }
      return (specsRef.current?.validate() ?? true) && (leadsRef.current?.validate() ?? true);
    },
  }));

  const selectedKeys = useMemo(() => new Set(amenities.map((a) => a.key)), [amenities]);

  const toggleAmenity = (title) => {
    if (!title.trim()) return;
    const key = title.toLowerCase().replace(/\s+/g,"-");
    if (selectedKeys.has(key)) {
      update({ amenities: amenities.filter((a) => a.key !== key) });
    } else {
      update({ amenities: [...amenities, { key, title:title.trim() }] });
      setErrors({});
    }
  };

  return (
    <div className="space-y-6" ref={amenitiesRef}>
      {/* Sticky search + selected */}
      <div className="sticky top-0 z-20 bg-white pb-4 space-y-4 border-b border-gray-100">
        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-semibold
                outline-none focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-[#27AE60]/10 placeholder:text-gray-400 transition-all"
              placeholder="Search amenities or type to add custom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search.trim() && (
            <button onClick={() => { toggleAmenity(search); setSearch(""); }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
              style={{ background:"linear-gradient(135deg,#27AE60,#1e8449)" }}>
              <Plus size={15} strokeWidth={3} /> Add
            </button>
          )}
        </div>

        {/* Selected chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-[#f0fdf6] border-2 border-[#27AE60]/20 rounded-2xl">
            <span className="text-[10px] font-black text-[#27AE60] uppercase tracking-widest shrink-0 mr-1">
              Selected ({amenities.length}):
            </span>
            {amenities.map((a) => (
              <button key={a.key} onClick={() => toggleAmenity(a.title)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all
                  hover:border-red-300 hover:bg-red-50 hover:text-red-600 group"
                style={{ background:"white", borderColor:"#bbf7d0", color:"#1a7a42" }}>
                {a.title} <span className="group-hover:text-red-500 transition-colors">×</span>
              </button>
            ))}
          </div>
        )}

        {errors.amenities && (
          <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
            ⚠ {errors.amenities}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {Object.entries(AMENITIES_MASTER).map(([cat, items]) => {
          const visible = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));
          if (search && visible.length === 0) return null;
          const selCount = visible.filter((i) => selectedKeys.has(i.toLowerCase().replace(/\s+/g,"-"))).length;

          return (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg">{CAT_ICONS[cat] || "🏠"}</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-600">{cat}</h4>
                <div className="flex-1 h-px bg-gray-200" />
                {selCount > 0 && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black text-white"
                    style={{ background:"#27AE60" }}>{selCount} selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {visible.map((item) => {
                  const key = item.toLowerCase().replace(/\s+/g,"-");
                  const sel = selectedKeys.has(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleAmenity(item)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border-2 transition-all duration-200"
                      style={{
                        background: sel ? "linear-gradient(135deg,#27AE60,#1e8449)" : "white",
                        borderColor: sel ? "#27AE60" : "#e5e7eb",
                        color: sel ? "white" : "#4b5563",
                        boxShadow: sel ? "0 2px 8px rgba(39,174,96,0.3)" : "none",
                        transform: sel ? "translateY(-1px)" : "none",
                      }}>
                      {sel ? "✓ " : ""}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Specs + Leads */}
      <div className="border-t-2 border-gray-100 pt-8 space-y-8">
        <SpecificationsStep ref={specsRef} payload={payload} update={update} />
        {/* <LeadsStep ref={leadsRef} payload={payload} update={update} /> */}
      </div>
    </div>
  );
});

export default AmenitiesStep;