
import {
  MapPin,
  X,
  Building2,
  Navigation,
  Hash,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Highlight } from "../utils/highlight";

export const LocationSearch = ({ users, onFilter, activeTag, onClearTag }) => {
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const wrapRef = useRef(null);

  // Build unique location options from user data
  const locationOptions = useMemo(() => {
    const set = new Set();
    const opts = [];

    users.forEach((u) => {
      const addOpt = (val, type, icon) => {
        const key = `${type}:${val?.toLowerCase()}`;
        if (val && !set.has(key)) {
          set.add(key);
          opts.push({ value: val, type, icon, display: val });
        }
      };
      addOpt(u.locality, "locality", "📍");
      addOpt(u.city, "city", "🏙️");
      addOpt(u.state, "state", "🗺️");
      addOpt(u.pincode, "pincode", "📮");
    });

    return opts.sort((a, b) => {
      const order = { city: 0, state: 1, locality: 2, pincode: 3 };
      return (order[a.type] ?? 4) - (order[b.type] ?? 4);
    });
  }, [users]);

  const typeLabel = {
    locality: "Locality",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };
  const typeColor = {
    locality: "text-purple-600 bg-purple-50",
    city: "text-[#27AE60] bg-[#27AE60]/10",
    state: "text-blue-600 bg-blue-50",
    pincode: "text-amber-600 bg-amber-50",
  };

  const handleInput = (val) => {
    setInputVal(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      onFilter(null);
      return;
    }
    const q = val.toLowerCase();
    const matched = locationOptions.filter((o) =>
      o.value?.toLowerCase().includes(q),
    );
    setSuggestions(matched.slice(0, 10));
    setShowDrop(true);
  };

  const handleSelect = (opt) => {
    setInputVal("");
    setShowDrop(false);
    setSuggestions([]);
    onFilter(opt);
  };

  const handleClear = () => {
    setInputVal("");
    setSuggestions([]);
    setShowDrop(false);
    onFilter(null);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <MapPin className="absolute    left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27AE60]" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (inputVal && suggestions.length) setShowDrop(true);
            else if (!inputVal) {
              setSuggestions(locationOptions.slice(0, 8));
              setShowDrop(true);
            }
          }}
          placeholder="Search by locality, city, state, pincode…"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                     placeholder-gray-400 focus:outline-none focus:border-[#27AE60] focus:ring-4
                     focus:ring-[#27AE60]/10 shadow-sm transition-all duration-200"
        />
        {inputVal && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {/* Active filter tag */}
      
      {activeTag && (
        <div className="absolute top-10 left-2 z-20 mt-2  bg-green-50 border border-[#27AE60] rounded-2xl flex items-center gap-2 p-3  ">
          <span className="text-xs text-[#000000]  max-sm:hidden">Filtering by:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold max-sm:text-nowrap ${typeColor[activeTag.type]}`}
          >
            <MapPin className="w-3 h-3" />
            {typeLabel[activeTag.type]}: {activeTag.value}
            <button onClick={handleClear} className="ml-0.5 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
      {/* Dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div className="absolute z-20 max-sm:right-0 max-sm:w-[200px] mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/60 overflow-hidden">
          {/* Group by type */}
          {["city", "state", "locality", "pincode"].map((type) => {
            const group = suggestions.filter((s) => s.type === type);
            if (!group.length) return null;
            return (
              <div key={type}>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor[type]}`}
                  >
                    {typeLabel[type]}
                  </span>
                </div>
                {group.map((opt, i) => {
                  const count = users.filter(
                    (u) =>
                      u[opt.type]?.toLowerCase() === opt.value?.toLowerCase(),
                  ).length;
                  return (
                    <button
                      key={i}
                      onMouseDown={() => handleSelect(opt)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#27AE60]/5
                                 transition-colors duration-100 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        {type === "locality" && (
                          <Navigation className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        )}
                        {type === "city" && (
                          <Building2 className="w-3.5 h-3.5 text-[#27AE60] flex-shrink-0" />
                        )}
                        {type === "state" && (
                          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        )}
                        {type === "pincode" && (
                          <Hash className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 capitalize font-medium">
                          <Highlight text={opt.value} query={inputVal} />
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-white bg-[#27AE60] px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                        {count} user{count !== 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      {showDrop && inputVal && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-4 text-center">
          <MapPin className="w-6 h-6 text-gray-200 mx-auto mb-1" />
          <p className="text-sm text-gray-400">
            No locations match "{inputVal}"
          </p>
        </div>
      )}
    </div>
  );
};
