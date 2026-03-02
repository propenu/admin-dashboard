// frontend\admin-dashboard\src\pages\HighlightProjects\HighlightProjects.jsx
import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Plus,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHighlightProjects,
  deleteFeaturedProperty,
} from "../../services/propertyservice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import HighlightProjectsCard from "./HighlightProjectsCard";
import { useNavigate } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function HighlightProjects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ---------------- UI STATE ---------------- */
  const [openLocations, setOpenLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOrder, setLocationOrder] = useState([]);

  /* ---------------- DELETE STATE ---------------- */
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ---------------- FETCH DATA ---------------- */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["highlightProjects"],
    queryFn: fetchHighlightProjects,
  });

  const properties = data?.items ?? [];

  /* ---------------- LOCATIONS (DERIVED) ---------------- */
  const locations = useMemo(() => {
    if (!properties.length) return [];

    const cityMap = new Map();

    properties.forEach((p) => {
      const city = p.city?.trim();
      if (!city) return;
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });

    let result = Array.from(cityMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    if (locationOrder.length) {
      result.sort(
        (a, b) => locationOrder.indexOf(a.name) - locationOrder.indexOf(b.name)
      );
    }

    return result;
  }, [properties, locationOrder]);

  /* ---------------- FILTERED DATA ---------------- */
  const visibleProperties = useMemo(() => {
    if (!selectedLocation) return properties;
    return properties.filter((p) => p.city?.trim() === selectedLocation);
  }, [properties, selectedLocation]);

  /* ---------------- DRAG HANDLER ---------------- */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(locations);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setLocationOrder(reordered.map((l) => l.name));
  };

  /* ---------------- DELETE MUTATION ---------------- */
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeaturedProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["highlightProjects"]);
      setShowDeletePopup(false);
      setDeleteId(null);
    },
  });

  /* ---------------- STATS ---------------- */
  const stats = [
    {
          label: "Create Hightlight Property",
          icon: Plus,
          value: "",
          route: "/create-featured-project",
          bg: "from-blue-50 to-blue-100",
          textColor: "text-blue-600",
    },
    {
      label: "Active Featured Properties",
      icon: Building2,
      value: properties.length,
      bg: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Inactive Featured Properties",
      icon: Building2,
      value: properties.filter((p) => p.status === "inactive").length,
      bg: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
  ];

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".location-dropdown")) {
        setOpenLocations(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* DELETE POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Property
            </h2>

            <p className="text-slate-700 mt-2">
              Are you sure you want to delete this highlighted property?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#27AE60]">
            Highlighted Projects Overview
          </h1>
          <p className="text-slate-600 mt-1">
            Explore premium highlighted listings.
          </p>

          {selectedLocation && (
            <p className="mt-1 text-sm text-orange-700">
              Filtered by <strong>{selectedLocation}</strong> (
              {visibleProperties.length} properties)
            </p>
          )}
        </div>

        <div className="p-6 flex flex-col text-center">
          <h2 className="text-xl text-green-800 font-bold">
            {properties.length}
          </h2>
          <p className="text-slate-500 text-sm">Total highlighted properties</p>
        </div>
      </div>

      {/* STATS  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() =>
                stat.route &&
                navigate(stat.route, {
                  state: { type: "highlight" }, 
                })
              }
              className="bg-white rounded-xl p-6 shadow-md border"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stat.value}
              </p>
            </div>
          );
        })}

        {/* LOCATION FILTER CARD */}
        <div className="relative bg-white rounded-xl p-6 shadow-md border location-dropdown">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setOpenLocations((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-slate-700 font-medium text-lg">Locations</p>
            </div>
            {openLocations ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>

          {openLocations && (
            <div className="absolute z-50 left-0 mt-3 w-full bg-white border shadow-xl rounded-xl p-3 max-h-64 overflow-hidden">
              {locations.length === 0 ? (
                <p className="text-slate-500 text-sm">No locations found</p>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="featuredLocations">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 max-h-52 overflow-y-auto pr-1"
                      >
                        {locations.map((loc, index) => {
                          const active = selectedLocation === loc.name;

                          return (
                            <Draggable
                              key={loc.name}
                              draggableId={loc.name}
                              index={index}
                            >
                              {(p) => (
                                <div
                                  ref={p.innerRef}
                                  {...p.draggableProps}
                                  {...p.dragHandleProps}
                                  onClick={() =>
                                    setSelectedLocation(
                                      active ? null : loc.name
                                    )
                                  }
                                  className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg border cursor-move transition
                                  ${
                                    active
                                      ? "bg-orange-100 border-orange-300 text-orange-700"
                                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                      ☰
                                    </span>
                                    {loc.name}
                                  </div>

                                  <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                                    {loc.count}
                                  </span>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PROPERTY GRID */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : isError ? (
        <p className="text-red-500">Failed to load data</p>
      ) : visibleProperties.length === 0 ? (
        <p className="text-slate-500">No properties found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProperties.map((p) => (
            <div key={p._id} className="relative group">
              <HighlightProjectsCard property={p} />
              
              <button
                onClick={() => {
                  setDeleteId(p._id);
                  setShowDeletePopup(true);
                }}
                className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
