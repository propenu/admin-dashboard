// frontend/admin-dashboard/src/pages/post-property/FeaturedPreviewPageComponents/LocateUs.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const FALLBACK_ICON = "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg";
const PRIMARY = "#27AE60";

/* ── Load Leaflet from CDN ── */
function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject("No window");
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const cssURL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    if (!document.querySelector(`link[href="${cssURL}"]`)) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = cssURL;
      document.head.appendChild(link);
    }

    const jsURL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    if (document.querySelector(`script[src="${jsURL}"]`)) {
      const wait = () => { window.L ? resolve(window.L) : setTimeout(wait, 50); };
      wait();
      return;
    }

    const script   = document.createElement("script");
    script.src     = jsURL;
    script.async   = true;
    script.defer   = true;
    script.onload  = () => window.L ? resolve(window.L) : reject("Leaflet loaded but L missing");
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/* ── Helpers ── */
function normalizeCoords(coords) {
  if (!coords || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  return isFinite(lng) && isFinite(lat) ? [lng, lat] : null;
}

function haversine(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const R    = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const x    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/* ── Place type → emoji ── */
function typeIcon(type = "") {
  const t = type.toLowerCase();
  if (t.includes("school") || t.includes("college") || t.includes("university")) return "🎓";
  if (t.includes("hospital") || t.includes("clinic") || t.includes("medical"))   return "🏥";
  if (t.includes("mall") || t.includes("shop") || t.includes("market"))          return "🛍️";
  if (t.includes("park") || t.includes("garden") || t.includes("ground"))        return "🌳";
  if (t.includes("metro") || t.includes("station") || t.includes("bus"))         return "🚇";
  if (t.includes("airport"))  return "✈️";
  if (t.includes("hotel"))    return "🏨";
  if (t.includes("gym") || t.includes("fitness")) return "💪";
  if (t.includes("restaurant") || t.includes("cafe") || t.includes("food"))      return "🍽️";
  if (t.includes("bank") || t.includes("atm"))    return "🏦";
  if (t.includes("temple") || t.includes("mosque") || t.includes("church"))      return "🛕";
  return "📍";
}

/* ── MAIN COMPONENT ── */
export default function LocateUs(incomingProps) {
  const data = incomingProps.data || incomingProps;

  const primaryColor  = data.color        || PRIMARY;
  const location      = data.location     || null;
  const nearbyPlaces  = Array.isArray(data.nearbyPlaces) ? data.nearbyPlaces : [];

  const mapRef        = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef    = useRef([]);

  const [Lobj, setLobj]                 = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [mapReady, setMapReady]         = useState(false);

  /* Project center */
  const projectCenter = useMemo(
    () => (location?.coordinates ? normalizeCoords(location.coordinates) : null),
    [location]
  );

  /* Normalized places */
  const normalizedPlaces = useMemo(
    () => nearbyPlaces.map((p) => ({ ...p, __coordsTuple: normalizeCoords(p.coordinates) })),
    [nearbyPlaces]
  );

  /* Places with distance */
  const placesWithDistance = useMemo(() => {
    return normalizedPlaces.map((p) => {
      if (!projectCenter || !p.__coordsTuple)
        return { p, coords: p.__coordsTuple, distanceText: "—" };
      const meters = haversine(projectCenter, p.__coordsTuple);
      const text   = meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
      return { p, coords: p.__coordsTuple, distanceText: text };
    });
  }, [normalizedPlaces, projectCenter]);

  /* Load Leaflet */
  useEffect(() => {
    loadLeaflet()
      .then((L) => { setLobj(L); setMapReady(true); })
      .catch(console.error);
  }, []);

  /* Init + update map markers */
  useEffect(() => {
    if (!Lobj || !mapRef.current) return;

    let map = leafletMapRef.current;

    if (!map) {
      map = Lobj.map(mapRef.current, {
        center:          projectCenter ? [projectCenter[1], projectCenter[0]] : [20, 78],
        zoom:            projectCenter ? 13 : 5,
        scrollWheelZoom: false,
        dragging:        true,
        touchZoom:       true,
        zoomControl:     true,
      });

      Lobj.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      leafletMapRef.current = map;
    }

    /* Clear old markers */
    markersRef.current.forEach((m) => { try { map.removeLayer(m); } catch {} });
    markersRef.current = [];

    /* Project marker */
    if (projectCenter) {
      const [lng, lat] = projectCenter;
      const marker = Lobj.marker([lat, lng], {
        icon: Lobj.icon({ iconUrl: FALLBACK_ICON, iconSize: [40, 40] }),
      }).addTo(map);
      marker.bindPopup("<strong>📍 Project Location</strong>");
      markersRef.current.push(marker);
    }

    /* Nearby markers */
    placesWithDistance.forEach((item, index) => {
      if (!item.coords) return;
      const [lng, lat] = item.coords;
      const marker = Lobj.marker([lat, lng], {
        icon: Lobj.icon({ iconUrl: FALLBACK_ICON, iconSize: [28, 28] }),
      }).addTo(map).on("click", () => setSelectedIndex(index));
      markersRef.current.push(marker);
    });

    /* Fit bounds */
    if (markersRef.current.length) {
      const group = Lobj.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [Lobj, projectCenter, placesWithDistance]);

  /* Select place from list */
  function onSelectPlace(index) {
    setSelectedIndex((prev) => (prev === index ? null : index));
    const offset = projectCenter ? 1 : 0;
    const marker = markersRef.current[index + offset];
    if (marker && marker.openPopup) {
      leafletMapRef.current?.panTo(marker.getLatLng());
      marker.openPopup();
    }
  }

  return (
    <section className="p-5 lg:p-6">

      {/* Empty state */}
      {placesWithDistance.length === 0 && !projectCenter && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-sm">No location data yet</p>
        </div>
      )}

      {/* Nearby places list */}
      {placesWithDistance.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {placesWithDistance.length} Nearby Places
            </span>
            {selectedIndex !== null && (
              <button
                onClick={() => setSelectedIndex(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {placesWithDistance.map((item, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPlace(idx)}
                  className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full"
                  style={{
                    borderColor:     isActive ? primaryColor : "#f0f0f0",
                    backgroundColor: isActive ? `${primaryColor}08` : "#fafafa",
                    boxShadow:       isActive ? `0 0 0 2px ${primaryColor}30` : "none",
                  }}
                >
                  {/* Emoji icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ backgroundColor: isActive ? `${primaryColor}18` : "#f3f4f6" }}
                  >
                    {typeIcon(item.p.type)}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: isActive ? primaryColor : "#1f2937" }}
                    >
                      {item.p.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {item.p.type}
                      {item.distanceText !== "—" && (
                        <>
                          <span className="mx-1 text-gray-300">•</span>
                          <span style={{ color: isActive ? primaryColor : undefined }}>
                            {item.distanceText}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Distance badge */}
                  {item.distanceText !== "—" && (
                    <span
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: isActive ? `${primaryColor}15` : "#f3f4f6",
                        color:           isActive ? primaryColor : "#9ca3af",
                      }}
                    >
                      {item.distanceText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        style={{ height: 340, zIndex: 1 }}
      >
        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-3 z-10">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${primaryColor}40`, borderTopColor: primaryColor }}
            />
            <span className="text-xs text-gray-400">Loading map…</span>
          </div>
        )}

        <div ref={mapRef} className="h-full w-full" />

        {/* Map attribution overlay fix for design */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
          style={{ backgroundColor: `${primaryColor}ee`, color: "#fff" }}
        >
          <MapPin size={12} />
          {projectCenter ? "Project Location" : "Map View"}
        </div>
      </div>
    </section>
  );
}