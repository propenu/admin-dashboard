


// // frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/LocationEditor.jsx
// import React, { useState, useEffect, useRef } from "react";

// const PRIMARY = "#27AE60";

// /* ── Load Leaflet from CDN ── */
// function loadLeaflet() {
//   if (typeof window === "undefined") return Promise.reject("No window");
//   if (window.L) return Promise.resolve(window.L);

//   return new Promise((resolve, reject) => {
//     const cssURL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//     if (!document.querySelector(`link[href="${cssURL}"]`)) {
//       const link = document.createElement("link");
//       link.rel  = "stylesheet";
//       link.href = cssURL;
//       document.head.appendChild(link);
//     }
//     const jsURL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//     if (document.querySelector(`script[src="${jsURL}"]`)) {
//       const wait = () => { window.L ? resolve(window.L) : setTimeout(wait, 50); };
//       wait();
//       return;
//     }
//     const script   = document.createElement("script");
//     script.src     = jsURL;
//     script.async   = true;
//     script.defer   = true;
//     script.onload  = () => (window.L ? resolve(window.L) : reject("L missing"));
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// }

// /* ── Type → emoji ── */
// function typeIcon(type = "") {
//   const t = type.toLowerCase();
//   if (t.includes("school") || t.includes("college"))  return "🎓";
//   if (t.includes("hospital") || t.includes("clinic")) return "🏥";
//   if (t.includes("mall") || t.includes("shop"))       return "🛍️";
//   if (t.includes("park") || t.includes("garden"))     return "🌳";
//   if (t.includes("metro") || t.includes("station"))   return "🚇";
//   if (t.includes("airport"))  return "✈️";
//   if (t.includes("hotel"))    return "🏨";
//   if (t.includes("gym"))      return "💪";
//   if (t.includes("restaurant") || t.includes("cafe")) return "🍽️";
//   if (t.includes("bank") || t.includes("atm"))        return "🏦";
//   return "📍";
// }



// export default function LocationEditor({ formData, setFormData, onSave, saving }) {
//   if (!formData) return null;

//   const location = formData.location || { type: "Point", coordinates: [0, 0] };
//   const places   = formData.nearbyPlaces || [];

//   const [newPlace, setNewPlace]   = useState({ name: "", type: "", coordinates: ["", ""] });
//   const [openPlace, setOpenPlace] = useState(null);

//   /* map */
//   const mapRef        = useRef(null);
//   const leafletMapRef = useRef(null);
//   const markersRef    = useRef({ project: null, nearby: [] });
//   const [Lobj, setLobj]         = useState(null);
//   const [mapReady, setMapReady] = useState(false);

//   /* pin mode – also kept in a ref so the map click closure stays fresh */
//   const [pinMode, setPinMode]   = useState("none");
//   const pinModeRef              = useRef("none");
//   useEffect(() => { pinModeRef.current = pinMode; }, [pinMode]);

//   /* ── Load Leaflet ── */
//   useEffect(() => {
//     loadLeaflet()
//       .then((L) => { setLobj(L); setMapReady(true); })
//       .catch(console.error);
//   }, []);

//   /* ── Init map (runs once after Leaflet loads) ── */
//   useEffect(() => {
//     if (!Lobj || !mapRef.current || leafletMapRef.current) return;

//     const lng0 = Number(location.coordinates?.[0]);
//     const lat0 = Number(location.coordinates?.[1]);
//     const hasCenter = isFinite(lng0) && isFinite(lat0) && (lng0 || lat0);

//     const map = Lobj.map(mapRef.current, {
//       center:          hasCenter ? [lat0, lng0] : [20.5937, 78.9629],
//       zoom:            hasCenter ? 13 : 5,
//       scrollWheelZoom: false,
//       zoomControl:     true,
//     });

//     Lobj.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       maxZoom: 19,
//     }).addTo(map);

//     /* Map click handler */
//     map.on("click", (e) => {
//       const mode = pinModeRef.current;
//       if (mode === "none") return;

      
      
//     const lngNum = Number(e.latlng.lng.toFixed(6));
//     const latNum = Number(e.latlng.lat.toFixed(6)); 
//       if (mode === "project") {
//         setFormData((prev) => ({
//           ...prev,
//           location: { ...prev.location, coordinates: [lngNum, latNum] },
//         }));
//         setPinMode("none");
//         return;
//       }

//       if (mode === "newplace") {
//         setNewPlace((p) => ({ ...p, coordinates: [lngNum, latNum] }));
//         setPinMode("none");
//         return;
//       }

//       if (mode.startsWith("place:")) {
//         const idx = Number(mode.split(":")[1]);
//         setFormData((prev) => {
//           const updated = [...(prev.nearbyPlaces || [])];
//           if (updated[idx]) {
//             updated[idx] = { ...updated[idx], coordinates: [lngNum, latNum] };
//           }
//           return { ...prev, nearbyPlaces: updated };
//         });
//         setPinMode("none");
//       }
//     });

//     leafletMapRef.current = map;
//   }, [Lobj]); // eslint-disable-line

//   /* ── Redraw markers whenever coords change ── */
//   useEffect(() => {
//     const map = leafletMapRef.current;
//     if (!Lobj || !map) return;

//     /* Remove old markers */
//     if (markersRef.current.project) {
//       map.removeLayer(markersRef.current.project);
//       markersRef.current.project = null;
//     }
//     markersRef.current.nearby.forEach((m) => { try { map.removeLayer(m); } catch {} });
//     markersRef.current.nearby = [];

//     const allMarkers = [];

//     /* Project marker – custom green teardrop */
//     const lng = Number(location.coordinates?.[0]);
//     const lat = Number(location.coordinates?.[1]);
//     if (isFinite(lng) && isFinite(lat) && (lng || lat)) {
//       const projectIcon = Lobj.divIcon({
//         html: `
//           <div style="
//             position:relative;width:30px;height:30px;
//             background:${PRIMARY};border:3px solid white;
//             border-radius:50% 50% 50% 0;transform:rotate(-45deg);
//             box-shadow:0 3px 10px rgba(0,0,0,0.25);
//           "></div>`,
//         iconSize:   [30, 30],
//         iconAnchor: [15, 30],
//         className:  "",
//       });
//       const m = Lobj.marker([lat, lng], { icon: projectIcon })
//         .addTo(map)
//         .bindPopup("<strong>📍 Project Location</strong>");
//       markersRef.current.project = m;
//       allMarkers.push(m);
//     }

//     /* Nearby markers – label chips */
//     places.forEach((p, i) => {
//       const plng = Number(p.coordinates?.[0]);
//       const plat = Number(p.coordinates?.[1]);
//       if (!isFinite(plng) || !isFinite(plat) || (!plng && !plat)) return;

//       const nearbyIcon = Lobj.divIcon({
//         html: `<div style="
//           background:white;border:2px solid ${PRIMARY};color:#333;
//           border-radius:20px;padding:3px 8px 3px 5px;
//           font-size:11px;font-weight:700;white-space:nowrap;
//           box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;gap:4px;
//         ">
//           <span>${typeIcon(p.type)}</span>
//           <span>${p.name || `Place ${i + 1}`}</span>
//         </div>`,
//         iconAnchor: [0, 0],
//         className:  "",
//       });

//       const m = Lobj.marker([plat, plng], { icon: nearbyIcon })
//         .addTo(map)
//         .bindPopup(`<strong>${p.name}</strong><br/><small style="color:#666">${p.type}</small>`);
//       markersRef.current.nearby.push(m);
//       allMarkers.push(m);
//     });

//     /* Fit bounds */
//     if (allMarkers.length > 1) {
//       try {
//         const group = Lobj.featureGroup(allMarkers);
//         map.fitBounds(group.getBounds().pad(0.25));
//       } catch {}
//     } else if (allMarkers.length === 1) {
//       map.setView(allMarkers[0].getLatLng(), 14);
//     }
//   }, [Lobj, location.coordinates, places]);

//   /* ── Cursor style changes with pin mode ── */
//   useEffect(() => {
//     const map = leafletMapRef.current;
//     if (!map) return;
//     map.getContainer().style.cursor = pinMode !== "none" ? "crosshair" : "grab";
//   }, [pinMode]);

//   /* ── Handlers ── */
//   function updateLocation(field, value) {
//     const coords = [...(location.coordinates || [0, 0])];
//     if (field === "lng") coords[0] = value;
//     if (field === "lat") coords[1] = value;
//     setFormData({ ...formData, location: { ...location, coordinates: coords } });
//   }

//   function updatePlace(index, field, value) {
//     const updated = [...places];
//     updated[index] = { ...updated[index], [field]: value };
//     setFormData({ ...formData, nearbyPlaces: updated });
//   }

//   function updatePlaceCoords(index, field, value) {
//     const updated = [...places];
//     const coords  = [...(updated[index].coordinates || ["", ""])];
//     if (field === "lng") coords[0] = value;
//     if (field === "lat") coords[1] = value;
//     updated[index] = { ...updated[index], coordinates: coords };
//     setFormData({ ...formData, nearbyPlaces: updated });
//   }

//   function addNewPlace() {
//     if (!newPlace.name.trim() || !newPlace.type.trim()) return;
//     setFormData({ ...formData, nearbyPlaces: [...places, newPlace] });
//     setNewPlace({ name: "", type: "", coordinates: ["", ""] });
//   }

//   function deletePlace(index) {
//     const updated = [...places];
//     updated.splice(index, 1);
//     setFormData({ ...formData, nearbyPlaces: updated });
//     if (openPlace === index) setOpenPlace(null);
//     if (pinMode === `place:${index}`) setPinMode("none");
//   }

//   function performSave() {
//     onSave({ location: formData.location, nearbyPlaces: formData.nearbyPlaces });
//   }

//   /* convenience */
//   const isPickingProject = pinMode === "project";
//   const isPickingNew     = pinMode === "newplace";
//   const activePinLabel   =
//     isPickingProject              ? "Picking project location — click on the map"
//     : isPickingNew                ? "Picking new place — click on the map"
//     : pinMode.startsWith("place:") ? `Picking "${places[Number(pinMode.split(":")[1])]?.name || "place"}" — click on the map`
//     : null;

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//       {/* ── Header ── */}
//       <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
//             <svg
//               className="w-3.5 h-3.5 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//               />
//             </svg>
//           </div>
//           <div>
//             <h3 className="text-sm font-bold text-gray-800">Location Editor</h3>
//             <p className="text-[10px] text-gray-400">
//               {places.length} nearby places · click map to pin points
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="p-5 space-y-5 max-h-[90vh] overflow-y-auto">
//         {/* ── INTERACTIVE MAP ── */}
//         <div className="space-y-2">
//           {/* Active pin-mode banner */}
//           {activePinLabel && (
//             <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#27AE60]/30 bg-[#27AE60]/8">
//               <div className="flex items-center gap-2">
//                 <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse flex-shrink-0" />
//                 <span className="text-xs font-semibold text-[#27AE60]">
//                   {activePinLabel}
//                 </span>
//               </div>
//               <button
//                 onClick={() => setPinMode("none")}
//                 className="text-[10px] font-bold text-red-400 hover:text-red-600 transition underline flex-shrink-0"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {/* Map box */}
//           <div
//             className="relative rounded-2xl overflow-hidden border border-gray-200"
//             style={{ height: 250, zIndex: 1 }}
//           >
//             {/* Loading */}
//             {!mapReady && (
//               <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2 z-10">
//                 <div
//                   className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
//                   style={{
//                     borderColor: `${PRIMARY}40`,
//                     borderTopColor: PRIMARY,
//                   }}
//                 />
//                 <span className="text-xs text-gray-400">Loading map…</span>
//               </div>
//             )}

//             {/* Crosshair overlay hint */}
//             {pinMode !== "none" && (
//               <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none z-10">
//                 <div className="bg-[#27AE60] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg">
//                   🎯 Click anywhere to drop pin
//                 </div>
//               </div>
//             )}

//             <div ref={mapRef} className="h-full w-full" />
//           </div>
//         </div>

//         {/* ── PROJECT COORDS ── */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//               Project Coordinates
//             </label>
//             <button
//               onClick={() => setPinMode(isPickingProject ? "none" : "project")}
//               className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border"
//               style={{
//                 backgroundColor: isPickingProject ? PRIMARY : `${PRIMARY}10`,
//                 borderColor: isPickingProject ? PRIMARY : `${PRIMARY}30`,
//                 color: isPickingProject ? "#fff" : PRIMARY,
//               }}
//             >
//               <svg
//                 className="w-3 h-3"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2.5"
//                   d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                 />
//               </svg>
//               {isPickingProject ? "Picking… cancel" : "Pick on Map"}
//             </button>
//           </div>

//           <div className="grid grid-cols-2 gap-2.5">
//             <div>
//               <label className="text-[10px] text-gray-400 block mb-1">
//                 Longitude
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
//                 placeholder="e.g. 72.8777"
//                 value={location.coordinates?.[0] ?? ""}
//                 onChange={(e) => updateLocation("lng", Number(e.target.value))}
//               />
//             </div>
//             <div>
//               <label className="text-[10px] text-gray-400 block mb-1">
//                 Latitude
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
//                 placeholder="e.g. 19.0760"
//                 value={location.coordinates?.[1] ?? ""}
//                 onChange={(e) => updateLocation("lat", Number(e.target.value))}
//               />
//             </div>
//           </div>

//           {/* Pinned confirmation */}
//           {location.coordinates?.[0] && location.coordinates?.[1] && (
//             <p className="text-[10px] font-semibold text-[#27AE60] flex items-center gap-1">
//               <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] inline-block" />
//               Project location pinned on map
//             </p>
//           )}
//         </div>

//         {/* ── NEARBY PLACES LIST ── */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//               Nearby Places
//             </label>
//             <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//               {places.length} added
//             </span>
//           </div>

//           {places.length === 0 ? (
//             <div className="text-center py-5 text-gray-300 text-xs border-2 border-dashed border-gray-100 rounded-xl">
//               No nearby places yet — add one below
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {places.map((p, index) => {
//                 const isPickingThis = pinMode === `place:${index}`;
//                 const hasCords = p.coordinates?.[0] && p.coordinates?.[1];
//                 return (
//                   <div
//                     key={index}
//                     className="border border-gray-100 rounded-xl overflow-hidden"
//                   >
//                     {/* Row header */}
//                     <div
//                       className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition bg-white"
//                       onClick={() =>
//                         setOpenPlace(openPlace === index ? null : index)
//                       }
//                     >
//                       <div className="flex items-center gap-2.5 min-w-0">
//                         <div
//                           className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
//                           style={{ backgroundColor: "#27AE6015" }}
//                         >
//                           {typeIcon(p.type)}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-sm font-semibold text-gray-800 truncate">
//                             {p.name || "Unnamed"}
//                           </p>
//                           <p className="text-[10px] text-gray-400 truncate">
//                             {p.type || "No type"}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
//                         {hasCords && (
//                           <span
//                             className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
//                             style={{
//                               backgroundColor: "#27AE6015",
//                               color: PRIMARY,
//                             }}
//                           >
//                             📍 pinned
//                           </span>
//                         )}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             deletePlace(index);
//                           }}
//                           className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
//                         >
//                           <svg
//                             className="w-3.5 h-3.5"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2.5"
//                               d="M6 18L18 6M6 6l12 12"
//                             />
//                           </svg>
//                         </button>
//                         <svg
//                           className={`w-4 h-4 text-gray-400 transition-transform ${openPlace === index ? "rotate-180" : ""}`}
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M19 9l-7 7-7-7"
//                           />
//                         </svg>
//                       </div>
//                     </div>

//                     {/* Expanded edit fields */}
//                     {openPlace === index && (
//                       <div className="p-3.5 border-t border-gray-100 space-y-3 bg-gray-50/40">
//                         <div className="grid grid-cols-2 gap-2">
//                           <input
//                             className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
//                             placeholder="Place Name"
//                             value={p.name}
//                             onChange={(e) =>
//                               updatePlace(index, "name", e.target.value)
//                             }
//                           />
//                           <input
//                             className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
//                             placeholder="Type (School…)"
//                             value={p.type}
//                             onChange={(e) =>
//                               updatePlace(index, "type", e.target.value)
//                             }
//                           />
//                         </div>

//                         {/* Coords row with map-pick button */}
//                         <div className="space-y-1.5">
//                           <div className="flex items-center justify-between">
//                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//                               Coordinates
//                             </span>
//                             <button
//                               onClick={() =>
//                                 setPinMode(
//                                   isPickingThis ? "none" : `place:${index}`,
//                                 )
//                               }
//                               className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition border"
//                               style={{
//                                 backgroundColor: isPickingThis
//                                   ? PRIMARY
//                                   : `${PRIMARY}10`,
//                                 borderColor: isPickingThis
//                                   ? PRIMARY
//                                   : `${PRIMARY}25`,
//                                 color: isPickingThis ? "#fff" : PRIMARY,
//                               }}
//                             >
//                               🗺️ {isPickingThis ? "Cancel" : "Pick on map"}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 gap-2">
//                             <input
//                               type="number"
//                               step="any"
//                               className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white font-mono transition"
//                               placeholder="Longitude"
//                               value={p.coordinates?.[0] ?? ""}
//                               onChange={(e) =>
//                                 updatePlaceCoords(index, "lng", Number(e.target.value))
//                               }
//                             />
//                             <input
//                               type="number"
//                               step="any"
//                               className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white font-mono transition"
//                               placeholder="Latitude"
//                               value={p.coordinates?.[1] ?? ""}
//                               onChange={(e) =>
//                                 updatePlaceCoords(index, "lat", Number(e.target.value))
//                               }
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* ── ADD NEW PLACE ── */}
//         <div className="border border-gray-100 rounded-xl overflow-hidden">
//           <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
//             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
//               Add New Place
//             </h4>
//             <button
//               onClick={() => setPinMode(isPickingNew ? "none" : "newplace")}
//               className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition border"
//               style={{
//                 backgroundColor: isPickingNew ? PRIMARY : `${PRIMARY}10`,
//                 borderColor: isPickingNew ? PRIMARY : `${PRIMARY}25`,
//                 color: isPickingNew ? "#fff" : PRIMARY,
//               }}
//             >
//               🗺️ {isPickingNew ? "Cancel" : "Pick on map"}
//             </button>
//           </div>

//           <div className="p-3.5 space-y-2.5 bg-gray-50/40">
//             <div className="grid grid-cols-2 gap-2">
//               <input
//                 className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
//                 placeholder="Place Name *"
//                 value={newPlace.name}
//                 onChange={(e) =>
//                   setNewPlace({ ...newPlace, name: e.target.value })
//                 }
//               />
//               <input
//                 className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
//                 placeholder="Type (School…) *"
//                 value={newPlace.type}
//                 onChange={(e) =>
//                   setNewPlace({ ...newPlace, type: e.target.value })
//                 }
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//               <input
//                 type="number"
//                 step="any"
//                 className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition font-mono"
//                 placeholder="Longitude"
//                 value={newPlace.coordinates[0]}
//                 onChange={(e) =>
//                   setNewPlace({
//                     ...newPlace,
//                     coordinates: [e.target.value, newPlace.coordinates[1]],
//                   })
//                 }
//               />
//               <input
//                 type="number"
//                 step="any"
//                 className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition font-mono"
//                 placeholder="Latitude"
//                 value={newPlace.coordinates[1]}
//                 onChange={(e) =>
//                   setNewPlace({
//                     ...newPlace,
//                     coordinates: [newPlace.coordinates[0], e.target.value],
//                   })
//                 }
//               />
//             </div>

//             {/* Map-pinned confirmation */}
//             {newPlace.coordinates[0] && newPlace.coordinates[1] && (
//               <p className="text-[10px] font-semibold text-[#27AE60] flex items-center gap-1.5">
//                 <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] inline-block" />
//                 Location picked from map
//               </p>
//             )}

//             <button
//               onClick={addNewPlace}
//               disabled={!newPlace.name.trim() || !newPlace.type.trim()}
//               className="w-full py-2.5 text-xs font-bold rounded-xl transition border disabled:opacity-40 disabled:cursor-not-allowed"
//               style={{
//                 backgroundColor: `${PRIMARY}10`,
//                 borderColor: `${PRIMARY}25`,
//                 color: PRIMARY,
//               }}
//             >
//               + Add Place
//             </button>
//           </div>
//         </div>

//         {/* ── SAVE BUTTON ── */}
//         <button
//           onClick={performSave}
//           disabled={saving}
//           className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
//         >
//           {saving ? (
//             <>
//               <svg
//                 className="w-4 h-4 animate-spin"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v8z"
//                 />
//               </svg>
//               Saving…
//             </>
//           ) : (
//             <>
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2.5"
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//               Save Location
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// } 



//ci 

// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/LocationEditor.jsx
// Map: Mappls SDK (same loader pattern as File 1)
// All geocoding / data: Nominatim + Overpass (OpenStreetMap) — zero Mappls API calls for data

import React, { useState, useEffect, useRef, useCallback } from "react";

const PRIMARY = "#27AE60";

// ─────────────────────────────────────────────
// Mappls SDK loader  (identical to File 1)
// ─────────────────────────────────────────────

const MAPPLS_SCRIPT_ID = "mappls-sdk-script";

function getMapplsGlobal() {
  return window.mappls ?? window.Mappls ?? null;
}

function loadMapplsSdk(apiKey) {
  const existing = getMapplsGlobal();
  if (existing) return Promise.resolve(existing);
  if (window.__mapplsSdkPromise) return window.__mapplsSdkPromise;

  window.__mapplsSdkPromise = new Promise((resolve, reject) => {
    const handleReady = () => {
      const sdk = getMapplsGlobal();
      sdk ? resolve(sdk) : reject(new Error("Mappls global not found after load."));
    };
    const el = document.getElementById(MAPPLS_SCRIPT_ID);
    if (el) {
      if (getMapplsGlobal()) { handleReady(); return; }
      el.addEventListener("load",  handleReady, { once: true });
      el.addEventListener("error", () => reject(new Error("Mappls script error.")), { once: true });
      return;
    }
    const s   = document.createElement("script");
    s.id      = MAPPLS_SCRIPT_ID;
    s.src     = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
    s.async   = true;
    s.onload  = handleReady;
    s.onerror = () => reject(new Error("Failed to load Mappls SDK."));
    document.body.appendChild(s);
  });

  window.__mapplsSdkPromise = window.__mapplsSdkPromise.catch((e) => {
    window.__mapplsSdkPromise = undefined;
    throw e;
  });

  return window.__mapplsSdkPromise;
}

function removeMarker(m) {
  if (!m) return;
  try {
    if (typeof m.remove  === "function") { m.remove();    return; }
    if (typeof m.setMap  === "function") { m.setMap(null); }
  } catch (e) { console.warn("Marker cleanup:", e); }
}

// ─────────────────────────────────────────────
// Type → emoji helper (unchanged from File 5)
// ─────────────────────────────────────────────

function typeIcon(type = "") {
  const t = type.toLowerCase();
  if (t.includes("school") || t.includes("college"))   return "🎓";
  if (t.includes("hospital") || t.includes("clinic"))  return "🏥";
  if (t.includes("mall") || t.includes("shop"))        return "🛍️";
  if (t.includes("park") || t.includes("garden"))      return "🌳";
  if (t.includes("metro") || t.includes("station"))    return "🚇";
  if (t.includes("airport"))                           return "✈️";
  if (t.includes("hotel"))                             return "🏨";
  if (t.includes("gym"))                               return "💪";
  if (t.includes("restaurant") || t.includes("cafe"))  return "🍽️";
  if (t.includes("bank") || t.includes("atm"))         return "🏦";
  return "📍";
}

// ─────────────────────────────────────────────
// Unique container-id generator
// ─────────────────────────────────────────────

let _mapCounter = 0;
function nextMapId() { return `mappls-loc-editor-${++_mapCounter}`; }

// ─────────────────────────────────────────────
// LocationEditor
// ─────────────────────────────────────────────

export default function LocationEditor({ formData, setFormData, onSave, saving }) {
  if (!formData) return null;

  const location = formData.location || { type: "Point", coordinates: [0, 0] };
  const places   = formData.nearbyPlaces || [];

  const [newPlace, setNewPlace]   = useState({ name: "", type: "", coordinates: ["", ""] });
  const [openPlace, setOpenPlace] = useState(null);

  // ── Map state ──────────────────────────────────────────────────────────
  const containerId      = useRef(nextMapId()).current;
  const containerRef     = useRef(null);
  const mapRef           = useRef(null);       // Mappls Map instance
  const sdkRef           = useRef(null);       // Mappls SDK global
  const clickAttached    = useRef(false);
  const projectMarkerRef = useRef(null);
  const nearbyMarkerRefs = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  // pin mode — kept in both state + ref so the map click closure stays fresh
  const [pinMode, setPinMode] = useState("none");
  const pinModeRef            = useRef("none");
  useEffect(() => { pinModeRef.current = pinMode; }, [pinMode]);

  // Keep latest setFormData in a ref so map click closure always has it
  const setFormDataRef = useRef(setFormData);
  useEffect(() => { setFormDataRef.current = setFormData; }, [setFormData]);

  // API key from env (same pattern as File 1)
  const apiKey = import.meta.env.VITE_MAPPLS_MAP_SDK_KEY;

  // ── Init Mappls map ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!apiKey) { setMapError("VITE_MAPPLS_MAP_SDK_KEY missing in .env"); return; }
      if (!containerRef.current) return;

      try {
        const sdk = await loadMapplsSdk(apiKey);
        if (cancelled) return;
        sdkRef.current = sdk;

        if (!mapRef.current) {
          const lng0 = Number(location.coordinates?.[0]);
          const lat0 = Number(location.coordinates?.[1]);
          const hasCenter = isFinite(lng0) && isFinite(lat0) && (lng0 || lat0);

          mapRef.current = new sdk.Map(containerId, {
            center:      hasCenter ? { lat: lat0, lng: lng0 } : { lat: 20.5937, lng: 78.9629 },
            zoom:        hasCenter ? 13 : 5,
            zoomControl: true,
            location:    false,
          });
          setMapReady(true);
          setMapError(null);
        } else {
          setMapReady(true);
        }

        // Attach click handler once
        if (mapRef.current && !clickAttached.current) {
          const handleClick = (event) => {
            const mode = pinModeRef.current;
            if (mode === "none") return;

            const lat = Number(event?.latlng?.lat ?? event?.lngLat?.lat ?? event?.lat);
            const lng = Number(event?.latlng?.lng ?? event?.lngLat?.lng ?? event?.lng);
            if (!isFinite(lat) || !isFinite(lng)) return;

            const lngNum = Number(lng.toFixed(6));
            const latNum = Number(lat.toFixed(6));

            if (mode === "project") {
              setFormDataRef.current((prev) => ({
                ...prev,
                location: { ...prev.location, coordinates: [lngNum, latNum] },
              }));
              setPinMode("none");
              return;
            }

            if (mode === "newplace") {
              setNewPlace((p) => ({ ...p, coordinates: [lngNum, latNum] }));
              setPinMode("none");
              return;
            }

            if (mode.startsWith("place:")) {
              const idx = Number(mode.split(":")[1]);
              setFormDataRef.current((prev) => {
                const updated = [...(prev.nearbyPlaces || [])];
                if (updated[idx]) {
                  updated[idx] = { ...updated[idx], coordinates: [lngNum, latNum] };
                }
                return { ...prev, nearbyPlaces: updated };
              });
              setPinMode("none");
            }
          };

          mapRef.current.on?.("click", handleClick);
          mapRef.current.addListener?.("click", handleClick);
          clickAttached.current = true;
        }
      } catch (err) {
        if (!cancelled) setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [apiKey, containerId]); // eslint-disable-line

  // ── Redraw markers whenever coords change ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const sdk = sdkRef.current;
    if (!mapReady || !map || !sdk) return;

    // Remove old project marker
    removeMarker(projectMarkerRef.current);
    projectMarkerRef.current = null;

    // Remove old nearby markers
    nearbyMarkerRefs.current.forEach((m) => removeMarker(m));
    nearbyMarkerRefs.current = [];

    const bounds = [];

    // ── Project marker ─────────────────────────────────────────────────────
    const lng = Number(location.coordinates?.[0]);
    const lat = Number(location.coordinates?.[1]);

    if (isFinite(lng) && isFinite(lat) && (lng || lat)) {
      try {
        const m = new sdk.Marker({
          map,
          position: { lat, lng },
          fitbounds: false,
          // Mappls supports popupHtml / bindPopup depending on SDK version
        });
        // Try to attach popup if API available
        m.bindPopup?.("<strong>📍 Project Location</strong>");
        projectMarkerRef.current = m;
        bounds.push({ lat, lng });
      } catch (e) { console.warn("Project marker error:", e); }
    }

    // ── Nearby markers ─────────────────────────────────────────────────────
    places.forEach((p) => {
      const plng = Number(p.coordinates?.[0]);
      const plat = Number(p.coordinates?.[1]);
      if (!isFinite(plng) || !isFinite(plat) || (!plng && !plat)) return;

      try {
        const m = new sdk.Marker({
          map,
          position: { lat: plat, lng: plng },
          fitbounds: false,
        });
        m.bindPopup?.(`<strong>${p.name}</strong><br/><small style="color:#666">${p.type}</small>`);
        nearbyMarkerRefs.current.push(m);
        bounds.push({ lat: plat, lng: plng });
      } catch (e) { console.warn("Nearby marker error:", e); }
    });

    // ── Fit bounds ─────────────────────────────────────────────────────────
    if (bounds.length > 1) {
      try {
        const lats = bounds.map((b) => b.lat);
        const lngs = bounds.map((b) => b.lng);
        const sw   = { lat: Math.min(...lats), lng: Math.min(...lngs) };
        const ne   = { lat: Math.max(...lats), lng: Math.max(...lngs) };
        map.fitBounds?.([sw, ne], { padding: [40, 40] });
      } catch {}
    } else if (bounds.length === 1) {
      map.setCenter?.(bounds[0]);
      map.setZoom?.(14);
      map.panTo?.(bounds[0]);
    }
  }, [mapReady, location.coordinates, places]); // eslint-disable-line

  // ── Cursor style changes with pin mode ───────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.cursor = pinMode !== "none" ? "crosshair" : "grab";
  }, [pinMode]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      removeMarker(projectMarkerRef.current);
      nearbyMarkerRefs.current.forEach((m) => removeMarker(m));
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapRef.current     = null;
      sdkRef.current     = null;
      clickAttached.current = false;
    };
  }, []);

  // ── Handlers (same logic as File 5) ──────────────────────────────────────

  function updateLocation(field, value) {
    const coords = [...(location.coordinates || [0, 0])];
    if (field === "lng") coords[0] = value;
    if (field === "lat") coords[1] = value;
    setFormData({ ...formData, location: { ...location, coordinates: coords } });
  }

  function updatePlace(index, field, value) {
    const updated = [...places];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, nearbyPlaces: updated });
  }

  function updatePlaceCoords(index, field, value) {
    const updated = [...places];
    const coords  = [...(updated[index].coordinates || ["", ""])];
    if (field === "lng") coords[0] = value;
    if (field === "lat") coords[1] = value;
    updated[index] = { ...updated[index], coordinates: coords };
    setFormData({ ...formData, nearbyPlaces: updated });
  }

  function addNewPlace() {
    if (!newPlace.name.trim() || !newPlace.type.trim()) return;
    setFormData({ ...formData, nearbyPlaces: [...places, newPlace] });
    setNewPlace({ name: "", type: "", coordinates: ["", ""] });
  }

  function deletePlace(index) {
    const updated = [...places];
    updated.splice(index, 1);
    setFormData({ ...formData, nearbyPlaces: updated });
    if (openPlace === index) setOpenPlace(null);
    if (pinMode === `place:${index}`) setPinMode("none");
  }

  function performSave() {
    onSave({ location: formData.location, nearbyPlaces: formData.nearbyPlaces });
  }

  // Convenience
  const isPickingProject = pinMode === "project";
  const isPickingNew     = pinMode === "newplace";
  const activePinLabel   =
    isPickingProject               ? "Picking project location — click on the map"
    : isPickingNew                 ? "Picking new place — click on the map"
    : pinMode.startsWith("place:") ? `Picking "${places[Number(pinMode.split(":")[1])]?.name || "place"}" — click on the map`
    : null;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Location Editor</h3>
            <p className="text-[10px] text-gray-400">
              {places.length} nearby places · click map to pin points · powered by Mappls
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[90vh] overflow-y-auto">

        {/* ── INTERACTIVE MAP ── */}
        <div className="space-y-2">

          {/* Active pin-mode banner */}
          {activePinLabel && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#27AE60]/30 bg-[#27AE60]/8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse flex-shrink-0" />
                <span className="text-xs font-semibold text-[#27AE60]">{activePinLabel}</span>
              </div>
              <button
                onClick={() => setPinMode("none")}
                className="text-[10px] font-bold text-red-400 hover:text-red-600 transition underline flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Map box */}
          <div
            className="relative rounded-2xl overflow-hidden border border-gray-200"
            style={{ height: 250, zIndex: 1 }}
          >
            {/* Loading overlay */}
            {!mapReady && !mapError && (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2 z-10">
                <div
                  className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${PRIMARY}40`, borderTopColor: PRIMARY }}
                />
                <span className="text-xs text-gray-400">Loading Mappls map…</span>
              </div>
            )}

            {/* Error overlay */}
            {mapError && (
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 px-4 text-center">
                <p className="text-xs text-red-400 font-medium">{mapError}</p>
              </div>
            )}

            {/* Crosshair overlay hint */}
            {pinMode !== "none" && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none z-10">
                <div className="bg-[#27AE60] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg">
                  🎯 Click anywhere to drop pin
                </div>
              </div>
            )}

            {/* Mappls map container */}
            <div
              id={containerId}
              ref={containerRef}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* ── PROJECT COORDS ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Project Coordinates
            </label>
            <button
              onClick={() => setPinMode(isPickingProject ? "none" : "project")}
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border"
              style={{
                backgroundColor: isPickingProject ? PRIMARY : `${PRIMARY}10`,
                borderColor:     isPickingProject ? PRIMARY : `${PRIMARY}30`,
                color:           isPickingProject ? "#fff" : PRIMARY,
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {isPickingProject ? "Picking… cancel" : "Pick on Map"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Longitude</label>
              <input
                type="number" step="any"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
                placeholder="e.g. 72.8777"
                value={location.coordinates?.[0] ?? ""}
                onChange={(e) => updateLocation("lng", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Latitude</label>
              <input
                type="number" step="any"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 font-mono"
                placeholder="e.g. 19.0760"
                value={location.coordinates?.[1] ?? ""}
                onChange={(e) => updateLocation("lat", Number(e.target.value))}
              />
            </div>
          </div>

          {location.coordinates?.[0] && location.coordinates?.[1] && (
            <p className="text-[10px] font-semibold text-[#27AE60] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] inline-block" />
              Project location pinned on map
            </p>
          )}
        </div>

        {/* ── NEARBY PLACES LIST ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Nearby Places
            </label>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {places.length} added
            </span>
          </div>

          {places.length === 0 ? (
            <div className="text-center py-5 text-gray-300 text-xs border-2 border-dashed border-gray-100 rounded-xl">
              No nearby places yet — add one below
            </div>
          ) : (
            <div className="space-y-2">
              {places.map((p, index) => {
                const isPickingThis = pinMode === `place:${index}`;
                const hasCords      = p.coordinates?.[0] && p.coordinates?.[1];
                return (
                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">

                    {/* Row header */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition bg-white"
                      onClick={() => setOpenPlace(openPlace === index ? null : index)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                          style={{ backgroundColor: "#27AE6015" }}
                        >
                          {typeIcon(p.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.name || "Unnamed"}</p>
                          <p className="text-[10px] text-gray-400 truncate">{p.type || "No type"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {hasCords && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: "#27AE6015", color: PRIMARY }}
                          >
                            📍 pinned
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePlace(index); }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${openPlace === index ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded edit fields */}
                    {openPlace === index && (
                      <div className="p-3.5 border-t border-gray-100 space-y-3 bg-gray-50/40">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
                            placeholder="Place Name"
                            value={p.name}
                            onChange={(e) => updatePlace(index, "name", e.target.value)}
                          />
                          <input
                            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
                            placeholder="Type (School…)"
                            value={p.type}
                            onChange={(e) => updatePlace(index, "type", e.target.value)}
                          />
                        </div>

                        {/* Coords row with map-pick button */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Coordinates
                            </span>
                            <button
                              onClick={() => setPinMode(isPickingThis ? "none" : `place:${index}`)}
                              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition border"
                              style={{
                                backgroundColor: isPickingThis ? PRIMARY : `${PRIMARY}10`,
                                borderColor:     isPickingThis ? PRIMARY : `${PRIMARY}25`,
                                color:           isPickingThis ? "#fff" : PRIMARY,
                              }}
                            >
                              🗺️ {isPickingThis ? "Cancel" : "Pick on map"}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number" step="any"
                              className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white font-mono transition"
                              placeholder="Longitude"
                              value={p.coordinates?.[0] ?? ""}
                              onChange={(e) => updatePlaceCoords(index, "lng", Number(e.target.value))}
                            />
                            <input
                              type="number" step="any"
                              className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white font-mono transition"
                              placeholder="Latitude"
                              value={p.coordinates?.[1] ?? ""}
                              onChange={(e) => updatePlaceCoords(index, "lat", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ADD NEW PLACE ── */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Add New Place
            </h4>
            <button
              onClick={() => setPinMode(isPickingNew ? "none" : "newplace")}
              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition border"
              style={{
                backgroundColor: isPickingNew ? PRIMARY : `${PRIMARY}10`,
                borderColor:     isPickingNew ? PRIMARY : `${PRIMARY}25`,
                color:           isPickingNew ? "#fff" : PRIMARY,
              }}
            >
              🗺️ {isPickingNew ? "Cancel" : "Pick on map"}
            </button>
          </div>

          <div className="p-3.5 space-y-2.5 bg-gray-50/40">
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
                placeholder="Place Name *"
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              />
              <input
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition"
                placeholder="Type (School…) *"
                value={newPlace.type}
                onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number" step="any"
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition font-mono"
                placeholder="Longitude"
                value={newPlace.coordinates[0]}
                onChange={(e) => setNewPlace({ ...newPlace, coordinates: [e.target.value, newPlace.coordinates[1]] })}
              />
              <input
                type="number" step="any"
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 focus:border-[#27AE60] bg-white transition font-mono"
                placeholder="Latitude"
                value={newPlace.coordinates[1]}
                onChange={(e) => setNewPlace({ ...newPlace, coordinates: [newPlace.coordinates[0], e.target.value] })}
              />
            </div>

            {newPlace.coordinates[0] && newPlace.coordinates[1] && (
              <p className="text-[10px] font-semibold text-[#27AE60] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] inline-block" />
                Location picked from map
              </p>
            )}

            <button
              onClick={addNewPlace}
              disabled={!newPlace.name.trim() || !newPlace.type.trim()}
              className="w-full py-2.5 text-xs font-bold rounded-xl transition border disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: `${PRIMARY}10`, borderColor: `${PRIMARY}25`, color: PRIMARY }}
            >
              + Add Place
            </button>
          </div>
        </div>

        {/* ── SAVE BUTTON ── */}
        <button
          onClick={performSave}
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
              Save Location
            </>
          )}
        </button>

      </div>
    </div>
  );
}