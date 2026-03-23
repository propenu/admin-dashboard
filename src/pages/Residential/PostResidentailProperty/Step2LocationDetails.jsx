// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
// import { useDispatch, useSelector } from "react-redux";
// import { actions } from "../../../store/newIndex";
// import { Phone, X, Check, MapPin, Navigation, Search, Loader2, Plus } from "lucide-react";
// import { savePropertyData } from "../../../store/common/propertyThunks";
// import { useEffect, useState, useRef, useId, useMemo, useCallback } from "react";
// import { search } from "india-pincode-search";
// import { toast } from "sonner";
// import { ENV } from "../../../config/env";

// // ─────────────────────────────────────────────
// // Mappls SDK helpers
// // ─────────────────────────────────────────────

// const MAPPLS_SCRIPT_ID = "mappls-sdk-script";
// const DEFAULT_POSITION = { lat: 28.4595, lng: 77.0266 };

// function getMapplsGlobal() {
//   return window.mappls ?? window.Mappls;
// }

// const handlePincodeChange = async (pincode) => {
//   if (!pincode || pincode.length !== 6) return;

//   // 1. Get locality, city, state
//   const result = search(pincode);
//   if (!Array.isArray(result) || result.length === 0) return;

//   const pin = result[0];

//   const locality = fmt(pin.village || pin.office || pin.taluk || "");
//   const city = fmt(pin.district || "");
//   const state = fmt(pin.state || "");

//   setValue("locality", locality);
//   setValue("city", city);
//   setValue("state", state);

//   // 2. Convert to lat/lng
//   const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);

//   if (geo && mapRef.current && sdkRef.current) {
//     const coords = [geo.lng, geo.lat];

//     // 3. Update marker on map
//     removeMarker(markerRef.current);
//     markerRef.current = new sdkRef.current.Marker({
//       map: mapRef.current,
//       position: { lat: geo.lat, lng: geo.lng },
//       fitbounds: false,
//     });

//     setMarkerPlaced(true);
//     recenterMap(mapRef.current, geo.lat, geo.lng, 13);

//     // 4. Save location
//     setValue("location", { type: "Point", coordinates: coords });
//   }
// };


// function loadMapplsSdk(apiKey) {
//   const existing = getMapplsGlobal();
//   if (existing) return Promise.resolve(existing);
//   if (window.__mapplsSdkPromise) return window.__mapplsSdkPromise;

//   window.__mapplsSdkPromise = new Promise((resolve, reject) => {
//     const handleReady = () => {
//       const sdk = getMapplsGlobal();
//       if (sdk) resolve(sdk);
//       else reject(new Error("Mappls SDK loaded but global object not found."));
//     };
//     const existingScript = document.getElementById(MAPPLS_SCRIPT_ID);
//     if (existingScript) {
//       if (getMapplsGlobal()) { handleReady(); return; }
//       existingScript.addEventListener("load", handleReady, { once: true });
//       existingScript.addEventListener("error", () => reject(new Error("Failed to load Mappls SDK.")), { once: true });
//       return;
//     }
//     const script = document.createElement("script");
//     script.id = MAPPLS_SCRIPT_ID;
//     script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
//     script.async = true;
//     script.onload = handleReady;
//     script.onerror = () => reject(new Error("Failed to load Mappls SDK script."));
//     document.body.appendChild(script);
//   });

//   window.__mapplsSdkPromise = window.__mapplsSdkPromise.catch((err) => {
//     window.__mapplsSdkPromise = undefined;
//     throw err;
//   });
//   return window.__mapplsSdkPromise;
// }

// function removeMarker(marker) {
//   if (!marker) return;
//   try {
//     if (typeof marker.remove === "function") { marker.remove(); return; }
//     if (typeof marker.setMap === "function") marker.setMap(null);
//   } catch (e) { console.warn("Marker cleanup:", e); }
// }

// function recenterMap(map, lat, lng, zoom) {
//   map.setCenter?.({ lat, lng });
//   map.setZoom?.(zoom);
//   map.panTo?.({ lat, lng });
// }

// // ─────────────────────────────────────────────
// // Geocoding helpers
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
//     locality: fmt(addr.suburb || addr.neighbourhood || addr.hamlet || addr.village || addr.town || addr.city_district || addr.county || ""),
//     city: fmt(addr.city || addr.town || addr.village || addr.city_district || addr.state_district || addr.county || ""),
//     state: fmt(addr.state || ""),
//   };
// }

// async function geocodeByText(text) {
//   const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`);
//   const data = await res.json();
//   if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
//   return null;
// }

// // ─────────────────────────────────────────────
// // Haversine distance
// // ─────────────────────────────────────────────

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
// // Mappls Nearby Search API
// // ─────────────────────────────────────────────
// const PLACE_TYPES = {
//   hospital: '["amenity"="hospital"]',
//   school: '["amenity"="school"]',
//   college: '["amenity"="college"]',
//   bank: '["amenity"="bank"]',
//   restaurant: '["amenity"="restaurant"]',
//   mall: '["shop"="mall"]',
//   supermarket: '["shop"="supermarket"]',
//   metro: '["railway"="station"]',
//   park: '["leisure"="park"]',
// };



// async function searchNearbyPlaces(query, lat, lng) {
//   const normalizeQuery = (q) => {
//     const val = q.toLowerCase().trim();

//     if (val.includes("hospital")) return "hospital";
//     if (val.includes("school")) return "school";
//     if (val.includes("college")) return "college";
//     if (val.includes("bank")) return "bank";
//     if (val.includes("restaurant")) return "restaurant";
//     if (val.includes("mall")) return "mall";
//     if (val.includes("market") || val.includes("supermarket"))
//       return "supermarket";
//     if (val.includes("metro") || val.includes("station")) return "metro";
//     if (val.includes("park")) return "park";

//     return null;
//   };

//   const key = normalizeQuery(query);
//   if (!key) throw new Error("Unsupported place type");

//   const PLACE_TYPES = {
//     hospital: '["amenity"~"hospital|clinic"]',
//     school: '["amenity"="school"]',
//     college: '["amenity"="college"]',
//     bank: '["amenity"="bank"]',
//     restaurant: '["amenity"="restaurant"]',
//     mall: '["shop"="mall"]',
//     supermarket: '["shop"="supermarket"]',
//     metro: '["railway"~"station|subway"]',
//     park: '["leisure"="park"]',
//   };

//   const typeFilter = PLACE_TYPES[key];

//   const overpassQuery = `
//   [out:json];
//   (
//     node(around:5000,${lat},${lng})${typeFilter}["name"];
//   );
//   out;
//   `;

//   const res = await fetch("https://overpass-api.de/api/interpreter", {
//     method: "POST",
//     body: overpassQuery,
//   });

//   const data = await res.json();

//   return data.elements.map((el) => ({
//     name: el.tags.name || key,
//     type: key,
//     coordinates: [el.lon, el.lat],
//   }));
// }



// const SectionLabel = ({ children }) => (
//   <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">{children}</p>
// );

// const CardWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>{children}</div>
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

// function NearbyPlaceSearch({ pinnedCoords, selectedPlaces, onAdd, onRemove, apiKey }) {
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
//     const controller = new AbortController();
//     abortRef.current = controller;

//     try {
//       const [lng, lat] = pinnedCoords;
//       const places = await searchNearbyPlaces(q, lat, lng, apiKey, controller.signal);
//       setResults(places);
//       setSearched(true);
//     } catch (e) {
//       if (e?.name === "AbortError") return;
//       setSearchError("Search failed. Please try again.");
//       console.error("Nearby search error:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [query, pinnedCoords, apiKey]);

//   useEffect(() => () => abortRef.current?.abort(), []);

//   const isAdded = (place) =>
//     selectedPlaces.some((p) => p.name === place.name && p.type === place.type);

//   return (
//     <div className="space-y-4">
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
//           {loading
//             ? <Loader2 size={14} className="animate-spin" />
//             : <Search size={14} />}
//           Search
//         </button>
//       </div>

//       {/* Search error */}
//       {searchError && <p className="text-red-500 text-xs font-medium">{searchError}</p>}

//       {/* No results */}
//       {searched && !loading && results.length === 0 && (
//         <div className="text-center py-6 text-[#9ca3af]">
//           <Search size={24} className="mx-auto mb-2 opacity-40" />
//           <p className="text-sm">No places found for "{query}"</p>
//           <p className="text-xs mt-1">Try a different keyword</p>
//         </div>
//       )}

//       {/* Results list */}
//       {results.length > 0 && (
//         <div className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#f3f4f6]">
//           {results.map((place, idx) => {
//             const added = isAdded(place);
//             return (
//               <div
//                 key={`result-${idx}`}
//                 className={`flex items-center justify-between px-4 py-3.5 transition-colors ${added ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"}`}
//               >
//                 <div className="min-w-0 flex-1 mr-3">
//                   <p className="text-sm font-semibold text-[#111827] truncate">{place.name}</p>
//                   <p className="text-xs text-[#6b7280] truncate mt-0.5">
//                     {place.type}
//                     {place.distanceText ? (
//                       <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#27AE60] font-medium">
//                         • {place.distanceText}
//                       </span>
//                     ) : null}
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => added ? onRemove(place) : onAdd(place)}
//                   className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
//                     added
//                       ? "bg-[#f0fdf4] text-[#27AE60] border-[#bbf7d0]"
//                       : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#27AE60] hover:text-[#27AE60]"
//                   }`}
//                 >
//                   {added ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Added places chips */}
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


// export default function Step2LocationDetails({ next, back, category }) {
//   const [errors, setErrors] = useState({});
//   const dispatch = useDispatch();
//   const form = useSelector((state) => state[category]?.form || {});

//   const [markerPlaced, setMarkerPlaced] = useState(false);
//   const [mapError, setMapError] = useState(null);

//   const topRef = useRef(null);
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
//   const sdkRef = useRef(null);
//   const clickListenerAttachedRef = useRef(false);
//   const reverseGeocodeAbortRef = useRef(null);

//   const rawId = useId();
//   const containerId = useMemo(() => "mappls-step2-" + rawId.replace(/:/g, ""), [rawId]);
//   const apiKey = ENV.MAPPLS_API_KEY;

//   useEffect(() => {
//     topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   }, []);

//   const setValue = (key, value) => {
//     dispatch(actions[category].updateField({ key, value }));
//     if (errors[key]) setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
//   };

//   // ── Map init ──────────────────────────────────
//   useEffect(() => {
//     let cancelled = false;
//     const initMap = async () => {
//       if (!apiKey) { setMapError("Mappls API key missing."); return; }
//       if (!mapContainerRef.current) return;
//       try {
//         const sdk = await loadMapplsSdk(apiKey);
//         if (cancelled) return;
//         sdkRef.current = sdk;
//         if (!mapRef.current) {
//           mapRef.current = new sdk.Map(containerId, {
//             center: DEFAULT_POSITION,
//             zoom: 13,
//             zoomControl: true,
//             location: false,
//           });
//         }
//         if (mapRef.current && !clickListenerAttachedRef.current) {
//           const onMapClick = (event) => {
//             const ev = event;
//             const lat = Number(ev?.latlng?.lat ?? ev?.lngLat?.lat ?? ev?.lat);
//             const lng = Number(ev?.latlng?.lng ?? ev?.lngLat?.lng ?? ev?.lng);
//             if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

//             removeMarker(markerRef.current);
//             markerRef.current = new sdk.Marker({ map: mapRef.current, position: { lat, lng }, fitbounds: false });
//             setMarkerPlaced(true);
//             recenterMap(mapRef.current, lat, lng, 15);

//             const coords = [lng, lat];
//             setValue("location", { type: "Point", coordinates: coords });
//             const updatedPlaces = (form.nearbyPlaces || []).map((p) => ({ ...p, coordinates: coords }));
//             if (updatedPlaces.length) setValue("nearbyPlaces", updatedPlaces);
//             setErrors((prev) => { const u = { ...prev }; delete u.location; return u; });

//             reverseGeocodeAbortRef.current?.abort();
//             const controller = new AbortController();
//             reverseGeocodeAbortRef.current = controller;
//             reverseGeocode(lat, lng, controller.signal)
//               .then(({ pincode, locality, city, state }) => {
//                 if (pincode) setValue("pincode", pincode);
//                 if (locality) setValue("locality", locality);
//                 if (city) setValue("city", city);
//                 if (state) setValue("state", state);
//               })
//               .catch((e) => { if (e?.name !== "AbortError") console.error(e); });
//           };
//           mapRef.current.on?.("click", onMapClick);
//           mapRef.current.addListener?.("click", onMapClick);
//           clickListenerAttachedRef.current = true;
//         }
//         setMapError(null);
//       } catch (err) {
//         if (!cancelled) setMapError(err instanceof Error ? err.message : "Unable to load map.");
//       }
//     };
//     initMap();
//     return () => { cancelled = true; };
//   }, [apiKey, containerId]);

//   useEffect(() => {
//     return () => {
//       reverseGeocodeAbortRef.current?.abort();
//       removeMarker(markerRef.current);
//       markerRef.current = null;
//       if (mapContainerRef.current) mapContainerRef.current.innerHTML = "";
//       mapRef.current = null;
//       sdkRef.current = null;
//       clickListenerAttachedRef.current = false;
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
//       if (geo) {
//         const coords = [geo.lng, geo.lat];
//         if (sdkRef.current && mapRef.current) {
//           removeMarker(markerRef.current);
//           markerRef.current = new sdkRef.current.Marker({ map: mapRef.current, position: { lat: geo.lat, lng: geo.lng }, fitbounds: false });
//           setMarkerPlaced(true);
//           recenterMap(mapRef.current, geo.lat, geo.lng, 13);
//         }
//         setValue("location", { type: "Point", coordinates: coords });
//       }
//     };
//     run();
//   }, [form.pincode]);

//   // ── Nearby place add/remove ───────────────────
//   const handleAddPlace = useCallback((place) => {
//     const current = form.nearbyPlaces || [];
//     if (current.some((p) => p.name === place.name && p.type === place.type)) return;
//     setValue("nearbyPlaces", [
//       ...current,
//       {
//         name: place.name,
//         type: place.type,
//         distanceText: place.distanceText || "",
//         coordinates: place.coordinates || form.location?.coordinates || [0, 0],
//         order: current.length,
//       },
//     ]);
//   }, [form.nearbyPlaces, form.location]);

//   const handleRemovePlace = useCallback((place) => {
//     setValue("nearbyPlaces",
//       (form.nearbyPlaces || []).filter((p) => !(p.name === place.name && p.type === place.type))
//     );
//   }, [form.nearbyPlaces]);

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
//     if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
//     const propertyId = localStorage.getItem("propertyId");
//     if (!propertyId) { toast.error("Property ID missing."); return; }
//     try {
//       await dispatch(savePropertyData({ category, id: propertyId, step: "location" })).unwrap();
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
//           <p className="text-xs text-[#000000] mt-0.5">
//             Where is your property located?
//           </p>
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
//               <InputField
//                 label="Apartment / Society"
//                 error={errors.buildingName}
//               >
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
//                 // onChange={(e) => setValue("pincode", e.target.value)}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setValue("pincode", value);

//                   if (value.length === 6) {
//                     handlePincodeChange(value); // 🔥 AUTO MAP UPDATE
//                   }
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
//             <div
//               id={containerId}
//               ref={mapContainerRef}
//               className="h-full w-full"
//             />
//           )}
//         </div>

//         {!markerPlaced && !mapError && (
//           <div className="mt-2 flex items-center gap-1.5 text-[#f59e0b]">
//             <Navigation size={12} />
//             <p className="text-xs font-medium">
//               Click on the map to pin your location
//             </p>
//           </div>
//         )}
//         {markerPlaced && (
//           <div className="mt-2 flex items-center gap-1.5 text-[#27AE60]">
//             <Check size={12} />
//             <p className="text-xs font-medium">Location pinned successfully</p>
//           </div>
//         )}
//         {errors.location && (
//           <p className="text-red-500 text-xs mt-1 font-medium">
//             {errors.location}
//           </p>
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
//               Pin your property location on the map first to enable nearby
//               search.
//             </p>
//           </div>
//         )}

//         <NearbyPlaceSearch
//           pinnedCoords={form.location?.coordinates || null}
//           selectedPlaces={form.nearbyPlaces || []}
//           onAdd={handleAddPlace}
//           onRemove={handleRemovePlace}
//           apiKey={apiKey}
//         />

//         {errors.nearbyPlaces && (
//           <p className="text-red-500 text-xs mt-2 font-medium">
//             {errors.nearbyPlaces}
//           </p>
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
import { Phone, X, Check, MapPin, Navigation, Search, Loader2, Plus } from "lucide-react";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { useEffect, useState, useRef, useCallback } from "react";
import { search } from "india-pincode-search";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Leaflet (OpenStreetMap) helpers
// ─────────────────────────────────────────────

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID = "leaflet-js";
const DEFAULT_POSITION = { lat: 28.4595, lng: 77.0266 };

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletPromise) return window.__leafletPromise;

  window.__leafletPromise = new Promise((resolve, reject) => {
    // Inject CSS if not present
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject JS if not present
    if (!document.getElementById(LEAFLET_JS_ID)) {
      const script = document.createElement("script");
      script.id = LEAFLET_JS_ID;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        if (window.L) resolve(window.L);
        else reject(new Error("Leaflet loaded but window.L not found."));
      };
      script.onerror = () => reject(new Error("Failed to load Leaflet script."));
      document.body.appendChild(script);
    } else {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet script exists but window.L not found."));
    }
  });

  window.__leafletPromise = window.__leafletPromise.catch((err) => {
    window.__leafletPromise = undefined;
    throw err;
  });

  return window.__leafletPromise;
}

// Fix Leaflet default marker icon paths (common issue with bundlers)
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ─────────────────────────────────────────────
// Geocoding helpers (Nominatim)
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
    pincode: addr.postcode || "",
    locality: fmt(
      addr.suburb ||
        addr.neighbourhood ||
        addr.hamlet ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.county ||
        ""
    ),
    city: fmt(
      addr.city ||
        addr.town ||
        addr.village ||
        addr.city_district ||
        addr.state_district ||
        addr.county ||
        ""
    ),
    state: fmt(addr.state || ""),
  };
}

async function geocodeByText(text) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0)
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

// ─────────────────────────────────────────────
// Haversine distance calculator
// ─────────────────────────────────────────────

const MAX_RADIUS_KM = 10;
const MAX_RADIUS_M  = MAX_RADIUS_KM * 1000; // 10,000 m

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
// Nearby Places Search (Overpass API — 10 km cap)
// ─────────────────────────────────────────────

async function searchNearbyPlaces(query, lat, lng) {
  const val = query.toLowerCase().trim();

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
  };

  const KEY_MATCH = [
    ["hospital",    "hospital"],
    ["school",      "school"],
    ["college",     "college"],
    ["bank",        "bank"],
    ["restaurant",  "restaurant"],
    ["mall",        "mall"],
    ["market",      "supermarket"],
    ["supermarket", "supermarket"],
    ["metro",       "metro"],
    ["station",     "metro"],
    ["park",        "park"],
  ];

  const matched = KEY_MATCH.find(([kw]) => val.includes(kw));
  if (!matched) throw new Error("Unsupported place type");

  const key = matched[1];
  const typeFilter = TYPE_MAP[key];

  // Query Overpass with MAX_RADIUS_M (10 km) directly in the API call
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

  const data = await res.json();

  // Calculate distance for every result, filter to <= 10 km, then sort nearest first
  const withDistance = data.elements
    .map((el) => {
      const distMeters = haversineMeters(lat, lng, el.lat, el.lon);
      return {
        name: el.tags.name || key,
        type: key,
        coordinates: [el.lon, el.lat],
        distanceMeters: distMeters,
        distanceText: formatDistance(distMeters),
      };
    })
    .filter((p) => p.distanceMeters <= MAX_RADIUS_M)   // strict 10 km guard
    .sort((a, b) => a.distanceMeters - b.distanceMeters); // nearest first

  return withDistance;
}

// ─────────────────────────────────────────────
// Shared UI components
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
// NearbyPlaceSearch sub-component
// ─────────────────────────────────────────────

function NearbyPlaceSearch({ pinnedCoords, selectedPlaces, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const abortRef = useRef(null);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    if (!pinnedCoords) {
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
      const [lng, lat] = pinnedCoords;
      const places = await searchNearbyPlaces(q, lat, lng);
      setResults(places);
      setSearched(true);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setSearchError("Search failed. Please try again.");
      console.error("Nearby search error:", e);
    } finally {
      setLoading(false);
    }
  }, [query, pinnedCoords]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const isAdded = (place) =>
    selectedPlaces.some((p) => p.name === place.name && p.type === place.type);

  return (
    <div className="space-y-4">
      {/* 10 km radius notice */}
      <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
        <MapPin size={12} className="text-[#27AE60] shrink-0" />
        <p className="text-xs text-[#166534] font-medium">
          Only places within <span className="font-bold">10 km</span> of your pinned location are shown, sorted nearest first.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. hospital, school, metro station, mall..."
            className="w-full border border-[#d1d5db] rounded-xl pl-9 pr-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#219150] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </div>

      {searchError && <p className="text-red-500 text-xs font-medium">{searchError}</p>}

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-6 text-[#9ca3af]">
          <Search size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No places found within 10 km for "{query}"</p>
          <p className="text-xs mt-1">Try a different keyword or repin your location</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#f3f4f6]">
          {/* Column header */}
          <div className="flex items-center px-4 py-2 bg-[#f9fafb]">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest flex-1">
              Place ({results.length} within 10 km)
            </p>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest w-20 text-center mr-12">
              Distance
            </p>
          </div>

          {results.map((place, idx) => {
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
                  {added ? (
                    <><Check size={11} /> Added</>
                  ) : (
                    <><Plus size={11} /> Add</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

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
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const form = useSelector((state) => state[category]?.form || {});

  const [markerPlaced, setMarkerPlaced] = useState(false);
  const [mapError, setMapError] = useState(null);

  const topRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);           // Leaflet map instance
  const markerRef = useRef(null);        // Leaflet marker instance
  const reverseGeocodeAbortRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const setValue = useCallback(
    (key, value) => {
      dispatch(actions[category].updateField({ key, value }));
      if (errors[key]) setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
    },
    [dispatch, category, errors]
  );

  // ── Map init (Leaflet / OpenStreetMap) ───────
  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const L = await loadLeaflet();
        if (cancelled) return;

        fixLeafletIcons(L);

        // Prevent double-init
        if (mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_POSITION.lat, DEFAULT_POSITION.lng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        // Map click handler
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;

          // Remove existing marker
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }

          markerRef.current = L.marker([lat, lng]).addTo(map);
          setMarkerPlaced(true);
          map.setView([lat, lng], 15);

          const coords = [lng, lat];
          setValue("location", { type: "Point", coordinates: coords });
          setErrors((prev) => { const u = { ...prev }; delete u.location; return u; });

          // Reverse geocode
          reverseGeocodeAbortRef.current?.abort();
          const controller = new AbortController();
          reverseGeocodeAbortRef.current = controller;

          reverseGeocode(lat, lng, controller.signal)
            .then(({ pincode, locality, city, state }) => {
              if (pincode) setValue("pincode", pincode);
              if (locality) setValue("locality", locality);
              if (city) setValue("city", city);
              if (state) setValue("state", state);
            })
            .catch((e) => {
              if (e?.name !== "AbortError") console.error(e);
            });
        });

        setMapError(null);
      } catch (err) {
        if (!cancelled)
          setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, []); // run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reverseGeocodeAbortRef.current?.abort();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Pincode auto-fill ─────────────────────────
  useEffect(() => {
    const run = async () => {
      if (!form.pincode || form.pincode.length !== 6) return;

      const result = search(form.pincode);
      if (!Array.isArray(result) || result.length === 0) return;

      const pin = result[0];
      const locality = fmt(pin.village || pin.office || pin.taluk || "");
      const city = fmt(pin.district || "");
      const state = fmt(pin.state || "");

      setValue("locality", locality);
      setValue("city", city);
      setValue("state", state);

      const geo = await geocodeByText(`${locality}, ${city}, ${state}, India`);
      if (geo && mapRef.current) {
        const L = window.L;
        if (!L) return;

        const { lat, lng } = geo;
        const coords = [lng, lat];

        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        setMarkerPlaced(true);
        mapRef.current.setView([lat, lng], 13);

        setValue("location", { type: "Point", coordinates: coords });
      }
    };

    run();
  }, [form.pincode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Nearby place add/remove ───────────────────
  const handleAddPlace = useCallback(
    (place) => {
      const current = form.nearbyPlaces || [];
      if (current.some((p) => p.name === place.name && p.type === place.type)) return;
      setValue("nearbyPlaces", [
        ...current,
        {
          name: place.name,
          type: place.type,
          distanceText: place.distanceText || "",
          coordinates: place.coordinates || form.location?.coordinates || [0, 0],
          order: current.length,
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
    if (!form.address) e.address = "Address is required";
    if (!form.pincode || form.pincode.length !== 6) e.pincode = "Valid 6-digit pincode required";
    if (!form.location) e.location = "Please pin property location on map";
    if (!form.locality) e.locality = "Locality is required";
    if (!form.city) e.city = "City is required";
    if (!form.state) e.state = "State is required";
    return e;
  };

  const handleContinue = async () => {
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const propertyId = localStorage.getItem("propertyId");
    if (!propertyId) {
      toast.error("Property ID missing.");
      return;
    }
    try {
      await dispatch(
        savePropertyData({ category, id: propertyId, step: "location" })
      ).unwrap();
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
            {(form.propertyCategory === "residential" ||
              form.propertyCategory === "commercial") && (
              <InputField label="Apartment / Society" error={errors.buildingName}>
                <input
                  value={form.buildingName || ""}
                  onChange={(e) => setValue("buildingName", e.target.value)}
                  placeholder="Society / Building name"
                  className={inputCls}
                />
              </InputField>
            )}
            {(form.propertyCategory === "land" ||
              form.propertyCategory === "agricultural") && (
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
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setValue("pincode", value);
                }}
                placeholder="6-digit pincode"
                maxLength={6}
                className={inputCls}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Locality" error={errors.locality}>
              <input
                value={form.locality || ""}
                readOnly
                placeholder="Auto-filled"
                className={readonlyCls}
              />
            </InputField>
            <InputField label="City" error={errors.city}>
              <input
                value={form.city || ""}
                readOnly
                placeholder="Auto-filled"
                className={readonlyCls}
              />
            </InputField>
            <InputField label="State" error={errors.state}>
              <input
                value={form.state || ""}
                readOnly
                placeholder="Auto-filled"
                className={readonlyCls}
              />
            </InputField>
          </div>
        </div>
      </CardWrapper>

      {/* Map card */}
      <CardWrapper>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
            <MapPin size={14} className="text-[#27AE60]" />
          </div>
          <div>
            <SectionLabel>Pin Property Location</SectionLabel>
            <p className="text-[10px] text-[#9ca3af] -mt-2">
              Click on the map to mark exact location
            </p>
          </div>
        </div>

        <div className="relative z-10 h-64 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-inner">
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
            <p className="text-xs font-medium">Click on the map to pin your location</p>
          </div>
        )}
        {markerPlaced && (
          <div className="mt-2 flex items-center gap-1.5 text-[#27AE60]">
            <Check size={12} />
            <p className="text-xs font-medium">Location pinned successfully</p>
          </div>
        )}
        {errors.location && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>
        )}
      </CardWrapper>

      {/* Nearby places search card */}
      <CardWrapper>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
            <Search size={14} className="text-[#27AE60]" />
          </div>
          <div>
            <SectionLabel>Nearby Places</SectionLabel>
            <p className="text-[10px] text-[#9ca3af] -mt-2">
              Search and add real places near your property
            </p>
          </div>
        </div>

        {!form.location && (
          <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 mb-4">
            <Navigation size={13} className="text-[#f59e0b] shrink-0" />
            <p className="text-xs text-[#92400e] font-medium">
              Pin your property location on the map first to enable nearby search.
            </p>
          </div>
        )}

        <NearbyPlaceSearch
          pinnedCoords={form.location?.coordinates || null}
          selectedPlaces={form.nearbyPlaces || []}
          onAdd={handleAddPlace}
          onRemove={handleRemovePlace}
        />

        {errors.nearbyPlaces && (
          <p className="text-red-500 text-xs mt-2 font-medium">{errors.nearbyPlaces}</p>
        )}
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