
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
import { saSurface } from "../Dashboards/superAdminDashboard/dashboardSurface";

const ppControl =
  "h-10 rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-3.5 text-sm font-medium text-[#0f3d2e] outline-none transition focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-[#27AE60]/15";
const ppPill =
  "inline-flex items-center gap-1.5 rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-3 py-1.5 text-xs font-semibold text-[#0f3d2e]";
const ppTag =
  "inline-flex items-center gap-1.5 rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-3 py-1.5 text-xs font-semibold text-[#27AE60]";

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
    <div className="min-h-full bg-[#f7fbf8] p-4 font-sans text-[#0f3d2e] sm:p-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#0f3d2e]">
            All Properties
          </h1>
          <p className="text-sm text-[#5c7d6d]">
            Manage and track your property listings
          </p>
        </div>
        <div className={`inline-flex items-center gap-0.5 rounded-full p-1 ${saSurface}`}>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              viewMode === "grid"
                ? "bg-[#27AE60] text-white shadow-[0_6px_14px_-6px_rgba(39,174,96,0.7)]"
                : "text-[#5c7d6d] hover:bg-[#f7fbf8] hover:text-[#0f3d2e]"
            }`}
          >
            <LayoutGrid size={16} className={`mr-2 ${viewMode === "grid" ? "text-white" : "text-[#27AE60]"}`} /> Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              viewMode === "table"
                ? "bg-[#27AE60] text-white shadow-[0_6px_14px_-6px_rgba(39,174,96,0.7)]"
                : "text-[#5c7d6d] hover:bg-[#f7fbf8] hover:text-[#0f3d2e]"
            }`}
          >
            <List size={16} className={`mr-2 ${viewMode === "table" ? "text-white" : "text-[#27AE60]"}`} /> Table
          </button>
        </div>
      </div>

      <div className={`mb-4 rounded-2xl p-3.5 ${saSurface}`}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px] flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#27AE60]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by title, location, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${ppControl} w-full pl-9 pr-9`}
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#5c7d6d] hover:text-[#0f3d2e]"
                size={16}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className={`${ppControl} cursor-pointer`}
          >
            <option value="residential">🏠 Residential</option>
            <option value="commercial">🏢 Commercial</option>
            <option value="agricultural">🌾 Agricultural</option>
            <option value="land">🏞️ Land</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${ppControl} cursor-pointer`}
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
            className={`${ppControl} cursor-pointer`}
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
            className={`${ppControl} cursor-pointer`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="completion">Completion %</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className={ppPill}>
          <LayoutGrid size={14} className="text-[#27AE60]" />
          <span className="text-[#5c7d6d]">
            Showing{" "}
            <span className="font-bold text-[#0f3d2e]">
              {filteredItems.length}
            </span>{" "}
            of <span className="font-bold text-[#0f3d2e]">{totalItems}</span>{" "}
            properties
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c2c2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#c0392b] transition hover:bg-[#fff5f5]"
          >
            <X size={14} />
            Clear All Filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className={ppTag}>
              Search: "{searchQuery}"
              <X
                size={12}
                className="cursor-pointer hover:text-[#0f3d2e]"
                onClick={() => setSearchQuery("")}
              />
            </span>
          )}
          {statusFilter !== "all" && (
            <span className={ppTag}>
              Status: {statusFilter}
              <X
                size={12}
                className="cursor-pointer hover:text-[#0f3d2e]"
                onClick={() => setStatusFilter("all")}
              />
            </span>
          )}
          {completionFilter !== "all" && (
            <span className={ppTag}>
              Completion: {completionFilter}%
              <X
                size={12}
                className="cursor-pointer hover:text-[#0f3d2e]"
                onClick={() => setCompletionFilter("all")}
              />
            </span>
          )}
          {sortBy !== "newest" && (
            <span className={ppTag}>
              Sort:{" "}
              {sortBy === "mostViewed"
                ? "Most Viewed"
                : sortBy === "oldest"
                  ? "Oldest First"
                  : sortBy === "completion"
                    ? "Completion %"
                    : "Title A-Z"}
              <X
                size={12}
                className="cursor-pointer hover:text-[#0f3d2e]"
                onClick={() => setSortBy("newest")}
              />
            </span>
          )}
        </div>
      )}

      {currentData.loading ? (
        <div className={`py-16 text-center ${saSurface} rounded-2xl`}>
          <div className="mb-4 inline-block h-11 w-11 animate-spin rounded-full border-4 border-[#d8f0e2] border-t-[#27AE60]"></div>
          <p className="font-medium text-[#5c7d6d]">Loading properties...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={`rounded-2xl py-16 text-center ${saSurface}`}>
          <h3 className="mb-2 text-lg font-bold text-[#0f3d2e]">
            No Properties Found
          </h3>
          <p className="mb-4 text-sm text-[#5c7d6d]">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="rounded-full bg-[#27AE60] px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_14px_-6px_rgba(39,174,96,0.7)] transition hover:bg-[#229954]"
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