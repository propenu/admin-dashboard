

// import { useState } from "react";
// import { POPULAR_LANDMARKS } from "../editable/residentialEnums";

// export default function NearbyPlacesInput({ value = [], onChange }) {
//   const [input, setInput] = useState("");

//   /**
//    * ✅ FIXED: Added coordinates array
//    * Mongoose requires [longitude, latitude] for GeoJSON points
//    */
//   const addPlace = (placeName) => {
//     const trimmed = placeName.trim();
//     if (!trimmed) return;

//     // Check if already added
//     if (value.some((p) => p.name === trimmed)) return;

//     const newPlace = {
//       name: trimmed,
//       type: "custom",
//       icon: "📍",
//       // Default coordinates to satisfy backend validation [lng, lat]
//       coordinates: [0, 0],
//     };

//     onChange([...value, newPlace]);
//     setInput("");
//   };

//   const addPopularLandmark = (landmark) => {
//     // Check if already added
//     if (value.some((p) => p.name === landmark.name)) return;

//     // Ensure the landmark has coordinates, default to [0,0] if missing
//     const landmarkWithCoords = {
//       ...landmark,
//       coordinates: landmark.coordinates || [0, 0],
//     };

//     onChange([...value, landmarkWithCoords]);
//   };

//   const removePlace = (index) => {
//     const updated = value.filter((_, i) => i !== index);
//     onChange(updated);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addPlace(input);
//     }
//   };

//   return (
//     <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
//       {/* Search Input */}
//       <div className="relative">
//         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-lg">
//           🔍
//         </span>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Search nearby places (e.g., Metro, Hospital, School)"
//           className="w-full bg-white border border-purple-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//         />
//       </div>

//       {/* Popular Landmarks */}
//       <div className="space-y-3">
//         <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
//           Popular Landmarks
//         </div>

//         <div className="grid grid-cols-3 gap-3">
//           {POPULAR_LANDMARKS.map((landmark) => {
//             const isAdded = value.some((p) => p.name === landmark.name);

//             return (
//               <button
//                 key={landmark.name}
//                 type="button" // Always specify type="button" to prevent form submission
//                 onClick={() => addPopularLandmark(landmark)}
//                 disabled={isAdded}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-left text-sm ${
//                   isAdded
//                     ? "bg-green-50 border-green-500 text-green-700 cursor-not-allowed"
//                     : "bg-white border-purple-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50"
//                 }`}
//               >
//                 <span className="text-lg">{landmark.icon}</span>
//                 <span className="font-medium">{landmark.name}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Added Landmarks List */}
//       {value.length > 0 && (
//         <div className="space-y-2">
//           <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
//             Added Landmarks ({value.length})
//           </div>

//           <div className="flex gap-2 flex-wrap">
//             {value.map((place, index) => (
//               <span
//                 key={index}
//                 className="bg-green-50 text-green-700 border border-green-300 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 font-medium"
//               >
//                 <span>{place.icon || "📍"}</span>
//                 <span>{place.name}</span>
//                 <button
//                   type="button"
//                   onClick={() => removePlace(index)}
//                   className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors ml-1"
//                 >
//                   <span className="text-green-700 font-bold leading-none">
//                     ×
//                   </span>
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// } 




// NearbyPlacesInput.jsx — 10 km live search via Overpass API
import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, MapPin, X, Check, Plus, Navigation } from "lucide-react";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MAX_RADIUS_KM = 10;
const MAX_RADIUS_M  = MAX_RADIUS_KM * 1000; // 10,000 m

// ─────────────────────────────────────────────
// Haversine distance
// ─────────────────────────────────────────────

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

// ─────────────────────────────────────────────
// Overpass API search (10 km radius)
// ─────────────────────────────────────────────

const TYPE_MAP = {
  hospital:    '["amenity"~"hospital|clinic"]',
  school:      '["amenity"="school"]',
  college:     '["amenity"="college"]',
  bank:        '["amenity"="bank"]',
  restaurant:  '["amenity"="restaurant"]',
  mall:        '["shop"="mall"]',
  supermarket: '["shop"="supermarket"]',
  metro:       '["railway"~"station|subway"]',
  park:        '["leisure"="park"]',
  pharmacy:    '["amenity"="pharmacy"]',
  gym:         '["leisure"="fitness_centre"]',
  atm:         '["amenity"="atm"]',
};

const KEY_MATCH = [
  ["hospital",    "hospital"],
  ["clinic",      "hospital"],
  ["school",      "school"],
  ["college",     "college"],
  ["university",  "college"],
  ["bank",        "bank"],
  ["restaurant",  "restaurant"],
  ["food",        "restaurant"],
  ["mall",        "mall"],
  ["market",      "supermarket"],
  ["supermarket", "supermarket"],
  ["grocery",     "supermarket"],
  ["metro",       "metro"],
  ["station",     "metro"],
  ["subway",      "metro"],
  ["park",        "park"],
  ["garden",      "park"],
  ["pharmacy",    "pharmacy"],
  ["medical",     "pharmacy"],
  ["gym",         "gym"],
  ["fitness",     "gym"],
  ["atm",         "atm"],
];

async function searchNearbyPlaces(query, lat, lng) {
  const val = query.toLowerCase().trim();
  const matched = KEY_MATCH.find(([kw]) => val.includes(kw));
  if (!matched) throw new Error("UNSUPPORTED");

  const key = matched[1];
  const typeFilter = TYPE_MAP[key];

  const overpassQuery = `
[out:json];
(
  node(around:${MAX_RADIUS_M},${lat},${lng})${typeFilter}["name"];
);
out;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: overpassQuery,
  });

  if (!res.ok) throw new Error("Overpass API error");

  const data = await res.json();

  return data.elements
    .map((el) => {
      const distMeters = haversineMeters(lat, lng, el.lat, el.lon);
      return {
        name:          el.tags.name || key,
        type:          key,
        icon:          TYPE_ICONS[key] || "📍",
        coordinates:   [el.lon, el.lat],
        distanceMeters: distMeters,
        distanceText:  formatDistance(distMeters),
      };
    })
    .filter((p) => p.distanceMeters <= MAX_RADIUS_M)         // strict 10 km cap
    .sort((a, b) => a.distanceMeters - b.distanceMeters);    // nearest first
}

const TYPE_ICONS = {
  hospital:    "🏥",
  school:      "🏫",
  college:     "🎓",
  bank:        "🏦",
  restaurant:  "🍽️",
  mall:        "🛍️",
  supermarket: "🛒",
  metro:       "🚇",
  park:        "🌳",
  pharmacy:    "💊",
  gym:         "🏋️",
  atm:         "🏧",
};

// ─────────────────────────────────────────────
// Quick-pick suggestion chips
// ─────────────────────────────────────────────

const QUICK_PICKS = [
  { label: "Hospital",    icon: "🏥", query: "hospital"    },
  { label: "School",      icon: "🏫", query: "school"      },
  { label: "Metro",       icon: "🚇", query: "metro station" },
  { label: "Mall",        icon: "🛍️", query: "mall"        },
  { label: "Park",        icon: "🌳", query: "park"        },
  { label: "Bank",        icon: "🏦", query: "bank"        },
  { label: "Pharmacy",    icon: "💊", query: "pharmacy"    },
  { label: "Gym",         icon: "🏋️", query: "gym"         },
  { label: "Restaurant",  icon: "🍽️", query: "restaurant"  },
  { label: "Supermarket", icon: "🛒", query: "supermarket" },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

/**
 * NearbyPlacesInput
 *
 * Props:
 *   value        – array of saved place objects
 *   onChange     – (updatedArray) => void
 *   coordinates  – [lng, lat] of the pinned property (from OpenStreetPinMap)
 */
export default function NearbyPlacesInput({ value = [], onChange, coordinates }) {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [searchError, setSearchError] = useState(null);
  const abortRef = useRef(null);

  // Derive lat/lng from the [lng, lat] GeoJSON coordinates array
  const hasPinned = Array.isArray(coordinates) && coordinates.length === 2;
  const [pinnedLng, pinnedLat] = hasPinned ? coordinates : [null, null];

  const runSearch = useCallback(async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    if (!hasPinned) {
      setSearchError("Please pin your property location on the map first.");
      return;
    }

    setSearchError(null);
    setLoading(true);
    setSearched(false);
    setResults([]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const places = await searchNearbyPlaces(q, pinnedLat, pinnedLng);
      setResults(places);
      setSearched(true);
    } catch (e) {
      if (e?.name === "AbortError") return;
      if (e?.message === "UNSUPPORTED") {
        setSearchError(
          `"${q}" not recognised. Try: hospital, school, metro, mall, park, bank, pharmacy, gym, restaurant, supermarket.`
        );
      } else {
        setSearchError("Search failed. Please try again.");
      }
      console.error("NearbyPlacesInput search error:", e);
    } finally {
      setLoading(false);
    }
  }, [query, hasPinned, pinnedLat, pinnedLng]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Reset results when coordinates change (new pin)
  useEffect(() => {
    setResults([]);
    setSearched(false);
    setSearchError(null);
  }, [coordinates?.toString()]);

  const isAdded = (place) =>
    value.some((p) => p.name === place.name && p.type === place.type);

  const handleAdd = (place) => {
    if (isAdded(place)) return;
    onChange([
      ...value,
      {
        name:         place.name,
        type:         place.type,
        icon:         place.icon || "📍",
        coordinates:  place.coordinates || [0, 0],
        distanceText: place.distanceText || "",
        order:        value.length,
      },
    ]);
  };

  const handleRemove = (place) => {
    onChange(value.filter((p) => !(p.name === place.name && p.type === place.type)));
  };

  return (
    <div className="space-y-5">

      {/* ── 10 km notice ── */}
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
        <Navigation size={13} className="text-purple-500 shrink-0" />
        <p className="text-xs text-purple-700 font-semibold">
          Only places within <span className="font-black">10 km</span> of your pinned location are shown, sorted nearest first.
        </p>
      </div>

      {/* ── No pin warning ── */}
      {!hasPinned && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <MapPin size={13} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-semibold">
            Pin your property on the map above to enable nearby search.
          </p>
        </div>
      )}

      {/* ── Quick-pick chips ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Search</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PICKS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              disabled={!hasPinned || loading}
              onClick={() => {
                setQuery(qp.query);
                runSearch(qp.query);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                bg-white border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{qp.icon}</span> {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="e.g. hospital, school, metro station, mall…"
            disabled={!hasPinned}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3.5 py-3 text-sm font-medium text-slate-700
              focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10 outline-none transition-all
              placeholder:text-slate-300 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading || !query.trim() || !hasPinned}
          className="px-5 py-3 bg-purple-600 text-white text-sm font-black rounded-xl hover:bg-purple-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </div>

      {/* ── Error ── */}
      {searchError && (
        <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {searchError}
        </p>
      )}

      {/* ── No results ── */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Search size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No places found within 10 km for "{query}"</p>
          <p className="text-xs mt-1">Try a different keyword or repin your location</p>
        </div>
      )}

      {/* ── Results list ── */}
      {results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {/* Header */}
          <div className="flex items-center px-4 py-2 bg-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">
              {results.length} place{results.length !== 1 ? "s" : ""} within 10 km
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-14">
              Distance
            </p>
          </div>

          {results.map((place, idx) => {
            const added = isAdded(place);
            return (
              <div
                key={`result-${idx}`}
                className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
                  added ? "bg-green-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1 mr-3 flex items-center gap-2.5">
                  <span className="text-base shrink-0">{place.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{place.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="capitalize">{place.type}</span>
                      {place.distanceText && (
                        <span className="inline-flex items-center gap-0.5 text-purple-600 font-bold">
                          · <Navigation size={9} className="inline" /> {place.distanceText}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => added ? handleRemove(place) : handleAdd(place)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                    added
                      ? "bg-green-50 text-green-600 border-green-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-purple-400 hover:text-purple-600"
                  }`}
                >
                  {added ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Added chips ── */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Added ({value.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((place, idx) => (
              <span
                key={`chip-${idx}`}
                className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold
                  px-3 py-1.5 rounded-full flex items-center gap-1.5"
              >
                <span>{place.icon || "📍"}</span>
                <span className="max-w-[130px] truncate">{place.name}</span>
                {place.distanceText && (
                  <span className="text-green-400 font-normal">· {place.distanceText}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(place)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors ml-0.5"
                >
                  <X size={10} className="text-green-600" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

