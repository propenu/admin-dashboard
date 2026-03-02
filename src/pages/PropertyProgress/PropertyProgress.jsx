
// frontend/admin-dashboard/src/pages/PropertyProgress/PropertyProgress.jsx
import React, { useEffect, useState } from "react";
import GridView from "./components/GridView";
import TableView from "./components/TableView";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutGrid,
  MoreVertical,
  Eye,
  MapPin,
  Search,
  List,
  X,
} from "lucide-react";
import {
  fetchResidentialPropertyProgressThunk,
  fetchCommercialPropertyProgressThunk,
  fetchAgriculturalPropertyProgressThunk,
  fetchLandPropertyProgressThunk,
} from "../../store/PropertyProgress/propertyProgressThunck";

const PropertyProgressDashboard = () => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("residential");
  const [viewMode, setViewMode] = useState("table");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [completionFilter, setCompletionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { residential, commercial, agricultural, land } = useSelector(
    (state) => state.propertyProgress,
  );

  const currentData = {
    residential,
    commercial,
    agricultural,
    land,
  }[activeCategory];

  useEffect(() => {
    if (activeCategory === "residential")
      dispatch(fetchResidentialPropertyProgressThunk());
    if (activeCategory === "commercial")
      dispatch(fetchCommercialPropertyProgressThunk());
    if (activeCategory === "agricultural")
      dispatch(fetchAgriculturalPropertyProgressThunk());
    if (activeCategory === "land") dispatch(fetchLandPropertyProgressThunk());
  }, [dispatch, activeCategory]);

  // Filter and sort logic
  const getFilteredAndSortedItems = () => {
    let items = currentData.items?.items || [];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.locality?.toLowerCase().includes(query) ||
          item.city?.toLowerCase().includes(query) ||
          item.createdBy?.name?.toLowerCase().includes(query) ||
          item.slug?.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      items = items.filter(
        (item) => item.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Completion filter
    if (completionFilter !== "all") {
      items = items.filter((item) => {
        const percent = item.completion?.percent || 0;
        switch (completionFilter) {
          case "0-25":
            return percent >= 0 && percent <= 25;
          case "26-50":
            return percent >= 26 && percent <= 50;
          case "51-75":
            return percent >= 51 && percent <= 75;
          case "76-100":
            return percent >= 76 && percent <= 100;
          default:
            return true;
        }
      });
    }

    // Sorting
    items = [...items].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "mostViewed":
          return (b.meta?.views || 0) - (a.meta?.views || 0);
        case "completion":
          return (b.completion?.percent || 0) - (a.completion?.percent || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return items;
  };

  const filteredItems = getFilteredAndSortedItems();
  const totalItems = currentData.items?.meta?.total || 0;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCompletionFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    statusFilter !== "all" ||
    completionFilter !== "all" ||
    sortBy !== "newest";

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#27AE60] mb-1">
            All Properties
          </h1>
          <p className="text-sm text-[#000000] ">
            Manage and track your property listings
          </p>
        </div>
        <div className="flex bg-white border-2 border-gray-100 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "grid"
                ? "bg-[#27AE60] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid size={16} className={`mr-2 ${viewMode === "grid" ? "text-white" : "text-[#27AE60]"}`} /> Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "table"
                ? "bg-[#27AE60] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List size={16} className={`mr-2 ${viewMode === "table" ? "text-white" : "text-[#27AE60]"}`} /> Table
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title, location, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60] focus:bg-white text-sm transition-all"
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                size={16}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60] cursor-pointer transition-all"
          >
            <option value="residential">🏠 Residential</option>
            <option value="commercial">🏢 Commercial</option>
            <option value="agricultural">🌾 Agricultural</option>
            <option value="land">🏞️ Land</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60] cursor-pointer transition-all"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60] cursor-pointer transition-all"
          >
            <option value="all">All Completion</option>
            <option value="0-25">0-25%</option>
            <option value="26-50">26-50%</option>
            <option value="51-75">51-75%</option>
            <option value="76-100">76-100%</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-[#27AE60]/20 focus:border-[#27AE60] cursor-pointer transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="completion">Completion %</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
          <LayoutGrid size={16} className="text-[#27AE60]" />
          <span>
            Showing{" "}
            <span className="font-bold text-gray-800">
              {filteredItems.length}
            </span>{" "}
            of <span className="font-bold text-gray-800">{totalItems}</span>{" "}
            properties
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-all text-sm font-medium"
          >
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {searchQuery && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#27AE60]/10 text-[#27AE60] rounded-lg text-sm font-medium border border-[#27AE60]/20">
              Search: "{searchQuery}"
              <X
                size={14}
                className="cursor-pointer hover:text-[#27AE60]/70"
                onClick={() => setSearchQuery("")}
              />
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-200">
              Status: {statusFilter}
              <X
                size={14}
                className="cursor-pointer hover:text-blue-600/70"
                onClick={() => setStatusFilter("all")}
              />
            </span>
          )}
          {completionFilter !== "all" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium border border-purple-200">
              Completion: {completionFilter}%
              <X
                size={14}
                className="cursor-pointer hover:text-purple-600/70"
                onClick={() => setCompletionFilter("all")}
              />
            </span>
          )}
          {sortBy !== "newest" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium border border-orange-200">
              Sort:{" "}
              {sortBy === "mostViewed"
                ? "Most Viewed"
                : sortBy === "oldest"
                  ? "Oldest First"
                  : sortBy === "completion"
                    ? "Completion %"
                    : "Title A-Z"}
              <X
                size={14}
                className="cursor-pointer hover:text-orange-600/70"
                onClick={() => setSortBy("newest")}
              />
            </span>
          )}
        </div>
      )}

      {/* Content Area */}
      {currentData.loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#27AE60] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading properties...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-[#27AE60] text-white rounded-lg hover:bg-[#229954] transition-all font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <GridView items={filteredItems} />
      ) : (
        <TableView items={filteredItems} />
      )}
    </div>
  );
};



export default PropertyProgressDashboard;