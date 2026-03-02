//frontend\admin-dashboard\src\pages\Commercial\Commercial.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setActiveCategory } from "../../store/Ui/uiSlice";

import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Plus,
  Search,
  Trash2,
  FileCheck,
  Clock,
  AlertCircle,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchResidential,
  deleteResidential,
} from "../../services/ResidentialServices/ResidentialServices";
import ResidentialCard from "./ResidentialCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Commercial() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const observerTarget = useRef(null);

  const [openLocations, setOpenLocations] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("verified");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["residential"],
    queryFn: ({ pageParam = 1 }) =>
      fetchResidential({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta;
      const totalPages = Math.ceil(total / limit);
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const properties = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data?.pages],
  );

  const allProperties = data?.pages[0]?.meta || { total: 0 };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const getVerificationStatus = (property) => {
    const docs = property.verificationDocuments || [];
    if (docs.length === 0) return "none";
    if (docs.some((doc) => doc.status === "rejected")) return "rejected";
    if (docs.some((doc) => doc.status === "pending")) return "pending";
    if (docs.every((doc) => doc.status === "verified")) return "verified";
    return "none";
  };

  useEffect(() => {
    if (!properties || properties.length === 0) {
      setLocations([]);
      return;
    }

    const cityMap = new Map();
    properties.forEach((p) => {
      const city = p.city?.trim();
      if (!city) return;
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });

    
    const locs = [
      {
        id: "all-locations",
        name: "All Locations",
        count: allProperties.total,
        isStatic: true,
      },
      ...Array.from(cityMap.entries()).map(([name, count]) => ({
        id: `loc-${name}`,
        name,
        count,
      })),
    ];

    setLocations((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(locs)) return prev;
      return locs;
    });
  }, [properties, allProperties.total]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLocations(items);
  };

  const { verifiedCount, pendingCount, draftCount } = useMemo(() => {
    let verified = 0,
      pending = 0,
      draft = 0;
    properties.forEach((p) => {
      const s = getVerificationStatus(p);
      if (s === "verified") verified++;
      else if (s === "pending") pending++;
      else draft++;
    });
    return {
      verifiedCount: verified,
      pendingCount: pending,
      draftCount: draft,
    };
  }, [properties]);

  const visibleProperties = useMemo(() => {
    return properties.filter((p) => {
      const status = getVerificationStatus(p);
      let matchesTab = false;
      if (activeTab === "verified") matchesTab = status === "verified";
      else if (activeTab === "pending") matchesTab = status === "pending";
      else matchesTab = status === "none" || status === "rejected";

      const matchesLocation = selectedLocation
        ? p.city?.trim() === selectedLocation
        : true;
      return matchesTab && matchesLocation;
    });
  }, [properties, activeTab, selectedLocation]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteResidential(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["residential"]);
      setShowDeletePopup(false);
      setDeleteId(null);
    },
  });

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLocationClick = (loc) => {
    if (loc.id === "all-locations") {
      setSelectedLocation(null);
    } else {
      setSelectedLocation((prev) => (prev === loc.name ? null : loc.name));
    }
  };

  const stats = [
    {
      label: "Create Residential Property",
      icon: Plus,
      value: "",
      route: "/post-property",
      bg: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Active Residential",
      icon: Building2,
      value: properties.filter((p) => p.status === "active").length || 0,
      bg: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Inactive Residential",
      icon: Building2,
      value: properties.filter((p) => p.status === "inactive").length || 0,
      bg: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm md:max-w-md p-4 md:p-6 rounded-xl shadow-xl animate-fade-in">
            <h2 className="text-lg md:text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Property
            </h2>
            <p className="text-sm md:text-base text-slate-700 mt-3 md:mt-2 leading-relaxed">
              Are you sure you want to delete this residential property? This
              action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 mt-6">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#27AE60] max-sm:text-xl text-center">
            Residential Properties
          </h1>
          <p className="text-slate-600 mt-1 max-sm:text-center">
            Explore residential property listings.
          </p>
        </div>
        <div className="p-6 flex flex-col text-center">
          <h2 className="text-xl text-[#27AE60] font-bold">
            {allProperties.total}
          </h2>
          <p className="text-slate-500 text-sm">Total Properties</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border cursor-pointer max-sm:text-center"
            onClick={() => {
              // localStorage.removeItem("propertyId");
              dispatch(setActiveCategory("residential"));
              navigate(stat.route);
            }}
          >
            <div className="flex items-center justify-between mb-4 max-sm:justify-center">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <p className="text-[#000000] text-sm max-sm:text-xl">
              {stat.label}
            </p>
            {stat.value !== "" && (
              <p className="text-2xl font-bold text-[#27AE60] mt-2">
                {stat.value}
              </p>
            )}
          </div>
        ))}

        <div className="bg-white relative rounded-xl p-4 md:p-6 shadow-md border">
          <div
            className="flex flex-col w-full gap-3 cursor-pointer"
            onClick={() => setOpenLocations(!openLocations)}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
              <MapPin className="w-6 h-6 text-[#27AE60]" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#000000] text-sm md:text-base max-sm:text-xl">
                {selectedLocation || "Cities "}
              </p>
              {openLocations ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {openLocations && (
            <div className="absolute z-50 left-0 right-0 mt-2 w-72 bg-white border shadow-xl rounded-xl p-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-3 border border-[#27AE60] rounded-lg px-3 py-2 bg-slate-50">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="outline-none text-sm w-full bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="locations-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="overflow-y-auto max-h-48 pr-1"
                    >
                      {filteredLocations.map((loc, index) => (
                        <Draggable
                          key={loc.id}
                          draggableId={loc.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-2 mb-1 rounded-lg flex items-center justify-between cursor-pointer border transition-colors ${
                                snapshot.isDragging
                                  ? "bg-blue-50 border-blue-200"
                                  : selectedLocation === loc.name ||
                                      (loc.id === "all-locations" &&
                                        !selectedLocation)
                                    ? "bg-green-100 border-green-200 text-[#27AE60]"
                                    : "hover:bg-gray-50 border-transparent"
                              }`}
                              onClick={() => handleLocationClick(loc)}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-slate-400"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">
                                  {loc.name}
                                </span>
                              </div>
                              <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {loc.count}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div
        className="
  flex items-center gap-3 sm:gap-6
  border-b border-slate-200
  overflow-x-auto
  whitespace-nowrap
  scrollbar-hide
  px-1
"
      >
        {/* VERIFIED */}
        <button
          onClick={() => setActiveTab("verified")}
          className={`relative flex items-center gap-2 px-2 pb-3
      text-xs sm:text-sm font-medium transition-colors
      ${activeTab === "verified" ? "text-green-600" : "text-slate-500 hover:text-slate-700"}
    `}
        >
          <FileCheck className="w-4 h-4 shrink-0" />
          <span>Verified</span>
          <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
            {verifiedCount}
          </span>

          {activeTab === "verified" && (
            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-600 rounded-full" />
          )}
        </button>

        {/* PENDING */}
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative flex items-center gap-2 px-2 pb-3
      text-xs sm:text-sm font-medium transition-colors
      ${activeTab === "pending" ? "text-amber-600" : "text-slate-500 hover:text-slate-700"}
    `}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Pending</span>
          <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
            {pendingCount}
          </span>

          {activeTab === "pending" && (
            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-amber-600 rounded-full" />
          )}
        </button>

        {/* DRAFTS */}
        <button
          onClick={() => setActiveTab("drafts")}
          className={`relative flex items-center gap-2 px-2 pb-3
      text-xs sm:text-sm font-medium transition-colors
      ${activeTab === "drafts" ? "text-slate-700" : "text-slate-500 hover:text-slate-700"}
    `}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Drafts</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
            {draftCount}
          </span>

          {activeTab === "drafts" && (
            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-slate-600 rounded-full" />
          )}
        </button>
      </div>

      {/* LIST */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab.toUpperCase()}
          </h2>
          <p className="text-sm text-slate-500">
            Showing {visibleProperties.length} properties
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed rounded-2xl py-20 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No properties found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {visibleProperties.map((p) => (
              <div key={p._id} className="relative group">
                <ResidentialCard activeTab={activeTab} property={p} />
                <button
                  onClick={() => {
                    setDeleteId(p._id);
                    setShowDeletePopup(true);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          ref={observerTarget}
          className="h-10 flex justify-center items-center mt-4"
        >
          {isFetchingNextPage && <LoadingSpinner size="md" />}
          {!hasNextPage && visibleProperties.length > 0 && (
            <p className="text-slate-400 text-sm">No more properties</p>
          )}
        </div>
      </div>
    </div>
  );
}
