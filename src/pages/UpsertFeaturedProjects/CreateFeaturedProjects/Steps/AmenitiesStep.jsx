// src/pages/post-property/featured-create/steps/AmenitiesStep.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import SpecificationsStep from "../Components/SpecificationsStep";
import LeadsStep from "../Components/LeadsStep";
import { Search, Plus } from "lucide-react";

export const AMENITIES = {
  residential: [
    {
      category: "Sports & Fitness",
      items: [
        { key: "gym", title: "Gym", icon: "🏋️" },
        { key: "swimming_pool", title: "Swimming Pool", icon: "🏊" },
        { key: "badminton_court", title: "Badminton Court", icon: "🏸" },
        { key: "tennis_court", title: "Tennis Court", icon: "🎾" },
        { key: "squash_court", title: "Squash Court", icon: "🎾" },
        { key: "table_tennis", title: "Table Tennis", icon: "🏓" },
        { key: "kids_play_area", title: "Kids Play Area", icon: "🛝" },
        { key: "football", title: "Football", icon: "⚽" },
        { key: "jogging", title: "Jogging", icon: "🏃" },
        { key: "cycle_track", title: "Cycle Track", icon: "🚴" },
        { key: "golf_court", title: "Golf Court", icon: "⛳" },
        { key: "kids_pool", title: "Kids Pool", icon: "🏊" },
        { key: "cricket", title: "Cricket", icon: "🏏" },
        { key: "basketball", title: "Basketball", icon: "🏀" },
        { key: "volleyball", title: "Volleyball", icon: "🏐" },
        { key: "yoga_area", title: "Yoga Area", icon: "🧘" },
        { key: "skating_rink", title: "Skating Rink", icon: "⛸️" },
        { key: "golf_simulator", title: "Golf Simulator", icon: "🏌️" },
        { key: "horse_riding", title: "Horse Riding", icon: "🐎" },
        { key: "rock_climbing", title: "Rock Climbing", icon: "🧗" },
        { key: "rugby", title: "Rugby", icon: "🏃" },
        { key: "golf_putting_green", title: "Golf Putting Green", icon: "🏃" },
      ],
    },

    {
      category: "Leisure",
      items: [
        { key: "indoor_games", title: "Indoor Games", icon: "🎮" },
        { key: "clubhouse", title: "Clubhouse", icon: "🎬" },
        { key: "restaurant", title: "Restaurant", icon: "🍴" },
        { key: "party_hall", title: "Party Hall", icon: "🎉" },
        { key: "spa", title: "Spa", icon: "💆" },
        { key: "mini_theatre", title: "Mini Theatre", icon: "🎬" },
        {
          key: "senior_citizen_area",
          title: "Senior Citizen Area",
          icon: "👴",
        },
        { key: "hypermarket", title: "Hypermarket", icon: "🛒" },
        {
          key: "reading_room_library",
          title: "Reading Room Library",
          icon: "📚",
        },
        { key: "conference_room", title: "Conference Room", icon: "🏢" },
        { key: "jacuzzi", title: "Jacuzzi", icon: "🛁" },
        { key: "gazebo", title: "Gazebo", icon: "🏕️" },
        { key: "sauna", title: "Sauna", icon: "♨️" },
        { key: "massage_room", title: "Massage Room", icon: "💆" },
        { key: "dance_room", title: "Dance Room", icon: "💃" },
        { key: "mini_theatre", title: "Mini Theatre", icon: "🎬" },
        { key: "amphitheatre", title: "Amphitheatre", icon: "🎭" },
        { key: "bowling", title: "Bowling", icon: "🎳" },
        {
          key: "private_pool_select_unit",
          title: "Private Pool Select Unit",
          icon: "🏊",
        },
        { key: "sky_deck", title: "Sky Deck", icon: "🌆" },
        { key: "patisserie", title: "Patisserie", icon: "🍰" },
        { key: "park", title: "Park", icon: "🌳" },
      ],
    },

    {
      category: "Convenience",
      items: [
        { key: "power_backup", title: "Power Backup", icon: "⚡" },
        { key: "convenience_store", title: "Convenience Store", icon: "🛒" },
        { key: "home_automation", title: "Home Automation", icon: "🏠" },
        { key: "visitor_parking", title: "Visitor Parking", icon: "🅿️" },
        { key: "parking", title: "Parking", icon: "🚗" },
        { key: "elevator", title: "Elevator", icon: "🛗" },
        { key: "medical_facility", title: "Medical Facility", icon: "🏥" },
        { key: "pet_area", title: "Pet Area", icon: "🐕" },
        { key: "pet_friendly", title: "Pet Friendly", icon: "🐕" },
        { key: "play_school", title: "Play School", icon: "🏫" },
        { key: "atm", title: "ATM", icon: "🏧" },
        {
          key: "gas_pipeline_connection",
          title: "Gas Pipeline Connection",
          icon: "🔥",
        },
        { key: "ac_waiting_lobby", title: "AC Waiting Lobby", icon: "❄️" },
        { key: "solar_heaters", title: "Solar Heaters", icon: "☀️" },
        {
          key: "treated_water_supply",
          title: "Treated Water Supply",
          icon: "💧",
        },
        { key: "car_washing_bays", title: "Car Washing Bays", icon: "🚗" },
        { key: "valet_parking", title: "Valet Parking", icon: "🔑" },

        { key: "podium_parking", title: "Podium Parking", icon: "🅿️" },
        {
          key: "multi_level_parking",
          title: "Multi Level Parking",
          icon: "🅿️",
        },
        { key: "common_laundry", title: "Common Laundry", icon: "👖" },
        { key: "front_desk_service", title: "Front Desk Service", icon: "🛎️" },
        { key: "centralized_ac", title: "Centralized AC", icon: "❄️" },
        {
          key: "automatic_boom_barriers",
          title: "Automatic Boom Barriers",
          icon: "🚨",
        },
      ],
    },

    {
      category: "Safety & Security",
      items: [
        { key: "24x7_security", title: "24x7 Security", icon: "🛡️" },
        {
          key: "cctv_surveillance",
          title: "CCTV Surveillance",
          icon: "📷",
        },
        {
          key: "fire_fighting_systems",
          title: "Fire Fighting Systems",
          icon: "🧯",
        },
        { key: "video_intercom", title: "Video Intercom", icon: "📞" },
        { key: "smart_card_access", title: "Smart Card Access", icon: "💳" },
        {
          key: "emergency_rescue_alarms",
          title: "Emergency Rescue Alarms",
          icon: "🚨",
        },
      ],
    },

    {
      category: "Environment",
      items: [
        {
          key: "rain_water_harvesting",
          title: "Rain Water Harvesting",
          icon: "💧",
        },
        {
          key: "solar_street_lights",
          title: "Solar Street Lights",
          icon: "☀️",
        },
      ],
    },
  ],

  land: [
    {
      category: "Infrastructure",
      items: [
        { key: "24x7_water_supply", title: "24x7 Water Supply", icon: "💧" },
        { key: "internal_roads", title: "Internal Roads", icon: "🛣️" },
        { key: "street_lighting", title: "Street Lighting", icon: "💡" },
        {
          key: "underground_drainage_system",
          title: "Underground Drainage System",
          icon: "🚰",
        },
        { key: "water_connection", title: "Water Connection", icon: "🚿" },
        {
          key: "electricity_connection",
          title: "Electricity Connection",
          icon: "⚡",
        },
        { key: "storm_water_drains", title: "Storm Water Drains", icon: "🌧️" },
        { key: "gated_community", title: "Gated Community", icon: "🏘️" },
        { key: "clubhouse", title: "Clubhouse", icon: "🏠" },
        { key: "swimming_pool", title: "Swimming Pool", icon: "🏊" },
      ],
    },

    {
      category: "Safety & Access",
      items: [
        {
          key: "gated_entry_or_compound_wall",
          title: "Gated Entry or Compound Wall",
          icon: "🚧",
        },
        { key: "24x7_security", title: "24x7 Security", icon: "🛡️" },
        { key: "cctv_surveillance", title: "CCTV Surveillance", icon: "📷" },
        {
          key: "security_room",
          title: "Security Room",
          icon: "🏢",
        },
      ],
    },

    // {
    //   category: "Utility & Services",
    //   items: [
    //     {
    //       key: "overhead_water_tank",
    //       title: "Overhead Water Tank",
    //       icon: "🛢️",
    //     },
    //     {
    //       key: "solid_waste_management_system",
    //       title: "Solid Waste Management System",
    //       icon: "♻️",
    //     },
    //   ],
    // },

    {
      category: "Basic Community Spaces",
      items: [
        { key: "park_or_green_space", title: "Park or Green Space", icon: "🌳" },
        { key: "kids_play_area", title: "Kids Play Area", icon: "🛝" },
        { key: "walking_track", title: "Walking Track", icon: "🚶" },
      ],
    },

    {
      category: "Eco Basics",
      items: [
        {
          key: "rainwater_harvesting_system",
          title: "Rainwater Harvesting System",
          icon: "💧",
        },
        { key: "avenue_plantation", title: "Avenue Plantation", icon: "🌴" },
        {
          key: "solar_street_lights",
          title: "Solar Street Lights",
          icon: "☀️",
        },
        { key: "wind_turbines", title: "Wind Turbines", icon: "🌬️" },
      ],
    },
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


  const residential = payload?.categoryType === "residential";

  
  useImperativeHandle(ref, () => ({
    validate() {
      if (!amenities.length) {
        setErrors({ amenities: "Please select at least one amenity" });
        amenitiesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return false;
      }

      return (
        (specsRef.current?.validate() ?? true) &&
        (leadsRef.current?.validate() ?? true)
      );
    },

    // ✅ ADD THIS (IMPORTANT)
    isValid() {
      if (!amenities.length) return false;

      const specsValid = specsRef.current?.isValid
        ? specsRef.current.isValid()
        : true;

      const leadsValid = leadsRef.current?.isValid
        ? leadsRef.current.isValid()
        : true;

      return specsValid && leadsValid;
    },
  }));

  const selectedKeys = useMemo(() => new Set(amenities.map((a) => a.key)), [amenities]);

  
  
  const toggleAmenity = (item) => {
    if (!item?.title) return;

    if (selectedKeys.has(item.key)) {
      update({
        amenities: amenities.filter((a) => a.key !== item.key),
      });
    } else {
      update({
        amenities: [...amenities, item],
      });
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
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm font-semibold
                outline-none focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-[#27AE60]/10 placeholder:text-gray-400 transition-all"
              placeholder="Search amenities or type to add custom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search.trim() && (
            <button
              //onClick={() => { toggleAmenity(search); setSearch(""); }}
              onClick={() => {
                const custom = {
                  key: search.toLowerCase().replace(/\s+/g, "_"),
                  title: search.trim(),
                };
                toggleAmenity(custom);
                setSearch("");
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
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
              <button
                key={a.key}
                onClick={() => toggleAmenity(a)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all
                  hover:border-red-300 hover:bg-red-50 hover:text-red-600 group"
                style={{
                  background: "white",
                  borderColor: "#bbf7d0",
                  color: "#1a7a42",
                }}
              >
                {a.title}{" "}
                <span className="group-hover:text-red-500 transition-colors">
                  ×
                </span>
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
        {(AMENITIES[payload.categoryType] || []).map((section) => {
          const cat = section.category;

          const visible = section.items.filter((i) =>
            i.title.toLowerCase().includes(search.toLowerCase()),
          );

          if (search && visible.length === 0) return null;

          const selCount = visible.filter((i) =>
            selectedKeys.has(i.key),
          ).length;

          return (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg">{CAT_ICONS[cat] || "🏠"}</span>

                <h4 className="text-xs font-black uppercase tracking-widest text-gray-600">
                  {cat}
                </h4>

                <div className="flex-1 h-px bg-gray-200" />

                {selCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-lg text-[10px] font-black text-white"
                    style={{ background: "#27AE60" }}
                  >
                    {selCount} selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {visible.map((item) => {
                  const sel = selectedKeys.has(item.key);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border-2 transition-all duration-200"
                      style={{
                        background: sel
                          ? "linear-gradient(135deg,#27AE60,#1e8449)"
                          : "white",
                        borderColor: sel ? "#27AE60" : "#e5e7eb",
                        color: sel ? "white" : "#4b5563",
                      }}
                    >
                      {sel ? "✓ " : ""}
                      {item.icon} {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Specs + Leads */}

      
      {residential && (      <div className="border-t-2 border-gray-100 pt-8 space-y-8">
        <SpecificationsStep ref={specsRef} payload={payload} update={update} />
        {/* <LeadsStep ref={leadsRef} payload={payload} update={update} /> */}
      </div>
    )}
    </div>
  );
});

export default AmenitiesStep;