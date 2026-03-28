


// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
// import { useDispatch, useSelector } from "react-redux";
// import { actions } from "../../../store/newIndex";
// import { Phone, X, Check, MapPin, Navigation, Search, Loader2, Plus } from "lucide-react";
// import { savePropertyData } from "../../../store/common/propertyThunks";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { search } from "india-pincode-search";
// import { toast } from "sonner";

// // ─────────────────────────────────────────────
// // Leaflet (OpenStreetMap) helpers
// // ─────────────────────────────────────────────

// const LEAFLET_CSS_ID = "leaflet-css";
// const LEAFLET_JS_ID = "leaflet-js";
// const DEFAULT_POSITION = { lat: 28.4595, lng: 77.0266 };

// function loadLeaflet() {
//   if (window.L) return Promise.resolve(window.L);
//   if (window.__leafletPromise) return window.__leafletPromise;

//   window.__leafletPromise = new Promise((resolve, reject) => {
//     // Inject CSS if not present
//     if (!document.getElementById(LEAFLET_CSS_ID)) {
//       const link = document.createElement("link");
//       link.id = LEAFLET_CSS_ID;
//       link.rel = "stylesheet";
//       link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//       document.head.appendChild(link);
//     }

//     // Inject JS if not present
//     if (!document.getElementById(LEAFLET_JS_ID)) {
//       const script = document.createElement("script");
//       script.id = LEAFLET_JS_ID;
//       script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//       script.async = true;
//       script.onload = () => {
//         if (window.L) resolve(window.L);
//         else reject(new Error("Leaflet loaded but window.L not found."));
//       };
//       script.onerror = () => reject(new Error("Failed to load Leaflet script."));
//       document.body.appendChild(script);
//     } else {
//       if (window.L) resolve(window.L);
//       else reject(new Error("Leaflet script exists but window.L not found."));
//     }
//   });

//   window.__leafletPromise = window.__leafletPromise.catch((err) => {
//     window.__leafletPromise = undefined;
//     throw err;
//   });

//   return window.__leafletPromise;
// }

// // Fix Leaflet default marker icon paths (common issue with bundlers)
// function fixLeafletIcons(L) {
//   delete L.Icon.Default.prototype._getIconUrl;
//   L.Icon.Default.mergeOptions({
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   });
// }

// // ─────────────────────────────────────────────
// // Geocoding helpers (Nominatim)
// // ─────────────────────────────────────────────

// const fmt = (s) => (s ? s.charAt(0).toUpperCase() + s.toLowerCase().slice(1) : "");

// async function reverseGeocode(lat, lng, signal) {
//   const res = await fetch(
//     `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
//     { signal, headers: { "Accept-Language": "en" } }
//   );
//   if (!res.ok) throw new Error("Reverse geocoding failed.");
//   const data = await res.json();
//   const addr = data?.address || {};
//   return {
//     pincode: addr.postcode || "",
//     locality: fmt(
//       addr.suburb ||
//         addr.neighbourhood ||
//         addr.hamlet ||
//         addr.village ||
//         addr.town ||
//         addr.city_district ||
//         addr.county ||
//         ""
//     ),
//     city: fmt(
//       addr.city ||
//         addr.town ||
//         addr.village ||
//         addr.city_district ||
//         addr.state_district ||
//         addr.county ||
//         ""
//     ),
//     state: fmt(addr.state || ""),
//   };
// }

// async function geocodeByText(text) {
//   const res = await fetch(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
//     { headers: { "Accept-Language": "en" } }
//   );
//   const data = await res.json();
//   if (Array.isArray(data) && data.length > 0)
//     return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
//   return null;
// }

// // ─────────────────────────────────────────────
// // Haversine distance calculator
// // ─────────────────────────────────────────────

// const MAX_RADIUS_KM = 10;
// const MAX_RADIUS_M  = MAX_RADIUS_KM * 1000; // 10,000 m

// function haversineMeters(lat1, lng1, lat2, lng2) {
//   const toRad = (d) => (d * Math.PI) / 180;
//   const R = 6371000;
//   const dLat = toRad(lat2 - lat1);
//   const dLng = toRad(lng2 - lng1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// function formatDistance(meters) {
//   if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
//   return `${Math.round(meters)} m`;
// }

// // ─────────────────────────────────────────────
// // Nearby Places Search (Overpass API — 10 km cap)
// // ─────────────────────────────────────────────

// async function searchNearbyPlaces(query, lat, lng) {
//   const val = query.toLowerCase().trim();

//   const TYPE_MAP = {
//     hospital:    '["amenity"~"hospital|clinic"]',
//     school:      '["amenity"="school"]',
//     college:     '["amenity"="college"]',
//     bank:        '["amenity"="bank"]',
//     restaurant:  '["amenity"="restaurant"]',
//     mall:        '["shop"="mall"]',
//     supermarket: '["shop"="supermarket"]',
//     metro:       '["railway"~"station|subway"]',
//     park:        '["leisure"="park"]',
//   };

//   const KEY_MATCH = [
//     ["hospital",    "hospital"],
//     ["school",      "school"],
//     ["college",     "college"],
//     ["bank",        "bank"],
//     ["restaurant",  "restaurant"],
//     ["mall",        "mall"],
//     ["market",      "supermarket"],
//     ["supermarket", "supermarket"],
//     ["metro",       "metro"],
//     ["station",     "metro"],
//     ["park",        "park"],
//   ];

//   const matched = KEY_MATCH.find(([kw]) => val.includes(kw));
//   if (!matched) throw new Error("Unsupported place type");

//   const key = matched[1];
//   const typeFilter = TYPE_MAP[key];

//   // Query Overpass with MAX_RADIUS_M (10 km) directly in the API call
//   const overpassQuery = `
// [out:json];
// (
//   node(around:${MAX_RADIUS_M},${lat},${lng})${typeFilter}["name"];
// );
// out;
//   `;

//   const res = await fetch("https://overpass-api.de/api/interpreter", {
//     method: "POST",
//     body: overpassQuery,
//   });

//   const data = await res.json();

//   // Calculate distance for every result, filter to <= 10 km, then sort nearest first
//   const withDistance = data.elements
//     .map((el) => {
//       const distMeters = haversineMeters(lat, lng, el.lat, el.lon);
//       return {
//         name: el.tags.name || key,
//         type: key,
//         coordinates: [el.lon, el.lat],
//         distanceMeters: distMeters,
//         distanceText: formatDistance(distMeters),
//       };
//     })
//     .filter((p) => p.distanceMeters <= MAX_RADIUS_M)   // strict 10 km guard
//     .sort((a, b) => a.distanceMeters - b.distanceMeters); // nearest first

//   return withDistance;
// }

// // ─────────────────────────────────────────────
// // Shared UI components
// // ─────────────────────────────────────────────

// const SectionLabel = ({ children }) => (
//   <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">
//     {children}
//   </p>
// );

// const CardWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>
//     {children}
//   </div>
// );

// const InputField = ({ label, children, error }) => (
//   <div className="space-y-1.5">
//     <label className="block text-xs font-semibold text-[#374151]">{label}</label>
//     {children}
//     {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//   </div>
// );

// const inputCls =
//   "w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]";
// const readonlyCls =
//   "w-full border border-[#e5e7eb] rounded-xl px-3.5 py-3 text-sm font-medium text-[#6b7280] bg-[#f9fafb] outline-none";

// // ─────────────────────────────────────────────
// // NearbyPlaceSearch sub-component
// // ─────────────────────────────────────────────

// function NearbyPlaceSearch({ pinnedCoords, selectedPlaces, onAdd, onRemove }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searched, setSearched] = useState(false);
//   const [searchError, setSearchError] = useState(null);
//   const abortRef = useRef(null);

//   const handleSearch = useCallback(async () => {
//     const q = query.trim();
//     if (!q) return;
//     if (!pinnedCoords) {
//       setSearchError("Please pin your property location on the map first.");
//       return;
//     }
//     setSearchError(null);
//     setLoading(true);
//     setSearched(false);
//     setResults([]);

//     abortRef.current?.abort();
//     abortRef.current = new AbortController();

//     try {
//       const [lng, lat] = pinnedCoords;
//       const places = await searchNearbyPlaces(q, lat, lng);
//       setResults(places);
//       setSearched(true);
//     } catch (e) {
//       if (e?.name === "AbortError") return;
//       setSearchError("Search failed. Please try again.");
//       console.error("Nearby search error:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [query, pinnedCoords]);

//   useEffect(() => () => abortRef.current?.abort(), []);

//   const isAdded = (place) =>
//     selectedPlaces.some((p) => p.name === place.name && p.type === place.type);

//   return (
//     <div className="space-y-4">
//       {/* 10 km radius notice */}
//       <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
//         <MapPin size={12} className="text-[#27AE60] shrink-0" />
//         <p className="text-xs text-[#166534] font-medium">
//           Only places within <span className="font-bold">10 km</span> of your pinned location are shown, sorted nearest first.
//         </p>
//       </div>

//       {/* Search bar */}
//       <div className="flex gap-2">
//         <div className="relative flex-1">
//           <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             placeholder="e.g. hospital, school, metro station, mall..."
//             className="w-full border border-[#d1d5db] rounded-xl pl-9 pr-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={handleSearch}
//           disabled={loading || !query.trim()}
//           className="px-5 py-3 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#219150] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
//         >
//           {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
//           Search
//         </button>
//       </div>

//       {searchError && <p className="text-red-500 text-xs font-medium">{searchError}</p>}

//       {searched && !loading && results.length === 0 && (
//         <div className="text-center py-6 text-[#9ca3af]">
//           <Search size={24} className="mx-auto mb-2 opacity-40" />
//           <p className="text-sm">No places found within 10 km for "{query}"</p>
//           <p className="text-xs mt-1">Try a different keyword or repin your location</p>
//         </div>
//       )}

//       {results.length > 0 && (
//         <div className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#f3f4f6]">
//           {/* Column header */}
//           <div className="flex items-center px-4 py-2 bg-[#f9fafb]">
//             <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest flex-1">
//               Place ({results.length} within 10 km)
//             </p>
//             <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest w-20 text-center mr-12">
//               Distance
//             </p>
//           </div>

//           {results.map((place, idx) => {
//             const added = isAdded(place);
//             return (
//               <div
//                 key={`result-${idx}`}
//                 className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
//                   added ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"
//                 }`}
//               >
//                 <div className="min-w-0 flex-1 mr-3">
//                   <p className="text-sm font-semibold text-[#111827] truncate">{place.name}</p>
//                   <p className="text-xs text-[#6b7280] truncate mt-0.5 flex items-center gap-1.5">
//                     <span className="capitalize">{place.type}</span>
//                     {place.distanceText && (
//                       <span className="inline-flex items-center gap-0.5 text-[#27AE60] font-semibold">
//                         · <Navigation size={9} className="inline" /> {place.distanceText}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => (added ? onRemove(place) : onAdd(place))}
//                   className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
//                     added
//                       ? "bg-[#f0fdf4] text-[#27AE60] border-[#bbf7d0]"
//                       : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#27AE60] hover:text-[#27AE60]"
//                   }`}
//                 >
//                   {added ? (
//                     <><Check size={11} /> Added</>
//                   ) : (
//                     <><Plus size={11} /> Add</>
//                   )}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {selectedPlaces.length > 0 && (
//         <div>
//           <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">
//             Added ({selectedPlaces.length})
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {selectedPlaces.map((place, idx) => (
//               <span
//                 key={`chip-${idx}`}
//                 className="bg-[#f0fdf4] text-[#27AE60] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
//               >
//                 <MapPin size={10} className="shrink-0" />
//                 <span className="max-w-[140px] truncate">{place.name}</span>
//                 {place.distanceText && (
//                   <span className="text-[#86efac] font-normal">· {place.distanceText}</span>
//                 )}
//                 <X
//                   size={11}
//                   className="cursor-pointer hover:text-red-500 transition-colors ml-0.5 shrink-0"
//                   onClick={() => onRemove(place)}
//                 />
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────

// export default function Step2LocationDetails({ next, back, category }) {
//   const [errors, setErrors] = useState({});
//   const dispatch = useDispatch();
//   const form = useSelector((state) => state[category]?.form || {});

//   const [markerPlaced, setMarkerPlaced] = useState(false);
//   const [mapError, setMapError] = useState(null);

//   const topRef = useRef(null);
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);           // Leaflet map instance
//   const markerRef = useRef(null);        // Leaflet marker instance
//   const reverseGeocodeAbortRef = useRef(null);

//   useEffect(() => {
//     topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   }, []);

//   const setValue = useCallback(
//     (key, value) => {
//       dispatch(actions[category].updateField({ key, value }));
//       if (errors[key]) setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
//     },
//     [dispatch, category, errors]
//   );

//   // ── Map init (Leaflet / OpenStreetMap) ───────
//   useEffect(() => {
//     let cancelled = false;

//     const initMap = async () => {
//       if (!mapContainerRef.current) return;

//       try {
//         const L = await loadLeaflet();
//         if (cancelled) return;

//         fixLeafletIcons(L);

//         // Prevent double-init
//         if (mapRef.current) return;

//         const map = L.map(mapContainerRef.current, {
//           center: [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
//           zoom: 13,
//           zoomControl: true,
//         });

//         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//           attribution:
//             '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//           maxZoom: 19,
//         }).addTo(map);

//         mapRef.current = map;

//         // Map click handler
//         map.on("click", (e) => {
//           const { lat, lng } = e.latlng;

//           // Remove existing marker
//           if (markerRef.current) {
//             markerRef.current.remove();
//             markerRef.current = null;
//           }

//           markerRef.current = L.marker([lat, lng]).addTo(map);
//           setMarkerPlaced(true);
//           map.setView([lat, lng], 15);

//           const coords = [lng, lat];
//           setValue("location", { type: "Point", coordinates: coords });
//           setErrors((prev) => { const u = { ...prev }; delete u.location; return u; });

//           // Reverse geocode
//           reverseGeocodeAbortRef.current?.abort();
//           const controller = new AbortController();
//           reverseGeocodeAbortRef.current = controller;

//           reverseGeocode(lat, lng, controller.signal)
//             .then(({ pincode, locality, city, state }) => {
//               if (pincode) setValue("pincode", pincode);
//               if (locality) setValue("locality", locality);
//               if (city) setValue("city", city);
//               if (state) setValue("state", state);
//             })
//             .catch((e) => {
//               if (e?.name !== "AbortError") console.error(e);
//             });
//         });

//         setMapError(null);
//       } catch (err) {
//         if (!cancelled)
//           setMapError(err instanceof Error ? err.message : "Unable to load map.");
//       }
//     };

//     initMap();

//     return () => {
//       cancelled = true;
//     };
//   }, []); // run once on mount

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       reverseGeocodeAbortRef.current?.abort();
//       if (markerRef.current) {
//         markerRef.current.remove();
//         markerRef.current = null;
//       }
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // ── Pincode auto-fill ─────────────────────────
//   useEffect(() => {
//     const run = async () => {
//       if (!form.pincode || form.pincode.length !== 6) return;

//       const result = search(form.pincode);
//       if (!Array.isArray(result) || result.length === 0) return;

//       const pin = result[0];
//       const locality = fmt(pin.village || pin.office || pin.taluk || "");
//       const city = fmt(pin.district || "");
//       const state = fmt(pin.state || "");

//       setValue("locality", locality);
//       setValue("city", city);
//       setValue("state", state);

//       const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);
//       if (geo && mapRef.current) {
//         const L = window.L;
//         if (!L) return;

//         const { lat, lng } = geo;
//         const coords = [lng, lat];

//         if (markerRef.current) {
//           markerRef.current.remove();
//           markerRef.current = null;
//         }

//         markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
//         setMarkerPlaced(true);
//         mapRef.current.setView([lat, lng], 13);

//         setValue("location", { type: "Point", coordinates: coords });
//       }
//     };

//     run();
//   }, [form.pincode]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Nearby place add/remove ───────────────────
//   const handleAddPlace = useCallback(
//     (place) => {
//       const current = form.nearbyPlaces || [];
//       if (current.some((p) => p.name === place.name && p.type === place.type)) return;
//       setValue("nearbyPlaces", [
//         ...current,
//         {
//           name: place.name,
//           type: place.type,
//           distanceText: place.distanceText || "",
//           coordinates: place.coordinates || form.location?.coordinates || [0, 0],
//           order: current.length,
//         },
//       ]);
//     },
//     [form.nearbyPlaces, form.location, setValue]
//   );

//   const handleRemovePlace = useCallback(
//     (place) => {
//       setValue(
//         "nearbyPlaces",
//         (form.nearbyPlaces || []).filter(
//           (p) => !(p.name === place.name && p.type === place.type)
//         )
//       );
//     },
//     [form.nearbyPlaces, setValue]
//   );

//   // ── Validation ────────────────────────────────
//   const validateStep2 = () => {
//     const e = {};
//     if (!form.address) e.address = "Address is required";
//     if (!form.pincode || form.pincode.length !== 6) e.pincode = "Valid 6-digit pincode required";
//     if (!form.location) e.location = "Please pin property location on map";
//     if (!form.locality) e.locality = "Locality is required";
//     if (!form.city) e.city = "City is required";
//     if (!form.state) e.state = "State is required";
//     return e;
//   };

//   const handleContinue = async () => {
//     const validationErrors = validateStep2();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     const propertyId = localStorage.getItem("propertyId");
//     if (!propertyId) {
//       toast.error("Property ID missing.");
//       return;
//     }
//     try {
//       await dispatch(
//         savePropertyData({ category, id: propertyId, step: "location" })
//       ).unwrap();
//       toast.success("Location saved!");
//       next();
//     } catch (err) {
//       console.error("API Error:", err);
//       toast.error(err.message || "Failed to save location");
//     }
//   };

//   // ─────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────
//   return (
//     <div ref={topRef} className="space-y-5">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-[#27AE60]">Location Details</h2>
//           <p className="text-xs text-[#000000] mt-0.5">Where is your property located?</p>
//         </div>
//         <button
//           type="button"
//           className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors"
//         >
//           <Phone size={13} />
//           Get a callback
//         </button>
//       </div>

//       {/* Address card */}
//       <CardWrapper>
//         <SectionLabel>Address Information</SectionLabel>
//         <div className="space-y-4">
//           <InputField label="Address Line" error={errors.address}>
//             <textarea
//               rows={3}
//               value={form.address || ""}
//               onChange={(e) => setValue("address", e.target.value)}
//               placeholder="Enter full address..."
//               className={inputCls + " resize-none"}
//             />
//           </InputField>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {(form.propertyCategory === "residential" ||
//               form.propertyCategory === "commercial") && (
//               <InputField label="Apartment / Society" error={errors.buildingName}>
//                 <input
//                   value={form.buildingName || ""}
//                   onChange={(e) => setValue("buildingName", e.target.value)}
//                   placeholder="Society / Building name"
//                   className={inputCls}
//                 />
//               </InputField>
//             )}
//             {(form.propertyCategory === "land" ||
//               form.propertyCategory === "agricultural") && (
//               <InputField label="Land Name / Society" error={errors.landName}>
//                 <input
//                   value={form.landName || ""}
//                   onChange={(e) => setValue("landName", e.target.value)}
//                   placeholder="Land Name / Society Name"
//                   className={inputCls}
//                 />
//               </InputField>
//             )}
//             <InputField label="Pincode" error={errors.pincode}>
//               <input
//                 value={form.pincode || ""}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, "").slice(0, 6);
//                   setValue("pincode", value);
//                 }}
//                 placeholder="6-digit pincode"
//                 maxLength={6}
//                 className={inputCls}
//               />
//             </InputField>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <InputField label="Locality" error={errors.locality}>
//               <input
//                 value={form.locality || ""}
//                 readOnly
//                 placeholder="Auto-filled"
//                 className={readonlyCls}
//               />
//             </InputField>
//             <InputField label="City" error={errors.city}>
//               <input
//                 value={form.city || ""}
//                 readOnly
//                 placeholder="Auto-filled"
//                 className={readonlyCls}
//               />
//             </InputField>
//             <InputField label="State" error={errors.state}>
//               <input
//                 value={form.state || ""}
//                 readOnly
//                 placeholder="Auto-filled"
//                 className={readonlyCls}
//               />
//             </InputField>
//           </div>
//         </div>
//       </CardWrapper>

//       {/* Map card */}
//       <CardWrapper>
//         <div className="flex items-center gap-2 mb-4">
//           <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
//             <MapPin size={14} className="text-[#27AE60]" />
//           </div>
//           <div>
//             <SectionLabel>Pin Property Location</SectionLabel>
//             <p className="text-[10px] text-[#9ca3af] -mt-2">
//               Click on the map to mark exact location
//             </p>
//           </div>
//         </div>

//         <div className="relative z-10 h-64 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-inner">
//           {mapError ? (
//             <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm px-4 text-center bg-[#f9fafb]">
//               {mapError}
//             </div>
//           ) : (
//             <div ref={mapContainerRef} className="h-full w-full" />
//           )}
//         </div>

//         {!markerPlaced && !mapError && (
//           <div className="mt-2 flex items-center gap-1.5 text-[#f59e0b]">
//             <Navigation size={12} />
//             <p className="text-xs font-medium">Click on the map to pin your location</p>
//           </div>
//         )}
//         {markerPlaced && (
//           <div className="mt-2 flex items-center gap-1.5 text-[#27AE60]">
//             <Check size={12} />
//             <p className="text-xs font-medium">Location pinned successfully</p>
//           </div>
//         )}
//         {errors.location && (
//           <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>
//         )}
//       </CardWrapper>

//       {/* Nearby places search card */}
//       <CardWrapper>
//         <div className="flex items-center gap-2 mb-4">
//           <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
//             <Search size={14} className="text-[#27AE60]" />
//           </div>
//           <div>
//             <SectionLabel>Nearby Places</SectionLabel>
//             <p className="text-[10px] text-[#9ca3af] -mt-2">
//               Search and add real places near your property
//             </p>
//           </div>
//         </div>

//         {!form.location && (
//           <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 mb-4">
//             <Navigation size={13} className="text-[#f59e0b] shrink-0" />
//             <p className="text-xs text-[#92400e] font-medium">
//               Pin your property location on the map first to enable nearby search.
//             </p>
//           </div>
//         )}

//         <NearbyPlaceSearch
//           pinnedCoords={form.location?.coordinates || null}
//           selectedPlaces={form.nearbyPlaces || []}
//           onAdd={handleAddPlace}
//           onRemove={handleRemovePlace}
//         />

//         {errors.nearbyPlaces && (
//           <p className="text-red-500 text-xs mt-2 font-medium">{errors.nearbyPlaces}</p>
//         )}
//       </CardWrapper>

//       {/* Navigation */}
//       <div className="flex gap-3">
//         <button
//           onClick={back}
//           className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={handleContinue}
//           className="flex-1 py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 text-sm"
//         >
//           Continue →
//         </button>
//       </div>
//     </div>
//   );
// } 




// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../store/newIndex";
import {
  Phone, X, Check, MapPin, Navigation, Search,
  Loader2, Plus, LocateFixed,
} from "lucide-react";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { useEffect, useState, useRef, useCallback } from "react";
import { search } from "india-pincode-search";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID  = "leaflet-js";
const DEFAULT_POSITION = { lat: 28.4595, lng: 77.0266 };
const MAX_RADIUS_M = 10_000;

const PLACE_CATEGORIES = [
  { key: "hospital",    label: "Hospital",    icon: "🏥", overpassFilter: '["amenity"~"hospital|clinic"]' },
  { key: "school",      label: "School",      icon: "🏫", overpassFilter: '["amenity"="school"]' },
  { key: "college",     label: "College",     icon: "🎓", overpassFilter: '["amenity"="college"]' },
  { key: "bank",        label: "Bank",        icon: "🏦", overpassFilter: '["amenity"="bank"]' },
  { key: "restaurant",  label: "Restaurant",  icon: "🍽️", overpassFilter: '["amenity"="restaurant"]' },
  { key: "mall",        label: "Mall",        icon: "🛍️", overpassFilter: '["shop"="mall"]' },
  { key: "supermarket", label: "Supermarket", icon: "🛒", overpassFilter: '["shop"="supermarket"]' },
  { key: "metro",       label: "Metro",       icon: "🚇", overpassFilter: '["railway"~"station|subway"]' },
  { key: "park",        label: "Park",        icon: "🌳", overpassFilter: '["leisure"="park"]' },
  { key: "pharmacy",    label: "Pharmacy",    icon: "💊", overpassFilter: '["amenity"="pharmacy"]' },
  { key: "atm",         label: "ATM",         icon: "🏧", overpassFilter: '["amenity"="atm"]' },
  { key: "gym",         label: "Gym",         icon: "🏋️", overpassFilter: '["leisure"="fitness_centre"]' },
];

// ─────────────────────────────────────────────
// Leaflet loader
// ─────────────────────────────────────────────

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletPromise) return window.__leafletPromise;

  window.__leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id   = LEAFLET_CSS_ID;
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById(LEAFLET_JS_ID)) {
      const script   = document.createElement("script");
      script.id      = LEAFLET_JS_ID;
      script.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async   = true;
      script.onload  = () => (window.L ? resolve(window.L) : reject(new Error("window.L missing")));
      script.onerror = () => reject(new Error("Leaflet script failed to load"));
      document.body.appendChild(script);
    } else {
      window.L ? resolve(window.L) : reject(new Error("window.L missing"));
    }
  });

  window.__leafletPromise = window.__leafletPromise.catch((e) => {
    window.__leafletPromise = undefined;
    throw e;
  });

  return window.__leafletPromise;
}

function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ─────────────────────────────────────────────
// Geocoding helpers
// ─────────────────────────────────────────────

const fmt = (s) => (s ? s.charAt(0).toUpperCase() + s.toLowerCase().slice(1) : "");

async function reverseGeocode(lat, lng, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
    { signal, headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Reverse geocoding failed.");
  const data = await res.json();
  const addr = data?.address || {};
  return {
    pincode:  addr.postcode || "",
    locality: fmt(addr.suburb || addr.neighbourhood || addr.hamlet || addr.village || addr.town || addr.city_district || addr.county || ""),
    city:     fmt(addr.city || addr.town || addr.village || addr.city_district || addr.state_district || addr.county || ""),
    state:    fmt(addr.state || ""),
  };
}

async function geocodeByText(text) {
  const res  = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0)
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

// ─────────────────────────────────────────────
// Distance helpers
// ─────────────────────────────────────────────

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R     = 6_371_000;
  const dLat  = toRad(lat2 - lat1);
  const dLng  = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

// ─────────────────────────────────────────────
// Overpass helpers
// ─────────────────────────────────────────────

async function fetchPlacesByFilter(overpassFilter, lat, lng) {
  const query = `[out:json];(node(around:${MAX_RADIUS_M},${lat},${lng})${overpassFilter}["name"];);out;`;
  const res   = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body:   query,
  });
  const data = await res.json();
  return data.elements
    .map((el) => {
      const dist = haversineMeters(lat, lng, el.lat, el.lon);
      return {
        name:           el.tags.name || "Unknown",
        type:           el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.railway || "",
        coordinates:    [el.lon, el.lat],
        distanceMeters: dist,
        distanceText:   formatDistance(dist),
      };
    })
    .filter((p) => p.distanceMeters <= MAX_RADIUS_M)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

async function fetchPlacesByName(name, lat, lng) {
  const escaped = name.replace(/"/g, '\\"');
  const query = `
[out:json];
(
  node(around:${MAX_RADIUS_M},${lat},${lng})["name"~"${escaped}",i];
  way(around:${MAX_RADIUS_M},${lat},${lng})["name"~"${escaped}",i];
);
out center;
  `;
  const res  = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body:   query,
  });
  const data = await res.json();
  return data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;
      const dist = haversineMeters(lat, lng, elLat, elLon);
      return {
        name:           el.tags.name || name,
        type:           el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.tourism || el.tags.building || "place",
        coordinates:    [elLon, elLat],
        distanceMeters: dist,
        distanceText:   formatDistance(dist),
      };
    })
    .filter(Boolean)
    .filter((p) => p.distanceMeters <= MAX_RADIUS_M)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">
    {children}
  </p>
);

const CardWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const InputField = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[#374151]">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
  </div>
);

const inputCls =
  "w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]";
const readonlyCls =
  "w-full border border-[#e5e7eb] rounded-xl px-3.5 py-3 text-sm font-medium text-[#6b7280] bg-[#f9fafb] outline-none";

// ─────────────────────────────────────────────
// NearbyPlacesPanel
// ─────────────────────────────────────────────

const GENERIC_KEY_MAP = [
  ["hospital",    '["amenity"~"hospital|clinic"]'],
  ["clinic",      '["amenity"~"hospital|clinic"]'],
  ["school",      '["amenity"="school"]'],
  ["college",     '["amenity"="college"]'],
  ["university",  '["amenity"="university"]'],
  ["bank",        '["amenity"="bank"]'],
  ["restaurant",  '["amenity"="restaurant"]'],
  ["food",        '["amenity"="restaurant"]'],
  ["mall",        '["shop"="mall"]'],
  ["market",      '["shop"="supermarket"]'],
  ["supermarket", '["shop"="supermarket"]'],
  ["metro",       '["railway"~"station|subway"]'],
  ["station",     '["railway"~"station|subway"]'],
  ["park",        '["leisure"="park"]'],
  ["pharmacy",    '["amenity"="pharmacy"]'],
  ["atm",         '["amenity"="atm"]'],
  ["gym",         '["leisure"="fitness_centre"]'],
];

function NearbyPlacesPanel({ pinnedCoords, selectedPlaces, onAdd, onRemove }) {
  const [activeCategory, setActiveCategory]   = useState(null);
  const [categoryResults, setCategoryResults] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(null);
  const [categoryError, setCategoryError]     = useState(null);
  const [query, setQuery]                     = useState("");
  const [searchResults, setSearchResults]     = useState([]);
  const [searching, setSearching]             = useState(false);
  const [searched, setSearched]               = useState(false);
  const [searchError, setSearchError]         = useState(null);
  const [autoAdded, setAutoAdded]             = useState(null);
  const abortRef                              = useRef(null);

  const isAdded = (place) =>
    selectedPlaces.some((p) => p.name === place.name && p.type === place.type);

  const handleCategoryClick = useCallback(
    async (cat) => {
      if (!pinnedCoords) return;
      if (activeCategory === cat.key) {
        setActiveCategory(null);
        setCategoryResults([]);
        return;
      }
      setActiveCategory(cat.key);
      setCategoryResults([]);
      setCategoryError(null);
      setLoadingCategory(cat.key);
      setSearched(false);
      setSearchResults([]);
      setAutoAdded(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const [lng, lat] = pinnedCoords;
        const places     = await fetchPlacesByFilter(cat.overpassFilter, lat, lng);
        setCategoryResults(places);
        if (places.length === 0)
          setCategoryError(`No ${cat.label.toLowerCase()} found within 10 km.`);
      } catch (e) {
        if (e?.name !== "AbortError") setCategoryError("Failed to load places. Try again.");
      } finally {
        setLoadingCategory(null);
      }
    },
    [pinnedCoords, activeCategory]
  );

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q || !pinnedCoords) return;

    setActiveCategory(null);
    setCategoryResults([]);
    setSearchError(null);
    setSearching(true);
    setSearched(false);
    setSearchResults([]);
    setAutoAdded(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const [lng, lat]   = pinnedCoords;
      const val          = q.toLowerCase();
      const genericMatch = GENERIC_KEY_MAP.find(([kw]) => val === kw);

      if (genericMatch) {
        const places = await fetchPlacesByFilter(genericMatch[1], lat, lng);
        setSearchResults(places);
        setSearched(true);
      } else {
        const places = await fetchPlacesByName(q, lat, lng);
        if (places.length === 0) {
          setSearchError(`"${q}" not found within 10 km. Check the name or repin your location.`);
          setSearched(true);
        } else {
          const closest = places[0];
          onAdd(closest);
          setAutoAdded(closest.name);
          setSearchResults(places);
          setSearched(true);
        }
      }
    } catch (e) {
      if (e?.name !== "AbortError") setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [query, pinnedCoords, onAdd]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const displayResults = activeCategory ? categoryResults : searchResults;
  const isLoading      = loadingCategory !== null || searching;

  if (!pinnedCoords) {
    return (
      <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
        <Navigation size={13} className="text-[#f59e0b] shrink-0" />
        <p className="text-xs text-[#92400e] font-medium">
          Pin your property location on the map first to enable nearby search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 10 km notice */}
      <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
        <MapPin size={12} className="text-[#27AE60] shrink-0" />
        <p className="text-xs text-[#166534] font-medium">
          Only places within <span className="font-bold">10 km</span> of your pinned location are shown, sorted nearest first.
        </p>
      </div>

      {/* Category chips */}
      <div>
        <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">
          Browse by category
        </p>
        <div className="flex flex-wrap gap-2">
          {PLACE_CATEGORIES.map((cat) => {
            const isActive  = activeCategory === cat.key;
            const isLoading = loadingCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  borderColor: isActive ? "#27AE60" : "#e2e8f0",
                  background:  isActive ? "#f0fdf4" : "#fff",
                  color:       isActive ? "#15803d" : "#4b5563",
                }}
              >
                {isLoading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <span style={{ fontSize: 13 }}>{cat.icon}</span>
                }
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search bar */}
      <div>
        <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">
          Search by name or keyword
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAutoAdded(null); setSearchError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. KML Shopping Mall, Apollo Hospital, Green Park..."
              className="w-full border border-[#d1d5db] rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-4 py-2.5 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#219150] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
          >
            {searching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Search
          </button>
        </div>
        <p className="text-[10px] text-[#9ca3af] mt-1.5">
          Type a specific place name to auto-add it, or a keyword (hospital, school, mall…) to browse results.
        </p>
      </div>

      {/* Auto-add success banner */}
      {autoAdded && (
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
          <Check size={13} className="text-[#27AE60] shrink-0" />
          <p className="text-xs text-[#166534] font-medium">
            <span className="font-bold">"{autoAdded}"</span> auto-added to your nearby places!
            {searchResults.length > 1 && (
              <span className="font-normal text-[#4ade80]">
                {" "}· {searchResults.length - 1} more match{searchResults.length - 1 > 1 ? "es" : ""} found below.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Errors */}
      {(categoryError || searchError) && (
        <p className="text-red-500 text-xs font-medium">{categoryError || searchError}</p>
      )}

      {/* Empty state */}
      {!isLoading && searched && !activeCategory && searchResults.length === 0 && (
        <div className="text-center py-6 text-[#9ca3af]">
          <Search size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No places found within 10 km for "{query}"</p>
          <p className="text-xs mt-1">Try a different keyword or repin your location</p>
        </div>
      )}

      {/* Results list */}
      {displayResults.length > 0 && (
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#f3f4f6]">
          <div className="flex items-center px-4 py-2 bg-[#f9fafb]">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest flex-1">
              {autoAdded && !activeCategory
                ? `More matches (${displayResults.length} within 10 km)`
                : `Place (${displayResults.length} within 10 km)`}
            </p>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest w-20 text-center mr-12">
              Distance
            </p>
          </div>
          {displayResults.map((place, idx) => {
            const added = isAdded(place);
            return (
              <div
                key={`result-${idx}`}
                className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
                  added ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"
                }`}
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-semibold text-[#111827] truncate">{place.name}</p>
                  <p className="text-xs text-[#6b7280] truncate mt-0.5 flex items-center gap-1.5">
                    <span className="capitalize">{place.type}</span>
                    {place.distanceText && (
                      <span className="inline-flex items-center gap-0.5 text-[#27AE60] font-semibold">
                        · <Navigation size={9} className="inline" /> {place.distanceText}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (added ? onRemove(place) : onAdd(place))}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                    added
                      ? "bg-[#f0fdf4] text-[#27AE60] border-[#bbf7d0]"
                      : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#27AE60] hover:text-[#27AE60]"
                  }`}
                >
                  {added ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Added chips */}
      {selectedPlaces.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">
            Added ({selectedPlaces.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPlaces.map((place, idx) => (
              <span
                key={`chip-${idx}`}
                className="bg-[#f0fdf4] text-[#27AE60] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
              >
                <MapPin size={10} className="shrink-0" />
                <span className="max-w-[140px] truncate">{place.name}</span>
                {place.distanceText && (
                  <span className="text-[#86efac] font-normal">· {place.distanceText}</span>
                )}
                <X
                  size={11}
                  className="cursor-pointer hover:text-red-500 transition-colors ml-0.5 shrink-0"
                  onClick={() => onRemove(place)}
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Step2LocationDetails({ next, back, category }) {
  const [errors, setErrors]     = useState({});
  const dispatch                = useDispatch();
  const form                    = useSelector((state) => state[category]?.form || {});

  const [markerPlaced, setMarkerPlaced] = useState(false);
  const [mapError, setMapError]         = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [mapPopup, setMapPopup]         = useState(null);

  const topRef                 = useRef(null);
  const mapContainerRef        = useRef(null);
  const mapRef                 = useRef(null);
  const markerRef              = useRef(null);
  const nearbyMarkersRef       = useRef([]);
  const reverseGeocodeAbortRef = useRef(null);
  const pinPlacedByUserRef     = useRef(false); // ✅ tracks manual user pin

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const setValue = useCallback(
    (key, value) => {
      dispatch(actions[category].updateField({ key, value }));
      if (errors[key])
        setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
    },
    [dispatch, category, errors]
  );

  // ── Place / update the property pin ──────────
  // source: "user" = manual click / GPS  |  "pincode" = driven by pincode input
  const placePropertyPin = useCallback(
    (L, map, lat, lng, source = "user") => {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;
          background:#27AE60;
          border:3px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
        "></div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
      });

      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      setMarkerPlaced(true);
      map.setView([lat, lng], 15);

      // Mark that user has manually pinned (protects against pincode overriding)
      if (source === "user") {
        pinPlacedByUserRef.current = true;
      }

      setValue("location", { type: "Point", coordinates: [lng, lat] });
      setErrors((prev) => { const u = { ...prev }; delete u.location; return u; });

      // Only reverse-geocode for user-initiated pins to avoid circular loop
      if (source === "user") {
        reverseGeocodeAbortRef.current?.abort();
        const ctrl = new AbortController();
        reverseGeocodeAbortRef.current = ctrl;

        reverseGeocode(lat, lng, ctrl.signal)
          .then(({ pincode, locality, city, state }) => {
            if (pincode)  setValue("pincode",  pincode);
            if (locality) setValue("locality", locality);
            if (city)     setValue("city",     city);
            if (state)    setValue("state",    state);
          })
          .catch((e) => { if (e?.name !== "AbortError") console.error(e); });
      }
    },
    [setValue]
  );

  // ── Draw nearby place markers on map ─────────
  const drawNearbyMarkers = useCallback((L, map, places) => {
    nearbyMarkersRef.current.forEach((m) => m.remove());
    nearbyMarkersRef.current = [];

    places.forEach((place) => {
      const [pLng, pLat] = place.coordinates;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:10px;height:10px;
          background:#3b82f6;
          border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize:   [10, 10],
        iconAnchor: [5, 5],
      });
      const m = L.marker([pLat, pLng], { icon }).addTo(map);
      m.on("click", () => setMapPopup({ place, latlng: { lat: pLat, lng: pLng } }));
      nearbyMarkersRef.current.push(m);
    });
  }, []);

  // ── Map initialisation ────────────────────────
  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;
      try {
        const L = await loadLeaflet();
        if (cancelled) return;

        fixLeafletIcons(L);

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
          zoom:   13,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          placePropertyPin(L, map, lat, lng, "user"); // ✅ user-initiated
          setMapPopup(null);
        });

        setMapError(null);
      } catch (err) {
        if (!cancelled)
          setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };

    initMap();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────
  useEffect(() => {
    return () => {
      reverseGeocodeAbortRef.current?.abort();
      nearbyMarkersRef.current.forEach((m) => m.remove());
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current  = null;
      markerRef.current = null;
    };
  }, []);

  // ── Re-draw nearby markers on selectedPlaces change ──
  useEffect(() => {
    const L   = window.L;
    const map = mapRef.current;
    if (!L || !map) return;
    const places = form.nearbyPlaces || [];
    if (places.length > 0) drawNearbyMarkers(L, map, places);
    else {
      nearbyMarkersRef.current.forEach((m) => m.remove());
      nearbyMarkersRef.current = [];
    }
  }, [form.nearbyPlaces, drawNearbyMarkers]);

  // ── Use live location ─────────────────────────
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocatingUser(false);
        const L   = window.L;
        const map = mapRef.current;
        if (!L || !map) return;
        placePropertyPin(L, map, coords.latitude, coords.longitude, "user"); // ✅ user-initiated
      },
      (err) => {
        setLocatingUser(false);
        toast.error("Could not get your location. Please allow location access.");
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, [placePropertyPin]);

  // ── Pincode auto-fill ─────────────────────────
  useEffect(() => {
    const run = async () => {
      if (!form.pincode || form.pincode.length !== 6) return;

      const result = search(form.pincode);
      if (!Array.isArray(result) || result.length === 0) return;

      const pin      = result[0];
      const locality = fmt(pin.village || pin.office || pin.taluk || "");
      const city     = fmt(pin.district || "");
      const state    = fmt(pin.state || "");

      setValue("locality", locality);
      setValue("city",     city);
      setValue("state",    state);

      // ✅ Only place map pin if user hasn't manually pinned already
      if (!pinPlacedByUserRef.current) {
        const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);
        if (geo && mapRef.current) {
          const L = window.L;
          if (!L) return;
          // source="pincode" → skips reverse geocode, avoids circular loop
          placePropertyPin(L, mapRef.current, geo.lat, geo.lng, "pincode");
        }
      }
    };
    run();
  }, [form.pincode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nearby place add / remove ─────────────────
  const handleAddPlace = useCallback(
    (place) => {
      const current = form.nearbyPlaces || [];
      if (current.some((p) => p.name === place.name && p.type === place.type)) return;
      setValue("nearbyPlaces", [
        ...current,
        {
          name:         place.name,
          type:         place.type,
          distanceText: place.distanceText || "",
          coordinates:  place.coordinates || form.location?.coordinates || [0, 0],
          order:        current.length,
        },
      ]);
    },
    [form.nearbyPlaces, form.location, setValue]
  );

  const handleRemovePlace = useCallback(
    (place) => {
      setValue(
        "nearbyPlaces",
        (form.nearbyPlaces || []).filter(
          (p) => !(p.name === place.name && p.type === place.type)
        )
      );
    },
    [form.nearbyPlaces, setValue]
  );

  // ── Validation ────────────────────────────────
  const validateStep2 = () => {
    const e = {};
    if (!form.address)                               e.address  = "Address is required";
    if (!form.pincode || form.pincode.length !== 6)  e.pincode  = "Valid 6-digit pincode required";
    if (!form.location)                              e.location = "Please pin property location on map";
    if (!form.locality)                              e.locality = "Locality is required";
    if (!form.city)                                  e.city     = "City is required";
    if (!form.state)                                 e.state    = "State is required";
    return e;
  };

  const handleContinue = async () => {
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const propertyId = localStorage.getItem("propertyId");
    if (!propertyId) { toast.error("Property ID missing."); return; }
    try {
      await dispatch(savePropertyData({ category, id: propertyId, step: "location" })).unwrap();
      toast.success("Location saved!");
      next();
    } catch (err) {
      console.error("API Error:", err);
      toast.error(err.message || "Failed to save location");
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div ref={topRef} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#27AE60]">Location Details</h2>
          <p className="text-xs text-[#000000] mt-0.5">Where is your property located?</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-sm bg-[#f0fdf4] border border-[#bbf7d0] text-[#27AE60] font-semibold px-4 py-2 rounded-xl hover:bg-[#dcfce7] transition-colors"
        >
          <Phone size={13} />
          Get a callback
        </button>
      </div>

      {/* Address card */}
      <CardWrapper>
        <SectionLabel>Address Information</SectionLabel>
        <div className="space-y-4">
          <InputField label="Address Line" error={errors.address}>
            <textarea
              rows={3}
              value={form.address || ""}
              onChange={(e) => setValue("address", e.target.value)}
              placeholder="Enter full address..."
              className={inputCls + " resize-none"}
            />
          </InputField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(form.propertyCategory === "residential" || form.propertyCategory === "commercial") && (
              <InputField label="Apartment / Society" error={errors.buildingName}>
                <input
                  value={form.buildingName || ""}
                  onChange={(e) => setValue("buildingName", e.target.value)}
                  placeholder="Society / Building name"
                  className={inputCls}
                />
              </InputField>
            )}
            {(form.propertyCategory === "land" || form.propertyCategory === "agricultural") && (
              <InputField label="Land Name / Society" error={errors.landName}>
                <input
                  value={form.landName || ""}
                  onChange={(e) => setValue("landName", e.target.value)}
                  placeholder="Land Name / Society Name"
                  className={inputCls}
                />
              </InputField>
            )}
            <InputField label="Pincode" error={errors.pincode}>
              <input
                value={form.pincode || ""}
                onChange={(e) => setValue("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                maxLength={6}
                className={inputCls}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Locality" error={errors.locality}>
              <input value={form.locality || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
            </InputField>
            <InputField label="City" error={errors.city}>
              <input value={form.city || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
            </InputField>
            <InputField label="State" error={errors.state}>
              <input value={form.state || ""} readOnly placeholder="Auto-filled" className={readonlyCls} />
            </InputField>
          </div>
        </div>
      </CardWrapper>

      {/* Map card */}
      <CardWrapper>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
              <MapPin size={14} className="text-[#27AE60]" />
            </div>
            <div>
              <SectionLabel>Pin Property Location</SectionLabel>
              <p className="text-[10px] text-[#9ca3af] -mt-2">
                Click on the map or use your live location
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locatingUser}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#27AE60] text-[#27AE60] bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {locatingUser ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
            {locatingUser ? "Locating…" : "Use My Location"}
          </button>
        </div>

        <div
          className="relative z-10 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-inner"
          style={{ height: 320 }}
        >
          {mapError ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm px-4 text-center bg-[#f9fafb]">
              {mapError}
            </div>
          ) : (
            <div ref={mapContainerRef} className="h-full w-full" />
          )}
        </div>

        {!markerPlaced && !mapError && (
          <div className="mt-2 flex items-center gap-1.5 text-[#f59e0b]">
            <Navigation size={12} />
            <p className="text-xs font-medium">
              Click on the map or use "Use My Location" to pin your property
            </p>
          </div>
        )}
        {markerPlaced && (
          <div className="mt-2 flex items-center gap-1.5 text-[#27AE60]">
            <Check size={12} />
            <p className="text-xs font-medium">
              Location pinned — click map to repin
              {(form.locality || form.city)
                ? ` · ${[form.locality, form.city].filter(Boolean).join(", ")}`
                : ""}
            </p>
          </div>
        )}
        {errors.location && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>
        )}

        {/* Inline map popup */}
        {mapPopup && (
          <div className="mt-3 flex items-center justify-between bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 shadow-sm">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate">{mapPopup.place.name}</p>
              <p className="text-xs text-[#6b7280] mt-0.5 flex items-center gap-1">
                <span className="capitalize">{mapPopup.place.type}</span>
                {mapPopup.place.distanceText && (
                  <span className="text-[#27AE60] font-semibold">
                    · <Navigation size={9} className="inline" /> {mapPopup.place.distanceText}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              {(form.nearbyPlaces || []).some(
                (p) => p.name === mapPopup.place.name && p.type === mapPopup.place.type
              ) ? (
                <button
                  type="button"
                  onClick={() => { handleRemovePlace(mapPopup.place); setMapPopup(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border bg-[#f0fdf4] text-[#27AE60] border-[#bbf7d0]"
                >
                  <Check size={11} /> Added
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddPlace(mapPopup.place)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border bg-[#27AE60] text-white border-[#27AE60] hover:bg-[#219150] transition-colors"
                >
                  <Plus size={11} /> Add Place
                </button>
              )}
              <button
                type="button"
                onClick={() => setMapPopup(null)}
                className="text-[#9ca3af] hover:text-[#374151] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </CardWrapper>

      {/* Nearby places panel */}
      <CardWrapper>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
            <Search size={14} className="text-[#27AE60]" />
          </div>
          <div>
            <SectionLabel>Nearby Places</SectionLabel>
            <p className="text-[10px] text-[#9ca3af] -mt-2">
              Browse categories or search to add real places near your property
            </p>
          </div>
        </div>
        <NearbyPlacesPanel
          pinnedCoords={form.location?.coordinates || null}
          selectedPlaces={form.nearbyPlaces || []}
          onAdd={handleAddPlace}
          onRemove={handleRemovePlace}
        />
      </CardWrapper>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={back}
          className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}