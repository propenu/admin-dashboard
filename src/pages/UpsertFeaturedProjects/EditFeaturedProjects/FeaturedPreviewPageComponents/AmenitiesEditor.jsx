// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/AmenitiesEditor.jsx
import React, { useState, useMemo, useEffect } from "react";
import { updateFeaturedProperty } from "../../../../services/PostAPropertyService";
import { useParams } from "react-router-dom";

/* ── Categorised master list ── */
const AMENITIES_MASTER = {
  Safety: [
    { key: "24x7_security", title: "24x7 Security" },
    { key: "cctv_video_surveillance", title: "CCTV / Video Surveillance" },
    { key: "fire_fighting_systems", title: "Fire Fighting Systems" },
    //{ key: "smoke_heat_sensors", title: "Smoke/Heat Sensors" },
    { key: "smart_card_access", title: "Smart Card Access" },
    //{ key: "seismic_safety_compliant", title: "Seismic Safety Compliant" },
    { key: "video_intercom", title: "Video Intercom" },
    { key: "emergency_rescue_alarms", title: "Emergency Rescue / Alarms" },
    //{ key: "security_cabin_guard_room", title: "Security Cabin / Guard Room" },
    //{ key: "compound_wall_fencing_boom_barrier", title: "Compound Wall / Fencing Boom Barrier",},
  ],
  Land: [
    //{ key: "free_from_encroachments", title: "Free from encroachments" },
    // {
    //   key: "levelled_semi_levelled_land",
    //   title: "Levelled / semi-levelled land",
    // },
  ],
  "Water Resources": [
    { key: "borewell_open_well", title: "Borewell / Open well" },
    { key: "drip_irrigation_facility", title: "Drip irrigation facility" },
    {
      key: "sprinkler_irrigation_system",
      title: "Sprinkler irrigation system",
    },
    //{ key: "canal_river_water_access", title: "Canal/river water access" },
    { key: "river_harvesting_system", title: "river harvesting system" },
  ],
  "Power & Utilities": [
    { key: "electricity_connection", title: "electricity connection" },
    { key: "solar_power_provision", title: "Solar power provision" },
    { key: "power_backup", title: "Power Backup" },
    { key: "water_pump_set", title: "Water pump set" },
    //{ key: "generator_set", title: "Generator set" },
  ],
  "Farm Infrastructure": [
    { key: "cattle_shed", title: "Cattle shed" },
    { key: "greenhouse", title: "Greenhouse" },
  ],
  Leisure: [
    //{ key: "clubhouse", title: "Clubhouse" },
    { key: "Indoor_Games", title: "Indoor Games" },
    { key: "hypermarket", title: "Hypermarket" },
    { key: "restaurant", title: "Restaurant" },
    { key: "conference_room", title: "Conference Room" },
    { key: "jacuzzi", title: "Jacuzzi" },
    { key: "sauna", title: "Sauna" },
    //{key: "cafe_coffee_bar", title: "Cafe / Coffee Bar"},
    { key: "massage_room", title: "Massage Room" },
    { key: "dance_room", title: "Dance Room" },
    { key: "mini_theatre", title: "Mini Theatre" },
    { key: "reading_room_library", title: "Reading Room / Library" },
    { key: "party_hall", title: "Party Hall" },
    { key: "amphitheatre", title: "Amphitheatre" },
    { key: "bowling", title: "Bowling" },
    { key: "spa", title: "Spa" },
    { key: "private_pool_select_unit", title: "Private Pool in Select Unit" },
    { key: "sky_deck", title: "Sky Deck" },
    //{key: "outdoor_cafes", title: "Outdoor Cafes"},
    { key: "patisseries", title: "Patisseries" },
    { key: "senior_citizen_area", title: "Senior Citizen Area" },
  ],
  Convenience: [
    
    { key: "convenience_store", title: "Convenience store" },
    { key: "home_automation", title: "Home Automation" },
    { key: "play_school", title: "Play school" },
    { key: "medical_facility", title: "Medical Facility" },
    { key: "pet_area", title: "Pet Area" },
    { key: "pet_friendly", title: "Pet Friendly" },
    { key: "atms", title: "ATM's" },
    { key: "gas_pipeline_connection", title: "Gas pipeline connection" },
    { key: "ac_waiting_lobby", title: "AC Waiting Lobby" },
    { key: "solar_heaters", title: "Solar Heaters" },
    { key: "treated_water_supply", title: "Treated Water Supply" },
    { key: "car_washing_bays", title: "Car Washing Bays" },
    { key: "parking", title: "Parking" },
    { key: "valet_parking", title: "Valet Parking" },
    { key: "visitor_parking", title: "Visitor Parking" },
    { key: "podium_parking", title: "Podium Parking" },
    { key: "multi_level_parking", title: "Multi level parking" },
    { key: "common_laundry", title: "Common laundry" },
    { key: "front_desk_service", title: "Front desk service" },
    { key: "centralized_ac", title: "Centralized AC" },
    //{key: "24x7_water_supply", title: "24 x 7 Water Supply"},
    //{key: "separate_entry_or_exit_gates", title: "Separate Entry / Exit Gates"},
    { key: "automatic_boom_barriers", title: "Automatic Boom Barriers" },
    { key: "elevator", title: "Elevator" },
    { key: "party_lawn", title: "Party Lawn" },
    //{key: "common_restrooms", title: "Common Restrooms"},
    //{key: "emergency_staircases", title: "Emergency Staircases"},
    //{key: "maintenance_services", title: "Maintenance Services"},
  ],
  Sports: [
    { key: "gym", title: "Gym" },
    { key: "swimming_pool", title: "Swimming Pool" },
    { key: "badminton_court", title: "Badminton Court" },
    { key: "tennis_court", title: "Tennis Court" },
    { key: "squash_court", title: "Squash Court" },
    { key: "kids_play_area", title: "Kids' Play Area" },
    { key: "football", title: "Football" },
    { key: "jogging", title: "Jogging" },
    { key: "cycle_track", title: "Cycle Track" },
    { key: "golf_court", title: "Golf Court" },
    { key: "kids_pool", title: "Kid's Pool" },
    { key: "cricket", title: "Cricket" },
    { key: "basketball", title: "Basketball" },
    { key: "volleyball", title: "Volleyball" },
    { key: "yoga_area", title: "Yoga Area" },
    { key: "table_tennis", title: "Table Tennis" },
    //{key: "snooker_pool", title: "Snooker / Pool"},
    { key: "skating_rink", title: "Skating Rink" },
    { key: "golf_simulator", title: "Golf Simulator" },
    { key: "baseball", title: "Base Ball" },
    { key: "rugby", title: "Rugby" },
    { key: "golf_putting_green", title: "Golf Putting green" },
    { key: "horse_riding", title: "Horse Riding" },
    //{key: "go_kart_or_racing_track", title: "Go Kart / Racing Track"},
    { key: "rock_climbing", title: "Rappelling / Rock Climbing" },
    { key: "gazebo", title: "Gazebo" },
  ],
  Environment: [
    { key: "rain_water_harvesting", title: "Rain Water Harvesting" },
    //{key: "solar_treatment_plant", title: "Solar Treatment Plant"},
    { key: "park", title: "Park" },
    { key: "solar_lighting", title: "Solar Lighting" },
    //{key: "igbc_certified", title: "IGBC Certified Building"},
  ],
  "Connectivity & Access": [
    { key: "near_highway", title: "Near highway" },
    { key: "close_to_village", title: "Close to Village" },
  ],
  "Residentail & Farm Living": [
    { key: "watchman_room", title: "Watchman room" },
    //{key: "toilets_wash_area", title: "Toilets & wash area"}
  ],
  Security: [
    { key: "cctv_video_surveillance", title: "CCTV / Video Surveillance" },
  ],
  //Technology: [
  //{key: "high_speed_internet", title: "High-Speed Internet"},
  //{key: "server_it_room_provision", title: "Server / IT Room Provision"}],
  // Infrastucture: [
  //  //{key: "infrastructure", title: "Infrastructure"},
  //   {key: "blacktop_cc_internal_roads", title: "Blacktop / CC Internal Roads"},
  //   {key: "plot_demarcation_with_stones", title: "Plot Demarcation with Stones"},
  //   {key: "street_lighting", title: "Street Lighting"},
  //   {key: "water_pipeline_network", title: "Water Pipeline Network"},
  //   {key: "underground_drainage", title: "Underground Drainage"},
  // ],
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
      //const visible = items.filter((i) => i.toLowerCase().includes(q));
      const visible = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q),
      );
      if (visible.length) result[cat] = visible;
    });
    return result;
  }, [search]);

  /* Toggle a single amenity on/off */
//  function toggleAmenity(title) {
//    const normalizedTitle = title.trim().toLowerCase();
//    const key = normalizedTitle.replace(/\s+/g, "-");

//    setFormData((prev) => {
//      const exists = prev.amenities.some((a) => a.key === key);

//      if (exists) {
//        return {
//          ...prev,
//          amenities: prev.amenities.filter((a) => a.key !== key),
//        };
//      }

//      return {
//        ...prev,
//        amenities: [...prev.amenities, { key, title: title.trim() }],
//      };
//    });
//  }

function toggleAmenity(item) {
  const { key, title } = item;

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
      amenities: [...prev.amenities, { key, title }],
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

    //toggleAmenity(val);
    toggleAmenity({
      key: normalizedKey,
      title: val,
    });
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
              //selectedKeys.has(i.toLowerCase().replace(/\s+/g, "-"))
              selectedKeys.has(i.key)
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
                      // const key = item.toLowerCase().replace(/\s+/g, "-");
                      // const sel = selectedKeys.has(key);
                      const key = item.key;
                      const sel = selectedKeys.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-xl border-2 transition-all duration-150 active:scale-95"
                          style={{
                            background: sel
                              ? "linear-gradient(135deg,#27AE60,#1e8449)"
                              : "white",
                            borderColor: sel ? "#27AE60" : "#e5e7eb",
                            color: sel ? "white" : "#4b5563",
                            boxShadow: sel
                              ? "0 2px 8px rgba(39,174,96,0.28)"
                              : "none",
                            transform: sel ? "translateY(-1px)" : "none",
                          }}
                        >
                          {sel && <span className="mr-0.5">✓ </span>}
                          {item.title}
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