

// src/pages/post-property/featured-create/steps/LocationStep.jsx
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useId,
} from "react";
import {
  MapPin,
  Trash2,
  Navigation,
  Search,
  Info,
  Loader2,
  X,
  Check,
  LocateFixed,
  Plus,
} from "lucide-react";

/* ── Design tokens ─────────────────────────────────────────── */
const inp = (err) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
   outline-none placeholder:text-gray-400 transition-all duration-200
   ${
     err
       ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
       : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"
   }`;

const LABEL =
  "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const MAPPLS_SCRIPT_ID       = "mappls-sdk-script";
const DEFAULT_POSITION       = { lat: 17.385, lng: 78.4867 };
const MAP_CLICK_ZOOM         = 15;
const SEARCH_RADIUS_KM       = 5;
const SEARCH_RESULT_LIMIT    = 6;
const PHOTON_CANDIDATE_LIMIT = 20;

/* ══════════════════════════════════════════════════════════════
   STRING HELPERS
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   MAPPLS SDK LOADER
══════════════════════════════════════════════════════════════ */
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
    if (typeof m.remove  === "function") { m.remove();     return; }
    if (typeof m.setMap  === "function") { m.setMap(null); }
  } catch (e) { console.warn("Marker cleanup:", e); }
}

function recenterMap(map, lat, lng, zoom) {
  map.setCenter?.({ lat, lng });
  map.setZoom?.(zoom);
  map.panTo?.({ lat, lng });
}

/* ══════════════════════════════════════════════════════════════
   NOMINATIM GEOCODING
══════════════════════════════════════════════════════════════ */
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

async function geocodeAddressSearch(text, signal) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`,
    { signal, headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

/* ══════════════════════════════════════════════════════════════
   DISTANCE HELPERS
══════════════════════════════════════════════════════════════ */
const toRad = (v) => (v * Math.PI) / 180;

function haversineKm(src, dst) {
  const [sLng, sLat] = src;
  const [dLng, dLat] = dst;
  const R     = 6371;
  const dLat2 = toRad(dLat - sLat);
  const dLng2 = toRad(dLng - sLng);
  const a =
    Math.sin(dLat2 / 2) ** 2 +
    Math.cos(toRad(sLat)) * Math.cos(toRad(dLat)) * Math.sin(dLng2 / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtKm(km) {
  if (km === undefined) return undefined;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/* ══════════════════════════════════════════════════════════════
   PHOTON BOUNDING-BOX HELPER
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   MAPPLS PIN MAP
══════════════════════════════════════════════════════════════ */
function MapplsPinMap({ coordinates, onPinChange }) {
  const [mapError, setMapError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const containerId = useId().replace(/:/g, "-");

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
    const lat = parseFloat(coordinates[1]);
    const lng = parseFloat(coordinates[0]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates?.[0], coordinates?.[1]]);

  useEffect(() => { onPinChangeRef.current = onPinChange; }, [onPinChange]);

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
            center: DEFAULT_POSITION, zoom: 12,
            zoomControl: true, location: false,
          });
          setMapReady(true);
        } else {
          setMapReady(true);
        }

        if (mapRef.current && !clickAttachedRef.current) {
          const handleClick = (event) => {
            const e   = event;
            const lat = Number(e?.latlng?.lat ?? e?.lngLat?.lat ?? e?.lat);
            const lng = Number(e?.latlng?.lng ?? e?.lngLat?.lng ?? e?.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            removeMarker(markerRef.current);
            markerRef.current = new sdk.Marker({
              map: mapRef.current, position: { lat, lng }, fitbounds: false,
            });
            recenterMap(mapRef.current, lat, lng, MAP_CLICK_ZOOM);
            onPinChangeRef.current?.({ coordinates: [lng, lat] });

            geocodeAbortRef.current?.abort();
            const ctrl = new AbortController();
            geocodeAbortRef.current = ctrl;
            reverseGeocode(lat, lng, ctrl.signal)
              .then((geo) => onPinChangeRef.current?.({ coordinates: [lng, lat], ...geo }))
              .catch((err) => {
                if (err?.name === "AbortError") return;
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
          setMapError(err instanceof Error ? err.message : "Unable to load map.");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [apiKey, containerId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !sdkRef.current || !point) return;
    removeMarker(markerRef.current);
    markerRef.current = new sdkRef.current.Marker({
      map: mapRef.current, position: point, fitbounds: false,
    });
    recenterMap(mapRef.current, point.lat, point.lng, MAP_CLICK_ZOOM);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, point?.lat, point?.lng]);

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
      <div className="h-full w-full  flex items-center justify-center text-gray-500 text-sm px-4 text-center bg-gray-50 rounded-2xl">
        {mapError}
      </div>
    );
  }

  return <div id={containerId} key={containerId} ref={containerRef} className="h-full w-full" />;
}

/* ══════════════════════════════════════════════════════════════
   NEARBY PLACES PANEL  —  Photon live search only (5 km)
══════════════════════════════════════════════════════════════ */
function NearbyPlacesPanel({ pinnedCoords, selectedPlaces, onAdd, onRemove }) {
  const [query,         setQuery]         = useState("");
  const [photonResults, setPhotonResults] = useState([]);
  const [photonLoading, setPhotonLoading] = useState(false);
  const [photonMsg,     setPhotonMsg]     = useState(null);

  const photonTimer = useRef(null);
  const dropRef     = useRef(null);

  const isAdded = (name, type) =>
    selectedPlaces.some((p) => p.name === name && p.type === type);

  useEffect(() => {
    if (query.length < 3) { setPhotonResults([]); setPhotonMsg(null); return; }
    if (photonTimer.current) clearTimeout(photonTimer.current);
    const ctrl = new AbortController();

    photonTimer.current = setTimeout(async () => {
      try {
        setPhotonLoading(true); setPhotonMsg(null);
        const params = new URLSearchParams({
          q: query, lang: "en", limit: String(PHOTON_CANDIDATE_LIMIT),
        });
        if (pinnedCoords?.length === 2) {
          const [lng, lat] = pinnedCoords;
          const [mnLng, mnLat, mxLng, mxLat] = getBBox(pinnedCoords, SEARCH_RADIUS_KM);
          params.set("lon",  String(lng));
          params.set("lat",  String(lat));
          params.set("bbox", `${mnLng},${mnLat},${mxLng},${mxLat}`);
        }
        const res = await fetch(
          `https://photon.komoot.io/api/?${params}`,
          { signal: ctrl.signal, headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) { setPhotonMsg("Unable to fetch places right now."); return; }

        const features = (await res.json())?.features ?? [];
        const next = features
          .map((f) => {
            const [pLng, pLat] = f.geometry?.coordinates ?? [];
            const coords  = Number.isFinite(pLng) && Number.isFinite(pLat) ? [pLng, pLat] : undefined;
            const distKm  = pinnedCoords && coords ? haversineKm(pinnedCoords, coords) : undefined;
            const addr    = buildPhotonAddress(f.properties);
            const title   = f.properties?.name || addr || query;
            return {
              id:          f.properties?.osm_id ? String(f.properties.osm_id) : coords?.join(","),
              title,
              address:     addr && addr !== title ? addr : undefined,
              type:        f.properties?.osm_value || f.properties?.osm_key || "place",
              coordinates: coords,
              distanceKm:  distKm,
            };
          })
          .filter((p) => Boolean(p.title))
          .filter((p) => pinnedCoords ? (p.distanceKm ?? Infinity) <= SEARCH_RADIUS_KM : true)
          .slice(0, SEARCH_RESULT_LIMIT);

        setPhotonResults(next);
        if (!next.length)
          setPhotonMsg(
            pinnedCoords
              ? `No places found within ${SEARCH_RADIUS_KM} km.`
              : "No matching places."
          );
      } catch (err) {
        if (err?.name !== "AbortError") { setPhotonResults([]); setPhotonMsg("Search error."); }
      } finally { setPhotonLoading(false); }
    }, 400);

    return () => { ctrl.abort(); clearTimeout(photonTimer.current); };
  }, [query, pinnedCoords]);

  useEffect(() => {
    const h = (e) => {
      if (!dropRef.current?.contains(e.target)) {
        setPhotonResults([]); setPhotonMsg(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addPhoton = (place) => {
    const name = place.address ? `${place.title}, ${place.address}` : place.title;
    if (selectedPlaces.some((p) => p.name === name)) return;
    onAdd({
      name,
      type:         place.type,
      coordinates:  place.coordinates || [],
      distanceText: fmtKm(place.distanceKm),
    });
    setQuery(""); setPhotonResults([]); setPhotonMsg(null);
  };

  if (!pinnedCoords) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <Navigation size={13} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-800 font-medium">
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
          Live search within <span className="font-bold">{SEARCH_RADIUS_KM} km</span> of your
          pinned location — results appear as you type.
        </p>
      </div>

      {/* Search input + dropdown */}
      <div ref={dropRef} className="relative">
        <div className="relative">
          {photonLoading ? (
            <Loader2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search nearby places (e.g. Metro, Apollo Hospital, DPS…)`}
            className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-semibold
              text-gray-900 focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10
              outline-none transition-all placeholder:text-gray-400 bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setPhotonResults([]); setPhotonMsg(null); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Type 3+ characters — results appear instantly within {SEARCH_RADIUS_KM} km · Click to add
        </p>

        {/* Photon dropdown */}
        {(photonResults.length > 0 || photonMsg) && (
          <div className="relative z-10 w-full mt-1.5 bg-white border-2 border-gray-200  rounded-xl shadow-xl overflow-hidden">
            {photonResults.map((p, i) => {
              const name  = p.address ? `${p.title}, ${p.address}` : p.title;
              const added = isAdded(name, p.type);
              return (
                <button
                  key={`ph-${p.id}-${i}`}
                  type="button"
                  onClick={() => addPhoton(p)}
                  disabled={added}
                  className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3
                    border-b border-gray-100 last:border-b-0 transition-colors
                    ${added ? "bg-[#f0fdf4] cursor-default" : "hover:bg-[#f0fdf4]"}`}
                >
                  <MapPin
                    size={14}
                    className={`mt-0.5 shrink-0 ${added ? "text-[#27AE60]" : "text-gray-400"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-gray-900 font-semibold line-clamp-1">{p.title}</span>
                    {p.address && (
                      <span className="block text-xs text-gray-400 mt-0.5 line-clamp-1">{p.address}</span>
                    )}
                    <span className="flex items-center gap-2 mt-0.5">
                      {p.type && (
                        <span className="text-[10px] text-gray-400 font-semibold capitalize bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {p.type}
                        </span>
                      )}
                      {p.distanceKm !== undefined && (
                        <span className="text-[10px] text-[#27AE60] font-bold">
                          {fmtKm(p.distanceKm)} away
                        </span>
                      )}
                    </span>
                  </span>
                  {added ? (
                    <Check size={14} className="text-[#27AE60] shrink-0 mt-0.5" />
                  ) : (
                    <Plus size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
            {photonMsg && !photonResults.length && (
              <div className="px-4 py-4 text-sm text-gray-400 text-center">
                <Search size={20} className="mx-auto mb-1.5 opacity-40" />
                {photonMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Added chips */}
      {selectedPlaces.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            Added ({selectedPlaces.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPlaces.map((place, i) => (
              <span
                key={`chip-${i}`}
                className="bg-[#f0fdf4] text-[#27AE60] text-xs font-semibold px-3 py-1.5
                  rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
              >
                <MapPin size={10} className="shrink-0" />
                <span className="max-w-[140px] truncate">{place.name.split(",")[0]}</span>
                {place.distanceText && (
                  <span className="text-green-400 font-normal">· {place.distanceText}</span>
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

/* ══════════════════════════════════════════════════════════════
   MAIN LocationStep
══════════════════════════════════════════════════════════════ */
const LocationStep = forwardRef(({ payload, update }, ref) => {
  const location = payload.location     || { type: "Point", coordinates: ["", ""] };
  const places   = payload.nearbyPlaces || [];

  const [errors,       setErrors]       = useState({});
  const [markerPlaced, setMarkerPlaced] = useState(
    !!(payload.location?.coordinates?.[0] && payload.location?.coordinates?.[1])
  );
  const [locatingUser, setLocatingUser] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searching,    setSearching]    = useState(false);

  // const [addrFields, setAddrFields] = useState({
  //   pincode:  payload.pincode  || "",
  //   locality: payload.locality || "",
  //   city:     payload.city     || "",
  //   state:    payload.state    || "",
  // });

  const locationRef        = useRef(null);
  const gpsAbortRef        = useRef(null);
  const pincodeAbortRef    = useRef(null);
  const pinPlacedByUserRef = useRef(false);

  const clr = (key) =>
    setErrors((p) => { const c = { ...p }; delete c[key]; return c; });

  // const setAddr = useCallback((key, value) => {
  //   setAddrFields((prev) => ({ ...prev, [key]: value }));
  //   update({ [key]: value });
  // }, [update]);

  /* ── Validation ── */
  // useImperativeHandle(ref, () => ({
  //   validate() {
  //     const e = {};
  //     if (!location.coordinates[0] || !location.coordinates[1])
  //       e.coords = "Please pin a location on the map";
  //     if (!places.length)
  //       e.nearbyPlaces = "Please add at least one nearby place";
  //     setErrors(e);
  //     if (Object.keys(e).length) {
  //       locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  //       return false;
  //     }
  //     return true;
  //   },
  // }));
useImperativeHandle(ref, () => ({
  validate() {
    const e = {};

    if (!location.coordinates[0] || !location.coordinates[1]) {
      e.coords = "Please pin a location on the map";
    }

    if (!places.length) {
      e.nearbyPlaces = "Please add at least one nearby place";
    }

    setErrors(e);

    if (Object.keys(e).length) {
      locationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }

    return true;
  },

  // ✅ ADD THIS (IMPORTANT)
  isValid() {
    return (
      location.coordinates[0] && location.coordinates[1] && places.length > 0
    );
  },
}));
  /* ── Pin change callback ── */
  // const handlePinChange = useCallback(
  //   ({ coordinates, pincode, locality, city, state }) => {
  //     pinPlacedByUserRef.current = true;
  //     setMarkerPlaced(true);
  //     clr("coords");

  //     update({
  //       location: { type: "Point", coordinates: [String(coordinates[0]), String(coordinates[1])] },
  //     });

  //     // if (pincode)  setAddr("pincode",  pincode);
  //     // if (locality) setAddr("locality", locality);
  //     // if (city)     setAddr("city",     city);
  //     // if (state)    setAddr("state",    state);
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [update]
  // );


  const handlePinChange = useCallback(
    ({ coordinates }) => {
      pinPlacedByUserRef.current = true;
      setMarkerPlaced(true);
      clr("coords");

      update({
        location: {
          type: "Point",
          coordinates: [String(coordinates[0]), String(coordinates[1])],
        },
      });
    },
    [update],
  );


  /* ── GPS button ── */
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocatingUser(false);
        const lat = coords.latitude;
        const lng = coords.longitude;
        handlePinChange({ coordinates: [lng, lat] });

        gpsAbortRef.current?.abort();
        const ctrl = new AbortController();
        gpsAbortRef.current = ctrl;
        reverseGeocode(lat, lng, ctrl.signal)
          .then((geo) => handlePinChange({ coordinates: [lng, lat], ...geo }))
          .catch((e)  => { if (e?.name !== "AbortError") console.error(e); });
      },
      (err) => {
        setLocatingUser(false);
        alert("Could not get location. Please allow access.");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, [handlePinChange]);

  /* ── Address text search ── */
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const ctrl = new AbortController();
      const geo  = await geocodeAddressSearch(searchQuery, ctrl.signal);
      if (geo) {
        handlePinChange({ coordinates: [geo.lng, geo.lat] });
        reverseGeocode(geo.lat, geo.lng, new AbortController().signal)
          .then((g) => handlePinChange({ coordinates: [geo.lng, geo.lat], ...g }))
          .catch(console.error);
      } else {
        alert("Location not found. Try a more specific query.");
      }
    } catch { alert("Search failed. Check your internet connection."); }
    finally  { setSearching(false); }
  };

  /* ── Pincode auto-fill ── */
  // useEffect(() => {
  //   const pin = (addrFields.pincode || "").replace(/\D/g, "");
  //   if (pin.length !== 6) return;

  //   pincodeAbortRef.current?.abort();
  //   const ctrl = new AbortController();
  //   pincodeAbortRef.current = ctrl;

  //   const tid = setTimeout(async () => {
  //     try {
  //       const geo = await geocodePincode(pin, ctrl.signal);
  //       if (!geo) return;
  //       const { lat, lng, locality, city, state } = geo;
  //       if (locality) setAddr("locality", locality);
  //       if (city)     setAddr("city",     city);
  //       if (state)    setAddr("state",    state);
  //       if (!pinPlacedByUserRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
  //         update({ location: { type: "Point", coordinates: [String(lng), String(lat)] } });
  //         setMarkerPlaced(true); clr("coords");
  //       }
  //     } catch (e) { if (e?.name !== "AbortError") console.error(e); }
  //   }, 300);

  //   return () => { ctrl.abort(); clearTimeout(tid); };
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [addrFields.pincode]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      gpsAbortRef.current?.abort();
      pincodeAbortRef.current?.abort();
    };
  }, []);

  /* ── Nearby place add / remove ── */
  const handleAddPlace = useCallback(
    (place) => {
      if (places.some((p) => p.name === place.name && p.type === place.type)) return;
      update({
        nearbyPlaces: [
          ...places,
          {
            name:         place.name,
            type:         place.type,
            distanceText: place.distanceText || "",
            coordinates:  place.coordinates  || location.coordinates || [0, 0],
            order:        places.length,
          },
        ],
      });
      clr("nearbyPlaces");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [places, location, update]
  );

  const handleRemovePlace = useCallback(
    (place) => {
      update({
        nearbyPlaces: places.filter(
          (p) => !(p.name === place.name && p.type === place.type)
        ),
      });
    },
    [places, update]
  );

  const mapCoords =
    location.coordinates[0] && location.coordinates[1]
      ? [String(location.coordinates[0]), String(location.coordinates[1])]
      : null;

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6" ref={locationRef}>
      {/* ── Section 1: Project Coordinates (Mappls Map) ───── */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
              border: "2px solid #bbf7d0",
            }}
          >
            <Navigation size={17} style={{ color: "#27AE60" }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              GeoJSON · Point
            </p>
            <h3 className="text-sm font-black text-gray-900">
              Project Coordinates
            </h3>
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locatingUser}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-xs font-black
              text-gray-600 hover:border-[#27AE60] hover:text-[#27AE60] hover:bg-[#f0fdf6]
              transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {locatingUser ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <LocateFixed size={13} />
            )}
            {locatingUser ? "Locating…" : "Use My Location"}
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Address search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                  font-semibold text-gray-900 placeholder:text-gray-400 outline-none
                  focus:border-[#27AE60] focus:bg-white focus:ring-4 focus:ring-[#27AE60]/10 transition-all"
                placeholder="Search address or place name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchAddress()}
              />
            </div>
            <button
              type="button"
              onClick={searchAddress}
              disabled={searching}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-black
                hover:opacity-90 transition-all shadow-md disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              {searching ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 px-4 py-3 bg-[#f0fdf6] border border-[#27AE60]/20 rounded-xl">
            <Info size={14} className="text-[#27AE60] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#1a7a42] font-semibold leading-relaxed">
              Click anywhere on the map to drop the pin — pincode, locality,
              city and state are auto-filled via OpenStreetMap. You can also
              type a 6-digit pincode below to auto-locate.
            </p>
          </div>

          {/* Mappls Map */}
          <div
            className="rounded-2xl overflow-hidden border-2   border-gray-200 shadow-sm"
            style={{ position: "relative", height: 360, width: "90%" }}
            
          >
            <MapplsPinMap
              coordinates={mapCoords}
              onPinChange={handlePinChange}
            />
            {location.coordinates[0] && location.coordinates[1] && (
              <div
                className="absolute bottom-3 left-3 px-3 py-2 rounded-xl text-xs font-black text-white z-10 shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                  pointerEvents: "none",
                }}
              >
                📍 {parseFloat(location.coordinates[1]).toFixed(5)},{" "}
                {parseFloat(location.coordinates[0]).toFixed(5)}
              </div>
            )}
          </div>

          {/* Pin status */}
          {!markerPlaced && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <Navigation size={12} />
              <p className="text-xs font-medium">
                Click the map or use "Use My Location" to pin your property
              </p>
            </div>
          )}
          {markerPlaced && (
            <div className="flex items-center gap-1.5 text-[#27AE60]">
              <Check size={12} />
              <p className="text-xs font-medium">
                Location pinned — click map to re-pin
                {/* {addrFields.locality || addrFields.city
                  ? ` · ${[addrFields.locality, addrFields.city].filter(Boolean).join(", ")}`
                  : ""}
                {addrFields.pincode ? ` · ${addrFields.pincode}` : ""} */}
              </p>
            </div>
          )}
          {errors.coords && (
            <p className="text-xs text-red-500 font-semibold">
              ⚠ {errors.coords}
            </p>
          )}

          {/* Auto-filled address fields */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className={LABEL}>
                Pincode{" "}
                <span className="text-gray-400 normal-case font-semibold tracking-normal">
                  (type to auto-locate)
                </span>
              </label>
              <input
                className={inp(false)}
                placeholder="6-digit pincode"
                maxLength={6}
                value={addrFields.pincode}
                onChange={(e) => setAddr("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <div>
              <label className={LABEL}>Locality</label>
              <input
                readOnly
                className={inp(false) + " bg-gray-50 cursor-default"}
                placeholder="Auto-filled from map / pincode"
                value={addrFields.locality}
              />
            </div>
            <div>
              <label className={LABEL}>City</label>
              <input
                readOnly
                className={inp(false) + " bg-gray-50 cursor-default"}
                placeholder="Auto-filled from map / pincode"
                value={addrFields.city}
              />
            </div>
            <div>
              <label className={LABEL}>State</label>
              <input
                readOnly
                className={inp(false) + " bg-gray-50 cursor-default"}
                placeholder="Auto-filled from map / pincode"
                value={addrFields.state}
              />
            </div>
          </div> */}

          {/* Read-only coordinate display */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className={LABEL}>Longitude (X)</label>
              <input
                type="number"
                step="any"
                readOnly
                className={inp(false) + " bg-gray-50 cursor-default"}
                placeholder="Auto from map"
                value={location.coordinates[0]}
              />
            </div>
            <div>
              <label className={LABEL}>Latitude (Y)</label>
              <input
                type="number"
                step="any"
                readOnly
                className={inp(false) + " bg-gray-50 cursor-default"}
                placeholder="Auto from map"
                value={location.coordinates[1]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Added Nearby Places list ────────────── */}
      {places.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Added Nearby Places
            </p>
            <span
              className="px-2 py-0.5 rounded-lg text-[10px] font-black text-white"
              style={{ background: "#27AE60" }}
            >
              {places.length}
            </span>
          </div>

          {places.map((p, i) => (
            <div
              key={i}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="px-2.5 py-1 text-xs font-black rounded-lg text-white shrink-0 capitalize"
                    style={{
                      background: "linear-gradient(135deg,#27AE60,#1e8449)",
                    }}
                  >
                    {p.type || "Place"}
                  </span>
                  <span className="text-sm font-bold text-gray-800 truncate">
                    {p.name.split(",")[0] || "Unnamed"}
                  </span>
                  {p.distanceText && (
                    <span className="text-xs text-[#27AE60] font-semibold shrink-0">
                      · {p.distanceText}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemovePlace(p)}
                  className="p-2 text-red-500 hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all shrink-0 ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section 3: Nearby Places — Photon live search ─── */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
              border: "2px solid #bbf7d0",
            }}
          >
            <Search size={17} style={{ color: "#27AE60" }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Photon · OpenStreetMap · {SEARCH_RADIUS_KM} km radius
            </p>
            <h3 className="text-sm font-black text-gray-900">Nearby Places</h3>
          </div>
          {errors.nearbyPlaces && (
            <p className="text-xs text-red-500 font-semibold">
              ⚠ {errors.nearbyPlaces}
            </p>
          )}
        </div>

        <div className="p-5">
          <NearbyPlacesPanel
            pinnedCoords={
              location.coordinates[0] && location.coordinates[1]
                ? [
                    parseFloat(location.coordinates[0]),
                    parseFloat(location.coordinates[1]),
                  ]
                : null
            }
            selectedPlaces={places}
            onAdd={handleAddPlace}
            onRemove={handleRemovePlace}
          />
        </div>
      </div>
    </div>
  );
});

LocationStep.displayName = "LocationStep";

export default LocationStep;