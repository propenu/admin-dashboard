// MapplsPinMap.jsx
// Map rendering: Mappls SDK
// Geocoding (reverse on click / GPS): Nominatim (OpenStreetMap) — no Mappls geocoding API used
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useId,
  useCallback,
} from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { toast } from "sonner"; // swap for your toast lib if needed

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MAPPLS_SCRIPT_ID = "mappls-sdk-script";
const DEFAULT_POSITION = { lat: 20.5937, lng: 78.9629 }; // India centre
const MAP_CLICK_ZOOM = 15;

// ─────────────────────────────────────────────
// Mappls SDK loader
// ─────────────────────────────────────────────

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
      sdk
        ? resolve(sdk)
        : reject(new Error("Mappls global not found after load."));
    };
    const el = document.getElementById(MAPPLS_SCRIPT_ID);
    if (el) {
      if (getMapplsGlobal()) {
        handleReady();
        return;
      }
      el.addEventListener("load", handleReady, { once: true });
      el.addEventListener(
        "error",
        () => reject(new Error("Mappls script error.")),
        { once: true },
      );
      return;
    }
    const s = document.createElement("script");
    s.id = MAPPLS_SCRIPT_ID;
    s.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
    s.async = true;
    s.onload = handleReady;
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
    if (typeof m.remove === "function") {
      m.remove();
      return;
    }
    if (typeof m.setMap === "function") {
      m.setMap(null);
    }
  } catch (e) {
    console.warn("Marker cleanup:", e);
  }
}

function recenterMap(map, lat, lng, zoom) {
  map.setCenter?.({ lat, lng });
  map.setZoom?.(zoom);
  map.panTo?.({ lat, lng });
}

// ─────────────────────────────────────────────
// Nominatim helpers
// ─────────────────────────────────────────────

const titleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
const stripWard = (s) =>
  s ? s.replace(/^ward\s*\d+[a-z]?\s+/i, "").trim() : "";

/**
 * Reverse geocode lat/lng → { pincode, locality, city, state }
 */
async function reverseGeocode(lat, lng, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
    { signal, headers: { "Accept-Language": "en" } },
  );
  if (!res.ok) throw new Error("Reverse geocode failed.");
  const data = await res.json();
  const a = data?.address || {};
  return {
    pincode: a.postcode || "",
    locality: titleCase(
      stripWard(
        a.suburb ||
          a.neighbourhood ||
          a.hamlet ||
          a.village ||
          a.town ||
          a.city_district ||
          a.county ||
          "",
      ),
    ),
    city: titleCase(
      a.city ||
        a.town ||
        a.village ||
        a.city_district ||
        a.state_district ||
        a.county ||
        "",
    ),
    state: titleCase(a.state || ""),
  };
}

// ─────────────────────────────────────────────
// MapplsPinMap
// Props:
//   coordinates  — [lng, lat] or undefined (controlled)
//   onPinChange  — ({ coordinates, pincode?, locality?, city?, state? }) => void
// ─────────────────────────────────────────────

export default function MapplsPinMap({ coordinates, onPinChange }) {
  const [mapError, setMapError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [markerPlaced, setMarkerPlaced] = useState(false);

  const containerId = useId().replace(/:/g, "-");

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const sdkRef = useRef(null);
  const clickAttachedRef = useRef(false);
  const geocodeAbortRef = useRef(null);
  const gpsAbortRef = useRef(null);
  const onPinChangeRef = useRef(onPinChange);

  const apiKey = import.meta.env.VITE_MAPPLS_MAP_SDK_KEY;

  const point = useMemo(() => {
    if (!coordinates || coordinates.length !== 2) return null;
    return { lat: coordinates[1], lng: coordinates[0] };
  }, [coordinates?.[0], coordinates?.[1]]); // eslint-disable-line

  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);

  // ── Initialise Mappls map ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!apiKey) {
        setMapError("VITE_MAPPLS_MAP_SDK_KEY missing in .env");
        return;
      }
      if (!containerRef.current) return;
      try {
        const sdk = await loadMapplsSdk(apiKey);
        if (cancelled) return;
        sdkRef.current = sdk;

        if (!mapRef.current) {
          mapRef.current = new sdk.Map(containerId, {
            center: DEFAULT_POSITION,
            zoom: 5,
            zoomControl: true,
            location: false,
          });
          setMapReady(true);
        } else {
          setMapReady(true);
        }

        if (mapRef.current && !clickAttachedRef.current) {
          const handleClick = (event) => {
            const e = event;
            const lat = Number(e?.latlng?.lat ?? e?.lngLat?.lat ?? e?.lat);
            const lng = Number(e?.latlng?.lng ?? e?.lngLat?.lng ?? e?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            // Place marker immediately
            removeMarker(markerRef.current);
            markerRef.current = new sdk.Marker({
              map: mapRef.current,
              position: { lat, lng },
              fitbounds: false,
            });
            recenterMap(mapRef.current, lat, lng, MAP_CLICK_ZOOM);
            setMarkerPlaced(true);

            // Notify parent instantly (coordinates only)
            onPinChangeRef.current?.({ coordinates: [lng, lat] });

            // Then reverse geocode via Nominatim → fills pincode + locality + city + state
            geocodeAbortRef.current?.abort();
            const ctrl = new AbortController();
            geocodeAbortRef.current = ctrl;

            reverseGeocode(lat, lng, ctrl.signal)
              .then((geo) => {
                onPinChangeRef.current?.({ coordinates: [lng, lat], ...geo });
              })
              .catch((err) => {
                if (err?.name === "AbortError") return;
                console.error("Reverse geocode error:", err);
                onPinChangeRef.current?.({ coordinates: [lng, lat] });
              });
          };

          mapRef.current.on?.("click", handleClick);
          mapRef.current.addListener?.("click", handleClick);
          clickAttachedRef.current = true;
        }

        setMapError(null);
      } catch (err) {
        if (!cancelled)
          setMapError(
            err instanceof Error ? err.message : "Unable to load map.",
          );
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [apiKey, containerId]);

  // ── Sync marker when coordinates prop changes ────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !sdkRef.current || !point) return;
    removeMarker(markerRef.current);
    markerRef.current = new sdkRef.current.Marker({
      map: mapRef.current,
      position: point,
      fitbounds: false,
    });
    recenterMap(mapRef.current, point.lat, point.lng, MAP_CLICK_ZOOM);
    setMarkerPlaced(true);
  }, [mapReady, point?.lat, point?.lng]); // eslint-disable-line

  // ── GPS button ────────────────────────────────────────────────────────────
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast?.error?.("Geolocation not supported.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const lat = coords.latitude;
        const lng = coords.longitude;

        // Place marker
        if (mapRef.current && sdkRef.current) {
          removeMarker(markerRef.current);
          markerRef.current = new sdkRef.current.Marker({
            map: mapRef.current,
            position: { lat, lng },
            fitbounds: false,
          });
          recenterMap(mapRef.current, lat, lng, MAP_CLICK_ZOOM);
          setMarkerPlaced(true);
        }

        // Notify instantly
        onPinChangeRef.current?.({ coordinates: [lng, lat] });

        // Reverse geocode
        gpsAbortRef.current?.abort();
        const ctrl = new AbortController();
        gpsAbortRef.current = ctrl;
        reverseGeocode(lat, lng, ctrl.signal)
          .then((geo) =>
            onPinChangeRef.current?.({ coordinates: [lng, lat], ...geo }),
          )
          .catch((e) => {
            if (e?.name !== "AbortError") console.error(e);
          });
      },
      (err) => {
        setLocating(false);
        toast?.error?.("Could not get location. Please allow access.");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      geocodeAbortRef.current?.abort();
      gpsAbortRef.current?.abort();
      removeMarker(markerRef.current);
      markerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapRef.current = null;
      sdkRef.current = null;
      clickAttachedRef.current = false;
    };
  }, []);

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm px-4 text-center bg-[#f9fafb]">
        {mapError}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div
        id={containerId}
        key={containerId}
        ref={containerRef}
        className="h-full w-full"
      />

      {/* GPS button — bottom right */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 bg-white border border-[#27AE60] text-[#27AE60] text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-[#f0fdf4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {locating ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <LocateFixed size={13} />
        )}
        {locating ? "Detecting…" : "Use Current Location"}
      </button>

      {/* Coordinate badge — top left */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
        <span className="text-green-600 text-base">📍</span>
        <div>
          <div className="text-xs font-bold text-gray-800">
            {markerPlaced ? "Location Pinned" : "Click to Pin"}
          </div>
          {coordinates && coordinates.length === 2 && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)}
            </div>
          )}
        </div>
      </div>

      {/* "Your Property" label shown when pinned */}
      {markerPlaced && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -mt-8 z-[900] pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg px-3 py-1 border-2 border-[#27AE60]">
            <div className="text-[10px] font-black text-[#27AE60] uppercase tracking-wide">
              Your Property
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
