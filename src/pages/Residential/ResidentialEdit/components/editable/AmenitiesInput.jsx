
import { useState } from "react";
import { Search, X } from "lucide-react";

const AMENITIES = {
  residential: [
    {
      category: "Sports",
      items: [
        { key: "gym", title: "Gym", icon: "🏋️" },
        { key: "swimming_pool", title: "Swimming Pool", icon: "🏊" },
        { key: "jogging_track", title: "Jogging Track", icon: "🏃" },
        { key: "kids_play_area", title: "Kid's Play Area", icon: "🎮" },
      ],
    },
    {
      category: "Convenience",
      items: [
        { key: "elevator", title: "Elevator", icon: "🛗" },
        { key: "power_backup", title: "Power Backup", icon: "⚡" },
        { key: "club_house", title: "Club House", icon: "🏛️" },
        { key: "visitor_parking", title: "Visitor Parking", icon: "🅿️" },
      ],
    },
    {
      category: "Safety",
      items: [
        { key: "24x7_security", title: "24x7 Security", icon: "🛡️" },
        {
          key: "cctv_video_surveillance",
          title: "CCTV Video Surveillance",
          icon: "📷",
        },
        {
          key: "fire_fighting_systems",
          title: "Fire Fighting Systems",
          icon: "🧯",
        },
        { key: "video_intercom", title: "Video Intercom", icon: "📞" },
      ],
    },
    {
      category: "Environment",
      items: [
        { key: "park", title: "Park", icon: "🌳" },
        {
          key: "rain_water_harvesting",
          title: "Rain Water Harvesting",
          icon: "💧",
        },
        { key: "solar_lighting", title: "Solar Lighting", icon: "☀️" },
      ],
    },
  ],

  commercial: [
    {
      category: "Sports",
      items: [
        { key: "gym", title: "Gym", icon: "🏋️" },
        { key: "swimming_pool", title: "Swimming Pool", icon: "🏊" },
      ],
    },
    {
      category: "Convenience",
      items: [
        { key: "elevator", title: "Elevator", icon: "🛗" },
        { key: "power_backup", title: "Power Backup", icon: "⚡" },
        { key: "visitor_parking", title: "Visitor Parking", icon: "🅿️" },
        { key: "atms", title: "ATMs", icon: "🏧" },
        { key: "ac_waiting_lobby", title: "AC Waiting Lobby", icon: "❄️" },
        { key: "parking", title: "Parking", icon: "🚗" },
        { key: "valet_parking", title: "Valet Parking", icon: "🔑" },
        { key: "podium_parking", title: "Podium Parking", icon: "🏢" },
        {
          key: "multi_level_parking",
          title: "Multi Level Parking",
          icon: "🅿️",
        },
        { key: "front_desk_service", title: "Front Desk Service", icon: "🛎️" },
        { key: "centralized-ac", title: "Centralized AC", icon: "🌡️" },
        { key: "24x7_water_supply", title: "24x7 Water Supply", icon: "💧" },
        {
          key: "separate_entry_or_exit_gates",
          title: "Separate Entry or Exit Gates",
          icon: "🚪",
        },
        { key: "automatic_boom_barriers", title: "Automatic Boom Barriers", icon: "🚧" },
        { key: "cafe_or_coffee_bar", title: "Cafe or Coffee Bar", icon: "☕" },
      ],
    },
    {
      category: "Safety",
      items: [
        { key: "24x7_security", title: "24x7 Security", icon: "🛡️" },
        { key: "cctv_video_surveillance", title: "CCTV Video Surveillance", icon: "📷" },
        { key: "fire_fighting_systems", title: "Fire Fighting Systems", icon: "🧯" },
        { key: "smoke_or_heat_sensors", title: "Smoke or Heat Sensors", icon: "🔔" },
        { key: "smart_card-access", title: "Smart Card Access", icon: "💳" },
        {
          key: "emergency_Rescue_alarms",
          title: "Emergency Rescue Alarms",
          icon: "🚨",
        },
        { key: "solar_lighting", title: "Solar Lighting", icon: "☀️" },
        { key: "igbc_certified_building", title: "IGBC Certified Building", icon: "🏅" },
      ],
    },
    // {
    //   category: "Environment",
    //   items: [
    //     { key: "solar_lighting", title: "Solar Lighting", icon: "☀️" },
    //     { key: "igbc_certified", title: "IGBC Certified Building", icon: "🏅" },
    //   ],
    // },
  ],

  land: [
    {
      category: "Land",
      items: [
        { key: "24x7_water_supply", title: "24x7 Water Supply", icon: "💧" },
      ],
    },
    {
      category: "Water",
      items: [{ key: "borewell_open_well", title: "Borewell Open Well", icon: "🌊" }],
    },
    {
      category: "Power",
      items: [
        {
          key: "electricity_connection",
          title: "Electricity Connection",
          icon: "⚡",
        },
        { key: "solar_power_provision", title: "Solar Power Provision", icon: "☀️" },
      ],
    },
    {
      category: "Connectivity",
      items: [
        { key: "near_highway", title: "Near Highway", icon: "🛣️" },
        { key: "close_to_village", title: "Close to Village", icon: "🏘️" },
      ],
    },
    {
      category: "Safety",
      items: [{ key: "cctv_video_surveillance", title: "CCTV Video Surveillance", icon: "📷" }],
    },
  ],

  agricultural: [
    {
      category: "Land",
      items: [
        {
          key: "levelled_land_or_semi_levelled_land",
          title: "Levelled or Semi_Levelled Land",
          icon: "🌾",
        },
      ],
    },
    {
      category: "Water",
      items: [
        {
          key: "river_harvesting_system",
          title: "River Harvesting System",
          icon: "🌊",
        },
        {
          key: "drip_irrigation_facility",
          title: "Drip Irrigation Facility",
          icon: "💧",
        },
        {
          key: "sprinkler_irrigation_system",
          title: "Sprinkler Irrigation System",
          icon: "🚿",
        },
        {
          key: "canal_river_water_access",
          title: "Canal River Water Access",
          icon: "🏞️",
        },
      ],
    },
    {
      category: "Power",
      items: [
        { key: "water_pump_set", title: "Water Pump Set", icon: "⛽" },
        { key: "solar_power_provision", title: "Solar Power Provision", icon: "☀️" },
        {
          key: "electricity_connection",
          title: "Electricity Connection",
          icon: "⚡",
        },
      ],
    },
    {
      category: "Infrastructure",
      items: [
        { key: "cattle_shed", title: "Cattle Shed", icon: "🐄" },
        { key: "motor_shed", title: "Motor Shed", icon: "🏚️" },
        { key: "greenhouse", title: "Greenhouse", icon: "🌿" },
        { key: "watchman_room", title: "Watchman Room", icon: "👷" },
        { key: "toilets_wash_area", title: "Toilets and Wash Area", icon: "🚻" },
      ],
    },
    {
      category: "Safety",
      items: [{ key: "cctv_video_surveillance", title: "CCTV Video Surveillance", icon: "📷" }],
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
  
  const categories = AMENITIES[propertyType] || [];

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
    ? allItems.filter(
        (a) =>
          a.title.toLowerCase().includes(input.toLowerCase()) || a.key.toLowerCase().includes(input.toLowerCase()),
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