// frontend/admin-dashboard/src/pages/FeaturedActiveProperties.jsx
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProperties } from "../services/propertyservice";
import PropertyCard from "./FeaturedProperies/FeaturedPropertyCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturedActiveProperties() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["featuredProperties"],
    queryFn: fetchFeaturedProperties,
  });

  const properties = data?.items || [];
  const activeProperties = properties.filter((p) => p.status === "active");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-slate-900">
        Active Featured Properties
      </h1>
      <p className="text-slate-600">Showing only active properties.</p>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-12 text-red-500">
          Failed to load properties.
        </div>
      )}

      {/* No Data */}
      {!isLoading && activeProperties.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          No active properties found.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {activeProperties.map((p) => (
          <PropertyCard key={p._id} property={p} />
        ))}
      </div>
    </div>
  );
}
