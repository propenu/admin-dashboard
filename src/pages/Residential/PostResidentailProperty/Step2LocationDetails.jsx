


// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/Step2LocationDetails.jsx
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../store/newIndex";
import {
  Phone, X, Check, MapPin, Navigation, Search,
  Loader2, Plus, LocateFixed,
} from "lucide-react";
import { savePropertyData } from "../../../store/common/propertyThunks";
import { useEffect, useState, useRef, useCallback, useId, useMemo } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const MAPPLS_SCRIPT_ID       = "mappls-sdk-script";
const DEFAULT_POSITION       = { lat: 20.5937, lng: 78.9629 }; // India centre
const MAP_CLICK_ZOOM         = 15;
const SEARCH_RADIUS_KM       = 5;
const SEARCH_RESULT_LIMIT    = 5;
const PHOTON_CANDIDATE_LIMIT = 15;
const MAX_NEARBY_RADIUS_M    = 10_000;

// ─────────────────────────────────────────────
// String helpers
// ─────────────────────────────────────────────

const titleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Strip "Ward 4B " prefix Nominatim sometimes adds
const stripWard = (s) => (s ? s.replace(/^ward\s*\d+[a-z]?\s+/i, "").trim() : "");

// ─────────────────────────────────────────────
// Mappls SDK loader  (map rendering ONLY)
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

function recenterMap(map, lat, lng, zoom) {
  map.setCenter?.({ lat, lng });
  map.setZoom?.(zoom);
  map.panTo?.({ lat, lng });
}

// ─────────────────────────────────────────────
// OpenStreetMap / Nominatim  —  ALL data lookups
// ─────────────────────────────────────────────

/**
 * Reverse geocode lat/lng → { pincode, locality, city, state }
 * Called on every map click and on GPS fix.
 */
async function reverseGeocode(lat, lng, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
    { signal, headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Reverse geocode failed.");
  const data = await res.json();
  const a    = data?.address || {};
  return {
    pincode:  a.postcode || "",
    locality: titleCase(stripWard(
      a.suburb || a.neighbourhood || a.hamlet ||
      a.village || a.town || a.city_district || a.county || ""
    )),
    city:  titleCase(a.city || a.town || a.village || a.city_district || a.state_district || a.county || ""),
    state: titleCase(a.state || ""),
  };
}

/**
 * Forward geocode a 6-digit pincode → { lat, lng, locality, city, state }
 * Called when user manually types pincode.
 */
async function geocodePincode(pincode, signal) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${pincode}&country=India&format=json&addressdetails=1&limit=1&accept-language=en`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Pincode geocode failed.");
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;

  const best = data[0];
  const a    = best?.address || {};
  return {
    lat:      parseFloat(best.lat),
    lng:      parseFloat(best.lon),
    locality: titleCase(stripWard(
      a.suburb || a.neighbourhood || a.hamlet ||
      a.village || a.town || a.city_district || a.county || ""
    )),
    city:  titleCase(a.city || a.town || a.village || a.city_district || a.state_district || a.county || ""),
    state: titleCase(a.state || ""),
  };
}

/**
 * Forward geocode a free-text string → { lat, lng }
 * Fallback when locality/city/state change and no user pin exists.
 */
async function geocodeText(text, signal) {
  const res  = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
    { signal, headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// ─────────────────────────────────────────────
// Distance helpers
// ─────────────────────────────────────────────

const toRad = (v) => (v * Math.PI) / 180;

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R    = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Both args: [lng, lat] tuples
function haversineKm(src, dst) {
  const [sLng, sLat] = src;
  const [dLng, dLat] = dst;
  const R    = 6371;
  const dLat2 = toRad(dLat - sLat);
  const dLng2 = toRad(dLng - sLng);
  const a     =
    Math.sin(dLat2 / 2) ** 2 +
    Math.cos(toRad(sLat)) * Math.cos(toRad(dLat)) * Math.sin(dLng2 / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtMeters(m) {
  if (m === undefined) return undefined;
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function fmtKm(km) {
  if (km === undefined) return undefined;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// ─────────────────────────────────────────────
// Photon bounding-box helper
// ─────────────────────────────────────────────

function getBBox([lng, lat], radiusKm) {
  const latD = radiusKm / 111;
  const cosL = Math.cos(toRad(lat));
  const lngD = radiusKm / (111 * Math.max(Math.abs(cosL), 0.01));
  return [lng - lngD, lat - latD, lng + lngD, lat + latD];
}

function buildPhotonAddress(p) {
  if (!p) return undefined;
  const street = [p.street, p.housenumber].filter(Boolean).join(" ").trim();
  const parts  = [street, p.suburb, p.district, p.city, p.county, p.state, p.postcode, p.country]
    .filter(Boolean).map(String);
  return parts.length ? parts.join(", ") : undefined;
}

// ─────────────────────────────────────────────
// Overpass helpers
// ─────────────────────────────────────────────

async function fetchByFilter(filter, lat, lng) {
  const q   = `[out:json];(node(around:${MAX_NEARBY_RADIUS_M},${lat},${lng})${filter}["name"];);out;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: q });
  const d   = await res.json();
  return d.elements
    .map((el) => {
      const dist = haversineMeters(lat, lng, el.lat, el.lon);
      return {
        name:           el.tags.name || "Unknown",
        type:           el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.railway || "",
        coordinates:    [el.lon, el.lat],
        distanceMeters: dist,
        distanceText:   fmtMeters(dist),
      };
    })
    .filter((p) => p.distanceMeters <= MAX_NEARBY_RADIUS_M)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

async function fetchByName(name, lat, lng) {
  const esc = name.replace(/"/g, '\\"');
  const q   = `[out:json];(
    node(around:${MAX_NEARBY_RADIUS_M},${lat},${lng})["name"~"${esc}",i];
    way(around:${MAX_NEARBY_RADIUS_M},${lat},${lng})["name"~"${esc}",i];
  );out center;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: q });
  const d   = await res.json();
  return d.elements
    .map((el) => {
      const eLat = el.lat ?? el.center?.lat;
      const eLng = el.lon ?? el.center?.lon;
      if (!eLat || !eLng) return null;
      const dist = haversineMeters(lat, lng, eLat, eLng);
      return {
        name:           el.tags.name || name,
        type:           el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.tourism || el.tags.building || "place",
        coordinates:    [eLng, eLat],
        distanceMeters: dist,
        distanceText:   fmtMeters(dist),
      };
    })
    .filter(Boolean)
    .filter((p) => p.distanceMeters <= MAX_NEARBY_RADIUS_M)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// ─────────────────────────────────────────────
// Category & keyword data
// ─────────────────────────────────────────────

const PLACE_CATEGORIES = [
  { key: "hospital",    label: "Hospital",    icon: "🏥", filter: '["amenity"~"hospital|clinic"]' },
  { key: "school",      label: "School",      icon: "🏫", filter: '["amenity"="school"]' },
  { key: "college",     label: "College",     icon: "🎓", filter: '["amenity"="college"]' },
  { key: "bank",        label: "Bank",        icon: "🏦", filter: '["amenity"="bank"]' },
  { key: "restaurant",  label: "Restaurant",  icon: "🍽️", filter: '["amenity"="restaurant"]' },
  { key: "mall",        label: "Mall",        icon: "🛍️", filter: '["shop"="mall"]' },
  { key: "supermarket", label: "Supermarket", icon: "🛒", filter: '["shop"="supermarket"]' },
  { key: "metro",       label: "Metro",       icon: "🚇", filter: '["railway"~"station|subway"]' },
  { key: "park",        label: "Park",        icon: "🌳", filter: '["leisure"="park"]' },
  { key: "pharmacy",    label: "Pharmacy",    icon: "💊", filter: '["amenity"="pharmacy"]' },
  { key: "atm",         label: "ATM",         icon: "🏧", filter: '["amenity"="atm"]' },
  { key: "gym",         label: "Gym",         icon: "🏋️", filter: '["leisure"="fitness_centre"]' },
];

const KEYWORD_FILTER_MAP = [
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

// ─────────────────────────────────────────────
// Shared UI atoms
// ─────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">{children}</p>
);

const CardWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-[#e6f4ec] p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const FieldWrapper = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[#374151]">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
  </div>
);

const inputCls =
  "w-full border border-[#d1d5db] rounded-xl px-3.5 py-3 text-sm font-medium text-[#111827] " +
  "focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]";

const readonlyCls =
  "w-full border border-[#e5e7eb] rounded-xl px-3.5 py-3 text-sm font-medium text-[#6b7280] bg-[#f9fafb] outline-none";

// ─────────────────────────────────────────────
// NearbyPlacesPanel
//   Photon   → live dropdown as user types (OpenStreetMap-based)
//   Overpass → category chips + keyword/name search on submit
// ─────────────────────────────────────────────

function NearbyPlacesPanel({ pinnedCoords, selectedPlaces, onAdd, onRemove }) {
  const [activeCat,    setActiveCat]    = useState(null);
  const [catResults,   setCatResults]   = useState([]);
  const [loadingCat,   setLoadingCat]   = useState(null);
  const [catError,     setCatError]     = useState(null);

  const [query, setQuery] = useState("");

  const [photonResults,  setPhotonResults]  = useState([]);
  const [photonLoading,  setPhotonLoading]  = useState(false);
  const [photonMsg,      setPhotonMsg]      = useState(null);

  const [ovResults,   setOvResults]   = useState([]);
  const [ovSearching, setOvSearching] = useState(false);
  const [ovSearched,  setOvSearched]  = useState(false);
  const [ovError,     setOvError]     = useState(null);
  const [autoAdded,   setAutoAdded]   = useState(null);

  const photonTimer = useRef(null);
  const abortRef    = useRef(null);
  const dropRef     = useRef(null);

  const isAdded = (place) =>
    selectedPlaces.some((p) => p.name === place.name && p.type === place.type);

  // Photon debounced live search
  useEffect(() => {
    if (query.length < 3) { setPhotonResults([]); setPhotonMsg(null); return; }
    if (photonTimer.current) clearTimeout(photonTimer.current);
    const ctrl = new AbortController();

    photonTimer.current = setTimeout(async () => {
      try {
        setPhotonLoading(true); setPhotonMsg(null);
        const params = new URLSearchParams({ q: query, lang: "en", limit: String(PHOTON_CANDIDATE_LIMIT) });
        if (pinnedCoords?.length === 2) {
          const [lng, lat] = pinnedCoords;
          const [mnLng, mnLat, mxLng, mxLat] = getBBox(pinnedCoords, SEARCH_RADIUS_KM);
          params.set("lon", String(lng)); params.set("lat", String(lat));
          params.set("bbox", `${mnLng},${mnLat},${mxLng},${mxLat}`);
        }
        const res = await fetch(`https://photon.komoot.io/api/?${params}`,
          { signal: ctrl.signal, headers: { "Accept-Language": "en" } });
        if (!res.ok) { setPhotonMsg("Unable to fetch places right now."); return; }

        const features = (await res.json())?.features ?? [];
        const next = features
          .map((f) => {
            const [pLng, pLat] = f.geometry?.coordinates ?? [];
            const coords = Number.isFinite(pLng) && Number.isFinite(pLat) ? [pLng, pLat] : undefined;
            const distKm = pinnedCoords && coords ? haversineKm(pinnedCoords, coords) : undefined;
            const addr   = buildPhotonAddress(f.properties);
            const title  = f.properties?.name || addr || query;
            return {
              id:          f.properties?.osm_id ? String(f.properties.osm_id) : coords?.join(","),
              title, address: addr && addr !== title ? addr : undefined,
              type:        f.properties?.osm_value || f.properties?.osm_key,
              coordinates: coords, distanceKm: distKm,
            };
          })
          .filter((p) => Boolean(p.title))
          .filter((p) => pinnedCoords ? (p.distanceKm ?? Infinity) <= SEARCH_RADIUS_KM : true)
          .slice(0, SEARCH_RESULT_LIMIT);

        setPhotonResults(next);
        if (!next.length)
          setPhotonMsg(pinnedCoords ? `No places within ${SEARCH_RADIUS_KM} km.` : "No matching places.");
      } catch (err) {
        if (err?.name !== "AbortError") { setPhotonResults([]); setPhotonMsg("Search error."); }
      } finally { setPhotonLoading(false); }
    }, 400);

    return () => { ctrl.abort(); clearTimeout(photonTimer.current); };
  }, [query, pinnedCoords]);

  // Close Photon dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (!dropRef.current?.contains(e.target)) { setPhotonResults([]); setPhotonMsg(null); }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Category chip → Overpass filter
  const handleCatClick = useCallback(async (cat) => {
    if (!pinnedCoords) return;
    if (activeCat === cat.key) { setActiveCat(null); setCatResults([]); return; }
    setActiveCat(cat.key); setCatResults([]); setCatError(null);
    setLoadingCat(cat.key); setOvSearched(false); setOvResults([]); setAutoAdded(null);
    abortRef.current?.abort();
    try {
      const [lng, lat] = pinnedCoords;
      const places = await fetchByFilter(cat.filter, lat, lng);
      setCatResults(places);
      if (!places.length) setCatError(`No ${cat.label.toLowerCase()} found within 10 km.`);
    } catch (e) {
      if (e?.name !== "AbortError") setCatError("Failed to load. Try again.");
    } finally { setLoadingCat(null); }
  }, [pinnedCoords, activeCat]);

  // Overpass submit search
  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q || !pinnedCoords) return;
    setActiveCat(null); setCatResults([]);
    setOvError(null); setOvSearching(true); setOvSearched(false);
    setOvResults([]); setAutoAdded(null);
    setPhotonResults([]); setPhotonMsg(null);
    abortRef.current?.abort(); abortRef.current = new AbortController();

    try {
      const [lng, lat] = pinnedCoords;
      const kwMatch = KEYWORD_FILTER_MAP.find(([k]) => k === q.toLowerCase());
      if (kwMatch) {
        const places = await fetchByFilter(kwMatch[1], lat, lng);
        setOvResults(places); setOvSearched(true);
      } else {
        const places = await fetchByName(q, lat, lng);
        if (!places.length) {
          setOvError(`"${q}" not found within 10 km.`); setOvSearched(true);
        } else {
          onAdd(places[0]); setAutoAdded(places[0].name);
          setOvResults(places); setOvSearched(true);
        }
      }
    } catch (e) {
      if (e?.name !== "AbortError") setOvError("Search failed. Please try again.");
    } finally { setOvSearching(false); }
  }, [query, pinnedCoords, onAdd]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const addPhoton = (place) => {
    const name = place.address ? `${place.title}, ${place.address}` : place.title;
    if (selectedPlaces.some((p) => p.name === name)) return;
    onAdd({ name, type: place.type, coordinates: place.coordinates, distanceText: fmtKm(place.distanceKm) });
    setQuery(""); setPhotonResults([]); setPhotonMsg(null);
  };

  const displayResults = activeCat ? catResults : ovResults;
  const anyLoading     = loadingCat !== null || ovSearching;

  if (!pinnedCoords) {
    return (
      <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
        <Navigation size={13} className="text-[#f59e0b] shrink-0" />
        <p className="text-xs text-[#92400e] font-medium">
          Pin your property on the map first to search nearby places.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info strip */}
      <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
        <MapPin size={12} className="text-[#27AE60] shrink-0" />
        <p className="text-xs text-[#166534] font-medium">
          Places within <span className="font-bold">10 km</span> shown nearest first.
          Live suggestions limited to <span className="font-bold">{SEARCH_RADIUS_KM} km</span>.
        </p>
      </div>

      {/* Search input + Photon dropdown */}
      <div ref={dropRef} className="relative">
        <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">Search nearby places</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            {photonLoading
              ? <Loader2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] animate-spin" />
              : <Search  size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            }
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAutoAdded(null); setOvError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Type to search (e.g. Metro, Apollo Hospital…)"
              className="w-full border border-[#d1d5db] rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 outline-none transition-all placeholder:text-[#9ca3af]"
            />
            {query && (
              <button type="button"
                onClick={() => { setQuery(""); setPhotonResults([]); setPhotonMsg(null); setOvResults([]); setOvError(null); setAutoAdded(null); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] hover:text-[#374151]"
              ><X size={15} /></button>
            )}
          </div>
          <button type="button" onClick={handleSearch} disabled={ovSearching || !query.trim()}
            className="px-4 py-2.5 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#219150] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
          >
            {ovSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Search
          </button>
        </div>
        <p className="text-[10px] text-[#9ca3af] mt-1.5">
          Live results as you type ({SEARCH_RADIUS_KM} km) · Press Search / Enter for full 10 km lookup
        </p>

        {/* Photon live dropdown */}
        {(photonResults.length > 0 || photonMsg) && (
          <div className="absolute z-20 w-full mt-1.5 bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden">
            {photonResults.map((p, i) => (
              <button key={`ph-${p.id}-${i}`} type="button" onClick={() => addPhoton(p)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#f0fdf4] flex items-start gap-3 border-b border-[#f3f4f6] last:border-b-0"
              >
                <MapPin size={14} className="mt-0.5 text-[#9ca3af] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[#111827] font-medium line-clamp-2">{p.title}</span>
                  {p.address && <span className="block text-xs text-[#6b7280] mt-0.5 line-clamp-2">{p.address}</span>}
                  {p.distanceKm !== undefined && (
                    <span className="block text-xs text-[#27AE60] font-semibold mt-0.5">{fmtKm(p.distanceKm)} away</span>
                  )}
                </span>
              </button>
            ))}
            {photonMsg && !photonResults.length && (
              <div className="px-4 py-3 text-sm text-[#6b7280]">{photonMsg}</div>
            )}
          </div>
        )}
      </div>

      {/* Category chips */}
      <div>
        <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          {PLACE_CATEGORIES.map((cat) => {
            const active  = activeCat === cat.key;
            const loading = loadingCat === cat.key;
            return (
              <button key={cat.key} type="button" onClick={() => handleCatClick(cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{ borderColor: active ? "#27AE60" : "#e2e8f0", background: active ? "#f0fdf4" : "#fff", color: active ? "#15803d" : "#4b5563" }}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : <span style={{ fontSize: 13 }}>{cat.icon}</span>}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-add banner */}
      {autoAdded && (
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5">
          <Check size={13} className="text-[#27AE60] shrink-0" />
          <p className="text-xs text-[#166534] font-medium">
            <span className="font-bold">"{autoAdded}"</span> auto-added!
            {ovResults.length > 1 && (
              <span className="font-normal text-[#4ade80]"> · {ovResults.length - 1} more match{ovResults.length - 1 > 1 ? "es" : ""} below.</span>
            )}
          </p>
        </div>
      )}

      {(catError || ovError) && <p className="text-red-500 text-xs font-medium">{catError || ovError}</p>}

      {!anyLoading && ovSearched && !activeCat && !ovResults.length && (
        <div className="text-center py-6 text-[#9ca3af]">
          <Search size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No places found within 10 km for "{query}"</p>
          <p className="text-xs mt-1">Try a different keyword or re-pin your location</p>
        </div>
      )}

      {/* Results list */}
      {displayResults.length > 0 && (
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden divide-y divide-[#f3f4f6]">
          <div className="flex items-center px-4 py-2 bg-[#f9fafb]">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest flex-1">
              {autoAdded && !activeCat ? `More matches (${displayResults.length})` : `Places (${displayResults.length} within 10 km)`}
            </p>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest w-20 text-center mr-12">Distance</p>
          </div>
          {displayResults.map((place, idx) => {
            const added = isAdded(place);
            return (
              <div key={`r-${idx}`} className={`flex items-center justify-between px-4 py-3.5 transition-colors ${added ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]"}`}>
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
                <button type="button" onClick={() => added ? onRemove(place) : onAdd(place)}
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
          <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest mb-2">Added ({selectedPlaces.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedPlaces.map((place, i) => (
              <span key={`chip-${i}`}
                className="bg-[#f0fdf4] text-[#27AE60] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
              >
                <MapPin size={10} className="shrink-0" />
                <span className="max-w-[140px] truncate">{place.name.split(",")[0]}</span>
                {place.distanceText && <span className="text-[#86efac] font-normal">· {place.distanceText}</span>}
                <X size={11} className="cursor-pointer hover:text-red-500 transition-colors ml-0.5 shrink-0" onClick={() => onRemove(place)} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MapplsPinMap  —  renders map + handles clicks
// All geocoding is done via Nominatim (OSM)
// ─────────────────────────────────────────────

function MapplsPinMap({ coordinates, onPinChange }) {
  const [mapError, setMapError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const containerId             = useId().replace(/:/g, "-");

  const containerRef     = useRef(null);
  const mapRef           = useRef(null);
  const markerRef        = useRef(null);
  const sdkRef           = useRef(null);
  const clickAttachedRef = useRef(false);
  const geocodeAbortRef  = useRef(null);
  const onPinChangeRef   = useRef(onPinChange);

  const apiKey = import.meta.env.VITE_MAPPLS_MAP_SDK_KEY;

  const point = useMemo(() => {
    if (!coordinates || coordinates.length !== 2) return null;
    return { lat: coordinates[1], lng: coordinates[0] };
  }, [coordinates?.[0], coordinates?.[1]]); // eslint-disable-line

  useEffect(() => { onPinChangeRef.current = onPinChange; }, [onPinChange]);

  // Initialise Mappls map
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
            center: DEFAULT_POSITION, zoom: 5, zoomControl: true, location: false,
          });
          setMapReady(true);
        } else { setMapReady(true); }

        if (mapRef.current && !clickAttachedRef.current) {
          const handleClick = (event) => {
            const e   = event;
            const lat = Number(e?.latlng?.lat ?? e?.lngLat?.lat ?? e?.lat);
            const lng = Number(e?.latlng?.lng ?? e?.lngLat?.lng ?? e?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            // Place marker immediately
            removeMarker(markerRef.current);
            markerRef.current = new sdk.Marker({ map: mapRef.current, position: { lat, lng }, fitbounds: false });
            recenterMap(mapRef.current, lat, lng, MAP_CLICK_ZOOM);

            // Notify parent instantly (coordinates only)
            onPinChangeRef.current?.({ coordinates: [lng, lat] });

            // Then reverse geocode via Nominatim → fills pincode + locality + city + state
            geocodeAbortRef.current?.abort();
            const ctrl = new AbortController();
            geocodeAbortRef.current = ctrl;

            reverseGeocode(lat, lng, ctrl.signal)
              .then((geo) => {
                // geo = { pincode, locality, city, state }
                onPinChangeRef.current?.({ coordinates: [lng, lat], ...geo });
              })
              .catch((err) => {
                if (err?.name === "AbortError") return;
                console.error("Reverse geocode error:", err);
                // coordinates still saved even without address
                onPinChangeRef.current?.({ coordinates: [lng, lat] });
              });
          };

          mapRef.current.on?.("click", handleClick);
          mapRef.current.addListener?.("click", handleClick);
          clickAttachedRef.current = true;
        }

        setMapError(null);
      } catch (err) {
        if (!cancelled) setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [apiKey, containerId]);

  // Sync marker when coordinates prop changes (e.g. pincode auto-fill or GPS)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !sdkRef.current || !point) return;
    removeMarker(markerRef.current);
    markerRef.current = new sdkRef.current.Marker({
      map: mapRef.current, position: point, fitbounds: false,
    });
    recenterMap(mapRef.current, point.lat, point.lng, MAP_CLICK_ZOOM);
  }, [mapReady, point?.lat, point?.lng]); // eslint-disable-line

  // Cleanup
  useEffect(() => {
    return () => {
      geocodeAbortRef.current?.abort();
      removeMarker(markerRef.current);
      markerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
      mapRef.current = null; sdkRef.current = null; clickAttachedRef.current = false;
    };
  }, []);

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm px-4 text-center bg-[#f9fafb]">
        {mapError}
      </div>
    );
  }

  return <div id={containerId} key={containerId} ref={containerRef} className="h-full w-full" />;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Step2LocationDetails({ next, back, category }) {
  const dispatch = useDispatch();
  const form     = useSelector((state) => state[category]?.form || {});

  const [errors,       setErrors]       = useState({});
  const [markerPlaced, setMarkerPlaced] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [mapPopup,     setMapPopup]     = useState(null);

  const topRef               = useRef(null);
  const gpsAbortRef          = useRef(null);   // GPS reverse geocode
  const pincodeAbortRef      = useRef(null);   // pincode forward geocode
  const fieldGeocodeAbortRef = useRef(null);   // field-watch forward geocode
  const pinPlacedByUserRef   = useRef(false);  // true after manual map click or GPS
  const skipFieldGeocodeRef  = useRef(false);  // prevents field-watch loop after pin

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const setValue = useCallback((key, value) => {
    dispatch(actions[category].updateField({ key, value }));
    if (errors[key]) setErrors((prev) => { const u = { ...prev }; delete u[key]; return u; });
  }, [dispatch, category, errors]);

  // Called by MapplsPinMap on every click → receives { coordinates, pincode?, locality?, city?, state? }
  const handlePinChange = useCallback(({ coordinates, pincode, locality, city, state }) => {
    pinPlacedByUserRef.current  = true;
    skipFieldGeocodeRef.current = true; // map click fills fields → don't re-geocode them
    setMarkerPlaced(true);

    setValue("location", { type: "Point", coordinates });
    setErrors((prev) => { const u = { ...prev }; delete u.location; return u; });

    // Text fields only updated when Nominatim returns data (second callback)
    if (pincode)  setValue("pincode",  pincode);
    if (locality) setValue("locality", locality);
    if (city)     setValue("city",     city);
    if (state)    setValue("state",    state);
  }, [setValue]);

  // GPS button
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocatingUser(false);
        const lat = coords.latitude;
        const lng = coords.longitude;

        // Instant coordinates update
        handlePinChange({ coordinates: [lng, lat] });

        // Reverse geocode → pincode + address
        gpsAbortRef.current?.abort();
        const ctrl = new AbortController();
        gpsAbortRef.current = ctrl;
        reverseGeocode(lat, lng, ctrl.signal)
          .then((geo) => handlePinChange({ coordinates: [lng, lat], ...geo }))
          .catch((e)  => { if (e?.name !== "AbortError") console.error(e); });
      },
      (err) => {
        setLocatingUser(false);
        toast.error("Could not get location. Please allow access.");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, [handlePinChange]);

  // ── Pincode auto-fill via Nominatim ───────────────────────────────────────
  // Fires when user types a complete 6-digit pincode.
  // → fills locality / city / state AND places map marker (if not pinned yet).
  useEffect(() => {
    const pin = (form.pincode || "").replace(/\D/g, "");
    if (pin.length !== 6) return;

    pincodeAbortRef.current?.abort();
    const ctrl = new AbortController();
    pincodeAbortRef.current = ctrl;

    const tid = setTimeout(async () => {
      try {
        const geo = await geocodePincode(pin, ctrl.signal);
        if (!geo) return;

        const { lat, lng, locality, city, state } = geo;

        // Always update address text fields
        if (locality) setValue("locality", locality);
        if (city)     setValue("city",     city);
        if (state)    setValue("state",    state);

        // Place map marker only if user hasn't pinned manually
        if (!pinPlacedByUserRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
          skipFieldGeocodeRef.current = true;
          setValue("location", { type: "Point", coordinates: [lng, lat] });
          setMarkerPlaced(true);
        }
      } catch (e) {
        if (e?.name !== "AbortError") console.error("Pincode geocode error:", e);
      }
    }, 300);

    return () => { ctrl.abort(); clearTimeout(tid); };
  }, [form.pincode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field-watch geocode (fallback) ────────────────────────────────────────
  // When locality/city/state are edited manually and no pin exists yet,
  // auto-place the map marker (mirrors File 5 behaviour).
  useEffect(() => {
    if (skipFieldGeocodeRef.current) { skipFieldGeocodeRef.current = false; return; }
    if (!form.locality || !form.city || !form.state) return;

    fieldGeocodeAbortRef.current?.abort();
    const ctrl = new AbortController();
    fieldGeocodeAbortRef.current = ctrl;

    geocodeText(`${form.locality}, ${form.city}, ${form.state}`, ctrl.signal)
      .then((geo) => {
        if (!geo) return;
        setValue("location", { type: "Point", coordinates: [geo.lng, geo.lat] });
        setMarkerPlaced(true);
      })
      .catch((e) => { if (e?.name !== "AbortError") console.error(e); });

    return () => ctrl.abort();
  }, [form.locality, form.city, form.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      gpsAbortRef.current?.abort();
      pincodeAbortRef.current?.abort();
      fieldGeocodeAbortRef.current?.abort();
    };
  }, []);

  // Nearby place add / remove
  const handleAddPlace = useCallback((place) => {
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
  }, [form.nearbyPlaces, form.location, setValue]);

  const handleRemovePlace = useCallback((place) => {
    setValue("nearbyPlaces",
      (form.nearbyPlaces || []).filter((p) => !(p.name === place.name && p.type === place.type))
    );
  }, [form.nearbyPlaces, setValue]);

  // Validation
  const validate = () => {
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
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    const activeCategory = localStorage.getItem("activeCategory");
    const propertyId = localStorage.getItem(`${activeCategory}_propertyId`);
    if (!propertyId) { toast.error("Property ID missing."); return; }
    try {
      await dispatch(savePropertyData({ category, id: propertyId, step: "location" })).unwrap();
      toast.success("Location saved!");
      next();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save location");
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
        <button type="button"
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

          <FieldWrapper label="Address Line" error={errors.address}>
            <textarea
              rows={3}
              value={form.address || ""}
              onChange={(e) => setValue("address", e.target.value)}
              placeholder="Enter full address..."
              className={inputCls + " resize-none"}
            />
          </FieldWrapper>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(form.propertyCategory === "residential" || form.propertyCategory === "commercial") && (
              <FieldWrapper label="Apartment / Society" error={errors.buildingName}>
                <input value={form.buildingName || ""} onChange={(e) => setValue("buildingName", e.target.value)}
                  placeholder="Society / Building name" className={inputCls} />
              </FieldWrapper>
            )}
            {(form.propertyCategory === "land" || form.propertyCategory === "agricultural") && (
              <FieldWrapper label="Land Name / Society" error={errors.landName}>
                <input value={form.landName || ""} onChange={(e) => setValue("landName", e.target.value)}
                  placeholder="Land Name / Society Name" className={inputCls} />
              </FieldWrapper>
            )}
            <FieldWrapper label="Pincode" error={errors.pincode}>
              <input
                value={form.pincode || ""}
                onChange={(e) => setValue("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                maxLength={6}
                className={inputCls}
              />
            </FieldWrapper>
          </div>

          {/* Read-only auto-filled fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldWrapper label="Locality" error={errors.locality}>
              <input value={form.locality || ""} readOnly placeholder="Auto-filled from map / pincode" className={readonlyCls} />
            </FieldWrapper>
            <FieldWrapper label="City" error={errors.city}>
              <input value={form.city || ""} readOnly placeholder="Auto-filled from map / pincode" className={readonlyCls} />
            </FieldWrapper>
            <FieldWrapper label="State" error={errors.state}>
              <input value={form.state || ""} readOnly placeholder="Auto-filled from map / pincode" className={readonlyCls} />
            </FieldWrapper>
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
                Click the map → pincode + locality + city + state auto-filled via OpenStreetMap
              </p>
            </div>
          </div>
          <button type="button" onClick={handleUseMyLocation} disabled={locatingUser}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-[#27AE60] text-[#27AE60] bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {locatingUser ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
            {locatingUser ? "Locating…" : "Use My Location"}
          </button>
        </div>

        <div className="relative z-10 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-inner" style={{ height: 320 }}>
          <MapplsPinMap
            coordinates={form.location?.coordinates}
            onPinChange={handlePinChange}
          />
        </div>

        {!markerPlaced && (
          <div className="mt-2 flex items-center gap-1.5 text-[#f59e0b]">
            <Navigation size={12} />
            <p className="text-xs font-medium">Click the map or use "Use My Location" to pin your property</p>
          </div>
        )}
        {markerPlaced && (
          <div className="mt-2 flex items-center gap-1.5 text-[#27AE60]">
            <Check size={12} />
            <p className="text-xs font-medium">
              Location pinned — click map to re-pin
              {(form.locality || form.city) ? ` · ${[form.locality, form.city].filter(Boolean).join(", ")}` : ""}
              {form.pincode ? ` · ${form.pincode}` : ""}
            </p>
          </div>
        )}
        {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}

        {/* Nearby-marker popup */}
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
              {(form.nearbyPlaces || []).some((p) => p.name === mapPopup.place.name && p.type === mapPopup.place.type) ? (
                <button type="button" onClick={() => { handleRemovePlace(mapPopup.place); setMapPopup(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border bg-[#f0fdf4] text-[#27AE60] border-[#bbf7d0]"
                ><Check size={11} /> Added</button>
              ) : (
                <button type="button" onClick={() => handleAddPlace(mapPopup.place)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border bg-[#27AE60] text-white hover:bg-[#219150] transition-colors"
                ><Plus size={11} /> Add Place</button>
              )}
              <button type="button" onClick={() => setMapPopup(null)}
                className="text-[#9ca3af] hover:text-[#374151] transition-colors"
              ><X size={14} /></button>
            </div>
          </div>
        )}
      </CardWrapper>

      {/* Nearby places */}
      <CardWrapper>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
            <Search size={14} className="text-[#27AE60]" />
          </div>
          <div>
            <SectionLabel>Nearby Places</SectionLabel>
            <p className="text-[10px] text-[#9ca3af] -mt-2">
              Live Photon search · Browse categories · Name search — all via OpenStreetMap
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
        <button onClick={back}
          className="flex-1 py-4 border-2 border-[#e5e7eb] text-[#6b7280] font-bold rounded-2xl hover:border-[#27AE60] hover:text-[#27AE60] transition-all duration-200 text-sm"
        >← Back</button>
        <button onClick={handleContinue}
          className="flex-1 py-4 bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white font-bold rounded-2xl hover:from-[#219150] hover:to-[#27AE60] transition-all duration-200 shadow-lg shadow-green-200/60 text-sm"
        >Continue →</button>
      </div>
    </div>
  );
}

