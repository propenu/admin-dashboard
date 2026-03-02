import { useQuery } from "@tanstack/react-query";
import { Building2, Filter } from "lucide-react";
import { fetchFeaturedProperties } from "../services/propertyservice";
import PropertyCard from "../components/propertyCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";

export default function FeaturedProperties() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["featuredProperties"],
    queryFn: fetchFeaturedProperties,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl h-96 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage message={error?.message} onRetry={refetch} />;
  }

  const properties = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Featured Properties
          </h1>
          <p className="text-slate-600">
            {properties.length} properties available
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            No properties available at the moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
