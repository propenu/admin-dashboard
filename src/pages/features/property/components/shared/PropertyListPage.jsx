// src/features/property/components/shared/PropertyListPage.jsx
import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  RefreshCw,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../../../components/common/LoadingSpinner";
import PropertyCard from "./PropertyCard";
import PromoteModal from "./PromoteModal";
import ConfirmModal from "./ConfirmModal";


const CATEGORY_TYPES = [
  {
    value: "residential",
    label: "Residential",
    icon: "🏠",
  },

  {
    value: "land",
    label: "Land",
    icon: "🌍",
  },
];

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment", icon: "🏗" },
    { label: "Villa", value: "villa", icon: "🏰" },
    { label: "Duplex", value: "duplex", icon: "🏘" },
    { label: "Triplex", value: "triplex", icon: "🏚" },
    { label: "Farmhouse", value: "farmhouse", icon: "🌿" },
  ],

  land: [
    { label: "Plot", value: "plot", icon: "📌" },
    { label: "Residential Plot", value: "residential-plot", icon: "🏠" },
    { label: "Industrial Plot", value: "industrial-plot", icon: "🏭" },
    { label: "Agricultural Plot", value: "agricultural-plot", icon: "🌾" },
    { label: "Commercial Plot", value: "commercial-plot", icon: "🏢" },
  ],
};

export default function PropertyListPage({
  type,
  title,
  subtitle,
  createRoute,
  accentColor = "text-[#27AE60]",
  hook,
}) {
  const navigate = useNavigate();
  const {
    properties,
    sortedProperties,
    isLoading,
    isError,
    deleteMutation,
    promoteMutation,
    expireMutation,
    resetMutation,
    totalCount,
    activeCount,
    inactiveCount,
    expiredCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = hook;

  // ── Location filter ────────────────────────────────────────────────────────
  const [openLocations, setOpenLocations] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // ── Modal states ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [expireTarget, setExpireTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  // ── Status filter ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");

  const loadMoreRef = useRef(null);

  // Build location list from properties
  useEffect(() => {
    if (!properties.length) {
      setLocations([]);
      setSelectedLocation(null);
      return;
    }
    const cityMap = new Map();
    properties.forEach((p) => {
      const city = p.city?.trim();
      if (!city) return;
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    setLocations(
      Array.from(cityMap.entries()).map(([name, count]) => ({ name, count })),
    );
  }, [properties]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.5,
      },
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [fetchNextPage, hasNextPage, isLoading]);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLocationClick = (name) =>
    setSelectedLocation((prev) => (prev === name ? null : name));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(locations);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocations(items);
  };

  // Apply filters
  let visibleProperties = selectedLocation
    ? sortedProperties.filter((p) => p.city?.trim() === selectedLocation)
    : sortedProperties;

  if (statusFilter !== "all") {
    visibleProperties = visibleProperties.filter(
      (p) => p.status === statusFilter,
    );
  }

  if (selectedCategory !== "all") {
  visibleProperties = visibleProperties.filter(
    (p) => p.categoryType === selectedCategory
  );
}

if (selectedPropertyType !== "all") {
  visibleProperties = visibleProperties.filter(
    (p) => p.propertyType === selectedPropertyType
  );
}

// if (selectedCategory !== "all") {
//   visibleProperties = visibleProperties.filter(
//     (p) => p.categoryType === selectedCategory,
//   );
// }

// if (selectedPropertyType !== "all") {
//   visibleProperties = visibleProperties.filter(
//     (p) => p.propertyType === selectedPropertyType,
//   );
// }

  // const activeCount = properties.filter((p) => p.status === "active").length;
  // const inactiveCount = properties.filter(
  //   (p) => p.status === "inactive",
  // ).length;
  // const expiredCount = properties.filter((p) => p.status === "expired").length;

  const stats = [
    // {
    //   label: `Create ${title}`,
    //   icon: Plus,
    //   value: "",
    //   route: createRoute,
    //   bg: "from-blue-50 to-blue-100",
    //   textColor: "text-blue-600",
    //   clickable: true,
    // },
    ...(type === "normal"
      ? [
          {
            //label: `Create ${title}`,
            label: `Create Project`,
            icon: Plus,
            value: "",
            route: createRoute,
            bg: "from-blue-50 to-blue-100",
            textColor: "text-blue-600",
            clickable: true,
          },
        ]
      : []),
    {
      label: "Active",
      icon: Building2,
      value: activeCount,
      bg: "from-green-50 to-green-100",
      textColor: "text-green-600",
      filterVal: "active",
    },
    {
      label: "Inactive",
      icon: Building2,
      value: inactiveCount,
      bg: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      filterVal: "inactive",
    },
    {
      label: "Expired",
      icon: Clock,
      value: expiredCount,
      bg: "from-red-50 to-red-100",
      textColor: "text-red-500",
      filterVal: "expired",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── DELETE CONFIRM ────────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 className="w-5 h-5" />}
        iconClass="text-red-600"
        onConfirm={() =>
          deleteMutation.mutate(deleteTarget, {
            onSettled: () => setDeleteTarget(null),
          })
        }
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── EXPIRE CONFIRM ────────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!expireTarget}
        title="Expire Property"
        message="Mark this property as expired? It will no longer appear in active listings."
        confirmLabel={expireMutation.isPending ? "Expiring…" : "Expire"}
        confirmClass="bg-orange-600 hover:bg-orange-700 text-white"
        icon={<Clock className="w-5 h-5" />}
        iconClass="text-orange-600"
        onConfirm={() =>
          expireMutation.mutate(expireTarget, {
            onSettled: () => setExpireTarget(null),
          })
        }
        onCancel={() => setExpireTarget(null)}
      />

      {/* ── RESET CONFIRM ─────────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!resetTarget}
        title="Reset Property"
        message="Reset this property back to active status?"
        confirmLabel={resetMutation.isPending ? "Resetting…" : "Reset"}
        confirmClass="bg-[#27AE60] hover:bg-green-700 text-white"
        icon={<RefreshCw className="w-5 h-5" />}
        iconClass="text-[#27AE60]"
        onConfirm={() =>
          resetMutation.mutate(resetTarget, {
            onSettled: () => setResetTarget(null),
          })
        }
        onCancel={() => setResetTarget(null)}
      />

      {/* ── PROMOTE MODAL ─────────────────────────────────────────────────── */}
      <PromoteModal
        open={!!promoteTarget}
        currentType={type}
        isLoading={promoteMutation.isPending}
        onConfirm={(newType) =>
          promoteMutation.mutate(
            { id: promoteTarget, newType },
            { onSettled: () => setPromoteTarget(null) },
          )
        }
        onCancel={() => setPromoteTarget(null)}
      />

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${accentColor} max-sm:text-xl`}>
            {title}
          </h1>
          <p className="text-slate-600 mt-1 text-sm">{subtitle}</p>

          {selectedLocation && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <MapPin className="w-3.5 h-3.5 text-[#27AE60]" />
              <span className="text-[#27AE60] font-medium">
                {selectedLocation}
              </span>
              <span className="text-slate-500">
                ({visibleProperties.length})
              </span>
              <button
                onClick={() => setSelectedLocation(null)}
                className="ml-1 text-slate-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {statusFilter !== "all" && (
            <div className="mt-2 inline-flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 rounded-full px-3 py-1 ml-2">
              <span className="text-blue-600 font-medium capitalize">
                {statusFilter}
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-1 text-slate-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 flex flex-col text-center bg-white rounded-2xl shadow-sm border">
          <h2 className={`text-2xl font-bold ${accentColor}`}>{totalCount}</h2>
          <p className="text-slate-500 text-xs mt-0.5">Total {title}</p>
        </div>
      </div>

      {/* ── STATS GRID ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isActiveFilter = statusFilter === stat.filterVal;
          return (
            <div
              key={index}
              onClick={() => {
                if (stat.route) navigate(stat.route, { state: { type } });
                else if (stat.filterVal)
                  setStatusFilter((prev) =>
                    prev === stat.filterVal ? "all" : stat.filterVal,
                  );
              }}
              className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer border
                ${isActiveFilter ? "ring-2 ring-[#27AE60]" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <p className="text-slate-600 text-xs leading-tight">
                {stat.label}
              </p>
              {stat.value !== "" && (
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              )}
            </div>
          );
        })}

        {/* LOCATION FILTER CARD */}
        <div className="relative rounded-xl bg-white p-4 shadow-sm border col-span-1">
          <div
            className="flex flex-col gap-2 cursor-pointer"
            onClick={() => setOpenLocations(!openLocations)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#27AE60]" />
            </div>
            <div className="flex justify-between items-center  ">
              <p className="text-slate-600 text-xs">Locations</p>
              {openLocations ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <p className="text-xl font-bold text-slate-900">
              {locations.length}
            </p>
          </div>

          {openLocations && (
            <div className="absolute z-30 left-0 right-0 top-30 mt-2 w-54 bg-white border shadow-2xl rounded-2xl p-4 max-h-72  overflow-hidden">
              {/* Search */}
              <div className="flex items-center gap-2 mb-3 border border-[#27AE60] rounded-lg px-3 py-2 bg-slate-50">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search location…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="overflow-y-auto max-h-48 pr-1 space-y-1.5">
                {locations.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">
                    No locations found
                  </p>
                ) : searchTerm ? (
                  filteredLocations.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">
                      No matching locations
                    </p>
                  ) : (
                    filteredLocations.map((loc) => (
                      <LocationItem
                        key={loc.name}
                        loc={loc}
                        isActive={selectedLocation === loc.name}
                        onClick={() => handleLocationClick(loc.name)}
                      />
                    ))
                  )
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="locationsDropdown">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {locations.map((loc, index) => (
                            <Draggable
                              key={loc.name}
                              draggableId={loc.name}
                              index={index}
                            >
                              {(p2) => (
                                <div
                                  ref={p2.innerRef}
                                  {...p2.draggableProps}
                                  {...p2.dragHandleProps}
                                  className="mb-1.5"
                                >
                                  <LocationItem
                                    loc={loc}
                                    isActive={selectedLocation === loc.name}
                                    onClick={() =>
                                      handleLocationClick(loc.name)
                                    }
                                    draggable
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CATEGORY FILTERS ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col gap-5">
          {/* CATEGORY TYPES */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Category Type
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedPropertyType("all");
                }}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition
          ${
            selectedCategory === "all"
              ? "bg-[#27AE60] text-white border-[#27AE60]"
              : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"
          }`}
              >
                All
              </button>

              {CATEGORY_TYPES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setSelectedPropertyType("all");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition
            ${
              selectedCategory === cat.value
                ? "bg-[#27AE60] text-white border-[#27AE60]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"
            }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* PROPERTY TYPES */}
          {selectedCategory !== "all" && PROPERTY_TYPES[selectedCategory] && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                Property Type
              </h3>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedPropertyType("all")}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition
              ${
                selectedPropertyType === "all"
                  ? "bg-[#27AE60] text-white border-green-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-500"
              }`}
                >
                  All
                </button>

                {PROPERTY_TYPES[selectedCategory].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedPropertyType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition
                ${
                  selectedPropertyType === type.value
                    ? "bg-[#27AE60] text-white border-green-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-green-500"
                }`}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PROPERTY GRID ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${accentColor}`}>
            {title}{" "}
            <span className="text-slate-400 font-normal text-sm">
              ({visibleProperties.length})
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sorted by rank</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Failed to load properties.</p>
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No properties found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProperties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                type={type}
                onDelete={() => setDeleteTarget(p._id)}
                onPromote={() => setPromoteTarget(p._id)}
                onExpire={() => setExpireTarget(p._id)}
                onReset={() => setResetTarget(p._id)}
              />
            ))}
          </div>
        )}
      </div>
      <div ref={loadMoreRef} className="h-20 flex justify-center items-center">
        {isFetchingNextPage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" />
            <p className="text-xs text-slate-500">Loading more projects...</p>
          </div>
        )}

        {!hasNextPage && properties.length > 0 && (
          <p className="text-sm text-slate-400">All projects loaded</p>
        )}
      </div>
    </div>
  );
}

// ── Location item sub-component ──────────────────────────────────────────────
function LocationItem({ loc, isActive, onClick, draggable }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left text-xs py-2 px-3 rounded-lg border transition
        ${
          isActive
            ? "bg-green-50 border-[#27AE60] text-[#27AE60]"
            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
        }
        ${draggable ? "cursor-move" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {draggable && (
          <span className="text-[#27AE60] flex-shrink-0 text-xs">☰</span>
        )}
        <span className="truncate">{loc.name}</span>
      </div>
      <span className="text-xs bg-[#27AE60] text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
        {loc.count}
      </span>
    </button>
  );
}
