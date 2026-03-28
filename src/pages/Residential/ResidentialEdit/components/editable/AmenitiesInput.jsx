// import { useState } from "react";
// import { Search, X } from "lucide-react";

// const AMENITIES = [
//   { key: "lift", title: "Lift/Elevator", icon: "🛗" },
//   { key: "swimming-pool", title: "Swimming Pool", icon: "🏊" },
//   { key: "power-backup", title: "Power Backup", icon: "⚡" },
//   { key: "gym", title: "Gym", icon: "🏋️" },
//   { key: "security", title: "24/7 Security", icon: "🛡️" },
//   { key: "parking", title: "Reserved Parking", icon: "🚗" },
//   { key: "garden", title: "Garden", icon: "🌳" },
//   { key: "club-house", title: "Club House", icon: "🏛️" },
//   { key: "play-area", title: "Play Area", icon: "🎮" },
//   { key: "intercom", title: "Intercom", icon: "📞" },
//   { key: "fire-safety", title: "Fire Safety", icon: "🧯" },
//   { key: "visitor-parking", title: "Visitor Parking", icon: "🅿️" },
//   { key: "water-storage", title: "Water Storage", icon: "💧" },
//   { key: "shopping-center", title: "Shopping Center", icon: "🛒" },
//   { key: "piped-gas", title: "Piped Gas", icon: "🔥" },
//   { key: "maintenance", title: "Maintenance Staff", icon: "👷" },
// ];

// export default function AmenitiesInput({ value = [], onChange }) {
//   const [input, setInput] = useState("");

//   // Add custom amenity
//   const addCustom = () => {
//     const text = input.trim();
//     if (!text) return;

//     const key = text.toLowerCase().replace(/\s+/g, "-");

//     if (value.some((v) => v.key === key)) return;

//     onChange([...value, { key, title: text }]);
//     setInput("");
//   };

//   // Add predefined amenity
//   const addPopular = (amenity) => {
//     if (value.some((v) => v.key === amenity.key)) return;

//     // Only send key + title (no icon)
//     onChange([
//       ...value,
//       {
//         key: amenity.key,
//         title: amenity.title,
//       },
//     ]);
//   };

//   const removeAmenity = (index) => {
//     onChange(value.filter((_, i) => i !== index));
//   };

//   const filtered = AMENITIES.filter((a) =>
//     a.title.toLowerCase().includes(input.toLowerCase()),
//   );

//   return (
//     <div className="space-y-5">
//       {/* Search Input */}
//       <div className="relative">
//         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               addCustom();
//             }
//           }}
//           placeholder="Search or add custom amenity..."
//           className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#27AE60]/40 bg-white"
//         />
//       </div>

//       {/* Popular Amenities */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
//         {filtered.map((amenity) => {
//           const added = value.some((v) => v.key === amenity.key);

//           return (
//             <button
//               key={amenity.key}
//               type="button"
//               onClick={() => addPopular(amenity)}
//               disabled={added}
//               className="relative flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all text-left"
//               style={{
//                 borderColor: added ? "#27AE60" : "#f1f5f9",
//                 background: added ? "#f0fdf4" : "#fff",
//               }}
//             >
//               {added && (
//                 <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#27AE60] rounded-full flex items-center justify-center">
//                   <span className="w-1.5 h-1.5 bg-white rounded-full" />
//                 </span>
//               )}

//               <span className="text-lg">{amenity.icon}</span>

//               <span
//                 className={`text-xs ${
//                   added ? "text-[#15803d] font-bold" : "text-slate-600"
//                 }`}
//               >
//                 {amenity.title}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Selected Amenities */}
//       {value.length > 0 && (
//         <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
//           {value.map((a, i) => {
//             const icon = AMENITIES.find((p) => p.key === a.key)?.icon || "✨";

//             return (
//               <span
//                 key={i}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
//                 style={{
//                   background: "#f0fdf4",
//                   color: "#15803d",
//                   borderColor: "#27AE6025",
//                 }}
//               >
//                 <span>{icon}</span>
//                 <span>{a.title}</span>

//                 <button
//                   type="button"
//                   onClick={() => removeAmenity(i)}
//                   className="ml-1 hover:opacity-60"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </span>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { Search, X } from "lucide-react";

const AMENITIES = {
  residential: [
    {
      category: "Sports",
      items: [
        { key: "gym", title: "Gym", icon: "🏋️" },
        { key: "swimming-pool", title: "Swimming Pool", icon: "🏊" },
        { key: "jogging-track", title: "Jogging Track", icon: "🏃" },
        { key: "kids-play-area", title: "Kid's Play Area", icon: "🎮" },
      ],
    },
    {
      category: "Convenience",
      items: [
        { key: "elevator", title: "Elevator", icon: "🛗" },
        { key: "power-backup", title: "Power Backup", icon: "⚡" },
        { key: "club-house", title: "Club House", icon: "🏛️" },
        { key: "visitor-parking", title: "Visitor Parking", icon: "🅿️" },
      ],
    },
    {
      category: "Safety",
      items: [
        { key: "security-24x7", title: "24x7 Security", icon: "🛡️" },
        { key: "cctv", title: "CCTV Video Surveillance", icon: "📷" },
        { key: "fire-fighting", title: "Fire Fighting Systems", icon: "🧯" },
        { key: "video-intercom", title: "Video Intercom", icon: "📞" },
      ],
    },
    {
      category: "Environment",
      items: [
        { key: "park", title: "Park", icon: "🌳" },
        {
          key: "rain-water-harvesting",
          title: "Rain Water Harvesting",
          icon: "💧",
        },
        { key: "solar-lighting", title: "Solar Lighting", icon: "☀️" },
      ],
    },
  ],

  commercial: [
    {
      category: "Sports",
      items: [
        { key: "gym", title: "Gym", icon: "🏋️" },
        { key: "swimming-pool", title: "Swimming Pool", icon: "🏊" },
      ],
    },
    {
      category: "Convenience",
      items: [
        { key: "elevator", title: "Elevator", icon: "🛗" },
        { key: "power-backup", title: "Power Backup", icon: "⚡" },
        { key: "visitor-parking", title: "Visitor Parking", icon: "🅿️" },
        { key: "atm", title: "ATMs", icon: "🏧" },
        { key: "ac-waiting-lobby", title: "AC Waiting Lobby", icon: "❄️" },
        { key: "parking", title: "Parking", icon: "🚗" },
        { key: "valet-parking", title: "Valet Parking", icon: "🔑" },
        { key: "podium-parking", title: "Podium Parking", icon: "🏢" },
        {
          key: "multi-level-parking",
          title: "Multi Level Parking",
          icon: "🅿️",
        },
        { key: "front-desk", title: "Front Desk Service", icon: "🛎️" },
        { key: "centralized-ac", title: "Centralized AC", icon: "🌡️" },
        { key: "water-supply-24x7", title: "24x7 Water Supply", icon: "💧" },
        {
          key: "separate-entry-exit",
          title: "Separate Entry or Exit Gates",
          icon: "🚪",
        },
        { key: "boom-barriers", title: "Automatic Boom Barriers", icon: "🚧" },
        { key: "cafe", title: "Cafe or Coffee Bar", icon: "☕" },
      ],
    },
    {
      category: "Safety",
      items: [
        { key: "security-24x7", title: "24x7 Security", icon: "🛡️" },
        { key: "cctv", title: "CCTV Video Surveillance", icon: "📷" },
        { key: "fire-fighting", title: "Fire Fighting Systems", icon: "🧯" },
        { key: "smoke-sensors", title: "Smoke or Heat Sensors", icon: "🔔" },
        { key: "smart-card-access", title: "Smart Card Access", icon: "💳" },
        {
          key: "emergency-alarms",
          title: "Emergency Rescue Alarms",
          icon: "🚨",
        },
      ],
    },
    {
      category: "Environment",
      items: [
        { key: "solar-lighting", title: "Solar Lighting", icon: "☀️" },
        { key: "igbc-certified", title: "IGBC Certified Building", icon: "🏅" },
      ],
    },
  ],

  land: [
    {
      category: "Land",
      items: [
        { key: "water-supply-24x7", title: "24x7 Water Supply", icon: "💧" },
      ],
    },
    {
      category: "Water",
      items: [{ key: "borewell", title: "Borewell Open Well", icon: "🌊" }],
    },
    {
      category: "Power",
      items: [
        {
          key: "electricity-connection",
          title: "Electricity Connection",
          icon: "⚡",
        },
        { key: "solar-power", title: "Solar Power Provision", icon: "☀️" },
      ],
    },
    {
      category: "Connectivity",
      items: [
        { key: "near-highway", title: "Near Highway", icon: "🛣️" },
        { key: "close-to-village", title: "Close to Village", icon: "🏘️" },
      ],
    },
    {
      category: "Safety",
      items: [{ key: "cctv", title: "CCTV Video Surveillance", icon: "📷" }],
    },
  ],

  agricultural: [
    {
      category: "Land",
      items: [
        {
          key: "levelled-land",
          title: "Levelled or Semi-Levelled Land",
          icon: "🌾",
        },
      ],
    },
    {
      category: "Water",
      items: [
        {
          key: "river-harvesting",
          title: "River Harvesting System",
          icon: "🌊",
        },
        {
          key: "drip-irrigation",
          title: "Drip Irrigation Facility",
          icon: "💧",
        },
        {
          key: "sprinkler-irrigation",
          title: "Sprinkler Irrigation System",
          icon: "🚿",
        },
        {
          key: "canal-water-access",
          title: "Canal River Water Access",
          icon: "🏞️",
        },
      ],
    },
    {
      category: "Power",
      items: [
        { key: "water-pump", title: "Water Pump Set", icon: "⛽" },
        { key: "solar-power", title: "Solar Power Provision", icon: "☀️" },
        {
          key: "electricity-connection",
          title: "Electricity Connection",
          icon: "⚡",
        },
      ],
    },
    {
      category: "Infrastructure",
      items: [
        { key: "cattle-shed", title: "Cattle Shed", icon: "🐄" },
        { key: "motor-shed", title: "Motor Shed", icon: "🏚️" },
        { key: "greenhouse", title: "Greenhouse", icon: "🌿" },
        { key: "watchman-room", title: "Watchman Room", icon: "👷" },
        { key: "toilets-wash", title: "Toilets and Wash Area", icon: "🚻" },
      ],
    },
    {
      category: "Safety",
      items: [{ key: "cctv", title: "CCTV Video Surveillance", icon: "📷" }],
    },
  ],
};

const PROPERTY_TYPES = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "land", label: "Land" },
  { key: "agricultural", label: "Agricultural" },
];

export default function AmenitiesInput({
  value = [],
  onChange,
  propertyType = "residential",
}) {
  const [input, setInput] = useState("");
  const [activeType, setActiveType] = useState(propertyType);

  const categories = AMENITIES[activeType] || [];

  // Flatten all items for search
  const allItems = categories.flatMap((c) => c.items);

  const isAdded = (key) => value.some((v) => v.key === key);

  const addAmenity = (item) => {
    if (isAdded(item.key)) return;
    onChange([...value, { key: item.key, title: item.title }]);
  };

  const addCustom = () => {
    const text = input.trim();
    if (!text) return;
    const key = text.toLowerCase().replace(/\s+/g, "-");
    if (isAdded(key)) return;
    onChange([...value, { key, title: text }]);
    setInput("");
  };

  const removeAmenity = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const isSearching = input.trim().length > 0;
  const filteredItems = isSearching
    ? allItems.filter((a) =>
        a.title.toLowerCase().includes(input.toLowerCase()),
      )
    : [];

  const getIcon = (key) => {
    for (const cats of Object.values(AMENITIES)) {
      for (const cat of cats) {
        const found = cat.items.find((i) => i.key === key);
        if (found) return found.icon;
      }
    }
    return "✨";
  };

  return (
    <div className="space-y-5">
      {/* Property Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => setActiveType(type.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
            style={{
              borderColor: activeType === type.key ? "#27AE60" : "#e2e8f0",
              background: activeType === type.key ? "#f0fdf4" : "#fff",
              color: activeType === type.key ? "#15803d" : "#64748b",
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              isSearching && filteredItems.length === 0
                ? addCustom()
                : filteredItems.length > 0
                  ? addAmenity(filteredItems[0])
                  : addCustom();
            }
          }}
          placeholder="Search or add custom amenity..."
          className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#27AE60]/40 bg-white"
        />
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const added = isAdded(item.key);
              return (
                <AmenityButton
                  key={item.key}
                  item={item}
                  added={added}
                  onClick={() => addAmenity(item)}
                />
              );
            })
          ) : (
            <button
              type="button"
              onClick={addCustom}
              className="col-span-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#27AE60]/40 text-sm text-[#15803d] font-medium hover:bg-[#f0fdf4] transition-all"
            >
              <span className="text-lg">➕</span>
              Add "{input.trim()}" as custom amenity
            </button>
          )}
        </div>
      )}

      {/* Category-wise Amenities */}
      {!isSearching && (
        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.category}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                {cat.category}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {cat.items.map((item) => {
                  const added = isAdded(item.key);
                  return (
                    <AmenityButton
                      key={item.key}
                      item={item}
                      added={added}
                      onClick={() => addAmenity(item)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Amenities */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {value.map((a, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{
                background: "#f0fdf4",
                color: "#15803d",
                borderColor: "#27AE6025",
              }}
            >
              <span>{getIcon(a.key)}</span>
              <span>{a.title}</span>
              <button
                type="button"
                onClick={() => removeAmenity(i)}
                className="ml-1 hover:opacity-60"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AmenityButton({ item, added, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={added}
      className="relative flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all text-left"
      style={{
        borderColor: added ? "#27AE60" : "#f1f5f9",
        background: added ? "#f0fdf4" : "#fff",
      }}
    >
      {added && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#27AE60] rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </span>
      )}
      <span className="text-lg">{item.icon}</span>
      <span
        className={`text-xs ${
          added ? "text-[#15803d] font-bold" : "text-slate-600"
        }`}
      >
        {item.title}
      </span>
    </button>
  );
}