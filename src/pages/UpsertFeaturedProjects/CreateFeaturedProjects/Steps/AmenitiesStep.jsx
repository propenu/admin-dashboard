// src/pages/post-property/featured-create/steps/AmenitiesStep.jsx
import React, { useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import SpecificationsStep from "../Components/SpecificationsStep";
import LeadsStep from "../Components/LeadsStep";
import { Search, Plus } from "lucide-react";

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
    { key: "greenhouse", title: "Greenhouse" }
  ],
  Leisure: [
    //{ key: "clubhouse", title: "Clubhouse" },
    { key: "Indoor_Games", title: "Indoor Games"},
    {key: "hypermarket", title: "Hypermarket"},
    {key: "restaurant", title:  "Restaurant"},
    {key: "conference_room", title: "Conference Room"},
    {key: "jacuzzi", title: "Jacuzzi"},
    {key: "sauna", title: "Sauna"},
    //{key: "cafe_coffee_bar", title: "Cafe / Coffee Bar"},
    {key: "massage_room", title: "Massage Room"},
    {key: "dance_room", title: "Dance Room"},
    {key: "mini_theatre", title: "Mini Theatre"},
    {key: "reading_room_library", title: "Reading Room / Library"},
    {key: "party_hall", title: "Party Hall"},
    {key: "amphitheatre", title: "Amphitheatre"},
    {key: "bowling", title: "Bowling"},
    {key: "spa", title: "Spa"},
    {key: "private_pool_select_unit", title: "Private Pool in Select Unit"},
    {key: "sky_deck", title: "Sky Deck"},
    //{key: "outdoor_cafes", title: "Outdoor Cafes"},
    {key: "patisseries", title: "Patisseries"},
    {key: "senior_citizen_area", title: "Senior Citizen Area"},
  ],
  Convenience: [
    {key: "power_backup", title: "Power Backup"},
    {key: "convenience_store", title: "Convenience store"},
    {key: "home_automation", title: "Home Automation"},
    {key: "play_school", title: "Play school"},
    {key: "medical_facility", title: "Medical Facility"},
    {key: "pet_area", title: "Pet Area"},
    {key: "pet_friendly", title: "Pet Friendly"},
    {key: "atms", title: "ATM's"},
    {key: "gas_pipeline_connection", title: "Gas pipeline connection"},
    {key: "ac_waiting_lobby", title: "AC Waiting Lobby"},
    {key: "solar_heaters", title: "Solar Heaters"},
    {key: "treated_water_supply", title: "Treated Water Supply"},
    {key: "car_washing_bays", title: "Car Washing Bays"},
    {key: "parking", title: "Parking"},
    {key: "valet_parking", title: "Valet Parking"},
    {key: "visitor_parking", title: "Visitor Parking"},
    {key: "podium_parking", title: "Podium Parking"},
    {key: "multi_level_parking", title: "Multi level parking"},
    {key: "common_laundry", title: "Common laundry"},
    {key: "front_desk_service", title: "Front desk service"},
    {key: "centralized_ac", title: "Centralized AC"},
    //{key: "24x7_water_supply", title: "24 x 7 Water Supply"},
    //{key: "separate_entry_or_exit_gates", title: "Separate Entry / Exit Gates"},
    {key: "automatic_boom_barriers", title: "Automatic Boom Barriers"},
    {key: "elevator", title: "Elevator"},
    {key: "party_lawn", title: "Party Lawn"},
    //{key: "common_restrooms", title: "Common Restrooms"},
    //{key: "emergency_staircases", title: "Emergency Staircases"},
    //{key: "maintenance_services", title: "Maintenance Services"},
  ],
  Sports: [
    {key: "gym", title: "Gym"},
    {key: "swimming_pool", title: "Swimming Pool"},
    {key: "badminton_court", title: "Badminton Court"},
    {key: "tennis_court", title: "Tennis Court"},
    {key: "squash_court", title: "Squash Court"},
    {key: "kids_play_area", title: "Kids' Play Area"},
    {key: "football", title: "Football"},
    {key: "jogging", title: "Jogging"},
    {key: "cycle_track", title: "Cycle Track"},
    {key: "golf_court", title: "Golf Court"},
    {key: "kids_pool", title: "Kid's Pool"},
    {key: "cricket", title: "Cricket"},
    {key: "basketball", title: "Basketball"},
    {key: "volleyball", title: "Volleyball"},
    {key: "yoga_area", title: "Yoga Area"},
    {key: "table_tennis", title: "Table Tennis"},
    //{key: "snooker_pool", title: "Snooker / Pool"},
    {key: "skating_rink", title: "Skating Rink"},
    {key: "golf_simulator", title: "Golf Simulator"},
    {key: "baseball", title: "Base Ball"},
    {key: "rugby", title: "Rugby"},
    {key: "golf_putting_green", title: "Golf Putting green"},
    {key: "horse_riding", title: "Horse Riding"},
    //{key: "go_kart_or_racing_track", title: "Go Kart / Racing Track"},
    {key: "rock_climbing", title: "Rappelling / Rock Climbing"},
    {key: "gazebo", title: "Gazebo"},
  ],
  Environment: [
    {key: "rain_water_harvesting", title: "Rain Water Harvesting"},
    //{key: "solar_treatment_plant", title: "Solar Treatment Plant"},
    {key: "park", title: "Park"},
    {key: "solar_lighting", title: "Solar Lighting"},
    //{key: "igbc_certified", title: "IGBC Certified Building"},
  ],
  "Connectivity & Access": [
    {key: "near_highway", title: "Near highway"}, 
    {key: "close_to_village", title: "Close to Village"}
  ],
  "Residentail & Farm Living": [
    {key: "watchman_room", title: "Watchman room"}, 
    //{key: "toilets_wash_area", title: "Toilets & wash area"}
  ],
  Security: [{key: "cctv_video_surveillance", title: "CCTV / Video Surveillance"}],
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

  // const toggleAmenity = (title) => {
  //   if (!title.trim()) return;
  //   const key = title.toLowerCase().replace(/\s+/g,"-");
  //   if (selectedKeys.has(key)) {
  //     update({ amenities: amenities.filter((a) => a.key !== key) });
  //   } else {
  //     update({ amenities: [...amenities, { key, title:title.trim() }] });
  //     setErrors({});
  //   }
  // };
  
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
        {Object.entries(AMENITIES_MASTER).map(([cat, items]) => {
          //const visible = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));
          const visible = items.filter((i) =>
            i.title.toLowerCase().includes(search.toLowerCase()),
          );
          if (search && visible.length === 0) return null;
          //const selCount = visible.filter((i) => selectedKeys.has(i.toLowerCase().replace(/\s+/g,"-"))).length;
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
                  // const key = item.toLowerCase().replace(/\s+/g,"-");
                  // const sel = selectedKeys.has(key);
                  const key = item.key;
                  const sel = selectedKeys.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className="px-3 py-2 text-xs font-bold rounded-xl border-2 transition-all duration-200"
                      style={{
                        background: sel
                          ? "linear-gradient(135deg,#27AE60,#1e8449)"
                          : "white",
                        borderColor: sel ? "#27AE60" : "#e5e7eb",
                        color: sel ? "white" : "#4b5563",
                        boxShadow: sel
                          ? "0 2px 8px rgba(39,174,96,0.3)"
                          : "none",
                        transform: sel ? "translateY(-1px)" : "none",
                      }}
                    >
                      {/* {sel ? "✓ " : ""}{item} */}
                      {sel ? "✓ " : ""}
                      {item.title}
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