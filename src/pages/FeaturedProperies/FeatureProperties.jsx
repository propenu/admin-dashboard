// // frontend/admin-dashboard/src/pages/FeatureProperties.jsx
// import { useState, useEffect } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   MapPin,
//   Building2,
//   Plus,
//   Trash2,
//   Search,

// } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   fetchFeaturedProperties,
//   deleteFeaturedProperty,
// } from "../../services/propertyservice";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import PropertyCard from "./FeaturedPropertyCard";
// import { useNavigate } from "react-router-dom";
// // Drag & Drop
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


// export default function FeaturedProperties() {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   // UI STATES -------------------------
//   const [openLocations, setOpenLocations] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   // DELETE STATES ---------------------
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   // FETCH DATA ------------------------
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["featuredProperties"],
//     queryFn: fetchFeaturedProperties,
//   });

//   const properties = data?.items || [];

//   // FILTER LOCATIONS -----------------
//   const filteredLocations = locations.filter((loc) =>
//     loc.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const handleLocationClick = (locationName) => {
//     if (selectedLocation === locationName) {
//       setSelectedLocation(null);
//     } else {
//       setSelectedLocation(locationName
//       );
//     }
//   };
//   // DRAG & DROP HANDLER --------------



//   const handleDragEnd = (result) => {
//     if (!result.destination) return;

//     const items = Array.from(locations);
//     const [moved] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, moved);

//     setLocations(items);
//   };


//   // BUILD LOCATIONS WITH COUNTS --------
//   useEffect(() => {
//     if (!properties.length) {
//       setLocations([]);
//       setSelectedLocation(null);
//       return;
//     }

//     const cityMap = new Map();
//     properties.forEach((p) => {
//       const city = p.city?.trim();
//       if (!city) return;
//       cityMap.set(city, (cityMap.get(city) || 0) + 1);
//     });

//     const locs = Array.from(cityMap.entries()).map(([name, count]) => ({
//       name,
//       count,
//     }));

//     setLocations(locs);
//   }, [properties]);

//   // FILTERED DATA ---------------------
//   const visibleProperties = selectedLocation
//     ? properties.filter((p) => p.city?.trim() === selectedLocation)
//     : properties;

//   // DELETE MUTATION -------------------
//   const deleteMutation = useMutation({
//     mutationFn: () => deleteFeaturedProperty(deleteId),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["featuredProperties"]);
//       setShowDeletePopup(false);
//       setDeleteId(null);
//     },
//   });

//   const confirmDelete = () => {
//     if (!deleteId) return;
//     deleteMutation.mutate();
//   };

//   // STATS -----------------------------
//   const stats = [
//     {
//       label: "Create Featured Property",
//       icon: Plus,
//       value: "",
//       route: "/create-featured-project",
//       bg: "from-blue-50 to-blue-100",
//       textColor: "text-blue-600",
//     },
//     {
//       label: "Active Featured Properties",
//       icon: Building2,
//       value: properties.length,
//       bg: "from-green-50 to-green-100",
//       textColor: "text-green-600",
//     },
//     {
//       label: "Inactive Featured Properties",
//       icon: Building2,
//       value: properties.filter((p) => p.status === "inactive").length || 0,
//       bg: "from-purple-50 to-purple-100",
//       textColor: "text-purple-600",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* DELETE POPUP */}
//       {showDeletePopup && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-xl">
//             <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
//               <Trash2 className="w-5 h-5" /> Delete Property
//             </h2>

//             <p className="text-slate-700 mt-2">
//               Are you sure you want to delete this featured property? This
//               action cannot be undone.
//             </p>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={() => setShowDeletePopup(false)}
//                 className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//               >
//                 {deleteMutation.isLoading ? "Deleting..." : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-[#27AE60]  max-sm:text-xl text-center">
//             Prime Projects Overview
//           </h1>
//           <p className="text-slate-600  mt-1 max-sm:text-center">
//             Explore premium featured listings.
//           </p>

//           {selectedLocation && (
//             <p className="mt-1 text-sm text-sky-700 max-sm:text-center">
//               Filtered by{" "}
//               <span className="font-semibold  text-[#27AE60] ">
//                 {selectedLocation}
//               </span>{" "}
//               ({visibleProperties.length} properties)
//             </p>
//           )}
//         </div>

//         <div className="p-6 flex flex-col text-center">
//           <h2 className="text-xl text-[#27AE60] font-bold">
//             {properties.length}
//           </h2>
//           <p className="text-slate-500 text-sm">Total Residential Properties</p>
//         </div>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={index}
//               onClick={() =>
//                 stat.route &&
//                 navigate(stat.route, {
//                   state: { type: "featured" },
//                 })
//               }
//               className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer border max-sm:text-center"
//             >
//               <div className="flex items-center justify-between mb-4 max-sm:justify-center">
//                 <div
//                   className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}
//                 >
//                   <Icon className={`w-6 h-6 ${stat.textColor}`} />
//                 </div>
//               </div>
//               <p className="text-slate-600 text-sm">{stat.label}</p>
//               {stat.value !== "" && (
//                 <p className="text-2xl font-bold text-slate-900 mt-2">
//                   {stat.value}
//                 </p>
//               )}
//             </div>
//           );
//         })}

//         {/* LOCATION FILTER CARD */}
//         <div className="relative rounded-xl bg-white p-4 md:p-6 shadow-md border max-sm:col-span-1">
//           {/* Header */}
//           <div
//             className="flex flex-col w-full  p-2 gap-3 cursor-pointer"
//             onClick={() => setOpenLocations(!openLocations)}
//           >
//             <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
//               <MapPin className="w-6 h-6 text-[#27AE60]" />
//             </div>
//             <div className="flex justify-between items-center">
//               <p className="text-[#000000] text-sm md:text-base  max-sm:text-xl ">
//                 Locations
//               </p>
//               {openLocations ? (
//                 <ChevronUp className="w-5 h-5 text-[#000000] " />
//               ) : (
//                 <ChevronDown className="w-5 h-5 text-[#000000]" />
//               )}
//             </div>
//           </div>

//           {/* Popup */}
//           {openLocations && (
//             <div className="absolute z-50 left-0 right-0  mt-2 w-11/12 md:w-full mx-auto md:mx-0 bg-white border shadow-xl rounded-xl p-4 max-h-72 overflow-hidden dropdown-animate">
//               {/* Search bar */}
//               <div className="flex items-center gap-2 mb-3 border border-[#27AE60] rounded-lg px-3 py-2 bg-slate-50">
//                 <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                 <input
//                   type="text"
//                   placeholder="Search location..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full bg-transparent text-xs md:text-sm outline-none text-slate-700 placeholder:text-slate-400"
//                 />
//               </div>

//               <div className="overflow-y-auto max-h-48 pr-1">
//                 {locations.length === 0 ? (
//                   <p className="text-slate-500 text-xs md:text-sm text-center">
//                     No locations found
//                   </p>
//                 ) : searchTerm ? (
//                   filteredLocations.length === 0 ? (
//                     <p className="text-slate-500 text-xs md:text-sm text-center">
//                       No matching locations
//                     </p>
//                   ) : (
//                     <div className="space-y-2">
//                       {filteredLocations.map((loc) => {
//                         const isActive = selectedLocation === loc.name;
//                         return (
//                           <button
//                             key={loc.name}
//                             onClick={() => handleLocationClick(loc.name)}
//                             className={`w-full flex items-center gap-2 justify-between text-left text-xs md:text-sm py-2 px-3 rounded-lg border transition 
//                     ${
//                       isActive
//                         ? "bg-green-900 border-[#27AE60] text-green-300"
//                         : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
//                     }
//                   `}
//                           >
//                             <div className="flex items-center gap-2 flex-1 min-w-0">
//                               <span className="text-xs text-[#27AE60] flex-shrink-0">
//                                 ☰
//                               </span>
//                               <span className="truncate text-[#27AE60] ">
//                                 {loc.name}
//                               </span>
//                             </div>
//                             <span className="text-xs bg-[#27AE60] text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
//                               {loc.count}
//                             </span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )
//                 ) : (
//                   <DragDropContext onDragEnd={handleDragEnd}>
//                     <Droppable droppableId="locationsPopup">
//                       {(provided) => (
//                         <div
//                           {...provided.droppableProps}
//                           ref={provided.innerRef}
//                           className="space-y-2"
//                         >
//                           {locations.map((loc, index) => {
//                             const isActive = selectedLocation === loc.name;
//                             return (
//                               <Draggable
//                                 key={loc.name}
//                                 draggableId={loc.name}
//                                 index={index}
//                               >
//                                 {(provided2) => (
//                                   <div
//                                     ref={provided2.innerRef}
//                                     {...provided2.draggableProps}
//                                     {...provided2.dragHandleProps}
//                                     onClick={() =>
//                                       handleLocationClick(loc.name)
//                                     }
//                                     className={`flex items-center justify-between text-xs md:text-sm py-2 px-3 rounded-lg border cursor-move transition 
//                       ${
//                         isActive
//                           ? "bg-green-100 border-[#27AE60] text-[#27AE60]"
//                           : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
//                       }
//                     `}
//                                   >
//                                     <div className="flex items-center gap-2 flex-1 min-w-0">
//                                       <span className="text-xs text-[#27AE60] flex-shrink-0">
//                                         ☰
//                                       </span>
//                                       <span className="truncate ">
//                                         {loc.name}
//                                       </span>
//                                     </div>
//                                     <span className="text-xs bg-[#27AE60] text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
//                                       {loc.count}
//                                     </span>
//                                   </div>
//                                 )}
//                               </Draggable>
//                             );
//                           })}
//                           {provided.placeholder}
//                         </div>
//                       )}
//                     </Droppable>
//                   </DragDropContext>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* PROPERTY GRID */}
//       <div className="mt-6">
//         <h2 className="text-xl font-bold text-slate-900 mb-4">
//           Featured Properties
//         </h2>

//         {isLoading ? (
//           <div className="flex justify-center py-10">
//             <LoadingSpinner size="lg" />
//           </div>
//         ) : isError ? (
//           <div className="text-center py-12 text-red-500">
//             Failed to load featured properties.
//           </div>
//         ) : visibleProperties.length === 0 ? (
//           <div className="text-center py-12 text-slate-600">
//             No properties found.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {visibleProperties.map((p) => (
//               <div key={p._id} className="relative group">
//                 <PropertyCard property={p} />
//                 <button
//                   onClick={() => {
//                     setDeleteId(p._id);
//                     setShowDeletePopup(true);
//                   }}
//                   className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// frontend/admin-dashboard/src/pages/FeatureProperties.jsx
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeaturedProperties,
  deleteFeaturedProperty,
} from "../../services/PropertyService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PropertyCard from "./FeaturedPropertyCard";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function FeaturedProperties() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI STATES -------------------------
  const [openLocations, setOpenLocations] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // DELETE STATES ---------------------
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // FETCH DATA ------------------------
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featuredProperties"],
    queryFn: fetchFeaturedProperties,
  });

  const properties = data?.items || [];

  // ── Sort properties by rank (nulls go to end) ──────────────────────────
  const sortedProperties = [...properties].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  // FILTER LOCATIONS -----------------
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationClick = (locationName) => {
    setSelectedLocation((prev) => (prev === locationName ? null : locationName));
  };

  // DRAG & DROP HANDLER (location list only) --------------------------------
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(locations);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocations(items);
  };

  // BUILD LOCATIONS WITH COUNTS --------
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

    const locs = Array.from(cityMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    setLocations(locs);
  }, [properties]);

  // FILTERED + SORTED DATA ---------------------
  const visibleProperties = selectedLocation
    ? sortedProperties.filter((p) => p.city?.trim() === selectedLocation)
    : sortedProperties;

  // DELETE MUTATION -------------------
  const deleteMutation = useMutation({
    mutationFn: () => deleteFeaturedProperty(deleteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["featuredProperties"]);
      setShowDeletePopup(false);
      setDeleteId(null);
    },
  });

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate();
  };

  // Called by PropertyCard after a rank PATCH succeeds
  const handleRankUpdated = () => {
    queryClient.invalidateQueries(["featuredProperties"]);
  };

  // STATS -----------------------------
  const stats = [
    {
      label: "Create Featured Property",
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
      value: properties.filter((p) => p.status === "inactive").length || 0,
      bg: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* DELETE POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Property
            </h2>
            <p className="text-slate-700 mt-2">
              Are you sure you want to delete this featured property? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
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
          <h1 className="text-3xl font-bold text-[#27AE60] max-sm:text-xl text-center">
            Prime Projects Overview
          </h1>
          <p className="text-slate-600 mt-1 max-sm:text-center">
            Explore premium featured listings.
          </p>

          {selectedLocation && (
            <p className="mt-1 text-sm text-sky-700 max-sm:text-center">
              Filtered by{" "}
              <span className="font-semibold text-[#27AE60]">
                {selectedLocation}
              </span>{" "}
              ({visibleProperties.length} properties)
            </p>
          )}
        </div>

        <div className="p-6 flex flex-col text-center">
          <h2 className="text-xl text-[#27AE60] font-bold">
            {properties.length}
          </h2>
          <p className="text-slate-500 text-sm">Total Residential Properties</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() =>
                stat.route &&
                navigate(stat.route, { state: { type: "featured" } })
              }
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer border max-sm:text-center"
            >
              <div className="flex items-center justify-between mb-4 max-sm:justify-center">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              {stat.value !== "" && (
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stat.value}
                </p>
              )}
            </div>
          );
        })}

        {/* LOCATION FILTER CARD */}
        <div className="relative rounded-xl bg-white p-4 md:p-6 shadow-md border max-sm:col-span-1">
          <div
            className="flex flex-col w-full p-2 gap-3 cursor-pointer"
            onClick={() => setOpenLocations(!openLocations)}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
              <MapPin className="w-6 h-6 text-[#27AE60]" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[#000000] text-sm md:text-base max-sm:text-xl">
                Locations
              </p>
              {openLocations ? (
                <ChevronUp className="w-5 h-5 text-[#000000]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#000000]" />
              )}
            </div>
          </div>

          {openLocations && (
            <div className="absolute z-50 left-0 right-0 mt-2 w-11/12 md:w-full mx-auto md:mx-0 bg-white border shadow-xl rounded-xl p-4 max-h-72 overflow-hidden dropdown-animate">
              <div className="flex items-center gap-2 mb-3 border border-[#27AE60] rounded-lg px-3 py-2 bg-slate-50">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs md:text-sm outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="overflow-y-auto max-h-48 pr-1">
                {locations.length === 0 ? (
                  <p className="text-slate-500 text-xs md:text-sm text-center">
                    No locations found
                  </p>
                ) : searchTerm ? (
                  filteredLocations.length === 0 ? (
                    <p className="text-slate-500 text-xs md:text-sm text-center">
                      No matching locations
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredLocations.map((loc) => {
                        const isActive = selectedLocation === loc.name;
                        return (
                          <button
                            key={loc.name}
                            onClick={() => handleLocationClick(loc.name)}
                            className={`w-full flex items-center gap-2 justify-between text-left text-xs md:text-sm py-2 px-3 rounded-lg border transition 
                              ${isActive
                                ? "bg-green-900 border-[#27AE60] text-green-300"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs text-[#27AE60] flex-shrink-0">☰</span>
                              <span className="truncate text-[#27AE60]">{loc.name}</span>
                            </div>
                            <span className="text-xs bg-[#27AE60] text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                              {loc.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="locationsPopup">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {locations.map((loc, index) => {
                            const isActive = selectedLocation === loc.name;
                            return (
                              <Draggable
                                key={loc.name}
                                draggableId={loc.name}
                                index={index}
                              >
                                {(provided2) => (
                                  <div
                                    ref={provided2.innerRef}
                                    {...provided2.draggableProps}
                                    {...provided2.dragHandleProps}
                                    onClick={() => handleLocationClick(loc.name)}
                                    className={`flex items-center justify-between text-xs md:text-sm py-2 px-3 rounded-lg border cursor-move transition 
                                      ${isActive
                                        ? "bg-green-100 border-[#27AE60] text-[#27AE60]"
                                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="text-xs text-[#27AE60] flex-shrink-0">☰</span>
                                      <span className="truncate">{loc.name}</span>
                                    </div>
                                    <span className="text-xs bg-[#27AE60] text-white px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
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
            </div>
          )}
        </div>
      </div>

      {/* PROPERTY GRID */}
      <div className="mt-6">
        {/* Section header with rank legend */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Featured Properties</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sorted by rank · Click rank badge on card to edit</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load featured properties.
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            No properties found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProperties.map((p) => (
              <div key={p._id} className="relative group">
                <PropertyCard
                  property={p}
                  onRankUpdated={handleRankUpdated}   
                />
                <button
                  onClick={() => {
                    setDeleteId(p._id);
                    setShowDeletePopup(true);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}