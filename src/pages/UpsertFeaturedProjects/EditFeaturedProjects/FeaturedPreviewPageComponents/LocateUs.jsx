// frontend/admin-dashboard/src/pages/post-property/FeaturedPreviewPageComponents/LocateUs.jsx
// Map: Mappls SDK (same loader pattern as File 1)
// All data/distance: client-side haversine — no external API calls

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { MapPin } from "lucide-react";

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
// Helpers (unchanged from File 6)
// ─────────────────────────────────────────────

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
  const R    = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const x    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function typeIcon(type = "") {
  const t = type.toLowerCase();
  if (t.includes("school") || t.includes("college") || t.includes("university")) return "🎓";
  if (t.includes("hospital") || t.includes("clinic") || t.includes("medical"))   return "🏥";
  if (t.includes("mall") || t.includes("shop") || t.includes("market"))          return "🛍️";
  if (t.includes("park") || t.includes("garden") || t.includes("ground"))        return "🌳";
  if (t.includes("metro") || t.includes("station") || t.includes("bus"))         return "🚇";
  if (t.includes("airport"))                                                       return "✈️";
  if (t.includes("hotel"))                                                         return "🏨";
  if (t.includes("gym") || t.includes("fitness"))                                 return "💪";
  if (t.includes("restaurant") || t.includes("cafe") || t.includes("food"))      return "🍽️";
  if (t.includes("bank") || t.includes("atm"))                                    return "🏦";
  if (t.includes("temple") || t.includes("mosque") || t.includes("church"))      return "🛕";
  return "📍";
}

// ─────────────────────────────────────────────
// LocateUs
// ─────────────────────────────────────────────

export default function LocateUs(incomingProps) {
  const data = incomingProps.data || incomingProps;

  const primaryColor = data.color       || PRIMARY;
  const location     = data.location    || null;
  const nearbyPlaces = Array.isArray(data.nearbyPlaces) ? data.nearbyPlaces : [];

  // Stable container ID — use counter fallback if useId unavailable
  const rawId      = useId?.();
  const containerId = useRef(rawId ? rawId.replace(/:/g, "-") : `mappls-locateus-${Math.random().toString(36).slice(2)}`).current;

  const containerRef      = useRef(null);
  const mapRef            = useRef(null);       // Mappls Map instance
  const sdkRef            = useRef(null);       // Mappls SDK global
  const projectMarkerRef  = useRef(null);
  const nearbyMarkersRef  = useRef([]);         // array of Mappls Marker instances

  const [mapReady, setMapReady]             = useState(false);
  const [mapError, setMapError]             = useState(null);
  const [selectedIndex, setSelectedIndex]   = useState(null);

  const apiKey = import.meta.env.VITE_MAPPLS_MAP_SDK_KEY;

  // ── Derived data (same logic as File 6) ───────────────────────────────────

  const projectCenter = useMemo(
    () => (location?.coordinates ? normalizeCoords(location.coordinates) : null),
    [location]
  );

  const normalizedPlaces = useMemo(
    () => nearbyPlaces.map((p) => ({ ...p, __coordsTuple: normalizeCoords(p.coordinates) })),
    [nearbyPlaces]
  );

  const placesWithDistance = useMemo(() => {
    return normalizedPlaces.map((p) => {
      if (!projectCenter || !p.__coordsTuple)
        return { p, coords: p.__coordsTuple, distanceText: "—" };
      const meters = haversine(projectCenter, p.__coordsTuple);
      const text   = meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
      return { p, coords: p.__coordsTuple, distanceText: text };
    });
  }, [normalizedPlaces, projectCenter]);

  // ── Init Mappls map ────────────────────────────────────────────────────────

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
          mapRef.current = new sdk.Map(containerId, {
            center:      projectCenter
              ? { lat: projectCenter[1], lng: projectCenter[0] }
              : { lat: 20.5937, lng: 78.9629 },
            zoom:        projectCenter ? 13 : 5,
            zoomControl: true,
            location:    false,
            // Read-only display map — no click handler needed
          });
          setMapReady(true);
          setMapError(null);
        } else {
          setMapReady(true);
        }
      } catch (err) {
        if (!cancelled) setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [apiKey, containerId]); // eslint-disable-line

  // ── Redraw markers whenever coords / places change ─────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    const sdk = sdkRef.current;
    if (!mapReady || !map || !sdk) return;

    // Remove old markers
    removeMarker(projectMarkerRef.current);
    projectMarkerRef.current = null;
    nearbyMarkersRef.current.forEach((m) => removeMarker(m));
    nearbyMarkersRef.current = [];

    const bounds = []; // { lat, lng } objects for fitBounds

    // ── Project marker ──────────────────────────────────────────────────────
    if (projectCenter) {
      const [lng, lat] = projectCenter;
      try {
        const m = new sdk.Marker({ map, position: { lat, lng }, fitbounds: false });
        m.bindPopup?.("<strong>📍 Project Location</strong>");
        projectMarkerRef.current = m;
        bounds.push({ lat, lng });
      } catch (e) { console.warn("Project marker:", e); }
    }

    // ── Nearby markers ──────────────────────────────────────────────────────
    placesWithDistance.forEach((item, index) => {
      if (!item.coords) return;
      const [lng, lat] = item.coords;
      try {
        const m = new sdk.Marker({ map, position: { lat, lng }, fitbounds: false });
        m.bindPopup?.(`<strong>${item.p.name}</strong><br/><small style="color:#666">${item.p.type}</small>`);
        // Pan to marker on click (mirrors File 6's onSelectPlace behaviour)
        m.addListener?.("click", () => setSelectedIndex(index));
        m.on?.("click",          () => setSelectedIndex(index));
        nearbyMarkersRef.current.push(m);
        bounds.push({ lat, lng });
      } catch (e) { console.warn("Nearby marker:", e); }
    });

    // ── Fit bounds ──────────────────────────────────────────────────────────
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
      map.setZoom?.(13);
      map.panTo?.(bounds[0]);
    }
  }, [mapReady, projectCenter, placesWithDistance]); // eslint-disable-line

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      removeMarker(projectMarkerRef.current);
      nearbyMarkersRef.current.forEach((m) => removeMarker(m));
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapRef.current = null;
      sdkRef.current = null;
    };
  }, []);

  // ── Select place from list → pan map to marker ────────────────────────────

  function onSelectPlace(index) {
    setSelectedIndex((prev) => (prev === index ? null : index));
    const item = placesWithDistance[index];
    if (!item?.coords) return;
    const [lng, lat] = item.coords;
    try {
      mapRef.current?.setCenter?.({ lat, lng });
      mapRef.current?.panTo?.({ lat, lng });
      mapRef.current?.setZoom?.(15);
      // Open popup if marker supports it
      const marker = nearbyMarkersRef.current[index];
      marker?.openPopup?.();
    } catch {}
  }

  // ─────────────────────────────────────────────
  // Render (identical structure / classes to File 6)
  // ─────────────────────────────────────────────

  return (
    <section className="p-5 lg:p-6">

      {/* Empty state */}
      {placesWithDistance.length === 0 && !projectCenter && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
        {!mapReady && !mapError && (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-3 z-10">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${primaryColor}40`, borderTopColor: primaryColor }}
            />
            <span className="text-xs text-gray-400">Loading Mappls map…</span>
          </div>
        )}

        {/* Error overlay */}
        {mapError && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 px-6 text-center">
            <p className="text-xs text-red-400 font-medium">{mapError}</p>
          </div>
        )}

        {/* Mappls map container */}
        <div
          id={containerId}
          ref={containerRef}
          className="h-full w-full"
        />

        {/* Project badge overlay — top left */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm pointer-events-none"
          style={{ backgroundColor: `${primaryColor}ee`, color: "#fff" }}
        >
          <MapPin size={12} />
          {projectCenter ? "Project Location" : "Map View"}
        </div>
      </div>

    </section>
  );
}